"use client";
import { useEffect, useState, use } from "react";
import axios from "axios";

interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  kanji_html?: string; // <--- Thêm trường này
  meanings_data: any[];
}

export default function PracticePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params); 

  const [vocab, setVocab] = useState<Vocabulary | null>(null);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:8000/vocabularies/${id}`)
      .then((res) => setVocab(res.data))
      .catch((err) => console.error("Lỗi:", err));
  }, [id]);

  const handleCopyPrompt = () => {
    if (!vocab) return;

    const selectedMeaning = vocab.meanings_data[selectedMeaningIndex];

    const promptText = `
Hãy đóng vai giáo viên tiếng Nhật. Tôi đang muốn luyện tập sử dụng từ vựng này trong ngữ cảnh cụ thể sau:

- Từ vựng: ${vocab.term} (${vocab.kana})
- Ngữ cảnh/Nghĩa muốn học: ${selectedMeaning.definition} (${selectedMeaning.type})
${selectedMeaning.example_jp ? `- Ví dụ tham khảo: ${selectedMeaning.example_jp}` : ""}

Nhiệm vụ của bạn:
1. Giải thích sắc thái của từ "${vocab.term}" khi dùng với nghĩa "${selectedMeaning.definition}".
2. Viết một câu chuyện ngắn thú vị (khoảng 50-70 từ) bằng tiếng Việt có chèn từ "${vocab.term}" vào đúng ngữ cảnh trên.
3. Tạo 2 câu ví dụ song ngữ Nhật - Việt dùng đúng nghĩa này.
`.trim();

    navigator.clipboard.writeText(promptText)
      .then(() => alert(`✅ Đã copy Prompt cho nghĩa: "${selectedMeaning.definition}"`))
      .catch(() => alert("❌ Lỗi copy."));
  };

  if (!vocab) return <div className="p-10 text-white animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      
      {/* 1. KHUNG TỪ VỰNG CHÍNH (ĐÃ UPDATE FURIGANA) */}
      <div className="text-center mb-8">
        {vocab.kanji_html ? (
            // Hiển thị HTML Furigana nếu có
            <h1 
              className="text-6xl font-black text-green-400 mb-2 ruby-large"
              dangerouslySetInnerHTML={{ __html: vocab.kanji_html }}
            />
        ) : (
            // Hiển thị bình thường nếu không có HTML
            <h1 className="text-6xl font-black text-green-400 mb-2">{vocab.term}</h1>
        )}
        
        {/* Chỉ hiện Kana phụ nếu không có Furigana (tránh lặp lại) */}
        {!vocab.kanji_html && (
            <p className="text-2xl text-gray-400 font-mono">{vocab.kana}</p>
        )}
      </div>

      {/* 2. KHUNG CHỌN NGỮ CẢNH */}
      <div className="w-full max-w-2xl mb-8">
        <h3 className="text-gray-400 text-sm uppercase font-bold mb-3 tracking-wider text-center">
          Bước 1: Chọn ngữ cảnh bạn muốn học
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {vocab.meanings_data.map((m: any, idx: number) => (
            <div 
              key={idx}
              onClick={() => setSelectedMeaningIndex(idx)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                selectedMeaningIndex === idx 
                  ? "bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  : "bg-gray-800 border-gray-700 hover:border-gray-500"
              }`}
            >
              <div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded mr-2 ${
                  m.type === 'Verb' ? 'bg-red-900 text-red-200' : 'bg-gray-600 text-gray-200'
                }`}>
                  {m.type}
                </span>
                <span className="text-lg font-semibold text-gray-100">{m.definition}</span>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedMeaningIndex === idx ? "border-blue-400 bg-blue-500" : "border-gray-500"
              }`}>
                {selectedMeaningIndex === idx && <span className="text-white text-xs">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GENERATE PROMPT */}
      <div className="w-full max-w-2xl">
         <h3 className="text-gray-400 text-sm uppercase font-bold mb-3 tracking-wider text-center">
          Bước 2: Tạo học liệu với AI
        </h3>
        <button 
          onClick={handleCopyPrompt}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 group"
        >
          <span className="text-xl group-hover:rotate-12 transition">🤖</span>
          <span>Generate Context Prompt (Copy)</span>
        </button>

        <p className="text-center text-gray-500 text-xs mt-3">
          *Hệ thống sẽ tạo prompt dựa trên nghĩa 
          <span className="text-blue-400 font-bold"> "{vocab.meanings_data[selectedMeaningIndex]?.definition}" </span>
          mà bạn đã chọn ở trên.
        </p>

        <div className="text-center mt-6">
           <a 
            href="https://chatgpt.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-gray-400 hover:text-white text-sm border-b border-gray-600 hover:border-white pb-0.5 transition"
          >
            Mở nhanh ChatGPT ↗
          </a>
        </div>
      </div>

    </div>
  );
}