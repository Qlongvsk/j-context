"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [status, setStatus] = useState<string>("Đang kết nối tới Backend...");

  useEffect(() => {
    // Gọi API của Backend đang chạy ở port 8000
    axios
      .get("http://localhost:8000/")
      .then((res) => {
        setStatus(`Kết nối thành công: ${res.data.message}`);
      })
      .catch((err) => {
        setStatus("Lỗi: Không thể kết nối (Kiểm tra xem Backend chạy chưa?)");
        console.error(err);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-4">J-Context Platform</h1>
      <p className="text-xl text-yellow-400">Version 2.4 - System Check</p>
      
      <div className="mt-8 p-6 border border-gray-600 rounded-lg bg-gray-800">
        <h2 className="text-2xl font-semibold mb-2">Backend Status:</h2>
        <p className="font-mono text-green-400">{status}</p>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        Stack: Next.js 15 + FastAPI + PostgreSQL (Docker)
      </div>
    </main>
  );
}