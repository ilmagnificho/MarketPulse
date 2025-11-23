
export enum SentimentLevel {
  ExtremeFear = 'Extreme Fear',
  Fear = 'Fear',
  Neutral = 'Neutral',
  Greed = 'Greed',
  ExtremeGreed = 'Extreme Greed',
}

export type Language = 'en' | 'ko' | 'zh' | 'ja' | 'es';

export interface HistoryContext {
  lastSeenDate: string;
  daysAgo: number;
  nasdaqChange: number;
  nyseChange: number;
  trend: number[]; // Array for mini-chart
}

export interface FearGreedData {
  value: number;
  level: SentimentLevel;
  timestamp: string;
  history?: HistoryContext;
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
  timestamp: string; // Changed to string for JSON serialization
  likes: number;
  dislikes: number;
  replies: Comment[];
}

export interface SentimentConfig {
  level: SentimentLevel;
  iconPath: string; // SVG Path data instead of emoji
  color: string; // Main color hex or tailwind class base
  gradient: string; 
  messageKey: string; 
  range: [number, number];
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  prediction: number;
  accuracy: string;
}
