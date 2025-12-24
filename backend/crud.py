from sqlalchemy.orm import Session
import models, schemas

def create_vocabulary(db: Session, vocab: schemas.VocabularyCreate):
    db_vocab = models.Vocabulary(
        term=vocab.term,
        kana=vocab.kana,
        kanji_html=vocab.kanji_html,
        meanings_data=vocab.meanings_data,
        
        # Mapping các trường mới
        pitch_accent=vocab.pitch_accent,
        meaning_vi=vocab.meaning_vi,
        anki_id=vocab.anki_id,
        sino_vietnamese=vocab.sino_vietnamese,
        audio_word=vocab.audio_word,
        example_html=vocab.example_html,
        audio_sentence=vocab.audio_sentence,
        type=vocab.type,
        tags=vocab.tags,
        
        status=vocab.status
    )
    db.add(db_vocab)
    db.commit()
    db.refresh(db_vocab)
    return db_vocab
# Hàm lấy danh sách từ vựng (MỚI)
def get_vocabularies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Vocabulary).offset(skip).limit(limit).all()
# Hàm lấy chi tiết 1 từ theo ID (MỚI)
def get_vocabulary(db: Session, vocab_id: str):
    return db.query(models.Vocabulary).filter(models.Vocabulary.id == vocab_id).first()