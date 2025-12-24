"use client";
import { useEffect, useState } from "react";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho Từ vựng (để TypeScript không báo lỗi)
interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  meanings_data: any[];
  status: string;
}

export default function Home() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh sách từ vựng
    axios
      .get("http://localhost:8000/vocabularies/")
      .then((res) => {
        setVocabList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Kho Từ Vựng (J-Context)
      </h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vòng lặp hiển thị từng từ */}
          {vocabList.map((vocab) => (
            <div
              key={vocab.id}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800 hover:border-yellow-500 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-green-400">
                    {vocab.term}
                  </h2>
                  <p className="text-gray-400">{vocab.kana}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-900 rounded text-blue-200">
                  {vocab.status}
                </span>
              </div>
              
              <div className="mt-3 text-sm text-gray-300">
                <p className="font-semibold">Nghĩa:</p>
                <ul className="list-disc list-inside">
                  {vocab.meanings_data.map((m: any, idx: number) => (
                    <li key={idx}>
                      {m.definition} <span className="text-gray-500">({m.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {vocabList.length === 0 && !loading && (
        <p className="text-gray-500 italic">Chưa có từ vựng nào trong Database.</p>
      )}
    </main>
  );
}