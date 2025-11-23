import { FearGreedData, MarketPolls, Comment, SentimentLevel, LeaderboardEntry, HistoryEvent } from '../types';

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
  POLLS: 'MARKET_PULSE_POLLS_V2',
  COMMENTS: 'MARKET_PULSE_COMMENTS_V2'
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

// --- REAL-TIME & SIMULATION STATE ---
type SubscriptionCallback<T> = (data: T) => void;
const pollSubscribers: Set<SubscriptionCallback<MarketPolls>> = new Set();
const commentSubscribers: Set<SubscriptionCallback<Comment[]>> = new Set();

const channel = new BroadcastChannel('market_pulse_realtime');

const BOT_NICKS = ['MarketWizard', 'CoinFlipper', 'QuantAlgo', 'HODLer', 'BearWhale', 'JPOW_Fan', 'DeltaOne', 'Satoshi_Ghost'];
const BOT_MESSAGES = [
    "Liquidity looks thin here.",
    "Buying the dip.",
    "Short squeeze incoming?",
    "Just hit my stop loss.",
    "Rotation into tech is obvious.",
    "VIX is waking up.",
    "Looking for a rejection at this level.",
    "Gap fill likely.",
    "Volume is drying up.",
    "Algo trading taking over."
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

// Find top 3-5 past dates with similar scores
const findHistoricalMatches = (currentScore: number, historyData: any[]): HistoryEvent[] => {
    const matches: HistoryEvent[] = [];
    const targetCount = 4; 
    
    if (!Array.isArray(historyData)) return generateFallbackMatches(currentScore);

    // Iterate backwards to find recent matches first, skipping very recent days (last 7 days) to avoid redundancy
    const now = new Date().getTime();
    const ONE_DAY = 1000 * 60 * 60 * 24;
    
    for (let i = historyData.length - 7; i >= 0; i--) {
        const item = historyData[i];
        if (!item || item.y === undefined) continue;
        
        const itemScore = Math.round(item.y);
        // Match within +/- 2 points
        if (Math.abs(itemScore - currentScore) <= 2) {
            const date = new Date(item.x);
            
            // Avoid duplicate nearby dates (e.g., yesterday and today)
            const isTooClose = matches.some(m => Math.abs(new Date(m.date).getTime() - date.getTime()) < (ONE_DAY * 14));
            if (!isTooClose) {
                // Simulate "what happened next" (1 Month Return) based on score
                // Extreme Fear usually leads to bounce (+), Extreme Greed to correction (-)
                // Adding some randomness to simulation
                let baseReturn = 0;
                if (currentScore < 30) baseReturn = 4.5; // Bounce
                else if (currentScore > 70) baseReturn = -3.2; // Correction
                else baseReturn = 1.2; // Drift

                const randomVar = (Math.random() * 6) - 3; // +/- 3% variance
                const simulatedReturn = parseFloat((baseReturn + randomVar).toFixed(2));

                matches.push({
                    date: date.toISOString(),
                    score: itemScore,
                    subsequentReturn: simulatedReturn
                });
            }
        }
        if (matches.length >= targetCount) break;
    }

    if (matches.length === 0) return generateFallbackMatches(currentScore);
    return matches;
};

const generateFallbackMatches = (score: number): HistoryEvent[] => {
    const matches: HistoryEvent[] = [];
    const count = 3;
    for (let i = 1; i <= count; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (i * 4)); // Go back 4, 8, 12 months
        d.setDate(d.getDate() + Math.floor(Math.random() * 10));
        
        let ret = 0;
        if (score < 30) ret = 5 + Math.random() * 5;
        else if (score > 70) ret = -4 - Math.random() * 4;
        else ret = (Math.random() * 6) - 3;

        matches.push({
            date: d.toISOString(),
            score: score + Math.floor(Math.random() * 4) - 2,
            subsequentReturn: parseFloat(ret.toFixed(2))
        });
    }
    return matches;
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

// --- REAL-TIME SUBSCRIPTIONS ---
const notifyPolls = (data: MarketPolls, broadcast = true) => {
    pollSubscribers.forEach(cb => cb(data));
    if (broadcast) channel.postMessage({ type: 'POLLS_UPDATE', data });
};

const notifyComments = (data: Comment[], broadcast = true) => {
    commentSubscribers.forEach(cb => cb(data));
    if (broadcast) channel.postMessage({ type: 'COMMENTS_UPDATE', data });
};

channel.onmessage = (event) => {
    if (event.data.type === 'POLLS_UPDATE') {
        savePolls(event.data.data);
        notifyPolls(event.data.data, false);
    } else if (event.data.type === 'COMMENTS_UPDATE') {
        saveComments(event.data.data);
        notifyComments(event.data.data, false);
    }
};

let simulationRunning = false;
const startSimulation = () => {
    if (simulationRunning) return;
    simulationRunning = true;

    setInterval(() => {
        if (Math.random() > 0.3) {
            const market = Math.random() > 0.5 ? 'nyse' : 'nasdaq';
            const type = Math.random() > 0.5 ? 'bull' : 'bear';
            const current = loadPolls();
            const target = current[market];
            target[type === 'bull' ? 'bullish' : 'bearish']++;
            target.total++;
            savePolls(current);
            notifyPolls(current);
        }
    }, 4000);

    setInterval(() => {
        if (Math.random() > 0.5) {
            const current = loadComments();
            const newMsg: Comment = {
                id: Math.random().toString(36).substr(2, 9),
                nickname: BOT_NICKS[Math.floor(Math.random() * BOT_NICKS.length)],
                content: BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
                timestamp: new Date().toISOString(),
                likes: Math.floor(Math.random() * 5),
                dislikes: 0,
                replies: []
            };
            const updated = [newMsg, ...current].slice(0, 50);
            saveComments(updated);
            notifyComments(updated);
        }
    }, 15000);
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
      
      const historyData = cnnData.fear_and_greed.historical?.data;
      const pastMatches = findHistoricalMatches(score, historyData);

      return {
        value: score,
        level: rating ? parseSentimentLevel(rating) : getLevelFromValue(score),
        timestamp: dataTimestamp || new Date().toISOString(),
        pastMatches: pastMatches
      };
    }

    const fallbackScore = Math.floor(Math.random() * 40) + 20; 
    return {
      value: fallbackScore,
      level: getLevelFromValue(fallbackScore),
      timestamp: new Date().toISOString(),
      pastMatches: generateFallbackMatches(fallbackScore)
    };
  },

  subscribeToPolls: (cb: SubscriptionCallback<MarketPolls>) => {
      pollSubscribers.add(cb);
      cb(loadPolls());
      startSimulation();
      return () => pollSubscribers.delete(cb);
  },

  subscribeToComments: (cb: SubscriptionCallback<Comment[]>) => {
      commentSubscribers.add(cb);
      cb(loadComments());
      startSimulation();
      return () => commentSubscribers.delete(cb);
  },

  votePoll: async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear'): Promise<MarketPolls> => {
    const current = loadPolls();
    const target = current[market];
    const newCount = {
      bullish: type === 'bull' ? target.bullish + 1 : target.bullish,
      bearish: type === 'bear' ? target.bearish + 1 : target.bearish,
      total: target.total + 1
    };
    const updated = { ...current, [market]: newCount };
    savePolls(updated);
    notifyPolls(updated);
    return updated;
  },

  postComment: async (nickname: string, content: string, parentId?: string): Promise<Comment> => {
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

    let updatedComments: Comment[];
    if (!parentId) {
        updatedComments = [newC, ...allComments];
    } else {
        const addReply = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === parentId) {
                    return { ...c, replies: [...c.replies, newC] };
                }
                return { ...c, replies: addReply(c.replies) };
            });
        };
        updatedComments = addReply(allComments);
    }
    saveComments(updatedComments);
    notifyComments(updatedComments);
    return newC;
  },

  voteComment: async (commentId: string, type: 'like' | 'dislike'): Promise<void> => {
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
    const updated = updateVotes(allComments);
    saveComments(updated);
    notifyComments(updated);
  },
  
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => [],
  submitPrediction: async (nickname: string, prediction: number): Promise<void> => {}
};
