import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, Enum, JSON, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# --- 1. USER (Giữ nguyên) ---
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    sessions = relationship("Session", back_populates="user")

# --- 2. VOCABULARY (NÂNG CẤP FULL OPTION) ---
class Vocabulary(Base):
    __tablename__ = "vocabularies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # --- CÁC CỘT CƠ BẢN ---
    term = Column(String, index=True, nullable=False)  # Cột 1: Từ vựng
    pitch_accent = Column(Integer, default=0)          # Cột 2: Trọng âm
    meaning_vi = Column(Text)                          # Cột 3: Nghĩa tiếng Việt (Lưu chuỗi gốc)
    anki_id = Column(String, index=True)               # Cột 4: ID gốc bên Anki (Để sau này update không bị trùng)
    
    # --- HIỂN THỊ ---
    kanji_html = Column(Text)                          # Cột 5: HTML Furigana (<ruby>...)
    kana = Column(String, nullable=False)              # Cột 6: Cách đọc Kana
    sino_vietnamese = Column(String)                   # Cột 7: Hán Việt
    
    # --- MEDIA & EXAMPLE ---
    audio_word = Column(String)                        # Cột 8: [sound:word.mp3]
    example_html = Column(Text)                        # Cột 9: Câu ví dụ HTML gốc
    audio_sentence = Column(String)                    # Cột 10: [sound:sentence.mp3]
    
    # --- PHÂN LOẠI ---
    type = Column(String)                              # Cột 12: Loại từ (N, V, Adj...)
    tags = Column(ARRAY(String))                       # Cột 14: Tags
    
    # --- DATA CẤU TRÚC (Cho hệ thống học sau này) ---
    meanings_data = Column(JSON, default=list)         # Vẫn giữ để map cấu trúc nếu cần
    status = Column(String, default="verified")

# ... (Giữ nguyên Grammar, Session, SessionItem bên dưới) ...
# --- 3. GRAMMAR ---
class Grammar(Base):
    __tablename__ = "grammars"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structure = Column(String, index=True, nullable=False)
    description = Column(Text)
    examples = Column(JSON, default=list)
    level = Column(String)
    status = Column(String, default="verified")

# --- 4. SESSION ---
class Session(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")
    user = relationship("User", back_populates="sessions")
    items = relationship("SessionItem", back_populates="session", cascade="all, delete-orphan")

# --- 5. SESSION ITEM ---
class SessionItem(Base):
    __tablename__ = "session_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    vocab_id = Column(UUID(as_uuid=True), ForeignKey("vocabularies.id"), nullable=True)
    grammar_id = Column(UUID(as_uuid=True), ForeignKey("grammars.id"), nullable=True)
    selected_meaning_index = Column(Integer, default=0) 
    srs_stage = Column(Integer, default=0)
    next_review_at = Column(DateTime, default=datetime.utcnow)
    last_rating = Column(String)
    session = relationship("Session", back_populates="items")
    vocab = relationship("Vocabulary")
    grammar = relationship("Grammar")