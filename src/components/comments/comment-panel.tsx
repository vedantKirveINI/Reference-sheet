import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, CornerDownRight, Smile, Edit2, Trash2, X, MoreHorizontal } from 'lucide-react';
import { getComments, createComment, updateComment, deleteComment, addCommentReaction, removeCommentReaction } from '@/services/api';
import { UserAvatar } from '@/components/editors/user-avatar';

interface Comment {
  id: string;
  content: string;
  created_by: { id: string; name: string; email: string };
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  reactions: Record<string, string[]>;
  replies?: Comment[];
}

interface CommentPanelProps {
  tableId: string;
  recordId: string;
  currentUserId?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];

const timeAgo = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const CommentPanel: React.FC<CommentPanelProps> = ({
  tableId,
  recordId,
  currentUserId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [emojiPickerOpenId, setEmojiPickerOpenId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComments({ tableId, recordId, limit: 100 });
      const data = res.data?.comments || res.data || [];
      const topLevel: Comment[] = [];
      const replyMap: Record<string, Comment[]> = {};
      for (const c of data) {
        if (c.parent_id) {
          if (!replyMap[c.parent_id]) replyMap[c.parent_id] = [];
          replyMap[c.parent_id].push(c);
        } else {
          topLevel.push(c);
        }
      }
      for (const c of topLevel) {
        c.replies = replyMap[c.id] || [];
      }
      setComments(topLevel);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [tableId, recordId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    const content = newComment.trim();
    if (!content) return;
    try {
      await createComment({
        tableId,
        recordId,
        content,
        parentId: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      await fetchComments();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } catch {
    }
  };

  const handleEdit = async (commentId: string) => {
    const content = editContent.trim();
    if (!content) return;
    try {
      await updateComment({ commentId, content });
      setEditingId(null);
      setEditContent('');
      await fetchComments();
    } catch {
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch {
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    const comment = [...comments, ...comments.flatMap(c => c.replies || [])].find(c => c.id === commentId);
    const reactions = comment?.reactions || {};
    const users = reactions[emoji] || [];
    const hasReacted = currentUserId && users.includes(currentUserId);
    try {
      if (hasReacted) {
        await removeCommentReaction({ commentId, emoji });
      } else {
        await addCommentReaction({ commentId, emoji });
      }
      setEmojiPickerOpenId(null);
      await fetchComments();
    } catch {
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwn = currentUserId === comment.created_by?.id;
    const isEditing = editingId === comment.id;
    const reactions = comment.reactions || {};

    return (
      <div key={comment.id} className={`group ${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
        <div className="flex gap-2">
          <UserAvatar
            user={{ id: comment.created_by?.id, name: comment.created_by?.name, email: comment.created_by?.email }}
            size={isReply ? 24 : 28}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {comment.created_by?.name || comment.created_by?.email || 'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {timeAgo(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => setEmojiPickerOpenId(emojiPickerOpenId === comment.id ? null : comment.id)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Smile className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => { setReplyTo(comment.id); inputRef.current?.focus(); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {isOwn && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    {menuOpenId === comment.id && (
                      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[120px]">
                        <button
                          onClick={() => { setEditingId(comment.id); setEditContent(comment.content); setMenuOpenId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => { handleDelete(comment.id); setMenuOpenId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="flex-1 text-sm border rounded-md px-2 py-1 bg-background resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleEdit(comment.id)} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 bg-muted rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
            )}
            {emojiPickerOpenId === comment.id && (
              <div className="flex gap-1 mt-1 p-1 bg-popover border border-border rounded-md shadow-lg w-fit">
                {QUICK_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {Object.keys(reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(reactions).map(([emoji, users]) => {
                  const hasReacted = currentUserId && users.includes(currentUserId);
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(comment.id, emoji)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                        hasReacted
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{users.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {comment.replies?.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comments</span>
        {comments.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{comments.length}</span>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-sm">No comments yet</span>
            <span className="text-xs">Be the first to comment</span>
          </div>
        ) : (
          comments.map(c => renderComment(c))
        )}
      </div>
      <div className="border-t border-border px-4 py-3">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <CornerDownRight className="w-3 h-3" />
            <span>Replying to comment</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            className="flex-1 text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
