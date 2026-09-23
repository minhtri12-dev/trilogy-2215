"use client";

import { useState, useEffect } from "react";

// --- HOOK: HIỆU ỨNG CHỮ ĐÁNH MÁY TERMINAL HIỆN ĐẠI ---
const useTypewriter = (text, speed = 5, delay = 0, skip = false) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    if (skip) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }
    
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
  }, [text, speed, delay, skip]);

  return { displayedText, isTyping };
};

const TypewriterText = ({ text, speed = 5, delay = 0, className, skip = false, noCursor = false }) => {
  const { displayedText, isTyping } = useTypewriter(text, speed, delay, skip);
  return (
    <span className={`${className || ""} [text-shadow:0_0_8px_currentColor] transition-all`}>
      {displayedText}
      {!noCursor && (
        <span className={`inline-block w-2 h-4 ml-1 bg-current align-middle ${isTyping ? "animate-pulse" : "animate-pulse opacity-40"}`}></span>
      )}
    </span>
  );
};

export default function Home() {
  const [lang, setLang] = useState("vi");
  // -3: Click/Enter to Start, -2: Cinematic Trailer, -1: Secure Boot
  // 0: Profile, 1: Boot, 2: Workspace P1, 3: Terminal Logic Code P1, 4: Terminal Keyword P1, 5: Game Over P1
  // 6: Victory P1, 7: Workspace P2, 8: Terminal P2, 9: Victory P2, 13: Game Over P2
  // 10: Workspace P3, 11: Terminal P3 (Matrix Lock), 12: Ultimate Ending, 14: Game Over P3
  // 15: Shutdown System
  const [step, setStep] = useState(-3); 
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  
  // UX State
  const [skipTyping, setSkipTyping] = useState(false);

  // Audio State
  const [bgm, setBgm] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  // Gameplay State P1
  const [logicAnswer, setLogicAnswer] = useState("");
  const [logicError, setLogicError] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [strikesP1, setStrikesP1] = useState(3);

  // Gameplay State P2
  const [cipherAnswer, setCipherAnswer] = useState("");
  const [cipherError, setCipherError] = useState("");
  const [strikesP2, setStrikesP2] = useState(3);

  // Gameplay State P3 (Matrix Lock & Timer)
  const [matrixAnswer, setMatrixAnswer] = useState("");
  const [matrixError, setMatrixError] = useState("");
  const [strikesP3, setStrikesP3] = useState(3);
  const [timeLeft, setTimeLeft] = useState(300);

  // --- LOGIC PHÍM ESC ĐỂ ĐÓNG TÀI LIỆU ---
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedEvidence) {
        setSelectedEvidence(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedEvidence]);

  // Lắng nghe phím ENTER ở màn hình chờ đầu tiên (Step -3)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step === -3 && e.key === 'Enter') {
        setIsMuted(false);
        if (bgm) bgm.play();
        setStep(-2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, bgm]);

  // Reset tính năng Skip mỗi khi chuyển màn hình
  useEffect(() => {
    setSkipTyping(false);
  }, [step, selectedEvidence]);

  // --- LOGIC ÂM THANH ---
  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    setBgm(audio);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (bgm) {
      if (!isMuted) {
        bgm.play().catch(e => {
          console.log("Autoplay blocked:", e);
          setIsMuted(true);
        });
      } else {
        bgm.pause();
      }
    }
  }, [isMuted, bgm]);

  // --- LOGIC BOM HẸN GIỜ PHẦN 3 ---
  useEffect(() => {
    let timer = null;
    if (step === 11 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 11 && timeLeft <= 0) {
      setStep(14);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const content = {
    vi: {
      langBtn: "LANG: [VI]",
      
      cinematicLines: [
        "Washington, 2003.\nMột thế giới nơi những bí mật không bao giờ thực sự biến mất.\nNhững vụ án chưa có lời giải. Những con người biến mất không để lại dấu vết.\nVà những kẻ đứng sau bóng tối... chưa từng để lộ khuôn mặt thật.",
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
        "WELCOME, AGENT AKAI."
      ],

      profTitle: "[ HỒ SƠ NHÂN SỰ LƯU TRỮ - FBI ]",
      profLine1: "Định danh: AKAI (Mã: FBI-A042)",
      profLine2: "Chức vụ: Đặc vụ Cấp cao - Đội Điều Tra Trọng Án",
      profLine3: "Bảo mật: Cấp 5 (Tuyệt mật)",
      profHeader: "[ HỒ SƠ TÂM LÝ & ĐỘNG LỰC ]",
      profP1: "Akai từng là một nhà toán học thiên tài. 5 năm trước, kẻ sát nhân tự xưng là Zodiac đã sát hại người thân duy nhất của anh.",
      profP2: "Zodiac không để lại dấu vết ADN. Hắn chỉ để lại những 'bẫy logic' ngoại phạm hoàn hảo được tính toán bằng các con số nhằm chế giễu FBI.",
      profP3: "Akai gia nhập FBI với một mục tiêu duy nhất: Dùng tư duy sắc lạnh để bẻ gãy mọi bẫy logic, và tự tay đưa Zodiac ra ánh sáng. Bắt đầu từ vụ án gia đình tỷ phú David Vance.",
      profBtn: "[ XÁC NHẬN DANH TÍNH & ĐĂNG NHẬP ]",

      introTitle: "TRILOGY-2215 // MẠNG LƯỚI BẢO MẬT FBI",
      introSub: "Khu vực hạn chế. Dành riêng cho Đặc vụ Akai.",
      bootLogs: [
        "Đang kết nối trung tâm máy chủ cấp quốc gia...",
        "Xác thực mã định danh FBI-A042... THÀNH CÔNG.",
        "Chào mừng trở lại, Đặc vụ Akai.",
        "Đang trích xuất hồ sơ: 'Án mạng gia đình David Vance'...",
        "Hệ thống sẵn sàng. Vui lòng truy cập."
      ],
      startButton: "[ MỞ BÀN LÀM VIỆC / INITIALIZE ]",
      exitBtn: "[ THOÁT HỆ THỐNG ]",
      title: "TRILOGY-2215: SAI SỐ CHẾT NGƯỜI",
      subtitle: "[PHẦN 1: BẪY LOGIC - ĐANG ĐIỀU TRA]",
      
      briefingTitle: ">> BÁO CÁO BIÊN BẢN HIỆN TRƯỜNG MỞ RỘNG <<",
      briefingLines: [
        "MÃ VỤ ÁN: HMD-092 | ĐƠN VỊ: FBI Đội Trọng Án Khu Vực 4 (Đặc vụ Akai phụ trách).",
        "NẠN NHÂN: David Vance (52 tuổi, CEO An ninh mạng), phu nhân Eleanor (48 tuổi) và quản gia Thomas (60 tuổi).",
        "KHÁM NGHIỆM: Các thi thể phát hiện trong phòng ngủ kín. Không có dấu vết xô xát. Cả 3 nạn nhân đều đang ngủ sâu trước khi tử vong. Điều lạ là nhiệt độ phòng khi phát hiện cực kỳ lạnh (Gần 0 độ C).",
        "AN NINH: Biệt thự Vance dùng hệ thống smarthome. Toàn bộ dữ liệu từ 21:00 - 23:00 đã bị xóa bằng mã độc. Hung thủ là kẻ cực kỳ am hiểu IT.",
        "VẬT CHỨNG: Phát hiện 1 máy phát điện chạy xăng cỡ nhỏ (nhãn hiệu Generac, dung tích đúng 5 LÍT) giấu trong lùm cây, nối ống xả vào cửa hút gió điều hòa. Bình xăng máy phát điện HOÀN TOÀN TRỐNG RỖNG."
      ],
      
      cards: [
        { id: 1, title: "[BÁO CÁO PHÁP Y]", tag: "T.O.D: 21:45 - 22:15", desc: "Xác định nguyên nhân: Ngộ độc khí CO. Thời gian tử vong (T.O.D) ước tính từ 21:45 đến 22:15 đêm qua dựa trên độ đông cứng tử thi.", detail: "BÁO CÁO PHÁP Y CHI TIẾT (#FB-9921):\n- Nồng độ CO trong máu nạn nhân > 70%.\n- Phát hiện nhiệt độ bất thường tại hiện trường: Hệ thống Smarthome đã bị can thiệp hạ nhiệt độ xuống 0°C ngay sau khi tử vong, khiến quá trình đông cứng thi thể diễn ra nhanh hơn bình thường, lừa bác sĩ pháp y phán đoán sai lệch giờ chết lùi lại 2 tiếng so với thời điểm thực tế (00:00 đêm)." },
        { id: 2, title: "[LỜI KHAI NGHI PHẠM]", tag: "SUBJECT: SARAH", desc: "Sarah (con gái vợ nạn nhân) khai: Rời biệt thự lúc 21:00 bằng xe Porsche (Dung tích xăng tối đa 45 Lít) chạy về trung tâm thành phố.", detail: "BIÊN BẢN LẤY LỜI KHAI (SUBJECT: SARAH VANCE):\n- Sarah khẳng định cô ăn tối cùng gia đình và rời đi lúc 21:00.\n- Cô hoàn toàn không hay biết việc xe của mình bị đánh cắp biển số giả hoặc thẻ tín dụng bị lợi dụng quẹt giao dịch lúc 22:12 tại trạm xăng ngoại ô." },
        { id: 3, title: "[CAMERA GIAO THÔNG]", tag: "RED HERRING", desc: "Xe Porsche qua trạm thu phí lúc 21:30. Đồng hồ camera bị lỗi, chạy nhanh hơn thực tế 5 phút (Tức xe qua trạm lúc 21:25).", detail: "DỮ LIỆU KỸ THUẬT CAMERA SỐ 4:\n- Khung hình ghi nhận chiếc Porsche chạy qua lúc 21:30.\n- Kiểm tra máy chủ cho thấy đồng hồ camera bị hack chạy nhanh hơn thực tế 5 phút. Khoảng cách di chuyển từ biệt thự đến trạm thu phí chỉ mất 15 phút, nghĩa là có một khoảng trống bí ẩn khi chiếc xe dừng lại." },
        { id: 4, title: "[HÓA ĐƠN SIÊU THỊ]", tag: "TIME: 22:10", desc: "Giao dịch thành công lúc 22:10. Thẻ tín dụng định danh của Sarah thanh toán đồ dùng sinh hoạt tại trung tâm thành phố.", detail: "SAO KÊ NGÂN HÀNG & HÓA ĐƠN ĐIỆN TỬ:\n- Mã giao dịch: TXN-8821\n- Thời gian: 22:10 tại Siêu thị Trung tâm.\n- Món hàng: Đồ gia dụng nhỏ lẻ. Đây là nước đi hoàn hảo của Zodiac nhằm tạo ngoại phạm giả mạo cho chủ thẻ." },
        { id: 5, title: "[BIÊN LAI TRẠM XĂNG]", tag: "STATUS: ANOMALY", desc: "Hệ thống tự động tại trạm xăng ghi nhận thẻ của Sarah thanh toán cho đúng 50 LÍT XĂNG lúc 22:12.", detail: "DỮ LIỆU TRỤ BƠM XĂNG SỐ 7:\n- Thời gian: 22:12.\n- Lượng nhiên liệu bơm: 50 Lít.\n- ĐIỂM VÔ LÝ PHÁT HIỆN: Sổ đăng kiểm xe Porsche của Sarah cho thấy dung tích bình chứa tối đa tuyệt đối chỉ là 45 Lít. Sự chênh lệch này chính là tang vật dùng cho máy phát điện CO tại biệt thự." }
      ],
      
      openBoardBtn: "[ TRUY CẬP HỆ THỐNG TRUY VẤN ]",
      p1BoardTitle: ">> HỆ THỐNG TRUY VẤN CHUỖI LOGIC <<",
      p1BoardDesc: "Hãy trích xuất các con số từ hồ sơ vụ án để tạo thành Mã Chốt Án (Logic Code) gồm 3 phần:\n\n1. Khoảng thời gian trống (phút) chiếc xe Porsche bị giấu đi?\n2. Dung tích thực tế (Lít) của máy phát điện tang vật?\n3. Độ chênh lệch nhiên liệu (Lít) phát hiện tại trạm xăng?\n\nĐịnh dạng nhập: X-Y-Z (Ví dụ: 15-10-5)",
      p1BoardPlaceholder: "Nhập mã chuỗi logic...",
      p1BoardSubmit: "[ PHÁ VỠ NGOẠI PHẠM ]",

      gameOverTitle: "HỆ THỐNG ĐÃ KHÓA",
      gameOverDesc: "LẬP LUẬN THẤT BẠI. HỆ THỐNG BẢO MẬT ĐÃ TỰ HỦY.",
      rebootBtn: "[ TẢI LẠI HỆ THỐNG ]",

      conclusionTitle: ">> BƯỚC CUỐI: LẬT TẨY PHƯƠNG THỨC <<",
      conclusionText: "Mã chuỗi 10-5-5 hoàn toàn khớp lệnh! Mâu thuẫn Tam Giác Logic đã được giải:\nHắn dừng xe 10 phút để đánh tráo, và dùng 5 Lít xăng dư bơm vào can nhựa cho máy phát điện.\n\nNHƯNG Sarah mù công nghệ. Hãy trả lời câu hỏi cuối cùng: Cỗ máy nào, hay đúng hơn là hệ thống nào tại biệt thự, đã bị hacker thâm nhập để hạ nhiệt độ phòng xuống 0°C nhằm thay đổi thời gian tử vong?",
      placeholder: "Nhập tên hệ thống...",
      submitBtn: "[ CHỐT ÁN ]",
      
      victoryTitle: "MẬT MÃ ĐÃ ĐƯỢC GIẢI",
      victoryDesc: "Lập luận xuất sắc, Akai! Kẻ đó chính là ZODIAC. Hắn đã dàn dựng một kiệt tác tội ác tàn độc với 4 giai đoạn:\n\n[GIAI ĐOẠN 1: Chuẩn bị]\n20:00: Hắn đột nhập mạng lưới biệt thự Vance, kích hoạt mã độc hẹn giờ xóa camera. Đồng thời, thả thuốc an thần vào bữa tối khiến gia đình Vance ngủ say.\n21:00: Phục kích đánh ngất Sarah khi cô vừa rời đi, cướp chìa khóa chiếc Porsche và thẻ tín dụng.\n\n[GIAI ĐOẠN 2: Dàn dựng ngoại phạm]\nZodiac lái xe hướng về trung tâm. Cố tình đỗ xe vào góc khuất 10 phút để câu giờ khớp kịch bản. Hắn hack camera giao thông chạy nhanh 5 phút để cảnh sát bối rối. Lúc 22:12, hắn quẹt thẻ bơm 45L vào xe và 5L vào can nhựa (Sai lầm vật lý duy nhất của hắn).\n\n[GIAI ĐOẠN 3: Đánh lừa Pháp y]\n23:00: Hắn quay ngược lại biệt thự, đổ 5L xăng chạy máy phát điện xả khí CO. Gia đình Vance thực chất tử vong lúc nửa đêm (00:00). CÚ TWIST: Hắn hack Smarthome HẠ NHIỆT ĐỘ PHÒNG XUỐNG 0 ĐỘ C ngay sau khi họ chết, làm thay đổi tốc độ đông cứng tử thi, lừa bác sĩ pháp y tính sai giờ chết lùi lại 2 tiếng (21:45)!\n\n[GIAI ĐOẠN 4: Diệt khẩu]\nSáng hôm sau, Zodiac tiêm Kali Clorua ép Sarah đột tử, ngụy trang thành tự sát do áp lực tội lỗi nhằm khép lại vụ án.\n\nLệnh truy nã khẩn cấp được ban hành. Nhưng khi đội đặc nhiệm ập vào, Zodiac đã biến mất. Hắn chỉ để lại một mảnh giấy gập tư đẫm máu...",
      unlockBtn: "[ MỞ KHÓA PHẦN 2: MẬT MÃ ĐẪM MÁU ]",

      // --- PHẦN 2 ---
      p2Title: "TRILOGY-2215: MẬT MÃ ĐẪM MÁU",
      p2Subtitle: "[PHẦN 2: SỰ KHIÊU KHÍCH CỦA ZODIAC]",
      p2BriefingTitle: ">> HIỆN TRƯỜNG THỨ HAI: CĂN HỘ CAO CẤP CỦA SARAH <<",
      p2BriefingLines: [
        "ĐỊA ĐIỂM: Căn hộ chung cư độc lập thuộc khu đô thị phía Tây thành phố.",
        "GÓC NHÌN ĐẶC VỤ: Cảnh sát địa phương vội vã khép lại vụ án với kết luận: 'Sarah cảm thấy cắn rứt lương tâm vì đã sát hại gia đình Vance nên đã tự kết liễu cuộc đời tại nhà riêng'. Nhưng Đặc vụ Akai nhìn thấu bản chất thật sự: Đây không phải tự sát. Đây là một vụ DIỆT KHẨU HOÀN HẢO do chính tay Zodiac thực hiện để xóa sạch chuỗi mắt xích điều tra.",
        "MANH MỐI TẠI HIỆN TRƯỜNG: Thi thể Sarah nằm bất động trên ghế sofa sang trọng. Điểm đặc biệt nhất: Bàn tay cứng đờ của cô vẫn đang siết chặt một mảnh giấy nhàu nát đẫm máu khô - thông điệp trực diện mà Zodiac để lại riêng cho bộ óc của Akai."
      ],
      p2Cards: [
        { id: 101, title: "[BÁO CÁO PHÁP Y P.2]", tag: "CAUSE: KCL", desc: "Xác nhận Sarah tử vong do tiêm dung dịch Kali Clorua (KCl) trực tiếp vào tĩnh mạch gây trụy tim cấp tính.", detail: "HỒ SƠ KHÁM NGHIỆM TỬ THI SARAH (#AUT-881):\n- Nguyên nhân tử vong: Ngộ độc Kali Clorua (KCl) liều cao qua đường tĩnh mạch.\n- Dấu vết sinh học: Trên cổ tay trái có vết kim tiêm mờ. Đáng chú ý, không tìm thấy bất kỳ dấu vân tay nào của Sarah trên ống tiêm hay các vật dụng xung quanh. Cô bị tiêm thuốc độc trong trạng thái bất ngờ hoặc bị chuốc thuốc mê trước." },
        { id: 102, title: "[DẤU VẤT HIỆN TRƯỜNG]", tag: "EVIDENCE: MUD", desc: "Dấu giày dính bùn đất đặc trưng chỉ có ở khu vực đầm lầy công nghiệp phía Bắc thành phố. Không có vân tay của Sarah.", detail: "PHÂN TÍCH PHÁP Y HÌNH SỰ & DẤU VẤT:\n- Lớp bùn mỏng trên thảm phòng khách chứa hàm lượng khoáng chất đặc thù của vùng đất ngập nước công nghiệp phía Bắc (cách xa trung tâm 25km).\n- Không có dấu hiệu cạy phá cửa chính hay cửa sổ. Kẻ sát nhân sở hữu thẻ ra vào thông minh hoặc mã số nội bộ của căn hộ, chứng tỏ quyền lực kiểm soát công nghệ tuyệt đối." },
        { id: 103, title: "[MẢNH GIÁY ĐẪM MÁU]", tag: "BLOODY_NOTE.PNG", desc: "Bức thư máu Zodiac gửi riêng cho Akai chứa chuỗi mật mã kỳ lạ: \nW K L V - L V - M X V W - W K H - E H J L Q Q L Q J", detail: "GIÁM ĐỊNH TÀI LIỆU HỌC & MẬT MÃ:\n- Mảnh giấy được xé từ một cuốn sổ tay cũ, thấm đẫm máu của chính nạn nhân.\n- Dãy ký tự viết hoa hoàn toàn theo hệ thống mật mã cổ điển Caesar Cipher:\n  W K L V - L V - M X V W - W K H - E H J L Q Q L Q J\n- Khóa dịch chuyển (Key) được ngầm ẩn dụ bằng số lượng nạn nhân trong đại án Phần 1 (Khóa = 3)." },
        { id: 104, title: "[USB TRÊN LẦU]", tag: "HIDDEN_SYMBOL.PNG", desc: "Một chiếc USB đặt trên bàn làm việc ở tầng trên, ghi lại đoạn video mờ ảo hình bóng Zodiac rời khỏi căn hộ.", detail: "TRÍCH XUẤT DỮ LIỆU CAMERA MINI & USB:\n- Chiếc USB được đặt ngay ngắn trên bàn làm việc trong phòng làm việc ở tầng trên của căn hộ.\n- File video ghi lại lúc 03:15 sáng: Một bóng người cao lớn mặc áo hoodie tối màu, đeo mặt nạ ẩn khuất trong bóng tối đang thong thả bước ra từ cửa chính căn hộ, tay cầm một tập hồ sơ mật của gia đình Vance." }
      ],
      p2OpenTerminal: "[ TRUY CẬP BÀN GIẢI MÃ KÝ TỰ (CIPHER TERMINAL) ]",
      p2TerminalTitle: ">> BÀN GIẢI MÃ KÝ TỰ (CAESAR CIPHER) <<",
      p2TerminalDesc: "Mật mã Caesar luôn cần một con số để dịch chuyển. Zodiac là kẻ kiêu ngạo, hắn luôn nhắc nhở về những tác phẩm của mình. Hãy tìm **số lượng sinh mạng** đã bị tước đoạt trong đêm lạnh giá tại biệt thự Vance (Vụ án Phần 1) để làm Khóa Key lùi lại.\n\nDãy mã hóa: W K L V - L V - M X V W - W K H - E H J L Q Q L Q J",
      p2Placeholder: "Nhập thông điệp sau khi giải mã (Tiếng Anh, không dấu)...",
      p2Submit: "[ GIẢI MÃ & TRUY TÌM TỌA ĐỘ ]",
      p2VictoryTitle: "TỌA ĐỘ ĐÃ ĐƯỢC XÁC ĐỊNH",
      p2VictoryDesc: "Xuất sắc, Đặc vụ Akai!\nKhóa Key chính là số 3 (Tương ứng 3 nạn nhân nhà Vance). Bằng cách lùi mỗi chữ cái lại đúng 3 bước (W lùi 3 -> T, K lùi 3 -> H...), đoạn mã đã chuyển hóa hoàn hảo thành:\n\n'THIS IS JUST THE BEGINNING'\n\n(Đây chỉ là điểm bắt đầu).\n\nHệ thống định vị radar phát hiện tín hiệu từ chiếc USB ẩn đã kết nối vào trạm xử lý nước thải bỏ hoang Sector 7. Zodiac đang đợi bạn ở đó cho trận chiến cuối cùng !",
      p2FinalBtn: "[ SẴN SÀNG KHỞI ĐỘNG PHẦN 3: CUỘC ĐỐI ĐẦU TRỰC DIỆN ]",

      // --- PHẦN 3 (FINAL SHOWDOWN) ---
      p3Title: "TRILOGY-2215: ĐIỂM HỘI TỤ TẬN CÙNG",
      p3Subtitle: "[PHẦN 3: TRẬN CHIẾN CUỐI CÙNG]",
      p3BriefingTitle: ">> TRẠM XỬ LÝ NƯỚC THẢI SECTOR 7 - HỒ SƠ PHONG TỎA <<",
      p3BriefingLines: [
        "ĐỊA ĐIỂM ĐẶC BIỆT: Trạm xử lý nước thải công nghiệp ngầm Sector 7, nằm sâu dưới lòng đất 50 mét, bao bọc bởi hệ thống đường ống chằng chịt và các bể chứa hóa chất độc hại nặng.",
        "TÌNH TRẠNG HIỆN TRƯỜNG: Không gian tối om, ngập tràn mùi rỉ sét, khí clo nồng nặc và tiếng nước nhỏ giọt rợn ngợp. Ở chính giữa phòng điều khiển trung tâm, một thiết bị phát tán khí độc thần kinh đang đếm ngược từng giây với hàng ngàn mạch điện tử nhấp nháy liên hồi.",
        "HỆ THỐNG PHÒNG THỦ: Trạm Sector 7 được trang bị mạng lưới tự hủy độc lập hoàn toàn với internet quốc gia. Hung thủ đã thiết lập một Khóa Ma Trận Số Học cực kỳ phức tạp trên bảng điều khiển chính. Mọi sự can thiệp phần cứng sai lệch hoặc nhập sai mật mã quá giới hạn sẽ kích hoạt van xả khí độc toàn khu vực, chôn vùi toàn bộ đặc nhiệm trong làn sương chết chóc.",
        "QUYẾT TÂM CỦA ĐẶC VỤ AKAI: Không còn đường lùi. Đây là điểm hội tụ cuối cùng để chấm dứt 5 năm ám ảnh. Akai phải dựa hoàn toàn vào tư duy logic sắc bén của mình để giải mã cơ chế vận hành của hệ thống trước khi quá muộn."
      ],
      p3Cards: [
        { 
          id: 201, 
          title: "[MÀN HÌNH ĐIỀU KHIỂN]", 
          tag: "MATRIX LOCK", 
          desc: "Màn hình công nghiệp phát sáng hiển thị chuỗi số học ma trận do Zodiac để lại:\n88 → 69 → 19 → 1311 → 1330 → [ ? ]", 
          detail: "DỮ LIỆU MÀN HÌNH ĐIỀU KHIỂN TRUNG TÂM (#CRT-01):\n- Màn hình đen tuyền hiện lên dòng chữ xanh chói gắt: 'Ngươi nghĩ mình hiểu những con số sao? Toán học không bao giờ nói dối, nhưng cái chết thì có thể. Hãy tìm ra con số cuối cùng'.\n- Dãy số ma trận được lập trình chạy tuần hoàn: 88 → 69 → 19 → 1311 → 1330 → [ ? ]. Hệ thống khóa tự hủy yêu cầu nhập giá trị tiếp theo chính xác tuyệt đối để ngắt mạch điện." 
        },
        { 
          id: 202, 
          title: "[NHẬT KÝ HỆ THỐNG]", 
          tag: "SYSTEM LOG", 
          desc: "Trạng thái van xả tự động. Hệ thống van chỉ được mở khóa an toàn khi nhập đúng giá trị số học tuyệt đối.", 
          detail: "NHẬT KÝ VAN XẢ TỰ ĐỘNG KHẨN CẤP (#SEC-7):\n- Trạng thái dòng chảy: ĐANG NÉN ÁP SUẤT CAO.\n- Cảnh báo kỹ thuật: Hệ thống tự động khóa chặt cơ học. Không chấp nhận thao tác ghi đè ngoại vi bằng phần mềm. Nhập sai 3 lần hệ thống sẽ kích hoạt xả khí độc." 
        },
        { 
          id: 203, 
          title: "[GHI CHÚ CỦA ZODIAC]", 
          tag: "ZODIAC'S NOTE", 
          desc: "Thông điệp tàn độc khắc trên vách tường kim loại rỉ sét bằng tia laser.", 
          detail: "THÔNG ĐIỆP KHẮC BẰNG LASER TRÊN VÁCH TƯỜNG PHÒNG MÁY:\n- 'Quy luật của thế giới này là sự nhào nặn giữa những kẻ đứng trước mặt ngươi. Cộng, Trừ, Nhân, Chia... tất cả đều là công cụ của Tử Thần. Hãy chứng minh trí tuệ của ngươi, Akai.'" 
        }
      ],
      p3OpenTerminal: "[ TRUY CẬP KHÓA MA TRẬN HỆ THỐNG ]",
      p3TerminalTitle: ">> KHÓA MA TRẬN TOÁN HỌC (MATRIX LOCK) <<",
      p3TerminalDesc: "HỆ THỐNG ĐANG ĐẾM NGƯỢC. Cảnh báo nguy hiểm. Hãy tìm ra con số cuối cùng của dãy ma trận tử thần:\n\n88 → 69 → 19 → 1311 → 1330 → [ ? ]",
      p3Placeholder: "Nhập con số đáp án...",
      p3Submit: "[ VÔ HIỆU HÓA HỆ THỐNG ]",

      season2Title: "KẾT THÚC MÙA 1",
      season2Desc: "Đội đặc nhiệm xông vào làn khói mờ ảo tại trạm Sector 7. Trong góc khuất của đường ống nước ngầm, bóng đen của Zodiac vụt chạy ra hướng cửa thoát hiểm.\n\nAkai kịp thời phát hiện, ngắm chuẩn với khẩu súng GLOCK 19M của mình. Viên đạn xé gió găm thẳng vào vai trái của Zodiac, để lại một vết thương máu tuôn xối xả nhưng hắn vẫn kịp lao mình xuống dòng sông ngầm tẩu thoát trong đêm tối.\n\n3 năm sau tại Trụ sở Cảnh sát Trung tâm:\nMột gói hàng nặc danh được gửi thẳng đến bàn làm việc của Đặc vụ Akai. Khi mở ra, đó là một chiếc mặt nạ dính vết máu khô kèm theo một màn hình phát sáng tự động hiển thị dòng chữ sắc lạnh:\n\n'TA ĐÃ TRỞ LẠI ĐỂ BÁO THÙ...'\n\nVết sẹo trên vai trái vẫn nhói đau. Trò chơi sinh tử với quy mô khủng khiếp hơn sắp bắt đầu.",
      season2Footer: "TO BE CONTINUED IN SEASON 2",

      footer: "VỤ ÁN DO MINH TRÍ BIÊN SOẠN"
    },
    en: {
      langBtn: "LANG: [EN]",

      cinematicLines: [
        "Washington, 2003.\nA world where secrets never truly disappear.\nUnsolved cases. People vanishing without a trace.\nAnd those hiding in the shadows... never revealing their true faces.",
        "Years after a series of mysterious murders was closed,\nan old case file is suddenly reopened.\nNot by the police. Not by the media.\nBut by a signal sent from a system wiped from all databases.",
        "File code:\n2215\n\nA name appears within it.\nZODIAC.",
        "But this time... he didn't leave a letter.\nHe left a game.",
        "And there is only one way to find the truth:\nSOLVE IT."
      ],
      bootTermLines: [
        "[ SECURE BOOT v5.0 ]",
        "INITIALIZING...",
        "IDENTITY VERIFICATION",
        "████████████████████ 100%",
        "WELCOME, AGENT AKAI."
      ],

      profTitle: "[ ARCHIVED PERSONNEL FILE - FBI ]",
      profLine1: "Designation: AKAI (ID: FBI-A042)",
      profLine2: "Role: Senior Agent - Major Crimes Division",
      profLine3: "Clearance: Level 5 (Top Secret)",
      profHeader: "[ PSYCHOLOGICAL PROFILE & MOTIVATION ]",
      profP1: "Akai was a mathematical genius. 5 years ago, a killer calling himself Zodiac murdered his only family.",
      profP2: "Zodiac left no DNA. He only left 'logical alibis' perfectly calculated to mock the police force.",
      profP3: "Akai joined the FBI with one goal: Use cold logic to break every trap and expose Zodiac. Starting with the David Vance murder.",
      profBtn: "[ CONFIRM IDENTITY & LOGIN ]",

      introTitle: "TRILOGY-2215 // FBI SECURE NETWORK",
      introSub: "Restricted area. Agent Akai authorized only.",
      bootLogs: [
        "Connecting to national mainframe servers...",
        "Authenticating ID FBI-A042... SUCCESS.",
        "Welcome back, Agent Akai.",
        "Extracting case file: 'David Vance Family Murder'...",
        "System ready. Awaiting access command."
      ],
      startButton: "[ OPEN DESK / INITIALIZE ]",
      exitBtn: "[ LOGOUT SYSTEM ]",
      title: "TRILOGY-2215: FATAL ANOMALY",
      subtitle: "[PART 1: THE ALIBI TRAP - INVESTIGATING]",
      
      briefingTitle: ">> EXTENDED CRIME SCENE BRIEFING <<",
      briefingLines: [
        "CASE ID: HMD-092 | UNIT: FBI Major Crimes Unit 4 (Agent Akai lead).",
        "VICTIMS: David Vance (52, Cyber-security CEO), wife Eleanor (48), and butler Thomas (60).",
        "FORENSICS: Bodies found in a locked bedroom. No signs of struggle. All 3 victims were in deep sleep before death. Strangely, the room temperature when discovered was freezing (near 0°C).",
        "SECURITY: The Vance mansion uses military-grade smarthome systems. All data from 21:00 to 23:00 was wiped by malware. The killer is an extreme IT expert.",
        "CRITICAL EVIDENCE: Found a small gas generator (Generac brand, exactly 5 LITER capacity) hidden in the bushes, exhaust piped into the AC intake. The generator's fuel tank was COMPLETELY EMPTY."
      ],
      
      cards: [
        { id: 1, title: "[FORENSICS REPORT]", tag: "T.O.D: 21:45 - 22:15", desc: "Cause of death: CO poisoning. T.O.D estimated from 21:45 to 22:15 last night based on rigor mortis.", detail: "DETAILED FORENSIC REPORT (#FB-9921):\n- Blood CO concentration > 70%.\n- Room temperature anomaly detected at the scene: The Smarthome system was tampered with to drop the temperature to 0°C immediately after death, causing the rigor mortis process to occur much faster than normal, deceiving the forensic doctor into estimating the time of death 2 hours earlier than the actual time (00:00 midnight)." },
        { id: 2, title: "[SUSPECT STATEMENT]", tag: "SUBJECT: SARAH", desc: "Sarah (victim's stepdaughter) stated: Left the mansion at 21:00 driving a Porsche (Max tank 45 Liters) heading downtown.", detail: "INTERROGATION TRANSCRIPT (SUBJECT: SARAH VANCE):\n- Sarah firmly asserts she had dinner with her family and left at 21:00.\n- She is completely unaware of her car license plates being cloned or her credit card being illicitly used for a transaction at 22:12 at a suburban gas station." },
        { id: 3, title: "[TRAFFIC CAMERA]", tag: "RED HERRING", desc: "Porsche passed toll booth at 21:30. Camera clock is bugged, running 5 mins faster than real time (Meaning it passed at 21:25).", detail: "CAMERA DATA TECHNICAL REPORT (#4):\n- The frame recorded the Porsche speeding past at 21:30.\n- Server inspection shows the camera clock was hacked to run 5 minutes faster than real-time. The travel distance from the mansion to the toll booth only takes 15 minutes, meaning there is a mysterious missing window when the car stopped." },
        { id: 4, title: "[SUPERMARKET RECEIPT]", tag: "TIME: 22:10", desc: "Successful transaction at 22:10. Sarah's registered credit card paid for groceries downtown.", detail: "BANK STATEMENT & E-RECEIPT:\n- Transaction ID: TXN-8821\n- Time: 22:10 at the Central Supermarket.\n- Items: Small household goods. This is a perfect move by Zodiac to create a forged alibi for the cardholder." },
        { id: 5, title: "[GAS STATION RECEIPT]", tag: "STATUS: ANOMALY", desc: "Automated system recorded Sarah's card successfully paying for exactly 50 LITERS OF GAS at 22:12.", detail: "GAS PUMP #7 DATA:\n- Time: 22:12.\n- Fuel pumped: 50 Liters.\n- DISCOVERED ANOMALY: Sarah's Porsche registration shows the absolute maximum tank capacity is strictly 45 Liters. The fuel discrepancy is exactly the evidence used for the CO generator at the mansion." }
      ],
      
      openBoardBtn: "[ ACCESS QUERY SYSTEM ]",
      p1BoardTitle: ">> LOGIC SEQUENCE QUERY SYSTEM <<",
      p1BoardDesc: "Extract numbers from the case files to form the 3-part Logic Code:\n\n1. The missing time window (minutes) the Porsche was hidden?\n2. The actual capacity (Liters) of the asphyxiation evidence?\n3. The fuel discrepancy (Liters) discovered at the gas station?\n\nInput format: X-Y-Z (Example: 15-10-5)",
      p1BoardPlaceholder: "Enter logic sequence code...",
      p1BoardSubmit: "[ BREACH ALIBI ]",

      gameOverTitle: "SYSTEM LOCKED",
      gameOverDesc: "DEDUCTION FAILED. SECURITY SYSTEM SELF-DESTRUCTED.",
      rebootBtn: "[ REBOOT SYSTEM ]",

      conclusionTitle: ">> FINAL STEP: EXPOSING THE METHOD <<",
      conclusionText: "Sequence 10-5-5 matches perfectly! The Logic Triangle is solved:\nHe stopped the car for 10 minutes to set it up, and used the extra 5 Liters of gas for the generator.\n\nBUT Sarah is tech-illiterate. Answer the final question: What specific machine, or rather, what system at the mansion was hacked to drop the room temperature to 0°C to alter the time of death?",
      placeholder: "Enter system name...",
      submitBtn: "[ CONCLUDE CASE ]",
      
      victoryTitle: "CIPHER SOLVED",
      victoryDesc: "Brilliant deduction, Akai! The mastermind is ZODIAC. He orchestrated a ruthless masterpiece of a crime in 4 stages:\n\n[PHASE 1: Preparation]\n20:00: He hacked the Vance mansion's network, activating malware to wipe the cameras. Simultaneously, he slipped sedatives into the dinner, putting the Vance family into a deep sleep.\n21:00: He ambushed and knocked Sarah out as she left, stealing her Porsche keys and credit card.\n\n[PHASE 2: Staging the Alibi]\nZodiac drove toward the city center. He intentionally parked in a blind spot for 10 minutes to stall and match his script. He hacked the traffic camera to run 5 minutes fast to confuse the police. At 22:12, he swiped the card, pumping 45L into the car and 5L into a jerrycan (His only physical mistake).\n\n[PHASE 3: Deceiving Forensics]\n23:00: He drove back to the mansion, pouring the 5L of gas to run the CO generator. The Vance family actually died at midnight (00:00). THE TWIST: He hacked the Smarthome to DROP THE ROOM TEMPERATURE TO 0°C right after they died, altering the speed of rigor mortis, tricking the coroner into estimating the T.O.D 2 hours earlier (21:45)!\n\n[PHASE 4: Silencing]\nThe next morning, Zodiac injected Sarah with Potassium Chloride to force sudden death, camouflaging it as a guilt-driven suicide to permanently close the case.\n\nAn emergency arrest warrant is issued. But when the SWAT team raids, Zodiac has vanished. He only left a folded bloody note...",
      unlockBtn: "[ UNLOCK PART 2: BLOOD CIPHER ]",

      // --- P2 ---
      p2Title: "TRILOGY-2215: BLOOD CIPHER",
      p2Subtitle: "[PART 2: ZODIAC'S PROVOCATION]",
      p2BriefingTitle: ">> SECOND SCENE: SARAH'S LUXURY APARTMENT <<",
      p2BriefingLines: [
        "LOCATION: An independent luxury apartment in the western urban district of the city.",
        "SPECIAL AGENT PERSPECTIVE: The local police hastily closed the case with the conclusion: 'Sarah felt remorse for murdering the Vance family, so she took her own life at home'. But Agent Akai immediately saw the true nature: This is not suicide. This is a PERFECT SILENCED MURDER executed by Zodiac himself to erase the entire chain of investigation.",
        "CLUES AT THE SCENE: Sarah's body lies motionless on the luxury sofa. The most unusual point: Her stiff hand is still tightly gripping a crumpled, dry blood-stained piece of paper - a direct message Zodiac left exclusively for Akai's brain."
      ],
      p2Cards: [
        { id: 101, title: "[FORENSICS REPORT P.2]", tag: "CAUSE: KCL", desc: "Confirmed Sarah died from Potassium Chloride (KCl) injection directly into the vein, causing acute cardiac arrest.", detail: "SARAH'S AUTOPSY REPORT (#AUT-881):\n- Cause of death: High-dose Potassium Chloride (KCl) poisoning via intravenous route.\n- Biological traces: A faint needle mark on the left wrist. Notably, no fingerprints of Sarah were found on the syringe or surrounding items. She was injected with the lethal drug in a state of surprise or previously drugged." },
        { id: 102, title: "[SCENE TRACES]", tag: "EVIDENCE: MUD", desc: "Mud traces on shoes matching specific mud from the northern industrial swamps. No fingerprints of Sarah.", detail: "FORENSIC CRIMINAL & TRACE ANALYSIS:\n- The thin layer of mud on the living room rug contains specific minerals from the northern industrial wetlands (25km away from the center).\n- No signs of forced entry on the main door or windows. The killer possessed a smart access card or internal passcode of the apartment, demonstrating absolute control over technology." },
        { id: 103, title: "[BLOODY NOTE]", tag: "BLOODY_NOTE.PNG", desc: "Zodiac's bloody letter sent specifically to Akai contains a strange cipher sequence: \nW K L V - L V - M X V W - W K H - E H J L Q Q L Q J", detail: "DOCUMENT & CRYPTANALYSIS EXPERTISE:\n- The note was torn from an old notebook, soaked in the victim's own blood.\n- The fully capitalized string follows the classic Caesar Cipher system:\n  W K L V - L V - M X V W - W K H - E H J L Q Q L Q J" },
        { id: 104, title: "[USB UPSTAIRS]", tag: "HIDDEN_SYMBOL.PNG", desc: "A USB neatly placed on the upstairs study desk, recording a blurry video of Zodiac's silhouette leaving the apartment.", detail: "MINI CAMERA & USB DATA EXTRACTION:\n- The USB was neatly placed on the desk in the upstairs study room of the apartment.\n- The video file recorded at 03:15 AM: A tall silhouette wearing a dark hoodie, donning a mask hidden in the shadows, leisurely walks out the front door holding a classified file of the Vance family." }
      ],
      p2OpenTerminal: "[ OPEN CAESAR CIPHER TERMINAL ]",
      p2TerminalTitle: ">> CAESAR CIPHER DECODER <<",
      p2TerminalDesc: "The Caesar cipher always requires a shift number. Zodiac is arrogant, always reminding us of his masterpieces. Find the **number of lives** taken during that cold night at the Vance mansion (Part 1 Case) to use as the backward shift Key.\n\nCipher sequence: W K L V - L V - M X V W - W K H - E H J L Q Q L Q J",
      p2Placeholder: "Enter decrypted message (English, no accents)...",
      p2Submit: "[ DECRYPT & LOCATE COORDINATES ]",
      p2VictoryTitle: "COORDINATES SECURED",
      p2VictoryDesc: "Brilliant, Agent Akai!\nThe Shift Key is 3 (Corresponding to the 3 Vance victims). By referencing the alphabet table and shifting each letter back exactly 3 steps (W back 3 -> T, K back 3 -> H...), the code perfectly transformed into:\n\n'THIS IS JUST THE BEGINNING'\n\nRadar positioning system detected a signal from the hidden USB connecting to the abandoned Sector 7 water treatment plant. Zodiac is waiting for you there for the final battle!",
      p2FinalBtn: "[ READY TO INITIATE PART 3: FINAL SHOWDOWN ]",

      // --- P3 ---
      p3Title: "TRILOGY-2215: THE CONVERGENCE",
      p3Subtitle: "[PART 3: FINAL SHOWDOWN]",
      p3BriefingTitle: ">> SECTOR 7 WATER TREATMENT PLANT - LOCKDOWN FILE <<",
      p3BriefingLines: [
        "SPECIAL LOCATION: Sector 7 underground industrial water treatment plant, located 50 meters deep, surrounded by a maze of pipes and heavy toxic chemical tanks.",
        "SCENE CONDITION: Pitch black, filled with the smell of rust, heavy chlorine gas, and eerie dripping water. Right in the middle of the central control room, a nerve gas dispersal device is counting down every second with thousands of electronic circuits flashing continuously.",
        "DEFENSE SYSTEM: Sector 7 is equipped with a self-destruct network completely independent of the national internet. The killer has set up an extremely complex Mathematical Matrix Lock on the main control panel. Any incorrect hardware tampering or exceeding the password attempt limit will trigger the toxic gas valves across the entire area, burying the SWAT team in a deadly mist.",
        "AGENT AKAI'S DETERMINATION: There is no turning back. This is the final convergence point to end a 5-year obsession. Akai must rely entirely on his sharp logical thinking to decode the system's operating mechanism before it's too late."
      ],
      p3Cards: [
        { 
          id: 201, 
          title: "[MAIN SCREEN]", 
          tag: "MATRIX LOCK", 
          desc: "The glowing industrial screen displays an incomplete mathematical matrix sequence left by Zodiac:\n88 → 69 → 19 → 1311 → 1330 → [ ? ]", 
          detail: "CENTRAL CONTROL SCREEN DATA (#CRT-01):\n- The pitch-black screen shows a glaring green text: 'You think you understand numbers? Mathematics never lies, but death does. Find the final number'.\n- The matrix sequence is programmed to loop: 88 → 69 → 19 → 1311 → 1330 → [ ? ]. The self-destruct lock requires inputting the absolute correct next value to cut the circuit." 
        },
        { 
          id: 202, 
          title: "[SYSTEM LOG]", 
          tag: "SYSTEM LOG", 
          desc: "Status of the automatic release valve. The valve system can only be safely unlocked when the exact absolute numerical value is entered.", 
          detail: "EMERGENCY AUTO-VALVE LOG (#SEC-7):\n- Flow status: COMPRESSING HIGH PRESSURE.\n- Technical warning: The system is automatically mechanically locked. Peripheral software override operations are not accepted. Entering incorrectly 3 times will trigger the toxic gas release." 
        },
        { 
          id: 203, 
          title: "[ZODIAC'S NOTE]", 
          tag: "ZODIAC'S NOTE", 
          desc: "A ruthless message laser-carved onto the rusted metal wall.", 
          detail: "LASER-CARVED MESSAGE ON THE ENGINE ROOM WALL:\n- 'The rule of this world is the molding between those standing before you. Addition, Subtraction, Multiplication, Division... all are tools of the Grim Reaper. Prove your intellect, Akai.'" 
        }
      ],
      p3OpenTerminal: "[ ACCESS SYSTEM MATRIX LOCK ]",
      p3TerminalTitle: ">> MATHEMATICAL MATRIX LOCK <<",
      p3TerminalDesc: "SYSTEM COUNTDOWN INITIATED. Warning. Find the final number of the death matrix sequence:\n\n88 → 69 → 19 → 1311 → 1330 → [ ? ]",
      p3Placeholder: "Enter the answer number...",
      p3Submit: "[ DISABLE SYSTEM ]",

      season2Title: "END OF SEASON 1",
      season2Desc: "The SWAT team breaches the dense fog at Sector 7. In the dark corner of the underground water pipes, Zodiac's shadow darts towards the emergency exit.\n\nAkai spots him just in time, raises his GLOCK 19M and pulls the trigger. The bullet tears through the air and strikes Zodiac directly in the left shoulder, leaving a massive bleeding wound, but he still manages to plunge into the underground river, escaping into the night.\n\n3 years later at Central Police Headquarters:\nAn anonymous package is delivered straight to Special Agent Akai's desk. Opening it reveals a dry blood-stained mask alongside an auto-illuminating screen displaying a chilling message:\n\n'I HAVE RETURNED FOR REVENGE...'\n\nThe scar on his left shoulder still aches. The real game of life and death with an even grander scale has just begun.",
      season2Footer: "TO BE CONTINUED IN SEASON 2",

      footer: "CASE WRITTEN BY MINH TRI"
    }
  };

  const t = content[lang];

  const getBackgroundClass = () => {
    if (step <= -1) return "bg-black";
    if (step === 12) return "bg-[url('/end3.png')]";
    if (step === 9) return "bg-[url('/end2.png')]";
    if (step >= 10 && step <= 14) return "bg-[url('/sector7_plant.png')]";
    if (step >= 7 && step <= 13) return "bg-[url('/apartment_scene.png')]";
    return (step >= 2 && step <= 6) ? "bg-[url('/scene.png')]": "bg-[url('/fbi.png')]";
  };

  // P1 Logic: Mã Chuỗi Dữ Kiện "10-5-5"
  const handleLogicCodeSubmit = (e) => {
    e.preventDefault();
    const cleanAns = logicAnswer.replace(/\s+/g, "");
    if (cleanAns === "10-5-5") {
      setStep(4);
      setLogicError("");
    } else {
      setStrikesP1(s => s - 1);
      if (strikesP1 <= 1) {
        setStep(5);
      } else {
        const err = lang === "vi" 
          ? `Mã chuỗi logic bị sai. Còn ${strikesP1 - 1} mạng.`
          : `Logic code failed. ${strikesP1 - 1} strikes left.`;
        setLogicError(err);
        setTimeout(() => setLogicError(""), 5000);
      }
    }
  };

  // P1 Logic: Cỗ máy bị hack "smarthome"
  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    const ans = finalAnswer.toLowerCase().replace(/\s+/g, "");
    if (ans.includes("smarthome") || ans.includes("smart home")) {
      setStep(6);
    } else {
      setStrikesP1(s => s - 1);
      if (strikesP1 <= 1) {
        setStep(5);
      } else {
        setLogicError(lang === "vi" ? `Câu trả lời sai! Còn ${strikesP1 - 1} mạng.` : `Wrong answer! ${strikesP1 - 1} strikes left.`);
        setTimeout(() => setLogicError(""), 5000);
      }
    }
  };

  // P2 Logic: Giải Caesar Cipher "this is just the beginning"
  const handleCipherSubmit = (e) => {
    e.preventDefault();
    const cleanAns = cipherAnswer.toLowerCase().trim();
    if (cleanAns.includes("this is just the beginning")) {
      setStep(9);
    } else {
      setStrikesP2(s => s - 1);
      if (strikesP2 <= 1) {
        setStep(13); // Game Over P2 (Reset về Phần 2 - Step 7)
      } else {
        const errTxt = lang === "vi"
          ? `Mật mã sai! Còn ${strikesP2 - 1} mạng.`
          : `Incorrect cipher! ${strikesP2 - 1} strikes left.`;
        setCipherError(errTxt);
        setTimeout(() => setCipherError(""), 5000);
      }
    }
  };

  // P3 Logic: Đáp án Ma trận mới là 2641
  const handleMatrixSubmit = (e) => {
    e.preventDefault();
    const cleanAns = matrixAnswer.trim();
    if (cleanAns === "2641") {
      setStep(12); // Ultimate Season 2 Ending
    } else {
      setStrikesP3(s => s - 1);
      if (strikesP3 <= 1) {
        setStep(14); // Game Over P3 (Reset về Phần 3 - Step 10)
      } else {
        const errTxt = lang === "vi"
          ? `Mã khóa ma trận sai! Còn ${strikesP3 - 1} mạng.`
          : `Incorrect matrix lock! ${strikesP3 - 1} strikes left.`;
        setMatrixError(errTxt);
        setTimeout(() => setMatrixError(""), 5000);
      }
    }
  };

  const TopStatusBar = () => (
    <div className="flex justify-between items-center w-full mb-8 pb-4 border-b border-zinc-800 relative z-50">
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-amber-500 tracking-widest animate-pulse">[SECURE_BOOT_v5.1_MASTERPIECE]</span>
        <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-all cursor-pointer border border-zinc-700 px-2 py-0.5 rounded">
          {lang === "vi" ? `[ ÂM THANH: ${isMuted ? "TẮT" : "BẬT"} ]` : `[ SOUND: ${isMuted ? "OFF" : "ON"} ]`}
        </button>
      </div>
      {step >= 2 && step !== 5 && step !== 6 && step !== 9 && step !== 12 && step !== 13 && step !== 14 && step !== 15 && (
        <span className="text-xs font-mono text-red-400 border border-red-900 bg-red-950/50 px-3 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          {lang === "vi" ? "MẠNG SỐNG" : "STRIKES"}: {step >= 7 && step <= 9 ? strikesP2 : step >= 10 ? strikesP3 : strikesP1}/3
        </span>
      )}
    </div>
  );

  const CopyrightFooter = () => (
    <div className="w-full mt-10 pt-6 border-t border-zinc-800/50 text-center z-20 relative">
      <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
        <TypewriterText text={t.footer} speed={20} delay={1000} skip={skipTyping} noCursor />
      </span>
    </div>
  );

  // ==========================================
  // BƯỚC -3: CLICK TO START (Enable Audio)
  // ==========================================
  if (step === -3) {
    return (
      <main 
        onClick={() => { setIsMuted(false); if(bgm) bgm.play(); setStep(-2); }} 
        className="h-screen w-full bg-black flex items-center justify-center cursor-pointer scanlines"
      >
         <div className="text-zinc-500 font-mono tracking-widest animate-pulse text-sm text-center px-4">
            {lang === "vi" ? "[ NHẤN ENTER HOẶC CLICK ĐỂ BẮT ĐẦU ]" : "[ PRESS ENTER OR CLICK TO START ]"}
         </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC -2: CINEMATIC TRAILER INTRO
  // ==========================================
  if (step === -2) {
    return (
      <main onClick={() => setSkipTyping(true)} className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-slate-300 font-mono p-4 md:p-12 relative overflow-y-auto py-20">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-30"></div>
        
        {/* NÚT NGÔN NGỮ Ở TRAILER */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
           <button onClick={(e) => { e.stopPropagation(); setLang(lang === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-zinc-600 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer rounded text-xs font-mono">
             <TypewriterText text={t.langBtn} speed={30} skip={skipTyping} noCursor/>
           </button>
        </div>

        <div className="max-w-4xl text-center space-y-8 md:space-y-12 z-10 relative mt-10">
           {t.cinematicLines.map((text, idx) => (
              <div key={idx} className="text-sm md:text-lg lg:text-xl tracking-widest leading-loose whitespace-pre-wrap [text-shadow:0_0_8px_rgba(255,255,255,0.4)]">
                <TypewriterText text={text} speed={25} delay={1000 + idx * 4500} skip={skipTyping} noCursor />
              </div>
           ))}
           <div className="mt-16 pt-12 pb-12 flex justify-center">
             <button onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(-1); }} className="px-8 py-3 border border-zinc-700 text-zinc-400 hover:text-cyan-400 hover:border-cyan-400 hover:bg-cyan-900/20 transition-all font-mono text-xs tracking-widest rounded animate-pulse cursor-pointer relative z-50">
               <TypewriterText text={lang === "vi" ? "[ TIẾP CẬN HỆ THỐNG ]" : "[ ACCESS SYSTEM ]"} delay={skipTyping ? 0 : 23000} skip={skipTyping} noCursor />
             </button>
           </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC -1: TERMINAL GLITCH BOOT
  // ==========================================
  if (step === -1) {
    return (
      <main onClick={() => setSkipTyping(true)} className="min-h-screen w-full bg-black text-cyan-500 font-mono p-6 md:p-12 flex flex-col justify-center items-center relative overflow-y-auto">
        <style dangerouslySetInnerHTML={{__html: `.crt-turn-on { animation: crtOn 1s ease-out forwards; } @keyframes crtOn { 0% { transform: scale(1, 0.01); opacity: 0; filter: brightness(10); } 40% { transform: scale(1, 0.01); opacity: 1; filter: brightness(5); } 100% { transform: scale(1, 1); opacity: 1; filter: brightness(1); } }`}} />
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="max-w-2xl w-full z-10 crt-turn-on relative">
          {t.bootTermLines.map((text, idx) => (
            <div key={idx} className="mb-6 text-sm md:text-xl tracking-widest font-bold">
              <TypewriterText text={text} speed={20} delay={500 + idx * 1200} skip={skipTyping} />
            </div>
          ))}
          <div className="mt-16 relative z-50">
             <button onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(0); }} className="w-full py-4 border border-cyan-500 hover:bg-cyan-400 hover:text-black transition-all tracking-widest font-bold rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer relative z-50">
               <TypewriterText text={lang === "vi" ? "[ XÁC NHẬN TRUY CẬP PROFILE ]" : "[ CONFIRM PROFILE ACCESS ]"} delay={skipTyping ? 0 : 7000} skip={skipTyping} noCursor />
             </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 15: SHUTDOWN SYSTEM
  // ==========================================
  if (step === 15) {
    return (
      <main className="h-screen w-full flex flex-col items-center justify-center bg-black text-zinc-600 font-mono text-sm scanlines relative">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="animate-pulse mb-4 z-10 text-lg">SYSTEM SHUTDOWN COMPLETE.</div>
        <div className="z-10">{lang === "vi" ? "BẠN CÓ THỂ ĐÓNG TAB TRÌNH DUYỆT NÀY." : "YOU MAY CLOSE THIS WINDOW."}</div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 0 & 1: PROFILE & WORKSPACE BOOT
  // ==========================================
  if (step === 0 || step === 1) {
    return (
      <main 
        onClick={() => setSkipTyping(true)}
        className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100`}
      >
        <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `.crt-turn-on { animation: crtOn 1s ease-out forwards; } @keyframes crtOn { 0% { transform: scale(1, 0.01); opacity: 0; filter: brightness(10); } 40% { transform: scale(1, 0.01); opacity: 1; filter: brightness(5); } 100% { transform: scale(1, 1); opacity: 1; filter: brightness(1); } }`}} />
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-8">
          <div className="crt-turn-on w-full max-w-2xl mx-auto my-auto bg-zinc-950/90 border border-cyan-900/50 p-6 md:p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex justify-between items-center w-full mb-8 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-amber-500 tracking-widest animate-pulse">[SECURE_BOOT_v5.1]</span>
                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-all cursor-pointer border border-zinc-700 px-2 py-0.5 rounded">
                  {lang === "vi" ? `[ ÂM THANH: ${isMuted ? "TẮT" : "BẬT"} ]` : `[ SOUND: ${isMuted ? "OFF" : "ON"} ]`}
                </button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setLang(lang === "vi" ? "en" : "vi"); }} className="px-3 py-1.5 border border-zinc-600 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer rounded text-xs font-mono z-50">
                <TypewriterText text={t.langBtn} speed={30} skip={skipTyping} noCursor/>
              </button>
            </div>
            {step === 0 ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-amber-500 mb-4 border-b border-zinc-800 pb-2"><TypewriterText text={t.profTitle} delay={200} skip={skipTyping} /></h1>
                <div className="font-mono text-sm text-cyan-400 space-y-2 mb-8">
                  <p><TypewriterText text={t.profLine1} delay={1000} skip={skipTyping} /></p>
                  <p><TypewriterText text={t.profLine2} delay={1800} skip={skipTyping} /></p>
                  <p><TypewriterText text={t.profLine3} delay={2800} skip={skipTyping} /></p>
                </div>
                <h2 className="text-md font-bold font-mono text-amber-500 mb-4"><TypewriterText text={t.profHeader} delay={3500} skip={skipTyping} /></h2>
                <div className="font-mono text-sm text-zinc-300 space-y-4 mb-10 leading-relaxed">
                  <p><TypewriterText text={t.profP1} speed={10} delay={4500} skip={skipTyping} /></p>
                  <p><TypewriterText text={t.profP2} speed={10} delay={6500} skip={skipTyping} /></p>
                  <p><TypewriterText text={t.profP3} speed={10} delay={8500} skip={skipTyping} /></p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(1); }} className="w-full py-4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono font-bold tracking-widest hover:bg-cyan-400 hover:text-black transition-all cursor-pointer rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] z-50 relative">
                  <TypewriterText text={t.profBtn} delay={11000} skip={skipTyping} noCursor />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold font-mono text-cyan-400 mb-2"><TypewriterText text={t.introTitle} delay={200} skip={skipTyping} /></h1>
                <p className="text-xs text-zinc-400 font-mono mb-6 border-b border-zinc-800 pb-4"><TypewriterText text={t.introSub} delay={800} skip={skipTyping} /></p>
                <div className="bg-black/60 p-4 rounded border border-zinc-800 font-mono text-xs text-zinc-300 space-y-3 mb-8">
                  {t.bootLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2"><span className="text-cyan-400 mt-1">&gt;</span><p><TypewriterText text={log} delay={1200 + (idx * 500)} skip={skipTyping} /></p></div>
                  ))}
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(2); }} className="w-full py-4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono font-bold hover:bg-cyan-400 hover:text-black transition-all cursor-pointer rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] z-50 relative">
                  <TypewriterText text={t.startButton} delay={4000} skip={skipTyping} noCursor />
                </button>
              </>
            )}
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 5: GAME OVER PHẦN 1
  // ==========================================
  if (step === 5) {
    return (
      <main className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100 flex flex-col justify-center">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 w-full max-w-lg mx-auto p-4 md:p-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]">{t.gameOverTitle}</h1>
          <p className="text-zinc-400 font-mono mb-8 leading-relaxed"><TypewriterText text={t.gameOverDesc} speed={20} /></p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 border border-red-600 text-red-500 font-mono hover:bg-red-900 transition-all rounded cursor-pointer relative z-50"><TypewriterText text={t.rebootBtn} delay={1000} noCursor /></button>
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 13: GAME OVER PHẦN 2 (Reset về Step 7)
  // ==========================================
  if (step === 13) {
    return (
      <main className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100 flex flex-col justify-center">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 w-full max-w-lg mx-auto p-4 md:p-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]">
            {lang === "vi" ? "HẾT MẠNG - MẬT MÃ BỊ KHÓA" : "OUT OF STRIKES - CIPHER LOCKED"}
          </h1>
          <p className="text-zinc-400 font-mono mb-8 leading-relaxed">
            {lang === "vi" ? "Bạn đã nhập sai 3 lần. Hệ thống tự động thiết lập lại hiện trường Phần 2." : "You failed 3 times. The system is resetting Part 2 scene."}
          </p>
          <button onClick={() => { setStrikesP2(3); setCipherAnswer(""); setSkipTyping(false); setStep(7); }} className="px-6 py-3 border border-red-600 text-red-500 font-mono hover:bg-red-900 transition-all rounded cursor-pointer relative z-50">
            {lang === "vi" ? "QUAY LẠI HIỆN TRƯỜNG PHẦN 2" : "RETURN TO PART 2 SCENE"}
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 14: GAME OVER PHẦN 3 (Reset về Step 10)
  // ==========================================
  if (step === 14) {
    return (
      <main className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100 flex flex-col justify-center">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <div className="relative z-20 w-full max-w-lg mx-auto p-4 md:p-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]">
            {lang === "vi" ? "HỆ THỐNG PHÁT NỔ - THẤT BẠI" : "SYSTEM DETONATED - MISSION FAILED"}
          </h1>
          <p className="text-zinc-400 font-mono mb-8 leading-relaxed">
            {lang === "vi" ? "Trạm xử lý nước thải phát tán khí độc. Hệ thống khôi phục lại thời điểm Akai vừa bước vào trạm Sector 7." : "Toxic gas released. Restoring timeline to when Akai just entered Sector 7."}
          </p>
          <button onClick={() => { setStrikesP3(3); setMatrixAnswer(""); setTimeLeft(300); setSkipTyping(false); setStep(10); }} className="px-6 py-3 border border-amber-600 text-amber-500 font-mono hover:bg-amber-900 transition-all rounded cursor-pointer relative z-50">
            {lang === "vi" ? "THỬ LẠI TRẬN CHIẾN PHẦN 3" : "RETRY PART 3 SHOWDOWN"}
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 6: VICTORY PHẦN 1
  // ==========================================
  if (step === 6) {
    return (
      <main onClick={() => setSkipTyping(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black text-slate-100">
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade { animation: fadeIn 2s ease-in 7.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />

        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-6 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">
              <TypewriterText text={t.victoryTitle} speed={20} skip={skipTyping} />
            </h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-900/50 p-6 md:p-10 border border-cyan-900 rounded text-left whitespace-pre-wrap shadow-[0_0_30px_rgba(56,189,248,0.1)] w-full h-auto relative z-10">
              <TypewriterText text={t.victoryDesc} speed={10} delay={500} skip={skipTyping} />
            </div>
            <div className={`${skipTyping ? 'opacity-100' : 'delayed-fade'} mb-10 w-full flex justify-center`}>
               <img src="/end1.png" alt="Zodiac Symbol" className="w-40 md:w-56 h-auto object-contain drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(7); }}
              className="px-8 py-4 bg-amber-500 text-black font-bold font-mono tracking-widest hover:bg-amber-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)] rounded animate-pulse z-50 relative"
            >
              <TypewriterText text={t.unlockBtn} delay={skipTyping ? 0 : 8500} skip={skipTyping} noCursor />
            </button>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 9: VICTORY PHẦN 2 (Nền end2.png)
  // ==========================================
  if (step === 9) {
    return (
      <main onClick={() => setSkipTyping(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-[url('/end2.png')] bg-cover bg-center bg-fixed text-slate-100">
        <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-3xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-6 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">
              <TypewriterText text={t.p2VictoryTitle} speed={20} skip={skipTyping} />
            </h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-950/80 p-6 md:p-10 border border-cyan-900 rounded text-center whitespace-pre-wrap shadow-[0_0_40px_rgba(56,189,248,0.2)] backdrop-blur-md w-full relative z-10">
              <TypewriterText text={t.p2VictoryDesc} speed={10} delay={500} skip={skipTyping} />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setTimeLeft(300); setSkipTyping(false); setStep(10); }}
              className="px-8 py-4 bg-cyan-400 text-black font-bold font-mono tracking-widest hover:bg-cyan-300 transition-all cursor-pointer rounded shadow-[0_0_20px_rgba(56,189,248,0.5)] z-50 relative"
            >
              <TypewriterText text={t.p2FinalBtn} delay={skipTyping ? 0 : 5000} skip={skipTyping} noCursor />
            </button>
          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 12: ULTIMATE ENDING (Nền end3.png + Các nút Thoát)
  // ==========================================
  if (step === 12) {
    return (
      <main onClick={() => setSkipTyping(true)} className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative bg-[url('/end3.png')] bg-cover bg-center bg-fixed text-slate-100">
        <div className="fixed inset-0 bg-black/80 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>
        <style dangerouslySetInnerHTML={{__html: `.delayed-fade-btns { animation: fadeIn 2s ease-in 10.5s forwards; opacity: 0; } @keyframes fadeIn { to { opacity: 1; } }`}} />
        
        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12">
          <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 font-mono mb-6 animate-pulse [text-shadow:0_0_15px_rgba(220,38,38,0.8)]">
              <TypewriterText text={t.season2Title} speed={20} skip={skipTyping} />
            </h1>
            <div className="text-zinc-300 font-mono mb-10 leading-loose bg-zinc-950/90 p-6 md:p-10 border border-red-900 rounded text-left whitespace-pre-wrap shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-md w-full relative z-10">
              <TypewriterText text={t.season2Desc} speed={10} delay={500} skip={skipTyping} />
            </div>
            <div className="text-amber-500 font-mono tracking-widest text-sm md:text-base animate-bounce [text-shadow:0_0_10px_rgba(245,158,11,0.8)]">
              <TypewriterText text={t.season2Footer} speed={25} delay={skipTyping ? 0 : 9000} skip={skipTyping} />
            </div>

            {/* NÚT CHƠI LẠI HOẶC KẾT THÚC HỆ THỐNG */}
            <div className={`${skipTyping ? 'opacity-100' : 'delayed-fade-btns'} flex flex-col md:flex-row justify-center gap-4 md:gap-8 mt-12 w-full z-50 relative`}>
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.reload(); }} 
                className="px-6 py-4 bg-amber-500/20 border border-amber-500 text-amber-400 font-bold font-mono tracking-widest hover:bg-amber-500 hover:text-black transition-all cursor-pointer rounded"
              >
                {lang === "vi" ? "[ CHƠI LẠI TỪ ĐẦU ]" : "[ REPLAY MISSION ]"}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(15); }} 
                className="px-6 py-4 bg-red-900/40 border border-red-600 text-red-500 font-bold font-mono tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer rounded"
              >
                {lang === "vi" ? "[ KẾT THÚC HỆ THỐNG ]" : "[ SYSTEM SHUTDOWN ]"}
              </button>
            </div>

          </div>
          <CopyrightFooter />
        </div>
      </main>
    );
  }

  // ==========================================
  // BƯỚC 2, 3, 4: WORKSPACE P1 & TERMINAL P1 (LOGIC CODE)
  // ==========================================
  if (step === 2 || step === 3 || step === 4) {
    return (
      <main 
        onClick={() => setSkipTyping(true)}
        className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100 transition-all duration-1000 flex flex-col`}
      >
        <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>

        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12 max-w-7xl mx-auto w-full pb-32">
          <TopStatusBar />
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-zinc-800 pb-6">
            <div className="mb-4 md:mb-0">
              <span className="text-xs tracking-widest text-amber-500 font-mono"><TypewriterText text={t.subtitle} speed={20} skip={skipTyping} /></span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-mono tracking-wider mt-2 text-cyan-400 break-words [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">
                <TypewriterText text={t.title} speed={25} delay={300} skip={skipTyping} />
              </h1>
            </div>
            <div className="flex gap-4 z-50">
               <button onClick={(e) => { e.stopPropagation(); setStep(0); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-red-500 hover:text-red-400 text-xs font-mono transition-all rounded cursor-pointer">{t.exitBtn}</button>
               <button onClick={(e) => { e.stopPropagation(); setLang(lang === "vi" ? "en" : "vi"); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 text-xs font-mono transition-all rounded cursor-pointer">{t.langBtn}</button>
            </div>
          </header>

          {step === 4 ? (
            /* TERMINAL CHỐT ÁN P1 */
            <div className="max-w-3xl mx-auto mt-12 bg-zinc-950/90 border border-cyan-400 p-6 md:p-8 rounded shadow-[0_0_50px_rgba(56,189,248,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
              <h2 className="text-xl font-bold font-mono text-cyan-400 mb-6 [text-shadow:0_0_8px_rgba(34,211,238,0.8)]"><TypewriterText text={t.conclusionTitle} speed={20} skip={skipTyping} /></h2>
              
              {logicError && (
                <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                  ⚠️ {logicError}
                </div>
              )}

              <div className="font-mono text-zinc-300 leading-loose mb-8 whitespace-pre-wrap flex-grow">
                <TypewriterText text={t.conclusionText} speed={15} delay={500} skip={skipTyping} />
              </div>
              <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4 mt-auto">
                <input 
                  type="text" autoFocus value={finalAnswer} onChange={(e) => setFinalAnswer(e.target.value)} placeholder={t.placeholder}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-black border-2 border-zinc-700 focus:border-amber-500 text-amber-500 font-mono p-4 rounded outline-none transition-all text-center tracking-widest text-lg shadow-inner uppercase"
                />
                <button type="submit" onClick={(e) => e.stopPropagation()} className="self-end px-8 py-4 bg-cyan-400 text-black font-bold font-mono hover:bg-cyan-300 transition-all cursor-pointer rounded w-full tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  {t.submitBtn}
                </button>
              </form>
            </div>
          ) : step === 3 ? (
            /* TERMINAL NHẬP MÃ CHUỖI P1 */
            <div className="max-w-3xl mx-auto mt-6 bg-zinc-950/95 border border-cyan-500 p-6 md:p-10 rounded shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
              <h2 className="text-xl font-bold font-mono text-cyan-400 mb-6 [text-shadow:0_0_8px_rgba(34,211,238,0.8)]"><TypewriterText text={t.p1BoardTitle} speed={20} skip={skipTyping} /></h2>
              
              {logicError && (
                <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                  ⚠️ {logicError}
                </div>
              )}

              <div className="font-mono text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap bg-black/70 p-6 rounded border border-zinc-900 text-lg tracking-wide">
                <TypewriterText text={t.p1BoardDesc} speed={15} delay={300} skip={skipTyping} />
              </div>

              <form onSubmit={handleLogicCodeSubmit} className="flex flex-col gap-4 mt-auto">
                <input 
                  type="text" autoFocus value={logicAnswer} onChange={(e) => setLogicAnswer(e.target.value)} placeholder={t.p1BoardPlaceholder}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-black border-2 border-zinc-700 focus:border-cyan-500 text-cyan-400 font-mono p-4 rounded outline-none transition-all text-2xl tracking-widest text-center shadow-inner"
                />
                <button type="submit" onClick={(e) => e.stopPropagation()} className="self-end px-8 py-4 bg-cyan-500 text-black font-bold font-mono hover:bg-cyan-400 transition-all cursor-pointer rounded w-full tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  {t.p1BoardSubmit}
                </button>
              </form>
            </div>
          ) : (
            /* WORKSPACE PHẦN 1 */
            <>
              <div className="mb-10 p-6 bg-zinc-950/80 border border-cyan-900/60 rounded flex flex-col h-auto relative z-10">
                <h2 className="text-md font-bold font-mono text-amber-500 mb-4 border-b border-zinc-800 pb-2 [text-shadow:0_0_8px_rgba(245,158,11,0.8)]">
                  <TypewriterText text={t.briefingTitle} speed={20} delay={500} skip={skipTyping} />
                </h2>
                <div className="font-mono text-sm text-cyan-400 space-y-3 whitespace-pre-wrap flex-grow">
                  {t.briefingLines.map((line, idx) => (
                    <p key={idx}><TypewriterText text={line} speed={10} delay={1000 + (idx * 1200)} skip={skipTyping} noCursor={idx !== t.briefingLines.length - 1} /></p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 h-auto relative z-10">
                {t.cards.map((card, index) => {
                  const baseDelay = 6500 + (index * 600);
                  return (
                    <div key={card.id} onClick={(e) => { e.stopPropagation(); setSelectedEvidence(card); }} className="p-6 bg-zinc-950/90 border border-zinc-700 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] relative backdrop-blur-md z-30 flex flex-col hover:border-cyan-700 transition-all hover:-translate-y-1 h-auto cursor-pointer">
                      <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-500 [text-shadow:0_0_5px_rgba(245,158,11,0.5)]"><TypewriterText text={card.title} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                        <span className="text-xs font-mono text-cyan-600"><TypewriterText text={card.tag} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                      </div>
                      <div className="text-zinc-300 text-sm leading-relaxed flex-grow mb-4">
                        <TypewriterText text={card.desc} speed={10} delay={baseDelay + 300} skip={skipTyping} />
                      </div>
                      <div className="text-xs text-cyan-400 font-mono mt-auto">{lang === "vi" ? "[ Xem chi tiết -> ]" : "[ View detail -> ]"}</div>
                    </div>
                  );
                })}
              </div>

              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(3); }}
                  className="px-10 py-4 bg-amber-500 text-black font-bold font-mono tracking-widest text-sm md:text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all cursor-pointer rounded-sm hover:scale-105"
                >
                  <TypewriterText text={t.openBoardBtn} speed={15} delay={9500} skip={skipTyping} noCursor />
                </button>
              </div>
            </>
          )}
          
          <div className="mt-auto pt-8"><CopyrightFooter /></div>
        </div>

        {/* MODAL CHI TIẾT P1 */}
        {selectedEvidence && (
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 z-[100] overflow-y-auto">
            <div className="bg-zinc-950 border border-cyan-400 w-full max-w-2xl max-h-full overflow-y-auto p-6 md:p-8 rounded font-mono shadow-[0_0_40px_rgba(56,189,248,0.2)] relative mt-10 mb-10">
              <h2 className="text-xl font-bold text-slate-100 mb-6 border-l-4 border-cyan-400 pl-4 [text-shadow:0_0_8px_rgba(34,211,238,0.6)]">
                <TypewriterText text={selectedEvidence.title} speed={20} />
              </h2>
              <div className="text-zinc-300 text-sm leading-loose mb-8 bg-black/60 p-4 md:p-6 rounded border border-zinc-800 whitespace-pre-wrap">
                <TypewriterText text={selectedEvidence.detail} speed={10} delay={200} />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-zinc-800 pt-6">
                <button onClick={() => setSelectedEvidence(null)} className="text-zinc-500 hover:text-white transition-all text-sm w-full sm:w-auto py-2">
                  {lang === "vi" ? "[ ĐÓNG TÀI LIỆU ]" : "[ CLOSE DOCUMENT ]"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ==========================================
  // BƯỚC 10 & 11: WORKSPACE PHẦN 3 & TERMINAL P3 (MATRIX LOCK + TIMER)
  // ==========================================
  if (step === 10 || step === 11) {
    return (
      <main 
        onClick={() => setSkipTyping(true)}
        className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100 transition-all duration-1000 flex flex-col`}
      >
        <div className="fixed inset-0 bg-black/80 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>

        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12 max-w-7xl mx-auto w-full pb-32">
          <TopStatusBar />
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-zinc-800 pb-6">
            <div className="mb-4 md:mb-0">
              <span className="text-xs tracking-widest text-amber-500 font-mono"><TypewriterText text={t.p3Subtitle} speed={20} skip={skipTyping} /></span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-mono tracking-wider mt-2 text-amber-500 break-words [text-shadow:0_0_10px_rgba(245,158,11,0.8)]">
                <TypewriterText text={t.p3Title} speed={25} delay={300} skip={skipTyping} />
              </h1>
            </div>
            <div className="flex gap-4 z-50">
               <button onClick={(e) => { e.stopPropagation(); setStep(0); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-red-500 hover:text-red-400 text-xs font-mono transition-all rounded cursor-pointer">{t.exitBtn}</button>
               <button onClick={(e) => { e.stopPropagation(); setLang(lang === "vi" ? "en" : "vi"); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 text-xs font-mono transition-all rounded cursor-pointer">{t.langBtn}</button>
            </div>
          </header>

          {step === 11 ? (
            /* TERMINAL PHẦN 3: MATRIX LOCK VỚI BOM HẸN GIỜ 05:00 */
            <div className="max-w-3xl mx-auto mt-6 bg-zinc-950/95 border border-amber-500 p-6 md:p-10 rounded shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-mono text-amber-500 mb-4 md:mb-0 [text-shadow:0_0_8px_rgba(245,158,11,0.8)]"><TypewriterText text={t.p3TerminalTitle} speed={20} skip={skipTyping} /></h2>
                {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
                <div className={`text-4xl font-bold font-mono bg-black px-4 py-2 rounded border ${timeLeft <= 60 ? 'text-red-500 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'text-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}>
                  [ {formatTime(timeLeft)} ]
                </div>
              </div>
              
              {matrixError && (
                <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                  ⚠️ {matrixError}
                </div>
              )}

              <div className="font-mono text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap bg-black/70 p-6 rounded border border-zinc-900 text-center text-lg md:text-xl tracking-widest">
                <TypewriterText text={t.p3TerminalDesc} speed={15} delay={300} skip={skipTyping} />
              </div>

              <form onSubmit={handleMatrixSubmit} className="flex flex-col gap-4 mt-auto">
                <input 
                  type="text" autoFocus value={matrixAnswer} onChange={(e) => setMatrixAnswer(e.target.value)} placeholder={t.p3Placeholder}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-black border-2 border-zinc-700 focus:border-amber-500 text-amber-500 font-mono p-4 rounded outline-none transition-all text-2xl tracking-widest text-center shadow-inner"
                />
                <button type="submit" onClick={(e) => e.stopPropagation()} className="self-end px-8 py-4 bg-amber-500 text-black font-bold font-mono hover:bg-amber-400 transition-all cursor-pointer rounded w-full tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  {t.p3Submit}
                </button>
              </form>
            </div>
          ) : (
            /* WORKSPACE PHẦN 3 */
            <>
              <div className="mb-10 p-6 bg-zinc-950/90 border border-amber-900/60 rounded flex flex-col relative z-10">
                <h2 className="text-md font-bold font-mono text-amber-500 mb-4 border-b border-zinc-800 pb-2 [text-shadow:0_0_8px_rgba(245,158,11,0.8)]">
                  <TypewriterText text={t.p3BriefingTitle} speed={20} delay={500} skip={skipTyping} />
                </h2>
                <div className="font-mono text-sm text-zinc-300 space-y-3 whitespace-pre-wrap flex-grow">
                  {t.p3BriefingLines.map((line, idx) => (
                    <p key={idx}><TypewriterText text={line} speed={10} delay={1000 + (idx * 1200)} skip={skipTyping} noCursor={idx !== t.p3BriefingLines.length - 1} /></p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 relative z-10">
                {t.p3Cards.map((card, index) => {
                  const baseDelay = 4500 + (index * 600);
                  return (
                    <div 
                      key={card.id} 
                      onClick={(e) => { e.stopPropagation(); setSelectedEvidence(card); }}
                      className="p-6 bg-zinc-950/90 border border-zinc-700 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] relative backdrop-blur-md z-30 flex flex-col hover:border-amber-500 transition-all hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-500 [text-shadow:0_0_5px_rgba(245,158,11,0.5)]"><TypewriterText text={card.title} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                        <span className="text-xs font-mono text-zinc-500"><TypewriterText text={card.tag} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                      </div>
                      <div className="text-zinc-300 text-sm leading-relaxed flex-grow mb-4">
                        <TypewriterText text={card.desc} speed={10} delay={baseDelay + 300} skip={skipTyping} />
                      </div>
                      <div className="text-xs text-amber-400 font-mono mt-auto">{lang === "vi" ? "[ Xem chi tiết -> ]" : "[ View detail -> ]"}</div>
                    </div>
                  );
                })}
              </div>

              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40">
                <button 
                  onClick={(e) => { e.stopPropagation(); setTimeLeft(300); setSkipTyping(false); setStep(11); }}
                  className="px-10 py-4 bg-amber-500 text-black font-bold font-mono tracking-widest text-sm md:text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:bg-amber-400 transition-all cursor-pointer rounded-sm hover:scale-105"
                >
                  <TypewriterText text={t.p3OpenTerminal} speed={15} delay={7500} skip={skipTyping} noCursor />
                </button>
              </div>
            </>
          )}

          <div className="mt-auto pt-8"><CopyrightFooter /></div>
        </div>

        {/* MODAL CHI TIẾT P3 */}
        {selectedEvidence && (
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 md:p-8 z-[100] overflow-y-auto">
            <div className="bg-zinc-950 border border-amber-500 w-full max-w-2xl max-h-full overflow-y-auto p-6 md:p-8 rounded font-mono shadow-[0_0_40px_rgba(245,158,11,0.3)] relative mt-10 mb-10">
              <h2 className="text-xl font-bold text-slate-100 mb-6 border-l-4 border-amber-500 pl-4 [text-shadow:0_0_8px_rgba(245,158,11,0.6)]">
                <TypewriterText text={selectedEvidence.title} speed={20} />
              </h2>
              <div className="text-zinc-300 text-sm leading-loose mb-8 bg-black/60 p-4 md:p-6 rounded border border-zinc-800 whitespace-pre-wrap">
                <TypewriterText text={selectedEvidence.detail} speed={10} delay={200} />
              </div>
              <div className="flex justify-end border-t border-zinc-800 pt-6">
                <button onClick={() => setSelectedEvidence(null)} className="px-6 py-2 bg-amber-500/20 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black transition-all text-xs rounded cursor-pointer">
                  {lang === "vi" ? "[ ĐÓNG TÀI LIỆU ]" : "[ CLOSE DOCUMENT ]"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ==========================================
  // BƯỚC 7 & 8: WORKSPACE PHẦN 2 & TERMINAL PHẦN 2
  // ==========================================
  if (step === 7 || step === 8) {
    return (
      <main 
        onClick={() => setSkipTyping(true)}
        className={`min-h-screen w-full overflow-y-auto overflow-x-hidden relative ${getBackgroundClass()} bg-cover bg-center bg-fixed text-slate-100 transition-all duration-1000 flex flex-col`}
      >
        <div className="fixed inset-0 bg-black/80 z-0 pointer-events-none"></div>
        <div className="fixed inset-0 scanlines z-0 pointer-events-none opacity-50"></div>

        <div className="relative z-20 min-h-full flex flex-col p-4 md:p-12 max-w-7xl mx-auto w-full pb-32">
          <TopStatusBar />
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-zinc-800 pb-6">
            <div className="mb-4 md:mb-0">
              <span className="text-xs tracking-widest text-red-500 font-mono"><TypewriterText text={t.p2Subtitle} speed={20} skip={skipTyping} /></span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-mono tracking-wider mt-2 text-red-500 break-words [text-shadow:0_0_10px_rgba(239,68,68,0.8)]">
                <TypewriterText text={t.p2Title} speed={25} delay={300} skip={skipTyping} />
              </h1>
            </div>
            <div className="flex gap-4 z-50">
               <button onClick={(e) => { e.stopPropagation(); setStep(0); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-red-500 hover:text-red-400 text-xs font-mono transition-all rounded cursor-pointer">{t.exitBtn}</button>
               <button onClick={(e) => { e.stopPropagation(); setLang(lang === "vi" ? "en" : "vi"); }} className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 text-xs font-mono transition-all rounded cursor-pointer">{t.langBtn}</button>
            </div>
          </header>

          {step === 8 ? (
            /* TERMINAL GIẢI MÃ CAESAR PHẦN 2 */
            <div className="max-w-4xl mx-auto mt-6 bg-zinc-950/95 border border-red-500 p-6 md:p-10 rounded shadow-[0_0_50px_rgba(239,68,68,0.2)] backdrop-blur-md mb-16 animate-fade-in flex flex-col w-full relative z-10">
              <h2 className="text-xl font-bold font-mono text-red-500 mb-6 [text-shadow:0_0_8px_rgba(239,68,68,0.8)]"><TypewriterText text={t.p2TerminalTitle} speed={20} skip={skipTyping} /></h2>
              
              {cipherError && (
                <div className="mb-6 p-4 bg-red-950/80 border border-red-500 text-red-400 font-mono text-sm text-center animate-pulse rounded">
                  ⚠️ {cipherError}
                </div>
              )}

              <div className="font-mono text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap bg-black/60 p-4 rounded border border-zinc-900 text-sm md:text-base">
                <TypewriterText text={t.p2TerminalDesc} speed={15} delay={300} skip={skipTyping} />
              </div>

              {/* BẢNG CHỮ CẢI A-Z */}
              <div className="mb-8 bg-zinc-900/90 border border-red-900/60 p-6 rounded font-mono shadow-inner">
                <p className="text-amber-400 font-bold mb-4 tracking-wider text-center text-sm">{lang === "vi" ? "📋 BẢNG THAM CHIẾU KÝ TỰ A-Z:" : "📋 A-Z CIPHER REFERENCE:"}</p>
                <div className="space-y-4 text-center">
                  <div className="overflow-x-auto pb-2">
                    <div className="inline-flex gap-1 md:gap-2 text-cyan-300 font-bold text-sm md:text-base">
                      {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"].map((char, idx) => (
                        <span key={idx} className="w-6 md:w-8 py-1.5 bg-black/90 border border-cyan-900 rounded shadow-inner">{char}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCipherSubmit} className="flex flex-col gap-4 mt-auto">
                <input 
                  type="text" autoFocus value={cipherAnswer} onChange={(e) => setCipherAnswer(e.target.value)} placeholder={t.p2Placeholder}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-black border-2 border-zinc-700 focus:border-red-500 text-red-400 font-mono p-4 rounded outline-none transition-all uppercase text-lg tracking-widest text-center shadow-inner"
                />
                <button type="submit" onClick={(e) => e.stopPropagation()} className="self-end px-8 py-4 bg-red-600 text-white font-bold font-mono hover:bg-red-500 transition-all cursor-pointer rounded w-full tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  {t.p2Submit}
                </button>
              </form>
            </div>
          ) : (
            /* WORKSPACE PHẦN 2 */
            <>
              <div className="mb-10 p-6 bg-zinc-950/90 border border-red-900/60 rounded flex flex-col relative z-10">
                <h2 className="text-md font-bold font-mono text-red-500 mb-4 border-b border-zinc-800 pb-2 [text-shadow:0_0_8px_rgba(239,68,68,0.8)]">
                  <TypewriterText text={t.p2BriefingTitle} speed={20} delay={500} skip={skipTyping} />
                </h2>
                <div className="font-mono text-sm text-zinc-300 space-y-3 whitespace-pre-wrap flex-grow">
                  {t.p2BriefingLines.map((line, idx) => (
                    <p key={idx}><TypewriterText text={line} speed={10} delay={1000 + (idx * 1200)} skip={skipTyping} noCursor={idx !== t.p2BriefingLines.length - 1} /></p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative z-10">
                {t.p2Cards.map((card, index) => {
                  const baseDelay = 4500 + (index * 600);
                  return (
                    <div 
                      key={card.id} 
                      onClick={(e) => { e.stopPropagation(); setSelectedEvidence(card); }}
                      className="p-6 bg-zinc-950/90 border border-zinc-700 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] relative backdrop-blur-md z-30 flex flex-col hover:border-red-500 transition-all hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-red-500 [text-shadow:0_0_5px_rgba(239,68,68,0.5)]"><TypewriterText text={card.title} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                        <span className="text-xs font-mono text-zinc-500"><TypewriterText text={card.tag} speed={15} delay={baseDelay} skip={skipTyping} /></span>
                      </div>
                      <div className="text-zinc-300 text-sm leading-relaxed flex-grow mb-4">
                        <TypewriterText text={card.desc} speed={10} delay={baseDelay + 300} skip={skipTyping} />
                      </div>
                      <div className="text-xs text-red-400 font-mono mt-auto">{lang === "vi" ? "[ Xem chi tiết -> ]" : "[ View detail -> ]"}</div>
                    </div>
                  );
                })}
              </div>

              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSkipTyping(false); setStep(8); }}
                  className="px-10 py-4 bg-red-600 text-white font-bold font-mono tracking-widest text-sm md:text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:bg-red-500 transition-all cursor-pointer rounded-sm hover:scale-105"
                >
                  <TypewriterText text={t.p2OpenTerminal} speed={15} delay={7500} skip={skipTyping} noCursor />
                </button>
              </div>
            </>
          )}

          <div className="mt-auto pt-8"><CopyrightFooter /></div>
        </div>

        {/* MODAL CHI TIẾT P2 */}
        {selectedEvidence && (
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 md:p-8 z-[100] overflow-y-auto">
            <div className="bg-zinc-950 border border-red-500 w-full max-w-2xl max-h-full overflow-y-auto p-6 md:p-8 rounded font-mono shadow-[0_0_40px_rgba(239,68,68,0.3)] relative mt-10 mb-10">
              <h2 className="text-xl font-bold text-slate-100 mb-6 border-l-4 border-red-500 pl-4 [text-shadow:0_0_8px_rgba(239,68,68,0.6)]">
                <TypewriterText text={selectedEvidence.title} speed={20} />
              </h2>

              {selectedEvidence.id === 103 && (
                <div className="mb-6 w-full flex justify-center bg-zinc-900 p-2 border border-red-900/60 rounded shadow-inner">
                  <img src="/bloody_note.png" alt="Bloody Note Cipher" className="w-full h-auto max-h-[350px] object-cover rounded filter contrast-125" />
                </div>
              )}

              {selectedEvidence.id === 104 && (
                <div className="mb-6 w-full flex justify-center bg-zinc-900 p-2 border border-red-900/60 rounded shadow-inner">
                  <img src="/hidden_symbol.png" alt="Hidden USB Upstairs" className="w-full h-auto max-h-[350px] object-cover rounded" />
                </div>
              )}

              <div className="text-zinc-300 text-sm leading-loose mb-8 bg-black/60 p-4 md:p-6 rounded border border-zinc-800 whitespace-pre-wrap">
                <TypewriterText text={selectedEvidence.detail} speed={10} delay={200} />
              </div>
              
              <div className="flex justify-end border-t border-zinc-800 pt-6">
                <button onClick={() => setSelectedEvidence(null)} className="px-6 py-2 bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs rounded cursor-pointer">
                  {lang === "vi" ? "[ ĐÓNG TÀI LIỆU ]" : "[ CLOSE DOCUMENT ]"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }
}