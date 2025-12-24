from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import models, schemas, crud, auth
from database import engine, get_db
from typing import List
from pydantic import BaseModel 
from typing import Optional
from uuid import UUID
from sqlalchemy import or_
# Tự động tạo bảng
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="J-Context API", version="2.5")

# CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CLASS DEFINITIONS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class CheckVocabRequest(BaseModel):
    terms: List[str]

# Dữ liệu tạo Session
class SessionItemCreate(BaseModel):
    vocab_id: Optional[UUID] = None
    grammar_id: Optional[UUID] = None
    selected_meaning_index: int = 0

class SessionCreate(BaseModel):
    title: str
    items: List[SessionItemCreate]
# -------------------------

@app.get("/")
def read_root():
    return {"message": "J-Context Backend is running!", "status": "ok"}

# --- API CHECK VOCABS (LOGIC MATCHING NÂNG CẤP) ---
@app.post("/sessions/check-vocabs/")
def check_vocabularies(request: CheckVocabRequest, db: Session = Depends(get_db)):
    found_vocabs = []
    missing_terms = []

    for term in request.terms:
        clean_term = term.strip()
        
        # LOGIC TÌM KIẾM THÔNG MINH HƠN:
        # 1. Tìm chính xác term (Không phân biệt hoa thường)
        # 2. HOẶC tìm trong Kana (Ví dụ nhập 'てすと' sẽ tìm ra 'テスト')
        vocab = db.query(models.Vocabulary).filter(
            or_(
                models.Vocabulary.term.ilike(clean_term),
                models.Vocabulary.kana == clean_term
            ),
            models.Vocabulary.status == "verified"
        ).first()
        
        if vocab:
            found_vocabs.append(vocab)
        else:
            missing_terms.append(clean_term)

    return {
        "found": found_vocabs,
        "missing": missing_terms
    }

# --- API TẠO SESSION ---
@app.post("/sessions/")
def create_session(session_data: SessionCreate, db: Session = Depends(get_db)):
    # 1. Tạo Session (Tạm thời gán user cứng, sau này lấy từ Token)
    # Lưu ý: Cần đảm bảo có ít nhất 1 user trong DB để gán ID này, hoặc để null nếu model cho phép
    first_user = db.query(models.User).first()
    user_id = first_user.id if first_user else None

    new_session = models.Session(
        title=session_data.title,
        user_id=user_id 
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # 2. Tạo Session Items
    for item in session_data.items:
        new_item = models.SessionItem(
            session_id=new_session.id,
            vocab_id=item.vocab_id,
            grammar_id=item.grammar_id,
            selected_meaning_index=item.selected_meaning_index
        )
        db.add(new_item)
    
    db.commit()
    return {"message": "Session created successfully", "session_id": new_session.id}

# ... (Các API cũ: vocabularies, login, register giữ nguyên ở dưới) ...
@app.post("/vocabularies/", response_model=schemas.VocabularyResponse)
def create_vocabulary(vocab: schemas.VocabularyCreate, db: Session = Depends(get_db)):
    return crud.create_vocabulary(db=db, vocab=vocab)

@app.get("/vocabularies/", response_model=List[schemas.VocabularyResponse])
def read_vocabularies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vocabularies = crud.get_vocabularies(db, skip=skip, limit=limit)
    return vocabularies

@app.get("/vocabularies/{vocab_id}", response_model=schemas.VocabularyResponse)
def read_vocabulary(vocab_id: str, db: Session = Depends(get_db)):
    db_vocab = crud.get_vocabulary(db, vocab_id=vocab_id)
    if db_vocab is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    return db_vocab

@app.delete("/vocabularies/{vocab_id}")
def delete_vocabulary(vocab_id: str, db: Session = Depends(get_db)):
    db_vocab = crud.get_vocabulary(db, vocab_id=vocab_id)
    if db_vocab is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    db.delete(db_vocab)
    db.commit()
    return {"message": "Vocabulary deleted successfully"}

@app.post("/register/")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pass = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pass, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "email": new_user.email}

@app.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Email not found")
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    access_token = auth.create_access_token(data={"sub": db_user.email, "user_id": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "full_name": db_user.full_name}


@app.post("/sessions/check-vocabs/")
def check_vocabularies(request: CheckVocabRequest, db: Session = Depends(get_db)):
    found_vocabs = []
    missing_terms = []

    for term in request.terms:
        clean_term = term.strip()
        
        # LOGIC MỚI: Tìm trong Term HOẶC tìm trong Kana
        vocab = db.query(models.Vocabulary).filter(
            or_(
                models.Vocabulary.term == clean_term, # Tìm theo Kanji/Katakana (VD: テスト)
                models.Vocabulary.kana == clean_term  # Tìm theo Hiragana (VD: てすと)
            ),
            models.Vocabulary.status == "verified"
        ).first()
        
        if vocab:
            found_vocabs.append(vocab)
        else:
            missing_terms.append(clean_term)

    return {
        "found": found_vocabs,
        "missing": missing_terms
    }
@app.get("/grammars/search/")
def search_grammars(q: str, db: Session = Depends(get_db)):
    # Tìm kiếm mờ (Fuzzy Search) theo cấu trúc
    results = db.query(models.Grammar).filter(
        models.Grammar.structure.ilike(f"%{q}%"), # Tìm chứa chuỗi nhập vào
        models.Grammar.status == "verified"
    ).limit(10).all()
    return results