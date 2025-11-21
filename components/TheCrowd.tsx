
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { MarketPolls, SinglePollResult, Comment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- Helpers ---
const getNextTradingFriday = (locale: string) => {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri
  // Calculate days until next Friday (5)
  // If today is Friday (5), we show *next* Friday? Or today?
  // Assumption: If today is Friday after market close, show next Friday.
  // For simplicity: Show current week's Friday if today <= Friday, else next week.
  const diff = 5 - day; 
  
  if (day > 5) { // Saturday
     d.setDate(d.getDate() + 6); 
  } else if (day === 0) { // Sunday
     d.setDate(d.getDate() + 5);
  } else {
     d.setDate(d.getDate() + diff);
  }
  
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { month: 'short', day: 'numeric' });
};

// --- Recursive Comment Component ---
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
    <div className={`flex flex-col ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-700 mt-3' : 'mt-4'}`}>
      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-bold text-blue-400 text-sm">{comment.nickname}</span>
          <span className="text-xs text-slate-500">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <p className="text-slate-300 text-sm leading-snug mb-2">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 select-none">
          <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
            <button onClick={() => handleVote('up')} className={`hover:text-orange-500 ${userVote === 'up' ? 'text-orange-500' : ''}`}>▲</button>
            <span className={`min-w-[1rem] text-center ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-slate-400'}`}>{voteScore}</span>
            <button onClick={() => handleVote('down')} className={`hover:text-blue-500 ${userVote === 'down' ? 'text-blue-500' : ''}`}>▼</button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-slate-300 flex items-center gap-1">💬 {t('reply')}</button>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={submitReply} className="mt-2 ml-2 p-3 bg-slate-800 rounded border border-slate-600">
          <div className="space-y-2">
             <input type="text" placeholder={t('nickname_placeholder')} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white" value={replyNick} onChange={(e) => setReplyNick(e.target.value)} />
            <div className="flex gap-2">
              <input type="text" placeholder={t('comment_placeholder')} className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
              <button type="submit" className="bg-blue-600 px-3 rounded text-xs text-white font-bold">{t('post')}</button>
              <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-slate-400 underline">{t('cancel')}</button>
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

// --- Poll Component ---
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
    <div className="bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 flex flex-col h-full">
       <div className="mb-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between">
            {t(label)}
            <span className="text-xs font-normal text-slate-400 px-2 py-1 bg-slate-900 rounded border border-slate-700">
               {t('poll_question')} <span className="text-indigo-400 font-bold">{dateStr}</span>
            </span>
          </h3>
       </div>

       {!hasVoted ? (
         <div className="flex gap-3 flex-1 items-center">
            <button onClick={() => onVote(marketKey, 'bull')} className="flex-1 h-20 rounded-xl bg-green-600/20 hover:bg-green-600 border border-green-600/50 hover:border-green-500 transition-all flex flex-col items-center justify-center group">
              <span className="text-2xl group-hover:-translate-y-1 transition-transform">🚀</span>
              <span className="font-bold text-green-100 text-sm">{t('bullish')}</span>
            </button>
            <button onClick={() => onVote(marketKey, 'bear')} className="flex-1 h-20 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-600/50 hover:border-red-500 transition-all flex flex-col items-center justify-center group">
              <span className="text-2xl group-hover:translate-y-1 transition-transform">🐻</span>
              <span className="font-bold text-red-100 text-sm">{t('bearish')}</span>
            </button>
         </div>
       ) : (
         <div className="flex flex-col flex-1 justify-center space-y-4 animate-fade-in">
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                 <span className="text-green-400">{t('bulls')} {bullPct}%</span>
                 <span className="text-red-400">{bearPct}% {t('bears')}</span>
               </div>
               <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex relative">
                 <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${bullPct}%` }}></div>
                 <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${bearPct}%` }}></div>
                 {/* Center line */}
                 <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-900/50"></div>
               </div>
               <p className="text-center text-xs text-slate-500">{data?.total} {t('votes')}</p>
            </div>
         </div>
       )}
    </div>
  );
};

const TheCrowd: React.FC = () => {
  const { t } = useLanguage();
  const [polls, setPolls] = useState<MarketPolls | null>(null);
  // Track votes separately for NYSE and NASDAQ
  const [userVotes, setUserVotes] = useState<{nyse: boolean, nasdaq: boolean}>({ nyse: false, nasdaq: false });
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
    setSubmittingComment(true);
    const posted = await api.postComment(nickname, newComment);
    setComments(prev => [posted, ...prev]);
    setNewComment('');
    setSubmittingComment(false);
  };

  const handleReply = async (parentId: string, nick: string, content: string) => {
    const reply = await api.postComment(nick, content, parentId);
    const insertReply = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === parentId) return { ...c, replies: [...c.replies, reply] };
        else if (c.replies.length > 0) return { ...c, replies: insertReply(c.replies) };
        return c;
      });
    };
    setComments(prev => insertReply(prev));
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* SECTION B-1: Polls Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <PollCard 
            label="nyse_label" 
            marketKey="nyse" 
            data={polls?.nyse} 
            hasVoted={userVotes.nyse} 
            onVote={handleVote} 
         />
         <PollCard 
            label="nasdaq_label" 
            marketKey="nasdaq" 
            data={polls?.nasdaq} 
            hasVoted={userVotes.nasdaq} 
            onVote={handleVote} 
         />
      </div>

      {/* SECTION B-2: Shared Live Discussion */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 flex flex-col h-[600px]">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4 shrink-0">
          <span>💬</span> {t('the_pit')} <span className="text-xs font-normal text-green-400 bg-green-900/30 border border-green-700/50 px-2 py-1 rounded ml-auto flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {t('live')}</span>
        </h3>
        
        <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center text-slate-600 py-12">{t('no_chatter')}</div>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} onReply={handleReply} />)
          )}
        </div>

        <form onSubmit={handlePostComment} className="space-y-2 border-t border-slate-700 pt-4 shrink-0">
          <input type="text" placeholder={t('nickname_placeholder')} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} />
          <div className="flex gap-2">
            <input type="text" placeholder={t('comment_placeholder')} className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button disabled={submittingComment} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50">
              {submittingComment ? '...' : t('post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TheCrowd;
