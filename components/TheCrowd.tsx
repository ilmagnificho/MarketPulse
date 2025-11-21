
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { MarketPolls, SinglePollResult, Comment } from '../types';
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
  const [voteScore, setVoteScore] = useState(comment.likes - comment.dislikes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyNick, setReplyNick] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      setVoteScore(comment.likes - comment.dislikes);
    } else {
      const diff = type === 'up' ? 1 : -1;
      const correction = userVote ? (userVote === 'up' ? -1 : 1) : 0;
      setVoteScore(comment.likes - comment.dislikes + diff + correction);
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
    <div className={`flex flex-col ${depth > 0 ? 'ml-3 pl-3 border-l border-slate-700 mt-3' : 'mt-4'}`}>
      <div className="bg-black/40 p-4 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono font-bold text-cyan-400 text-sm tracking-wide">{comment.nickname}</span>
          <span className="text-[10px] font-mono text-slate-600">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3 font-medium">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 select-none">
          <div className="flex items-center gap-1 bg-slate-900/80 rounded px-2 py-1 border border-slate-800">
            <button onClick={() => handleVote('up')} className={`hover:text-orange-500 transition-colors ${userVote === 'up' ? 'text-orange-500' : ''}`}>▲</button>
            <span className={`min-w-[1.5rem] text-center ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-slate-400'}`}>{voteScore}</span>
            <button onClick={() => handleVote('down')} className={`hover:text-blue-500 transition-colors ${userVote === 'down' ? 'text-blue-500' : ''}`}>▼</button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-cyan-400 flex items-center gap-1 transition-colors">💬 {t('reply')}</button>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={submitReply} className="mt-2 ml-2 p-3 bg-slate-900/80 rounded border border-slate-700 animate-fade-in">
          <div className="space-y-2">
             <input type="text" placeholder={t('nickname_placeholder')} className="w-full bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 outline-none" value={replyNick} onChange={(e) => setReplyNick(e.target.value)} />
            <div className="flex gap-2">
              <input type="text" placeholder={t('comment_placeholder')} className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
              <button type="submit" className="bg-cyan-700 hover:bg-cyan-600 px-3 rounded text-xs text-white font-bold uppercase tracking-wider">{t('post')}</button>
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
  hasVoted: boolean;
  onVote: (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => void;
}

const PollCard: React.FC<PollCardProps> = ({ label, marketKey, data, hasVoted, onVote }) => {
  const { t, language } = useLanguage();
  const dateStr = getNextTradingFriday(language);
  
  const bullPct = data ? Math.round((data.bullish / data.total) * 100) : 50;
  const bearPct = 100 - bullPct;

  return (
    <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 flex flex-col h-full relative overflow-hidden group">
       <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 to-transparent pointer-events-none"></div>
       
       <div className="mb-6 relative z-10">
          <h3 className="text-lg font-black text-slate-100 flex items-center justify-between tracking-tight uppercase">
            {t(label)}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase">{t('poll_question')}</span>
              <span className="text-xs text-cyan-400 font-bold">{dateStr}</span>
            </div>
          </h3>
       </div>

       {!hasVoted ? (
         <div className="flex gap-4 flex-1 items-center relative z-10">
            <button onClick={() => onVote(marketKey, 'bull')} className="flex-1 h-24 rounded-lg bg-gradient-to-br from-green-900/40 to-slate-900 hover:from-green-800/60 border border-green-800/30 hover:border-green-500 transition-all flex flex-col items-center justify-center group/btn">
              <span className="text-3xl group-hover/btn:-translate-y-1 transition-transform duration-300">🐂</span>
              <span className="font-black text-green-100 text-xs mt-2 tracking-widest">{t('bullish')}</span>
            </button>
            <button onClick={() => onVote(marketKey, 'bear')} className="flex-1 h-24 rounded-lg bg-gradient-to-br from-red-900/40 to-slate-900 hover:from-red-800/60 border border-red-800/30 hover:border-red-500 transition-all flex flex-col items-center justify-center group/btn">
              <span className="text-3xl group-hover/btn:translate-y-1 transition-transform duration-300">🐻</span>
              <span className="font-black text-red-100 text-xs mt-2 tracking-widest">{t('bearish')}</span>
            </button>
         </div>
       ) : (
         <div className="flex flex-col flex-1 justify-center space-y-4 animate-fade-in relative z-10">
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                 <span className="text-green-400 drop-shadow-md">{bullPct}% {t('bulls')}</span>
                 <span className="text-red-400 drop-shadow-md">{bearPct}% {t('bears')}</span>
               </div>
               <div className="h-6 bg-black rounded-sm overflow-hidden flex relative border border-slate-700">
                 <div className="bg-gradient-to-r from-green-700 to-green-500 h-full transition-all duration-1000 relative" style={{ width: `${bullPct}%` }}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 </div>
                 <div className="bg-gradient-to-l from-red-700 to-red-500 h-full transition-all duration-1000 relative" style={{ width: `${bearPct}%` }}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 </div>
                 <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black z-10"></div>
               </div>
               <p className="text-center text-[10px] font-mono text-slate-500">{data?.total.toLocaleString()} {t('votes')}</p>
            </div>
         </div>
       )}
    </div>
  );
};

const TheCrowd: React.FC = () => {
  const { t } = useLanguage();
  const [polls, setPolls] = useState<MarketPolls | null>(null);
  const [userVotes, setUserVotes] = useState<{nyse: boolean, nasdaq: boolean}>({ nyse: false, nasdaq: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [pResult, cResult] = await Promise.all([api.getPollResults(), api.getComments()]);
      setPolls(pResult);
      setComments(cResult);
    };
    init();
  }, []);

  const handleVote = async (market: 'nyse' | 'nasdaq', type: 'bull' | 'bear') => {
    if (userVotes[market]) return;
    setUserVotes(prev => ({ ...prev, [market]: true }));
    const newResults = await api.votePoll(market, type);
    setPolls(newResults);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !newComment.trim()) return;
    setSubmitting(true);
    const posted = await api.postComment(nickname, newComment);
    setComments(prev => [posted, ...prev]);
    setNewComment('');
    setSubmitting(false);
  };

  const handleReply = async (parentId: string, nick: string, content: string) => {
    const reply = await api.postComment(nick, content, parentId);
    const insertReply = (list: Comment[]): Comment[] => list.map(c => c.id === parentId ? { ...c, replies: [...c.replies, reply] } : { ...c, replies: insertReply(c.replies) });
    setComments(prev => insertReply(prev));
  };

  return (
    <div className="space-y-8 w-full">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <PollCard label="nyse_label" marketKey="nyse" data={polls?.nyse} hasVoted={userVotes.nyse} onVote={handleVote} />
         <PollCard label="nasdaq_label" marketKey="nasdaq" data={polls?.nasdaq} hasVoted={userVotes.nasdaq} onVote={handleVote} />
      </div>

      <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl border border-slate-800 flex flex-col h-[700px]">
        <div className="bg-slate-950 p-4 rounded-t-xl border-b border-slate-800 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="text-green-500 animate-pulse">●</span> {t('the_pit')}
            </h3>
            <span className="text-[10px] font-mono text-slate-600 border border-slate-800 px-2 py-1 rounded">ENCRYPTED CHANNEL</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20">
          {comments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-700 font-mono text-sm animate-pulse">{t('no_chatter')}</div>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} onReply={handleReply} />)
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 rounded-b-xl">
            <form onSubmit={handlePostComment} className="space-y-3">
            <input type="text" placeholder={t('nickname_placeholder')} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={15} />
            <div className="flex gap-2">
                <input type="text" placeholder={t('comment_placeholder')} className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button disabled={submitting} className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? '...' : t('post')}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default TheCrowd;
