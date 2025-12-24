"use client";
import { useEffect, useState } from "react";
import axios from "axios";
// Dùng đường dẫn tương đối ../.. cho chắc ăn
import VocabularyForm from "../../components/VocabularyForm"; 

interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  meanings_data: any[];
  status: string; // 'verified' hoặc 'pending'
}

export default function AdminPage() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [filter, setFilter] = useState("verified"); // Tab hiện tại: verified hoặc pending

  const fetchVocabularies = () => {
    axios
      .get("http://localhost:8000/vocabularies/")
      .then((res) => setVocabList(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchVocabularies();
  }, []);

  // Lọc danh sách theo tab
  const displayedVocabs = vocabList.filter(v => v.status === (filter === "queue" ? "pending" : "verified"));

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-red-500 border-b border-gray-700 pb-4">
        🛡️ Admin Data Management
      </h1>
      
      {/* KHU VỰC NHẬP LIỆU (PROCESS ITEM) */}
      <VocabularyForm onSuccess={fetchVocabularies} />

      {/* KHU VỰC DANH SÁCH (VIEW DATA) */}
      <div className="mt-12">
        <div className="flex gap-4 mb-4 border-b border-gray-700">
          <button 
            className={`pb-2 px-4 font-semibold ${filter === 'verified' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
            onClick={() => setFilter("verified")}
          >
            ✅ Master Data (Đã duyệt)
          </button>
          <button 
            className={`pb-2 px-4 font-semibold ${filter === 'queue' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setFilter("queue")}
          >
            ⏳ Queue / Pending ({vocabList.filter(v => v.status === "pending").length})
          </button>
        </div>

        <div className="space-y-3">
          {displayedVocabs.length === 0 ? (
            <p className="text-gray-500 italic py-4">Không có dữ liệu trong mục này.</p>
          ) : (
            displayedVocabs.map((vocab) => (
              <div key={vocab.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-800 rounded border border-gray-700 hover:border-gray-500">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold text-green-400 text-xl">{vocab.term}</span>
                    <span className="text-gray-400 font-mono">{vocab.kana}</span>
                  </div>
                  {/* Hiển thị đa nghĩa */}
                  <div className="text-sm text-gray-300 mt-1">
                    {vocab.meanings_data.map((m: any, idx: number) => (
                      <span key={idx} className="mr-3 bg-gray-700 px-2 py-0.5 rounded text-xs">
                        {idx + 1}. {m.definition} ({m.type})
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${vocab.status === 'verified' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                    {vocab.status}
                  </span>
                  {/* Sau này sẽ thêm nút Edit/Delete ở đây */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}