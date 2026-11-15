export const AVATAR_OPTIONS = [
  '🦊', '🐼', '🚀', '🐱', '🦁', '🤖',
  '🎨', '⚡', '🎮', '🦄', '🔮', '☕',
  '👾', '🦉', '🍕', '🐬', '💎', '🌈'
];

export const POPULAR_EMOJIS = [
  '👍', '❤️', '🔥', '😂', '🎉', '🚀',
  '✨', '👏', '💯', '😍', '👀', '💡',
  '😎', '🤔', '🙌', '💪', '🥳', '⚡'
];

export const STATUS_SUGGESTIONS = [
  'Coding something cool 💻',
  'Listening to music 🎧',
  'Available to chat ✨',
  'In the zone 🚀',
  'Coffee break ☕',
  'Debugging life 🐛'
];

// Generates a consistent gradient background based on a string (e.g. username)
export function getAvatarGradient(name = '') {
  const gradients = [
    'from-pink-500 to-rose-600',
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-fuchsia-600',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-red-600'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Formats timestamp into readable time (e.g., "10:45 AM" or "Yesterday 10:45 AM")
export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateLabel(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
