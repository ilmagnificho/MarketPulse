
export enum SentimentLevel {
  ExtremeFear = 'Extreme Fear',
  Fear = 'Fear',
  Neutral = 'Neutral',
  Greed = 'Greed',
  ExtremeGreed = 'Extreme Greed',
}

export type Language = 'en' | 'ko' | 'zh' | 'ja' | 'es';

export interface FearGreedData {
  value: number;
  level: SentimentLevel;
  timestamp: string;
}

export interface Quote {
  text: string;
  author: string;
  title: string; // e.g. "Founder of Bridgewater"
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
  timestamp: Date;
  likes: number;
  dislikes: number;
  replies: Comment[];
}

export interface SentimentConfig {
  level: SentimentLevel;
  emoji: string;
  bgColor: string; // Tailwind class for solid fallback
  gradient: string; // Tailwind class for gradient
  textColor: string; // Tailwind class
  messageKey: string; 
  range: [number, number];
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  prediction: number;
  accuracy: string;
}
