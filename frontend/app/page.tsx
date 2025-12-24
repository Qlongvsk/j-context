"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Giả lập trạng thái đăng nhập (Sau này sẽ làm Auth thật)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. Hàm lấy danh sách từ Backend
  const fetchVocabularies = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/vocabularies/")
      .then((res) => {
        // Sắp xếp: Pending lên đầu, sau đó đến các từ khác
        const sortedList = res.data.sort((a: Vocabulary, b: Vocabulary) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return 0;
        });
        setVocabList(sortedList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVocabularies();
  }, []);

  // 2. Logic Lọc từ vựng (Matching)
  const filteredVocabs = vocabList.filter(v => 
    v.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.kana.includes(searchTerm) ||
    v.meanings_data.some((m:any) => m.definition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 3. Hàm xử lý: Learner yêu cầu từ mới (Phase 1 SRS)
  const handleRequestNewWord = async () => {
    if (!searchTerm.trim()) return;
    setIsRequesting(true);

    try {
      // Đẩy ngầm vào Queue (Tạo từ với status pending)
      await axios.post("http://localhost:8000/vocabularies/", {
        term: searchTerm, // Lấy đúng từ đang gõ
        kana: "Đang cập nhật...", // Placeholder
        meanings_data: [
          { definition: "Chưa có nghĩa (Chờ Admin duyệt)", type: "Pending" }
        ],
        status: "pending" // <--- Quan trọng: Đánh dấu là từ đang chờ
      });

      // Reload lại list để hiện từ vừa thêm
      fetchVocabularies();
      setSearchTerm(""); // Xóa ô tìm kiếm
      alert(`✅ Đã thêm "${searchTerm}" vào danh sách học tạm thời!`);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi yêu cầu từ mới. Hãy kiểm tra Backend đã update cột 'status' chưa!");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-[#2C3E50] font-sans selection:bg-[#E8F5E9] selection:text-[#1B5E20]">
      
      {/* --- 1. HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#FDFCF8]/95 backdrop-blur-sm border-b border-[#89986D]/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="w-8 h-8 bg-[#4A5D23] rounded-lg flex items-center justify-center text-[#FDFCF8] font-bold text-lg">J</div>
            <span className="text-2xl font-bold tracking-tight text-[#4A5D23]">Context</span>
          </Link>

          <div className="flex gap-4 items-center">
             <Link href="/admin" className="text-sm font-semibold text-gray-400 hover:text-[#4A5D23] transition">
                🛡️ Admin Area
             </Link>
            {isLoggedIn ? (
              <div className="flex gap-4 items-center pl-4 border-l border-gray-200">
                <span className="text-sm font-semibold text-[#4A5D23]">Chào, Learner!</span>
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] border-2 border-[#4A5D23] flex items-center justify-center text-xl cursor-pointer">👨‍🎓</div>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="px-5 py-2 bg-[#4A5D23] text-[#FDFCF8] rounded-full font-bold hover:bg-[#2C3E50] transition shadow-md text-sm"
              >
                Đăng nhập ngay
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION & SEARCH --- */}
      <section className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#4A5D23] mb-4 tracking-tight">
          Bạn muốn học từ gì hôm nay?
        </h1>
        <p className="text-lg text-[#2C3E50]/80 mb-10 font-medium">
          Nhập từ vựng bạn thấy (trong anime, sách báo...) để bắt đầu quy trình Context Learning.
        </p>

        {/* SEARCH BAR (Phase 1 Input) */}
        <div className="relative max-w-2xl mx-auto group z-10">
          <input
            type="text"
            placeholder="Nhập từ vựng (VD: 食べる, kakeru...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredVocabs.length === 0 && searchTerm) {
                handleRequestNewWord();
              }
            }}
            className="w-full py-4 pl-6 pr-14 text-lg rounded-full border-2 border-[#4A5D23]/20 bg-white text-[#2C3E50] focus:outline-none focus:border-[#4A5D23] focus:ring-4 focus:ring-[#E8F5E9] transition-all shadow-lg hover:shadow-xl"
          />
          <button 
            className="absolute right-2 top-2 bottom-2 bg-[#4A5D23] hover:bg-[#38461A] text-white w-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            onClick={filteredVocabs.length === 0 ? handleRequestNewWord : undefined}
          >
            {searchTerm && filteredVocabs.length === 0 ? "➕" : "🔍"}
          </button>
        </div>
      </section>

      {/* --- 3. DANH SÁCH TỪ VỰNG --- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        
        {/* LOGIC HIỂN THỊ KẾT QUẢ */}
        {loading ? (
          <div className="text-center py-20 text-[#89986D] animate-pulse font-medium">
            📡 Đang kết nối đến kho dữ liệu...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CASE A: TÌM THẤY TỪ (Hiển thị list) */}
            {filteredVocabs.map((vocab) => (
              <Link 
                href={`/practice/${vocab.id}`} 
                key={vocab.id} 
                className="group relative block h-full"
              >
                <div className={`h-full bg-white rounded-2xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
                  ${vocab.status === 'pending' 
                    ? 'border-yellow-400 shadow-[0_4px_20px_rgba(250,204,21,0.2)]' 
                    : 'border-transparent shadow-md hover:border-[#4A5D23]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-3xl font-black text-[#4A5D23] group-hover:text-[#2C3E50] transition-colors">
                        {vocab.term}
                      </h3>
                      <p className="text-[#89986D] font-mono text-sm mt-1">{vocab.kana}</p>
                    </div>
                    {/* Badge trạng thái */}
                    {vocab.status === 'pending' ? (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse">
                        ⏳ Queue
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#4A5D23]">
                        ✅ Verified
                      </span>
                    )}
                  </div>

                  <div className="w-full h-px bg-gray-100 my-4"></div>

                  <div className="space-y-2">
                    {vocab.meanings_data.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-[#2C3E50] text-sm">
                        <span className="text-[#89986D] font-bold mt-0.5">•</span>
                        <span className="opacity-90">{m.definition}</span>
                      </div>
                    ))}
                    {vocab.meanings_data.length > 3 && (
                      <p className="text-xs text-gray-400 italic pl-4">... và {vocab.meanings_data.length - 3} nghĩa khác</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* CASE B: KHÔNG TÌM THẤY (Hiển thị thẻ Request) */}
            {searchTerm && filteredVocabs.length === 0 && (
              <div className="h-full bg-white/60 border-2 border-dashed border-[#4A5D23]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-[#4A5D23] transition-all cursor-pointer group shadow-sm hover:shadow-lg"
                onClick={handleRequestNewWord}
              >
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-[#4A5D23] mb-2">
                  Chưa có từ "{searchTerm}"
                </h3>
                <p className="text-sm text-[#2C3E50]/70 mb-6 px-4">
                  Bấm để thêm từ này vào hàng chờ (Queue) và bắt đầu học ngay lập tức.
                </p>
                <button 
                  disabled={isRequesting}
                  className="px-6 py-3 bg-[#4A5D23] text-white rounded-xl font-bold hover:bg-[#2C3E50] transition w-full shadow-lg disabled:opacity-50"
                >
                  {isRequesting ? "Đang xử lý..." : "➕ Thêm vào Queue & Học"}
                </button>
              </div>
            )}
          </div>
        )}

      </section>
      
      <footer className="text-center py-8 text-[#89986D] text-sm border-t border-[#89986D]/10 bg-[#FAFAF7]">
        © 2024 J-Context. Hệ thống học từ vựng thông minh.
      </footer>
    </main>
  );
}