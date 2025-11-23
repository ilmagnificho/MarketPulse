import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { MarketPolls, SinglePollResult, Comment, MarketTicker, MarketTickers } from '../types';
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
              <span className="text-xs text-zinc-500">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-2 break-words">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 select-none">
          <div className="flex items-center gap-1">
            <button onClick={() => handleVote('up')} className={`hover:text-emerald-500 transition-colors p-1 ${userVote === 'up' ? 'text-emerald-500' : ''}`}>▲</button>
            <span className={`min-w-[1rem] text-center font-mono ${userVote === 'up' ? 'text-emerald-500' : userVote === 'down' ? 'text-rose-500' : ''}`}>{voteScore}</span>
            <button onClick={() => handleVote('down')} className={`hover:text-rose-500 transition-colors p-1 ${userVote === 'down' ? 'text-rose-500' : ''}`}>▼</button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-zinc-300 transition-colors uppercase text-[11px] tracking-wide">{t('reply')}</button>
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
  hasVoted: boolean;
  onVote: (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => void;
}

const PollCard: React.FC<PollCardProps> = ({ label, marketKey, data, ticker, hasVoted, onVote }) => {
  const { t, language } = useLanguage();
  const dateStr = getNextTradingFriday(language);
  
  const bullPct = data && data.total > 0 ? Math.round((data.bullish / data.total) * 100) : 50;
  const bearPct = 100 - bullPct;

  const isPositive = ticker ? ticker.change >= 0 : true;

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col h-full relative overflow-hidden hover:border-zinc-700 transition-colors">
       <div className="p-4 border-b border-zinc-900">
          <div className="flex items-start justify-between mb-2">
            <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block mb-1">{t('poll_question')}</span>
                <h3 className="text-base font-bold text-zinc-100 tracking-tight uppercase">{t(label)}</h3>
            </div>
            <div className="text-right">
                 <span className="text-[10px] md:text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{dateStr}</span>
            </div>
          </div>
          
          {/* LIVE TICKER */}
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-baseline gap-2">
                <span className={`text-xl md:text-2xl font-mono font-bold tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ticker?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
             </div>
             <div className={`flex items-center gap-1 text-xs font-mono font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(ticker?.change || 0).toFixed(2)}</span>
                <span>({Math.abs(ticker?.changePercent || 0).toFixed(2)}%)</span>
             </div>
             <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">LIVE</span>
             </div>
          </div>
       </div>

       <div className="p-4 flex-1 flex flex-col justify-center">
       {!hasVoted ? (
         <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onVote(marketKey, 'bull')} className="group relative h-24 bg-emerald-950/20 border border-emerald-900/40 hover:border-emerald-500/50 hover:bg-emerald-900/30 rounded transition-all flex flex-col items-center justify-center">
              <span className="text-emerald-500 font-bold text-base mb-1 tracking-wide">{t('bullish')}</span>
              <span className="text-xs text-emerald-700/80 group-hover:text-emerald-500 transition-colors font-mono">▲ UPSIDE</span>
            </button>
            <button onClick={() => onVote(marketKey, 'bear')} className="group relative h-24 bg-rose-950/20 border border-rose-900/40 hover:border-rose-500/50 hover:bg-rose-900/30 rounded transition-all flex flex-col items-center justify-center">
              <span className="text-rose-500 font-bold text-base mb-1 tracking-wide">{t('bearish')}</span>
              <span className="text-xs text-rose-700/80 group-hover:text-rose-500 transition-colors font-mono">▼ DOWNSIDE</span>
            </button>
         </div>
       ) : (
         <div className="space-y-3 animate-fade-in">
            <div>
                <div className="flex justify-between text-sm font-bold mb-2 font-mono">
                    <span className="text-emerald-500">{t('bulls')} {bullPct}%</span>
                    <span className="text-rose-500">{t('bears')} {bearPct}%</span>
                </div>
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800">
                    <div className="bg-emerald-500 h-full transition-all duration-500 relative" style={{ width: `${bullPct}%` }}></div>
                    <div className="bg-rose-500 h-full transition-all duration-500 relative" style={{ width: `${bearPct}%` }}></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                 <span className="text-xs font-mono text-zinc-500 uppercase tracking-wide">{t('votes')}: <span className="text-zinc-300">{data?.total.toLocaleString()}</span></span>
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.4)]"></div>
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.4)]"></div>
                 </div>
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
  const [userVotes, setUserVotes] = useState<{nyse: boolean, nasdaq: boolean}>({ nyse: false, nasdaq: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubPolls = api.subscribeToPolls((data) => setPolls(data));
    const unsubComments = api.subscribeToComments((data) => setComments(data));
    const unsubTickers = api.subscribeToTicker((data) => setTickers(data));
    return () => {
        unsubPolls();
        unsubComments();
        unsubTickers();
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

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <PollCard 
            label="nyse_label" 
            marketKey="nyse" 
            data={polls?.nyse} 
            ticker={tickers?.nyse}
            hasVoted={userVotes.nyse} 
            onVote={handleVote} 
         />
         <PollCard 
            label="nasdaq_label" 
            marketKey="nasdaq" 
            data={polls?.nasdaq} 
            ticker={tickers?.nasdaq}
            hasVoted={userVotes.nasdaq} 
            onVote={handleVote} 
         />
      </div>

      {/* Discussion Pit */}
      <div className="bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col h-[600px] shadow-2xl overflow-hidden">
        <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex items-center justify-between backdrop-blur">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">
                   {t('the_pit')}
                </h3>
             </div>
             <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
             </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-black">
          {comments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-700 font-mono text-xs uppercase tracking-widest">{t('no_chatter')}</div>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} onReply={handleReply} />)
          )}
        </div>

        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
            <form onSubmit={handlePostComment} className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder={t('nickname_placeholder')} 
                        className="w-1/3 bg-black border border-zinc-800 rounded-sm px-3 py-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none uppercase transition-colors placeholder:text-zinc-700" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        maxLength={12} 
                    />
                    <button 
                        disabled={submitting} 
                        className="flex-1 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-500 border border-emerald-900/40 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 hover:text-emerald-400"
                    >
                        {submitting ? '...' : t('post')}
                    </button>
                </div>
                <input 
                    type="text" 
                    placeholder={t('comment_placeholder')} 
                    className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-colors placeholder:text-zinc-700" 
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