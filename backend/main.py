from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="J-Context API", version="2.4")

# Cấu hình CORS (Để Frontend gọi được API)
origins = [
    "http://localhost:3000", # Next.js chạy port này
]

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

@app.get("/health")
def health_check():
    # Sau này sẽ check kết nối DB ở đây
    return {"database": "connected (simulation)", "minio": "ready (simulation)"}