"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Vocabulary {
  id: string;
  term: string;
  kana: string;
  kanji_html?: string; // <--- MỚI: Thêm trường này để chứa HTML Furigana
  meanings_data: any[];
  status: string;
}

export default function Home() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Learner"); 
  // ------------------

  // Hàm trộn ngẫu nhiên mảng
  const shuffleArray = (array: Vocabulary[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // 1. Hàm lấy danh sách từ Backend
  const fetchVocabularies = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/vocabularies/")
      .then((res) => {
        const verifiedList = res.data.filter((v: Vocabulary) => v.status === 'verified');
        const randomList = shuffleArray(verifiedList);
        setVocabList(randomList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  };

  // --- CHECK LOGIN & LOGOUT ---
  useEffect(() => {
    fetchVocabularies();

    const token = localStorage.getItem("token");
    const savedName = localStorage.getItem("user_name");
    
    if (token) {
      setIsLoggedIn(true);
      if (savedName) setUserName(savedName);
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      setIsLoggedIn(false);
      setUserName("Learner");
      window.location.reload(); 
    }
  };
  // ---------------------------

  // 2. Logic Tìm kiếm
  const displayedVocabs = searchTerm 
    ? vocabList.filter(v => 
        v.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.kana.includes(searchTerm) ||
        v.meanings_data.some((m:any) => m.definition.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : vocabList;

  // 3. Hàm xử lý: Yêu cầu từ mới
  const handleRequestNewWord = async () => {
    if (!searchTerm.trim()) return;
    
    setIsRequesting(true);

    try {
      await axios.post("http://localhost:8000/vocabularies/", {
        term: searchTerm, 
        kana: "Đang cập nhật...", 
        meanings_data: [
          { definition: "Người dùng yêu cầu bổ sung", type: "User Request" }
        ],
        status: "pending"
      });

      alert(`✅ Đã gửi yêu cầu từ "${searchTerm}" đến Admin! Vui lòng chờ duyệt.`);
      setSearchTerm(""); 
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối Backend.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-[#2C3E50] font-sans selection:bg-[#E8F5E9] selection:text-[#1B5E20]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFCF8]/95 backdrop-blur-sm border-b border-[#89986D]/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="w-8 h-8 bg-[#4A5D23] rounded-lg flex items-center justify-center text-[#FDFCF8] font-bold text-lg">J</div>
            <span className="text-2xl font-bold tracking-tight text-[#4A5D23]">Context</span>
          </Link>
          
          {/* NÚT VÀO LỚP HỌC */}
            <Link href="/learn" className="flex items-center gap-1 text-sm font-bold text-[#4A5D23] bg-[#E8F5E9] px-4 py-2 rounded-full hover:bg-[#4A5D23] hover:text-white transition shadow-sm border border-[#4A5D23]/20">
                <span>📚</span>
                <span>Vào lớp học</span>
            </Link>

          <div className="flex gap-4 items-center">
             <Link href="/admin" className="text-sm font-semibold text-gray-400 hover:text-[#4A5D23] transition">
                🛡️ Admin Area
             </Link>

            {/* INFO USER */}
            {isLoggedIn ? (
              <div className="flex gap-4 items-center pl-4 border-l border-gray-200">
                <div className="text-right">
                  <span className="block text-sm font-bold text-[#4A5D23]">Chào, {userName}!</span>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">
                    Đăng xuất
                  </button>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] border-2 border-[#4A5D23] flex items-center justify-center text-xl cursor-pointer">
                  👨‍🎓
                </div>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-5 py-2 bg-[#4A5D23] text-[#FDFCF8] rounded-full font-bold hover:bg-[#2C3E50] transition shadow-md text-sm">
                  Đăng nhập ngay
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO & SEARCH */}
      <section className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#4A5D23] mb-4 tracking-tight">
          Bạn muốn học từ gì hôm nay?
        </h1>
        <p className="text-lg text-[#2C3E50]/80 mb-10 font-medium">
          Nhập từ vựng bạn thấy (trong anime, sách báo...) để bắt đầu quy trình Context Learning.
        </p>

        <div className="relative max-w-2xl mx-auto group z-10">
          <input
            type="text"
            placeholder="Nhập từ vựng (VD: 食べる, kakeru...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && displayedVocabs.length === 0 && searchTerm) {
                handleRequestNewWord();
              }
            }}
            className="w-full py-4 pl-6 pr-14 text-lg rounded-full border-2 border-[#4A5D23]/20 bg-white text-[#2C3E50] focus:outline-none focus:border-[#4A5D23] focus:ring-4 focus:ring-[#E8F5E9] transition-all shadow-lg hover:shadow-xl"
          />
          <button 
            className="absolute right-2 top-2 bottom-2 bg-[#4A5D23] hover:bg-[#38461A] text-white w-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            onClick={displayedVocabs.length === 0 ? handleRequestNewWord : undefined}
          >
            {searchTerm && displayedVocabs.length === 0 ? "➕" : "🔍"}
          </button>
        </div>
      </section>

      {/* VOCAB LIST */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        
        {loading ? (
          <div className="text-center py-20 text-[#89986D] animate-pulse font-medium">
            📡 Đang tải kho dữ liệu ngẫu nhiên...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {displayedVocabs.map((vocab) => (
              <Link href={`/vocabulary/${vocab.id}`} key={vocab.id} className="group relative block h-full">
                <div className="h-full bg-white rounded-2xl p-6 border-2 border-transparent shadow-md hover:border-[#4A5D23] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  
                  {/* --- KHU VỰC HIỂN THỊ TỪ (ĐÃ NÂNG CẤP) --- */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {vocab.kanji_html ? (
                        // NẾU CÓ HTML FURIGANA (TỪ ANKI)
                        <h3 
                            className="text-3xl font-black text-[#4A5D23] group-hover:text-[#2C3E50] transition-colors ruby-container"
                            dangerouslySetInnerHTML={{ __html: vocab.kanji_html }}
                        />
                      ) : (
                        // NẾU KHÔNG CÓ HTML (HIỆN BÌNH THƯỜNG)
                        <h3 className="text-3xl font-black text-[#4A5D23] group-hover:text-[#2C3E50] transition-colors">
                            {vocab.term}
                        </h3>
                      )}
                      
                      {/* Chỉ hiện dòng Kana phụ nếu chưa có HTML (để tránh lặp lại, vì HTML Furigana đã có kana nhỏ ở trên rồi) */}
                      {!vocab.kanji_html && (
                        <p className="text-[#89986D] font-mono text-sm mt-1">{vocab.kana}</p>
                      )}
                    </div>

                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#4A5D23]">
                      ✅ Verified
                    </span>
                  </div>
                  {/* ------------------------------------------ */}

                  <div className="w-full h-px bg-gray-100 my-4"></div>

                  <div className="space-y-2">
                    {vocab.meanings_data.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-[#2C3E50] text-sm">
                        <span className="text-[#89986D] font-bold mt-0.5">•</span>
                        <span className="opacity-90">{m.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {/* NÚT REQUEST */}
            {searchTerm && displayedVocabs.length === 0 && (
              <div className="h-full bg-white/60 border-2 border-dashed border-[#4A5D23]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-[#4A5D23] transition-all cursor-pointer group shadow-sm hover:shadow-lg"
                onClick={handleRequestNewWord}
              >
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">
                  📩
                </div>
                <h3 className="text-xl font-bold text-[#4A5D23] mb-2">
                  Chưa có từ "{searchTerm}"
                </h3>
                <p className="text-sm text-[#2C3E50]/70 mb-6 px-4">
                  Bấm để gửi yêu cầu vào <b>Hàng đợi Admin</b>. Chúng tôi sẽ thêm từ này sớm nhất có thể!
                </p>
                <button 
                  disabled={isRequesting}
                  className="px-6 py-3 bg-[#4A5D23] text-white rounded-xl font-bold hover:bg-[#2C3E50] transition w-full shadow-lg disabled:opacity-50"
                >
                  {isRequesting ? "Đang gửi..." : "➕ Gửi yêu cầu tới Admin"}
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