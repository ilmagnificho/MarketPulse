import { FearGreedData, MarketPolls, Comment, SentimentLevel, LeaderboardEntry, HistoryEvent, MarketTickers, SectorPerformance, LiveActivity, SentimentTimeline } from '../types';

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
  POLLS: 'CROWD_SENSE_POLLS_V2',
  COMMENTS: 'CROWD_SENSE_COMMENTS_V2'
};

// --- INITIAL DATA (BAIT CONTENT) ---
const INITIAL_POLLS: MarketPolls = {
  nyse: { bullish: 1250, bearish: 890, total: 2140 },
  nasdaq: { bullish: 1540, bearish: 1620, total: 3160 },
};

const INITIAL_COMMENTS: Comment[] = [
  { 
    id: '1', 
    nickname: 'MarketWizard', 
    content: 'VIX crushing 14. Support at 4200 held perfectly. We squeeze to 4350 next week.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    likes: 42,
    dislikes: 3,
    replies: []
  },
  { 
    id: '2', 
    nickname: 'ThetaGang', 
    content: 'Selling iron condors here. Volatility is overpriced ahead of CPI.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes: 15,
    dislikes: 1,
    replies: []
  },
  { 
    id: '3', 
    nickname: 'BearWhale', 
    content: 'Liquidity is drying up on the bid. Smart money is distributing.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: 8,
    dislikes: 12,
    replies: []
  }
];

// --- REAL-TIME & SIMULATION STATE ---
type SubscriptionCallback<T> = (data: T) => void;
const pollSubscribers: Set<SubscriptionCallback<MarketPolls>> = new Set();
const commentSubscribers: Set<SubscriptionCallback<Comment[]>> = new Set();
const tickerSubscribers: Set<SubscriptionCallback<MarketTickers>> = new Set();
const sectorSubscribers: Set<SubscriptionCallback<SectorPerformance[]>> = new Set();
const activitySubscribers: Set<SubscriptionCallback<LiveActivity>> = new Set();

const channel = new BroadcastChannel('crowd_sense_realtime');

const BOT_NICKS = ['QuantAlgo', 'HODLer', 'JPOW_Fan', 'DeltaOne', 'Satoshi_Ghost', 'LimitOrder', 'StopLossHunter', 'MacroTourist'];
const BOT_MESSAGES = [
    "Volume spike on ES futures.",
    "Buying the dip for a scalp.",
    "Anyone watching yields? 10Y is moving.",
    "Just hit my take profit.",
    "Tech looks heavy today.",
    "Rotation into energy sector.",
    "Looking for a rejection at VWAP.",
    "Gap fill likely on open.",
    "Bid stacking up at the round number.",
    "Algo flush incoming."
];

// Current Simulation State for Tickers
let currentTickers: MarketTickers = {
  nyse: { price: 5910.50, change: 12.50, changePercent: 0.21 }, // S&P 500
  nasdaq: { price: 20950.25, change: -45.20, changePercent: -0.22 }, // Nasdaq 100
  isOpen: true,
  status: 'OPEN'
};

// Current Simulation State for Sectors
let currentSectors: SectorPerformance[] = [
  { nameKey: 'sector_tech', changePercent: 1.2, weight: 3 },
  { nameKey: 'sector_finance', changePercent: -0.5, weight: 2 },
  { nameKey: 'sector_energy', changePercent: 0.8, weight: 2 },
  { nameKey: 'sector_healthcare', changePercent: -0.2, weight: 2 },
  { nameKey: 'sector_crypto', changePercent: 3.5, weight: 1 },
  { nameKey: 'sector_consumer', changePercent: -1.1, weight: 1 },
];

// --- MARKET STATUS HELPERS ---
const getMarketStatus = (): { isOpen: boolean, status: string, reason?: string, nextOpen?: number } => {
  const now = new Date();
  
  // Convert to EST (New York Time)
  const estStr = now.toLocaleString("en-US", {timeZone: "America/New_York"});
  const estDate = new Date(estStr);
  
  const day = estDate.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = estDate.getHours();
  const minute = estDate.getMinutes();
  const totalMinutes = hour * 60 + minute;
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60;    // 4:00 PM

  // Calculate Next Open
  let nextOpenDate = new Date(estDate);
  nextOpenDate.setHours(9, 30, 0, 0);

  // If today is weekend, or if today is Friday/weekday but after open, we might need to shift days
  
  if (day === 0) { // Sunday
      nextOpenDate.setDate(estDate.getDate() + 1); // Monday
  } else if (day === 6) { // Saturday
      nextOpenDate.setDate(estDate.getDate() + 2); // Monday
  } else if (totalMinutes >= marketClose) { // Weekday After Hours
      nextOpenDate.setDate(estDate.getDate() + 1); // Tomorrow
      if (nextOpenDate.getDay() === 6) nextOpenDate.setDate(nextOpenDate.getDate() + 2); // If tomorrow is Sat, go to Mon
  } else if (totalMinutes < marketOpen) {
      // Weekday Pre-market, next open is today 9:30, which is already set in nextOpenDate
  } else {
      // Market is OPEN (or holiday)
      // If open, next open is tomorrow
      nextOpenDate.setDate(estDate.getDate() + 1);
  }

  // Convert nextOpenDate (which acts like EST) back to local/UTC timestamp logic if needed, 
  // but simpler is to use the difference relative to `estDate` and add to `now`.
  const diffMs = nextOpenDate.getTime() - estDate.getTime();
  const nextOpenTimestamp = now.getTime() + diffMs;

  // 1. Check Weekend
  if (day === 0 || day === 6) {
    return { isOpen: false, status: 'CLOSED', reason: 'WEEKEND', nextOpen: nextOpenTimestamp };
  }

  // 2. Check Trading Hours (9:30 AM - 4:00 PM EST)
  if (totalMinutes < marketOpen || totalMinutes >= marketClose) {
    return { isOpen: false, status: 'CLOSED', reason: 'AFTER_HOURS', nextOpen: nextOpenTimestamp };
  }

  // 3. Simple US Holiday Check (Fixed dates for 2024-2025 simplification)
  // Format MM/DD
  const dateKey = `${estDate.getMonth() + 1}/${estDate.getDate()}`;
  const holidays = [
    "1/1", "1/15", "2/19", "3/29", "5/27", "6/19", "7/4", "9/2", "11/28", "12/25", // 2024
    "1/1", "1/20", "2/17", "4/18", "5/26", "6/19", "7/4", "9/1", "11/27", "12/25"  // 2025
  ];
  
  if (holidays.includes(dateKey)) {
    // If holiday, next open is tomorrow (handled by weekend check if Friday, etc. but simple +1 works for mid-week)
    return { isOpen: false, status: 'CLOSED', reason: 'HOLIDAY', nextOpen: nextOpenTimestamp + (24*60*60*1000) }; 
  }

  return { isOpen: true, status: 'OPEN', nextOpen: undefined };
};

// --- DATA FETCHING HELPERS ---
const fetchRealTickerData = async (): Promise<MarketTickers> => {
    const status = getMarketStatus();
    try {
        const symbols = ['^GSPC', '^NDX'];
        const promises = symbols.map(async (sym) => {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("Fetch failed");
            const json = await res.json();
            return json.chart.result[0].meta;
        });

        const [sp500, nasdaq] = await Promise.all(promises);

        return {
            nyse: {
                price: sp500.regularMarketPrice,
                change: sp500.regularMarketPrice - sp500.chartPreviousClose,
                changePercent: ((sp500.regularMarketPrice - sp500.chartPreviousClose) / sp500.chartPreviousClose) * 100
            },
            nasdaq: {
                price: nasdaq.regularMarketPrice,
                change: nasdaq.regularMarketPrice - nasdaq.chartPreviousClose,
                changePercent: ((nasdaq.regularMarketPrice - nasdaq.chartPreviousClose) / nasdaq.chartPreviousClose) * 100
            },
            isOpen: status.isOpen,
            status: status.status,
            reason: status.reason,
            nextOpen: status.nextOpen
        };

    } catch (e) {
        return {
             ...currentTickers,
             isOpen: status.isOpen,
             status: status.status,
             reason: status.reason,
             nextOpen: status.nextOpen
        };
    }
};

// Generate plausible sector movements based on main index
const generateSectors = (mainChange: number): SectorPerformance[] => {
    const noise = () => (Math.random() * 2) - 1;
    return [
        { nameKey: 'sector_tech', changePercent: mainChange * 1.5 + noise(), weight: 3 },
        { nameKey: 'sector_finance', changePercent: mainChange * 0.8 + noise(), weight: 2 },
        { nameKey: 'sector_energy', changePercent: noise() * 1.5, weight: 2 }, // Energy often uncorrelated
        { nameKey: 'sector_healthcare', changePercent: mainChange * 0.5 + noise(), weight: 2 },
        { nameKey: 'sector_crypto', changePercent: mainChange * 2.5 + noise(), weight: 1 },
        { nameKey: 'sector_consumer', changePercent: mainChange * 0.9 + noise(), weight: 1 },
    ];
};

// Generate "Catalyst" keywords based on sentiment
const generateCatalysts = (level: SentimentLevel): string[] => {
    const common = ["#EARNINGS", "#FED_RATES", "#INFLATION"];
    if (level === SentimentLevel.ExtremeFear || level === SentimentLevel.Fear) {
        return ["#RECESSION_FEARS", "#VOLATILITY", "#OVERSOLD", ...common].sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (level === SentimentLevel.ExtremeGreed || level === SentimentLevel.Greed) {
        return ["#AI_BOOM", "#FOMO", "#ATH_BREAKOUT", ...common].sort(() => 0.5 - Math.random()).slice(0, 3);
    } else {
        return ["#CONSOLIDATION", "#RANGE_BOUND", "#WAIT_AND_SEE", ...common].sort(() => 0.5 - Math.random()).slice(0, 3);
    }
};


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

const findHistoricalMatches = (currentScore: number, historyData: any[]): HistoryEvent[] => {
    if (!Array.isArray(historyData)) return generateFallbackMatches(currentScore);
    const candidates: { date: number, score: number, diff: number }[] = [];
    const ONE_DAY = 1000 * 60 * 60 * 24;

    for (let i = historyData.length - 8; i >= 0; i--) {
        const item = historyData[i];
        if (!item || item.y === undefined) continue;
        const itemScore = Math.round(item.y);
        const diff = Math.abs(itemScore - currentScore);
        if (diff <= 5) candidates.push({ date: item.x, score: itemScore, diff: diff });
    }
    candidates.sort((a, b) => {
        if (a.diff !== b.diff) return a.diff - b.diff;
        return b.date - a.date;
    });

    const results: HistoryEvent[] = [];
    for (const candidate of candidates) {
        const isDuplicate = results.some(r => Math.abs(new Date(r.date).getTime() - candidate.date) < (ONE_DAY * 14));
        if (!isDuplicate) {
            let baseReturn = candidate.score < 25 ? 4.5 : candidate.score < 45 ? 2.2 : candidate.score > 75 ? -4.2 : candidate.score > 55 ? -1.8 : 0.8;
            const randomVar = (Math.random() * 5) - 2.5;
            results.push({
                date: new Date(candidate.date).toISOString(),
                score: candidate.score,
                subsequentReturn: parseFloat((baseReturn + randomVar).toFixed(2))
            });
        }
        if (results.length >= 5) break;
    }
    if (results.length === 0) return generateFallbackMatches(currentScore);
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const extractTimeline = (historyData: any[]): SentimentTimeline | undefined => {
    if (!Array.isArray(historyData) || historyData.length === 0) return undefined;
    
    // Helper to find data N days ago
    const findAgo = (days: number) => {
        const targetTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        // Find closest
        let closest = historyData[0];
        let minDiff = Math.abs(historyData[0].x - targetTime);
        
        for(const item of historyData) {
            const diff = Math.abs(item.x - targetTime);
            if(diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        }
        return Math.round(closest.y);
    };

    return {
        previousClose: Math.round(historyData[historyData.length - 1].y), // Assuming last item is latest
        oneWeekAgo: findAgo(7),
        oneMonthAgo: findAgo(30),
        oneYearAgo: findAgo(365)
    };
};

const generateFallbackMatches = (score: number): HistoryEvent[] => {
    const matches: HistoryEvent[] = [];
    const count = 5;
    for (let i = 1; i <= count; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (i * 3));
        d.setDate(d.getDate() + Math.floor(Math.random() * 10));
        let ret = score < 30 ? 5 + Math.random() * 5 : score > 70 ? -4 - Math.random() * 4 : (Math.random() * 6) - 3;
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

const notifyTickers = (data: MarketTickers) => {
  tickerSubscribers.forEach(cb => cb(data));
};

const notifySectors = (data: SectorPerformance[]) => {
    sectorSubscribers.forEach(cb => cb(data));
};

const notifyActivity = (data: LiveActivity) => {
    activitySubscribers.forEach(cb => cb(data));
}

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

    // Simulate Poll Votes & Activity
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
            
            // Push Activity
            notifyActivity({
                id: Math.random().toString(36),
                messageKey: 'activity_voted',
                params: { market: market.toUpperCase(), type: type === 'bull' ? 'BULL' : 'BEAR' },
                type: 'vote',
                timestamp: Date.now()
            });
        }
    }, 4000);

    // Simulate Comments & Activity (Slowed down to 45s to allow user posts to shine)
    setInterval(() => {
        if (Math.random() > 0.6) {
            const current = loadComments();
            const botNick = BOT_NICKS[Math.floor(Math.random() * BOT_NICKS.length)];
            const newMsg: Comment = {
                id: Math.random().toString(36).substr(2, 9),
                nickname: botNick,
                content: BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
                timestamp: new Date().toISOString(),
                likes: Math.floor(Math.random() * 5),
                dislikes: 0,
                replies: []
            };
            // Increased slice to 100 to keep more user history
            const updated = [newMsg, ...current].slice(0, 100);
            saveComments(updated);
            notifyComments(updated);
            
            // Push Activity
            notifyActivity({
                id: Math.random().toString(36),
                messageKey: 'activity_commented',
                params: { user: botNick },
                type: 'comment',
                timestamp: Date.now()
            });
        }
    }, 45000);

    // Initial Ticker & Sector Fetch
    fetchRealTickerData().then(data => {
        currentTickers = data;
        notifyTickers(currentTickers);
        currentSectors = generateSectors(currentTickers.nasdaq.changePercent);
        notifySectors(currentSectors);
    });

    // Ticker Polling
    setInterval(async () => {
        const marketStatus = getMarketStatus();
        const realData = await fetchRealTickerData();
        currentTickers = realData;
        notifyTickers(currentTickers);
        
        // Update sectors slightly based on ticker moves
        if (marketStatus.isOpen) {
            currentSectors = generateSectors(currentTickers.nasdaq.changePercent);
            notifySectors(currentSectors);
        }
    }, 10000);
};

// Helper to safely race promises
const raceSuccess = <T>(promises: Promise<T>[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    let failureCount = 0;
    promises.forEach((p) => {
      p.then(resolve).catch(() => {
        failureCount++;
        if (failureCount === promises.length) {
          reject(new Error("All fetch attempts failed"));
        }
      });
    });
  });
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
      cnnData = await raceSuccess([
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
      const level = rating ? parseSentimentLevel(rating) : getLevelFromValue(score);
      const timeline = extractTimeline(cnnData.fear_and_greed.historical?.data);

      return {
        value: score,
        level: level,
        timestamp: cnnData.fear_and_greed.timestamp || new Date().toISOString(),
        pastMatches: findHistoricalMatches(score, cnnData.fear_and_greed.historical?.data),
        catalysts: generateCatalysts(level),
        timeline: timeline || {
            previousClose: score + (Math.random() > 0.5 ? 2 : -2),
            oneWeekAgo: score + (Math.random() > 0.5 ? 5 : -5),
            oneMonthAgo: score + (Math.random() > 0.5 ? 10 : -10),
            oneYearAgo: score + (Math.random() > 0.5 ? 15 : -15),
        }
      };
    }

    const fallbackScore = Math.floor(Math.random() * 40) + 20; 
    const level = getLevelFromValue(fallbackScore);
    
    // Ensure timeline exists in fallback
    return {
      value: fallbackScore,
      level: level,
      timestamp: new Date().toISOString(),
      pastMatches: generateFallbackMatches(fallbackScore),
      catalysts: generateCatalysts(level),
      timeline: {
         previousClose: fallbackScore + (Math.random() > 0.5 ? 2 : -2),
         oneWeekAgo: fallbackScore + (Math.random() > 0.5 ? 5 : -5),
         oneMonthAgo: fallbackScore + (Math.random() > 0.5 ? 10 : -10),
         oneYearAgo: fallbackScore + (Math.random() > 0.5 ? 15 : -15),
      }
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

  subscribeToTicker: (cb: SubscriptionCallback<MarketTickers>) => {
      tickerSubscribers.add(cb);
      cb(currentTickers);
      startSimulation();
      return () => tickerSubscribers.delete(cb);
  },

  subscribeToSectors: (cb: SubscriptionCallback<SectorPerformance[]>) => {
      sectorSubscribers.add(cb);
      cb(currentSectors);
      return () => sectorSubscribers.delete(cb);
  },

  subscribeToActivity: (cb: SubscriptionCallback<LiveActivity>) => {
      activitySubscribers.add(cb);
      return () => activitySubscribers.delete(cb);
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
    
    notifyActivity({
        id: Math.random().toString(36),
        messageKey: 'activity_voted',
        params: { market: market.toUpperCase(), type: type === 'bull' ? 'BULL' : 'BEAR' },
        type: 'vote',
        timestamp: Date.now()
    });
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
        updatedComments = [newC, ...allComments].slice(0, 100); // Keep limit consistent
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

    notifyActivity({
        id: Math.random().toString(36),
        messageKey: 'activity_commented',
        params: { user: nickname },
        type: 'comment',
        timestamp: Date.now()
    });
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