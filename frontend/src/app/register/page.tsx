"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/register/", {
        email,
        password,
        full_name: fullName,
      });
      alert("✅ Đăng ký thành công! Hãy đăng nhập.");
      router.push("/login");
    } catch (error) {
      alert("❌ Lỗi: Email có thể đã tồn tại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400 mb-6 text-center">Đăng Ký Tài Khoản</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 outline-none"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 outline-none"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition">
            Đăng Ký
          </button>
        </form>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Đã có tài khoản? <Link href="/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}