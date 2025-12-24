"use client";
import { useState } from "react";
import axios from "axios";

interface Props {
  onSuccess: () => void;
}

export default function BulkImportForm({ onSuccess }: Props) {
  const [rawData, setRawData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const parseAndImport = async () => {
    if (!rawData.trim()) return;
    setIsProcessing(true);
    setLog([]);
    
    // Tách dòng, bỏ dòng tiêu đề và dòng phân cách (---)
    const lines = rawData.split("\n").filter(line => line.trim().startsWith("|") && !line.includes("---"));
    
    let successCount = 0;
    let failCount = 0;

    for (const line of lines) {
      try {
        // Tách cột bằng dấu |
        // Do có dấu | ở đầu và cuối, mảng sẽ có phần tử rỗng ở 0 và cuối
        const cols = line.split("|").map(c => c.trim());
        
        // MAPPING DỮ LIỆU TỪ ANKI (Dựa trên bảng bạn gửi)
        // cols[0] = "" (Rỗng do dấu | đầu dòng)
        const term = cols[1];            // Cột 1: Từ vựng (体)
        const pitch = parseInt(cols[2]) || 0; // Cột 2: Pitch (0)
        const meaning_vi = cols[3];      // Cột 3: Nghĩa TV (cơ thể)
        const anki_id = cols[4];         // Cột 4: ID (729)
        const kanji_html = cols[5];      // Cột 5: HTML (<ruby>...)
        const kana = cols[6];            // Cột 6: Kana (からだ)
        const sino = cols[7];            // Cột 7: Hán Việt (THỂ)
        const audio_word = cols[8];      // Cột 8: Audio từ
        const example_html = cols[9];    // Cột 9: HTML Ví dụ
        const audio_sent = cols[10];     // Cột 10: Audio câu
        // cols[11] thường rỗng
        const type = cols[12];           // Cột 12: Loại từ (N)
        // cols[13] thường rỗng
        const tagsRaw = cols[14];        // Cột 14: Tags

        // Validate cơ bản
        if (!term || !kana) continue;

        const payload = {
          term: term,
          kana: kana,
          kanji_html: kanji_html,
          pitch_accent: pitch,
          meaning_vi: meaning_vi,
          anki_id: anki_id,
          sino_vietnamese: sino,
          audio_word: audio_word,
          example_html: example_html,
          audio_sentence: audio_sent,
          type: type,
          tags: tagsRaw ? tagsRaw.split("::").filter(t => t) : [],
          
          // Vẫn tạo meanings_data để tương thích với code cũ
          meanings_data: [{ definition: meaning_vi, type: type }],
          status: "verified"
        };

        await axios.post("http://localhost:8000/vocabularies/", payload);
        successCount++;
        setLog(prev => [`✅ Đã nhập: ${term}`, ...prev.slice(0, 4)]);

      } catch (error) {
        console.error(error);
        failCount++;
        setLog(prev => [`❌ Lỗi dòng: ${line.substring(0, 20)}...`, ...prev.slice(0, 4)]);
      }
    }

    setIsProcessing(false);
    alert(`Xong! Thành công: ${successCount}, Lỗi: ${failCount}`);
    onSuccess();
  };

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-green-400 mb-4">📥 Nhập kho Anki (Full Data)</h3>
      <textarea
        className="w-full h-40 p-4 rounded bg-gray-900 text-gray-300 font-mono text-xs border border-gray-600 focus:border-green-500 outline-none"
        placeholder="Paste toàn bộ bảng Markdown từ Anki vào đây..."
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
      ></textarea>
      <button
        onClick={parseAndImport}
        disabled={isProcessing}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition w-full"
      >
        {isProcessing ? "Đang xử lý..." : "🚀 Bắt đầu Import"}
      </button>
      <div className="mt-4 text-xs font-mono text-gray-400 space-y-1">
          {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}