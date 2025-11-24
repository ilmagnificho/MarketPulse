
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/mockSupabase';
import { MarketPolls, SinglePollResult, Comment, MarketTicker, MarketTickers, SectorPerformance, LiveActivity } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const getNextTradingFriday = (locale: string) => {
  const d = new Date();
  const day = d.getDay();
  const diff = 5 - day;
  if (day > 5) d.setDate(d.getDate() + 6);
  else if (day === 0) d.setDate(d.getDate() + 5);
  else d.setDate(d.getDate() + diff);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { month: 'short', day: 'numeric' });
};

// --- LIVE ACTIVITY TICKER ---
const ActivityTicker: React.FC<{ activity: LiveActivity | null }> = ({ activity }) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState<string>('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (activity) {
      let msg = t(activity.messageKey);
      if (activity.params) {
        Object.entries(activity.params).forEach(([k, v]) => {
          msg = msg.replace(`{${k}}`, v);
        });
      }
      setMessage(msg);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [activity, t]);

  return (
    <div className="h-6 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 overflow-hidden relative">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t('status_open')}</span>
      </div>
      <div className="flex-1 ml-4 overflow-hidden">
        {message && (
          <div className={`text-[10px] font-mono text-emerald-400 uppercase whitespace-nowrap ${animate ? 'animate-slide-in-right' : 'opacity-50'}`}>
            {message} <span className="text-zinc-600 ml-2">[{new Date().toLocaleTimeString()}]</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SECTOR HEATMAP ---
const SectorHeatmap: React.FC<{ sectors: SectorPerformance[] }> = ({ sectors }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 h-full flex flex-col">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        {t('sector_heatmap')}
      </h3>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {sectors.map((s) => {
          const isPos = s.changePercent >= 0;
          const intensity = Math.min(Math.abs(s.changePercent) * 20, 90); // Cap opacity
          // Green: hue 150, Red: hue 350
          const bgColor = isPos
            ? `hsla(150, 60%, 40%, ${0.1 + intensity / 100})`
            : `hsla(350, 60%, 40%, ${0.1 + intensity / 100})`;
          const borderColor = isPos ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';
          const textColor = isPos ? 'text-emerald-300' : 'text-rose-300';

          return (
            <div key={s.nameKey}
              className="rounded border flex flex-col items-center justify-center p-2 relative overflow-hidden group hover:scale-[1.02] transition-transform"
              style={{ backgroundColor: bgColor, borderColor: borderColor, gridColumn: s.weight > 1 ? 'span 2' : 'span 1' }}
            >
              <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-wide z-10">{t(s.nameKey)}</span>
              <span className={`text-xs font-mono font-bold ${textColor} z-10`}>
                {isPos ? '+' : ''}{s.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- COMMUNITY SENTIMENT GAUGE ---
const CommunitySentiment: React.FC<{ polls: MarketPolls | null }> = ({ polls }) => {
  const { t } = useLanguage();

  if (!polls) return null;

  // Calculate overall community sentiment
  const totalBullish = polls.nyse.bullish + polls.nasdaq.bullish;
  const totalBearish = polls.nyse.bearish + polls.nasdaq.bearish;
  const total = totalBullish + totalBearish;

  const bullishPct = total > 0 ? Math.round((totalBullish / total) * 100) : 50;
  const bearishPct = 100 - bullishPct;

  // Determine sentiment level
  let sentimentLabel = 'Neutral';
  let sentimentColor = 'text-yellow-500';
  let bgGradient = 'from-yellow-900/20';

  if (bullishPct >= 70) {
    sentimentLabel = 'Extreme Greed';
    sentimentColor = 'text-emerald-400';
    bgGradient = 'from-emerald-900/20';
  } else if (bullishPct >= 60) {
    sentimentLabel = 'Greed';
    sentimentColor = 'text-emerald-500';
    bgGradient = 'from-emerald-900/20';
  } else if (bullishPct <= 30) {
    sentimentLabel = 'Extreme Fear';
    sentimentColor = 'text-rose-400';
    bgGradient = 'from-rose-900/20';
  } else if (bullishPct <= 40) {
    sentimentLabel = 'Fear';
    sentimentColor = 'text-rose-500';
    bgGradient = 'from-rose-900/20';
  }

  return (
    <div className={`bg-zinc-950 rounded-lg border border-zinc-800 p-4 bg-gradient-to-br ${bgGradient} via-black to-black`}>
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        Community Sentiment
      </h3>

      <div className="flex items-center justify-center mb-3">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${bullishPct * 2.51} 251`}
              className={sentimentColor}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${sentimentColor}`}>{bullishPct}</span>
            <span className="text-[8px] text-zinc-500 font-mono">BULLISH</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className={`text-sm font-bold uppercase tracking-wide ${sentimentColor}`}>
          {sentimentLabel}
        </span>
        <div className="mt-2 text-[10px] text-zinc-500 font-mono">
          {total.toLocaleString()} TOTAL VOTES
        </div>
      </div>
    </div>
  );
};

// --- LEADERBOARD ---
const Leaderboard: React.FC = () => {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState<import('../types').LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setLeaders);
  }, []);

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
        Top Predictors
      </h3>

      <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
        {leaders.slice(0, 5).map((leader) => (
          <div key={leader.rank} className="flex items-center justify-between p-2 bg-zinc-900/30 rounded border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold w-5 ${leader.rank === 1 ? 'text-yellow-500' : leader.rank === 2 ? 'text-zinc-400' : leader.rank === 3 ? 'text-amber-700' : 'text-zinc-600'}`}>
                #{leader.rank}
              </span>
              <span className="text-xs font-mono text-zinc-300">{leader.nickname}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500">{leader.prediction} predictions</span>
              <span className="text-xs font-bold text-emerald-400">{leader.accuracy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply: (parentId: string, nickname: string, content: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth = 0, onReply }) => {
  const { t } = useLanguage();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyNick, setReplyNick] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const voteScore = comment.likes - comment.dislikes;

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
    } else {
      setUserVote(type);
      api.voteComment(comment.id, type === 'up' ? 'like' : 'dislike');
    }
  };

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyNick.trim() || !replyContent.trim()) return;
    onReply(comment.id, replyNick, replyContent);
    setIsReplying(false);
    setReplyNick('');
    setReplyContent('');
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'ml-3 pl-3 border-l border-zinc-800 mt-3' : 'mt-4'}`}>
      <div className="group">
        <div className="flex justify-between items-baseline mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-300 text-xs md:text-sm">{comment.nickname}</span>
            <span className="text-[10px] text-zinc-600">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-2 break-words">{comment.content}</p>

        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 select-none">
          <div className="flex items-center gap-1 bg-zinc-900/50 rounded px-1.5 py-0.5 border border-zinc-800/50">
            <button onClick={() => handleVote('up')} className={`hover:text-emerald-500 transition-colors p-0.5 ${userVote === 'up' ? 'text-emerald-500' : ''}`}>▲</button>
            <span className={`min-w-[1rem] text-center font-mono text-[10px] ${userVote === 'up' ? 'text-emerald-500' : userVote === 'down' ? 'text-rose-500' : ''}`}>{voteScore}</span>
            <button onClick={() => handleVote('down')} className={`hover:text-rose-500 transition-colors p-0.5 ${userVote === 'down' ? 'text-rose-500' : ''}`}>▼</button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-zinc-300 transition-colors uppercase text-[10px] tracking-wide">{t('reply')}</button>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={submitReply} className="mt-3 pl-2 border-l-2 border-emerald-500/50 animate-fade-in">
          <div className="space-y-2">
            <input type="text" placeholder={t('nickname_placeholder')} className="w-full bg-black border border-zinc-800 rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-none uppercase" value={replyNick} onChange={(e) => setReplyNick(e.target.value)} />
            <div className="flex gap-2">
              <input type="text" placeholder={t('comment_placeholder')} className="flex-1 bg-black border border-zinc-800 rounded-sm px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
              <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 px-4 rounded-sm text-xs text-white font-bold uppercase tracking-wide">{t('post')}</button>
            </div>
          </div>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col">
          {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />)}
        </div>
      )}
    </div>
  );
};

interface PollCardProps {
  label: string;
  marketKey: 'nyse' | 'nasdaq';
  data: SinglePollResult | undefined;
  ticker: MarketTicker | undefined;
  marketStatus: { isOpen: boolean, status: string, reason?: string };
  hasVoted: boolean;
  onVote: (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => void;
}

const PollCard: React.FC<PollCardProps> = ({ label, marketKey, data, ticker, marketStatus, hasVoted, onVote }) => {
  const { t, language } = useLanguage();
  const dateStr = getNextTradingFriday(language);

  const bullPct = data && data.total > 0 ? Math.round((data.bullish / data.total) * 100) : 50;
  const bearPct = 100 - bullPct;

  const isPositive = ticker ? ticker.change >= 0 : true;

  // Format status message
  const statusKey = marketStatus.isOpen ? 'status_open' : 'status_closed';
  const reasonKey = marketStatus.reason ? `reason_${marketStatus.reason.toLowerCase().replace(' ', '_')}` : '';
  const statusText = marketStatus.isOpen ? t(statusKey) : `${t(statusKey)}${reasonKey ? ` (${t(reasonKey)})` : ''}`;

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col h-full relative overflow-hidden group hover:border-zinc-600 transition-colors">
      <div className="p-4 border-b border-zinc-900 bg-zinc-900/20">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1 tracking-wider">{t('poll_question')}</span>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight uppercase">{t(label)}</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">{dateStr}</span>
          </div>
        </div>

        {/* LIVE TICKER */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-mono font-bold tracking-tighter ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {ticker?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(ticker?.changePercent || 0).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center relative">
        {/* Background Percentage Visual */}
        {hasVoted && (
          <div className="absolute inset-0 opacity-10 flex">
            <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${bullPct}%` }}></div>
            <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${bearPct}%` }}></div>
          </div>
        )}

        {!hasVoted ? (
          <div className="grid grid-cols-2 gap-3 z-10">
            <button onClick={() => onVote(marketKey, 'bull')} className="group/btn relative h-20 bg-emerald-950/20 border border-emerald-900/40 hover:border-emerald-500/60 hover:bg-emerald-900/40 rounded transition-all flex flex-col items-center justify-center overflow-hidden">
              <span className="text-emerald-500 font-bold text-sm mb-0.5 tracking-wide group-hover/btn:scale-110 transition-transform">{t('bullish')}</span>
              <span className="text-[10px] text-emerald-700/80 group-hover/btn:text-emerald-500 transition-colors font-mono">▲ LONG</span>
            </button>
            <button onClick={() => onVote(marketKey, 'bear')} className="group/btn relative h-20 bg-rose-950/20 border border-rose-900/40 hover:border-rose-500/60 hover:bg-rose-900/40 rounded transition-all flex flex-col items-center justify-center overflow-hidden">
              <span className="text-rose-500 font-bold text-sm mb-0.5 tracking-wide group-hover/btn:scale-110 transition-transform">{t('bearish')}</span>
              <span className="text-[10px] text-rose-700/80 group-hover/btn:text-rose-500 transition-colors font-mono">▼ SHORT</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in z-10">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 font-mono uppercase">
                <span className="text-emerald-400 drop-shadow-sm">{bullPct}% {t('bulls')}</span>
                <span className="text-rose-400 drop-shadow-sm">{bearPct}% {t('bears')}</span>
              </div>
              <div className="flex h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" style={{ width: `${bullPct}%` }}></div>
                <div className="bg-rose-500 h-full shadow-[0_0_10px_#f43f5e]" style={{ width: `${bearPct}%` }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">{t('votes')}: <span className="text-zinc-300">{data?.total.toLocaleString()}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TheCrowd: React.FC = () => {
  const { t } = useLanguage();
  const [polls, setPolls] = useState<MarketPolls | null>(null);
  const [tickers, setTickers] = useState<MarketTickers | null>(null);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [activity, setActivity] = useState<LiveActivity | null>(null);
  const [userVotes, setUserVotes] = useState<{ nyse: boolean, nasdaq: boolean }>({ nyse: false, nasdaq: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubPolls = api.subscribeToPolls((data) => setPolls(data));
    const unsubComments = api.subscribeToComments((data) => setComments(data));
    const unsubTickers = api.subscribeToTicker((data) => setTickers(data));
    const unsubSectors = api.subscribeToSectors((data) => setSectors(data));
    const unsubActivity = api.subscribeToActivity((data) => setActivity(data));

    return () => {
      unsubPolls();
      unsubComments();
      unsubTickers();
      unsubSectors();
      unsubActivity();
    };
  }, []);

  const handleVote = async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => {
    if (userVotes[market]) return;
    setUserVotes(prev => ({ ...prev, [market]: true }));
    await api.votePoll(market, type);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !newComment.trim()) return;
    setSubmitting(true);
    await api.postComment(nickname, newComment);
    setNewComment('');
    setSubmitting(false);
  };

  const handleReply = async (parentId: string, nick: string, content: string) => {
    await api.postComment(nick, content, parentId);
  };

  const marketStatus = tickers ? { isOpen: tickers.isOpen, status: tickers.status, reason: tickers.reason } : { isOpen: false, status: 'CLOSED', reason: 'LOADING' };

  return (
    <div className="space-y-6 w-full">

      {/* 1. Live Activity Bar */}
      <div className="rounded border border-zinc-800 overflow-hidden">
        <ActivityTicker activity={activity} />
      </div>

      {/* 2. Main Grid: Polls & Sector Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PollCard
            label="nyse_label"
            marketKey="nyse"
            data={polls?.nyse}
            ticker={tickers?.nyse}
            marketStatus={marketStatus}
            hasVoted={userVotes.nyse}
            onVote={handleVote}
          />
          <PollCard
            label="nasdaq_label"
            marketKey="nasdaq"
            data={polls?.nasdaq}
            ticker={tickers?.nasdaq}
            marketStatus={marketStatus}
            hasVoted={userVotes.nasdaq}
            onVote={handleVote}
          />
        </div>
        <div className="h-64 md:h-auto">
          <SectorHeatmap sectors={sectors} />
        </div>
      </div>

      {/* 2.5. Community Insights: Sentiment & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CommunitySentiment polls={polls} />
        <Leaderboard />
      </div>

      {/* 3. Discussion Pit */}
      <div className="bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col h-[500px] shadow-lg overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex items-center justify-between backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
              {t('the_pit')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{comments.length} MESSAGES</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/50">
          {comments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-700 font-mono text-xs uppercase tracking-widest">{t('no_chatter')}</div>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} onReply={handleReply} />)
          )}
        </div>

        <div className="p-3 bg-zinc-900/30 border-t border-zinc-800">
          <form onSubmit={handlePostComment} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('nickname_placeholder')}
                className="w-1/3 bg-black border border-zinc-800 rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-none uppercase transition-colors placeholder:text-zinc-700"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
              />
              <button
                disabled={submitting}
                className="flex-1 bg-emerald-900/10 hover:bg-emerald-900/30 text-emerald-500 border border-emerald-900/20 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 hover:text-emerald-400 hover:border-emerald-500/50"
              >
                {submitting ? '...' : t('post')}
              </button>
            </div>
            <input
              type="text"
              placeholder={t('comment_placeholder')}
              className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition-colors placeholder:text-zinc-700"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default TheCrowd;
