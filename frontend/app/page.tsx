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
  
  // Giả lập trạng thái đăng nhập (Sau này sẽ nối Auth thật)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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

  // Hàm lọc từ vựng theo thanh tìm kiếm
  const filteredVocabs = vocabList.filter(v => 
    v.term.includes(searchTerm) || 
    v.kana.includes(searchTerm) ||
    v.meanings_data.some((m:any) => m.definition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-j-cream text-j-text-dark font-sans selection:bg-j-green-light selection:text-j-green-dark">
      
      {/* --- 1. HEADER / NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-j-cream/95 backdrop-blur-sm border-b border-j-green-med/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-j-green-dark rounded-lg flex items-center justify-center text-j-cream font-bold text-lg">J</div>
            <span className="text-2xl font-bold tracking-tight text-j-green-dark">Context</span>
          </div>

          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm font-semibold">Chào, Learner!</span>
                <div className="w-10 h-10 rounded-full bg-j-green-light border-2 border-j-green-dark"></div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => alert("Chức năng Đăng nhập đang phát triển")}
                  className="px-4 py-2 text-j-green-dark font-bold hover:text-j-green-med transition"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setIsLoggedIn(true)} // Fake login để test giao diện
                  className="px-5 py-2 bg-j-green-dark text-j-cream rounded-full font-bold hover:bg-j-text-dark transition shadow-md"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION & SEARCH --- */}
      <section className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-j-green-dark mb-4">
          Tra cứu & Luyện tập ngữ cảnh
        </h1>
        <p className="text-lg text-j-text-dark/80 mb-10">
          Học từ vựng tiếng Nhật thông qua ngữ cảnh, câu chuyện và AI.
        </p>

        {/* SEARCH BAR LỚN */}
        <div className="relative max-w-2xl mx-auto group">
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng (VD: テスト, Ăn, kakeru...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-6 pr-14 text-lg rounded-2xl border-2 border-j-green-dark/30 bg-white text-j-text-dark focus:outline-none focus:border-j-green-dark focus:ring-4 focus:ring-j-green-light/30 transition shadow-lg"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-j-green-light rounded-xl hover:bg-j-green-med text-j-green-dark transition">
            🔍
          </button>
        </div>
      </section>

      {/* --- 3. DASHBOARD (Chỉ hiện khi Login) --- */}
      {isLoggedIn && (
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-j-green-light grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-j-cream p-4 rounded-2xl flex items-center gap-4">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="text-sm text-j-green-med font-bold uppercase">Streak</p>
                <p className="text-2xl font-bold text-j-green-dark">12 Ngày</p>
              </div>
            </div>
            <div className="bg-j-cream p-4 rounded-2xl flex items-center gap-4">
              <div className="text-3xl">📚</div>
              <div>
                <p className="text-sm text-j-green-med font-bold uppercase">Từ đã thuộc</p>
                <p className="text-2xl font-bold text-j-green-dark">85 Từ</p>
              </div>
            </div>
            <div className="bg-j-cream p-4 rounded-2xl flex items-center gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <p className="text-sm text-j-green-med font-bold uppercase">Mục tiêu ngày</p>
                <p className="text-2xl font-bold text-j-green-dark">5/10 Từ</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- 4. DANH SÁCH TỪ VỰNG --- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-j-text-dark flex items-center gap-2">
            <span className="block w-2 h-8 bg-j-green-dark rounded-full"></span>
            Kho Từ Vựng
          </h2>
          <Link href="/admin" className="text-sm font-semibold text-j-green-med hover:text-j-green-dark underline decoration-2">
             Quản lý (Admin)
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-j-green-med animate-pulse">
            Đang tải dữ liệu từ kho...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVocabs.map((vocab) => (
              <Link 
                href={`/practice/${vocab.id}`} 
                key={vocab.id} 
                className="group relative block"
              >
                {/* Card Background & Effect */}
                <div className="h-full bg-white rounded-2xl p-6 border-2 border-j-green-light hover:border-j-green-dark hover:shadow-[6px_6px_0px_0px_rgba(137,152,109,1)] transition-all duration-200 transform hover:-translate-y-1">
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-3xl font-black text-j-green-dark group-hover:text-j-text-dark transition">
                        {vocab.term}
                      </h3>
                      <p className="text-j-green-med font-mono text-sm mt-1">{vocab.kana}</p>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      vocab.status === 'verified' 
                      ? 'bg-j-green-light/30 text-j-green-dark' 
                      : 'bg-orange-100 text-orange-600'
                    }`}>
                      {vocab.status}
                    </span>
                  </div>

                  <div className="border-t-2 border-dashed border-j-green-light my-3"></div>

                  <div className="space-y-1">
                    {vocab.meanings_data.slice(0, 2).map((m: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-j-text-dark">
                        <span className="text-j-green-med font-bold">•</span>
                        <span>{m.definition}</span>
                        <span className="text-xs text-j-green-med bg-j-cream px-1 rounded self-center border border-j-green-light">
                          {m.type}
                        </span>
                      </div>
                    ))}
                    {vocab.meanings_data.length > 2 && (
                      <p className="text-xs text-j-green-med italic">+ {vocab.meanings_data.length - 2} nghĩa khác</p>
                    )}
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredVocabs.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-j-green-med text-lg">Không tìm thấy từ vựng nào.</p>
            <p className="text-sm text-j-green-dark/60 mt-2">Hãy thử tìm từ khoá khác xem sao.</p>
          </div>
        )}
      </section>
      
      {/* FOOTER */}
      <footer className="text-center py-8 text-j-green-med text-sm">
        © 2024 J-Context. Học tiếng Nhật theo phong cách tối giản.
      </footer>
    </main>
  );
}