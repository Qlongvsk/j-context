"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu
interface Meaning {
  definition: string;
  type: string;
}
interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  meanings_data: Meaning[];
}
interface Grammar {
  id: string;
  structure: string;
  level: string;
  description: string;
}

export default function LearnSetupPage() {
  // STATE: INPUT TỪ VỰNG
  const [rawInput, setRawInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  
  // STATE: KẾT QUẢ MATCHING
  // Lưu danh sách từ đã tìm thấy kèm theo index nghĩa mà user chọn
  const [foundItems, setFoundItems] = useState<{ vocab: Vocabulary; selectedMeaningIdx: number }[]>([]);
  const [missingTerms, setMissingTerms] = useState<string[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");

  // STATE: NGỮ PHÁP
  const [grammarQuery, setGrammarQuery] = useState("");
  const [grammarSuggestions, setGrammarSuggestions] = useState<Grammar[]>([]);
  const [selectedGrammars, setSelectedGrammars] = useState<Grammar[]>([]);

  const router = useRouter();

  // --- 1. LOGIC CHECK TỪ VỰNG ---
  const handleCheckVocabs = async () => {
    if (!rawInput.trim()) return;
    setIsChecking(true);
    const terms = rawInput.split(/[\n,]+/).map(t => t.trim()).filter(t => t);

    try {
      const res = await axios.post("http://localhost:8000/sessions/check-vocabs/", { terms });
      
      // Map kết quả trả về, mặc định chọn nghĩa đầu tiên (index 0)
      const mappedFound = res.data.found.map((v: Vocabulary) => ({
        vocab: v,
        selectedMeaningIdx: 0 
      }));
      
      setFoundItems(mappedFound);
      setMissingTerms(res.data.missing);
    } catch (error) {
      alert("❌ Lỗi kết nối Server!");
    } finally {
      setIsChecking(false);
    }
  };

  // --- 2. LOGIC REQUEST TỪ THIẾU ---
  const handleRequestTerm = async (term: string) => {
    try {
      await axios.post("http://localhost:8000/vocabularies/", {
        term: term,
        kana: "Đang cập nhật...",
        meanings_data: [{ definition: "User Request", type: "Pending" }],
        status: "pending"
      });
      alert(`✅ Đã gửi yêu cầu từ "${term}"!`);
      // Xóa từ này khỏi danh sách missing (giả lập đã xử lý)
      setMissingTerms(prev => prev.filter(t => t !== term));
    } catch (e) {
      alert("Lỗi khi gửi yêu cầu.");
    }
  };

  // --- 3. LOGIC TÌM KIẾM NGỮ PHÁP (DEBOUNCE) ---
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!grammarQuery.trim()) {
        setGrammarSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8000/grammars/search/?q=${grammarQuery}`);
        setGrammarSuggestions(res.data);
      } catch (e) {
        console.error(e);
      }
    }, 500); // Đợi 0.5s sau khi ngừng gõ mới tìm

    return () => clearTimeout(timeoutId);
  }, [grammarQuery]);

  const addGrammar = (g: Grammar) => {
    if (!selectedGrammars.find(item => item.id === g.id)) {
      setSelectedGrammars([...selectedGrammars, g]);
    }
    setGrammarQuery(""); // Reset ô tìm kiếm
    setGrammarSuggestions([]);
  };

  const removeGrammar = (id: string) => {
    setSelectedGrammars(selectedGrammars.filter(g => g.id !== id));
  };

  // --- 4. TẠO SESSION (FINAL STEP) ---
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) { alert("Vui lòng nhập tên phiên học!"); return; }
    if (foundItems.length === 0 && selectedGrammars.length === 0) {
        alert("Phiên học cần ít nhất 1 từ vựng hoặc ngữ pháp!"); return;
    }

    try {
      // Chuẩn bị dữ liệu từ vựng kèm nghĩa đã chọn
      const itemsPayload = foundItems.map(item => ({
        vocab_id: item.vocab.id,
        selected_meaning_index: item.selectedMeaningIdx
      }));

      // Chuẩn bị dữ liệu ngữ pháp
      const grammarsPayload = selectedGrammars.map(g => ({
        grammar_id: g.id,
        selected_meaning_index: 0
      }));

      const res = await axios.post("http://localhost:8000/sessions/", {
        title: sessionTitle,
        items: [...itemsPayload, ...grammarsPayload]
      });

      alert("🎉 Tạo phiên học thành công!");
      // Chuyển sang Phase 2 (Practice)
      // router.push(`/practice/session/${res.data.session_id}`); 
      console.log("Session ID:", res.data.session_id);
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi tạo phiên học.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C3E50] p-6 md:p-10 font-sans pb-32">
      <h1 className="text-3xl font-extrabold text-[#4A5D23] mb-8 text-center border-b border-[#89986D]/20 pb-4">
        🌱 Khởi tạo Phiên học (Phase 1)
      </h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === CỘT TRÁI: INPUT & TỪ VỰNG === */}
        <div className="space-y-6">
          
          {/* 1. INPUT TỪ VỰNG */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span>📖</span> Danh sách Từ vựng (Vocabulary)
            </h2>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:border-[#4A5D23] outline-none font-mono text-sm"
              placeholder="Paste danh sách từ vào đây (VD: 食べる, 行く...)"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            ></textarea>
            <button
              onClick={handleCheckVocabs}
              disabled={isChecking}
              className="mt-3 w-full bg-[#4A5D23] hover:bg-[#364419] text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {isChecking ? "Đang phân tích..." : "🔍 Kiểm tra & Phân loại"}
            </button>
          </div>

          {/* 2. KẾT QUẢ TỪ VỰNG */}
          {(foundItems.length > 0 || missingTerms.length > 0) && (
            <div className="space-y-4 animate-fade-in">
              {/* LIST TỪ TÌM THẤY (CÓ CHỌN NGHĨA) */}
              <div className="bg-[#E8F5E9] p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-[#4A5D23] mb-2">✅ Đã tìm thấy ({foundItems.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {foundItems.map((item, idx) => (
                    <div key={item.vocab.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-lg text-[#2C3E50]">{item.vocab.term}</span>
                        <span className="text-xs text-gray-500 font-mono">{item.vocab.kana}</span>
                      </div>
                      
                      {/* POLYSEMY SELECTOR (QUAN TRỌNG) */}
                      <select 
                        className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded text-[#4A5D23] focus:border-[#4A5D23] outline-none"
                        value={item.selectedMeaningIdx}
                        onChange={(e) => {
                          const newItems = [...foundItems];
                          newItems[idx].selectedMeaningIdx = parseInt(e.target.value);
                          setFoundItems(newItems);
                        }}
                      >
                        {item.vocab.meanings_data.map((m, mIdx) => (
                          <option key={mIdx} value={mIdx}>
                            {mIdx + 1}. {m.definition} ({m.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIST TỪ THIẾU */}
              {missingTerms.length > 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h3 className="font-bold text-red-600 mb-2">⚠️ Chưa có trong kho ({missingTerms.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {missingTerms.map((term, idx) => (
                      <div key={idx} className="flex items-center bg-white px-3 py-1 rounded-full border border-red-200 shadow-sm">
                        <span className="text-sm font-bold text-gray-700 mr-2">{term}</span>
                        <button 
                          onClick={() => handleRequestTerm(term)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === CỘT PHẢI: NGỮ PHÁP & SESSION INFO === */}
        <div className="space-y-6">
          
          {/* 3. INPUT NGỮ PHÁP (SMART SUGGESTION) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span>🧩</span> Ngữ pháp (Grammar)
            </h2>
            <input 
              type="text"
              placeholder="Nhập cấu trúc (VD: tsumori, hou ga ii...)"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none"
              value={grammarQuery}
              onChange={(e) => setGrammarQuery(e.target.value)}
            />
            
            {/* SUGGESTION DROPDOWN */}
            {grammarSuggestions.length > 0 && (
              <div className="absolute z-10 w-[calc(100%-3rem)] bg-white shadow-xl border border-gray-200 rounded-xl mt-2 max-h-60 overflow-y-auto">
                {grammarSuggestions.map(g => (
                  <div 
                    key={g.id} 
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => addGrammar(g)}
                  >
                    <div className="font-bold text-[#2C3E50]">{g.structure} <span className="text-xs text-gray-400 font-normal">({g.level})</span></div>
                    <div className="text-xs text-gray-500 truncate">{g.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* DANH SÁCH NGỮ PHÁP ĐÃ CHỌN */}
            <div className="mt-4 space-y-2">
              {selectedGrammars.map(g => (
                <div key={g.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div>
                    <span className="font-bold text-blue-800">{g.structure}</span>
                    <span className="text-xs text-blue-600 block">{g.description}</span>
                  </div>
                  <button onClick={() => removeGrammar(g.id)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              ))}
              {selectedGrammars.length === 0 && <p className="text-sm text-gray-400 italic">Chưa chọn ngữ pháp nào.</p>}
            </div>
          </div>

          {/* 4. THÔNG TIN SESSION & SUBMIT */}
          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
            <h2 className="font-bold text-lg mb-3 text-yellow-800">🚀 Sẵn sàng?</h2>
            <div className="mb-4">
               <label className="block text-sm font-bold text-yellow-700 mb-1">Đặt tên phiên học:</label>
               <input 
                   type="text" 
                   className="w-full p-3 border border-yellow-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                   placeholder="VD: Luyện tập Anime tập 1..."
                   value={sessionTitle}
                   onChange={(e) => setSessionTitle(e.target.value)}
               />
            </div>
            
            <div className="flex justify-between text-sm text-yellow-800 mb-4 px-2">
                <span>Từ vựng: <b>{foundItems.length}</b></span>
                <span>Ngữ pháp: <b>{selectedGrammars.length}</b></span>
            </div>

            <button
                onClick={handleCreateSession}
                className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg transform active:scale-95"
            >
                BẮT ĐẦU THỰC HÀNH (PHASE 2)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}