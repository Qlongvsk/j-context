"use client";
import React from "react";

interface Props {
  kana: string;
  pitch: number;
}

export default function PitchAccent({ kana, pitch }: Props) {
  // 1. Tách Mora (đơn vị âm)
  const getMoras = (text: string) => {
    return text.match(/.[ゃゅょぁぃぅぇぉャュョァィゥェォ]?/g) || [];
  };

  const moras = getMoras(kana);
  if (moras.length === 0) return null;

  // 2. Tính toán trạng thái Cao/Thấp (High/Low)
  const statuses = moras.map((_, index) => {
    const i = index + 1;
    if (pitch === 0) {
      return i === 1 ? "L" : "H";
    } else if (pitch === 1) {
      return i === 1 ? "H" : "L";
    } else {
      if (i === 1) return "L";
      if (i <= pitch) return "H";
      return "L";
    }
  });

  // 3. Cấu hình vẽ SVG (ĐÃ SỬA LỖI CÚ PHÁP)
  const CIRCLE_RADIUS = 3; // <--- Đã tách ra
  const STEP_X = 25; 
  const HEIGHT = 35; // Tăng nhẹ chiều cao
  const Y_HIGH = 10;
  const Y_LOW = 30;

  // Tạo toạ độ các điểm
  const points = statuses.map((status, index) => ({
    x: (index * STEP_X) + (STEP_X / 2),
    y: status === "H" ? Y_HIGH : Y_LOW,
    status
  }));

  // Tạo đường nối
  let pathD = `M ${points[0].x} ${points[0].y}`;
  points.forEach((p, i) => {
    if (i > 0) pathD += ` L ${p.x} ${p.y}`;
  });

  return (
    <div className="flex flex-col items-center select-none">
      {/* LỚP 1: BIỂU ĐỒ SVG */}
      <div className="relative h-[40px] w-full flex justify-center">
        <svg 
            width={moras.length * STEP_X} 
            height={HEIGHT} 
            className="overflow-visible"
        >
          {/* Đường nối */}
          <path d={pathD} stroke="#89986D" strokeWidth="2" fill="none" />

          {/* Các điểm tròn */}
          {points.map((p, i) => (
            <g key={i}>
                <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={CIRCLE_RADIUS} 
                    fill={p.status === "H" ? "#4A5D23" : "#89986D"} 
                    stroke="white"
                    strokeWidth="1"
                />
                
                {/* Mũi tên xuống (Accent Fall) */}
                {pitch > 0 && (i + 1) === pitch && (
                    <path 
                        d={`M ${p.x + CIRCLE_RADIUS + 2} ${p.y} L ${p.x + CIRCLE_RADIUS + 2} ${p.y + (Y_LOW - Y_HIGH)/1.5}`} 
                        stroke="#EF4444" 
                        strokeWidth="2"
                    />
                )}
            </g>
          ))}
        </svg>
      </div>

      {/* LỚP 2: CHỮ KANA */}
      <div className="flex justify-center -mt-1">
        {moras.map((m, i) => (
          <span 
            key={i} 
            style={{ width: STEP_X }} 
            className={`text-center text-lg font-mono leading-none ${statuses[i] === 'H' ? 'text-[#4A5D23] font-bold' : 'text-gray-500'}`}
          >
            {m}
          </span>
        ))}
      </div>
      
      {/* LABEL LOẠI TRỌNG ÂM */}
      <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest border border-gray-200 px-2 rounded-full">
        {pitch === 0 ? "Heiban (0)" : pitch === 1 ? "Atamadaka (1)" : `Nakadaka/Odaka (${pitch})`}
      </div>
    </div>
  );
}