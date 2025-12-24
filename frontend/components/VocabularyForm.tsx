"use client";
import { useState } from "react";
import axios from "axios";

interface Meaning {
  definition: string;
  type: string;
  example_jp: string;
  example_vi: string;
}

interface Props {
  onSuccess: () => void;
}

export default function VocabularyForm({ onSuccess }: Props) {
  const [term, setTerm] = useState("");
  const [kana, setKana] = useState("");
  // Thay vì 1 chuỗi, giờ ta dùng mảng các nghĩa (Polysemy)
  const [meanings, setMeanings] = useState<Meaning[]>([
    { definition: "", type: "Verb", example_jp: "", example_vi: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm thêm ô nhập nghĩa mới
  const addMeaningSlot = () => {
    setMeanings([...meanings, { definition: "", type: "Verb", example_jp: "", example_vi: "" }]);
  };

  // Hàm xóa ô nhập nghĩa
  const removeMeaningSlot = (index: number) => {
    const newMeanings = [...meanings];
    newMeanings.splice(index, 1);
    setMeanings(newMeanings);
  };

  // Hàm cập nhật dữ liệu khi gõ
  const updateMeaning = (index: number, field: keyof Meaning, value: string) => {
    const newMeanings = [...meanings];
    newMeanings[index][field] = value;
    setMeanings(newMeanings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term || !kana) return;

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:8000/vocabularies/", {
        term: term,
        kana: kana,
        meanings_data: meanings, // Gửi danh sách đa nghĩa lên
        status: "verified", // Admin thêm thì auto duyệt
      });
      
      // Reset form
      setTerm("");
      setKana("");
      setMeanings([{ definition: "", type: "Verb", example_jp: "", example_vi: "" }]);
      onSuccess();
      alert("✅ Đã thêm từ vựng đa nghĩa vào Master Data!");
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối Backend!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        🛡️ Admin: Master Data Entry
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hàng 1: Từ vựng & Kana */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-400 text-sm mb-1">Term (Kanji)</label>
            <input
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
              placeholder="VD: かける"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-400 text-sm mb-1">Kana (Hiragana)</label>
            <input
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
              placeholder="VD: かける"
              value={kana}
              onChange={(e) => setKana(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Khu vực Đa nghĩa (Polysemy Definition) */}
        <div className="space-y-3">
          <label className="block text-gray-300 font-semibold">Define Polysemy (Các lớp nghĩa):</label>
          {meanings.map((m, index) => (
            <div key={index} className="p-4 bg-gray-900/50 rounded border border-gray-600 relative">
              <div className="flex gap-2 mb-2">
                <select 
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                  value={m.type}
                  onChange={(e) => updateMeaning(index, "type", e.target.value)}
                >
                  <option value="Verb">Verb</option>
                  <option value="Noun">Noun</option>
                  <option value="Adj">Adj</option>
                </select>
                <input
                  className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                  placeholder={`Nghĩa số ${index + 1} (VD: Treo)`}
                  value={m.definition}
                  onChange={(e) => updateMeaning(index, "definition", e.target.value)}
                  required
                />
              </div>
              
              {/* Nút xóa nghĩa (nếu có nhiều hơn 1) */}
              {meanings.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeaningSlot(index)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs"
                >
                  ❌ Xóa nghĩa này
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addMeaningSlot}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            ➕ Thêm lớp nghĩa khác (Polysemy)
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition disabled:opacity-50 mt-4"
        >
          {isSubmitting ? "Đang xử lý..." : "Approve & Save to Master Data"}
        </button>
      </form>
    </div>
  );
}