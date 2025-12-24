from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

# CẤU HÌNH BẢO MẬT (Trong thực tế nên để trong file .env)
SECRET_KEY = "jcontext_super_secret_key_2024" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000 # Để 3000 phút cho test thoải mái

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Hàm mã hóa mật khẩu
def get_password_hash(password):
    return pwd_context.hash(password)

# 2. Hàm kiểm tra mật khẩu nhập vào có đúng với mật khẩu đã mã hóa không
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3. Hàm tạo Token đăng nhập
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt