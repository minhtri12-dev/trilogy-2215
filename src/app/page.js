"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// --- HOOK: HIỆU ỨNG CHỮ ĐÁNH MÁY ---
const useTypewriter = (text, speed = 20, delay = 0) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const timeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayedText, isTyping };
};

const TypewriterText = ({ text, speed = 20, delay = 0, className, noCursor = false }) => {
  const { displayedText, isTyping } = useTypewriter(text, speed, delay);
  return (
    <span className={`${className || ""} transition-all`}>
      {displayedText}
      {!noCursor && (
        <span className={`inline-block w-2 h-4 ml-1 bg-current align-middle ${isTyping ? "animate-pulse" : "opacity-0"}`}></span>
      )}
    </span>
  );
};

export default function HubMenu() {
  const [lang, setLang] = useState("vi");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- LOGIC XỬ LÝ ÂM THANH ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // Chỉnh âm lượng nền ở mức 40%
      // Cố gắng tự động phát nhạc khi tải trang
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log("Trình duyệt chặn Autoplay. Đợi người dùng tương tác.");
        setIsPlaying(false);
      });
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Bộ từ điển song ngữ
  const dict = {
    vi: {
      network: "DETECTIVE UNIVERSE",
      case1Label: "[ LƯU TRỮ ]",
      case1Desc: "Góc nhìn: ĐẶC VỤ HOLMES | Tình trạng: ĐÃ HOÀN THIỆN",
      case1Action: "[ TRUY CẬP HỒ SƠ FBI ]",
      case2Label: "[ MỐI ĐE DỌA HIỆN TẠI ]",
      case2Desc: "Góc nhìn: GIÁO SƯ | Tình trạng: ĐANG XÂY DỰNG Ý TƯỞNG",
      case2Action: "[ KẾT NỐI MẠNG SHADOW-OS ]",
      langBtn: "EN",
      audioOn: "[ 🔊 BẬT ]",
      audioOff: "[ 🔈 TẮT ]"
    },
    en: {
      network: "GLOBAL INTELLIGENCE NETWORK",
      case1Label: "[ ARCHIVE ]",
      case1Desc: "Perspective: AGENT HOLMES | Status: COMPLETED",
      case1Action: "[ ACCESS FBI FILES ]",
      case2Label: "[ ACTIVE THREAT ]",
      case2Desc: "Perspective: THE PROFESSOR | Status: DEVELOPING IDEAS",
      case2Action: "[ CONNECT TO SHADOW-OS ]",
      langBtn: "VI",
      audioOn: "[ 🔊 ON ]",
      audioOff: "[ 🔈 OFF ]"
    }
  };

  const t = dict[lang];

  return (
    <main className="min-h-screen w-full bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-mono text-slate-300 p-6">
      
      {/* Thẻ Audio ẩn */}
      <audio ref={audioRef} src="/audio/hub-bgm.mp3" loop />

      {/* Hiệu ứng nhiễu sóng (Scanlines) */}
      <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-15"></div>
      
      {/* Lưới công nghệ */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#47556940_1px,transparent_1px),linear-gradient(to_bottom,#47556940_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

      {/* Hiệu ứng tối 4 góc (Vignette) */}
      <div className="fixed inset-0 pointer-events-none z-0 [box-shadow:inset_0_0_150px_rgba(0,0,0,0.6)]"></div>

      {/* Luồng sáng nhẹ phía sau chữ DOSSIER-OS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-cyan-500/10 blur-[100px] pointer-events-none z-0"></div>

      {/* THANH ĐIỀU KHIỂN GÓC TRÊN */}
      <div className="absolute top-6 w-full px-6 flex justify-between items-center z-50 pointer-events-none">
        {/* Nút Âm thanh (Trái) */}
        <button 
          onClick={toggleAudio}
          className="pointer-events-auto px-4 py-2 border border-slate-600 bg-slate-900/80 hover:border-slate-300 hover:text-white transition-colors text-xs font-bold tracking-widest rounded cursor-pointer shadow-lg shadow-black/50"
        >
          {isPlaying ? t.audioOff : t.audioOn}
        </button>

        {/* Nút Đổi ngôn ngữ (Phải) */}
        <button 
          onClick={() => setLang(lang === "vi" ? "en" : "vi")}
          className="pointer-events-auto px-4 py-2 border border-slate-600 bg-slate-900/80 hover:border-slate-300 hover:text-white transition-colors text-xs font-bold tracking-widest rounded cursor-pointer shadow-lg shadow-black/50"
        >
          {t.langBtn}
        </button>
      </div>
      
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* Tiêu đề hệ thống */}
        <div className="text-center mb-16 w-full relative">
          <p className="text-xs text-slate-400 tracking-[0.3em] mb-4">
            <TypewriterText text={t.network} speed={30} delay={100} />
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest [text-shadow:0_0_30px_rgba(255,255,255,0.6)]">
            <TypewriterText text="DOSSIER-OS" speed={40} delay={1000} />
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-400 to-transparent mt-6 opacity-50 shadow-[0_0_10px_rgba(148,163,184,0.5)]"></div>
        </div>

        {/* Danh sách Case */}
        <div className="w-full flex flex-col gap-6">
          
          {/* CASE 2215 */}
          <Link href="/case2215" className="group relative block w-full p-6 bg-slate-900/60 backdrop-blur-md border border-slate-700 hover:border-cyan-400 hover:bg-slate-800/80 rounded transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 tracking-widest mb-1 block drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                  <TypewriterText text={t.case1Label} speed={20} delay={2000} noCursor />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 group-hover:text-white transition-colors">
                  <TypewriterText text="CASE 2215: THE ZODIAC LEGACY" speed={25} delay={2200} noCursor />
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-semibold">{t.case1Desc}</p>
              </div>
              <div className="text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity animate-pulse mt-2 md:mt-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                {t.case1Action}
              </div>
            </div>
          </Link>

          {/* CASE 1412 */}
          <Link href="/case1412" className="group relative block w-full p-6 bg-slate-900/60 backdrop-blur-md border border-slate-700 hover:border-red-500 hover:bg-slate-800/80 rounded transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-red-500 tracking-widest mb-1 block drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                  <TypewriterText text={t.case2Label} speed={20} delay={3000} noCursor />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 group-hover:text-white transition-colors">
                  <TypewriterText text="CASE 1412: THE LEVIATHAN DECEPTION" speed={25} delay={3200} noCursor />
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-semibold">{t.case2Desc}</p>
              </div>
              <div className="text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity animate-pulse mt-2 md:mt-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {t.case2Action}
              </div>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-16 text-xs text-slate-500 tracking-widest text-center">
          <TypewriterText text="SYSTEM v9.0.2 | AUTHORIZED BY MINH TRI" speed={20} delay={4500} noCursor />
        </div>
      </div>
    </main>
  );
}