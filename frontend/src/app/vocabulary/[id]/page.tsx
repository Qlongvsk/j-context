"use client";
import { useEffect, useState, use } from "react";
import axios from "axios";
import Link from "next/link";
import PitchAccent from "@/components/PitchAccent"; // <--- Import
import AnkiAudio from "@/components/AnkiAudio";     // <--- Import

export default function VocabularyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vocab, setVocab] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:8000/vocabularies/${id}`)
      .then((res) => setVocab(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!vocab) return <div className="p-20 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C3E50] flex justify-center py-10 px-4">
      
      {/* NÚT BACK (Nổi bên trái) */}
      <Link href="/" className="fixed top-6 left-6 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm z-50">
        ←
      </Link>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* CARD CHÍNH: TỪ VỰNG & PITCH ACCENT */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#E8F5E9] overflow-hidden relative">
            
            {/* THẺ TAGS GÓC TRÊN */}
            {vocab.tags && vocab.tags.length > 0 && (
                <div className="absolute top-4 right-4 flex gap-1">
                    {vocab.tags.slice(0,2).map((tag:string, i:number) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                            {tag.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            )}

            <div className="p-8 text-center pt-12">
                {/* 1. HIỂN THỊ KANJI/FURIGANA LỚN */}
                <div className="mb-6">
                    {vocab.kanji_html ? (
                        <h1 
                            className="text-6xl font-black text-[#2C3E50] ruby-large"
                            dangerouslySetInnerHTML={{ __html: vocab.kanji_html }}
                        />
                    ) : (
                        <h1 className="text-6xl font-black text-[#2C3E50]">{vocab.term}</h1>
                    )}
                </div>

                {/* 2. BIỂU ĐỒ PITCH ACCENT (VẼ TỰ ĐỘNG) */}
                <div className="flex justify-center mb-6">
                    <PitchAccent kana={vocab.kana} pitch={vocab.pitch_accent} />
                </div>

                {/* 3. NÚT AUDIO & HÁN VIỆT */}
                <div className="flex justify-center items-center gap-3">
                    <AnkiAudio ankiSoundTag={vocab.audio_word} label="Phát âm" />
                    
                    {vocab.sino_vietnamese && (
                        <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                            {vocab.sino_vietnamese}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* CARD PHỤ: NGHĨA & VÍ DỤ */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            
            {/* 1. NGHĨA */}
            <div className="mb-8 text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Ý nghĩa</span>
                <p className="text-2xl font-bold text-[#4A5D23] leading-relaxed">
                    {vocab.meaning_vi}
                </p>
                {vocab.type && <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{vocab.type}</span>}
            </div>

            <div className="w-full h-px bg-gray-100 my-6"></div>

            {/* 2. VÍ DỤ (Có xử lý Audio câu) */}
            {vocab.example_html && (
                <div className="bg-[#F8FAF5] rounded-xl p-6 border border-[#E8F5E9] relative">
                    <h3 className="text-xs font-bold text-[#89986D] uppercase mb-3 flex justify-between items-center">
                        <span>Ví dụ mẫu</span>
                        <AnkiAudio ankiSoundTag={vocab.audio_sentence} label="Nghe câu" />
                    </h3>
                    
                    {/* Render HTML ví dụ của Anki */}
                    <div 
                        className="text-lg text-[#2C3E50] leading-loose example-content"
                        dangerouslySetInnerHTML={{ __html: vocab.example_html }}
                    />
                </div>
            )}
        </div>

      </div>
    </div>
  );
}