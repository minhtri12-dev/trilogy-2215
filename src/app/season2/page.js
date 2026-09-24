"use client";

import { useState, useEffect, useRef } from "react";

// ==========================================
// 🛠️ HOOK: HIỆU ỨNG GÕ CHỮ (TERMINAL)
// TODO: Mai mốt rảnh gom cái hook này với SS1 vào chung 1 file utils.js cho đỡ lặp code
// ==========================================
const useTerminalEffect = (text = "", speed = 15, delay = 0, skip = false) => {
  const [renderText, setRenderText] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    // Bấm skip là nhả full chữ luôn, khỏi đợi
    if (skip) {
      setRenderText(text);
      setIsPrinting(false);
      return;
    }
    
    setRenderText("");
    setIsPrinting(true);
    let i = 0;
    
    const timeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setRenderText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsPrinting(false);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, skip]);

  return { renderText, isPrinting };
};

// Wrapper Component hiển thị chữ
const TerminalText = ({ text = "", speed = 15, delay = 0, className, skip = false, noCursor = false, noGlow = false }) => {
  const { renderText, isPrinting } = useTerminalEffect(text, speed, delay, skip);
  const glowClass = noGlow ? "" : "[text-shadow:0_0_8px_currentColor]";
  
  return (
    <span className={`${className || ""} ${glowClass} transition-all`}>
      {renderText}
      {!noCursor && (
        <span className={`inline-block w-2 h-4 ml-1 bg-current align-middle ${isPrinting ? "animate-pulse" : "opacity-0"}`}></span>
      )}
    </span>
  );
};

// ==========================================
// 🎮 MAIN GAME COMPONENT - TRILOGY 2215 SS2
// ==========================================
export default function Season2() {
  const [locale, setLocale] = useState("vi");
  const [gameStage, setGameStage] = useState(-3); 
  const [activeDoc, setActiveDoc] = useState(null); // Side-panel evidence
  const [skipAll, setSkipAll] = useState(false);
  
  // --- AUDIO & SFX (Dùng useRef để tránh re-render giật lag) ---
  const audioRef = useRef(null);
  const sfxRef = useRef(null);
  const [soundOff, setSoundOff] = useState(true);

  // --- TRẠNG THÁI P1 (Barcode) ---
  const [ans_P1_code, setAns_P1_code] = useState("");
  const [errAlertP1, setErrAlertP1] = useState("");
  const [ans_P1_final, setAns_P1_final] = useState("");
  const [lives_P1, setLives_P1] = useState(3);
  const [shake_P1, setShake_P1] = useState(false); // Cờ rung màn hình

  // --- TRẠNG THÁI P2 (SCADA Tunnel) ---
  const [ans_P2_override, setAns_P2_override] = useState("");
  const [errAlertP2, setErrAlertP2] = useState("");
  const [lives_P2, setLives_P2] = useState(3);
  const [shake_P2, setShake_P2] = useState(false);
  const [scadaTimer, setScadaTimer] = useState(300); // 5 phút

  // --- TRẠNG THÁI P3 (Boss Fight) ---
  const [ans_P3_prime, setAns_P3_prime] = useState("");
  const [errAlertP3, setErrAlertP3] = useState("");
  const [lives_Boss, setLives_Boss] = useState(3);
  const [shake_Boss, setShake_Boss] = useState(false);

  // --- HỆ THỐNG LẮNG NGHE PHÍM ---
  useEffect(() => {
    const handleEsc = (e) => {
      // Bấm ESC đóng panel cho tiện
      if (e.key === 'Escape' && activeDoc) setActiveDoc(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeDoc]);

  // Enter để quất luôn vô game
  useEffect(() => {
    const handleEnterStart = (e) => {
      if (gameStage === -3 && e.key === 'Enter') {
        setSoundOff(false);
        setGameStage(-2);
      }
    };
    window.addEventListener('keydown', handleEnterStart);
    return () => window.removeEventListener('keydown', handleEnterStart);
  }, [gameStage]);

  // Init Audio object 1 lần lúc mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = 0.65;
      }
      if (!sfxRef.current) {
        sfxRef.current = new Audio();
        sfxRef.current.loop = true;
        sfxRef.current.volume = 0.5; // Nhỏ thôi kẻo điếc tai
      }
    }
  }, []);

  // --- ĐIỀU PHỐI BGM (Nhạc nền) ---
  useEffect(() => {
    if (audioRef.current) {
      let nextSrc = "/p1ss2.mp3";
      if (gameStage >= 16) nextSrc = "/boss_bgm.mp3";
      else if (gameStage >= 7 && gameStage < 16) nextSrc = "/p2ss2.mp3";

      if (!audioRef.current.src.includes(nextSrc)) {
        audioRef.current.src = nextSrc;
        if (!soundOff) audioRef.current.play().catch(e => console.log("Trình duyệt block autoplay bgm r:", e));
      }
    }
  }, [gameStage, soundOff]);

  // --- ĐIỀU PHỐI SFX (Hiệu ứng Súng / Mưa) ---
  useEffect(() => {
    if (sfxRef.current) {
      if (gameStage === 17 || gameStage === 18) {
        // Cảnh trong kho: Súng máy bòm bòm
        if (!sfxRef.current.src.includes("sfx_gunfire.mp3")) sfxRef.current.src = "/sfx_gunfire.mp3";
        if (!soundOff) sfxRef.current.play().catch(e => console.log("Block sfx:", e));
      } else if (gameStage === 19 || gameStage === 20) {
        // Cảnh đường băng: Mưa lâm râm
        if (!sfxRef.current.src.includes("sfx_rain.mp3")) sfxRef.current.src = "/sfx_rain.mp3";
        if (!soundOff) sfxRef.current.play().catch(e => console.log("Block sfx:", e));
      } else {
        sfxRef.current.pause();
      }
    }
  }, [gameStage, soundOff]);

  // Mute tổng (Global)
  useEffect(() => {
    if (audioRef.current) soundOff ? audioRef.current.pause() : audioRef.current.play().catch(e => console.log(e));
    if (sfxRef.current) {
      if (soundOff) sfxRef.current.pause();
      else if (gameStage >= 17) sfxRef.current.play().catch(e => console.log(e));
    }
  }, [soundOff, gameStage]);

  useEffect(() => { setSkipAll(false); }, [gameStage]);

  // --- ĐẾM NGƯỢC SCADA (P2) ---
  useEffect(() => {
    let timer = null;
    // Đừng trừ giờ nếu user đang đọc tài liệu (activeDoc)
    if (gameStage === 8 && scadaTimer > 0 && !activeDoc) {
      timer = setInterval(() => setScadaTimer((prev) => prev - 1), 1000);
    } else if (gameStage === 8 && scadaTimer <= 0) {
      setGameStage(14); // Nổ hầm
    }
    return () => clearInterval(timer);
  }, [gameStage, scadaTimer, activeDoc]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const triggerShake = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 300);
  };

  // ==========================================
  // 📚 TỪ ĐIỂN DATA (Giữ nguyên văn text cốt truyện)
  // ==========================================
  const content = {
    vi: {
      langBtn: "LANG: [VI]",
      backToDocsBtn: "[ QUAY LẠI HỒ SƠ ]",
      btnReturnS2: "[ VỀ ĐẦU SEASON 2 ]",
      btnReplayBoss: "[ CHƠI LẠI TRẬN BOSS ]",
      btnShutdown: "[ KẾT THÚC HỆ THỐNG ]",
      cinematicLines: [
        "Washington DC, 2010.",
        "7 năm kể từ khi chuỗi án mạng khép lại. 7 năm kể từ viên đạn định mệnh xuyên qua vai trái của kẻ sát nhân.",
        "Thế giới giờ đây được vận hành bởi mã hóa, kết nối mạng và những cỗ máy được cho là không biết nói dối.",
        "Nhưng điều gì sẽ xảy ra... khi chính dữ liệu nền tảng bị đầu độc?",
        "Một hồ sơ án mạng phòng kín hoàn hảo. Một chiếc mặt nạ nhuốm máu được gửi thẳng đến bàn làm việc của Đặc vụ Holmes.",
        "ZODIAC ĐÃ TRỞ LẠI.",
        "Lần này, hắn không thèm dùng súng đạn. Hắn dùng chính sự tin tưởng vào công nghệ để giết người."
      ],
      bootTermLines: [
        "[ SECURE BOOT v7.1.0 ]",
        "WARNING: ANOMALY DETECTED...",
        "IDENTITY VERIFICATION",
        "████████████████████ 100%",
        "WELCOME, AGENT HOLMES."
      ],
      profTitle: "[ HỒ SƠ NHÂN SỰ LƯU TRỮ - FBI ]",
      profLine1: "Định danh: HOLMES (Mã: FBI-H900)",
      profLine2: "Chức vụ: Đặc vụ Cấp cao - Đội Điều Tra Tội Phạm Công Nghệ Cao",
      profLine3: "Bảo mật: Cấp 6 (Tối Mật)",
      profHeader: "[ TÓM TẮT HỒ SƠ ]",
      profP1: "Holmes là huyền thoại của FBI, người duy nhất từng đánh bại bẫy logic của Zodiac 7 năm trước.",
      profP2: "Zodiac đã sống sót sau phát đạn của Holmes. Suốt 7 năm qua, hắn ẩn mình, học cách thao túng vạn vật qua mạng lưới hệ thống điện tử (IoT).",
      profP3: "Trận chiến này không còn giới hạn ở hiện trường vật lý. Nó là cuộc chiến của Dữ liệu, Trí tuệ và Sinh mạng hàng loạt.",
      profBtn: "[ XÁC NHẬN DANH TÍNH & BẮT ĐẦU ]",
      introTitle: "SEASON 2: KIẾN TRÚC SƯ HỖN MANG",
      introSub: "Hệ thống Kết nối mã hóa. Quyền truy cập: Holmes.",
      bootLogs: [
        "Báo động: Tín hiệu lạ được phát hiện trong mạng lưới Y tế thành phố...",
        "Lỗ hổng cơ sở dữ liệu bệnh viện Trung ương...",
        "Chào mừng trở lại, Đặc vụ Holmes.",
        "Đang trích xuất hồ sơ: 'Vụ án Mã vạch Tử thần'...",
        "Dữ liệu đã sẵn sàng. Vui lòng truy cập."
      ],
      startButton: "[ TRUY CẬP VỤ ÁN SỐ 1 ]",
      exitBtn: "[ THOÁT HỆ THỐNG ]",
      
      // P1
      title: "VỤ ÁN 1: MÃ VẠCH TỬ THẦN",
      subtitle: "[PHẦN 1: KẺ GIẾT NGƯỜI VÔ HÌNH]",
      briefingTitle: ">> DATA STREAM: ÁN MẠNG PHÒNG VIP <<",
      briefingLines: [
        "NẠN NHÂN: Thượng nghị sĩ Robert.",
        "HIỆN TRƯỜNG: Tử vong do sốc thuốc (bị truyền Kali Clorua nguyên chất vào máu).",
        "TIẾN TRÌNH: Y tá trực ca Sarah bị bắt quả tang vì là người trực tiếp cắm túi dịch truyền.",
        "NÚT THẮT CHÍ TỬ: Y tá Sarah hoảng loạn khai rằng: Cô dùng máy quét tia laser quét lên túi thuốc, màn hình máy quét hiện rõ ràng dòng chữ màu xanh: 'Nước biển sinh lý - An toàn'.",
        "LỜI NHẮN TỪ ZODIAC: 'Máy móc luôn trung thực, Holmes. Nhưng thuật toán của chúng thì đầy lỗ hổng. Hãy nhìn vào những con số, chúng đang giấu giếm điều gì?'"
      ],
      cards: [
        { id: 1, title: "[QUY TẮC MÃ VẠCH]", tag: "CHECKSUM RULE", desc: "Sổ tay kỹ thuật về thuật toán nhận diện mã vạch của Bệnh viện Trung ương.", detail: "GIAO THỨC KIỂM TRA LỖI (CHECKSUM):\n- Mỗi túi thuốc có một mã vạch gồm 5 chữ số.\n- Chữ số cuối cùng là Số Kiểm Tra (Checksum). Nó bắt buộc phải bằng TỔNG của 4 chữ số đầu tiên cộng lại.\n- Ví dụ: Thuốc An thần có gốc là '1112' -> Số kiểm tra là 1+1+1+2 = 5 -> Mã vạch chuẩn in ra nilon sẽ là '11125'.\n- Nếu Số Kiểm Tra bị sai lệch, máy quét sẽ báo lỗi hệ thống màu đỏ." },
        { id: 2, title: "[BÁO CÁO KHO DƯỢC]", tag: "DRUG: KCL", desc: "Kiểm tra dữ liệu gốc của loại chất độc Kali Clorua gây chết người.", detail: "DỮ LIỆU KHO DƯỢC PHẨM (#MED-99):\n- Chất độc được tìm thấy trong túi truyền là Kali Clorua nguyên chất.\n- Truy cập vào máy chủ kho dược, gốc 4 chữ số định danh của Kali Clorua là: 5013.\n- Theo quy tắc an toàn, robot sẽ tự động tính toán số kiểm tra và in mã vạch dán lên túi thuốc này." },
        { id: 3, title: "[NHẬT KÝ MÁY QUÉT]", tag: "SCANNER LOG", desc: "Dữ liệu trích xuất từ tia laser máy quét cầm tay của cô y tá Sarah.", detail: "LỊCH SỬ MÁY QUÉT CẦM TAY (#SCAN-404):\n- Thời gian quét: 20:55.\n- Mắt laser đã đọc chính xác dải mã vạch được in trên túi thuốc là: 50136.\n- Kết quả trả về trên màn hình: 'Nước biển sinh lý 0.9% - An toàn'.\n- PHÂN TÍCH CỦA HOLMES: Zodiac đã hack máy in. Gốc 5013 là thuốc độc, nhưng hắn ép máy in in số kiểm tra cuối cùng thành '6' thay vì số đúng. Việc sai lệch Checksum này không làm máy báo lỗi, mà lại kích hoạt một lỗ hổng (Buffer Overflow) trong máy quét, khiến nó bị lừa và văng ra kết quả an toàn!" }
      ],
      openBoardBtn: "[ TRUY CẬP TRẠM PHÂN TÍCH DỮ LIỆU ]",
      p1BoardTitle: ">> HỆ THỐNG KIỂM TRA TOÀN VẸN (INTEGRITY CHECK) <<",
      p1BoardDesc: "Zodiac đã qua mặt thuật toán Checksum của máy quét bằng một dải mã vạch lỗi: 50136.\n\nĐể hệ thống ghi nhận lỗ hổng và giải oan cho cô y tá, Đặc vụ Holmes cần tự tính toán lại tính toàn vẹn của dữ liệu.\n\nHãy đối chiếu [QUY TẮC MÃ VẠCH] và [BÁO CÁO KHO DƯỢC], sau đó nhập MÃ VẠCH CHUẨN (5 chữ số) chưa bị Zodiac làm giả của túi thuốc Kali Clorua:",
      p1BoardPlaceholder: "Nhập mã vạch chuẩn 5 chữ số...",
      p1BoardSubmit: "[ KẾT XUẤT LỖI DỮ LIỆU ]",
      conclusionTitle: ">> BƯỚC CUỐI: CHỈ ĐỊNH PHƯƠNG THỨC <<",
      conclusionText: "Mã vạch chuẩn 50139 đã được xác thực!\n(Giải thích: 5 + 0 + 1 + 3 = 9). Bằng cách hack hệ thống để in số 6 thay vì số 9 ở cuối mã vạch, Zodiac đã ép phần mềm của máy quét rơi vào trạng thái ngoại lệ (Exception Error) và đánh lừa cả bệnh viện.\n\nĐể khép lại hồ sơ giải oan cho y tá, hãy nhập tên của kỹ thuật (hoặc công nghệ) được dùng ở chữ số cuối cùng mà Zodiac đã lợi dụng để hack:",
      submitBtn: "[ CHỐT ÁN & MINH OAN ]",
      gameOverTitle: "HỆ THỐNG ĐÃ BỊ KHOÁ",
      gameOverDesc: "LẬP LUẬN THẤT BẠI. DỮ LIỆU ĐÃ BỊ ZODIAC XÓA SẠCH VĨNH VIỄN.",
      rebootBtn: "[ KHÔI PHỤC BẢN SAO LƯU ]",
      victoryTitle: "SỰ THẬT PHƠI BÀY",
      victoryDesc: "Tuyệt vời, Đặc vụ Holmes! Bằng chứng mã kiểm tra (Checksum) bị làm giả đã giải oan cho cô y tá Sarah. Zodiac đã dùng lỗ hổng của sự phụ thuộc vào công nghệ để giết người mà không cần có mặt.\n\nNgay khi Sarah được thả tự do, màn hình máy tính của Holmes bỗng chớp tắt. Nhạc chuông điện thoại vang lên. Một dãy số lạ.\n\n'Khá khen cho ngươi, Holmes. Ngươi đã cứu được một con tốt.' Giọng nói bị bóp méo điện tử của Zodiac vang lên. 'Nhưng hãy xem, bộ óc của ngươi có thể giải quyết được hàng ngàn sinh mạng đang kẹt trong một cái bẫy bằng sắt không?'\n\nTín hiệu định vị khẩn cấp báo về từ Hầm vượt sông Trung tâm thành phố. Đèn giao thông tê liệt. Một thảm họa khổng lồ sắp xảy ra...",
      unlockBtn: "[ MỞ KHÓA PHẦN 2: MA TRẬN ĐÈN ĐỎ ]",

      // P2
      p2Title: "VỤ ÁN 2: MA TRẬN ĐÈN ĐỎ",
      p2Subtitle: "[PHẦN 2: ÁP LỰC 50.000 SINH MẠNG]",
      p2BriefingTitle: ">> DATA STREAM: HẦM VƯỢT SÔNG <<",
      p2BriefingLines: [
        "ĐỊA ĐIỂM: Hầm vượt sông Trung tâm thành phố, dài 3km.",
        "TÌNH TRẠNG HIỆN TẠI: Zodiac đã xâm nhập vào hệ thống SCADA. Hắn khóa toàn bộ đèn ở hai đầu hầm thành ĐỎ, giam lỏng một đoàn xe buýt học sinh và một chiếc xe bồn chở xăng 20.000 Lít ở giữa hầm.",
        "MỐI ĐE DỌA CẤP BÁCH: Quạt thông gió hầm đã bị tắt. Trong đúng 5 PHÚT nữa, Zodiac sẽ chuyển toàn bộ đèn thành XANH đồng loạt. Hàng ngàn chiếc xe đang điên cuồng bóp còi phía trên sẽ lao dốc xuống hầm tối với tốc độ cao, đâm sầm vào xe bồn tạo ra biển lửa khổng lồ.",
        "MỤC TIÊU CỦA HOLMES: Truy cập vào Bảng Ghi đè Khẩn cấp. Chỉ có thể nhập mật mã định tuyến để vô hiệu hóa lệnh của Zodiac."
      ],
      p2Cards: [
        { id: 201, title: "[TRẠM THEO DÕI TÍN HIỆU]", tag: "TRAFFIC_MAP", desc: "Màn hình radar hiển thị 3 làn đường dẫn xuống hầm. Mỗi làn có 3 đèn giao thông đang sáng/tắt bất thường.", detail: "PHÂN TÍCH QUANG HỌC SCADA:\nNhững bóng đèn không bị hỏng, chúng đang biểu thị mã Nhị phân (Binary Code) cơ bản của máy tính.\n- Đèn ĐỎ sáng [🔴] = Số 1\n- Đèn TẮT đen [⚫] = Số 0\n\nLÀN 1: [🔴] - [⚫] - [🔴]\nLÀN 2: [🔴] - [🔴] - [🔴]\nLÀN 3: [⚫] - [🔴] - [⚫]" },
        { id: 202, title: "[GIAO THỨC SCADA]", tag: "SYSTEM RULES", desc: "Hệ thống yêu cầu nhập 3 con số thập phân (Decimal) để ghi đè 3 dòng mã nhị phân của kẻ tấn công.", detail: "SỔ TAY CƠ SỞ DỮ LIỆU SCADA:\n- Để dịch mã Nhị phân (Binary) sang Thập phân (Decimal) với 3 bit:\nVí dụ: 011 = (0*4) + (1*2) + (1*1) = 3\nVí dụ: 100 = (1*4) + (0*2) + (0*1) = 4\n- Holmes, hãy tính toán giá trị Thập phân của 3 Làn đèn nhị phân trong trạm theo dõi và ráp chúng lại thành 1 chuỗi 3 chữ số liên tiếp." },
        { id: 203, title: "[LỜI CHẾ NHẠO]", tag: "ZODIAC'S VOICE", desc: "Đoạn ghi âm lặp đi lặp lại qua bộ đàm cảnh sát.", detail: "'Tích tắc, tích tắc, Holmes. Xe bồn đang rỉ xăng. Những đứa trẻ đang khóc. Máy tính chỉ hiểu số 0 và số 1. Ngươi có hiểu ngôn ngữ của Tử thần không?'" }
      ],
      p2OpenTerminal: "[ KÍCH HOẠT HỆ THỐNG GHI ĐÈ KHẨN CẤP ]",
      p2TerminalTitle: ">> BẢNG GHI ĐÈ ĐỊNH TUYẾN (OVERRIDE MATRIX) <<",
      p2TerminalDesc: "HỆ THỐNG ĐANG ĐẾM NGƯỢC TỚI THẢM HỌA. Hãy đối chiếu Bằng chứng [TRẠM THEO DÕI TÍN HIỆU]. Dịch 3 chuỗi đèn nhị phân (Đỏ=1, Tắt=0) của 3 làn đường sang hệ thập phân và nhập mã 3 chữ số để khóa tín hiệu:",
      p2Placeholder: "C:\\ZODIAC_OVERRIDE> Nhập mã 3 chữ số...",
      p2Submit: "[ CẮT ĐỨT KẾT NỐI ]",

      p2TransitionTitle: "TÍN HIỆU TỪ ĐỊA NGỤC",
      p2TransitionDesc: "Mã Ghi đè: 572 được chấp nhận!\nHệ thống đèn giao thông nháy vàng thủ công. Rào chắn cơ học hạ xuống, dòng xe điên cuồng được ngăn lại. Thảm họa đã bị dập tắt.\n\nNhưng ngay khi cửa sổ lệnh đóng lại, thuật toán truy vết ngược (Reverse Traceroute) mà Holmes cài cắm suốt 7 năm qua cuối cùng cũng bắt được IP thực của Zodiac. Hắn đã sơ suất trong khoảnh khắc tức giận.\n\nTọa độ chỉ thẳng đến Hangar 04 (Nhà kho máy bay bỏ hoang) ở rìa sân bay quốc tế. Một chiếc phản lực đang làm nóng động cơ, sẵn sàng tẩu thoát đến quốc gia không có hiệp ước dẫn độ.\n\nKhông có thời gian đợi chi viện lớn. Holmes rút súng, ra hiệu cho Đội Đặc Nhiệm Alpha (gồm Đội trưởng Miller, Hayes và Ramirez) lập tức lên đường.",
      p2TransitionBtn: "[ TIẾN ĐÁNH HANGAR 04 ]",

      // P3 - BOSS FIGHT 
      p3Title: "HỒI KẾT: CHUYẾN BAY CUỐI CÙNG",
      p3Subtitle: "[PHẦN 3: TỬ ĐỊA]",
      p3BriefingTitle: ">> ĐỘT KÍCH HANGAR 04 <<",
      p3BriefingDesc: "Đội Alpha vừa cạy tung lớp cửa thép khổng lồ và bước vào nhà kho tối đen như mực. Bất ngờ, nguồn điện ngắt. Cánh cửa thép hàng tấn thả sập xuống rầm rầm. Bóng tối bao trùm tuyệt đối.\n\nGiọng nói bóp méo của Zodiac vang lên từ hệ thống loa rè:\n'Ngươi nghĩ thuật toán của ngươi đủ sức bẫy ta sao, Holmes? Ta cố tình để ngỏ cánh cửa đó đấy. Chào mừng đến với phòng thí nghiệm cuối cùng.'\n\nNhững tia laser đỏ rực đột ngột quét qua màn đêm. Những chiếc Drone công nghiệp gắn lưỡi cưa thả xuống từ trần nhà. Ramirez bị nghiền nát đầu tiên. Hayes định ném lựu đạn EMP nhưng ánh chớp vừa lóe lên đã làm lộ vị trí. Một tháp súng máy tự động (Automated Turret) nã đạn xuyên thủng ngực Hayes.\n\nChỉ còn Holmes và Miller kịp lao vào nấp sau một khối container thép, trong khi súng máy vẫn xả đạn điên cuồng bủa vây...",
      p3BriefingBtn: "[ CỐ GẮNG SINH TỒN ]",

      p3SurvivalTitle: ">> HỆ THỐNG PHÒNG NGỰ TỰ ĐỘNG <<",
      p3SurvivalDesc: "Cửa thoát hiểm bị khóa bằng bàn phím cơ. Bất kỳ ai ló mặt ra đều sẽ bị tháp súng quét trúng.\n\nHolmes nhắm mắt lại. Trong khoảnh khắc thập tử nhất sinh, anh nhận ra tiếng súng máy không xả đạn bừa bãi. Nó tuân theo một thuật toán. Zodiac chế nhạo qua loa:\n\n'Thiên nhiên luôn có những con số hoàn hảo, không thể bị chia cắt. Hãy tìm ra 2 mảnh ghép tiếp theo của sự hoàn hảo đó để mở cửa, hoặc chết.'\n\nHãy lắng nghe chuỗi nhịp xả đạn của tháp súng. Chúng đại diện cho chuỗi số nguyên tố (Prime Numbers). Hãy tìm 2 số nguyên tố tiếp theo để tạo thành mật mã 4 chữ số:",
      p3Gunfire: "[💥] 2 NHÁT ĐẠN...\n[⌛] (nghỉ 2 giây)\n[💥] 3 NHÁT ĐẠN...\n[⌛] (nghỉ 2 giây)\n[💥] 5 NHÁT ĐẠN...\n[⌛] (nghỉ 2 giây)\n[💥] 7 NHÁT ĐẠN...\n[⌛] (tháp súng đang nạp lại - Yêu cầu 2 chuỗi nhịp tiếp theo)",
      p3Placeholder: "Nhập mã 4 chữ số (2 số nguyên tố tiếp theo)...",
      p3Submit: "[ NHẬP MÃ & MỞ CỬA ]",

      p3SacrificeTitle: ">> SỰ HY SINH CỦA MILLER <<",
      p3SacrificeDesc: "Mật mã 1113 chính xác!\nNhưng bàn phím nằm ở khu vực trống trải. Cần một người làm mồi nhử hỏa lực, người còn lại chạy ra nhập mã.\n\nMiller nhìn Holmes, mỉm cười cay đắng: 'Thế giới này cần trí thông minh và sự lập luận sắc bén của cậu hơn là một lão già chỉ biết chinh chiến như tôi. Cậu đã sai một lần khi để mất gia đình 7 năm trước, đừng sai lầm thêm lần nào nữa.'\n\nKhông để Holmes kịp cản, Miller lao ra ngoài, xả súng trường liên tục để thu hút toàn bộ laser. Đạn găm vào người ông hết viên này đến viên khác, máu nhuộm đỏ quân phục, nhưng ông vẫn gầm lên: 'CHẠY ĐI, HOLMES!'\n\nHolmes trượt trên vũng máu, đập mạnh mật mã vào bàn phím và kéo cần gạt. Cửa hé mở. Nhưng Miller đã khụy xuống. Lão đội trưởng ấn nút Emergency Lockdown, nhốt mình lại cùng lũ quái vật cơ khí để bảo vệ Holmes.\n\nChỉ duy nhất Holmes lọt qua được khe cửa, lao ra ngoài đường băng...",
      p3SacrificeBtn: "[ LAO RA ĐƯỜNG BĂNG ]",

      p3TarmacTitle: ">> BẢN ÁN DƯỚI MƯA <<",
      p3TarmacDesc: "Bên ngoài, trời đổ mưa tầm tã. Zodiac đang bước lên những bậc thang cuối cùng của chiếc phản lực, đinh ninh đám cảnh sát đã bị thịt nát xương tan.\n\nHắn không ngờ một bóng ma đẫm máu xuất hiện từ màn mưa. Holmes rút khẩu GLOCK 19M, ngắm thẳng vào Zodiac. Đôi mắt Zodiac mở to kinh hãi.\n\n'Ngươi giải được mọi bẫy của ta, Holmes... nhưng nhìn lại đi! Ngươi cứu được những kẻ vô danh ngoài kia, nhưng lại bỏ những người thân cận nhất chết trong vũng máu. Cô độc chưa, thám tử?'\n\nHolmes lặng lẽ lên nòng súng. Giọng nói trầm đục vang lên trong tiếng sấm:\n'Ta không cần cô độc. Ta chỉ mang đến cho ngươi sự yên lặng vĩnh viễn.'",
      p3TarmacBtn: "[ BÓP CÒI ]",

      p3EndingTitle: "THERE ARE NO WINNERS IN CHAOS",
      p3EndingDesc: "ĐOÀNG! ĐOÀNG! ĐOÀNG!\n\nBa phát đạn găm thẳng vào ngực và giữa trán Zodiac. Hắn ngã ngửa, lộn nhào xuống những bậc thang sắt và chết gục trong vũng nước mưa.\n\nHolmes lê bước đến bên thi thể, gỡ chiếc mặt nạ ra, ném nó xuống đường băng rồi khụy ngã. Tiếng còi cảnh sát hú vang vọng từ xa.\n\nĐặc vụ Holmes ngồi lặng thinh, nắm chặt chiếc thẻ bài quân nhân của Miller. Công lý đã được thực thi, nhưng cái giá phải trả là sự hủy diệt tâm hồn của chính người gác đền.\n\nVụ án lớn nhất thế kỷ, chính thức khép lại.",
      p3EndingFooter: "TRILOGY-2215 CHÍNH THỨC KẾT THÚC",
      footer: "KỊCH BẢN DO MINH TRÍ BIÊN SOẠN"
    },
    en: {
      langBtn: "LANG: [EN]",
      backToDocsBtn: "[ BACK TO DOSSIER ]",
      btnReturnS2: "[ RETURN TO S2 START ]",
      btnReplayBoss: "[ REPLAY BOSS FIGHT ]",
      btnShutdown: "[ SYSTEM SHUTDOWN ]",
      cinematicLines: [
        "Washington DC, 2010.",
        "7 years since the murder chain ended. 7 years since the fateful bullet pierced the killer's left shoulder.",
        "The world is now run by encryption, networks, and machines believed to never lie.",
        "But what happens... when the foundational data itself is poisoned?",
        "A perfect locked-room murder file. A bloody mask delivered straight to Agent Holmes's desk.",
        "ZODIAC HAS RETURNED.",
        "This time, he doesn't need guns. He uses society's trust in technology to kill."
      ],
      bootTermLines: [
        "[ SECURE BOOT v7.1.0 ]",
        "WARNING: ANOMALY DETECTED...",
        "IDENTITY VERIFICATION",
        "████████████████████ 100%",
        "WELCOME, AGENT HOLMES."
      ],
      profTitle: "[ ARCHIVED PERSONNEL FILE - FBI ]",
      profLine1: "Designation: HOLMES (ID: FBI-H900)",
      profLine2: "Role: Senior Agent - Cyber Crime Division",
      profLine3: "Clearance: Level 6 (Top Secret)",
      profHeader: "[ PSYCHOLOGICAL PROFILE ]",
      profP1: "Holmes is an FBI legend, the only one to break Zodiac's logic traps 7 years ago.",
      profP2: "Zodiac survived Holmes's gunshot. For 7 years, he hid and learned to manipulate everything through the IoT network.",
      profP3: "This battle is no longer bound to a physical crime scene. It's a war of Data, Intellect, and mass casualties.",
      profBtn: "[ CONFIRM IDENTITY & INITIATE ]",
      introTitle: "SEASON 2: THE ARCHITECT OF CHAOS",
      introSub: "Encrypted Network. Access granted: Holmes.",
      bootLogs: [
        "Alert: Unknown signal detected in City Medical Network...",
        "Central Hospital database vulnerability found...",
        "Welcome back, Agent Holmes.",
        "Extracting file: 'The Lethal Barcode'...",
        "Data ready. Please access carefully."
      ],
      startButton: "[ ACCESS CASE 01 ]",
      exitBtn: "[ LOGOUT SYSTEM ]",
      title: "CASE 1: THE LETHAL BARCODE",
      subtitle: "[PART 1: THE INVISIBLE KILLER]",
      briefingTitle: ">> DATA STREAM: VIP ROOM MURDER <<",
      briefingLines: [
        "VICTIM: Senator Robert.",
        "SCENE: Died via lethal injection (Potassium Chloride injected directly into bloodstream).",
        "PROGRESS: The on-duty nurse, Sarah, was arrested red-handed.",
        "THE CATCH: Nurse Sarah panicked and stated: She used a handheld laser scanner on the IV bag. The screen clearly displayed green text: 'Saline Solution - Safe'.",
        "ZODIAC'S MESSAGE: 'Machines are always honest, Holmes. But their algorithms are flawed. Look at the numbers, what are they hiding?'"
      ],
      cards: [
        { id: 1, title: "[CHECKSUM RULE]", tag: "ALGORITHM", desc: "Technical manual regarding the Hospital's barcode recognition algorithm.", detail: "ERROR CHECKING PROTOCOL (CHECKSUM):\n- Every drug bag has a 5-digit barcode.\n- The last digit is the Checksum. It MUST equal the SUM of the first 4 digits.\n- Example: Sedative base '1112' -> Checksum is 1+1+1+2 = 5 -> Standard printed barcode is '11125'.\n- If the Checksum is wrong, the scanner will flash a red system error." },
        { id: 2, title: "[PHARMACY DATABASE]", tag: "DRUG: KCL", desc: "Checking the original base data for the lethal Potassium Chloride.", detail: "PHARMACY INVENTORY DATA (#MED-99):\n- The poison found in the IV bag was pure Potassium Chloride.\n- Accessing the database, the 4-digit base ID for Potassium Chloride is: 5013.\n- Under safety protocols, the robot automatically calculates the checksum and prints the barcode on the bag." },
        { id: 3, title: "[SCANNER LOGS]", tag: "SCANNER LOG", desc: "Data extracted from the laser of Nurse Sarah's handheld scanner.", detail: "HANDHELD SCANNER HISTORY (#SCAN-404):\n- Scan time: 20:55.\n- The laser accurately read the printed barcode on the bag as: 50136.\n- Result displayed on screen: 'Saline 0.9% - Safe'.\n- HOLMES'S ANALYSIS: Zodiac hacked the printer. The base 5013 is poison, but he forced the printer to print the final checksum as '6' instead of the correct number. This Checksum mismatch did not cause a red error, but triggered a Buffer Overflow vulnerability in the scanner, causing it to glitch and display a safe result!" }
      ],
      openBoardBtn: "[ ACCESS DATA ANALYZER ]",
      p1BoardTitle: ">> INTEGRITY CHECK SYSTEM <<",
      p1BoardDesc: "Zodiac bypassed the scanner's Checksum algorithm using a flawed barcode: 50136.\n\nTo patch the vulnerability and clear the nurse, Agent Holmes needs to manually recalculate the data integrity.\n\nReview the [CHECKSUM RULE] and [PHARMACY DATABASE], then input the CORRECT BARCODE (5 digits) of the Potassium Chloride bag before Zodiac forged it:",
      p1BoardPlaceholder: "Enter correct 5-digit barcode...",
      p1BoardSubmit: "[ EXTRACT DATA ERROR ]",
      conclusionTitle: ">> FINAL STEP: EXPOSING THE METHOD <<",
      conclusionText: "Correct! The standard barcode 50139 has been validated.\n(Explanation: 5 + 0 + 1 + 3 = 9). By hacking the system to print a 6 instead of a 9, Zodiac forced the scanner's software into an Exception Error, fooling the entire hospital.\n\nTo close the file and clear the nurse, enter the name of the technique/technology used at the final digit that Zodiac exploited:",
      placeholder: "E.g., Checksum, Barcode...",
      submitBtn: "[ CONCLUDE CASE & CLEAR NAME ]",
      gameOverTitle: "SYSTEM ERASED",
      gameOverDesc: "DEDUCTION FAILED. ZODIAC PERMANENTLY DELETED THE DATA.",
      rebootBtn: "[ RESTORE BACKUP ]",
      victoryTitle: "THE TRUTH EXPOSED",
      victoryDesc: "Brilliant, Agent Holmes! Proving the Checksum was forged cleared Nurse Sarah's name. Zodiac exploited society's reliance on technology to murder without being present.\n\nAs soon as Sarah is released, Holmes's computer screen flickers. A phone rings. Unknown number.\n\n'Well done, Holmes. You saved a pawn.' Zodiac's distorted voice echoes. 'But let's see if your brain can solve thousands of lives trapped in a steel cage.'\n\nAn emergency GPS signal flares up from the City Center River Tunnel. Traffic lights are paralyzed. A massive disaster is imminent...",
      unlockBtn: "[ UNLOCK PART 2: THE GRIDLOCK ]",

      p2Title: "CASE 2: THE GRIDLOCK",
      p2Subtitle: "[PART 2: PRESSURE OF 50,000 LIVES]",
      p2BriefingTitle: ">> DATA STREAM: RIVER TUNNEL <<",
      p2BriefingLines: [
        "LOCATION: City Center River Tunnel, 3km long.",
        "CURRENT STATUS: Zodiac hacked into SCADA. He locked all lights at both ends of the tunnel to RED, trapping a school bus and a 20,000-Liter gasoline tanker truck inside.",
        "IMMINENT THREAT: Tunnel ventilation is off. In exactly 5 MINUTES, Zodiac will turn all lights GREEN simultaneously. Thousands of honking cars above will speed down into the dark tunnel, crashing into the tanker and creating a massive inferno.",
        "HOLMES'S OBJECTIVE: Access the Manual Override board. You must enter the routing password to nullify Zodiac's command."
      ],
      p2Cards: [
        { id: 201, title: "[SIGNAL MONITORING STATION]", tag: "TRAFFIC_MAP", desc: "Radar screen showing 3 lanes leading to the tunnel. Each lane has 3 traffic lights blinking abnormally.", detail: "SCADA OPTICAL ANALYSIS:\nThe lights are not broken; they represent basic computer Binary Code.\n- RED Light ON [🔴] = 1\n- Light OFF [⚫] = 0\n\nLANE 1: [🔴] - [⚫] - [🔴]\nLANE 2: [🔴] - [🔴] - [🔴]\nLANE 3: [⚫] - [🔴] - [⚫]" },
        { id: 202, title: "[SCADA PROTOCOL]", tag: "SYSTEM RULES", desc: "The system requires 3 Decimal numbers to override the attacker's 3 binary lines.", detail: "SCADA DATABASE MANUAL:\n- To translate 3-bit Binary to Decimal:\nExample: 011 = (0*4) + (1*2) + (1*1) = 3\nExample: 100 = (1*4) + (0*2) + (0*1) = 4\n- Holmes, calculate the Decimal value of the 3 binary light lanes in the tracking station and combine them into a 3-digit code." },
        { id: 203, title: "[THE TAUNT]", tag: "ZODIAC'S VOICE", desc: "An audio loop playing over the police radio.", detail: "'Tick-tock, Holmes. The tanker is leaking. The children are crying. Computers only understand 0 and 1. Do you understand the language of the Reaper?'" }
      ],
      p2OpenTerminal: "[ INITIATE EMERGENCY OVERRIDE ]",
      p2TerminalTitle: ">> OVERRIDE MATRIX <<",
      p2TerminalDesc: "SYSTEM COUNTDOWN TO DISASTER. Review Evidence [SIGNAL MONITORING STATION]. Translate the 3 binary light lines (Red=1, Off=0) of the 3 lanes to decimal and enter the 3-digit code to lock the signal:",
      p2Placeholder: "C:\\ZODIAC_OVERRIDE> Enter 3-digit code...",
      p2Submit: "[ SEVER CONNECTION ]",

      p2TransitionTitle: "SIGNAL FROM HELL",
      p2TransitionDesc: "Override Code: 572 Accepted!\nThe disaster has been averted.\n\nBut just as the command window closes, the Reverse Traceroute algorithm Holmes planted 7 years ago finally catches Zodiac's real IP. He made a mistake in a moment of rage.\n\nThe coordinates point directly to Hangar 04 at the edge of the international airport. A private jet is warming up its engines.\n\nNo time for massive backup. Holmes draws his gun and signals Alpha Team (Captain Miller, Hayes, Ramirez) to move out immediately.",
      p2TransitionBtn: "[ BREACH HANGAR 04 ]",

      p3Title: "THE FINAL FLIGHT",
      p3Subtitle: "[PART 3: DEATH TRAP]",
      p3BriefingTitle: ">> RAID ON HANGAR 04 <<",
      p3BriefingDesc: "Alpha Team pries open the massive steel door and steps into the pitch-black hangar. Suddenly, the power cuts. The multi-ton door slams shut. Absolute darkness.\n\nZodiac's distorted voice blares from broken speakers:\n'You thought your algorithm could trap me, Holmes? I left that door open. Welcome to the final laboratory.'\n\nRed lasers pierce the dark. Industrial drones equipped with buzzsaws drop from the ceiling. Ramirez is crushed first. Hayes tries to throw an EMP grenade, but a hidden automated turret shreds his chest.\n\nOnly Holmes and Miller manage to dive behind a steel container as machine gun fire rains down...",
      p3BriefingBtn: "[ TRY TO SURVIVE ]",
      p3SurvivalTitle: ">> AUTOMATED DEFENSE SYSTEM <<",
      p3SurvivalDesc: "The exit is locked by a mechanical keypad. Anyone stepping out will be torn to shreds by the turret.\n\nHolmes closes his eyes. In this life-or-death moment, he realizes the gunfire isn't random. It follows an algorithm. Zodiac taunts over the speaker:\n\n'Nature always has perfect, indivisible numbers. Find the next two pieces of that perfection to open the door, or die.'\n\nListen to the turret's burst rhythm. They represent Prime Numbers. Find the next two prime numbers to form the 4-digit passcode:",
      p3Gunfire: "[💥] 2 BANGS...\n[⌛] (2 seconds pause)\n[💥] 3 BANGS...\n[⌛] (2 seconds pause)\n[💥] 5 BANGS...\n[⌛] (2 seconds pause)\n[💥] 7 BANGS...\n[⌛] (Turret reloading - Requires next 2 sequences)",
      p3Placeholder: "Enter 4-digit code (next 2 primes)...",
      p3Submit: "[ ENTER CODE ]",

      p3SacrificeTitle: ">> MILLER'S SACRIFICE <<",
      p3SacrificeDesc: "Password 1113 is correct!\nBut the keypad is in the open. Someone needs to draw fire while the other inputs the code.\n\nMiller looks at Holmes, smiling bitterly: 'The world needs your brain more than an old man. You made a mistake losing your family 7 years ago, don't make another one.'\n\nBefore Holmes can stop him, Miller charges out, firing his rifle to draw all lasers. Bullets rip through his body, blood staining his uniform, but he roars: 'RUN, HOLMES!'\n\nHolmes slides across the bloody floor, punches the code, and pulls the lever. The door cracks open. But Miller falls to his knees. The captain hits the Emergency Lockdown button, sealing himself inside with the mechanical monsters to protect Holmes.\n\nHolmes is the only one who squeezes through the gap, rushing out onto the tarmac...",
      p3SacrificeBtn: "[ RUSH TO THE TARMAC ]",

      p3TarmacTitle: ">> THE VERDICT UNDER RAIN <<",
      p3TarmacDesc: "Outside, it's pouring rain. Zodiac is stepping onto his jet, assuming the cops are dead.\n\nHe doesn't expect a blood-soaked ghost to emerge from the rain. Holmes draws his GLOCK 19M, aiming right at Zodiac. Zodiac's eyes widen in terror.\n\n'You solved every trap, Holmes... but look around! You saved the faceless masses, but left your closest ones to die in a pool of blood. Lonely yet, detective?'\n\nHolmes quietly cocks his gun. His deep voice cuts through the thunder:\n'I don't need to be lonely. I'm just here to give you permanent silence.'",
      p3TarmacBtn: "[ PULL TRIGGER ]",

      p3EndingTitle: "THERE ARE NO WINNERS IN CHAOS",
      p3EndingDesc: "BANG! BANG! BANG!\n\nThree bullets strike Zodiac in the chest and forehead. He falls backward down the stairs, dying in a puddle of rainwater.\n\nHolmes walks to the body, rips off the mask, throws it down, and collapses. Police sirens wail in the distance.\n\nAgent Holmes sits in silence, tightly gripping Miller's dog tags. Justice has been served, but the cost was the destruction of the guardian's soul.\n\nThe greatest case of the century is officially closed.",
      p3EndingFooter: "TRILOGY-2215 HAS CONCLUDED",
      footer: "CASE WRITTEN BY MINH TRI"
    }
  };

  const t = content[locale];

  // --- BACKGROUND THEME ---
  const getBackgroundClass = () => {
    if (gameStage <= -1) return "bg-zinc-950";
    if (gameStage >= 19) return "bg-[url('/s2_boss_tarmac.png')]";
    if (gameStage >= 16) return "bg-[url('/s2_boss_hangar.png')]";
    if (gameStage === 9 || gameStage === 6) return "bg-[url('/end2.png')]"; 
    if (gameStage >= 7 && gameStage <= 14) return "bg-[url('/s2_scene2.png')]";
    if (gameStage >= 2 && gameStage <= 5) return "bg-[url('/s2_scene1.png')]";
    return "bg-[url('/maskss2.png')]";
  };

  const isBossFight = gameStage >= 16;
  const theme = {
    primaryText: isBossFight ? "text-amber-500" : "text-emerald-400",
    secondaryText: isBossFight ? "text-red-400" : "text-sky-400",
    border: isBossFight ? "border-red-900/50" : "border-emerald-900/50",
    borderActive: isBossFight ? "border-amber-600" : "border-emerald-600",
    shadow: isBossFight ? "shadow-[0_0_40px_rgba(220,38,38,0.3)]" : "shadow-[0_0_40px_rgba(16,185,129,0.15)]"
  };

  // ==========================================
  // 🧠 GAME LOGIC HANDLERS
  // ==========================================
  
  // P1: Mã toàn vẹn (50139)
  const verifyP1Code = (e) => {
    e.preventDefault();
    const cleanAns = ans_P1_code.replace(/\s+/g, "");
    
    if (cleanAns === "50139") {
      setGameStage(4);
      setErrAlertP1("");
      setShake_P1(false);
    } else {
      triggerShake(setShake_P1);
      let newHp = lives_P1 - 1;
      setLives_P1(newHp);
      
      if (newHp <= 1) return setGameStage(5);
      
      const err = locale === "vi" ? `Mã kiểm tra tính toàn vẹn sai. Còn ${newHp - 1} mạng.` : `Integrity check failed. ${newHp - 1} strikes left.`;
      setErrAlertP1(err);
      setTimeout(() => setErrAlertP1(""), 5000);
    }
  };

  // P1: Bắt Keyword
  const checkFinalAnswerP1 = (e) => {
    e.preventDefault();
    // Xóa dấu tiếng Việt, cái đống regex này cùi nhưng chạy được là OK =))
    const str = ans_P1_final.toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
      .replace(/ì|í|ị|ỉ|ĩ/g, "i")
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "");
      
    if (str.includes("mavach") || str.includes("barcode") || str.includes("checksum") || str.includes("kiemtra")) {
      setGameStage(6);
      setShake_P1(false);
    } else {
      triggerShake(setShake_P1);
      let newHp = lives_P1 - 1;
      setLives_P1(newHp);
      
      if (newHp <= 1) return setGameStage(5);
      
      setErrAlertP1(locale === "vi" ? `Câu trả lời sai! Còn ${newHp - 1} mạng.` : `Wrong answer! ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP1(""), 5000);
    }
  };

  // P2: SCADA (572)
  const verifyP2Scada = (e) => {
    e.preventDefault();
    const cleanAns = ans_P2_override.trim();
    if (cleanAns === "572") {
      setGameStage(12);
      setShake_P2(false);
    } else {
      triggerShake(setShake_P2);
      let newHp = lives_P2 - 1;
      setLives_P2(newHp);
      
      if (newHp <= 1) return setGameStage(13);
      
      setErrAlertP2(locale === "vi" ? `Mã ghi đè sai! Còn ${newHp - 1} mạng.` : `Override code incorrect! ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP2(""), 5000);
    }
  };

  // P3: Trận Boss (1113)
  const defuseBossLock = (e) => {
    e.preventDefault();
    const cleanAns = ans_P3_prime.trim();
    if (cleanAns === "1113") {
      setGameStage(18); 
      setShake_Boss(false);
    } else {
      triggerShake(setShake_Boss);
      let newHp = lives_Boss - 1;
      setLives_Boss(newHp);
      
      if (newHp <= 1) return setGameStage(5); 
      
      setErrAlertP3(locale === "vi" ? `Mã cửa sai! Làn đạn đang đến gần. Còn ${newHp - 1} mạng.` : `Incorrect code! Fire incoming. ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP3(""), 5000);
    }
  };

  // ==========================================
  // 🖥️ UI COMPONENTS 
  // ==========================================
  const TopStatusBar = () => (
    <div className={`flex justify-between items-center w-full mb-6 pb-4 border-b ${theme.border} relative z-50`}>
      <div className="flex items-center gap-4">
        <span className={`text-xs font-mono ${theme.primaryText} tracking-widest animate-pulse`}>
          {isBossFight ? "[SURVIVAL_MODE_ACTIVE]" : "[HUD_v7.1_HOLMES_ACTIVE]"}
        </span>
        <button onClick={(e) => { e.stopPropagation(); setSoundOff(!soundOff); }} className={`text-xs font-mono text-zinc-500 hover:${theme.primaryText} transition-all cursor-pointer border border-zinc-700 px-2 py-0.5 rounded`}>
          {locale === "vi" ? `[ ÂM THANH: ${soundOff ? "TẮT" : "BẬT"} ]` : `[ SOUND: ${soundOff ? "OFF" : "ON"} ]`}
        </button>
      </div>
      {isBossFight && (
        <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-3 py-1 border border-zinc-800 bg-black hover:border-red-500 hover:text-red-400 text-xs font-mono rounded cursor-pointer text-zinc-500">
          <TerminalText text={t.langBtn} speed={30} skip={skipAll} noCursor noGlow/>
        </button>
      )}
    </div>
  );

  const CopyrightFooter = () => (
    <div className={`w-full mt-auto pt-6 border-t ${theme.border} text-center z-20 relative`}>
      <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
        <TerminalText text={t.footer || ""} speed={20} delay={1000} skip={skipAll} noCursor noGlow />
      </span>
    </div>
  );

  // TODO: Đoạn này sau này tách ra Component con cho gọn file
  const SlideInEvidencePanel = () => {
    if (isBossFight) return null;
    return (
      <>
        {/* Nền xám đen mờ khi mở panel */}
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-500 ${activeDoc ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setActiveDoc(null)}></div>
        
        <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] lg:w-[500px] bg-zinc-950/95 border-l border-emerald-600 shadow-[-20px_0_50px_rgba(16,185,129,0.2)] z-[100] transform transition-transform duration-500 ease-in-out overflow-y-auto ${activeDoc ? 'translate-x-0' : 'translate-x-full'}`}>
          {activeDoc && (
            <div className="p-8 flex flex-col h-full font-mono">
              <div className="flex justify-between items-center mb-8 border-b border-emerald-900/50 pb-4">
                <h2 className="text-xl font-bold text-emerald-400 [text-shadow:0_0_8px_rgba(16,185,129,0.5)]">
                  <TerminalText text={activeDoc.title || ""} speed={20} />
                </h2>
                <button onClick={() => setActiveDoc(null)} className="text-zinc-500 hover:text-emerald-300 text-2xl leading-none transition-colors">&times;</button>
              </div>
              
              {activeDoc.id === 3 && (
                <div className="mb-6 w-full flex justify-center bg-black p-2 border border-emerald-900/60 rounded shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]">
                  <img src="/barcode.png" alt="Medical Barcode Data" className="w-full h-auto object-cover rounded" />
                </div>
              )}
              {activeDoc.id === 201 && (
                <div className="mb-6 w-full flex justify-center bg-black p-2 border border-emerald-900/60 rounded shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]">
                  <img src="/trafficlight.png" alt="Traffic Light Matrix" className="w-full h-auto object-cover rounded" />
                </div>
              )}
              
              <div className="text-zinc-300 text-sm leading-loose mb-8 flex-grow whitespace-pre-wrap">
                <TerminalText text={activeDoc.detail || ""} speed={10} delay={200} noGlow />
              </div>
              
              <button onClick={() => setActiveDoc(null)} className="mt-auto px-6 py-4 bg-emerald-900/20 border border-emerald-700 text-emerald-400 hover:bg-emerald-700 hover:text-black transition-all text-xs tracking-widest rounded cursor-pointer w-full">
                {locale === "vi" ? "[ ĐÓNG NGĂN KÉO DỮ LIỆU ]" : "[ CLOSE DATA PANEL ]"}
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  // ==========================================
  // 🎬 RENDER LOGIC CHÍNH
  // ==========================================
  if (gameStage === -3) {
    return (
      <main onClick={() => { setSoundOff(false); setGameStage(-2); }} onTouchStart={() => { setSoundOff(false); setGameStage(-2); }} className="h-screen w-full bg-zinc-950 flex items-center justify-center cursor-pointer relative overflow-hidden">
         <div className="fixed inset-0 bg-[url('/maskss2.png')] bg-cover bg-center opacity-20 pointer-events-none filter grayscale"></div>
         <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
         
         {/* Hiệu ứng radar load data ảo ảo */}
         <div className="absolute w-64 h-64 border-[1px] border-emerald-600/30 rounded-full animate-[spin_4s_linear_infinite] flex items-center justify-center pointer-events-none">
           <div className="w-48 h-48 border-t-2 border-b-2 border-sky-500/50 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
         </div>
         
         <div className="text-emerald-400 font-mono tracking-widest animate-pulse text-sm text-center px-4 relative z-10 [text-shadow:0_0_10px_rgba(16,185,129,0.8)]">
            {locale === "vi" ? "[ NHẤN ENTER HOẶC CHẠM ĐỂ KẾT NỐI ]" : "[ PRESS ENTER OR TAP TO CONNECT ]"}
         </div>
      </main>
    );
  }

  if (gameStage === -2) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-emerald-100 font-mono p-4 md:p-12 relative overflow-y-auto py-20">
        <div className="fixed inset-0 bg-[url('/maskss2.png')] bg-cover bg-center opacity-10 pointer-events-none filter grayscale"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
        <div className="absolute top-4 right-4 z-50">
           <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-emerald-900 bg-black hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer rounded text-xs font-mono text-zinc-500">
             <TerminalText text={t.langBtn || ""} speed={30} skip={skipAll} noCursor noGlow/>
           </button>
        </div>
        <div className="max-w-4xl text-center space-y-8 z-10 relative mt-10">
           {t.cinematicLines.map((text, idx) => (
              <div key={idx} className="text-sm md:text-lg lg:text-xl tracking-widest leading-loose whitespace-pre-wrap">
                <TerminalText text={text || ""} speed={25} delay={1000 + idx * 4500} skip={skipAll} noCursor noGlow />
              </div>
           ))}
           <div className="mt-16 pt-12 flex justify-center">
             <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(-1); }} className="px-8 py-3 border border-emerald-800 text-emerald-500 hover:text-black hover:bg-emerald-500 transition-all font-mono text-xs tracking-widest rounded animate-pulse cursor-pointer relative z-50">
               <TerminalText text={locale === "vi" ? "[ TIẾP CẬN HỆ THỐNG ZODIAC ]" : "[ ACCESS ZODIAC SYSTEM ]"} delay={skipAll ? 0 : 30000} skip={skipAll} noCursor />
             </button>
           </div>
        </div>
      </main>
    );
  }

  if (gameStage === -1) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full bg-zinc-950 text-emerald-400 font-mono p-6 flex flex-col justify-center items-center relative overflow-y-auto">
        <style dangerouslySetInnerHTML={{__html: `.crt-turn-on { animation: crtOn 1s ease-out forwards; } @keyframes crtOn { 0% { transform: scale(1, 0.01); opacity: 0; filter: brightness(10); } 40% { transform: scale(1, 0.01); opacity: 1; filter: brightness(5); } 100% { transform: scale(1, 1); opacity: 1; filter: brightness(1); } }`}} />
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-40"></div>
        <div className="max-w-2xl w-full z-10 crt-turn-on relative border border-emerald-900/30 p-10 bg-emerald-950/10 backdrop-blur-sm rounded">
          {t.bootTermLines.map((text, idx) => (
            <div key={idx} className={`mb-6 text-sm md:text-xl tracking-widest font-bold ${idx === 1 ? "text-amber-500 animate-pulse" : "text-emerald-400"}`}>
              <TerminalText text={text || ""} speed={20} delay={500 + idx * 1200} skip={skipAll} noGlow={idx !== 1} />
            </div>
          ))}
          <div className="mt-16 relative z-50">
             <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(0); }} className="w-full py-4 border border-emerald-600 hover:bg-emerald-500 hover:text-black transition-all tracking-widest font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer">
               <TerminalText text={locale === "vi" ? "[ XÁC NHẬN BẢO MẬT & TRUY CẬP ]" : "[ CONFIRM SECURITY & ACCESS ]"} delay={skipAll ? 0 : 7000} skip={skipAll} noCursor />
             </button>
          </div>
        </div>
      </main>
    );
  }

  if (gameStage === 15) {
    return (
      <main className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-emerald-900 font-mono text-sm relative">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
        <div className="animate-pulse mb-4 z-10 text-lg">SYSTEM OFFLINE.</div>
        <div className="z-10">{locale === "vi" ? "BẠN CÓ THỂ ĐÓNG TAB TRÌNH DUYỆT NÀY." : "YOU MAY CLOSE THIS WINDOW."}</div>
      </main>
    );
  }

  // BOOT SCREEN (0, 1)
  if (gameStage === 0 || gameStage === 1) {
    return (
      <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-[url('/maskss2.png')] bg-cover bg-center bg-fixed text-slate-100`}>
        <div className="fixed inset-0 bg-zinc-950/85 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-8">
          <div className="w-full max-w-2xl mx-auto my-auto bg-black/80 border border-emerald-900/50 p-6 md:p-8 rounded shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-md">
            <div className="flex justify-between items-center w-full mb-8 pb-4 border-b border-emerald-900/50">
              <span className="text-xs font-mono text-emerald-500 tracking-widest animate-pulse">[SECURE_BOOT_v7.1.0]</span>
              <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-zinc-800 hover:border-emerald-500 text-xs font-mono rounded text-zinc-500 z-50">
                <TerminalText text={t.langBtn || ""} speed={30} skip={skipAll} noCursor noGlow/>
              </button>
            </div>
            {gameStage === 0 ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-sky-400 mb-4 border-b border-emerald-900/30 pb-2"><TerminalText text={t.profTitle || ""} delay={200} skip={skipAll} /></h1>
                <div className="font-mono text-sm text-emerald-400 space-y-2 mb-8">
                  <p><TerminalText text={t.profLine1 || ""} delay={1000} skip={skipAll} noGlow/></p>
                  <p><TerminalText text={t.profLine2 || ""} delay={1800} skip={skipAll} noGlow/></p>
                  <p><TerminalText text={t.profLine3 || ""} delay={2800} skip={skipAll} noGlow/></p>
                </div>
                <h2 className="text-md font-bold font-mono text-sky-400 mb-4"><TerminalText text={t.profHeader || ""} delay={3500} skip={skipAll} /></h2>
                <div className="font-mono text-sm text-zinc-300 space-y-4 mb-10 leading-relaxed">
                  <p><TerminalText text={t.profP1 || ""} speed={10} delay={4500} skip={skipAll} noGlow/></p>
                  <p><TerminalText text={t.profP2 || ""} speed={10} delay={6500} skip={skipAll} noGlow/></p>
                  <p><TerminalText text={t.profP3 || ""} speed={10} delay={8500} skip={skipAll} noGlow/></p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(1); }} className="w-full py-4 bg-emerald-900/20 border border-emerald-600 text-emerald-400 font-mono font-bold tracking-widest hover:bg-emerald-600 hover:text-black transition-all cursor-pointer rounded z-50">
                  <TerminalText text={t.profBtn || ""} delay={11000} skip={skipAll} noCursor />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-emerald-400 mb-2"><TerminalText text={t.introTitle || ""} delay={200} skip={skipAll} /></h1>
                <p className="text-xs text-sky-400 font-mono mb-6 border-b border-emerald-900/30 pb-4"><TerminalText text={t.introSub || ""} delay={800} skip={skipAll} noGlow/></p>
                <div className="bg-black p-4 rounded border border-emerald-900/50 font-mono text-xs text-zinc-400 space-y-3 mb-8 shadow-inner">
                  {t.bootLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">&gt;</span><p><TerminalText text={log || ""} delay={1200 + (idx * 500)} skip={skipAll} noGlow/></p></div>
                  ))}
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(2); }} className="w-full py-4 bg-emerald-900/20 border border-emerald-600 text-emerald-400 font-mono font-bold hover:bg-emerald-600 hover:text-black transition-all cursor-pointer rounded z-50">
                  <TerminalText text={t.startButton || ""} delay={4000} skip={skipAll} noCursor />
                </button>
              </>
            )}
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // --- CÁC MÀN GAME OVER CHUNG (5, 13, 14) ---
  if (gameStage === 5 || gameStage === 13 || gameStage === 14) {
    let title = t.gameOverTitle;
    let desc = t.gameOverDesc;
    let btnText = t.rebootBtn;
    let action = () => window.location.reload();

    if (gameStage === 13 || gameStage === 14) {
      title = locale === "vi" ? "THẢM HỌA XẢY RA" : "DISASTER STRUCK";
      desc = locale === "vi" ? "Hàng ngàn chiếc xe đã lao xuống hầm. Biển lửa thiêu rụi mọi thứ. Hệ thống tự động khôi phục lại thời điểm trước thảm họa." : "Thousands of cars rushed the tunnel. An inferno consumed everything. System restoring to before the disaster.";
      btnText = locale === "vi" ? "[ QUAY LẠI MA TRẬN ĐÈN ĐỎ ]" : "[ RETURN TO GRIDLOCK ]";
      action = () => { setLives_P2(3); setAns_P2_override(""); setScadaTimer(300); setSkipAll(false); setGameStage(7); };
    }

    return (
      <main className="min-h-screen w-full relative bg-zinc-950 text-emerald-100 flex flex-col justify-center">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-40"></div>
        <div className="relative z-20 w-full max-w-lg mx-auto p-4 md:p-8 text-center">
          <h1 className="text-4xl font-bold text-amber-500 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(245,158,11,0.8)]">{title}</h1>
          <p className="text-zinc-400 font-mono mb-8 leading-relaxed"><TerminalText text={desc || ""} speed={20} noGlow /></p>
          <button onClick={action} className="px-6 py-3 border border-amber-600 text-amber-500 font-mono hover:bg-amber-600 hover:text-black transition-all rounded cursor-pointer z-50 relative"><TerminalText text={btnText || ""} delay={1000} noCursor /></button>
        </div>
      </main>
    );
  }

  // --- VICTORY P1 (6) & CHUYỂN TIẾP (12) ---
  if (gameStage === 6) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full relative bg-[url('/end2.png')] bg-cover bg-center bg-fixed text-emerald-100">
        <div className="fixed inset-0 bg-zinc-950/85 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-40"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade { animation: fadeIn 2s ease-in 7.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-sky-400 font-mono mb-6 [text-shadow:0_0_15px_rgba(56,189,248,0.6)]"><TerminalText text={t.victoryTitle || ""} speed={20} skip={skipAll} /></h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-black/80 p-6 md:p-10 border border-sky-900/50 rounded text-left whitespace-pre-wrap shadow-[0_0_30px_rgba(56,189,248,0.15)] w-full relative z-10">
              <TerminalText text={t.victoryDesc || ""} speed={10} delay={500} skip={skipAll} noGlow />
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(7); }} className={`${skipAll ? 'opacity-100' : 'delayed-fade'} px-8 py-4 bg-emerald-600 text-black font-bold font-mono tracking-widest hover:bg-emerald-500 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded z-50 relative`}>
              <TerminalText text={t.unlockBtn || ""} delay={skipAll ? 0 : 8500} skip={skipAll} noCursor />
            </button>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  if (gameStage === 12) {
    return (
      <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full relative bg-[url('/s2_scene2.png')] bg-cover bg-center bg-fixed text-slate-100`}>
        <div className="fixed inset-0 bg-zinc-950/90 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-40"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade-btns { animation: fadeIn 2s ease-in 10.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 font-mono mb-6 animate-pulse [text-shadow:0_0_20px_rgba(220,38,38,0.8)]"><TerminalText text={t.p2TransitionTitle || ""} speed={20} skip={skipAll} /></h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-black/80 p-6 md:p-10 border border-red-900/60 rounded text-left whitespace-pre-wrap shadow-[0_0_30px_rgba(220,38,38,0.2)] backdrop-blur-md w-full relative z-10">
              <TerminalText text={t.p2TransitionDesc || ""} speed={10} delay={500} skip={skipAll} noGlow />
            </div>
            <div className={`${skipAll ? 'opacity-100' : 'delayed-fade-btns'} flex justify-center mt-6 w-full z-50 relative`}>
              <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(16); }} className="px-8 py-4 bg-red-700 text-white font-bold font-mono hover:bg-red-600 transition-all rounded shadow-[0_0_30px_rgba(220,38,38,0.5)] cursor-pointer animate-pulse tracking-widest">
                {t.p2TransitionBtn}
              </button>
            </div>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // --- BƯỚC 16-20: BOSS FIGHT HANGAR 04 ---
  if (isBossFight) {
    return (
      <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-amber-100 transition-all duration-1000 flex flex-col pb-20`}>
        <div className="fixed inset-0 bg-black/80 z-0 pointer-events-none"></div>
        <div className={`fixed inset-0 shadow-[inset_0_0_150px_rgba(220,38,38,0.5)] z-0 pointer-events-none ${gameStage===17 ? 'animate-pulse' : ''}`}></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes mild-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake { animation: mild-shake 0.3s ease-in-out both; }
          .delayed-fade { animation: fadeIn 2s ease-in 8s forwards; opacity: 0; } 
          @keyframes fadeIn { to { opacity: 1; } }
        `}} />

        <div className="relative z-20 flex flex-col h-full min-h-screen p-4 md:p-8 max-w-[1200px] mx-auto w-full">
          <TopStatusBar />
          
          <div className={`flex-1 flex flex-col items-center justify-start py-10 transition-transform ${shake_Boss ? 'animate-shake' : ''}`}>
            
            {gameStage === 16 && (
              <div className="w-full max-w-4xl bg-black/90 border border-red-900 p-8 rounded shadow-[0_0_50px_rgba(220,38,38,0.3)] backdrop-blur-md relative z-10 text-center my-auto">
                <span className="text-xs tracking-widest text-red-500 font-mono block mb-2">{t.p3Subtitle}</span>
                <h1 className="text-3xl font-bold font-mono text-amber-500 mb-8 [text-shadow:0_0_15px_rgba(245,158,11,0.6)]"><TerminalText text={t.p3BriefingTitle || ""} speed={20} skip={skipAll} /></h1>
                <div className="font-mono text-zinc-300 leading-loose mb-10 whitespace-pre-wrap text-left bg-black/50 p-6 rounded border border-red-900/30">
                  <TerminalText text={t.p3BriefingDesc || ""} speed={15} delay={500} skip={skipAll} noGlow />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(17); }} className="px-8 py-4 bg-red-700 text-white font-bold font-mono hover:bg-red-600 transition-all rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer tracking-widest animate-pulse w-full md:w-auto">
                  {t.p3BriefingBtn}
                </button>
              </div>
            )}

            {gameStage === 17 && (
              <div className="w-full max-w-3xl bg-black/95 border-2 border-red-700 p-8 rounded shadow-[0_0_50px_rgba(220,38,38,0.5)] backdrop-blur-md relative z-10 my-auto">
                <h2 className="text-2xl font-bold font-mono text-red-500 mb-6 [text-shadow:0_0_10px_rgba(220,38,38,0.8)] text-center"><TerminalText text={t.p3SurvivalTitle || ""} speed={20} skip={skipAll} /></h2>
                
                {errAlertP3 && (
                  <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                    ⚠️ {errAlertP3}
                  </div>
                )}

                <div className="font-mono text-zinc-400 leading-relaxed mb-6 whitespace-pre-wrap text-center px-4">
                  <TerminalText text={t.p3SurvivalDesc || ""} speed={15} delay={300} skip={skipAll} noGlow />
                </div>

                <div className="mb-8 bg-red-950/40 border border-red-900/80 p-6 rounded font-mono shadow-inner text-sm md:text-lg">
                  <div className="text-amber-500 font-bold whitespace-pre-wrap text-center leading-loose tracking-widest">
                    <TerminalText text={t.p3Gunfire || ""} speed={25} delay={2000} skip={skipAll} noGlow />
                  </div>
                </div>

                <form onSubmit={defuseBossLock} className="flex flex-col mt-auto">
                  <input 
                    type="text" autoFocus value={ans_P3_prime} onChange={(e) => setAns_P3_prime(e.target.value)} placeholder={t.p3Placeholder}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-black border-2 border-red-900 focus:border-red-500 text-red-500 font-mono p-4 rounded outline-none transition-all text-center tracking-widest text-2xl shadow-inner mb-4"
                  />
                  <button type="submit" onClick={(e) => e.stopPropagation()} className="w-full px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-bold font-mono transition-all cursor-pointer rounded tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                    {t.p3Submit}
                  </button>
                </form>
              </div>
            )}

            {gameStage === 18 && (
              <div className="w-full max-w-4xl bg-black/90 border border-amber-600 p-8 rounded shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-md relative z-10 text-center my-auto">
                <h1 className="text-3xl font-bold font-mono text-amber-500 mb-8 [text-shadow:0_0_15px_rgba(245,158,11,0.6)]"><TerminalText text={t.p3SacrificeTitle || ""} speed={20} skip={skipAll} /></h1>
                <div className="font-mono text-zinc-300 leading-loose mb-10 whitespace-pre-wrap text-left bg-black/50 p-6 rounded border border-amber-900/30">
                  <TerminalText text={t.p3SacrificeDesc || ""} speed={15} delay={500} skip={skipAll} noGlow />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(19); }} className={`${skipAll ? 'opacity-100' : 'delayed-fade'} px-8 py-4 bg-amber-600 text-black font-bold font-mono hover:bg-amber-500 transition-all rounded shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer tracking-widest animate-pulse w-full md:w-auto`}>
                  <TerminalText text={t.p3SacrificeBtn || ""} delay={skipAll ? 0 : 7000} skip={skipAll} noCursor />
                </button>
              </div>
            )}

            {gameStage === 19 && (
              <div className="w-full max-w-4xl bg-black/80 border border-zinc-700 p-8 rounded shadow-2xl backdrop-blur-md relative z-10 text-center my-auto mt-10">
                <h1 className="text-3xl font-bold font-mono text-sky-400 mb-8 [text-shadow:0_0_15px_rgba(56,189,248,0.6)]"><TerminalText text={t.p3TarmacTitle || ""} speed={20} skip={skipAll} /></h1>
                <div className="font-mono text-zinc-300 leading-loose mb-10 whitespace-pre-wrap text-left p-6">
                  <TerminalText text={t.p3TarmacDesc || ""} speed={15} delay={500} skip={skipAll} noGlow />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(20); }} className={`${skipAll ? 'opacity-100' : 'delayed-fade'} px-10 py-5 bg-red-700 text-white font-bold font-mono hover:bg-red-600 transition-all rounded shadow-[0_0_30px_rgba(220,38,38,0.8)] cursor-pointer tracking-widest text-lg w-full md:w-auto`}>
                  <TerminalText text={t.p3TarmacBtn || ""} delay={skipAll ? 0 : 8000} skip={skipAll} noCursor />
                </button>
              </div>
            )}

            {gameStage === 20 && (
              <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center my-auto mt-10">
                <h1 className="text-3xl md:text-5xl font-bold text-red-600 font-mono mb-8 [text-shadow:0_0_20px_rgba(220,38,38,0.8)]"><TerminalText text={t.p3EndingTitle || ""} speed={25} skip={skipAll} /></h1>
                <div className="text-zinc-300 font-mono mb-12 leading-loose bg-black/90 p-8 md:p-12 border border-zinc-800 rounded text-left whitespace-pre-wrap shadow-2xl backdrop-blur-md w-full relative z-10">
                  <TerminalText text={t.p3EndingDesc || ""} speed={15} delay={1000} skip={skipAll} noGlow />
                </div>
                <div className="text-zinc-500 font-mono tracking-widest text-sm md:text-base mb-12">
                  <TerminalText text={t.p3EndingFooter || ""} speed={30} delay={skipAll ? 0 : 12000} skip={skipAll} />
                </div>
                
                <div className={`${skipAll ? 'opacity-100' : 'delayed-fade'} flex flex-col md:flex-row justify-center gap-4 w-full z-50 relative`}>
                  <button onClick={(e) => { e.stopPropagation(); setGameStage(-2); window.scrollTo(0, 0); }} className="px-6 py-4 bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold font-mono hover:text-white hover:bg-zinc-800 transition-all rounded cursor-pointer">{t.btnReturnS2}</button>
                  <button onClick={(e) => { e.stopPropagation(); setGameStage(16); window.scrollTo(0, 0); }} className="px-6 py-4 bg-red-900/20 border border-red-700 text-red-500 font-bold font-mono hover:bg-red-700 hover:text-white transition-all rounded cursor-pointer">{t.btnReplayBoss}</button>
                  <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(15); }} className="px-6 py-4 bg-black border border-zinc-800 text-zinc-600 font-bold font-mono hover:bg-zinc-800 hover:text-white transition-all rounded cursor-pointer">{t.btnShutdown}</button>
                </div>
              </div>
            )}
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // ==========================================
  // DASHBOARD CHÍNH (Bước 2,3,4 và 7,8) (P1 & P2)
  // ==========================================
  const customStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); border-radius: 4px; }
    @keyframes mild-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .animate-shake { animation: mild-shake 0.3s ease-in-out both; }
  `;

  return (
    <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-emerald-100 transition-all duration-1000 flex flex-col pb-10`}>
      <style dangerouslySetInnerHTML={{__html: customStyles}} />
      <div className="fixed inset-0 bg-zinc-950/85 z-0 pointer-events-none"></div>
      <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-40"></div>

      <div className="relative z-20 flex flex-col min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <TopStatusBar />
        
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b ${theme.border} pb-4 shrink-0`}>
          <div>
            <span className={`text-xs tracking-widest ${theme.secondaryText} font-mono`}>
              <TerminalText text={gameStage >= 7 ? t.p2Subtitle : t.subtitle} speed={20} skip={skipAll} noGlow />
            </span>
            <h1 className={`text-2xl md:text-3xl font-bold font-mono tracking-wider mt-1 ${theme.primaryText} [text-shadow:0_0_10px_rgba(16,185,129,0.5)]`}>
              <TerminalText text={gameStage >= 7 ? t.p2Title : t.title} speed={25} delay={300} skip={skipAll} />
            </h1>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 z-50">
             <button onClick={(e) => { e.stopPropagation(); setGameStage(0); }} className={`px-4 py-2 border border-zinc-800 bg-black hover:${theme.borderActive} hover:${theme.primaryText} text-xs font-mono rounded cursor-pointer`}>{t.exitBtn}</button>
             <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className={`px-4 py-2 border border-zinc-800 bg-black hover:border-sky-500 hover:text-sky-400 text-xs font-mono rounded cursor-pointer`}>{t.langBtn}</button>
          </div>
        </header>

        {(gameStage === 3 || gameStage === 4 || gameStage === 8) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className={`w-full max-w-3xl bg-black/80 border-2 ${gameStage === 8 ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'border-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.2)]'} p-8 rounded backdrop-blur-md relative z-10 transition-transform ${((gameStage===3||gameStage===4)&&shake_P1) || (gameStage===8&&shake_P2) ? 'animate-shake' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold font-mono ${gameStage === 8 ? 'text-amber-500' : 'text-sky-400'}`}>
                  <TerminalText text={gameStage === 8 ? t.p2TerminalTitle : (gameStage === 4 ? t.conclusionTitle : t.p1BoardTitle)} speed={20} skip={skipAll} />
                </h2>
                {gameStage === 8 && (
                  <div className={`text-4xl font-bold font-mono bg-black px-4 py-2 rounded border ${scadaTimer <= 60 ? 'text-red-500 border-red-500 animate-pulse' : 'text-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}>
                    [ {formatTimer(scadaTimer)} ]
                  </div>
                )}
              </div>
              
              {((gameStage===3||gameStage===4)&&errAlertP1) || (gameStage===8&&errAlertP2) ? (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                  ⚠️ {(gameStage===3||gameStage===4) ? errAlertP1 : errAlertP2}
                </div>
              ) : null}

              <div className="font-mono text-zinc-300 leading-loose mb-8 whitespace-pre-wrap flex-grow">
                <TerminalText text={gameStage === 8 ? t.p2TerminalDesc : (gameStage === 4 ? t.conclusionText : t.p1BoardDesc)} speed={15} delay={300} skip={skipAll} noGlow />
              </div>

              {gameStage === 8 && (
                <div className="mb-8 bg-black/60 border border-amber-900/60 p-6 rounded font-mono shadow-inner text-sm md:text-base">
                  <p className="text-zinc-400 font-bold mb-4 tracking-wider text-center">{locale === "vi" ? "📋 BẢNG THAM CHIẾU NHỊ PHÂN CƠ BẢN:" : "📋 BASIC BINARY REFERENCE:"}</p>
                  <div className="flex justify-around text-amber-500 font-bold">
                    <span>000 = 0</span><span>001 = 1</span><span>010 = 2</span><span>011 = 3</span>
                  </div>
                  <div className="flex justify-around text-amber-500 font-bold mt-2">
                    <span>100 = 4</span><span>101 = 5</span><span>110 = 6</span><span>111 = 7</span>
                  </div>
                </div>
              )}

              <form onSubmit={gameStage === 8 ? verifyP2Scada : (gameStage === 4 ? checkFinalAnswerP1 : verifyP1Code)} className="flex flex-col mt-auto">
                <input 
                  type="text" autoFocus 
                  value={gameStage === 8 ? ans_P2_override : (gameStage === 4 ? ans_P1_final : ans_P1_code)} 
                  onChange={(e) => gameStage === 8 ? setAns_P2_override(e.target.value) : (gameStage === 4 ? setAns_P1_final(e.target.value) : setAns_P1_code(e.target.value))} 
                  placeholder={gameStage === 8 ? t.p2Placeholder : (gameStage === 4 ? t.placeholder : t.p1BoardPlaceholder)}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full bg-black border-2 border-zinc-800 ${gameStage===8?'focus:border-amber-500 text-amber-500':'focus:border-emerald-500 text-emerald-400'} font-mono p-4 rounded outline-none transition-all text-center tracking-widest text-lg md:text-2xl shadow-inner uppercase mb-4`}
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setGameStage(gameStage === 8 ? 7 : 2); }} className={`w-full md:w-1/3 px-4 py-4 bg-black border border-zinc-800 text-zinc-500 font-bold font-mono hover:${theme.secondaryText} hover:${theme.borderActive} transition-all cursor-pointer rounded tracking-widest text-center shadow-inner`}>
                    <TerminalText text={t.backToDocsBtn} speed={30} skip={skipAll} noCursor noGlow />
                  </button>
                  <button type="submit" onClick={(e) => e.stopPropagation()} className={`w-full md:w-2/3 px-4 py-4 ${gameStage===8 ? 'bg-amber-600 hover:bg-amber-500 text-black' : 'bg-emerald-600 hover:bg-emerald-500 text-black'} font-bold font-mono transition-all cursor-pointer rounded tracking-widest`}>
                    {gameStage === 8 ? t.p2Submit : (gameStage === 4 ? t.submitBtn : t.p1BoardSubmit)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 relative z-10 pb-20">
            <div className={`w-full lg:w-1/3 flex flex-col bg-black/50 border ${theme.border} rounded-lg p-6 h-fit shadow-inner backdrop-blur-sm`}>
              <h2 className={`text-md font-bold font-mono ${theme.secondaryText} mb-4 border-b ${theme.border} pb-2 flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${gameStage >= 7 ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`}></span>
                <TerminalText text={gameStage >= 7 ? t.p2BriefingTitle : t.briefingTitle} speed={20} delay={500} skip={skipAll} noGlow />
              </h2>
              <div className="font-mono text-sm text-zinc-300 space-y-4 whitespace-pre-wrap pb-4">
                {(gameStage >= 7 ? t.p2BriefingLines : t.briefingLines).map((line, idx) => (
                  <p key={idx} className={`border-l-2 ${gameStage >= 7 ? 'border-amber-800' : 'border-emerald-800'} pl-3`}>
                    <TerminalText text={line} speed={10} delay={1000 + (idx * 1200)} skip={skipAll} noCursor={idx !== (gameStage >= 7 ? t.p2BriefingLines : t.briefingLines).length - 1} noGlow />
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-6 h-fit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(gameStage >= 7 ? t.p2Cards : t.cards).map((card, index) => {
                  const baseDelay = 4500 + (index * 600);
                  return (
                    <div 
                      key={card.id} 
                      onClick={(e) => { e.stopPropagation(); setActiveDoc(card); }}
                      className={`p-5 bg-zinc-950/70 border border-zinc-800/50 rounded-lg shadow-md backdrop-blur-sm flex flex-col hover:${theme.borderActive} hover:bg-zinc-900 transition-all cursor-pointer group`}
                    >
                      <div className={`flex justify-between items-start mb-3 border-b ${theme.border} pb-2`}>
                        <span className={`text-xs font-mono font-bold ${theme.primaryText}`}><TerminalText text={card.title} speed={15} delay={baseDelay} skip={skipAll} noGlow /></span>
                        <span className={`text-[10px] font-mono ${theme.secondaryText} bg-black px-2 py-0.5 rounded border border-zinc-800`}><TerminalText text={card.tag} speed={15} delay={baseDelay} skip={skipAll} noGlow /></span>
                      </div>
                      <div className="text-zinc-400 text-xs md:text-sm leading-relaxed flex-grow mb-3">
                        <TerminalText text={card.desc} speed={10} delay={baseDelay + 300} skip={skipAll} noGlow />
                      </div>
                      <div className={`text-xs text-zinc-500 font-mono mt-auto group-hover:${theme.primaryText} transition-colors`}>
                        {locale === "vi" ? ">> TRÍCH XUẤT DỮ LIỆU <<" : ">> EXTRACT DATA <<"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 flex justify-end">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(gameStage >= 7 ? 8 : 3); }}
                  className={`px-8 py-4 ${gameStage >= 7 ? 'bg-amber-600 hover:bg-amber-500 text-black' : 'bg-emerald-600 hover:bg-emerald-500 text-black'} font-bold font-mono tracking-widest text-sm rounded transition-all cursor-pointer w-full md:w-auto animate-pulse`}
                >
                  <TerminalText text={gameStage >= 7 ? t.p2OpenTerminal : t.openBoardBtn} speed={15} delay={7500} skip={skipAll} noCursor noGlow />
                </button>
              </div>
            </div>
          </div>
        )}

        <CopyrightFooter />
      </div>

      <SlideInEvidencePanel />
    </main>
  );
}