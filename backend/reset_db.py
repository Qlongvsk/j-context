from database import engine
import models 

print("⏳ Đang kết nối Database...")

# 1. Xóa toàn bộ các bảng hiện có (Vocabularies, Users, Sessions...)
# Lưu ý: Việc này sẽ mất hết dữ liệu cũ!
models.Base.metadata.drop_all(bind=engine)
print("✅ Đã xóa sạch bảng cũ.")

# 2. Tạo lại bảng mới theo cấu trúc trong models.py
models.Base.metadata.create_all(bind=engine)
print("✅ Đã tạo lại bảng mới (Full cột Anki, Grammar, Session).")