
import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Pulse
    pulse_extreme_fear: "Investors are panicked. Historical data suggests these levels often mark short-term bottoms.",
    pulse_fear: "Sentiment is cautious. Risk appetite is low, often a precursor to value buying.",
    pulse_neutral: "Market is undecided. Volatility is compressed as traders await a catalyst.",
    pulse_greed: "Buying pressure is high. Momentum is strong but risk/reward is worsening.",
    pulse_extreme_greed: "Extreme euphoria. Markets are stretched and vulnerable to a correction.",
    last_updated: "UPDATED",
    syncing: "ANALYZING MARKET DATA...",
    
    // Zones (New)
    zone_extreme_fear: "HEAVY DISCOUNT ZONE",
    zone_fear: "ACCUMULATION ZONE",
    zone_neutral: "TRANSITION ZONE",
    zone_greed: "MOMENTUM ZONE",
    zone_extreme_greed: "OVERBOUGHT / RISK ZONE",

    // Quotes
    quote_ef_1: "Be greedy when others are fearful.",
    author_ef_1: "Warren Buffett",
    title_ef_1: "Berkshire Hathaway",
    quote_ef_2: "The time to buy is when there's blood in the streets.",
    author_ef_2: "Baron Rothschild",
    title_ef_2: "18th Century Banker",
    
    quote_f_1: "In the short run, the market is a voting machine but in the long run, it is a weighing machine.",
    author_f_1: "Benjamin Graham",
    title_f_1: "Value Investing Father",
    
    quote_n_1: "I don't look to jump over 7-foot bars: I look around for 1-foot bars that I can step over.",
    author_n_1: "Warren Buffett",
    title_n_1: "Oracle of Omaha",

    quote_g_1: "The four most dangerous words in investing are: 'This time it's different.'",
    author_g_1: "Sir John Templeton",
    title_g_1: "Legendary Investor",

    quote_eg_1: "Be fearful when others are greedy.",
    author_eg_1: "Warren Buffett",
    title_eg_1: "Berkshire Hathaway",
    quote_eg_2: "Soros's Law: The worse a situation becomes, the less it takes to turn it around.",
    author_eg_2: "George Soros",
    title_eg_2: "Hedge Fund Tycoon",

    translate_quote: "TRANSLATE",
    original_quote: "ORIGINAL",

    // History / Patterns
    pattern_title: "PATTERN RECOGNITION",
    pattern_desc: "Previous dates with similar sentiment:",
    col_date: "DATE",
    col_score: "SCORE",
    col_return: "1M RETURN",
    
    // Crowd
    daily_poll: "DAILY CONSENSUS",
    poll_question: "Where is the market heading?",
    nyse_label: "S&P 500",
    nasdaq_label: "NASDAQ 100",
    bullish: "LONG",
    bearish: "SHORT",
    bulls: "BULLS",
    bears: "BEARS",
    votes: "VOTES",
    the_pit: "TRADING FLOOR",
    no_chatter: "No active signals. Be the first.",
    nickname_placeholder: "CODENAME",
    comment_placeholder: "Share your analysis...",
    post: "POST",
    reply: "REPLY",
    
    // Layout
    footer: "Market Pulse. Not financial advice.",
    data_provider: "Data: CNN Business"
  },
  ko: {
    pulse_extreme_fear: "투자자들이 공포에 질려있습니다. 역사적으로 이 구간은 단기 바닥일 가능성이 높습니다.",
    pulse_fear: "심리가 위축되었습니다. 위험 선호도가 낮으며, 이는 종종 저가 매수의 기회가 됩니다.",
    pulse_neutral: "방향성이 없습니다. 트레이더들이 재료를 기다리며 관망하고 있습니다.",
    pulse_greed: "매수세가 강합니다. 모멘텀은 좋지만 손익비는 점차 나빠지고 있습니다.",
    pulse_extreme_greed: "극도의 과열 상태입니다. 시장이 무리하게 뻗어있어 조정 위험이 큽니다.",
    last_updated: "업데이트 완료",
    syncing: "시장 데이터 분석 중...",
    
    // Zones
    zone_extreme_fear: "과매도 / 바겐세일 구간",
    zone_fear: "분할 매수(Accumulation) 구간",
    zone_neutral: "중립 / 전환 구간",
    zone_greed: "상승 모멘텀 구간",
    zone_extreme_greed: "과매수 / 고위험 구간",

    // Quotes
    quote_ef_1: "남들이 두려워할 때 탐욕스러워져라.",
    author_ef_1: "워렌 버핏",
    title_ef_1: "버크셔 해서웨이",
    quote_ef_2: "거리에 피가 낭자할 때가 매수 타이밍이다.",
    author_ef_2: "바론 로스차일드",
    title_ef_2: "18세기 은행가",
    
    quote_f_1: "단기적으로 시장은 투표기계지만, 장기적으로는 저울이다.",
    author_f_1: "벤자민 그레이엄",
    title_f_1: "가치투자의 아버지",

    quote_n_1: "나는 7피트 담장을 넘으려 하지 않는다. 넘을 수 있는 1피트 담장을 찾는다.",
    author_n_1: "워렌 버핏",
    title_n_1: "오마하의 현인",

    quote_g_1: "투자에서 가장 위험한 네 단어는 '이번에는 다르다'이다.",
    author_g_1: "존 템플턴",
    title_g_1: "전설적인 투자자",

    quote_eg_1: "남들이 탐욕스러울 때 두려워하라.",
    author_eg_1: "워렌 버핏",
    title_eg_1: "버크셔 해서웨이",
    quote_eg_2: "상황이 악화될수록 반전의 계기는 적어지고 상승폭은 커진다.",
    author_eg_2: "조지 소로스",
    title_eg_2: "헤지펀드의 대부",

    translate_quote: "번역",
    original_quote: "원문",

    // History
    pattern_title: "과거 패턴 분석",
    pattern_desc: "동일 수치가 발생했던 과거 시점:",
    col_date: "날짜",
    col_score: "지수",
    col_return: "1개월 후 등락",

    daily_poll: "일일 컨센서스",
    poll_question: "시장 전망 투표",
    nyse_label: "S&P 500",
    nasdaq_label: "NASDAQ 100",
    bullish: "상승 (LONG)",
    bearish: "하락 (SHORT)",
    bulls: "상승론",
    bears: "하락론",
    votes: "투표수",
    the_pit: "트레이딩 플로어",
    no_chatter: "대화 기록 없음.",
    nickname_placeholder: "닉네임",
    comment_placeholder: "관점 공유...",
    post: "등록",
    reply: "답글",
    
    footer: "Market Pulse. 투자 조언이 아닙니다.",
    data_provider: "데이터: CNN Business"
  },
  zh: {
    pulse_extreme_fear: "极度恐慌。历史数据显示这通常是短期底部。",
    pulse_fear: "情绪谨慎。风险偏好低，通常是吸筹良机。",
    pulse_neutral: "趋势不明。交易者正在观望。",
    pulse_greed: "买盘强劲。动能虽强，但盈亏比正在恶化。",
    pulse_extreme_greed: "极度狂热。市场过度延伸，回调风险极大。",
    last_updated: "已更新",
    syncing: "分析市场数据...",
    
    zone_extreme_fear: "超卖 / 特价区",
    zone_fear: "吸筹区",
    zone_neutral: "过渡区",
    zone_greed: "动能区",
    zone_extreme_greed: "超买 / 高风险区",

    // Simplified Quotes
    quote_ef_1: "在别人恐惧时贪婪。",
    author_ef_1: "沃伦·巴菲特",
    title_ef_1: "伯克希尔·哈撒韦",
    quote_ef_2: "当街头喋血时，就是买入的时机。",
    author_ef_2: "罗斯柴尔德男爵",
    title_ef_2: "银行家",

    quote_f_1: "短期看市场是投票机，长期看是称重机。",
    author_f_1: "本杰明·格雷厄姆",
    title_f_1: "价值投资之父",

    quote_n_1: "我不试图跳过7英尺的栏杆，我只找1英尺的迈过去。",
    author_n_1: "沃伦·巴菲特",
    title_n_1: "奥马哈先知",

    quote_g_1: "投资中最危险的四个字是：'这次不同'。",
    author_g_1: "约翰·邓普顿",
    title_g_1: "传奇投资者",

    quote_eg_1: "在别人贪婪时恐惧。",
    author_eg_1: "沃伦·巴菲特",
    title_eg_1: "伯克希尔·哈撒韦",
    quote_eg_2: "索罗斯定律：情况越糟，反转需要的越少。",
    author_eg_2: "乔治·索罗斯",
    title_eg_2: "金融大鳄",

    translate_quote: "翻译",
    original_quote: "原文",

    pattern_title: "历史模式识别",
    pattern_desc: "出现相同数值的历史日期：",
    col_date: "日期",
    col_score: "指数",
    col_return: "1个月后涨跌",

    daily_poll: "每日共识",
    poll_question: "市场展望",
    nyse_label: "S&P 500",
    nasdaq_label: "NASDAQ 100",
    bullish: "看多",
    bearish: "看空",
    bulls: "多头",
    bears: "空头",
    votes: "票数",
    the_pit: "交易大厅",
    no_chatter: "暂无消息。",
    nickname_placeholder: "代号",
    comment_placeholder: "分享观点...",
    post: "发布",
    reply: "回复",
    
    footer: "Market Pulse. 非投资建议。",
    data_provider: "数据: CNN Business"
  },
  ja: {
    pulse_extreme_fear: "パニック状態です。歴史的に短期的な底値圏を示唆します。",
    pulse_fear: "警戒感が高まっています。リスクオフは買い集めの好機となる場合があります。",
    pulse_neutral: "方向感がありません。トレーダーは材料待ちです。",
    pulse_greed: "買い圧力が強いです。勢いはありますがリスクリワードは悪化しています。",
    pulse_extreme_greed: "極度の陶酔。市場は過熱しており、調整リスクが高いです。",
    last_updated: "更新完了",
    syncing: "データ分析中...",
    
    zone_extreme_fear: "売られすぎ / バーゲン",
    zone_fear: "蓄積 (Accumulation) ゾーン",
    zone_neutral: "中立ゾーン",
    zone_greed: "モメンタムゾーン",
    zone_extreme_greed: "買われすぎ / 危険水域",

    // Simplified Quotes
    quote_ef_1: "他人が恐怖を感じている時こそ貪欲になれ。",
    author_ef_1: "ウォーレン・バフェット",
    title_ef_1: "バークシャー・ハサウェイ",
    quote_ef_2: "通りが血に染まっている時が買い時だ。",
    author_ef_2: "ロスチャイルド男爵",
    title_ef_2: "銀行家",

    quote_f_1: "市場は短期的には投票機だが、長期的には秤である。",
    author_f_1: "ベンジャミン・グレアム",
    title_f_1: "バリュー投資の父",

    quote_n_1: "私は7フィートの障壁を越えようとはしない。1フィートの障壁を探す。",
    author_n_1: "ウォーレン・バフェット",
    title_n_1: "オマハの賢人",

    quote_g_1: "投資で最も危険な4つの言葉は『今回は違う』だ。",
    author_g_1: "ジョン・テンプルトン",
    title_g_1: "伝説の投資家",

    quote_eg_1: "他人が貪欲な時こそ恐れよ。",
    author_eg_1: "ウォーレン・バフェット",
    title_eg_1: "バークシャー・ハサウェイ",
    quote_eg_2: "状況が悪化するほど、反転に必要な力は小さく済む。",
    author_eg_2: "ジョージ・ソロス",
    title_eg_2: "ヘッジファンド",

    translate_quote: "翻訳",
    original_quote: "原文",

    pattern_title: "過去パターン分析",
    pattern_desc: "同様の数値が発生した過去の日付:",
    col_date: "日付",
    col_score: "指数",
    col_return: "1ヶ月後",

    daily_poll: "市場コンセンサス",
    poll_question: "市場見通し",
    nyse_label: "S&P 500",
    nasdaq_label: "NASDAQ 100",
    bullish: "強気 (LONG)",
    bearish: "弱気 (SHORT)",
    bulls: "強気",
    bears: "弱気",
    votes: "投票数",
    the_pit: "トレーディングフロア",
    no_chatter: "シグナルなし。",
    nickname_placeholder: "コードネーム",
    comment_placeholder: "分析を共有...",
    post: "投稿",
    reply: "返信",
    
    footer: "Market Pulse. 投資助言ではありません。",
    data_provider: "データ: CNN Business"
  },
  es: {
    pulse_extreme_fear: "Pánico detectado. Históricamente marca suelos a corto plazo.",
    pulse_fear: "Cautela. El apetito de riesgo es bajo, precursor de compras de valor.",
    pulse_neutral: "Sin tendencia. Los operadores esperan un catalizador.",
    pulse_greed: "Fuerte presión de compra. Momentum fuerte pero riesgo alto.",
    pulse_extreme_greed: "Euforia extrema. Mercado extendido y vulnerable.",
    last_updated: "ACTUALIZADO",
    syncing: "ANALIZANDO DATOS...",
    
    zone_extreme_fear: "ZONA DE DESCUENTO",
    zone_fear: "ZONA DE ACUMULACIÓN",
    zone_neutral: "ZONA DE TRANSICIÓN",
    zone_greed: "ZONA DE MOMENTUM",
    zone_extreme_greed: "SOBRECOMPRA / RIESGO",

    // Simplified Quotes
    quote_ef_1: "Sé codicioso cuando otros tengan miedo.",
    author_ef_1: "Warren Buffett",
    title_ef_1: "Berkshire Hathaway",
    quote_ef_2: "El momento de comprar es cuando hay sangre en las calles.",
    author_ef_2: "Barón Rothschild",
    title_ef_2: "Banquero",

    quote_f_1: "A corto plazo el mercado es una máquina de votar, a largo una balanza.",
    author_f_1: "Benjamin Graham",
    title_f_1: "Inversión de Valor",

    quote_n_1: "No busco saltar vallas de 7 pies, busco las de 1 pie.",
    author_n_1: "Warren Buffett",
    title_n_1: "Oráculo de Omaha",

    quote_g_1: "Las 4 palabras más peligrosas: 'Esta vez es diferente'.",
    author_g_1: "Sir John Templeton",
    title_g_1: "Inversor",

    quote_eg_1: "Ten miedo cuando otros sean codiciosos.",
    author_eg_1: "Warren Buffett",
    title_eg_1: "Berkshire Hathaway",
    quote_eg_2: "Cuanto peor la situación, menor el esfuerzo para el rebote.",
    author_eg_2: "George Soros",
    title_eg_2: "Magnate",

    translate_quote: "TRADUCIR",
    original_quote: "ORIGINAL",

    pattern_title: "RECONOCIMIENTO DE PATRONES",
    pattern_desc: "Fechas anteriores con sentimiento similar:",
    col_date: "FECHA",
    col_score: "PUNTAJE",
    col_return: "RETORNO 1M",

    daily_poll: "CONSENSO DIARIO",
    poll_question: "Perspectiva de Mercado",
    nyse_label: "S&P 500",
    nasdaq_label: "NASDAQ 100",
    bullish: "ALCISTA",
    bearish: "BAJISTA",
    bulls: "TOROS",
    bears: "OSOS",
    votes: "VOTOS",
    the_pit: "PISO DE REMATES",
    no_chatter: "Sin señal.",
    nickname_placeholder: "APODO",
    comment_placeholder: "Compartir análisis...",
    post: "PUBLICAR",
    reply: "RESPONDER",
    
    footer: "Market Pulse. No es consejo financiero.",
    data_provider: "Datos: CNN Business"
  }
};
