"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import VocabularyForm from "../../components/VocabularyForm"; 
import BulkImportForm from "../../components/BulkImportForm"; // <--- Import mới

// Cập nhật Interface để có kanji_html
interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  kanji_html?: string; // <--- Thêm trường này
  meanings_data: any[];
  status: string;
}

export default function AdminPage() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [filter, setFilter] = useState("verified");
  const [mode, setMode] = useState<"manual" | "bulk">("manual"); // Chế độ nhập

  const fetchVocabularies = () => {
    axios
      .get("http://localhost:8000/vocabularies/")
      .then((res) => setVocabList(res.data))
      .catch((err) => console.error(err));
  };

  const handleDelete = async (id: string, term: string) => {
    if (!confirm(`Bạn có chắc muốn xóa từ "${term}" không?`)) return;
    try {
      await axios.delete(`http://localhost:8000/vocabularies/${id}`);
      fetchVocabularies();
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const displayedVocabs = vocabList.filter(v => v.status === (filter === "queue" ? "pending" : "verified"));

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-red-500 border-b border-gray-700 pb-4">
        🛡️ Admin Data Management
      </h1>
      
      {/* THANH CHUYỂN CHẾ ĐỘ NHẬP */}
      <div className="flex gap-4 mb-6">
        <button 
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded font-bold transition ${mode === 'manual' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
            ✍️ Nhập Thủ Công
        </button>
        <button 
            onClick={() => setMode("bulk")}
            className={`px-4 py-2 rounded font-bold transition ${mode === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
            📥 Nhập Hàng Loạt (Anki)
        </button>
      </div>

      {/* COMPONENT NHẬP LIỆU */}
      {mode === 'manual' ? (
          <VocabularyForm onSuccess={fetchVocabularies} />
      ) : (
          <BulkImportForm onSuccess={fetchVocabularies} />
      )}

      {/* DANH SÁCH DỮ LIỆU */}
      <div className="mt-12">
        <div className="flex gap-4 mb-4 border-b border-gray-700">
          <button 
            className={`pb-2 px-4 font-semibold transition ${filter === 'verified' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setFilter("verified")}
          >
            ✅ Master Data
          </button>
          <button 
            className={`pb-2 px-4 font-semibold transition flex items-center gap-2 ${filter === 'queue' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setFilter("queue")}
          >
            <span>⏳ Queue</span>
            {vocabList.filter(v => v.status === "pending").length > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {vocabList.filter(v => v.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-3">
            {displayedVocabs.map((vocab) => (
              <div key={vocab.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-800 rounded border border-gray-700 hover:border-gray-500 transition">
                <div className="mb-2 md:mb-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    {/* HIỂN THỊ FURIGANA NẾU CÓ */}
                    {vocab.kanji_html ? (
                        <div 
                            className="font-bold text-green-400 text-xl ruby-text" 
                            dangerouslySetInnerHTML={{ __html: vocab.kanji_html }} 
                        />
                    ) : (
                        <span className="font-bold text-green-400 text-xl">{vocab.term}</span>
                    )}
                    
                    {/* Ẩn Kana nếu đã có HTML Furigana để đỡ trùng lặp */}
                    {!vocab.kanji_html && <span className="text-gray-400 font-mono">{vocab.kana}</span>}
                  </div>
                  
                  <div className="text-sm text-gray-300 mt-1">
                    {vocab.meanings_data.map((m: any, idx: number) => (
                      <span key={idx} className="mr-3 bg-gray-700 px-2 py-0.5 rounded text-xs">
                        {m.definition}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                    onClick={() => handleDelete(vocab.id, vocab.term)}
                    className="ml-4 bg-red-900 hover:bg-red-700 text-red-200 p-2 rounded transition"
                >
                    🗑️
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}