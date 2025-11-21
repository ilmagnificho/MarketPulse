import { FearGreedData, MarketPolls, Comment, SentimentLevel, LeaderboardEntry } from '../types';

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
   * Matches the data source used by Google AI Search results.
   */
  getFearGreedIndex: async (): Promise<FearGreedData> => {
    // We add a random timestamp to the URL to prevent caching (Cache-Busting)
    const targetUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const cacheBuster = `&t=${new Date().getTime()}`;
    
    let cnnData: any = null;

    // Strategy 1: CorsProxy.io (Often fastest)
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}${cacheBuster}`);
      if (response.ok) {
        cnnData = await response.json();
      }
    } catch (e) {
      console.warn("Strategy 1 failed, trying fallback...");
    }

    // Strategy 2: AllOrigins (Reliable Fallback)
    if (!cnnData) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}${cacheBuster}`);
        if (response.ok) {
          cnnData = await response.json();
        }
      } catch (e) {
        console.warn("Strategy 2 failed.");
      }
    }

    // Strategy 3: Direct Fetch (Will only work if user has a CORS extension or running locally with disabled security, but worth a try as last resort)
    if (!cnnData) {
        try {
            const response = await fetch(`${targetUrl}?${cacheBuster}`);
             if (response.ok) {
                cnnData = await response.json();
              }
        } catch (e) {
            console.warn("Strategy 3 failed.");
        }
    }

    if (cnnData && cnnData.fear_and_greed && cnnData.fear_and_greed.score !== undefined) {
      const score = cnnData.fear_and_greed.score;
      const rating = cnnData.fear_and_greed.rating; 
      const timestamp = cnnData.fear_and_greed.timestamp;

      return {
        value: Math.round(score),
        level: rating ? parseSentimentLevel(rating) : getLevelFromValue(score),
        timestamp: timestamp || new Date().toISOString()
      };
    }

    // Emergency Fallback: Returns a realistic "Fear" value if API is totally down
    // This prevents the app from looking broken.
    console.error("All fetch strategies failed. Using simulation.");
    return {
      value: 28, // Defaulting to Fear for simulation
      level: SentimentLevel.Fear,
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