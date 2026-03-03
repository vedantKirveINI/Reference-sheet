import React from 'react';
import { IUserInfo } from '@/types/cell';

interface UserAvatarProps {
  user: IUserInfo;
  size?: number;
  className?: string;
}

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
];

function getColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 24, className = '' }) => {
  const initial = (user.name || user.email || '?')[0].toUpperCase();
  const bgColor = getColorFromId(user.id || '');

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || ''}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </div>
  );
};

interface UserAvatarGroupProps {
  users: IUserInfo[];
  maxDisplay?: number;
  size?: number;
}

export const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({ users, maxDisplay = 3, size = 24 }) => {
  const displayed = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-1.5">
      {displayed.map((user) => (
        <UserAvatar key={user.id} user={user} size={size} className="ring-2 ring-white dark:ring-zinc-900" />
      ))}
      {remaining > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-medium ring-2 ring-white dark:ring-zinc-900"
          style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
