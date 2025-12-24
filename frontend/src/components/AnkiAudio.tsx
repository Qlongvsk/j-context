"use client";
import { useState, useRef } from "react";

interface Props {
  ankiSoundTag: string | null; // VD: [sound:abc.mp3]
  label?: string;
}

export default function AnkiAudio({ ankiSoundTag, label }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!ankiSoundTag) return null;

  // Regex để lấy tên file: [sound:abc.mp3] -> abc.mp3
  const match = ankiSoundTag.match(/\[sound:(.*?)\]/);
  if (!match) return null;

  const fileName = match[1];
  // Đường dẫn file trong thư mục public
  const audioSrc = `/audio/${fileName}`; 

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => alert("Không tìm thấy file audio! Hãy copy file vào thư mục public/audio"));
      setIsPlaying(true);
    }
  };

  return (
    <button 
        onClick={togglePlay}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
            isPlaying 
            ? "bg-green-100 border-green-300 text-green-700" 
            : "bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600"
        }`}
    >
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        onEnded={() => setIsPlaying(false)}
        onError={() => console.warn("Lỗi tải file:", fileName)}
      />
      <span>{isPlaying ? "🔊" : "🔈"}</span>
      {label && <span className="text-xs font-semibold">{label}</span>}
    </button>
  );
}