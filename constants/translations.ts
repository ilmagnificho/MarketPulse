
import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Pulse
    pulse_extreme_fear: "BLOOD IN THE STREETS.",
    pulse_fear: "Fear is dominating. Is it a trap?",
    pulse_neutral: "Uncertainty rules. Cash is king?",
    pulse_greed: "The party is starting. Don't stay too late.",
    pulse_extreme_greed: "MAXIMUM EUPHORIA. DANGER AHEAD.",
    last_updated: "Last Signal",
    syncing: "Establishing Uplink...",
    
    // Quotes
    quote_label: "Market Wisdom",
    quote_extreme_fear: "Be greedy when others are fearful.",
    quote_author_extreme_fear: "Warren Buffett",
    quote_title_extreme_fear: "CEO of Berkshire Hathaway",
    
    quote_fear: "The four most dangerous words in investing are: 'This time it's different.'",
    quote_author_fear: "Sir John Templeton",
    quote_title_fear: "Legendary Investor",

    quote_neutral: "The stock market is designed to transfer money from the active to the patient.",
    quote_author_neutral: "Warren Buffett",
    quote_title_neutral: "Oracle of Omaha",

    quote_greed: "Bull markets are born on pessimism, grow on skepticism, mature on optimism and die on euphoria.",
    quote_author_greed: "Sir John Templeton",
    quote_title_greed: "Legendary Investor",

    quote_extreme_greed: "Be fearful when others are greedy.",
    quote_author_extreme_greed: "Warren Buffett",
    quote_title_extreme_greed: "CEO of Berkshire Hathaway",

    translate_quote: "Translate",
    original_quote: "Original",

    // Crowd
    daily_poll: "Daily Sentiment Check",
    poll_question: "Next close prediction:",
    nyse_label: "NYSE",
    nasdaq_label: "NASDAQ",
    bullish: "BULLISH",
    bearish: "BEARISH",
    bulls: "BULLS",
    bears: "BEARS",
    votes: "traders",
    the_pit: "The Pit",
    live: "LIVE FEED",
    no_chatter: "Silence... Break the ice.",
    nickname_placeholder: "Codename",
    comment_placeholder: "Broadcast your signal...",
    post: "TRANSMIT",
    reply: "Reply",
    cancel: "Abort",
    
    // Layout
    about: "Intel",
    footer: "Market Pulse. Trade at your own risk.",
    data_provider: "Index Source: CNN Business"
  },
  ko: {
    pulse_extreme_fear: "거리에 피가 낭자합니다.",
    pulse_fear: "공포가 지배합니다. 함정일까요?",
    pulse_neutral: "불확실성이 지배합니다. 현금이 왕?",
    pulse_greed: "파티가 시작되었습니다. 너무 늦지 마세요.",
    pulse_extreme_greed: "최고조의 유포리아! 위험이 도사립니다.",
    last_updated: "마지막 신호",
    syncing: "데이터 수신 중...",
    
    quote_label: "투자의 지혜",
    quote_extreme_fear: "남들이 두려워할 때 탐욕스러워져라.",
    quote_author_extreme_fear: "워렌 버핏",
    quote_title_extreme_fear: "버크셔 해서웨이 CEO",

    quote_fear: "투자에서 가장 위험한 네 단어는 '이번에는 다르다'이다.",
    quote_author_fear: "존 템플턴",
    quote_title_fear: "전설적인 투자자",

    quote_neutral: "주식 시장은 활동적인 사람에게서 인내심 있는 사람에게로 돈을 옮기도록 설계되었다.",
    quote_author_neutral: "워렌 버핏",
    quote_title_neutral: "오마하의 현인",

    quote_greed: "강세장은 비관 속에서 태어나, 회의 속에서 자라며, 낙관 속에서 성숙하고, 행복감 속에서 죽는다.",
    quote_author_greed: "존 템플턴",
    quote_title_greed: "전설적인 투자자",

    quote_extreme_greed: "남들이 탐욕스러울 때 두려워하라.",
    quote_author_extreme_greed: "워렌 버핏",
    quote_title_extreme_greed: "버크셔 해서웨이 CEO",

    translate_quote: "번역 보기",
    original_quote: "원문 보기",

    daily_poll: "일일 투심 체크",
    poll_question: "다음 마감 예측:",
    nyse_label: "NYSE (뉴욕증시)",
    nasdaq_label: "NASDAQ (나스닥)",
    bullish: "상승 (Bull)",
    bearish: "하락 (Bear)",
    bulls: "상승론",
    bears: "하락론",
    votes: "명 참여",
    the_pit: "실시간 토론장",
    live: "라이브",
    no_chatter: "정적... 침묵을 깨세요.",
    nickname_placeholder: "코드명",
    comment_placeholder: "신호를 보내세요...",
    post: "전송",
    reply: "답신",
    cancel: "취소",
    about: "정보",
    footer: "Market Pulse. 투자는 본인의 책임입니다.",
    data_provider: "지수 출처: CNN Business"
  },
  zh: {
    pulse_extreme_fear: "街头喋血。",
    pulse_fear: "恐惧占据主导。是陷阱吗？",
    pulse_neutral: "不确定性统治。现金为王？",
    pulse_greed: "派对开始了。别待太久。",
    pulse_extreme_greed: "极度狂热！前方危险。",
    last_updated: "最后信号",
    syncing: "正在建立连接...",
    
    quote_label: "市场智慧",
    quote_extreme_fear: "在别人恐惧时贪婪。",
    quote_author_extreme_fear: "沃伦·巴菲特",
    quote_title_extreme_fear: "伯克希尔·哈撒韦 CEO",
    
    quote_fear: "投资中最危险的四个字是：'这次不同'。",
    quote_author_fear: "约翰·邓普顿",
    quote_title_fear: "传奇投资者",
    
    quote_neutral: "股票市场的设计是将钱从活跃的人转移到耐心的人手中。",
    quote_author_neutral: "沃伦·巴菲特",
    quote_title_neutral: "奥马哈先知",
    
    quote_greed: "牛市在悲观中诞生，在怀疑中成长，在乐观中成熟，在狂欢中死亡。",
    quote_author_greed: "约翰·邓普顿",
    quote_title_greed: "传奇投资者",
    
    quote_extreme_greed: "在别人贪婪时恐惧。",
    quote_author_extreme_greed: "沃伦·巴菲特",
    quote_title_extreme_greed: "伯克希尔·哈撒韦 CEO",

    translate_quote: "查看翻译",
    original_quote: "查看原文",

    daily_poll: "每日情绪检查",
    poll_question: "收盘预测:",
    nyse_label: "NYSE (纽交所)",
    nasdaq_label: "NASDAQ (纳斯达克)",
    bullish: "看涨",
    bearish: "看跌",
    bulls: "多头",
    bears: "空头",
    votes: "人参与",
    the_pit: "讨论坑",
    live: "实时源",
    no_chatter: "沉默... 打破僵局。",
    nickname_placeholder: "代号",
    comment_placeholder: "广播你的信号...",
    post: "传输",
    reply: "回复",
    cancel: "中止",
    about: "情报",
    footer: "Market Pulse. 风险自负。",
    data_provider: "指数来源: CNN Business"
  },
  ja: {
    pulse_extreme_fear: "通りは血に染まっています。",
    pulse_fear: "恐怖が支配しています。罠でしょうか？",
    pulse_neutral: "不確実性が支配的。現金が王様？",
    pulse_greed: "パーティーが始まりました。長居は無用。",
    pulse_extreme_greed: "最高潮の陶酔！危険が迫っています。",
    last_updated: "最終シグナル",
    syncing: "アップリンク確立中...",
    
    quote_label: "市場の知恵",
    quote_extreme_fear: "他人が恐怖を感じている時こそ貪欲になれ。",
    quote_author_extreme_fear: "ウォーレン・バフェット",
    quote_title_extreme_fear: "バークシャー・ハサウェイ CEO",
    
    quote_fear: "投資において最も危険な4つの言葉は『今回は違う』だ。",
    quote_author_fear: "ジョン・テンプルトン",
    quote_title_fear: "伝説の投資家",
    
    quote_neutral: "株式市場は、活動的な人から忍耐強い人へとお金を移すように設計されている。",
    quote_author_neutral: "ウォーレン・バフェット",
    quote_title_neutral: "オマハの賢人",
    
    quote_greed: "強気相場は悲観の中に生まれ、懐疑の中で育ち、楽観の中で成熟し、陶酔の中で死ぬ。",
    quote_author_greed: "ジョン・テンプルトン",
    quote_title_greed: "伝説の投資家",
    
    quote_extreme_greed: "他人が貪欲になっている時こそ恐れよ。",
    quote_author_extreme_greed: "ウォーレン・バフェット",
    quote_title_extreme_greed: "バークシャー・ハサウェイ CEO",

    translate_quote: "翻訳を見る",
    original_quote: "原文を見る",

    daily_poll: "日次センチメント",
    poll_question: "次回終値予測:",
    nyse_label: "NYSE",
    nasdaq_label: "NASDAQ",
    bullish: "強気",
    bearish: "弱気",
    bulls: "強気派",
    bears: "弱気派",
    votes: "票",
    the_pit: "ザ・ピット",
    live: "ライブ",
    no_chatter: "静寂... 沈黙を破れ。",
    nickname_placeholder: "コードネーム",
    comment_placeholder: "シグナルを発信...",
    post: "送信",
    reply: "返信",
    cancel: "中止",
    about: "情報",
    footer: "Market Pulse. 投資は自己責任で。",
    data_provider: "指数ソース: CNN Business"
  },
  es: {
    pulse_extreme_fear: "SANGRE EN LAS CALLES.",
    pulse_fear: "El miedo domina. ¿Es una trampa?",
    pulse_neutral: "Reina la incertidumbre. ¿Efectivo es rey?",
    pulse_greed: "La fiesta comienza. No te quedes tarde.",
    pulse_extreme_greed: "EUFORIA MÁXIMA. PELIGRO ADELANTE.",
    last_updated: "Última Señal",
    syncing: "Estableciendo Enlace...",
    
    quote_label: "Sabiduría de Mercado",
    quote_extreme_fear: "Sé codicioso cuando otros tienen miedo.",
    quote_author_extreme_fear: "Warren Buffett",
    quote_title_extreme_fear: "CEO de Berkshire Hathaway",
    
    quote_fear: "Las cuatro palabras más peligrosas en la inversión son: 'Esta vez es diferente'.",
    quote_author_fear: "Sir John Templeton",
    quote_title_fear: "Inversor Legendario",
    
    quote_neutral: "El mercado de valores está diseñado para transferir dinero de los activos a los pacientes.",
    quote_author_neutral: "Warren Buffett",
    quote_title_neutral: "Oráculo de Omaha",
    
    quote_greed: "Los mercados alcistas nacen en el pesimismo, crecen en el escepticismo, maduran en el optimismo y mueren en la euforia.",
    quote_author_greed: "Sir John Templeton",
    quote_title_greed: "Inversor Legendario",
    
    quote_extreme_greed: "Ten miedo cuando otros son codiciosos.",
    quote_author_extreme_greed: "Warren Buffett",
    quote_title_extreme_greed: "CEO de Berkshire Hathaway",

    translate_quote: "Traducir",
    original_quote: "Original",

    daily_poll: "Chequeo Diario",
    poll_question: "Predicción de cierre:",
    nyse_label: "NYSE",
    nasdaq_label: "NASDAQ",
    bullish: "ALCISTA",
    bearish: "BAJISTA",
    bulls: "TOROS",
    bears: "OSOS",
    votes: "traders",
    the_pit: "El Foso",
    live: "EN VIVO",
    no_chatter: "Silencio... Rompe el hielo.",
    nickname_placeholder: "Nombre Clave",
    comment_placeholder: "Transmite tu señal...",
    post: "TRANSMITIR",
    reply: "Responder",
    cancel: "Abortar",
    about: "Info",
    footer: "Market Pulse. Opera bajo tu propio riesgo.",
    data_provider: "Fuente: CNN Business"
  }
};
