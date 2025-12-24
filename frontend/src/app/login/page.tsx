"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/login/", {
        email,
        password,
      });

      // LƯU TOKEN VÀO LOCAL STORAGE
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_name", res.data.full_name);

      alert("✅ Đăng nhập thành công!");
      router.push("/"); // Chuyển về trang chủ
      // Trick nhỏ: Reload trang để Header cập nhật trạng thái
      setTimeout(() => window.location.reload(), 100); 
      
    } catch (error) {
      alert("❌ Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">Đăng Nhập J-Context</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition">
            Đăng Nhập
          </button>
        </form>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Chưa có tài khoản? <Link href="/register" className="text-green-400 hover:underline">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}