
export enum SentimentLevel {
  ExtremeFear = 'Extreme Fear',
  Fear = 'Fear',
  Neutral = 'Neutral',
  Greed = 'Greed',
  ExtremeGreed = 'Extreme Greed',
}

export type Language = 'en' | 'ko' | 'zh' | 'ja' | 'es';

export interface HistoryEvent {
  date: string;
  score: number;
  subsequentReturn: number; // The market return 1 month after this event
}

export interface FearGreedData {
  value: number;
  level: SentimentLevel;
  timestamp: string;
  pastMatches: HistoryEvent[];
}

export interface QuoteDef {
  textKey: string;
  authorKey: string;
  titleKey: string;
}

export interface SinglePollResult {
  bullish: number;
  bearish: number;
  total: number;
}

export interface MarketPolls {
  nyse: SinglePollResult;
  nasdaq: SinglePollResult;
}

export interface Comment {
  id: string;
  nickname: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
}

export interface SentimentConfig {
  level: SentimentLevel;
  iconPath: string;
  color: string;
  gradient: string; 
  messageKey: string; 
  range: [number, number];
  zoneLabelKey: string; // New: "Oversold", "Accumulation", etc.
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  prediction: number;
  accuracy: string;
}
