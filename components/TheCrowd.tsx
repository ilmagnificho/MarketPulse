
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/mockSupabase';
import { MarketPolls, SinglePollResult, Comment, MarketTicker, MarketTickers } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Helper interface for market status passed to PollCard
interface MarketStatus {
  isOpen: boolean;
  status: string;
  reason?: string;
  nextOpen?: number;
}

const PollCard: React.FC<{ 
    label: string, 
    data: SinglePollResult | undefined, 
    ticker: MarketTicker | undefined,
    marketStatus: MarketStatus | undefined, // New prop for status metadata
    hasVoted: boolean,
    onVote: (type: 'bull' | 'bear') => void
}> = ({ label, data, ticker, marketStatus, hasVoted, onVote }) => {
    const { t } = useLanguage();
    const bullPct = data && data.total > 0 ? Math.round((data.bullish / data.total) * 100) : 50;
    const bearPct = 100 - bullPct;
    const isUp = ticker ? ticker.change >= 0 : true;

    // Market Status & Countdown Logic
    const isMarketOpen = marketStatus?.isOpen;
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!marketStatus?.nextOpen || isMarketOpen) {
            setTimeLeft('');
            return;
        }
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = (marketStatus.nextOpen || 0) - now;
            if (diff <= 0) {
                setTimeLeft('');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}${t('time_h')} ${minutes}${t('time_m')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [marketStatus?.nextOpen, isMarketOpen, t]);

    const statusText = isMarketOpen ? t('status_open') : t('status_closed');
    const reasonText = !isMarketOpen && marketStatus?.reason ? ` • ${t('reason_' + marketStatus.reason.toLowerCase())}` : '';
    const countdownText = !isMarketOpen && timeLeft ? ` • ${t('opens_in')} ${timeLeft}` : '';

    return (
        <div className="app-card p-6 mb-6 group relative overflow-hidden">
             {/* Neon Border Gradient on Hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-white/20 rounded-[1.5rem] transition-colors pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">{t(label)}</h3>
                    <div className="flex flex-col mt-1">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                            {label.includes('nyse') ? t('spx_index') : t('ndx_index')}
                        </span>
                    </div>
                </div>
                
                {/* Right Side: Status Badge & Price */}
                <div className="flex flex-col items-end">
                    {/* Status Badge */}
                    <div className={`mb-2 flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${isMarketOpen ? 'bg-neon-green/10 border-neon-green/20 text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-gray-700/40 border-gray-600/30 text-gray-300'}`}>
                         {isMarketOpen ? (
                             <>
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
                                {statusText}
                             </>
                         ) : (
                             <span>{statusText}{reasonText}{countdownText}</span>
                         )}
                    </div>

                    <div className="text-xl font-mono font-bold text-white text-glow">
                        ${ticker?.price.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div className={`text-sm font-bold flex items-center justify-end gap-1 ${isUp ? 'text-neon-green' : 'text-neon-red'}`}>
                        {isUp ? '▲' : '▼'} {Math.abs(ticker?.changePercent || 0).toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {!hasVoted ? (
                <div className="flex gap-4">
                    <button 
                        onClick={() => onVote('bull')}
                        className="flex-1 btn-action btn-neon-primary text-white relative group/btn h-14 rounded-xl flex items-center justify-center"
                    >
                        <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                            {t('bullish')} 
                            {/* UP Arrow Icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        </span>
                        <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    </button>
                    <button 
                        onClick={() => onVote('bear')}
                        className="flex-1 btn-action btn-neon-secondary text-gray-300 hover:text-white h-14 rounded-xl flex items-center justify-center"
                    >
                         <span className="flex items-center gap-2 font-bold tracking-wide">
                            {t('bearish')} 
                            {/* DOWN Arrow Icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                        </span>
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in space-y-4">
                    {/* Result Bars */}
                    <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-neon-green drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">{bullPct}% {t('bulls')}</span>
                        <span className="text-neon-red drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">{bearPct}% {t('bears')}</span>
                    </div>
                    
                    <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden flex relative border border-white/5 shadow-inner">
                        <div 
                            className="h-full bg-neon-green shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-1000 ease-out relative" 
                            style={{ width: `${bullPct}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                        <div 
                            className="h-full bg-neon-red shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-1000 ease-out relative" 
                            style={{ width: `${bearPct}%` }}
                        ></div>
                    </div>

                    <p className="text-center text-xs text-gray-500 font-mono tracking-wide">
                        {t('based_on_votes').replace('{count}', data?.total.toLocaleString() || '0')}
                    </p>
                </div>
            )}
        </div>
    );
};

// Recursive Comment Thread Component
const CommentThread: React.FC<{ 
    comment: Comment, 
    onVote: (id: string, type: 'like' | 'dislike') => void, 
    onReply: (parentId: string, content: string, nick: string) => void,
    depth?: number 
}> = ({ comment, onVote, onReply, depth = 0 }) => {
    const { t } = useLanguage();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyNick, setReplyNick] = useState('');

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim() && replyNick.trim()) {
            onReply(comment.id, replyText, replyNick);
            setIsReplying(false);
            setReplyText('');
        }
    };

    return (
        <div className={`flex flex-col ${depth > 0 ? 'ml-4 border-l-2 border-white/5 pl-4 mt-2' : 'border-b border-white/5 pb-4 mb-4'}`}>
            <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-gray-400 shadow-inner">
                    {comment.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-neon-blue drop-shadow-sm">{comment.nickname}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(comment.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-light mb-2">{comment.content}</p>
                    
                    {/* Actions: Vote & Reply */}
                    <div className="flex items-center gap-4 text-gray-500 text-xs font-bold">
                        <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-0.5">
                             <button onClick={() => onVote(comment.id, 'like')} className="hover:text-neon-green transition-colors">▲</button>
                             <span className="font-mono text-[10px] min-w-[12px] text-center">{comment.likes - comment.dislikes}</span>
                             <button onClick={() => onVote(comment.id, 'dislike')} className="hover:text-neon-red transition-colors">▼</button>
                        </div>
                        <button onClick={() => setIsReplying(!isReplying)} className="hover:text-white transition-colors uppercase tracking-wider text-[10px]">{t('reply')}</button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="mt-3 flex flex-col gap-2 animate-fade-in">
                            <input 
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:border-neon-blue outline-none"
                                placeholder={t('nickname_placeholder')}
                                value={replyNick}
                                onChange={e => setReplyNick(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:border-neon-blue outline-none"
                                    placeholder={t('comment_placeholder')}
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                />
                                <button type="submit" className="bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded px-3 py-1 text-xs hover:bg-neon-blue/30">{t('post')}</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <CommentThread key={reply.id} comment={reply} onVote={onVote} onReply={onReply} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TheCrowd: React.FC = () => {
  const { t } = useLanguage();
  const [polls, setPolls] = useState<MarketPolls | null>(null);
  const [tickers, setTickers] = useState<MarketTickers | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVotes, setUserVotes] = useState<{nyse: boolean, nasdaq: boolean}>({ nyse: false, nasdaq: false });
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [sortBy, setSortBy] = useState<'hot' | 'live'>('hot');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u1 = api.subscribeToPolls(setPolls);
    const u2 = api.subscribeToComments(setComments);
    const u3 = api.subscribeToTicker(setTickers);
    return () => { u1(); u2(); u3(); };
  }, []);

  const handleVote = async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => {
    if (userVotes[market]) return;
    setUserVotes(prev => ({ ...prev, [market]: true }));
    await api.votePoll(market, type);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !newComment.trim()) return;
    await api.postComment(nickname, newComment);
    setNewComment('');
  };

  const handleReply = async (parentId: string, content: string, nick: string) => {
      await api.postComment(nick, content, parentId);
  };

  const handleCommentVote = async (id: string, type: 'like' | 'dislike') => {
      await api.voteComment(id, type);
  };

  // Sorting Logic
  const getSortedComments = () => {
      // Deep copy to avoid mutating state directly during sort
      const sortList = (list: Comment[]): Comment[] => {
          return list.map(c => ({...c, replies: sortList(c.replies)})).sort((a, b) => {
              if (sortBy === 'hot') {
                  const scoreA = a.likes - a.dislikes;
                  const scoreB = b.likes - b.dislikes;
                  return scoreB - scoreA; // Descending
              } else {
                  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Newest first
              }
          });
      };
      return sortList(comments);
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <h2 className="text-sm font-bold text-neon-green mb-4 px-2 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_#10b981]"></span>
            {t('community_pulse')}
        </h2>
        
        {/* Polls */}
        <PollCard 
            label="nyse_label" 
            data={polls?.nyse} 
            ticker={tickers?.nyse}
            marketStatus={tickers || undefined} // Pass full tickers object as status source
            hasVoted={userVotes.nyse} 
            onVote={(t) => handleVote('nyse', t)} 
        />
        <PollCard 
            label="nasdaq_label" 
            data={polls?.nasdaq} 
            ticker={tickers?.nasdaq} 
            marketStatus={tickers || undefined} // Pass full tickers object as status source
            hasVoted={userVotes.nasdaq} 
            onVote={(t) => handleVote('nasdaq', t)} 
        />

        {/* Chat / Feed */}
        <div className="app-card overflow-hidden mt-8 border-t-2 border-t-neon-blue/20">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        {t('the_pit')}
                    </h3>
                    <div className="flex bg-white/10 rounded-lg p-0.5">
                        <button 
                            onClick={() => setSortBy('hot')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${sortBy === 'hot' ? 'bg-neon-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t('sort_hot')}
                        </button>
                        <button 
                            onClick={() => setSortBy('live')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${sortBy === 'live' ? 'bg-neon-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t('sort_live')}
                        </button>
                    </div>
                </div>
                <span className="text-[10px] bg-neon-green/10 text-neon-green border border-neon-green/20 px-2 py-0.5 rounded font-bold animate-pulse-slow shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    {comments.length} ONLINE
                </span>
            </div>
            
            <div ref={chatRef} className="h-[450px] overflow-y-auto custom-scrollbar p-4 bg-gradient-to-b from-black/60 to-black/20">
                {getSortedComments().map(c => (
                    <CommentThread 
                        key={c.id} 
                        comment={c} 
                        onVote={handleCommentVote} 
                        onReply={handleReply}
                    />
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-xl">
                <form onSubmit={handlePost} className="flex flex-col gap-3">
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] outline-none transition-all font-mono"
                        placeholder={t('nickname_placeholder')}
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] outline-none transition-all"
                            placeholder={t('comment_placeholder')}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                        />
                        <button className="bg-gradient-to-br from-neon-blue to-indigo-600 w-12 rounded-xl flex items-center justify-center text-white hover:brightness-110 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/10 active:scale-95">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default TheCrowd;