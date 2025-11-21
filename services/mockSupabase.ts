
import { FearGreedData, MarketPolls, Comment, LeaderboardEntry, SentimentLevel, SinglePollResult } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to map numerical value to Level
const getLevelFromValue = (value: number): SentimentLevel => {
  if (value <= 20) return SentimentLevel.ExtremeFear;
  if (value <= 40) return SentimentLevel.Fear;
  if (value <= 60) return SentimentLevel.Neutral;
  if (value <= 80) return SentimentLevel.Greed;
  return SentimentLevel.ExtremeGreed;
};

// In-memory state for polls to persist within session
let currentPolls: MarketPolls = {
  nyse: { bullish: 1250, bearish: 890, total: 2140 },
  nasdaq: { bullish: 1540, bearish: 1620, total: 3160 },
};

export const api = {
  /**
   * Fetches the REAL Fear & Greed Index.
   * Note: CNN's API is CORS protected. We use Alternative.me (Open API)
   * which mirrors general market sentiment very closely and allows CORS.
   */
  getFearGreedIndex: async (): Promise<FearGreedData> => {
    try {
      // Using alternative.me API which allows CORS for frontend-only apps
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      
      if (data && data.data && data.data.length > 0) {
        const value = parseInt(data.data[0].value, 10);
        return {
          value: value,
          level: getLevelFromValue(value),
          timestamp: new Date(parseInt(data.data[0].timestamp) * 1000).toISOString()
        };
      }
      throw new Error("Invalid data format");
    } catch (e) {
      console.warn("API Fetch failed, falling back to mock for demo reliability", e);
      // Fallback if API fails (or user is offline)
      await delay(800);
      return {
        value: 6,
        level: SentimentLevel.ExtremeFear,
        timestamp: new Date().toISOString()
      };
    }
  },

  getPollResults: async (): Promise<MarketPolls> => {
    await delay(600);
    return currentPolls;
  },

  votePoll: async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear'): Promise<MarketPolls> => {
    await delay(500);
    const target = currentPolls[market];
    
    // Update in-memory state
    const newCount = {
      bullish: type === 'bull' ? target.bullish + 1 : target.bullish,
      bearish: type === 'bear' ? target.bearish + 1 : target.bearish,
      total: target.total + 1
    };
    
    currentPolls = {
      ...currentPolls,
      [market]: newCount
    };

    return currentPolls;
  },

  /**
   * Get latest comments with nested structure support.
   */
  getComments: async (): Promise<Comment[]> => {
    await delay(700);
    return [
      { 
        id: '1', 
        nickname: 'MoonWalker', 
        content: 'NASDAQ is oversold. Tech rally incoming this Friday.', 
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        likes: 42,
        dislikes: 5,
        replies: [
             {
                id: '1-1',
                nickname: 'RationalInvestor',
                content: 'Yields are still too high. Be careful.',
                timestamp: new Date(Date.now() - 1000 * 60 * 2),
                likes: 15,
                dislikes: 1,
                replies: []
             }
        ]
      },
      { 
        id: '2', 
        nickname: 'BearTrap', 
        content: 'NYSE showing weakness. Rotations into defensive sectors.', 
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        likes: 8,
        dislikes: 12,
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
    // In real app, would send to Supabase
    return;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await delay(600);
    return [
      { rank: 1, nickname: "AlphaSeeker", prediction: 4120.50, accuracy: "99.9%" },
      { rank: 2, nickname: "ChartMaster", prediction: 4115.20, accuracy: "98.5%" },
      { rank: 3, nickname: "LuckyGuess", prediction: 4135.00, accuracy: "97.2%" },
    ];
  },

  submitPrediction: async (nickname: string, value: number): Promise<boolean> => {
    await delay(1000);
    return true;
  }
};
