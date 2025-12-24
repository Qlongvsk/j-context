from pydantic import BaseModel
from typing import List, Optional, Any

class VocabularyCreate(BaseModel):
    term: str
    kana: str
    kanji_html: Optional[str] = None
    sino_vietnamese: Optional[str] = None
    pitch_accent: int = 0
    audio_url: Optional[str] = None
    tags: List[str] = []
    meanings_data: List[Any] = []

class VocabularyResponse(VocabularyCreate):
    id: Any
    status: str

    class Config:
        from_attributes = True