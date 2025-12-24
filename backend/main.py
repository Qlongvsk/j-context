from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, get_db
from typing import List
# Tự động tạo bảng
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="J-Context API", version="2.4")

# CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "J-Context Backend is running!", "status": "ok"}

@app.post("/vocabularies/", response_model=schemas.VocabularyResponse)
def create_vocabulary(vocab: schemas.VocabularyCreate, db: Session = Depends(get_db)):
    return crud.create_vocabulary(db=db, vocab=vocab)
@app.get("/vocabularies/", response_model=List[schemas.VocabularyResponse])
def read_vocabularies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vocabularies = crud.get_vocabularies(db, skip=skip, limit=limit)
    return vocabularies