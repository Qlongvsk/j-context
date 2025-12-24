import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, Enum, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class Vocabulary(Base):
    __tablename__ = "vocabularies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    term = Column(String, index=True, nullable=False)
    kana = Column(String, nullable=False)
    kanji_html = Column(Text)
    sino_vietnamese = Column(String)
    pitch_accent = Column(Integer, default=0)
    audio_url = Column(String)
    tags = Column(ARRAY(String))
    meanings_data = Column(JSON, default=list)
    status = Column(String, default="verified")

# (Tạm thời mình chỉ cần bảng Vocabulary để test trước đã)