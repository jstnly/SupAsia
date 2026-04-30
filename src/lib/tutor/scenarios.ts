// Scripted scenario dialogues with branching. User input is fuzzy-matched against
// `accept[].patterns` (and optionally `keywords`); the first branch above the
// threshold wins. Falls back to `fallback` line + `suggestions` chips on no match.

export type AcceptedReply = {
  patterns: string[];
  keywords?: string[];
  reply: { vi: string; en: string; audioText?: string };
  next: string;
  teach?: { word: string; meaning: string }[];
};

export type ScenarioTurn = {
  id: string;
  npc: { vi: string; en: string; audioText?: string };
  accept: AcceptedReply[];
  fallback: { vi: string; en: string; audioText?: string };
  suggestions?: string[];
};

export type ScenarioId =
  | "cafe"
  | "market"
  | "meeting"
  | "restaurant"
  | "directions"
  | "free";

export type Scenario = {
  id: ScenarioId;
  emoji: string;
  title: string;
  titleVi: string;
  description: string;
  setting: string;
  startId: string;
  turns: Record<string, ScenarioTurn>;
};

// ─── Café ─────────────────────────────────────────────────────────────────────

const cafe: Scenario = {
  id: "cafe",
  emoji: "☕",
  title: "At the Café",
  titleVi: "Quán Cà Phê",
  description: "Order drinks at a Sài Gòn cà phê",
  setting:
    "You walk into Cà Phê Bồ on a humid afternoon. The barista smiles and waves you over to the counter.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Chào em! Em uống gì?", en: "Hi! What would you like to drink?" },
      accept: [
        {
          patterns: ["chào anh", "chao anh", "xin chào", "xin chao", "chào", "chao", "hello"],
          reply: {
            vi: "Quán mình có cà phê đen, cà phê sữa đá, bạc xỉu, sinh tố. Em thích loại nào?",
            en: "We have black coffee, iced milk coffee, bạc xỉu, smoothies. Which would you like?",
          },
          next: "order",
          teach: [
            { word: "chào", meaning: "hello / hi" },
            { word: "uống", meaning: "to drink" },
          ],
        },
        {
          patterns: ["cà phê", "ca phe", "cho tôi cà phê", "cho mình cà phê", "coffee"],
          reply: {
            vi: "Cà phê đen, sữa đá, hay bạc xỉu em ơi?",
            en: "Black, iced milk, or bạc xỉu?",
          },
          next: "order",
        },
      ],
      fallback: {
        vi: "Em muốn uống cà phê hay nước trái cây?",
        en: "Would you like coffee or juice?",
      },
      suggestions: ["Chào anh", "Cho tôi cà phê", "Có gì uống?"],
    },
    order: {
      id: "order",
      npc: {
        vi: "Em chọn loại nào?",
        en: "Which one would you like?",
      },
      accept: [
        {
          patterns: ["cho tôi cà phê đen", "cho mình cà phê đen", "cà phê đen", "ca phe den", "black coffee"],
          keywords: ["đen", "den"],
          reply: {
            vi: "Một ly cà phê đen. Em uống nóng hay đá?",
            en: "One black coffee. Hot or iced?",
          },
          next: "ice",
          teach: [{ word: "đen", meaning: "black" }, { word: "ly", meaning: "glass / cup" }],
        },
        {
          patterns: ["cà phê sữa đá", "ca phe sua da", "iced milk coffee", "sữa đá"],
          keywords: ["sữa", "sua"],
          reply: {
            vi: "Cà phê sữa đá ngon lắm! Em ăn gì kèm không?",
            en: "Iced milk coffee — great choice! Anything to eat with it?",
          },
          next: "snack",
          teach: [
            { word: "sữa", meaning: "milk" },
            { word: "đá", meaning: "ice" },
          ],
        },
        {
          patterns: ["bạc xỉu", "bac xiu"],
          reply: {
            vi: "Bạc xỉu — nhiều sữa hơn cà phê. Em ăn gì kèm không?",
            en: "Bạc xỉu — more milk than coffee. Anything to eat with it?",
          },
          next: "snack",
        },
        {
          patterns: ["sinh tố", "sinh to", "smoothie", "sinh tố xoài", "mango smoothie"],
          reply: {
            vi: "Sinh tố xoài hay sinh tố bơ em ơi?",
            en: "Mango smoothie or avocado smoothie?",
          },
          next: "smoothie",
        },
      ],
      fallback: {
        vi: "Anh chưa nghe rõ. Em thử nói lại nhé?",
        en: "I didn't catch that. Could you say it again?",
      },
      suggestions: ["Cho tôi cà phê đen", "Cà phê sữa đá", "Bạc xỉu"],
    },
    ice: {
      id: "ice",
      npc: { vi: "Nóng hay đá?", en: "Hot or iced?" },
      accept: [
        {
          patterns: ["đá", "da", "iced", "lạnh", "lanh", "cà phê đá"],
          reply: {
            vi: "Cà phê đen đá. Em ăn gì kèm không?",
            en: "Iced black coffee. Anything to eat with it?",
          },
          next: "snack",
        },
        {
          patterns: ["nóng", "nong", "hot"],
          reply: {
            vi: "Cà phê đen nóng. Em ăn gì kèm không?",
            en: "Hot black coffee. Anything to eat with it?",
          },
          next: "snack",
        },
      ],
      fallback: { vi: "Anh không hiểu. Em muốn nóng hay đá?", en: "I don't understand. Hot or iced?" },
      suggestions: ["Đá", "Nóng"],
    },
    smoothie: {
      id: "smoothie",
      npc: { vi: "Xoài hay bơ?", en: "Mango or avocado?" },
      accept: [
        {
          patterns: ["xoài", "xoai", "mango"],
          reply: { vi: "Sinh tố xoài. Em ăn gì kèm không?", en: "Mango smoothie. Anything to eat?" },
          next: "snack",
        },
        {
          patterns: ["bơ", "bo", "avocado"],
          reply: { vi: "Sinh tố bơ. Em ăn gì kèm không?", en: "Avocado smoothie. Anything to eat?" },
          next: "snack",
        },
      ],
      fallback: { vi: "Em thích xoài hay bơ?", en: "Mango or avocado?" },
      suggestions: ["Xoài", "Bơ"],
    },
    snack: {
      id: "snack",
      npc: {
        vi: "Có bánh mì 20 ngàn, bánh flan 18 ngàn. Em muốn không?",
        en: "We have bánh mì for 20k and bánh flan for 18k. Would you like any?",
      },
      accept: [
        {
          patterns: ["bánh mì", "banh mi", "cho tôi bánh mì", "một bánh mì"],
          reply: { vi: "Một bánh mì nhé. Còn gì nữa không em?", en: "One bánh mì. Anything else?" },
          next: "more",
          teach: [{ word: "bánh mì", meaning: "Vietnamese sandwich" }],
        },
        {
          patterns: ["bánh flan", "banh flan", "flan"],
          reply: { vi: "Bánh flan nha. Còn gì nữa không em?", en: "Bánh flan. Anything else?" },
          next: "more",
        },
        {
          patterns: ["không", "khong", "no", "không cần", "không cảm ơn"],
          keywords: ["khong", "no"],
          reply: { vi: "Dạ. Tổng cộng 25 ngàn nhé.", en: "Got it. That's 25,000 đồng total." },
          next: "pay",
        },
      ],
      fallback: {
        vi: "Em ăn bánh mì hay bánh flan, hay là không cần ăn?",
        en: "Bánh mì, bánh flan, or no food?",
      },
      suggestions: ["Bánh mì", "Bánh flan", "Không cần"],
    },
    more: {
      id: "more",
      npc: { vi: "Còn gì nữa không?", en: "Anything else?" },
      accept: [
        {
          patterns: ["không", "khong", "no", "đủ rồi", "du roi", "vậy thôi", "vay thoi"],
          keywords: ["khong", "no", "du", "thoi"],
          reply: { vi: "Dạ! Tổng cộng 45 ngàn em ơi.", en: "Okay! That's 45,000 đồng total." },
          next: "pay",
        },
        {
          patterns: ["có", "co", "yes", "thêm trà đá", "trà đá"],
          reply: { vi: "Trà đá miễn phí nha! Em chờ chút.", en: "Iced tea is free! One moment." },
          next: "pay",
        },
      ],
      fallback: { vi: "Em muốn thêm gì không?", en: "Want to add anything?" },
      suggestions: ["Không, đủ rồi", "Thêm trà đá", "Có"],
    },
    pay: {
      id: "pay",
      npc: { vi: "Em trả tiền mặt hay chuyển khoản?", en: "Cash or bank transfer?" },
      accept: [
        {
          patterns: ["tiền mặt", "tien mat", "cash"],
          reply: { vi: "Dạ, em đưa tiền nhé.", en: "Cash it is. Hand it over please." },
          next: "thanks",
        },
        {
          patterns: ["chuyển khoản", "chuyen khoan", "transfer", "qr"],
          reply: { vi: "Em quét mã QR ở đây nha.", en: "Scan the QR code here." },
          next: "thanks",
        },
      ],
      fallback: { vi: "Tiền mặt hay chuyển khoản em?", en: "Cash or transfer?" },
      suggestions: ["Tiền mặt", "Chuyển khoản"],
    },
    thanks: {
      id: "thanks",
      npc: { vi: "Cảm ơn em! Hẹn gặp lại nhé.", en: "Thank you! See you again." },
      accept: [
        {
          patterns: ["cảm ơn", "cam on", "thank you", "thanks", "cảm ơn anh"],
          reply: {
            vi: "Không có gì! Chúc em ngày tốt lành.",
            en: "You're welcome! Have a great day.",
          },
          next: "end",
        },
        {
          patterns: ["hẹn gặp lại", "hen gap lai", "tạm biệt", "tam biet", "bye"],
          reply: { vi: "Hẹn gặp lại em!", en: "See you again!" },
          next: "end",
        },
      ],
      fallback: { vi: "Hẹn gặp lại em nhé!", en: "See you again!" },
      suggestions: ["Cảm ơn anh", "Hẹn gặp lại"],
    },
    end: {
      id: "end",
      npc: { vi: "🎉 Tuyệt vời! Em vừa đặt cà phê thành công!", en: "🎉 Great job! You just ordered coffee successfully!" },
      accept: [],
      fallback: { vi: "Hết rồi nhé!", en: "All done!" },
    },
  },
};

// ─── Market ───────────────────────────────────────────────────────────────────

const market: Scenario = {
  id: "market",
  emoji: "🛒",
  title: "At the Market",
  titleVi: "Đi Chợ",
  description: "Bargain and shop at chợ Bến Thành",
  setting:
    "You're at chợ Bến Thành, weaving past stalls of fruit, fish, and souvenirs. A friendly fruit vendor catches your eye.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Em ơi! Mua trái cây không em?", en: "Hey! Want to buy some fruit?" },
      accept: [
        {
          patterns: ["chào chị", "chao chi", "xin chào", "chào"],
          reply: {
            vi: "Hôm nay xoài ngon lắm. Em xem thử nhé!",
            en: "The mangoes are great today. Take a look!",
          },
          next: "browse",
        },
        {
          patterns: ["có gì", "co gi", "what do you have", "xem được không"],
          reply: {
            vi: "Có xoài, mít, sầu riêng, măng cụt. Em thích loại nào?",
            en: "Mango, jackfruit, durian, mangosteen. Which do you like?",
          },
          next: "browse",
        },
      ],
      fallback: { vi: "Em xem trái cây của chị nha!", en: "Have a look at my fruit!" },
      suggestions: ["Chào chị", "Có gì hôm nay?"],
    },
    browse: {
      id: "browse",
      npc: {
        vi: "Xoài 50 ngàn một ký. Em mua bao nhiêu?",
        en: "Mango is 50k per kilo. How much would you like?",
      },
      accept: [
        {
          patterns: ["bao nhiêu tiền", "bao nhieu tien", "how much"],
          keywords: ["bao", "tien"],
          reply: { vi: "50 ngàn một ký em ơi.", en: "50,000 đồng per kilo." },
          next: "browse",
        },
        {
          patterns: ["mắc quá", "mac qua", "đắt quá", "dat qua", "expensive", "too expensive"],
          keywords: ["mac", "dat"],
          reply: {
            vi: "Trời ơi, không mắc đâu! Xoài cát chính hiệu mà.",
            en: "Oh no, that's not expensive! It's authentic Cát mango.",
          },
          next: "haggle",
          teach: [{ word: "mắc", meaning: "expensive (Southern)" }],
        },
        {
          patterns: ["một ký", "mot ky", "1 kg", "one kilo", "cho tôi một ký"],
          reply: { vi: "Một ký xoài. Còn mua gì nữa không?", en: "One kilo of mangoes. Anything else?" },
          next: "more",
        },
        {
          patterns: ["nửa ký", "nua ky", "half kilo"],
          reply: { vi: "Nửa ký, 25 ngàn nhé. Còn mua gì nữa không?", en: "Half a kilo, that's 25k. Anything else?" },
          next: "more",
        },
      ],
      fallback: { vi: "Em mua bao nhiêu ký?", en: "How many kilos?" },
      suggestions: ["Mắc quá!", "Một ký", "Bao nhiêu tiền?"],
    },
    haggle: {
      id: "haggle",
      npc: { vi: "Em trả bao nhiêu?", en: "How much will you pay?" },
      accept: [
        {
          patterns: ["30 ngàn", "30k", "30 nghìn", "ba mươi ngàn"],
          keywords: ["30", "ba"],
          reply: {
            vi: "30 ít quá em ơi! 40 ngàn một ký được không?",
            en: "30 is too little! Will you do 40k per kilo?",
          },
          next: "haggle2",
        },
        {
          patterns: ["35", "35 ngàn", "35k"],
          keywords: ["35"],
          reply: { vi: "Thôi, lấy 40 đi em! Trái nào cũng ngọt.", en: "Come on, do 40! They're all sweet." },
          next: "haggle2",
        },
        {
          patterns: ["40", "40 ngàn", "40k", "bốn mươi"],
          keywords: ["40"],
          reply: { vi: "Được! 40 ngàn một ký. Em mua mấy ký?", en: "Deal! 40k per kilo. How many kilos?" },
          next: "more",
        },
      ],
      fallback: { vi: "Em trả giá đi!", en: "Make me an offer!" },
      suggestions: ["30 ngàn", "35 ngàn", "40 ngàn"],
    },
    haggle2: {
      id: "haggle2",
      npc: { vi: "40 nha em? Chốt giá nhé?", en: "40, okay? Final price?" },
      accept: [
        {
          patterns: ["được", "duoc", "ok", "ừ", "vâng", "dạ", "okay"],
          keywords: ["duoc", "ok", "vang", "da"],
          reply: { vi: "Hay quá! Em mua mấy ký?", en: "Wonderful! How many kilos?" },
          next: "more",
        },
        {
          patterns: ["không", "khong", "thôi", "thoi", "no thanks"],
          reply: { vi: "Tiếc quá! Hôm khác ghé nha.", en: "Such a shame! Come another day." },
          next: "end",
        },
      ],
      fallback: { vi: "Em đồng ý không?", en: "Do you agree?" },
      suggestions: ["Được", "Thôi"],
    },
    more: {
      id: "more",
      npc: { vi: "Còn mua gì nữa không em? Có sầu riêng nữa.", en: "Anything else? We have durian too." },
      accept: [
        {
          patterns: ["sầu riêng", "sau rieng", "durian"],
          reply: { vi: "Sầu riêng 100 ngàn một trái. Em lấy không?", en: "Durian is 100k each. Want one?" },
          next: "durian",
        },
        {
          patterns: ["không", "khong", "đủ rồi", "du roi", "vậy thôi", "no"],
          keywords: ["khong", "du", "thoi"],
          reply: { vi: "Vậy tổng cộng 40 ngàn nhé.", en: "Total is 40,000 đồng then." },
          next: "pay",
        },
      ],
      fallback: { vi: "Mua thêm gì không em?", en: "Buy anything else?" },
      suggestions: ["Sầu riêng", "Không, đủ rồi"],
    },
    durian: {
      id: "durian",
      npc: { vi: "Em lấy không?", en: "Want one?" },
      accept: [
        {
          patterns: ["có", "co", "yes", "lấy", "lay", "một trái"],
          reply: { vi: "Tuyệt! Tổng cộng 140 ngàn nhé.", en: "Great! Total is 140,000." },
          next: "pay",
        },
        {
          patterns: ["không", "khong", "no", "thôi"],
          reply: { vi: "Dạ. Tổng cộng 40 ngàn em ơi.", en: "Okay. Total is 40,000." },
          next: "pay",
        },
      ],
      fallback: { vi: "Có lấy không em?", en: "Will you take it?" },
      suggestions: ["Có", "Không"],
    },
    pay: {
      id: "pay",
      npc: { vi: "Em đưa tiền nhé!", en: "Hand over the money please!" },
      accept: [
        {
          patterns: ["đây", "day", "đây ạ", "here", "here you go"],
          reply: { vi: "Cảm ơn em nhiều! Ăn ngon nha!", en: "Thank you so much! Enjoy!" },
          next: "thanks",
        },
        {
          patterns: ["chuyển khoản", "chuyen khoan", "qr", "transfer"],
          reply: { vi: "Quét QR ở đây em ơi.", en: "Scan the QR here." },
          next: "thanks",
        },
      ],
      fallback: { vi: "Em trả tiền mặt hay QR?", en: "Cash or QR?" },
      suggestions: ["Đây ạ", "QR"],
    },
    thanks: {
      id: "thanks",
      npc: { vi: "Cảm ơn em nha! Hôm sau ghé nữa nhé!", en: "Thanks! Come again!" },
      accept: [
        {
          patterns: ["cảm ơn", "cam on", "thanks"],
          reply: { vi: "Không có gì! Đi đường cẩn thận.", en: "You're welcome! Travel safe." },
          next: "end",
        },
        {
          patterns: ["tạm biệt", "tam biet", "hẹn gặp lại", "bye"],
          reply: { vi: "Tạm biệt em!", en: "Goodbye!" },
          next: "end",
        },
      ],
      fallback: { vi: "Hẹn gặp lại em nhé!", en: "See you again!" },
      suggestions: ["Cảm ơn chị", "Tạm biệt"],
    },
    end: {
      id: "end",
      npc: { vi: "🎉 Em đã thương lượng thành công ở chợ!", en: "🎉 You bargained successfully at the market!" },
      accept: [],
      fallback: { vi: "Hết rồi!", en: "All done!" },
    },
  },
};

// ─── Meeting ──────────────────────────────────────────────────────────────────

const meeting: Scenario = {
  id: "meeting",
  emoji: "🤝",
  title: "Meeting Someone New",
  titleVi: "Gặp Bạn Mới",
  description: "Make friends at a language exchange",
  setting:
    "You're at a language exchange café in District 1. A young Vietnamese woman, Lan, sits down across from you with a coffee.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Chào bạn! Mình tên Lan. Bạn tên gì?", en: "Hi! I'm Lan. What's your name?" },
      accept: [
        {
          patterns: ["mình tên là", "minh ten la", "tôi tên là", "toi ten la", "my name is"],
          keywords: ["ten"],
          reply: { vi: "Rất vui được gặp bạn! Bạn từ đâu đến?", en: "Nice to meet you! Where are you from?" },
          next: "from",
          teach: [{ word: "tên", meaning: "name" }],
        },
        {
          patterns: ["chào lan", "chao lan", "hi lan"],
          reply: { vi: "Chào bạn! Bạn tên gì vậy?", en: "Hi! What's your name?" },
          next: "greet",
        },
      ],
      fallback: { vi: "Bạn tên gì?", en: "What's your name?" },
      suggestions: ["Mình tên là John", "Chào Lan", "Tôi tên là Mary"],
    },
    from: {
      id: "from",
      npc: { vi: "Bạn từ đâu đến?", en: "Where are you from?" },
      accept: [
        {
          patterns: ["mình từ mỹ", "minh tu my", "tôi từ mỹ", "from america", "from the us"],
          keywords: ["my", "america"],
          reply: { vi: "Mỹ à! Bạn ở thành phố nào?", en: "America! Which city?" },
          next: "city",
        },
        {
          patterns: ["mình từ anh", "tôi từ anh", "from england", "from uk"],
          keywords: ["anh", "england", "uk"],
          reply: { vi: "Anh quốc đẹp lắm! Bạn ở thành phố nào?", en: "England is lovely! Which city?" },
          next: "city",
        },
        {
          patterns: ["úc", "uc", "australia", "from australia"],
          keywords: ["uc", "australia"],
          reply: { vi: "Úc à! Bạn đến Việt Nam lâu chưa?", en: "Australia! Have you been in Vietnam long?" },
          next: "howlong",
        },
        {
          patterns: ["canada"],
          keywords: ["canada"],
          reply: { vi: "Canada xa lắm! Bạn đến Việt Nam lâu chưa?", en: "Canada is so far! Have you been here long?" },
          next: "howlong",
        },
      ],
      fallback: { vi: "Bạn đến từ nước nào?", en: "Which country are you from?" },
      suggestions: ["Mình từ Mỹ", "Mình từ Canada", "Mình từ Úc"],
    },
    city: {
      id: "city",
      npc: { vi: "Bạn ở thành phố nào?", en: "Which city?" },
      accept: [
        {
          patterns: ["new york", "ny"],
          reply: { vi: "Wow, New York! Bạn đến Việt Nam lâu chưa?", en: "Wow, New York! Have you been in Vietnam long?" },
          next: "howlong",
        },
        {
          patterns: ["los angeles", "la", "san francisco", "sf", "chicago", "boston", "seattle"],
          reply: { vi: "Hay quá! Bạn đến Việt Nam lâu chưa?", en: "Cool! Have you been in Vietnam long?" },
          next: "howlong",
        },
        {
          patterns: ["london"],
          reply: { vi: "London đẹp! Bạn đến Việt Nam lâu chưa?", en: "London is beautiful! Been here long?" },
          next: "howlong",
        },
      ],
      fallback: {
        vi: "Bạn ở thành phố nào? Mình tò mò lắm.",
        en: "Which city? I'm curious.",
      },
      suggestions: ["New York", "London", "Los Angeles"],
    },
    howlong: {
      id: "howlong",
      npc: { vi: "Bạn đến Việt Nam lâu chưa?", en: "Have you been in Vietnam long?" },
      accept: [
        {
          patterns: ["mới", "moi", "mới đến", "moi den", "just arrived", "a week"],
          keywords: ["moi", "tuan"],
          reply: { vi: "Mới à! Vậy bạn học tiếng Việt được bao lâu rồi?", en: "Just arrived! So how long have you been learning Vietnamese?" },
          next: "learning",
        },
        {
          patterns: ["một tháng", "mot thang", "vài tháng", "vai thang", "few months"],
          keywords: ["thang"],
          reply: { vi: "Vài tháng rồi! Bạn học tiếng Việt được bao lâu?", en: "A few months! How long have you been studying Vietnamese?" },
          next: "learning",
        },
        {
          patterns: ["một năm", "mot nam", "1 year", "a year"],
          keywords: ["nam", "year"],
          reply: { vi: "Một năm rồi! Bạn nói tiếng Việt giỏi quá!", en: "A year! Your Vietnamese must be great!" },
          next: "learning",
        },
      ],
      fallback: { vi: "Bạn đến Việt Nam khi nào?", en: "When did you come to Vietnam?" },
      suggestions: ["Mới đến", "Vài tháng", "Một năm"],
    },
    learning: {
      id: "learning",
      npc: { vi: "Bạn học tiếng Việt được bao lâu rồi?", en: "How long have you been learning Vietnamese?" },
      accept: [
        {
          patterns: ["mới bắt đầu", "moi bat dau", "just started", "vài tuần", "vai tuan"],
          reply: { vi: "Vậy mà bạn nói được nhiều quá! Vì sao bạn học tiếng Việt?", en: "And yet you speak so much! Why are you learning Vietnamese?" },
          next: "why",
        },
        {
          patterns: ["vài tháng", "vai thang", "few months"],
          reply: { vi: "Vài tháng mà nói tốt quá! Vì sao bạn học?", en: "A few months and you speak so well! Why are you learning?" },
          next: "why",
        },
        {
          patterns: ["một năm", "mot nam", "year"],
          reply: { vi: "Một năm thì giỏi rồi! Vì sao bạn học?", en: "A year — you're really good! Why are you studying?" },
          next: "why",
        },
      ],
      fallback: { vi: "Học bao lâu rồi bạn?", en: "How long have you studied?" },
      suggestions: ["Mới bắt đầu", "Vài tháng", "Một năm"],
    },
    why: {
      id: "why",
      npc: { vi: "Vì sao bạn học tiếng Việt?", en: "Why are you learning Vietnamese?" },
      accept: [
        {
          patterns: ["vì gia đình", "vi gia dinh", "family", "for my family"],
          keywords: ["gia", "family"],
          reply: { vi: "Đẹp quá! Gia đình bạn ở Việt Nam à?", en: "That's beautiful! Is your family in Vietnam?" },
          next: "hobbies",
        },
        {
          patterns: ["vì công việc", "vi cong viec", "work", "for work"],
          keywords: ["cong", "work"],
          reply: { vi: "Hay quá! Bạn làm công việc gì?", en: "Cool! What do you do?" },
          next: "hobbies",
        },
        {
          patterns: ["vì du lịch", "vi du lich", "travel", "tourism"],
          keywords: ["du", "travel"],
          reply: { vi: "Du lịch là tuyệt nhất! Bạn thích nơi nào ở Việt Nam?", en: "Travel is the best! Where in Vietnam do you like?" },
          next: "hobbies",
        },
        {
          patterns: ["vì thích", "vi thich", "i like it", "interesting"],
          reply: { vi: "Mình rất vui khi nghe vậy! Bạn có sở thích gì khác không?", en: "So glad to hear that! Any other hobbies?" },
          next: "hobbies",
        },
      ],
      fallback: { vi: "Bạn học vì lý do gì?", en: "Why do you study?" },
      suggestions: ["Vì gia đình", "Vì công việc", "Vì du lịch", "Vì thích"],
    },
    hobbies: {
      id: "hobbies",
      npc: { vi: "Bạn có sở thích gì?", en: "What are your hobbies?" },
      accept: [
        {
          patterns: ["mình thích đọc sách", "doc sach", "reading"],
          keywords: ["doc", "sach"],
          reply: { vi: "Mình cũng thích đọc sách! Bạn đọc loại nào?", en: "I love reading too! What kind?" },
          next: "wrap",
        },
        {
          patterns: ["mình thích nấu ăn", "nau an", "cooking"],
          keywords: ["nau"],
          reply: { vi: "Vậy bạn nên thử nấu món Việt!", en: "Then you should try cooking Vietnamese food!" },
          next: "wrap",
        },
        {
          patterns: ["nghe nhạc", "nghe nhac", "music"],
          keywords: ["nghe", "nhac"],
          reply: { vi: "Mình cũng nghe nhạc nhiều! Nhạc Việt hay nhạc nước ngoài?", en: "I listen to a lot too! Vietnamese or foreign music?" },
          next: "wrap",
        },
        {
          patterns: ["du lịch", "du lich", "travel"],
          reply: { vi: "Du lịch là tuyệt vời nhất!", en: "Travel is the best!" },
          next: "wrap",
        },
      ],
      fallback: { vi: "Bạn thích làm gì lúc rảnh?", en: "What do you do in your free time?" },
      suggestions: ["Mình thích đọc sách", "Mình thích nấu ăn", "Nghe nhạc"],
    },
    wrap: {
      id: "wrap",
      npc: { vi: "Nói chuyện với bạn vui lắm! Mình phải đi học rồi.", en: "It was so fun talking with you! I have to go to class now." },
      accept: [
        {
          patterns: ["rất vui được gặp bạn", "rat vui duoc gap ban", "nice to meet you"],
          reply: { vi: "Mình cũng vậy! Hẹn gặp lại nha!", en: "Me too! See you again!" },
          next: "end",
        },
        {
          patterns: ["hẹn gặp lại", "hen gap lai", "see you", "tạm biệt"],
          reply: { vi: "Hẹn gặp lại bạn!", en: "See you again!" },
          next: "end",
        },
      ],
      fallback: { vi: "Hẹn gặp lại bạn nha!", en: "See you again!" },
      suggestions: ["Rất vui được gặp bạn", "Hẹn gặp lại"],
    },
    end: {
      id: "end",
      npc: { vi: "🎉 Bạn vừa kết bạn mới bằng tiếng Việt!", en: "🎉 You just made a new friend in Vietnamese!" },
      accept: [],
      fallback: { vi: "Hết rồi!", en: "All done!" },
    },
  },
};

// ─── Restaurant ───────────────────────────────────────────────────────────────

const restaurant: Scenario = {
  id: "restaurant",
  emoji: "🍜",
  title: "At the Restaurant",
  titleVi: "Nhà Hàng",
  description: "Dine at Nhà Hàng Mekong",
  setting:
    "You sit down at a busy mid-range Vietnamese restaurant. The waiter approaches with a menu and a smile.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Chào anh/chị! Mời anh/chị xem thực đơn.", en: "Hello! Please take a look at the menu." },
      accept: [
        {
          patterns: ["cảm ơn", "cam on", "thanks"],
          reply: { vi: "Anh/chị có muốn uống gì trước không?", en: "Would you like a drink first?" },
          next: "drink",
        },
        {
          patterns: ["chào", "chao", "hello"],
          reply: { vi: "Anh/chị có muốn uống gì trước không?", en: "Would you like a drink first?" },
          next: "drink",
        },
      ],
      fallback: { vi: "Em mời anh/chị xem thực đơn.", en: "Please take a look at the menu." },
      suggestions: ["Cảm ơn em", "Chào em"],
    },
    drink: {
      id: "drink",
      npc: { vi: "Anh/chị uống gì?", en: "What would you like to drink?" },
      accept: [
        {
          patterns: ["trà đá", "tra da", "iced tea"],
          reply: { vi: "Trà đá miễn phí ạ. Còn anh/chị gọi món gì?", en: "Iced tea is free. What would you like to order?" },
          next: "order",
        },
        {
          patterns: ["nước lọc", "nuoc loc", "water"],
          reply: { vi: "Nước lọc nha. Anh/chị gọi món gì ạ?", en: "Water it is. What would you like to order?" },
          next: "order",
        },
        {
          patterns: ["bia", "beer", "bia sài gòn", "bia tiger"],
          reply: { vi: "Một chai bia ạ. Còn món chính?", en: "One bottle of beer. And the main dish?" },
          next: "order",
        },
      ],
      fallback: { vi: "Trà đá, nước lọc, hay bia ạ?", en: "Iced tea, water, or beer?" },
      suggestions: ["Trà đá", "Nước lọc", "Bia"],
    },
    order: {
      id: "order",
      npc: {
        vi: "Nhà hàng có phở bò, bún bò Huế, cơm tấm, gỏi cuốn, chả giò. Anh/chị thích gì?",
        en: "We have phở bò, bún bò Huế, cơm tấm, gỏi cuốn, chả giò. What would you like?",
      },
      accept: [
        {
          patterns: ["phở bò", "pho bo", "cho tôi phở bò", "beef pho"],
          keywords: ["pho"],
          reply: { vi: "Một tô phở bò. Anh/chị muốn cay không?", en: "One bowl of phở bò. Spicy?" },
          next: "spice",
          teach: [{ word: "tô", meaning: "bowl" }, { word: "phở", meaning: "noodle soup" }],
        },
        {
          patterns: ["bún bò huế", "bun bo hue"],
          keywords: ["bun", "hue"],
          reply: { vi: "Bún bò Huế cay đó! Anh/chị ăn cay được không?", en: "Bún bò Huế is spicy! Can you handle spice?" },
          next: "spice",
        },
        {
          patterns: ["cơm tấm", "com tam"],
          keywords: ["com", "tam"],
          reply: { vi: "Cơm tấm sườn nướng nha. Anh/chị muốn thêm trứng không?", en: "Cơm tấm with grilled pork. Want to add an egg?" },
          next: "extras",
        },
        {
          patterns: ["gỏi cuốn", "goi cuon"],
          reply: { vi: "Gỏi cuốn ngon lắm! Anh/chị gọi mấy phần?", en: "Spring rolls are great! How many portions?" },
          next: "qty",
        },
        {
          patterns: ["chả giò", "cha gio"],
          reply: { vi: "Chả giò giòn lắm! Mấy cái ạ?", en: "The fried rolls are crispy! How many?" },
          next: "qty",
        },
      ],
      fallback: {
        vi: "Anh/chị muốn ăn món nào ạ?",
        en: "Which dish would you like?",
      },
      suggestions: ["Cho tôi phở bò", "Bún bò Huế", "Cơm tấm"],
    },
    spice: {
      id: "spice",
      npc: { vi: "Cay không ạ?", en: "Spicy?" },
      accept: [
        {
          patterns: ["cay", "yes", "có cay", "cay nhẹ"],
          keywords: ["cay"],
          reply: { vi: "Dạ, cay vừa nhé. Còn gì nữa không ạ?", en: "Medium spicy. Anything else?" },
          next: "more",
        },
        {
          patterns: ["không cay", "khong cay", "no spicy", "không"],
          reply: { vi: "Dạ, không cay. Còn gì nữa không ạ?", en: "Not spicy. Anything else?" },
          next: "more",
        },
      ],
      fallback: { vi: "Anh/chị ăn cay được không?", en: "Can you handle spice?" },
      suggestions: ["Cay", "Không cay"],
    },
    extras: {
      id: "extras",
      npc: { vi: "Thêm trứng không?", en: "Add an egg?" },
      accept: [
        {
          patterns: ["có", "co", "yes", "thêm trứng", "them trung"],
          reply: { vi: "Dạ, thêm trứng. Còn gì nữa ạ?", en: "Add an egg. Anything else?" },
          next: "more",
        },
        {
          patterns: ["không", "khong", "no"],
          reply: { vi: "Dạ. Còn gì nữa không?", en: "Got it. Anything else?" },
          next: "more",
        },
      ],
      fallback: { vi: "Có thêm trứng không ạ?", en: "Add an egg?" },
      suggestions: ["Có", "Không"],
    },
    qty: {
      id: "qty",
      npc: { vi: "Mấy phần?", en: "How many?" },
      accept: [
        {
          patterns: ["một", "mot", "1", "one"],
          reply: { vi: "Một phần. Còn gì nữa không?", en: "One portion. Anything else?" },
          next: "more",
        },
        {
          patterns: ["hai", "2", "two"],
          reply: { vi: "Hai phần. Còn gì nữa?", en: "Two portions. Anything else?" },
          next: "more",
        },
      ],
      fallback: { vi: "Anh/chị gọi mấy phần?", en: "How many portions?" },
      suggestions: ["Một", "Hai"],
    },
    more: {
      id: "more",
      npc: { vi: "Còn gì nữa không ạ?", en: "Anything else?" },
      accept: [
        {
          patterns: ["không", "khong", "đủ rồi", "du roi", "vậy thôi", "no"],
          reply: { vi: "Dạ. Em chuẩn bị ngay!", en: "Right away!" },
          next: "served",
        },
        {
          patterns: ["thêm", "them", "more", "có"],
          reply: { vi: "Anh/chị muốn thêm gì ạ?", en: "What would you like to add?" },
          next: "order",
        },
      ],
      fallback: { vi: "Anh/chị có muốn gọi thêm không?", en: "Want to order more?" },
      suggestions: ["Không, đủ rồi", "Thêm gỏi cuốn"],
    },
    served: {
      id: "served",
      npc: { vi: "Đây là món của anh/chị. Chúc anh/chị ngon miệng!", en: "Here's your food. Bon appétit!" },
      accept: [
        {
          patterns: ["cảm ơn", "cam on", "thanks", "ngon quá", "ngon qua"],
          reply: { vi: "Anh/chị thấy có ngon không ạ?", en: "Is it good?" },
          next: "feedback",
        },
      ],
      fallback: { vi: "Anh/chị thấy thế nào?", en: "How is it?" },
      suggestions: ["Cảm ơn em", "Ngon quá!"],
    },
    feedback: {
      id: "feedback",
      npc: { vi: "Có ngon không ạ?", en: "Is it good?" },
      accept: [
        {
          patterns: ["ngon lắm", "ngon lam", "ngon quá", "ngon qua", "very good", "delicious"],
          reply: { vi: "Em mừng quá! Cảm ơn anh/chị.", en: "I'm so glad! Thank you." },
          next: "bill",
        },
        {
          patterns: ["bình thường", "binh thuong", "ok"],
          reply: { vi: "Dạ. Có thể em đem ớt thêm cho anh/chị nhé?", en: "Want me to bring more chili?" },
          next: "bill",
        },
      ],
      fallback: { vi: "Có vừa miệng không ạ?", en: "Is it to your taste?" },
      suggestions: ["Ngon lắm!", "Bình thường"],
    },
    bill: {
      id: "bill",
      npc: { vi: "Anh/chị tính tiền chưa ạ?", en: "Ready for the bill?" },
      accept: [
        {
          patterns: ["tính tiền", "tinh tien", "bill please", "check"],
          reply: { vi: "Tổng cộng 150 ngàn. Cảm ơn anh/chị!", en: "150,000 đồng total. Thank you!" },
          next: "end",
        },
        {
          patterns: ["chưa", "chua", "not yet"],
          reply: { vi: "Dạ, anh/chị cứ thoải mái nhé.", en: "No rush, please enjoy." },
          next: "bill",
        },
      ],
      fallback: { vi: "Anh/chị có cần gì thêm không?", en: "Need anything else?" },
      suggestions: ["Tính tiền", "Chưa"],
    },
    end: {
      id: "end",
      npc: { vi: "🎉 Em đã ăn xong bữa tối thành công!", en: "🎉 You completed a full restaurant meal!" },
      accept: [],
      fallback: { vi: "Hết rồi!", en: "All done!" },
    },
  },
};

// ─── Directions ───────────────────────────────────────────────────────────────

const directions: Scenario = {
  id: "directions",
  emoji: "🗺️",
  title: "Asking Directions",
  titleVi: "Hỏi Đường",
  description: "Navigate the streets of Sài Gòn",
  setting:
    "You're lost near chợ Bến Thành with your phone dead. A friendly older woman (cô) sits at a juice stand and waves you over.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Cháu cần gì không?", en: "Do you need something, kid?" },
      accept: [
        {
          patterns: ["xin lỗi cô", "xin loi co", "excuse me"],
          reply: { vi: "Cháu muốn đi đâu?", en: "Where do you want to go?" },
          next: "where",
        },
        {
          patterns: ["chào cô", "chao co"],
          reply: { vi: "Cháu hỏi đường à? Đi đâu vậy?", en: "Looking for directions? Where to?" },
          next: "where",
        },
      ],
      fallback: { vi: "Cháu cần giúp gì?", en: "Need help with what?" },
      suggestions: ["Xin lỗi cô", "Chào cô"],
    },
    where: {
      id: "where",
      npc: { vi: "Cháu muốn đi đâu?", en: "Where do you want to go?" },
      accept: [
        {
          patterns: ["nhà thờ đức bà", "nha tho duc ba", "notre dame", "cathedral"],
          keywords: ["nha", "tho", "duc", "notre"],
          reply: { vi: "Nhà thờ Đức Bà à! Cháu đi thẳng đường này.", en: "Notre Dame Cathedral! Walk straight down this street." },
          next: "next1_cathedral",
        },
        {
          patterns: ["chợ lớn", "cho lon", "chinatown"],
          reply: { vi: "Chợ Lớn xa lắm! Cháu nên đi xe.", en: "Chợ Lớn is far! You should take a car." },
          next: "transport",
        },
        {
          patterns: ["bến xe buýt", "ben xe buyt", "bus stop"],
          keywords: ["xe", "buyt", "bus"],
          reply: { vi: "Bến xe buýt gần đây thôi. Đi thẳng rồi rẽ phải.", en: "The bus stop is close. Straight then right." },
          next: "next1_bus",
        },
        {
          patterns: ["bệnh viện", "benh vien", "hospital"],
          reply: { vi: "Bệnh viện Chợ Rẫy à? Cháu nên đi taxi cho nhanh.", en: "Chợ Rẫy hospital? Take a taxi to be quick." },
          next: "transport",
        },
        {
          patterns: ["khách sạn", "khach san", "hotel", "khách sạn rex", "khách sạn của tôi"],
          reply: { vi: "Khách sạn nào cháu? Cô biết nhiều khách sạn.", en: "Which hotel? I know many." },
          next: "next1_hotel",
        },
      ],
      fallback: { vi: "Đi đâu vậy cháu?", en: "Where to, dear?" },
      suggestions: ["Nhà thờ Đức Bà", "Chợ Lớn", "Bến xe buýt"],
    },
    next1_cathedral: {
      id: "next1_cathedral",
      npc: { vi: "Đi thẳng khoảng 200 mét, rồi rẽ trái. Cháu thấy không?", en: "Walk about 200 meters, then turn left. Got it?" },
      accept: [
        {
          patterns: ["dạ", "da", "vâng", "vang", "rồi", "roi", "okay", "ok", "hiểu", "hieu"],
          reply: { vi: "Đi tiếp khoảng 5 phút là tới nhé.", en: "Then about 5 more minutes and you're there." },
          next: "tip",
        },
        {
          patterns: ["bao xa", "bao xa nữa", "bao lâu", "bao lau", "how far", "how long"],
          reply: { vi: "Đi bộ khoảng 10 phút thôi.", en: "About a 10-minute walk." },
          next: "tip",
        },
      ],
      fallback: { vi: "Cháu hiểu chưa?", en: "Understand?" },
      suggestions: ["Dạ, hiểu rồi", "Bao xa nữa cô?"],
    },
    next1_bus: {
      id: "next1_bus",
      npc: { vi: "Đi thẳng đến đèn đỏ, rồi rẽ phải. Bến xe ngay đó.", en: "Walk to the red light, turn right. The bus stop is right there." },
      accept: [
        {
          patterns: ["dạ", "da", "vâng", "ok", "rồi", "hiểu"],
          reply: { vi: "Cháu nhớ đi xe buýt số mấy chưa?", en: "Do you remember which bus number?" },
          next: "bus_num",
        },
        {
          patterns: ["bao xa", "how far"],
          reply: { vi: "Khoảng 100 mét thôi cháu.", en: "About 100 meters." },
          next: "bus_num",
        },
      ],
      fallback: { vi: "Hiểu chưa cháu?", en: "Got it?" },
      suggestions: ["Dạ, hiểu", "Bao xa cô?"],
    },
    bus_num: {
      id: "bus_num",
      npc: { vi: "Cháu đi xe buýt số mấy?", en: "Which bus number?" },
      accept: [
        {
          patterns: ["xe buýt số 1", "so 1", "số 1", "bus 1", "one"],
          reply: { vi: "Số 1 đi qua trung tâm. Lên đúng nhé!", en: "Bus 1 goes through downtown. Get on the right one!" },
          next: "tip",
        },
        {
          patterns: ["không biết", "khong biet", "i don't know", "don't know"],
          reply: { vi: "Cháu hỏi tài xế ở bến nha.", en: "Ask the driver at the stop." },
          next: "tip",
        },
      ],
      fallback: { vi: "Cháu nhớ số xe không?", en: "Remember the bus number?" },
      suggestions: ["Số 1", "Không biết"],
    },
    next1_hotel: {
      id: "next1_hotel",
      npc: { vi: "Tên khách sạn là gì?", en: "What's the hotel name?" },
      accept: [
        {
          patterns: ["rex", "khách sạn rex"],
          reply: { vi: "Khách sạn Rex ngay đối diện Nhà hát Thành phố. Đi thẳng rồi rẽ trái.", en: "Rex is across from the Opera House. Straight then left." },
          next: "tip",
        },
        {
          patterns: ["caravelle"],
          reply: { vi: "Caravelle gần Rex thôi. Đi thẳng rồi rẽ trái.", en: "Caravelle is near Rex. Straight then left." },
          next: "tip",
        },
        {
          patterns: ["không nhớ", "khong nho", "i don't remember"],
          reply: { vi: "Vậy cháu mở Google Map nhé!", en: "Then open Google Maps!" },
          next: "tip",
        },
      ],
      fallback: { vi: "Tên gì cháu?", en: "What name?" },
      suggestions: ["Khách sạn Rex", "Không nhớ"],
    },
    transport: {
      id: "transport",
      npc: { vi: "Cháu đi taxi hay Grab?", en: "Taxi or Grab?" },
      accept: [
        {
          patterns: ["grab"],
          reply: { vi: "Grab tốt! Cháu mở app rồi đặt xe nhé.", en: "Grab is great! Open the app and book." },
          next: "tip",
        },
        {
          patterns: ["taxi"],
          reply: { vi: "Đứng ngoài đường, vẫy tay là có taxi liền.", en: "Stand on the street and wave — a taxi will come." },
          next: "tip",
        },
      ],
      fallback: { vi: "Cháu đi gì?", en: "Which one?" },
      suggestions: ["Grab", "Taxi"],
    },
    tip: {
      id: "tip",
      npc: { vi: "Cẩn thận xe máy nha cháu!", en: "Watch out for motorbikes!" },
      accept: [
        {
          patterns: ["dạ", "da", "vâng", "vang", "ok", "cảm ơn", "cam on", "thanks"],
          reply: { vi: "Đi cẩn thận nhé! Có gì hỏi cô tiếp.", en: "Travel safe! Ask me again if needed." },
          next: "thanks",
        },
      ],
      fallback: { vi: "Cẩn thận đường nha!", en: "Be careful on the road!" },
      suggestions: ["Dạ, cảm ơn cô"],
    },
    thanks: {
      id: "thanks",
      npc: { vi: "Cảm ơn cô đã giúp cháu!", en: "(prompt to thank her)" },
      accept: [
        {
          patterns: ["cảm ơn cô", "cam on co", "cảm ơn nhiều", "cam on nhieu"],
          reply: { vi: "Không có gì cháu! Đi vui vẻ nhé.", en: "You're welcome! Have a nice trip." },
          next: "end",
        },
        {
          patterns: ["tạm biệt", "tam biet", "hẹn gặp lại"],
          reply: { vi: "Tạm biệt cháu!", en: "Bye, dear!" },
          next: "end",
        },
      ],
      fallback: { vi: "Đi đường cẩn thận nhé!", en: "Travel safe!" },
      suggestions: ["Cảm ơn cô nhiều", "Tạm biệt cô"],
    },
    end: {
      id: "end",
      npc: { vi: "🎉 Cháu đã hỏi đường thành công!", en: "🎉 You successfully asked for directions!" },
      accept: [],
      fallback: { vi: "Hết rồi!", en: "All done!" },
    },
  },
};

// ─── Free chat with Bồ ────────────────────────────────────────────────────────

const free: Scenario = {
  id: "free",
  emoji: "💬",
  title: "Chat with Bồ",
  titleVi: "Trò Chuyện Với Bồ",
  description: "Open conversation with your buffalo tutor",
  setting:
    "Bồ the water buffalo waves at you with a giant grin. Today you're just hanging out — no script, no scoring. Pick a thread.",
  startId: "greet",
  turns: {
    greet: {
      id: "greet",
      npc: { vi: "Chào bạn! Hôm nay bạn muốn nói về gì?", en: "Hi! What do you want to talk about today?" },
      accept: [
        {
          patterns: ["chào bồ", "chao bo", "hello bo", "hi"],
          reply: { vi: "Vui quá được gặp bạn! Bạn khỏe không?", en: "So nice to see you! How are you?" },
          next: "howareyou",
        },
        {
          patterns: ["mình muốn học", "minh muon hoc", "tôi muốn học", "i want to learn", "teach me"],
          reply: { vi: "Tốt lắm! Bạn muốn học cái gì? Từ vựng, ngữ pháp, hay phát âm?", en: "Great! What do you want to learn? Vocab, grammar, or pronunciation?" },
          next: "learn",
        },
        {
          patterns: ["mình muốn nói chuyện", "noi chuyen", "let's talk", "chat"],
          reply: { vi: "Vậy bạn kể về một ngày của bạn đi!", en: "Then tell me about your day!" },
          next: "day",
        },
      ],
      fallback: { vi: "Bạn muốn chào hỏi hay học bài hôm nay?", en: "Want to chat or learn today?" },
      suggestions: ["Chào Bồ", "Mình muốn học", "Mình muốn nói chuyện"],
    },
    howareyou: {
      id: "howareyou",
      npc: { vi: "Bạn khỏe không?", en: "How are you?" },
      accept: [
        {
          patterns: ["khỏe", "khoe", "tôi khỏe", "mình khỏe", "good", "fine"],
          reply: { vi: "Tuyệt vời! Hôm nay bạn ăn gì rồi?", en: "Wonderful! What did you eat today?" },
          next: "food",
        },
        {
          patterns: ["mệt", "met", "tired"],
          reply: { vi: "Ôi, ngủ đủ chưa bạn? Học từ từ thôi nhé.", en: "Oh, did you sleep enough? Take it easy!" },
          next: "encourage",
        },
        {
          patterns: ["bình thường", "binh thuong", "okay", "so so"],
          reply: { vi: "Ổn. Hôm nay bạn ăn gì rồi?", en: "Cool. What did you eat today?" },
          next: "food",
        },
      ],
      fallback: { vi: "Bạn cảm thấy thế nào?", en: "How do you feel?" },
      suggestions: ["Mình khỏe", "Mệt", "Bình thường"],
    },
    food: {
      id: "food",
      npc: { vi: "Hôm nay bạn ăn gì?", en: "What did you eat today?" },
      accept: [
        {
          patterns: ["phở", "pho"],
          reply: { vi: "Phở ngon quá! Bạn thích phở bò hay phở gà?", en: "Pho is so good! Beef or chicken?" },
          next: "encourage",
        },
        {
          patterns: ["cơm", "com", "rice"],
          reply: { vi: "Cơm là nền tảng của bữa ăn Việt!", en: "Rice is the foundation of every Vietnamese meal!" },
          next: "encourage",
        },
        {
          patterns: ["bánh mì", "banh mi"],
          reply: { vi: "Bánh mì giòn lắm! Bạn ăn loại gì?", en: "Bánh mì is so crispy! Which kind?" },
          next: "encourage",
        },
        {
          patterns: ["chưa ăn", "chua an", "haven't eaten", "nothing"],
          reply: { vi: "Phải ăn nha bạn! Sức khỏe quan trọng lắm.", en: "You should eat! Health is important." },
          next: "encourage",
        },
      ],
      fallback: { vi: "Bạn ăn món gì?", en: "What food?" },
      suggestions: ["Mình ăn phở", "Mình ăn cơm", "Chưa ăn gì"],
    },
    learn: {
      id: "learn",
      npc: { vi: "Bạn muốn học gì? Từ vựng, ngữ pháp, hay phát âm?", en: "Vocab, grammar, or pronunciation?" },
      accept: [
        {
          patterns: ["từ vựng", "tu vung", "vocab", "vocabulary", "words"],
          reply: { vi: "Tuyệt! Bạn vào tab \"Hỏi Bồ\" gõ \"how do I say [từ]\" — mình giải thích liền!", en: "Great! Open the Ask Bồ tab and type 'how do I say [word]' — I'll explain right away!" },
          next: "encourage",
        },
        {
          patterns: ["ngữ pháp", "ngu phap", "grammar"],
          reply: { vi: "Hay! Hỏi mình về \"đã đang sẽ\" hay \"em vs anh\" trong tab Hỏi Bồ nha.", en: "Cool! Ask me about tense markers or pronoun choice in Ask Bồ." },
          next: "encourage",
        },
        {
          patterns: ["phát âm", "phat am", "pronunciation"],
          reply: { vi: "Phát âm khó nhất là 6 thanh điệu! Hỏi \"explain the sắc tone\" trong tab Hỏi Bồ.", en: "The 6 tones are the hardest part! Ask 'explain the sắc tone' in Ask Bồ." },
          next: "encourage",
        },
      ],
      fallback: { vi: "Bạn chọn cái nào?", en: "Which one?" },
      suggestions: ["Từ vựng", "Ngữ pháp", "Phát âm"],
    },
    day: {
      id: "day",
      npc: { vi: "Kể về một ngày của bạn đi!", en: "Tell me about your day!" },
      accept: [
        {
          patterns: ["mình đi học", "minh di hoc", "tôi đi học", "studied", "school"],
          reply: { vi: "Học hành chăm chỉ quá! Học môn gì?", en: "So studious! What subject?" },
          next: "encourage",
        },
        {
          patterns: ["mình đi làm", "minh di lam", "đi làm", "work", "worked"],
          reply: { vi: "Đi làm vất vả nhỉ! Bạn làm việc gì?", en: "Work is tough! What do you do?" },
          next: "encourage",
        },
        {
          patterns: ["nghỉ ngơi", "nghi ngoi", "relaxing", "rest", "rested"],
          reply: { vi: "Nghỉ ngơi rất quan trọng. Bạn xem phim hay đọc sách?", en: "Resting is important. Movies or books?" },
          next: "encourage",
        },
      ],
      fallback: { vi: "Bạn làm gì hôm nay?", en: "What did you do today?" },
      suggestions: ["Mình đi học", "Mình đi làm", "Mình nghỉ ngơi"],
    },
    encourage: {
      id: "encourage",
      npc: {
        vi: "Hôm nay bạn nói tiếng Việt giỏi lắm! Còn muốn nói gì nữa không?",
        en: "Your Vietnamese is great today! Want to say anything else?",
      },
      accept: [
        {
          patterns: ["có", "co", "yes", "muốn"],
          reply: { vi: "Bạn nói gì cũng được nhé!", en: "Say anything you'd like!" },
          next: "openend",
        },
        {
          patterns: ["không", "khong", "no", "cảm ơn", "cam on", "tạm biệt"],
          reply: { vi: "Vậy hẹn gặp bạn lần sau nha! Cố gắng học nhé.", en: "See you next time! Keep studying!" },
          next: "end",
        },
      ],
      fallback: { vi: "Bạn còn gì muốn nói không?", en: "Anything else?" },
      suggestions: ["Có, mình muốn nói thêm", "Không, cảm ơn Bồ"],
    },
    openend: {
      id: "openend",
      npc: { vi: "Mình nghe nè! Bạn muốn kể gì?", en: "I'm listening! What's on your mind?" },
      accept: [
        {
          patterns: ["mình thích việt nam", "minh thich viet nam", "i love vietnam"],
          reply: { vi: "Mình rất vui! Việt Nam yêu bạn nữa.", en: "I'm so happy! Vietnam loves you too." },
          next: "end",
        },
        {
          patterns: ["khó", "kho", "tiếng việt khó", "difficult", "hard"],
          reply: { vi: "Tiếng Việt khó nhưng bạn cố gắng là sẽ giỏi!", en: "Vietnamese is hard but you'll get there with practice!" },
          next: "end",
        },
        {
          patterns: ["cảm ơn bồ", "cam on bo", "thanks bồ"],
          reply: { vi: "Không có gì! Bồ luôn ở đây.", en: "You're welcome! Bồ is always here." },
          next: "end",
        },
      ],
      fallback: { vi: "Bạn cứ nói tự nhiên nhé!", en: "Just speak freely!" },
      suggestions: ["Mình thích Việt Nam", "Tiếng Việt khó", "Cảm ơn Bồ"],
    },
    end: {
      id: "end",
      npc: {
        vi: "🎉 Bạn vừa trò chuyện thoải mái bằng tiếng Việt!",
        en: "🎉 You just had a free chat in Vietnamese!",
      },
      accept: [],
      fallback: { vi: "Hết rồi nhé!", en: "All done!" },
    },
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [cafe, market, meeting, restaurant, directions, free];

export const SCENARIO_BY_ID: Record<ScenarioId, Scenario> = {
  cafe,
  market,
  meeting,
  restaurant,
  directions,
  free,
};
