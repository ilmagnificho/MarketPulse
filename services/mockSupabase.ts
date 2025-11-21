
import { FearGreedData, MarketPolls, Comment, SentimentLevel, SinglePollResult, LeaderboardEntry } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to map numerical value to Level (Fallback logic)
const getLevelFromValue = (value: number): SentimentLevel => {
  if (value <= 25) return SentimentLevel.ExtremeFear;
  if (value <= 45) return SentimentLevel.Fear;
  if (value <= 55) return SentimentLevel.Neutral;
  if (value <= 75) return SentimentLevel.Greed;
  return SentimentLevel.ExtremeGreed;
};

const parseSentimentLevel = (apiRating: string): SentimentLevel => {
  // Normalize string to match Enum (Title Case)
  const normalized = apiRating.toLowerCase();
  if (normalized.includes('extreme fear')) return SentimentLevel.ExtremeFear;
  if (normalized.includes('extreme greed')) return SentimentLevel.ExtremeGreed;
  if (normalized.includes('fear')) return SentimentLevel.Fear;
  if (normalized.includes('greed')) return SentimentLevel.Greed;
  return SentimentLevel.Neutral;
};

let currentPolls: MarketPolls = {
  nyse: { bullish: 1250, bearish: 890, total: 2140 },
  nasdaq: { bullish: 1540, bearish: 1620, total: 3160 },
};

export const api = {
  /**
   * Fetches the REAL CNN Fear & Greed Index.
   * Mirrors logic from https://pypi.org/project/fear-and-greed/
   * Endpoint: https://production.dataviz.cnn.io/index/fearandgreed/graphdata
   */
  getFearGreedIndex: async (): Promise<FearGreedData> => {
    const targetUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    let cnnData: any = null;

    // Strategy 1: High-performance CORS Proxy (corsproxy.io)
    // This mimics the direct Python request by stripping origin headers that trigger CORS blocks.
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
      if (response.ok) {
        cnnData = await response.json();
      }
    } catch (e) {
      console.warn("Strategy 1 (CorsProxy) failed, trying fallback...", e);
    }

    // Strategy 2: Fallback Proxy (allorigins.win)
    if (!cnnData) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
          cnnData = await response.json();
        }
      } catch (e) {
        console.warn("Strategy 2 (AllOrigins) failed.", e);
      }
    }

    if (cnnData && cnnData.fear_and_greed && cnnData.fear_and_greed.score !== undefined) {
      const score = cnnData.fear_and_greed.score;
      const rating = cnnData.fear_and_greed.rating; // Use official rating string if available
      const timestamp = cnnData.fear_and_greed.timestamp;

      return {
        value: Math.round(score),
        level: rating ? parseSentimentLevel(rating) : getLevelFromValue(score),
        timestamp: timestamp || new Date().toISOString()
      };
    }

    // Final Fallback if API is completely unreachable (prevents white screen)
    console.error("All fetch strategies failed. Using simulation.");
    return {
      value: 45,
      level: SentimentLevel.Neutral,
      timestamp: new Date().toISOString()
    };
  },

  getPollResults: async (): Promise<MarketPolls> => {
    await delay(600);
    return currentPolls;
  },

  votePoll: async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear'): Promise<MarketPolls> => {
    await delay(300);
    const target = currentPolls[market];
    const newCount = {
      bullish: type === 'bull' ? target.bullish + 1 : target.bullish,
      bearish: type === 'bear' ? target.bearish + 1 : target.bearish,
      total: target.total + 1
    };
    currentPolls = { ...currentPolls, [market]: newCount };
    return currentPolls;
  },

  getComments: async (): Promise<Comment[]> => {
    await delay(700);
    return [
      { 
        id: '1', 
        nickname: 'ShortSqueeze', 
        content: 'VIX is spiking. I am loading up on puts.', 
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        likes: 42,
        dislikes: 5,
        replies: []
      },
      { 
        id: '2', 
        nickname: 'DiamondHands', 
        content: 'Just a correction. HODL.', 
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        likes: 8,
        dislikes: 22,
        replies: []
      },
    ];
  },

  postComment: async (nickname: string, content: string, parentId?: string): Promise<Comment> => {
    await delay(400);
    return {
      id: Math.random().toString(36).substr(2, 9),
      nickname,
      content,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: []
    };
  },

  voteComment: async (commentId: string, type: 'like' | 'dislike'): Promise<void> => {
    await delay(200);
    return;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return [];
  },

  submitPrediction: async (nickname: string, prediction: number): Promise<void> => {
    return;
  }
};
