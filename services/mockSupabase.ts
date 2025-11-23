
import { FearGreedData, MarketPolls, Comment, SentimentLevel, LeaderboardEntry, HistoryContext } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
  POLLS: 'MARKET_PULSE_POLLS_V1',
  COMMENTS: 'MARKET_PULSE_COMMENTS_V1'
};

// --- INITIAL DATA ---
const INITIAL_POLLS: MarketPolls = {
  nyse: { bullish: 1250, bearish: 890, total: 2140 },
  nasdaq: { bullish: 1540, bearish: 1620, total: 3160 },
};

const INITIAL_COMMENTS: Comment[] = [
  { 
    id: '1', 
    nickname: 'AlphaSeeker', 
    content: 'Vol suppression is reaching critical levels. Expecting a breakout.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    likes: 42,
    dislikes: 5,
    replies: []
  },
  { 
    id: '2', 
    nickname: 'ThetaGang', 
    content: 'Just selling premium here. Theta decay is my friend.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 8,
    dislikes: 2,
    replies: []
  },
];

// --- HELPERS ---
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

const generateTrendData = (days: number, volatility: number): number[] => {
    const points = 20;
    const data = [0];
    let current = 0;
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.45) * volatility; // slight upward bias
        current += change;
        data.push(current);
    }
    return data;
};

const generateFallbackHistory = (currentScore: number): HistoryContext => {
  let minDays = 7;
  let maxDays = 30;
  
  if (currentScore < 25 || currentScore > 75) {
    minDays = 45;
    maxDays = 180;
  } else if (currentScore < 45 || currentScore > 55) {
    minDays = 14;
    maxDays = 60;
  }

  const daysAgo = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo);

  const volatility = Math.sqrt(daysAgo) * 0.6;
  const trend = Math.random() > 0.4 ? 1 : -1; 

  return {
    lastSeenDate: pastDate.toISOString(),
    daysAgo: daysAgo,
    nasdaqChange: parseFloat((Math.random() * volatility * trend).toFixed(2)),
    nyseChange: parseFloat((Math.random() * (volatility * 0.7) * trend).toFixed(2)),
    trend: generateTrendData(daysAgo, volatility)
  };
};

// --- LOCAL STORAGE MANAGERS ---
const loadPolls = (): MarketPolls => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.POLLS);
        return saved ? JSON.parse(saved) : INITIAL_POLLS;
    } catch (e) {
        return INITIAL_POLLS;
    }
};

const savePolls = (polls: MarketPolls) => {
    try {
        localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
    } catch (e) {}
};

const loadComments = (): Comment[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
        return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch (e) {
        return INITIAL_COMMENTS;
    }
};

const saveComments = (comments: Comment[]) => {
    try {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (e) {}
};

export const api = {
  getFearGreedIndex: async (): Promise<FearGreedData> => {
    const targetUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const timestamp = new Date().getTime(); 
    const cacheBuster = `&t=${timestamp}`;

    const fetchWithTimeout = async (url: string, timeoutMs = 5000): Promise<any> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    let cnnData: any = null;

    try {
      cnnData = await (Promise as any).any([
        fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}${cacheBuster}`, 6000),
        fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}${cacheBuster}`, 6000),
        fetchWithTimeout(`${targetUrl}?${cacheBuster}`, 2000)
      ]);
    } catch (aggregateError) {
      console.warn("Live fetch failed.", aggregateError);
    }

    if (cnnData && cnnData.fear_and_greed && cnnData.fear_and_greed.score !== undefined) {
      const score = Math.round(cnnData.fear_and_greed.score);
      const rating = cnnData.fear_and_greed.rating; 
      const dataTimestamp = cnnData.fear_and_greed.timestamp;
      
      let historyContext: HistoryContext | undefined = undefined;
      const historyData = cnnData.fear_and_greed.historical?.data;

      if (Array.isArray(historyData) && historyData.length > 5) {
        for (let i = historyData.length - 10; i >= 0; i--) {
          const pastItem = historyData[i];
          if (Math.abs(Math.round(pastItem.y) - score) <= 1) {
             const pastDate = new Date(pastItem.x);
             const daysAgo = Math.floor((new Date().getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24));
             
             if (daysAgo > 7) {
               const direction = Math.random() > 0.4 ? 1 : -1;
               const volatility = Math.sqrt(daysAgo) * 0.5;
               
               historyContext = {
                 lastSeenDate: pastDate.toISOString(),
                 daysAgo: daysAgo,
                 nasdaqChange: parseFloat((Math.random() * volatility * direction).toFixed(2)),
                 nyseChange: parseFloat((Math.random() * (volatility * 0.7) * direction).toFixed(2)),
                 trend: generateTrendData(daysAgo, volatility)
               };
               break;
             }
          }
        }
      }

      if (!historyContext) {
        historyContext = generateFallbackHistory(score);
      }

      return {
        value: score,
        level: rating ? parseSentimentLevel(rating) : getLevelFromValue(score),
        timestamp: dataTimestamp || new Date().toISOString(),
        history: historyContext
      };
    }

    const fallbackScore = Math.floor(Math.random() * 40) + 20; 
    return {
      value: fallbackScore,
      level: getLevelFromValue(fallbackScore),
      timestamp: new Date().toISOString(),
      history: generateFallbackHistory(fallbackScore)
    };
  },

  getPollResults: async (): Promise<MarketPolls> => {
    await delay(200); // Slight delay for realism
    return loadPolls();
  },

  votePoll: async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear'): Promise<MarketPolls> => {
    await delay(300);
    const current = loadPolls();
    const target = current[market];
    const newCount = {
      bullish: type === 'bull' ? target.bullish + 1 : target.bullish,
      bearish: type === 'bear' ? target.bearish + 1 : target.bearish,
      total: target.total + 1
    };
    const updated = { ...current, [market]: newCount };
    savePolls(updated);
    return updated;
  },

  getComments: async (): Promise<Comment[]> => {
    await delay(200);
    return loadComments();
  },

  postComment: async (nickname: string, content: string, parentId?: string): Promise<Comment> => {
    await delay(400);
    const allComments = loadComments();
    
    const newC: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      nickname,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    if (!parentId) {
        saveComments([newC, ...allComments]);
        return newC;
    } else {
        const addReply = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === parentId) {
                    return { ...c, replies: [...c.replies, newC] };
                }
                return { ...c, replies: addReply(c.replies) };
            });
        };
        saveComments(addReply(allComments));
        return newC;
    }
  },

  voteComment: async (commentId: string, type: 'like' | 'dislike'): Promise<void> => {
    // This is a "fire and forget" in this mock implementation,
    // but we should update local storage for realism.
    const allComments = loadComments();
    const updateVotes = (list: Comment[]): Comment[] => {
        return list.map(c => {
            if (c.id === commentId) {
                return { 
                    ...c, 
                    likes: type === 'like' ? c.likes + 1 : c.likes,
                    dislikes: type === 'dislike' ? c.dislikes + 1 : c.dislikes
                };
            }
            return { ...c, replies: updateVotes(c.replies) };
        });
    };
    saveComments(updateVotes(allComments));
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return [];
  },

  submitPrediction: async (nickname: string, prediction: number): Promise<void> => {
    return;
  }
};
