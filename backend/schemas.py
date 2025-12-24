from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

# --- USER SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

# --- VOCABULARY SCHEMAS (FULL OPTION - ANKI COMPATIBLE) ---
class VocabularyCreate(BaseModel):
    term: str
    kana: str
    kanji_html: Optional[str] = None
    meanings_data: List[Any] = []
    
    # Các trường mở rộng cho Anki Import
    pitch_accent: int = 0
    meaning_vi: Optional[str] = None
    anki_id: Optional[str] = None
    sino_vietnamese: Optional[str] = None
    audio_word: Optional[str] = None
    example_html: Optional[str] = None
    audio_sentence: Optional[str] = None
    type: Optional[str] = None
    tags: List[str] = []
    
    status: Optional[str] = "verified"

class VocabularyResponse(VocabularyCreate):
    id: UUID
    
    class Config:
        from_attributes = True

# --- GRAMMAR SCHEMAS ---
class GrammarCreate(BaseModel):
    structure: str
    description: str
    examples: List[Any] = []
    level: Optional[str] = None
    status: Optional[str] = "verified"

class GrammarResponse(GrammarCreate):
    id: UUID
    class Config:
        from_attributes = True

# --- SESSION SCHEMAS (QUẢN LÝ PHIÊN HỌC) ---
# Item con: Chi tiết 1 từ/ngữ pháp trong session
class SessionItemCreate(BaseModel):
    vocab_id: Optional[UUID] = None
    grammar_id: Optional[UUID] = None
    selected_meaning_index: int = 0

# Session cha: Thông tin chung + danh sách items
class SessionCreate(BaseModel):
    title: str
    items: List[SessionItemCreate]

class SessionResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    # items: List[Any] # Có thể mở comment nếu muốn trả về full items
    
    class Config:
        from_attributes = True

# --- UTILITY SCHEMAS ---
# Dùng cho API check từ vựng (Phase 1)
class CheckVocabRequest(BaseModel):
    terms: List[str]