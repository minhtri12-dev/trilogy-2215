"use client";

import { useState, useEffect, useRef } from "react";

// ==========================================
// 1. CÁC HOOK & COMPONENT HỖ TRỢ
// ==========================================
const useTypewriter = (text, speed = 20, delay = 0, playSound = false) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
      setIsTyping(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, speed);
    return () => { clearInterval(typingInterval); setIsTyping(false); };
  }, [text, speed, isStarted]);

  useEffect(() => {
    if (playSound) {
      const typingAudio = document.getElementById("typing-audio");
      if (typingAudio) {
        if (isTyping) typingAudio.play().catch(() => {});
        else typingAudio.pause();
      }
    }
  }, [isTyping, playSound]);

  return { displayedText, isStarted, isTyping };
};

const TypewriterText = ({ text, speed = 20, delay = 0, className, onComplete, playSound = false }) => {
  const { displayedText, isStarted, isTyping } = useTypewriter(text, speed, delay, playSound);
  useEffect(() => {
    if (isStarted && !isTyping && onComplete) onComplete();
  }, [isStarted, isTyping, onComplete]);
  return (
    <span className={className}>
      {displayedText}
      {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>}
    </span>
  );
};

const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// ==========================================
// 2. MÀN HÌNH INTRO (Giữ nguyên)
// ==========================================
function IntroScreen({ onStartGame }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2000);  
    const t2 = setTimeout(() => setStage(2), 8000);  
    const t3 = setTimeout(() => setStage(3), 18000); 
    const t4 = setTimeout(() => setStage(4), 30000); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleSkip = () => {
    setStage(4);
    const typingAudio = document.getElementById("typing-audio");
    if (typingAudio) typingAudio.pause();
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8 text-sm md:text-base pb-24 z-10 relative mt-12">
      <div className="text-amber-600 font-bold tracking-widest text-xs mb-4 border-b border-amber-900/40 pb-2">
        <TypewriterText text="> KHỞI ĐỘNG SHADOW-OS v9.0... ĐÃ THIẾT LẬP KẾT NỐI BẢO MẬT." speed={15} playSound={true} />
      </div>

      {stage >= 1 && (
        <div className="flex flex-col gap-2 text-zinc-400">
          <TypewriterText text="[ BÁO CÁO CHIẾN DỊCH: LEVIATHAN ]" speed={20} className="text-amber-500 font-bold" playSound={true} />
          <TypewriterText text="- TRẠNG THÁI: TÀI SẢN ĐÃ ĐƯỢC CHUYỂN GIAO. PHI VỤ 300 TRIỆU BẢNG HOÀN TẤT." speed={20} delay={500} playSound={true} />
          <TypewriterText text="- TỔN THẤT: 4 THÀNH VIÊN ĐỘI TIỀN PHONG ĐANG BỊ GIAM GIỮ TẠI TẦNG B1 (TRỤ SỞ CẢNH SÁT)." speed={20} delay={1500} className="text-amber-600/80" playSound={true} />
          <TypewriterText text="- CẢNH BÁO TỐI CAO: Ổ CỨNG 'LÕI ĐEN' ĐÃ RƠI VÀO TAY ĐẶC VỤ KANE." speed={20} delay={2500} className="text-black font-bold bg-amber-500 inline-block px-2 py-0.5 mt-1 rounded-sm w-fit" playSound={true} />
        </div>
      )}

      {stage >= 2 && (
        <div className="mt-2 border-l-2 border-zinc-700 pl-4 bg-zinc-900/40 p-4 rounded-r shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="text-zinc-500 text-xs mb-2 animate-pulse">[ ĐÁNH CHẶN AUDIO LOG - MÃ HÓA CẤP 5 ]</div>
          <div className="text-zinc-300 italic">
            <TypewriterText text='"Một phi vụ hoàn hảo... cho đến phút cuối cùng, thưa Giáo sư. Ông tính toán được dòng chảy của sông Thames, đánh lừa được hệ thống áp suất, nhưng lại bỏ quên biến số con người. Bọn họ đã khai ra ổ cứng này."' speed={25} playSound={true} />
          </div>
          <div className="text-zinc-300 italic mt-2">
            <TypewriterText text='"Ngay khi tôi giải mã xong tệp Lõi Đen tại Tầng B4, mọi danh tính, mọi bóng tối ông đang lẩn trốn sẽ bị phơi bày. Trò chơi kết thúc rồi."' speed={25} delay={4500} playSound={true} />
          </div>
        </div>
      )}

      {stage >= 3 && (
        <div className="mt-4 flex flex-col gap-3 text-amber-500 font-medium text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
          <TypewriterText text="> NGẮT TÍN HIỆU AUDIO." speed={15} className="text-amber-700 text-sm mb-4 block font-bold" playSound={true} />
          <TypewriterText text="Cậu quá tự mãn với những thuật toán của mình, Kane." speed={30} delay={1000} playSound={true} />
          <TypewriterText text="Cậu bắt được những quân tốt và tưởng rằng mình đã chiếu tướng." speed={30} delay={3500} playSound={true} />
          <TypewriterText text="Cậu nghĩ cái ổ cứng đó là dấu chấm hết?" speed={30} delay={6000} playSound={true} />
          <TypewriterText text="Không. Nó là con ngựa thành Troy. Là mồi lửa tôi cố tình để lại..." speed={40} delay={8000} playSound={true} />
          <TypewriterText text="ĐỂ ĐỐT CHÁY TOÀN BỘ VƯƠNG QUỐC KIÊU HÃNH CỦA CẬU." speed={50} delay={10500} className="text-amber-400 text-xl font-bold tracking-wide drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] mt-4" playSound={true} />
        </div>
      )}

      {stage >= 4 && (
        <div className="mt-12 flex justify-center animate-fade-in">
          <button onClick={() => { handleSkip(); onStartGame(); }} className="group relative px-8 py-4 bg-amber-950/40 border border-amber-600 hover:bg-amber-900/80 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] rounded-sm cursor-pointer">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative font-bold text-amber-500 group-hover:text-amber-100 tracking-[0.2em] transition-colors">[ KHỞI ĐỘNG GIAO THỨC ĐỘT NHẬP ]</span>
          </button>
        </div>
      )}

      {stage < 4 && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a0a0c]/80 px-2 py-1">
          <button onClick={() => { handleSkip(); onStartGame(); }} className="text-xs text-zinc-600 hover:text-amber-500 transition-colors tracking-widest font-bold cursor-pointer">[ BỎ QUA ]</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. MÀN HÌNH GAMEPLAY
// ==========================================
function GameplayTerminal() {
  const [timeInMins, setTimeInMins] = useState(23 * 60); 
  const [traceLevel, setTraceLevel] = useState(12); 
  const [cpu, setCpu] = useState(15); 
  const [mem, setMem] = useState(24); 
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false); // Trạng thái rung giật màn hình
  const [modules, setModules] = useState({ proxy: false, spoof: false, decrypt: false });
  const [gameStage, setGameStage] = useState('FIND_PORT'); 

  const [history, setHistory] = useState([
    { type: 'sys', time: formatTime(23*60), text: 'SHADOW-OS ĐÃ KHỞI ĐỘNG. MỤC TIÊU: MÁY CHỦ BẢO MẬT B4 CỦA FBI.' },
    { type: 'info', time: formatTime(23*60), text: 'Gõ lệnh `help` để xem danh sách công cụ khả dụng.' },
    { type: 'alert', time: formatTime(23*60), text: 'CẢNH BÁO: Tường lửa đang chặn cổng tiêu chuẩn. Cần tìm cổng dự phòng để kết nối (Gợi ý: Cổng là số nguyên tố lớn nhất từ 8000-8100).' }
  ]);
  
  const [input, setInput] = useState("");
  const endOfTerminalRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      endOfTerminalRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [history]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setCpu(c => Math.max(15, c - 5)); 
      setMem(m => Math.max(24, m - 2)); 
    }, 2000);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (cpu >= 100 || mem >= 100) {
      setIsOverloaded(true);
      playAudio('error');
      triggerShake();
      setTimeout(() => setIsOverloaded(false), 5000); 
    }
  }, [cpu, mem]);

  useEffect(() => {
    if (traceLevel >= 100 && !gameOver) {
      setGameOver(true);
      playAudio('error');
      setHistory(prev => [
        ...prev,
        { type: 'error', time: formatTime(timeInMins), text: '!!! BÁO ĐỘNG ĐỎ !!! MẠNG BỊ XUYÊN THỦNG.' },
        { type: 'kane', time: formatTime(timeInMins), text: '[ĐẶC VỤ KANE] Bắt được ông rồi, Giáo sư. Cảnh sát đang ập vào vị trí của ông.' },
        { type: 'sys', time: formatTime(timeInMins), text: 'KẾT NỐI BỊ NGẮT. GAME OVER.' }
      ]);
    }
  }, [traceLevel]);

  const playAudio = (type) => {
    const audio = document.getElementById(`sfx-${type}`);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(()=>{});
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400); // Rung trong 0.4s
  };

  const handleCommand = (e) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      if (gameOver) return;
      if (isOverloaded) {
        setInput("");
        return;
      }

      const rawInput = input.trim().toLowerCase();
      const args = rawInput.split(" ");
      const cmd = args[0];
      const param = args.slice(1).join(" ");
      
      let newTime = timeInMins + 1; 
      let newEntries = [{ type: 'user', time: formatTime(newTime), text: rawInput }];
      let cpuCost = 5;
      let memCost = 5;
      let traceMod = 0;
      let hasError = false;
      let hasSuccess = false;

      // Hỗ trợ song ngữ (Cả Tiếng Việt & Tiếng Anh)
      switch (cmd) {
        case 'help':
        case 'ls':
          newEntries.push(
            { type: 'info', text: 'DANH SÁCH LỆNH SHADOW-OS:' },
            { type: 'log', text: '- quet / scan [muc_tieu]   : Quét mạng (Tốn CPU).' },
            { type: 'log', text: '- ketnoi / connect [port]  : Xâm nhập vào cổng mạng.' },
            { type: 'log', text: '- dotnhap / breach [HH:MM] : Cài mã độc theo khung giờ.' },
            { type: 'log', text: '- kichhoat / act [mo-dun]  : Kích hoạt công cụ hỗ trợ (proxy, giamao).' },
            { type: 'log', text: '- clear                    : Xóa màn hình log.' }
          );
          break;

        case 'clear':
          setHistory([]);
          setInput("");
          return;

        case 'quet':
        case 'scan':
          cpuCost = 30;
          if (param === 'mang' || param === 'network' || param === 'b4') {
            newEntries.push(
              { type: 'sys', text: 'Đang quét cấu trúc mạng Tầng B4...' },
              { type: 'log', text: 'IP: 192.168.1.1 - Đóng' },
              { type: 'log', text: 'IP: 192.168.1.89 - Backdoor ẩn được mã hóa. Cổng (Port) là một số nguyên tố lớn nhất từ 8000-8100.' }
            );
          } else {
            hasError = true;
            newEntries.push({ type: 'warn', text: `LỖI: Không tìm thấy mục tiêu [${param}].` });
          }
          break;

        case 'kichhoat':
        case 'act':
          memCost = 25;
          if (param === 'proxy') {
            if (modules.proxy) {
              newEntries.push({ type: 'warn', text: 'PROXY đã hoạt động sẵn.' });
            } else {
              setModules({ ...modules, proxy: true });
              traceMod = -20;
              hasSuccess = true;
              newEntries.push({ type: 'success', text: 'Đã kích hoạt PROXY ẩn danh. Mức độ truy vết giảm mạnh.' });
            }
          } else if (param === 'giamao' || param === 'spoof') {
             if (gameStage === 'STAGE_2') {
                setModules({ ...modules, spoof: true });
                traceMod = -40; // Gỡ rối khi bị dồn vào chân tường
                hasSuccess = true;
                setGameStage('STAGE_3');
                newEntries.push(
                  { type: 'success', text: 'MÔ-ĐUN GIẢ MẠO ĐÃ KÍCH HOẠT. Tín hiệu giả đang được phát đi tại Tầng B1.' },
                  { type: 'kane', text: '[ĐẶC VỤ KANE] Có động tĩnh ở B1! Toàn đội cơ động chú ý, đổi hướng!' },
                  { type: 'sys', text: 'ĐÁNH LẠC HƯỚNG THÀNH CÔNG. Tường lửa cuối cùng bảo vệ Ổ cứng Lõi Đen đã lộ diện.' },
                  { type: 'alert', text: 'TÌNH BÁO: Sử dụng lệnh `giaima loiden` (decrypt loiden) để phá khóa.' }
                );
             } else {
                newEntries.push({ type: 'warn', text: 'Mô-đun GIẢ MẠO chưa cần thiết lúc này.' });
             }
          } else {
            hasError = true;
            newEntries.push({ type: 'error', text: 'LỖI: Không tìm thấy mô-đun.' });
            traceMod = 5; 
          }
          break;

        case 'ketnoi':
        case 'connect':
          cpuCost = 20;
          if (gameStage === 'FIND_PORT') {
            if (param === '8089') {
              hasSuccess = true;
              newEntries.push(
                { type: 'success', text: 'KẾT NỐI THÀNH CÔNG TỚI CỔNG 8089.' },
                { type: 'sys', text: 'ĐANG TẢI XUỐNG DỮ LIỆU NHẬT KÝ CA TRỰC...' },
                { type: 'log', text: '[23:00 - 23:15] Tuần tra Alpha.' },
                { type: 'log', text: '[23:15 - 23:20] Cập nhật Camera.' },
                { type: 'log', text: '[23:25 - 23:45] Tuần tra Beta.' },
                { type: 'alert', text: 'TÌNH BÁO: Sử dụng lệnh `dotnhap [HH:MM]` vào khoảng thời gian trống để cài Trojan.' }
              );
              setGameStage('FIND_TIME');
            } else {
              hasError = true;
              newEntries.push({ type: 'error', text: 'TỪ CHỐI KẾT NỐI. Cổng bị sai.' });
              traceMod = 15; 
            }
          } else {
            newEntries.push({ type: 'warn', text: 'Đã có kết nối nội bộ. Không cần gọi lệnh này nữa.' });
          }
          break;
          
        case 'dotnhap':
        case 'breach':
          cpuCost = 40;
          if (gameStage === 'FIND_TIME') {
            if (['23:21', '23:22', '23:23', '23:24'].includes(param)) {
              hasSuccess = true;
              traceMod = 65; // Đẩy truy vết lên cực cao tạo kịch tính
              newEntries.push(
                { type: 'success', text: `THỜI GIAN CHUẨN XÁC [${param}]. BẮT ĐẦU CÀI ĐẶT TROJAN...` },
                { type: 'sys', text: '10%.. 50%.. 100%. HOÀN TẤT.' },
                { type: 'error', text: 'CẢNH BÁO BẢO MẬT TỚI HẠN! LƯU LƯỢNG TRUY CẬP ĐÃ BỊ LỘ.' },
                { type: 'kane', text: '[ĐẶC VỤ KANE] Bắt được tín hiệu rồi! Khóa chặt Tầng B4 lại, nó đang ở ngay trong hệ thống!' },
                { type: 'alert', text: 'BÁO ĐỘNG ĐỎ: Lưới an ninh đang thắt chặt. Kích hoạt mô-đun `giamao` (spoof) ngay lập tức để đánh lạc hướng!' }
              );
              setGameStage('STAGE_2');
            } else {
              hasError = true;
              newEntries.push({ type: 'error', text: 'THẤT BẠI. Khung giờ này có cảnh sát tuần tra!' });
              traceMod = 25; 
            }
          } else {
            newEntries.push({ type: 'warn', text: 'Không khả dụng lúc này.' });
          }
          break;

        case 'giaima':
        case 'decrypt':
          cpuCost = 70;
          if (gameStage === 'STAGE_3' && param === 'loiden') {
            hasSuccess = true;
            newEntries.push(
              { type: 'success', text: 'ĐANG BẺ KHÓA LÕI ĐEN... THÀNH CÔNG!' },
              { type: 'sys', text: 'DỮ LIỆU ĐÃ ĐƯỢC TẢI XUỐNG MÁY CHỦ CỦA GIÁO SƯ.' },
              { type: 'alert', text: 'CHÚC MỪNG. BẠN ĐÃ CHIẾM ĐOẠT TOÀN BỘ QUYỀN KIỂM SOÁT. (Hết phần demo giải đố)' }
            );
          } else {
            hasError = true;
            newEntries.push({ type: 'error', text: 'File không tồn tại hoặc chưa đến lúc giải mã.' });
          }
          break;

        default:
          hasError = true;
          newEntries.push({ type: 'warn', text: `Lệnh '${cmd}' không được công nhận. Gõ 'help' để xem.` });
          traceMod = 2;
          break;
      }

      // Xử lý Audio & Shake
      if (hasError) {
        playAudio('error');
        triggerShake();
      } else if (hasSuccess) {
        playAudio('success');
      }

      newEntries.forEach((entry) => { if (entry.type !== 'user') entry.time = formatTime(newTime); });
      setTimeInMins(newTime);
      setHistory([...history, ...newEntries]);
      setInput("");
      setCpu(prev => Math.min(100, prev + cpuCost));
      setMem(prev => Math.min(100, prev + memCost));
      
      let finalTraceMod = traceMod;
      if (traceMod > 0 && modules.proxy) finalTraceMod = Math.floor(traceMod / 2);
      setTraceLevel(prev => Math.max(0, Math.min(100, prev + finalTraceMod)));
    }
  };

  const getTraceColor = () => {
    if (traceLevel < 50) return 'bg-amber-600';
    if (traceLevel < 80) return 'bg-orange-500';
    return 'bg-red-600 animate-pulse';
  };

  return (
    // Style động đất: Nếu isShaking = true thì áp dụng CSS translate giật sang 2 bên
    <div className={`w-full h-screen max-w-7xl flex gap-4 p-4 z-10 relative text-sm mt-8 transition-all duration-100 ${isShaking ? 'translate-x-2 -translate-y-1' : ''} ${traceLevel >= 80 ? 'shadow-[inset_0_0_150px_rgba(220,38,38,0.2)]' : ''}`}>
      
      {/* CỘT TRÁI: MAIN TERMINAL */}
      <div className={`flex-grow h-full bg-[#030303]/90 border ${traceLevel >= 80 ? 'border-red-900/60' : 'border-amber-900/60'} flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-md rounded-sm overflow-hidden relative transition-colors duration-500`}>
        
        {isOverloaded && <div className="absolute inset-0 bg-red-900/20 z-50 pointer-events-none flex items-center justify-center">
            <span className="text-red-500 font-bold text-2xl tracking-[0.3em] bg-black/80 px-6 py-2 border border-red-900 animate-pulse">HỆ THỐNG QUÁ TẢI - ĐANG LÀM MÁT</span>
        </div>}
        {gameOver && <div className="absolute inset-0 bg-red-950/80 z-50 flex items-center justify-center flex-col">
            <span className="text-red-500 font-bold text-4xl tracking-[0.5em] mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,1)]">BỊ BẮT</span>
            <span className="text-white">Truy vết đạt 100%. Lưới an ninh đã đóng.</span>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-900/50">KẾT NỐI LẠI TỪ ĐẦU</button>
        </div>}

        {/* Header Terminal */}
        <div className={`${traceLevel >= 80 ? 'bg-red-950/30 border-red-900/60' : 'bg-amber-950/30 border-amber-900/60'} border-b p-2 flex justify-between items-center px-4 transition-colors duration-500`}>
          <div className="flex gap-3 items-center">
            <span className={`w-2 h-2 rounded-full animate-pulse ${traceLevel >= 80 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            <span className={`${traceLevel >= 80 ? 'text-red-500' : 'text-amber-500'} font-bold tracking-widest text-xs`}>SHADOW-OS // GIAO THỨC TẤN CÔNG</span>
          </div>
          <div className="flex gap-6">
            <span className="text-amber-400 font-bold tracking-widest bg-amber-950/50 px-2 py-0.5 border border-amber-900/50">
              ĐỒNG HỒ PHI VỤ: {formatTime(timeInMins)}
            </span>
          </div>
        </div>

        {/* Nội dung Terminal */}
        <div className="flex-1 overflow-y-auto p-4 font-mono space-y-2 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent">
          {history.map((line, index) => (
            <div key={index} className={`flex gap-3 leading-relaxed
              ${line.type === 'error' ? 'text-red-500 font-bold' : ''}
              ${line.type === 'success' ? 'text-emerald-400 font-bold' : ''}
              ${line.type === 'sys' ? 'text-amber-600 font-bold' : ''}
              ${line.type === 'info' ? 'text-zinc-400' : ''}
              ${line.type === 'warn' ? 'text-orange-400' : ''}
              ${line.type === 'alert' ? 'text-red-400 font-bold bg-red-950/30 p-1 border-l-2 border-red-500' : ''}
              ${line.type === 'kane' ? 'text-white italic bg-red-900/40 p-1 border-l-2 border-red-600' : ''}
              ${line.type === 'user' ? 'text-zinc-300' : ''}
              ${line.type === 'log' ? 'text-zinc-400 pl-8' : ''}
            `}>
              {line.time && <span className="text-zinc-600 shrink-0 select-none">[{line.time}]</span>}
              <span className="break-words w-full">
                {line.type === 'user' ? (
                  <><span className="text-amber-700 mr-2">giao-su@shadow-os:~#</span>{line.text}</>
                ) : (
                  <span>{line.text}</span>
                )}
              </span>
            </div>
          ))}
          <div ref={endOfTerminalRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="bg-[#050505] p-3 border-t border-amber-900/60 flex items-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
          <span className="text-amber-600 font-bold mr-2 select-none">giao-su@shadow-os<span className="text-zinc-500">:~#</span></span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            disabled={isOverloaded || gameOver}
            className="flex-1 bg-transparent border-none outline-none text-amber-400 font-bold font-mono caret-amber-500 disabled:opacity-50"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="hidden md:flex w-80 flex-col gap-4">
        
        {/* TRUY VẾT */}
        <div className={`bg-[#030303]/80 border ${traceLevel >= 80 ? 'border-red-900/60' : 'border-amber-900/40'} rounded-sm p-4 h-1/3 flex flex-col relative overflow-hidden transition-colors duration-500`}>
          {traceLevel >= 80 && <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>}
          <h3 className={`text-xs font-bold border-b pb-2 mb-4 tracking-widest flex justify-between ${traceLevel >= 80 ? 'text-red-500 border-red-900/60' : 'text-amber-600 border-amber-900/40'}`}>
            <span>MỨC TRUY VẾT</span>
            <span>{traceLevel}%</span>
          </h3>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mb-4">
            <div className={`${getTraceColor()} h-full transition-all duration-500`} style={{ width: `${traceLevel}%` }}></div>
          </div>
          
          <div className="text-[10px] text-zinc-500 font-mono space-y-1">
            <p className={traceLevel >= 50 ? 'text-red-500 font-bold' : ''}>CẢNH SÁT: {traceLevel < 50 ? 'Đang phân tích...' : 'ĐANG ĐỊNH VỊ IP'}</p>
            <p>192.168.1.1 - <span className="text-red-900">ĐÃ CHẶN</span></p>
            <p>10.0.0.45 - <span className="text-amber-700">ĐANG MỞ</span></p>
          </div>
        </div>

        {/* TÀI NGUYÊN */}
        <div className="bg-[#030303]/80 border border-amber-900/40 rounded-sm p-4 flex-grow flex flex-col relative">
          {isOverloaded && <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>}
          <h3 className="text-amber-600 text-xs font-bold border-b border-amber-900/40 pb-2 mb-4 tracking-widest">TÀI NGUYÊN CỐT LÕI</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>CPU (Xử lý lệnh)</span>
                <span className={cpu >= 90 ? 'text-red-500 font-bold' : ''}>{cpu}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`${cpu >= 90 ? 'bg-red-500' : 'bg-amber-600'} h-full transition-all duration-300`} style={{ width: `${cpu}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>BỘ NHỚ (Mô-đun)</span>
                <span className={mem >= 90 ? 'text-red-500 font-bold' : ''}>{mem}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`${mem >= 90 ? 'bg-red-500' : 'bg-amber-700'} h-full transition-all duration-300`} style={{ width: `${mem}%` }}></div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-amber-900/30">
              <div className="text-[10px] text-amber-600 mb-2">MÔ-ĐUN HOẠT ĐỘNG:</div>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2 py-1 border text-[9px] ${modules.proxy ? 'bg-amber-900/50 border-amber-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}>
                  PROXY (ẨN DANH)
                </span>
                <span className={`px-2 py-1 border text-[9px] ${modules.spoof ? 'bg-amber-900/50 border-amber-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}>
                  GIẢ MẠO (SPOOF)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT GỐC
// ==========================================
export default function Case1412Main() {
  const [screen, setScreen] = useState('intro');

  return (
    <main className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-mono selection:bg-amber-900 selection:text-white">
      {/* KHO ÂM THANH SFX */}
      <audio id="typing-audio" src="/audio/typing.mp3" loop preload="auto" />
      <audio id="sfx-error" src="/audio/error.mp3" preload="auto" />
      <audio id="sfx-success" src="/audio/success.mp3" preload="auto" />

      {/* Hiệu ứng nền chung */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#050505] to-black pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 scanlines opacity-[0.15] pointer-events-none z-0"></div>

      {/* Chuyển đổi màn hình */}
      {screen === 'intro' ? (
        <IntroScreen onStartGame={() => setScreen('gameplay')} />
      ) : (
        <GameplayTerminal />
      )}
    </main>
  );
}