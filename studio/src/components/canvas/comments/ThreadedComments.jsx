import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function CommentInput({ onSubmit, placeholder = "Add a comment...", autoFocus = false }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  }, [value, onSubmit]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[60px] text-sm resize-none"
        rows={2}
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CommentItem({ comment, onEdit, onDelete, currentUserId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const isOwner = comment.userId === currentUserId;

  const handleSaveEdit = useCallback(() => {
    if (editValue.trim()) {
      onEdit(comment.id, editValue.trim());
      setIsEditing(false);
    }
  }, [comment.id, editValue, onEdit]);

  return (
    <div className="group flex gap-2 py-2">
      <Avatar className="w-7 h-7 shrink-0">
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback className="text-xs">
          {comment.userName?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {comment.userName || "Unknown"}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(comment.createdAt)}
          </span>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-opacity">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <div className="mt-1 flex gap-1">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[40px] text-sm"
              rows={2}
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(comment.content);
                }}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}

export function CommentThread({
  nodeKey,
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser,
  position,
  onClose,
}) {
  const threadComments = comments.filter((c) => c.nodeKey === nodeKey);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: 10 }}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className={cn(
            "w-80 bg-white rounded-xl shadow-2xl border border-gray-200",
            "overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm text-gray-700">
                Comments ({threadComments.length})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto px-4 py-2">
            {threadComments.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                No comments yet
              </div>
            ) : (
              threadComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  currentUserId={currentUser?.id}
                />
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <CommentInput
              onSubmit={(content) =>
                onAddComment({
                  nodeKey,
                  content,
                  userId: currentUser?.id,
                  userName: currentUser?.name,
                  userAvatar: currentUser?.avatar,
                })
              }
              autoFocus
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export function CommentIndicator({ count, onClick, position, className }) {
  if (!count || count === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className={cn(
        "absolute flex items-center justify-center",
        "w-6 h-6 rounded-full",
        "bg-blue-500 text-white shadow-md",
        "hover:bg-blue-600 transition-colors",
        "cursor-pointer",
        className
      )}
      style={position}
    >
      {count > 9 ? (
        <span className="text-[10px] font-bold">9+</span>
      ) : (
        <span className="text-xs font-bold">{count}</span>
      )}
    </motion.button>
  );
}

export function useNodeComments(initialComments = []) {
  const [comments, setComments] = useState(initialComments);
  const [activeThread, setActiveThread] = useState(null);
  const [threadPosition, setThreadPosition] = useState({ x: 0, y: 0 });

  const addComment = useCallback((commentData) => {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...commentData,
    };
    setComments((prev) => [...prev, newComment]);
    return newComment;
  }, []);

  const editComment = useCallback((commentId, newContent) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content: newContent, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const deleteComment = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  const openThread = useCallback((nodeKey, position) => {
    setActiveThread(nodeKey);
    setThreadPosition(position);
  }, []);

  const closeThread = useCallback(() => {
    setActiveThread(null);
  }, []);

  const getCommentCount = useCallback(
    (nodeKey) => {
      return comments.filter((c) => c.nodeKey === nodeKey).length;
    },
    [comments]
  );

  return {
    comments,
    activeThread,
    threadPosition,
    addComment,
    editComment,
    deleteComment,
    openThread,
    closeThread,
    getCommentCount,
  };
}
