export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getBadgeColor = (badge: string): string => {
  switch (badge.toUpperCase()) {
    case 'BRONZE': return 'bg-amber-600';
    case 'SILVER': return 'bg-gray-400';
    case 'GOLD': return 'bg-yellow-500';
    case 'DIAMOND': return 'bg-blue-400';
    case 'RUBY': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export const getBadgeLabel = (badge: string): string => {
  switch (badge.toUpperCase()) {
    case 'BRONZE': return 'Bronze Trader';
    case 'SILVER': return 'Silver Trader';
    case 'GOLD': return 'Gold Trader';
    case 'DIAMOND': return 'Diamond Trader';
    case 'RUBY': return 'Ruby Trader';
    default: return 'Trader';
  }
};

export const getConditionColor = (condition: string): string => {
  switch (condition.toUpperCase()) {
    case 'NEW': return 'bg-green-100 text-green-800';
    case 'GOOD': return 'bg-blue-100 text-blue-800';
    case 'FAIR': return 'bg-yellow-100 text-yellow-800';
    case 'POOR': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatLocation = (latitude?: number, longitude?: number): string => {
  if (!latitude || !longitude) return 'Location not specified';
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
};

import { config } from '@/config/env';

export const generateAvatar = (email: string): string => {
  return `${config.services.avatarApi}?seed=${encodeURIComponent(email)}`;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
