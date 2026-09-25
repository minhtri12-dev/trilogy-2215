"use client";

import { useState, useEffect } from "react";

// ==========================================
// 🛠️ HOOK: HIỆU ỨNG GÕ CHỮ (TERMINAL)
// ==========================================
const useTerminalEffect = (text, speed = 15, delay = 0, skip = false) => {
  const [renderText, setRenderText] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!text) return;
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

const TerminalText = ({ text, speed = 15, delay = 0, className, skip = false, noCursor = false }) => {
  const { renderText, isPrinting } = useTerminalEffect(text, speed, delay, skip);
  return (
    <span className={`${className || ""} [text-shadow:0_0_8px_currentColor] transition-all`}>
      {renderText}
      {!noCursor && (
        <span className={`inline-block w-2 h-4 ml-1 bg-current align-middle ${isPrinting ? "animate-pulse" : "animate-pulse opacity-40"}`}></span>
      )}
    </span>
  );
};

// ==========================================
// 🎮 MAIN GAME COMPONENT - TRILOGY 2215 SS1
// ==========================================
export default function Home() {
  const [locale, setLocale] = useState("vi");
  
  // MAP STATE: 
  // -3: Click to Start | -2: Trailer | -1: Boot
  // 0: Profile | 1: Load | 2: P1_Docs | 4: P1_Final | 5: Game Over
  // 6: Victory P1 | 7: P2_Docs | 8: P2_Input | 9: Victory P2 | 13: Game Over P2
  // 10: P3_Docs | 11: P3_Matrix (Bomb) | 12: Ultimate End | 14: Game Over P3 | 15: Shutdown
  const [gameStage, setGameStage] = useState(-3); 
  const [activeDoc, setActiveDoc] = useState(null);
  const [skipAll, setSkipAll] = useState(false);

  // --- ÂM THANH ---
  const [bgTrack, setBgTrack] = useState(null);
  const [soundOff, setSoundOff] = useState(true);

  // ==========================================
  // 📓 TÍNH NĂNG MỚI: SỔ TAY ĐIỀU TRA
  // ==========================================
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookTab, setNotebookTab] = useState("clues"); // 'clues' or 'deduct'
  const [collectedClues, setCollectedClues] = useState([]); 
  
  // 2 Slot để ép thẻ
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [deductError, setDeductError] = useState("");

  const handleSaveClue = (clue) => {
    if (!collectedClues.find(c => c.id === clue.id)) {
      setCollectedClues([...collectedClues, clue]);
    }
  };

  const assignSlot = (clue) => {
    setDeductError(""); 
    if (!slot1) setSlot1(clue);
    else if (!slot2 && slot1.id !== clue.id) setSlot2(clue);
  };

  // --- TRẠNG THÁI P1 ---
  const [ans_P1_final, setAns_P1_final] = useState("");
  const [errAlertP1, setErrAlertP1] = useState("");
  const [lives_P1, setLives_P1] = useState(3);

  // --- TRẠNG THÁI P2 ---
  const [ans_P2_cipher, setAns_P2_cipher] = useState("");
  const [errAlertP2, setErrAlertP2] = useState("");
  const [lives_P2, setLives_P2] = useState(3);

  // --- TRẠNG THÁI P3 ---
  const [ans_P3_matrix, setAns_P3_matrix] = useState("");
  const [errAlertP3, setErrAlertP3] = useState("");
  const [lives_P3, setLives_P3] = useState(3);
  const [bombTimer, setBombTimer] = useState(300);

  // ==========================================
  // ⚙️ EFFECTS
  // ==========================================
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (activeDoc) setActiveDoc(null);
        else if (isNotebookOpen) setIsNotebookOpen(false);
      }
    };
    
    const handleEnterStart = (e) => {
      if (gameStage === -3 && e.key === 'Enter') {
        setSoundOff(false);
        if (bgTrack) bgTrack.play();
        setGameStage(-2);
      }
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', handleEnterStart);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleEnterStart);
    };
  }, [activeDoc, isNotebookOpen, gameStage, bgTrack]);

  useEffect(() => { setSkipAll(false); }, [gameStage, activeDoc, isNotebookOpen]);

  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    setBgTrack(audio);
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (!bgTrack) return;
    if (!soundOff) bgTrack.play().catch(e => { setSoundOff(true); });
    else bgTrack.pause();
  }, [soundOff, bgTrack]);

  useEffect(() => {
    let timer = null;
    if (gameStage === 11 && bombTimer > 0 && !isNotebookOpen) {
      timer = setInterval(() => setBombTimer((prev) => prev - 1), 1000);
    } else if (gameStage === 11 && bombTimer <= 0) setGameStage(14);
    return () => clearInterval(timer);
  }, [gameStage, bombTimer, isNotebookOpen]);

  const formatTimer = (secs) => {
    let m = Math.floor(secs / 60).toString().padStart(2, "0");
    let s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ==========================================
  // 📚 TỪ ĐIỂN DATA (ĐÃ ĐẦY ĐỦ TIẾNG VIỆT & TIẾNG ANH)
  // ==========================================
  const content = {
    vi: {
      langBtn: "LANG: [VI]",
      backToDocsBtn: "[ QUAY LẠI HỒ SƠ ]",
      nbBtn: "[ 📓 SỔ TAY ĐIỀU TRA ]",
      nbTab1: "[ QUẢN LÝ MANH MỐI ]",
      nbTab2: "[ BẢNG SUY LUẬN ]",
      saveClueBtn: "[ LƯU VÀO SỔ TAY ]",
      savedClueBtn: "[ ✔ ĐÃ LƯU ]",
      deductBtn: "[ PHÂN TÍCH LIÊN KẾT ]",
      emptySlot: "CHỌN MANH MỐI",
      
      cinematicLines: [
        "Washington DC, 2003.\nMột thế giới nơi những bí mật không bao giờ thực sự biến mất.\nNhững vụ án chưa có lời giải. Những con người biến mất không để lại dấu vết.\nVà những kẻ đứng sau bóng tối... chưa từng để lộ khuôn mặt thật.",
        "Nhiều năm sau khi một chuỗi án mạng bí ẩn khép lại,\nmột hồ sơ cũ bất ngờ được mở lại.\nKhông phải bởi cảnh sát. Không phải bởi truyền thông.\nMà bởi một tín hiệu được gửi đến từ một hệ thống đã bị xóa khỏi mọi cơ sở dữ liệu.",
        "Mã hồ sơ:\n2215\n\nMột cái tên xuất hiện trong đó.\nZODIAC.",
        "Nhưng lần này... hắn không để lại một bức thư.\nHắn để lại một trò chơi.",
        "Và chỉ có một cách để tìm ra sự thật:\nGIẢI NÓ."
      ],
      bootTermLines: [
        "[ SECURE BOOT v5.0 ]",
        "INITIALIZING...",
        "IDENTITY VERIFICATION",
        "████████████████████ 100%",
        "WELCOME, AGENT HOLMES."
      ],

      profTitle: "[ HỒ SƠ NHÂN SỰ LƯU TRỮ - FBI ]",
      profLine1: "Định danh: HOLMES (Mã: FBI-A042)",
      profLine2: "Chức vụ: Đặc vụ Cấp cao - Đội Điều Tra Trọng Án",
      profLine3: "Bảo mật: Cấp 5 (Tuyệt mật)",
      profHeader: "[ HỒ SƠ TÂM LÝ & ĐỘNG LỰC ]",
      profP1: "Holmes từng là một nhà toán học thiên tài. 5 năm trước, kẻ sát nhân tự xưng là Zodiac đã sát hại vợ và con của anh.",
      profP2: "Zodiac không để lại dấu vết ADN. Hắn chỉ để lại những 'bẫy logic' ngoại phạm hoàn hảo được tính toán bằng các con số nhằm chế giễu FBI.",
      profP3: "Holmes gia nhập FBI với một mục tiêu duy nhất: Dùng tư duy sắc lạnh để bẻ gãy mọi bẫy logic, và tự tay đưa Zodiac ra ánh sáng. Bắt đầu từ vụ án gia đình tỷ phú David Vance.",
      profBtn: "[ XÁC NHẬN DANH TÍNH & ĐĂNG NHẬP ]",

      introTitle: "TRILOGY-2215 // MẠNG LƯỚI BẢO MẬT FBI",
      introSub: "Khu vực hạn chế. Dành riêng cho Đặc vụ Holmes.",
      bootLogs: [
        "Đang kết nối trung tâm máy chủ cấp quốc gia...",
        "Xác thực mã định danh FBI-A042... THÀNH CÔNG.",
        "Chào mừng trở lại, Đặc vụ Holmes.",
        "Đang trích xuất hồ sơ: 'Án mạng gia đình David Vance'...",
        "Hệ thống sẵn sàng. Vui lòng truy cập."
      ],
      startButton: "[ MỞ BÀN LÀM VIỆC / INITIALIZE ]",
      exitBtn: "[ THOÁT HỆ THỐNG ]",
      title: "TRILOGY-2215: SAI SỐ CHẾT NGƯỜI",
      subtitle: "[PHẦN 1: BẪY LOGIC - ĐANG ĐIỀU TRA]",
      
      briefingTitle: ">> BÁO CÁO BIÊN BẢN HIỆN TRƯỜNG MỞ RỘNG <<",
      briefingLines: [
        "MÃ VỤ ÁN: HMD-092 | ĐƠN VỊ: FBI Đội Trọng Án Khu Vực 4.",
        "NẠN NHÂN: David Vance, phu nhân Eleanor và quản gia Thomas.",
        "KHÁM NGHIỆM: Các thi thể phát hiện trong phòng ngủ kín. Không xô xát. Điều lạ là nhiệt độ phòng khi phát hiện cực kỳ lạnh (Gần 0 độ C).",
        "AN NINH: Toàn bộ camera bị xóa. Hung thủ cực kỳ am hiểu IT.",
        "VẬT CHỨNG: Phát hiện 1 máy phát điện chạy xăng (dung tích đúng 5 LÍT) xả khí CO vào điều hòa. Bình xăng máy HOÀN TOÀN TRỐNG RỖNG."
      ],
      
      cards: [
        { id: 1, title: "[BÁO CÁO PHÁP Y]", tag: "T.O.D: 21:45 - 22:15", desc: "Thời gian tử vong (T.O.D) ước tính từ 21:45 đến 22:15 đêm qua dựa trên độ đông cứng tử thi.", detail: "BÁO CÁO PHÁP Y (#FB-9921):\n- Nồng độ CO > 70%.\n- Phát hiện nhiệt độ bất thường: Hệ thống làm lạnh đã bị can thiệp hạ xuống 0°C ngay sau khi tử vong. Điều này khiến tử thi đông cứng cực nhanh, lừa bác sĩ pháp y phán đoán sai lệch lùi lại 2 tiếng (Giờ chết thực tế là 00:00 đêm)." },
        { id: 2, title: "[LỜI KHAI NGHI PHẠM]", tag: "SUBJECT: SARAH", desc: "Sarah khai: Rời biệt thự lúc 21:00 bằng xe Porsche (Dung tích tối đa 45 Lít) chạy về trung tâm.", detail: "BIÊN BẢN LẤY LỜI KHAI:\n- Sarah khẳng định tự lái xe rời đi lúc 21:00.\n- Cô hoàn toàn không hay biết việc thẻ tín dụng của mình bị quẹt lúc 22:12 tại trạm xăng ngoại ô." },
        { id: 3, title: "[CAMERA GIAO THÔNG]", tag: "RED HERRING", desc: "Xe Porsche qua trạm thu phí lúc 21:30. Đồng hồ camera bị hack, chạy nhanh hơn thực tế 5 phút.", detail: "DỮ LIỆU CAMERA SỐ 4:\n- Khung hình ghi nhận chiếc Porsche chạy qua lúc 21:30.\n- Máy chủ cho thấy đồng hồ camera bị hack chạy nhanh 5 phút (Thực tế xe đi qua lúc 21:25).\n- Khoảng cách từ biệt thự đến trạm thu phí chỉ mất 15 phút lái xe." },
        { id: 4, title: "[HÓA ĐƠN SIÊU THỊ]", tag: "TIME: 22:10", desc: "Giao dịch lúc 22:10. Thẻ của Sarah thanh toán đồ dùng tại trung tâm.", detail: "HÓA ĐƠN ĐIỆN TỬ:\n- Thời gian: 22:10 tại Siêu thị Trung tâm.\n- Đây là nước đi hoàn hảo của hung thủ nhằm tạo ngoại phạm giả cho chủ thẻ." },
        { id: 5, title: "[BIÊN LAI TRẠM XĂNG]", tag: "STATUS: ANOMALY", desc: "Trạm xăng ghi nhận thẻ của Sarah thanh toán cho đúng 50 LÍT XĂNG lúc 22:12.", detail: "DỮ LIỆU TRỤ BƠM SỐ 7:\n- Thời gian: 22:12.\n- Lượng nhiên liệu bơm: 50 Lít.\n- ĐIỂM VÔ LÝ: Sổ đăng kiểm xe Porsche của Sarah ghi rõ dung tích bình chứa tối đa tuyệt đối chỉ là 45 Lít." }
      ],

      gameOverTitle: "HỆ THỐNG ĐÃ KHÓA",
      gameOverDesc: "LẬP LUẬN THẤT BẠI. HỆ THỐNG BẢO MẬT ĐÃ TỰ HỦY.",
      rebootBtn: "[ TẢI LẠI HỆ THỐNG ]",

      conclusionTitle: ">> BƯỚC CUỐI: LẬT TẨY PHƯƠNG THỨC <<",
      conclusionText: "Ngoại phạm Tam Giác Logic đã bị đập tan!\nChiếc xe ở trạm xăng đổ 50 Lít, xe thật của Sarah chỉ chứa 45 Lít. Thời gian di chuyển lại lệch 10 phút. Kẻ thủ ác đã nhân bản thẻ, làm giả biển số và thuê một chiếc Porsche khác để giấu xe thật, gài bẫy Sarah.\n\nNHƯNG để kế hoạch hoàn hảo, hắn cần thao túng thời gian tử vong. Hãy trả lời câu hỏi cuối cùng: Hệ thống nhà nào tại biệt thự đã bị hacker thâm nhập để hạ nhiệt độ phòng xuống 0°C?",
      placeholder: "Nhập tên hệ thống...",
      submitBtn: "[ CHỐT ÁN ]",
      
      victoryTitle: "SỰ THẬT PHƠI BÀY",
      victoryDesc: "Lập luận xuất sắc, Holmes! Kẻ đó chính là ZODIAC. Hắn đã dàn dựng một kiệt tác tội ác tàn độc:\n\nZodiac xả khí CO giết vợ chồng Vance lúc 00:00. Hắn hack Smarthome HẠ NHIỆT ĐỘ PHÒNG XUỐNG 0 ĐỘ C, làm tử thi đông cứng nhanh hơn, lừa pháp y lùi giờ chết về 21:45 để khớp với bằng chứng giả của Sarah.\n\nNhận thấy kế hoạch đổ tội thất bại nhờ sổ tay suy luận của bạn, Zodiac lập tức đột nhập nhà Sarah, ép cô đột tử nhằm bịt đầu mối.\n\nZodiac đã biến mất, để lại một mảnh giấy gập tư đẫm máu tại nhà Sarah...",
      unlockBtn: "[ MỞ KHÓA PHẦN 2: MẬT MÃ ĐẪM MÁU ]",

      // --- PHẦN 2 ---
      p2Title: "TRILOGY-2215: MẬT MÃ ĐẪM MÁU",
      p2Subtitle: "[PHẦN 2: SỰ KHIÊU KHÍCH CỦA ZODIAC]",
      p2BriefingTitle: ">> HIỆN TRƯỜNG THỨ HAI: CĂN HỘ CAO CẤP CỦA SARAH <<",
      p2BriefingLines: [
        "ĐỊA ĐIỂM: Căn hộ chung cư độc lập thuộc khu đô thị phía Tây thành phố.",
        "MANH MỐI TẠI HIỆN TRƯỜNG: Bàn tay cứng đờ của cô vẫn đang siết chặt một mảnh giấy nhàu nát đẫm máu khô - thông điệp trực diện mà Zodiac để lại riêng cho bộ óc của Holmes."
      ],
      p2Cards: [
        { id: 101, title: "[BÁO CÁO PHÁP Y P.2]", tag: "CAUSE: KCL", desc: "Xác nhận Sarah tử vong do tiêm dung dịch Kali Clorua (KCl).", detail: "HỒ SƠ KHÁM NGHIỆM TỬ THI SARAH (#AUT-881):\n- Dấu vết sinh học: Trên cổ tay trái có vết kim tiêm mờ. Không tìm thấy dấu vân tay của Sarah trên ống tiêm." },
        { id: 103, title: "[MẢNH GIÁY ĐẪM MÁU]", tag: "BLOODY_NOTE.PNG", desc: "Bức thư máu Zodiac gửi riêng cho Holmes chứa chuỗi mật mã kỳ lạ.", detail: "GIÁM ĐỊNH MẬT MÃ:\n- Dãy ký tự viết hoa theo hệ mật mã cổ điển Caesar Cipher:\n  W K L V - L V - M X V W - W K H - E H J L Q Q L Q J" },
        { id: 104, title: "[USB TRÊN LẦU]", tag: "HIDDEN_SYMBOL.PNG", desc: "Một chiếc USB đặt trên bàn, ghi lại bóng Zodiac rời khỏi căn hộ.", detail: "TRÍCH XUẤT CAMERA:\n- File video ghi lại bóng người áo hoodie, đeo mặt nạ thong thả bước ra cửa lúc 03:15." }
      ],
      p2OpenTerminal: "[ BÀN GIẢI MÃ KÝ TỰ (CIPHER) ]",
      p2TerminalTitle: ">> BÀN GIẢI MÃ KÝ TỰ (CAESAR CIPHER) <<",
      p2TerminalDesc: "Mật mã Caesar luôn cần một con số để dịch chuyển. Hãy tìm **số lượng sinh mạng** đã bị tước đoạt trong đêm lạnh giá tại biệt thự Vance (Vụ án Phần 1) để làm Khóa Key lùi lại.\n\nDãy mã hóa: W K L V - L V - M X V W - W K H - E H J L Q Q L Q J",
      p2Placeholder: "Nhập thông điệp sau khi giải mã...",
      p2Submit: "[ GIẢI MÃ & TRUY TÌM TỌA ĐỘ ]",
      p2VictoryTitle: "TỌA ĐỘ ĐÃ ĐƯỢC XÁC ĐỊNH",
      p2VictoryDesc: "Xuất sắc, Đặc vụ Holmes!\nKhóa Key chính là số 3 (Tương ứng 3 nạn nhân nhà Vance). Lùi lại 3 bước, mã chuyển hóa thành:\n\n'THIS IS JUST THE BEGINNING'\n\nTín hiệu radar phát hiện chiếc USB ẩn đã kết nối vào trạm Sector 7. Zodiac đang đợi bạn ở đó!",
      p2FinalBtn: "[ SẴN SÀNG KHỞI ĐỘNG PHẦN 3 ]",

      // --- PHẦN 3 ---
      p3Title: "TRILOGY-2215: ĐIỂM HỘI TỤ TẬN CÙNG",
      p3Subtitle: "[PHẦN 3: TRẬN CHIẾN CUỐI CÙNG]",
      p3BriefingTitle: ">> TRẠM XỬ LÝ NƯỚC THẢI SECTOR 7 <<",
      p3BriefingLines: [
        "TÌNH TRẠNG: Ở giữa phòng, một thiết bị phát tán khí độc thần kinh đang đếm ngược.",
        "HỆ THỐNG PHÒNG THỦ: Trạm Sector 7 khóa chặt bằng Ma Trận Số Học. Nhập sai 3 lần, van xả khí độc sẽ kích hoạt chôn vùi toàn bộ đội đặc nhiệm."
      ],
      p3Cards: [
        { id: 201, title: "[MÀN HÌNH ĐIỀU KHIỂN]", tag: "MATRIX LOCK", desc: "Màn hình công nghiệp hiển thị chuỗi ma trận:\n88 → 69 → 19 → 1311 → 1330 → [ ? ]", detail: "DỮ LIỆU (#CRT-01):\n- 'Toán học không bao giờ nói dối, nhưng cái chết thì có thể. Hãy tìm ra con số cuối cùng'.\n- 88 → 69 → 19 → 1311 → 1330 → [ ? ]." },
        { id: 203, title: "[GHI CHÚ CỦA ZODIAC]", tag: "ZODIAC'S NOTE", desc: "Thông điệp tàn độc khắc trên vách tường kim loại.", detail: "THÔNG ĐIỆP:\n- 'Quy luật của thế giới này là sự nhào nặn giữa những kẻ đứng trước mặt ngươi. Cộng, Trừ, Nhân, Chia... tất cả đều là công cụ của Tử Thần.'" }
      ],
      p3OpenTerminal: "[ TRUY CẬP KHÓA MA TRẬN ]",
      p3TerminalTitle: ">> KHÓA MA TRẬN TOÁN HỌC <<",
      p3TerminalDesc: "HỆ THỐNG ĐANG ĐẾM NGƯỢC. Tìm ra con số cuối cùng:\n\n88 → 69 → 19 → 1311 → 1330 → [ ? ]",
      p3Placeholder: "Nhập con số đáp án...",
      p3Submit: "[ VÔ HIỆU HÓA HỆ THỐNG ]",

      season2Title: "KẾT THÚC MÙA 1",
      season2Desc: "Holmes ngắm chuẩn với súng GLOCK 19M. Viên đạn găm thẳng vào vai trái của Zodiac, nhưng hắn vẫn lao xuống dòng sông ngầm tẩu thoát.\n\n10 năm sau:\nMột gói hàng nặc danh gửi đến Holmes chứa chiếc mặt nạ máu:\n'TA ĐÃ TRỞ LẠI ĐỂ BÁO THÙ...'\n\nVết sẹo trên vai trái vẫn nhói đau. Trò chơi sinh tử lớn hơn sắp bắt đầu.",
      season2Footer: "TO BE CONTINUED IN SEASON 2",
      footer: "VỤ ÁN DO MINH TRÍ BIÊN SOẠN"
    },
    en: {
      langBtn: "LANG: [EN]",
      backToDocsBtn: "[ BACK TO DOSSIER ]",
      nbBtn: "[ 📓 INVESTIGATION NOTEBOOK ]",
      nbTab1: "[ CLUES MANAGER ]",
      nbTab2: "[ DEDUCTION BOARD ]",
      saveClueBtn: "[ SAVE TO NOTEBOOK ]",
      savedClueBtn: "[ ✔ SAVED ]",
      deductBtn: "[ ANALYZE LINK ]",
      emptySlot: "SELECT CLUE",
      
      cinematicLines: [
        "Washington DC, 2003.\nA world where secrets never truly disappear.\nUnsolved cases. People vanishing without a trace.\nAnd those behind the shadows... never showing their true faces.",
        "Years after a series of mysterious murders concluded,\nan old file is unexpectedly reopened.\nNot by the police. Not by the media.\nBut by a signal sent from a system erased from all databases.",
        "Case File ID:\n2215\n\nA name appears within it.\nZODIAC.",
        "But this time... he left no letter.\nHe left a game.",
        "And there is only one way to find the truth:\nSOLVE IT."
      ],
      bootTermLines: [
        "[ SECURE BOOT v5.0 ]",
        "INITIALIZING...",
        "IDENTITY VERIFICATION",
        "████████████████████ 100%",
        "WELCOME, AGENT HOLMES."
      ],

      profTitle: "[ ARCHIVED PERSONNEL FILE - FBI ]",
      profLine1: "Designation: HOLMES (ID: FBI-A042)",
      profLine2: "Role: Senior Agent - Major Case Squad",
      profLine3: "Clearance: Level 5 (Top Secret)",
      profHeader: "[ PSYCHOLOGICAL PROFILE & MOTIVATION ]",
      profP1: "Holmes was once a genius mathematician. Five years ago, a killer calling himself Zodiac murdered his only remaining family member.",
      profP2: "Zodiac leaves no DNA traces. He only leaves flawless logical 'traps' calculated with numbers to mock the FBI.",
      profP3: "Holmes joined the FBI with a single objective: Use a cold, sharp mind to shatter every logic trap, and bring Zodiac to justice with his own hands. Starting with the case of billionaire David Vance's family.",
      profBtn: "[ CONFIRM IDENTITY & LOGIN ]",

      introTitle: "TRILOGY-2215 // FBI SECURE NETWORK",
      introSub: "Restricted area. Exclusive to Senior Agent Holmes.",
      bootLogs: [
        "Connecting to national server hub...",
        "Authenticating ID FBI-A042... SUCCESS.",
        "Welcome back, Agent Holmes.",
        "Extracting dossier: 'The David Vance Family Murder'...",
        "System ready. Access granted."
      ],
      startButton: "[ OPEN DESK / INITIALIZE ]",
      exitBtn: "[ LOGOUT ]",
      title: "TRILOGY-2215: FATAL ANOMALY",
      subtitle: "[PART 1: LOGIC TRAP - UNDER INVESTIGATION]",
      
      briefingTitle: ">> EXTENDED CRIME SCENE REPORT <<",
      briefingLines: [
        "CASE ID: HMD-092 | UNIT: FBI Major Case Squad District 4.",
        "VICTIMS: David Vance, wife Eleanor, and butler Thomas.",
        "AUTOPSY: Bodies found in a locked bedroom. No signs of struggle. Strangely, the room temperature upon discovery was freezing (Nearly 0°C).",
        "SECURITY: All security cameras wiped. The perpetrator is highly skilled in IT.",
        "EVIDENCE: 1 gasoline-powered generator (exactly 5 LITERS capacity) found pumping CO into the AC unit. The fuel tank is COMPLETELY EMPTY."
      ],
      
      cards: [
        { id: 1, title: "[FORENSIC REPORT]", tag: "T.O.D: 21:45 - 22:15", desc: "Estimated Time of Death (T.O.D) between 21:45 and 22:15 last night based on rigor mortis.", detail: "FORENSIC REPORT (#FB-9921):\n- CO concentration > 70%.\n- Abnormal temperature detected: The cooling system was tampered with down to 0°C immediately after death. This caused rapid freezing, misleading the coroner into miscalculating the death time back by 2 hours (Actual time of death: 00:00 midnight)." },
        { id: 2, title: "[SUSPECT STATEMENT]", tag: "SUBJECT: SARAH", desc: "Sarah claims: Left the mansion at 21:00 in a Porsche (Max capacity 45L) heading downtown.", detail: "INTERROGATION TRANSCRIPT:\n- Sarah insists she drove away alone at 21:00.\n- She has no knowledge of her credit card being swiped at 22:12 at a suburban gas station." },
        { id: 3, title: "[TRAFFIC CAMERA]", tag: "RED HERRING", desc: "Porsche passed the toll booth at 21:30. Camera clock hacked, running 5 minutes fast.", detail: "SECURITY FOOTAGE CAM #4:\n- Footage records the Porsche passing at 21:30.\n- Server logs show the hacked camera clock ran 5 minutes fast (Actual passage time: 21:25).\n- The drive from the mansion to the toll booth takes only 15 minutes." },
        { id: 4, title: "[SUPERMARKET RECEIPT]", tag: "TIME: 22:10", desc: "Transaction at 22:10. Sarah's card paid for supplies downtown.", detail: "ELECTRONIC RECEIPT:\n- Time: 22:10 at Downtown Supermarket.\n- A masterstroke by the killer to build a fake alibi for the cardholder." },
        { id: 5, title: "[GAS STATION RECEIPT]", tag: "STATUS: ANOMALY", desc: "Gas station logs show Sarah's card paying for exactly 50 LITERS of gas at 22:12.", detail: "PUMP #7 DATA:\n- Time: 22:12.\n- Fuel pumped: 50 Liters.\n- ABSURDITY: Sarah's Porsche registration manual explicitly states the max fuel tank capacity is strictly 45 Liters." }
      ],

      gameOverTitle: "SYSTEM LOCKED",
      gameOverDesc: "REASONING FAILED. SECURITY PROTOCOL SELF-DESTRUCTED.",
      rebootBtn: "[ REBOOT SYSTEM ]",

      conclusionTitle: ">> FINAL STEP: EXPOSE THE METHOD <<",
      conclusionText: "The Logic Triangle alibi has been shattered!\nThe gas station car pumped 50 Liters, but Sarah's real car only holds 45 Liters. The travel time is off by 10 minutes. The perpetrator cloned the card, forged license plates, and rented another Porsche to hide the real car, framing Sarah.\n\nBUT to make the plan foolproof, he needed to manipulate the time of death. Answer the final question: Which smart home system in the mansion was hacked by the killer to drop the room temperature to 0°C?",
      placeholder: "Enter system name...",
      submitBtn: "[ CONCLUDE CASE ]",
      
      victoryTitle: "TRUTH EXPOSED",
      victoryDesc: "Brilliant deduction, Holmes! The perpetrator is none other than ZODIAC. He orchestrated a vicious masterpiece of crime:\n\nZodiac pumped CO to murder the Vances at 00:00. He hacked the Smarthome to DROP ROOM TEMP TO 0°C, speeding up corpse freezing, tricking the coroner into pushing T.O.D back to 21:45 to match Sarah's fake alibi.\n\nRealizing his framing plot failed due to your deduction notebook, Zodiac immediately broke into Sarah's home, forcing her death to silence witnesses.\n\nZodiac has vanished, leaving behind a blood-soaked folded note at Sarah's house...",
      unlockBtn: "[ UNLOCK PART 2: THE BLOODY CIPHER ]",

      // --- PHẦN 2 ---
      p2Title: "TRILOGY-2215: THE BLOODY CIPHER",
      p2Subtitle: "[PART 2: ZODIAC'S PROVOCATION]",
      p2BriefingTitle: ">> SECOND CRIME SCENE: SARAH'S LUXURY APARTMENT <<",
      p2BriefingLines: [
        "LOCATION: Independent apartment complex in the western district of the city.",
        "CRIME SCENE CLUE: Her stiffened hand still clutches a crumpled, dried blood-stained note — a direct message left exclusively by Zodiac for Holmes's mind."
      ],
      p2Cards: [
        { id: 101, title: "[FORENSIC REPORT P.2]", tag: "CAUSE: KCL", desc: "Confirmed Sarah died from an injection of Potassium Chloride (KCl) solution.", detail: "SARAH AUTOPSY FILE (#AUT-881):\n- Biological traces: A faint needle mark on the left wrist. No fingerprints of Sarah found on the syringe." },
        { id: 103, title: "[BLOODY NOTE]", tag: "BLOODY_NOTE.PNG", desc: "Zodiac's blood letter sent directly to Holmes containing a bizarre cipher.", detail: "CIPHER ANALYSIS:\n- Uppercase character sequence using classical Caesar Cipher:\n  W K L V - L V - M X V W - W K H - E H J L Q Q L Q J" },
        { id: 104, title: "[USB ON THE LOFT]", tag: "HIDDEN_SYMBOL.PNG", desc: "A USB drive placed on the desk, recording the shadow of Zodiac leaving the apartment.", detail: "SECURITY FOOTAGE:\n- Video file captures a hooded, masked figure calmly stepping out the door at 03:15." }
      ],
      p2OpenTerminal: "[ CIPHER DECRYPTION TERMINAL ]",
      p2TerminalTitle: ">> CAESAR CIPHER DECRYPTION DESK <<",
      p2TerminalDesc: "Caesar ciphers always require a shift key number. Find the **total number of lives** taken during that freezing night at the Vance mansion (Part 1 Case) to use as the backward shift Key.\n\nCiphertext: W K L V - L V - M X V W - W K H - E H J L Q Q L Q J",
      p2Placeholder: "Enter decrypted message...",
      p2Submit: "[ DECRYPT & LOCATE COORDINATES ]",
      p2VictoryTitle: "COORDINATES CONFIRMED",
      p2VictoryDesc: "Outstanding, Agent Holmes!\nThe shift Key is 3 (Corresponding to the 3 victims of the Vance family). Shifting back 3 steps, the message decrypts to:\n\n'THIS IS JUST THE BEGINNING'\n\nRadar signals detected the hidden USB connected to Sector 7 station. Zodiac is waiting for you there!",
      p2FinalBtn: "[ READY TO LAUNCH PART 3 ]",

      // --- PHẦN 3 ---
      p3Title: "TRILOGY-2215: THE ULTIMATE CONVERGENCE",
      p3Subtitle: "[PART 3: THE FINAL BATTLE]",
      p3BriefingTitle: ">> SECTOR 7 WASTEWATER TREATMENT PLANT <<",
      p3BriefingLines: [
        "STATUS: In the center of the room, a neurotoxin dissemination device is counting down.",
        "DEFENSE SYSTEM: Sector 7 is locked tightly via Mathematical Matrix. 3 incorrect entries will trigger the poison gas release valves, burying the entire tactical squad."
      ],
      p3Cards: [
        { id: 201, title: "[CONTROL MONITOR]", tag: "MATRIX LOCK", desc: "Industrial screen displaying the matrix sequence:\n88 → 69 → 19 → 1311 → 1330 → [ ? ]", detail: "DATA LOG (#CRT-01):\n- 'Mathematics never lies, but death can. Find the missing final number'.\n- 88 → 69 → 19 → 1311 → 1330 → [ ? ]." },
        { id: 203, title: "[ZODIAC'S NOTE]", tag: "ZODIAC'S NOTE", desc: "A malicious message carved into the metal wall.", detail: "MESSAGE:\n- 'The law of this world is the manipulation among those standing before you. Addition, Subtraction, Multiplication, Division... all are tools of Death.'" }
      ],
      p3OpenTerminal: "[ ACCESS MATRIX LOCK ]",
      p3TerminalTitle: ">> MATHEMATICAL MATRIX LOCK <<",
      p3TerminalDesc: "SYSTEM COUNTDOWN ACTIVE. Find the final missing number:\n\n88 → 69 → 19 → 1311 → 1330 → [ ? ]",
      p3Placeholder: "Enter answer number...",
      p3Submit: "[ DISABLE SYSTEM ]",

      season2Title: "END OF SEASON 1",
      season2Desc: "Holmes took aim with his GLOCK 19M. The bullet struck Zodiac's left shoulder, but he still plunged into the underground river and escaped.\n\n10 years later:\nAn anonymous package sent to Holmes containing a bloody mask:\n'I HAVE RETURNED FOR REVENGE...'\n\nThe scar on his left shoulder still aches. A larger game of life and death is about to begin.",
      season2Footer: "TO BE CONTINUED IN SEASON 2",
      footer: "CASE WRITTEN BY MINH TRI"
    }
  };

  const t = content[locale];

  const getBackgroundClass = () => {
    if (gameStage <= -1) return "bg-black";
    if (gameStage === 12) return "bg-[url('/end3.png')]";
    if (gameStage === 9) return "bg-[url('/end2.png')]";
    if (gameStage >= 10 && gameStage <= 14) return "bg-[url('/sector7_plant.png')]";
    if (gameStage >= 7 && gameStage <= 13) return "bg-[url('/apartment_scene.png')]";
    return (gameStage >= 2 && gameStage <= 6) ? "bg-[url('/scene.png')]": "bg-[url('/fbi.png')]";
  };

  // ==========================================
  // 🧠 GAME LOGIC HANDLERS
  // ==========================================
  const handleDeduction = () => {
    if (!slot1 || !slot2) {
      setDeductError(locale === "vi" ? "Cần 2 mảnh ghép để phân tích." : "Need 2 clues.");
      return;
    }

    const ids = [slot1.id, slot2.id].sort((a,b) => a - b); 
    
    if (ids[0] === 2 && ids[1] === 5) {
      if (!collectedClues.find(c => c.id === 1001)) {
        setCollectedClues([...collectedClues, {
          id: 1001,
          title: locale === "vi" ? "[KẾT LUẬN: TANG VẬT 5 LÍT]" : "[CONCLUSION: 5L EVIDENCE]",
          tag: "ANOMALY",
          desc: locale === "vi" ? "Xe chứa 45L nhưng bơm 50L. 5 Lít thừa dùng cho việc khác." : "Car holds 45L, pumped 50L. 5L used for something else.",
          detail: locale === "vi" ? "SUY LUẬN LOGIC:\nPhát hiện mâu thuẫn giữa Lời khai (45L) và Dữ liệu trạm xăng (50L).\nHung thủ đã rút ruột 5 Lít xăng để vận hành máy phát điện khí CO." : "LOGIC DEDUCTION:\nAnomaly between Statement and Gas Pump. Killer extracted 5L for the CO generator."
        }]);
        setSlot1(null); setSlot2(null);
      } else { setDeductError(locale === "vi" ? "Đã suy luận ra liên kết này rồi." : "Already deduced."); }
    }
    else if (ids[0] === 2 && ids[1] === 3) {
      if (!collectedClues.find(c => c.id === 1002)) {
        setCollectedClues([...collectedClues, {
          id: 1002,
          title: locale === "vi" ? "[KẾT LUẬN: GÓC KHUẤT 10 PHÚT]" : "[CONCLUSION: 10 MIN GAP]",
          tag: "TIME GAP",
          desc: locale === "vi" ? "Đi 15p tới nơi nhưng mất 25p mới qua trạm. Dư 10 phút." : "Took 25 mins for a 15 min drive. 10 mins missing.",
          detail: locale === "vi" ? "SUY LUẬN LOGIC:\nRời nhà 21:00, thực tế qua trạm lúc 21:25 (do camera nhanh 5p). Mất 15p di chuyển -> Có 10 phút chiếc xe bị giấu đi. Thời gian đủ để đánh tráo biển số." : "LOGIC DEDUCTION:\nLeft at 21:00, passed toll at 21:25. 15 min drive -> 10 mins missing to swap plates."
        }]);
        setSlot1(null); setSlot2(null);
      } else { setDeductError(locale === "vi" ? "Đã suy luận ra liên kết này rồi." : "Already deduced."); }
    }
    else if (ids[0] === 1001 && ids[1] === 1002) {
      setIsNotebookOpen(false); 
      setGameStage(4); 
    }
    else {
      let newHp = lives_P1 - 1;
      setLives_P1(newHp);
      if (newHp <= 1) {
        setIsNotebookOpen(false);
        setGameStage(5);
      } else {
        setDeductError(locale === "vi" ? `Liên kết vô nghĩa. Trừ 1 mạng. Còn ${newHp - 1} mạng.` : `Invalid logic. ${newHp - 1} strikes left.`);
        setSlot1(null); setSlot2(null);
      }
    }
  };

  const checkFinalAnswerP1 = (e) => {
    e.preventDefault();
    const ans = ans_P1_final.toLowerCase().replace(/\s+/g, "");
    if (ans.includes("smarthome") || ans.includes("smart home")) {
      setGameStage(6);
    } else {
      let newHp = lives_P1 - 1;
      setLives_P1(newHp);
      if (newHp <= 1) return setGameStage(5);
      setErrAlertP1(locale === "vi" ? `Câu trả lời sai! Còn ${newHp - 1} mạng.` : `Wrong answer! ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP1(""), 5000);
    }
  };

  const decodeCaesar = (e) => {
    e.preventDefault();
    const cleanAns = ans_P2_cipher.toLowerCase().trim();
    if (cleanAns.includes("this is just the beginning")) {
      setGameStage(9);
    } else {
      let newHp = lives_P2 - 1;
      setLives_P2(newHp);
      if (newHp <= 1) return setGameStage(13);
      setErrAlertP2(locale === "vi" ? `Mật mã sai! Còn ${newHp - 1} mạng.` : `Incorrect cipher! ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP2(""), 5000);
    }
  };

  const defuseBomb = (e) => {
    e.preventDefault();
    const cleanAns = ans_P3_matrix.trim();
    if (cleanAns === "2641") {
      setGameStage(12);
    } else {
      let newHp = lives_P3 - 1;
      setLives_P3(newHp);
      if (newHp <= 1) return setGameStage(14);
      setErrAlertP3(locale === "vi" ? `Mã khóa ma trận sai! Còn ${newHp - 1} mạng.` : `Incorrect matrix lock! ${newHp - 1} strikes left.`);
      setTimeout(() => setErrAlertP3(""), 5000);
    }
  };

  const TopStatusBar = () => (
    <div className="flex justify-between items-center w-full mb-8 pb-4 border-b border-zinc-800 relative z-50">
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-amber-500 tracking-widest animate-pulse">[SECURE_BOOT_v5.1_MASTERPIECE]</span>
        <button onClick={(e) => { e.stopPropagation(); setSoundOff(!soundOff); }} className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-all cursor-pointer border border-zinc-700 px-2 py-0.5 rounded">
          {locale === "vi" ? `[ ÂM THANH: ${soundOff ? "TẮT" : "BẬT"} ]` : `[ SOUND: ${soundOff ? "OFF" : "ON"} ]`}
        </button>
      </div>
      {gameStage >= 2 && ![5, 6, 9, 12, 13, 14, 15].includes(gameStage) && (
        <span className="text-xs font-mono text-red-400 border border-red-900 bg-red-950/50 px-3 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          {locale === "vi" ? "MẠNG SỐNG" : "STRIKES"}: {gameStage >= 7 && gameStage <= 9 ? lives_P2 : gameStage >= 10 ? lives_P3 : lives_P1}/3
        </span>
      )}
    </div>
  );

  const CopyrightFooter = () => (
    <div className="w-full mt-10 pt-6 border-t border-zinc-800/50 text-center z-20 relative pb-16">
      <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
        <TerminalText text={t.footer} speed={20} delay={1000} skip={skipAll} noCursor />
      </span>
    </div>
  );

  if (gameStage === -3) {
    return (
      <main onClick={() => {setSoundOff(false); if(bgTrack) bgTrack.play(); setGameStage(-2);}} onTouchStart={() => {setSoundOff(false); if(bgTrack) bgTrack.play(); setGameStage(-2);}} className="h-screen w-full bg-black flex items-center justify-center cursor-pointer relative">
         <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
         <div className="text-zinc-500 font-mono tracking-widest animate-pulse text-sm text-center px-4 relative z-10">
            {locale === "vi" ? "[ NHẤN ENTER HOẶC CHẠM MÀN HÌNH ĐỂ BẮT ĐẦU ]" : "[ PRESS ENTER OR TAP SCREEN TO START ]"}
         </div>
      </main>
    );
  }

  if (gameStage === -2) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-slate-300 font-mono p-4 md:p-12 relative overflow-y-auto py-20">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
           <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-zinc-600 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer rounded text-xs font-mono">
             <TerminalText text={t.langBtn} speed={30} skip={skipAll} noCursor/>
           </button>
        </div>
        <div className="max-w-4xl text-center space-y-8 md:space-y-12 z-10 relative mt-10">
           {t.cinematicLines.map((text, idx) => (
              <div key={idx} className="text-sm md:text-lg lg:text-xl tracking-widest leading-loose whitespace-pre-wrap [text-shadow:0_0_8px_rgba(255,255,255,0.4)]">
                <TerminalText text={text} speed={25} delay={1000 + idx * 4500} skip={skipAll} noCursor />
              </div>
           ))}
           <div className="mt-16 pt-12 pb-12 flex justify-center">
             <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(-1); }} className="px-8 py-3 border border-zinc-700 text-zinc-400 hover:text-cyan-400 hover:border-cyan-400 hover:bg-cyan-900/20 transition-all font-mono text-xs tracking-widest rounded animate-pulse cursor-pointer relative z-50">
               <TerminalText text={locale === "vi" ? "[ TIẾP CẬN HỆ THỐNG ]" : "[ ACCESS SYSTEM ]"} delay={skipAll ? 0 : 23000} skip={skipAll} noCursor />
             </button>
           </div>
        </div>
      </main>
    );
  }

  if (gameStage === -1) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full bg-black text-cyan-500 font-mono p-6 md:p-12 flex flex-col justify-center items-center relative overflow-y-auto">
        <style dangerouslySetInnerHTML={{__html: `.crt-turn-on { animation: crtOn 1s ease-out forwards; } @keyframes crtOn { 0% { transform: scale(1, 0.01); opacity: 0; filter: brightness(10); } 40% { transform: scale(1, 0.01); opacity: 1; filter: brightness(5); } 100% { transform: scale(1, 1); opacity: 1; filter: brightness(1); } }`}} />
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="max-w-2xl w-full z-10 crt-turn-on relative">
          {t.bootTermLines.map((text, idx) => (
            <div key={idx} className="mb-6 text-sm md:text-xl tracking-widest font-bold">
              <TerminalText text={text} speed={20} delay={500 + idx * 1200} skip={skipAll} />
            </div>
          ))}
          <div className="mt-16 relative z-50">
             <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(0); }} className="w-full py-4 border border-cyan-500 hover:bg-cyan-400 hover:text-black transition-all tracking-widest font-bold rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer relative z-50">
               <TerminalText text={locale === "vi" ? "[ XÁC NHẬN TRUY CẬP PROFILE ]" : "[ CONFIRM PROFILE ACCESS ]"} delay={skipAll ? 0 : 7000} skip={skipAll} noCursor />
             </button>
          </div>
        </div>
      </main>
    );
  }

  if (gameStage === 15) {
    return (
      <main className="h-screen w-full flex flex-col items-center justify-center bg-black text-zinc-600 font-mono text-sm relative">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="animate-pulse mb-4 z-10 text-lg">SYSTEM SHUTDOWN COMPLETE.</div>
        <div className="z-10">{locale === "vi" ? "BẠN CÓ THỂ ĐÓNG TAB TRÌNH DUYỆT NÀY." : "YOU MAY CLOSE THIS WINDOW."}</div>
      </main>
    );
  }

  if (gameStage === 0 || gameStage === 1) {
    return (
      <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100`}>
        <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-8">
          <div className="w-full max-w-2xl mx-auto my-auto bg-zinc-950/90 border border-cyan-900/50 p-6 md:p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex justify-between items-center w-full mb-8 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-amber-500 tracking-widest animate-pulse">[SECURE_BOOT_v5.1]</span>
                <button onClick={(e) => { e.stopPropagation(); setSoundOff(!soundOff); }} className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-all cursor-pointer border border-zinc-700 px-2 py-0.5 rounded z-50 relative">
                  {locale === "vi" ? `[ ÂM THANH: ${soundOff ? "TẮT" : "BẬT"} ]` : `[ SOUND: ${soundOff ? "OFF" : "ON"} ]`}
                </button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-zinc-600 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer rounded text-xs font-mono z-50 relative">
                <TerminalText text={t.langBtn} speed={30} skip={skipAll} noCursor/>
              </button>
            </div>
            {gameStage === 0 ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-amber-500 mb-4 border-b border-zinc-800 pb-2"><TerminalText text={t.profTitle} delay={200} skip={skipAll} /></h1>
                <div className="font-mono text-sm text-cyan-400 space-y-2 mb-8">
                  <p><TerminalText text={t.profLine1} delay={1000} skip={skipAll} /></p>
                  <p><TerminalText text={t.profLine2} delay={1800} skip={skipAll} /></p>
                  <p><TerminalText text={t.profLine3} delay={2800} skip={skipAll} /></p>
                </div>
                <h2 className="text-md font-bold font-mono text-amber-500 mb-4"><TerminalText text={t.profHeader} delay={3500} skip={skipAll} /></h2>
                <div className="font-mono text-sm text-zinc-300 space-y-4 mb-10 leading-relaxed">
                  <p><TerminalText text={t.profP1} speed={10} delay={4500} skip={skipAll} /></p>
                  <p><TerminalText text={t.profP2} speed={10} delay={6500} skip={skipAll} /></p>
                  <p><TerminalText text={t.profP3} speed={10} delay={8500} skip={skipAll} /></p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(1); }} className="w-full py-4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono font-bold tracking-widest hover:bg-cyan-400 hover:text-black transition-all cursor-pointer rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] z-50 relative">
                  <TerminalText text={t.profBtn} delay={11000} skip={skipAll} noCursor />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-cyan-400 mb-2"><TerminalText text={t.introTitle} delay={200} skip={skipAll} /></h1>
                <p className="text-xs text-zinc-400 font-mono mb-6 border-b border-zinc-800 pb-4"><TerminalText text={t.introSub} delay={800} skip={skipAll} /></p>
                <div className="bg-black/60 p-4 rounded border border-zinc-800 font-mono text-xs text-zinc-300 space-y-3 mb-8">
                  {t.bootLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2"><span className="text-cyan-400 mt-1">&gt;</span><p><TerminalText text={log} delay={1200 + (idx * 500)} skip={skipAll} /></p></div>
                  ))}
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(2); }} className="w-full py-4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono font-bold hover:bg-cyan-400 hover:text-black transition-all cursor-pointer rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] z-50 relative">
                  <TerminalText text={t.startButton} delay={4000} skip={skipAll} noCursor />
                </button>
              </>
            )}
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  if (gameStage === 5 || gameStage === 13 || gameStage === 14) {
    let title = t.gameOverTitle;
    let desc = t.gameOverDesc;
    let action = () => window.location.reload();

    if (gameStage === 13) {
      title = locale === "vi" ? "HẾT MẠNG - KHÓA MẬT MÃ" : "OUT OF STRIKES - LOCKED";
      desc = locale === "vi" ? "Hệ thống reset lại hiện trường Phần 2." : "Resetting Part 2 scene.";
      action = () => { setLives_P2(3); setAns_P2_cipher(""); setGameStage(7); };
    }
    if (gameStage === 14) {
      title = locale === "vi" ? "PHÁT NỔ - THẤT BẠI" : "DETONATED - FAILED";
      desc = locale === "vi" ? "Trạm xử lý xả khí độc. Hệ thống khôi phục." : "Toxic gas released. Restoring timeline.";
      action = () => { setLives_P3(3); setAns_P3_matrix(""); setBombTimer(300); setGameStage(10); };
    }

    return (
      <main className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100 flex flex-col justify-center">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 w-full max-w-lg mx-auto p-4 md:p-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]">{title}</h1>
          <p className="text-zinc-400 font-mono mb-8 leading-relaxed"><TerminalText text={desc} speed={20} /></p>
          <button onClick={action} className="px-6 py-3 border border-red-600 text-red-500 font-mono hover:bg-red-900 transition-all rounded cursor-pointer relative z-50">
            <TerminalText text={t.rebootBtn} delay={1000} noCursor />
          </button>
        </div>
      </main>
    );
  }

  if (gameStage === 6) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade { animation: fadeIn 2s ease-in 7.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-6 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">
              <TerminalText text={t.victoryTitle} speed={20} skip={skipAll} />
            </h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-900/50 p-6 md:p-10 border border-cyan-900 rounded text-left whitespace-pre-wrap shadow-[0_0_30px_rgba(56,189,248,0.1)] w-full h-auto relative z-10">
              <TerminalText text={t.victoryDesc} speed={10} delay={500} skip={skipAll} />
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(7); }} className={`${skipAll ? 'opacity-100' : 'delayed-fade'} px-8 py-4 bg-amber-500 text-black font-bold font-mono tracking-widest hover:bg-amber-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)] rounded animate-pulse z-50 relative`}>
              <TerminalText text={t.unlockBtn} delay={skipAll ? 0 : 8500} skip={skipAll} noCursor />
            </button>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  if (gameStage === 9) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-[url('/end2.png')] bg-cover bg-center bg-fixed text-slate-100">
        <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-3xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-6 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]"><TerminalText text={t.p2VictoryTitle} speed={20} skip={skipAll} /></h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-950/80 p-6 md:p-10 border border-cyan-900 rounded text-center whitespace-pre-wrap shadow-[0_0_40px_rgba(56,189,248,0.2)] backdrop-blur-md w-full relative z-10">
              <TerminalText text={t.p2VictoryDesc} speed={10} delay={500} skip={skipAll} />
            </div>
            <button onClick={(e) => { e.stopPropagation(); setBombTimer(300); setSkipAll(false); setGameStage(10); }} className="px-8 py-4 bg-cyan-400 text-black font-bold font-mono tracking-widest hover:bg-cyan-300 transition-all cursor-pointer rounded shadow-[0_0_20px_rgba(56,189,248,0.5)] z-50 relative">
              <TerminalText text={t.p2FinalBtn} delay={skipAll ? 0 : 5000} skip={skipAll} noCursor />
            </button>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  if (gameStage === 12) {
    return (
      <main onClick={() => setSkipAll(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-[url('/end3.png')] bg-cover bg-center bg-fixed text-slate-100">
        <div className="fixed inset-0 bg-black/80 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade-btns { animation: fadeIn 2s ease-in 10.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]"><TerminalText text={locale === "vi" ? "KẾT THÚC MÙA 1" : "END OF SEASON 1"} speed={20} skip={skipAll} /></h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-950/90 p-6 md:p-10 border border-red-900 rounded text-left whitespace-pre-wrap shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-md w-full relative z-10">
              <TerminalText text={t.season2Desc} speed={10} delay={500} skip={skipAll} />
            </div>
            <div className={`${skipAll ? 'opacity-100' : 'delayed-fade-btns'} flex flex-col md:flex-row justify-center gap-4 mt-12 w-full z-50 relative`}>
              <button onClick={() => window.location.href = '/case2215/season2'} className="px-8 py-4 bg-red-600 text-white font-bold font-mono tracking-widest hover:bg-red-500 transition-all rounded shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse">
                {locale === "vi" ? "[ TIẾP TỤC ĐẾN SEASON 2 ]" : "[ PROCEED TO SEASON 2 ]"}
              </button>
            </div>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  return (
    <main onClick={() => setSkipAll(true)} className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100 transition-all duration-1000 flex flex-col`}>
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none"></div>
      <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>

      {gameStage === 2 && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsNotebookOpen(true); }}
          className="fixed bottom-6 right-6 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer rounded-sm hover:scale-105 z-40 animate-pulse border-2 border-amber-600"
        >
          {t.nbBtn}
        </button>
      )}

      <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12 max-w-7xl mx-auto w-full pb-32">
        <TopStatusBar />
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-zinc-800 pb-6">
          <div className="mb-4 md:mb-0">
            <span className="text-xs tracking-widest text-amber-500 font-mono">
              <TerminalText text={gameStage >= 10 ? t.p3Subtitle : (gameStage >= 7 ? t.p2Subtitle : t.subtitle)} speed={20} skip={skipAll} />
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-mono tracking-wider mt-2 text-cyan-400 break-words [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">
              <TerminalText text={gameStage >= 10 ? t.p3Title : (gameStage >= 7 ? t.p2Title : t.title)} speed={25} delay={300} skip={skipAll} />
            </h1>
          </div>
          <div className="flex gap-4 z-50 mt-4 md:mt-0">
             <button onClick={(e) => { e.stopPropagation(); window.location.href = '/'; }} className="px-4 py-2 border border-zinc-800 bg-black hover:border-cyan-400 hover:text-cyan-400 text-xs font-mono rounded cursor-pointer transition-all">{t.exitBtn}</button>
             <button onClick={(e) => { e.stopPropagation(); setLocale(locale === "vi" ? "en" : "vi"); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 text-xs font-mono transition-all rounded cursor-pointer">{t.langBtn}</button>
          </div>
        </header>

        {gameStage === 4 ? (
          <div className="max-w-3xl mx-auto mt-12 bg-zinc-950/90 border border-cyan-400 p-6 md:p-8 rounded shadow-[0_0_50px_rgba(56,189,248,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
            <h2 className="text-xl font-bold font-mono text-cyan-400 mb-6 [text-shadow:0_0_8px_rgba(34,211,238,0.8)]"><TerminalText text={t.conclusionTitle} speed={20} skip={skipAll} /></h2>
            {errAlertP1 && ( <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">⚠️ {errAlertP1}</div> )}
            <div className="font-mono text-zinc-300 leading-loose mb-8 whitespace-pre-wrap flex-grow">
              <TerminalText text={t.conclusionText} speed={15} delay={500} skip={skipAll} />
            </div>
            <form onSubmit={checkFinalAnswerP1} className="flex flex-col mt-auto">
              <input type="text" autoFocus value={ans_P1_final} onChange={(e) => setAns_P1_final(e.target.value)} placeholder={t.placeholder} onClick={(e) => e.stopPropagation()} className="w-full bg-black border-2 border-zinc-700 focus:border-amber-500 text-amber-500 font-mono p-4 rounded outline-none transition-all text-center tracking-widest text-lg shadow-inner uppercase mb-4" />
              <div className="flex flex-col md:flex-row gap-4">
                <button type="submit" onClick={(e) => e.stopPropagation()} className="w-full px-4 py-4 bg-cyan-400 text-black font-bold font-mono hover:bg-cyan-300 transition-all cursor-pointer rounded tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  {t.submitBtn}
                </button>
              </div>
            </form>
          </div>
        ) : gameStage === 8 ? (
          <div className="max-w-4xl mx-auto mt-6 bg-zinc-950/95 border border-red-500 p-6 md:p-10 rounded shadow-[0_0_50px_rgba(239,68,68,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
            <h2 className="text-xl font-bold font-mono text-red-500 mb-6 [text-shadow:0_0_8px_rgba(239,68,68,0.8)]"><TerminalText text={t.p2TerminalTitle} speed={20} skip={skipAll} /></h2>
            {errAlertP2 && ( <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">⚠️ {errAlertP2}</div> )}
            <div className="font-mono text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap bg-black/60 p-4 rounded border border-zinc-900 text-sm md:text-base">
              <TerminalText text={t.p2TerminalDesc} speed={15} delay={300} skip={skipAll} />
            </div>
            <form onSubmit={decodeCaesar} className="flex flex-col mt-auto">
              <input type="text" autoFocus value={ans_P2_cipher} onChange={(e) => setAns_P2_cipher(e.target.value)} placeholder={t.p2Placeholder} onClick={(e) => e.stopPropagation()} className="w-full bg-black border-2 border-zinc-700 focus:border-red-500 text-red-400 font-mono p-4 rounded outline-none transition-all uppercase text-lg tracking-widest text-center shadow-inner mb-4" />
              <div className="flex flex-col md:flex-row gap-4">
                <button type="button" onClick={(e) => { e.stopPropagation(); setGameStage(7); }} className="w-full md:w-1/3 px-4 py-4 bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold font-mono hover:text-white transition-all cursor-pointer rounded tracking-widest text-center shadow-inner">{t.backToDocsBtn}</button>
                <button type="submit" onClick={(e) => e.stopPropagation()} className="w-full md:w-2/3 px-8 py-4 bg-red-600 text-white font-bold font-mono hover:bg-red-500 transition-all cursor-pointer rounded tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">{t.p2Submit}</button>
              </div>
            </form>
          </div>
        ) : gameStage === 11 ? (
          <div className="max-w-3xl mx-auto mt-6 bg-zinc-950/95 border border-amber-500 p-6 md:p-10 rounded shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-mono text-amber-500 mb-4 md:mb-0"><TerminalText text={t.p3TerminalTitle} speed={20} skip={skipAll} /></h2>
              <div className={`text-4xl font-bold font-mono bg-black px-4 py-2 rounded border ${bombTimer <= 60 ? 'text-red-500 border-red-500 animate-pulse' : 'text-amber-500 border-amber-500'}`}>[ {formatTimer(bombTimer)} ]</div>
            </div>
            {errAlertP3 && ( <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">⚠️ {errAlertP3}</div> )}
            <div className="font-mono text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap bg-black/70 p-6 rounded border border-zinc-900 text-center text-lg md:text-xl tracking-widest">
              <TerminalText text={t.p3TerminalDesc} speed={15} delay={300} skip={skipAll} />
            </div>
            <form onSubmit={defuseBomb} className="flex flex-col mt-auto">
              <input type="text" autoFocus value={ans_P3_matrix} onChange={(e) => setAns_P3_matrix(e.target.value)} placeholder={t.p3Placeholder} onClick={(e) => e.stopPropagation()} className="w-full bg-black border-2 border-zinc-700 focus:border-amber-500 text-amber-500 font-mono p-4 rounded outline-none transition-all text-2xl tracking-widest text-center shadow-inner mb-4" />
              <div className="flex flex-col md:flex-row gap-4">
                <button type="button" onClick={(e) => { e.stopPropagation(); setGameStage(10); }} className="w-full md:w-1/3 px-4 py-4 bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold font-mono hover:text-white transition-all cursor-pointer rounded tracking-widest text-center shadow-inner">{t.backToDocsBtn}</button>
                <button type="submit" onClick={(e) => e.stopPropagation()} className="w-full md:w-2/3 px-8 py-4 bg-amber-500 text-black font-bold font-mono hover:bg-amber-400 transition-all cursor-pointer rounded tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)]">{t.p3Submit}</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className={`mb-10 p-6 bg-zinc-950/80 border ${gameStage >= 10 ? 'border-amber-900/60' : (gameStage >= 7 ? 'border-red-900/60' : 'border-cyan-900/60')} rounded flex flex-col h-auto relative z-10`}>
              <h2 className={`text-md font-bold font-mono ${gameStage >= 10 ? 'text-amber-500' : (gameStage >= 7 ? 'text-red-500' : 'text-amber-500')} mb-4 border-b border-zinc-800 pb-2`}>
                <TerminalText text={gameStage >= 10 ? t.p3BriefingTitle : (gameStage >= 7 ? t.p2BriefingTitle : t.briefingTitle)} speed={20} delay={500} skip={skipAll} />
              </h2>
              <div className="font-mono text-sm text-zinc-300 space-y-3 whitespace-pre-wrap flex-grow">
                {(gameStage >= 10 ? t.p3BriefingLines : (gameStage >= 7 ? t.p2BriefingLines : t.briefingLines)).map((line, idx) => (
                  <p key={idx}><TerminalText text={line} speed={10} delay={1000 + (idx * 1200)} skip={skipAll} noCursor={true} /></p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 h-auto relative z-10">
              {(gameStage >= 10 ? t.p3Cards : (gameStage >= 7 ? t.p2Cards : t.cards)).map((card, index) => {
                const baseDelay = 4500 + (index * 600);
                const isP2 = gameStage >= 7 && gameStage < 10;
                const isP3 = gameStage >= 10;
                
                return (
                  <div key={card.id} onClick={(e) => { e.stopPropagation(); setActiveDoc(card); }} className={`p-6 bg-zinc-950/90 border border-zinc-700 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] relative backdrop-blur-md z-30 flex flex-col transition-all hover:-translate-y-1 h-auto cursor-pointer ${isP3 ? 'hover:border-amber-500' : (isP2 ? 'hover:border-red-500' : 'hover:border-cyan-700')}`}>
                    <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-2">
                      <span className={`text-xs font-mono font-bold ${isP3 ? 'text-amber-500' : (isP2 ? 'text-red-500' : 'text-amber-500')}`}><TerminalText text={card.title} speed={15} delay={baseDelay} skip={skipAll} /></span>
                      <span className={`text-[10px] font-mono ${isP2 ? 'text-zinc-500' : 'text-cyan-600'} bg-black px-2 py-0.5 border border-zinc-800 rounded`}><TerminalText text={card.tag} speed={15} delay={baseDelay} skip={skipAll} /></span>
                    </div>
                    <div className="text-zinc-300 text-sm leading-relaxed flex-grow mb-4">
                      <TerminalText text={card.desc} speed={10} delay={baseDelay + 300} skip={skipAll} />
                    </div>
                  </div>
                );
              })}
            </div>

            {gameStage >= 7 && (
              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSkipAll(false); setGameStage(gameStage === 7 ? 8 : 11); }}
                  className={`px-10 py-4 ${gameStage===7 ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-500 hover:bg-amber-400'} text-black font-bold font-mono tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all cursor-pointer rounded-sm hover:scale-105 z-50`}
                >
                  <TerminalText text={gameStage===7 ? t.p2OpenTerminal : t.p3OpenTerminal} speed={15} delay={7500} skip={skipAll} noCursor />
                </button>
              </div>
            )}
          </>
        )}
        <div className="mt-auto pt-8"><CopyrightFooter /></div>
      </div>

      {activeDoc && (
        <div onClick={(e) => { e.stopPropagation(); setActiveDoc(null); }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 z-[150] overflow-y-auto cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className={`bg-zinc-950 border ${gameStage >= 10 ? 'border-amber-500' : (gameStage >= 7 ? 'border-red-500' : 'border-cyan-400')} w-full max-w-2xl max-h-full overflow-y-auto p-6 md:p-8 rounded font-mono shadow-[0_0_40px_rgba(56,189,248,0.2)] relative mt-10 mb-10 cursor-default`}>
            <h2 className={`text-xl font-bold text-slate-100 mb-6 border-l-4 ${gameStage >= 10 ? 'border-amber-500' : (gameStage >= 7 ? 'border-red-500' : 'border-cyan-400')} pl-4`}>
              <TerminalText text={activeDoc.title} speed={20} skip={true} />
            </h2>
            <div className="text-zinc-300 text-sm leading-loose mb-8 bg-black/60 p-4 md:p-6 rounded border border-zinc-800 whitespace-pre-wrap">
              <TerminalText text={activeDoc.detail} speed={10} skip={true} />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-zinc-800 pt-6">
              <button onClick={() => setActiveDoc(null)} className="text-zinc-500 hover:text-white transition-all text-sm w-full sm:w-auto py-2 cursor-pointer">
                {locale === "vi" ? "[ ĐÓNG ]" : "[ CLOSE ]"}
              </button>
              
              {gameStage === 2 && (
                <button 
                  onClick={() => handleSaveClue(activeDoc)}
                  className={`px-6 py-3 font-bold text-xs tracking-widest rounded transition-all ${collectedClues.find(c => c.id === activeDoc.id) ? 'bg-zinc-800 text-emerald-500 border border-emerald-900 cursor-not-allowed' : 'bg-cyan-900/40 text-cyan-400 border border-cyan-700 hover:bg-cyan-600 hover:text-black cursor-pointer'}`}
                >
                  {collectedClues.find(c => c.id === activeDoc.id) ? t.savedClueBtn : t.saveClueBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isNotebookOpen && (
        <div onClick={(e) => { e.stopPropagation(); setIsNotebookOpen(false); }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex justify-center items-center p-4 md:p-8 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl bg-zinc-950 border border-amber-600 rounded flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.2)] cursor-default" style={{ height: '85vh' }}>
            
            <div className="flex justify-between items-end p-6 border-b border-zinc-800 bg-black/50">
               <div className="flex gap-2 md:gap-6 flex-wrap">
                  <button onClick={()=>setNotebookTab('clues')} className={`px-4 py-2 font-mono text-sm md:text-base font-bold tracking-widest transition-all ${notebookTab==='clues' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-600 hover:text-amber-200'}`}>
                    {t.nbTab1}
                  </button>
                  <button onClick={()=>setNotebookTab('deduct')} className={`px-4 py-2 font-mono text-sm md:text-base font-bold tracking-widest transition-all ${notebookTab==='deduct' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-600 hover:text-cyan-200'}`}>
                    {t.nbTab2}
                  </button>
               </div>
               <button onClick={()=>setIsNotebookOpen(false)} className="text-zinc-500 hover:text-red-500 font-mono font-bold tracking-widest text-sm transition-colors mb-2">
                 [ ĐÓNG ]
               </button>
            </div>

            <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
               {notebookTab === 'clues' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {collectedClues.length === 0 ? (
                      <p className="text-zinc-600 font-mono italic col-span-full text-center mt-10">Chưa thu thập manh mối nào...</p>
                    ) : (
                      collectedClues.map(c => (
                        <div key={c.id} className="bg-zinc-900 border border-zinc-700 p-4 rounded font-mono relative">
                           {c.id > 100 ? <span className="absolute top-2 right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span></span> : null}
                           <h3 className={`text-sm font-bold mb-2 ${c.id > 100 ? 'text-cyan-400' : 'text-amber-500'}`}>{c.title}</h3>
                           <p className="text-xs text-zinc-400 leading-relaxed">{c.detail}</p>
                        </div>
                      ))
                    )}
                 </div>
               )}

               {notebookTab === 'deduct' && (
                  <div className="flex flex-col h-full items-center font-mono">
                     <div className="w-full max-w-3xl bg-black/60 border border-cyan-900/50 p-6 md:p-10 rounded mb-8 flex flex-col items-center">
                        <p className="text-cyan-600 text-xs tracking-widest mb-6 uppercase text-center">Bấm vào manh mối bên dưới để đưa lên bàn phân tích</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 w-full">
                           <div onClick={()=>setSlot1(null)} className={`w-full sm:w-64 h-32 border-2 border-dashed ${slot1 ? 'border-cyan-500 bg-cyan-900/20' : 'border-zinc-700 bg-black'} flex items-center justify-center cursor-pointer p-4 text-center rounded transition-all`}> 
                             {slot1 ? <span className="text-sm font-bold text-cyan-300">{slot1.title}</span> : <span className="text-zinc-600 text-xs tracking-widest">{t.emptySlot} 1</span>} 
                           </div>
                           
                           <div className="text-2xl text-zinc-600 font-bold">+</div>
                           
                           <div onClick={()=>setSlot2(null)} className={`w-full sm:w-64 h-32 border-2 border-dashed ${slot2 ? 'border-cyan-500 bg-cyan-900/20' : 'border-zinc-700 bg-black'} flex items-center justify-center cursor-pointer p-4 text-center rounded transition-all`}> 
                             {slot2 ? <span className="text-sm font-bold text-cyan-300">{slot2.title}</span> : <span className="text-zinc-600 text-xs tracking-widest">{t.emptySlot} 2</span>} 
                           </div>
                        </div>

                        {deductError && <div className="text-red-500 text-xs mt-6 animate-pulse">⚠️ {deductError}</div>}

                        <button onClick={handleDeduction} className="mt-8 px-8 py-3 bg-cyan-600 text-black font-bold tracking-widest text-sm hover:bg-cyan-500 transition-all rounded w-full sm:w-auto shadow-[0_0_20px_rgba(8,145,178,0.5)]">
                          {t.deductBtn}
                        </button>
                     </div>

                     <div className="w-full max-w-3xl border-t border-zinc-800 pt-6">
                        <p className="text-zinc-500 text-xs mb-4">KHO MANH MỐI:</p>
                        <div className="flex flex-wrap gap-3">
                           {collectedClues.map(c => (
                             <button 
                               key={c.id} 
                               onClick={()=>assignSlot(c)}
                               disabled={slot1?.id === c.id || slot2?.id === c.id}
                               className={`px-4 py-2 border text-xs tracking-wide rounded transition-all ${slot1?.id === c.id || slot2?.id === c.id ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed' : (c.id > 100 ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300 hover:border-cyan-400' : 'bg-black border-amber-900 text-amber-500 hover:border-amber-400')}`}
                             >
                               {c.title}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.6); }
      `}} />

    </main>
  );
}