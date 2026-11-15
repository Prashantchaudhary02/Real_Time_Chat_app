import React, { useState } from 'react';
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { AVATAR_OPTIONS, STATUS_SUGGESTIONS } from '../utils/avatars';

export default function LoginModal({ onJoin }) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [statusText, setStatusText] = useState(STATUS_SUGGESTIONS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (username.trim().length > 20) {
      setError('Display name must be 20 characters or less');
      return;
    }
    onJoin({
      username: username.trim(),
      avatar,
      statusText: statusText.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-6 md:p-8 overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                PulseChat
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Live
                </span>
              </h2>
              <p className="text-sm text-gray-400">Join real-time conversations instantly</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Alex, CyberDev, Luna"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
              {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
            </div>

            {/* Choose Avatar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Choose Avatar
                </label>
                <span className="text-xs text-gray-400">Selected: {avatar}</span>
              </div>
              <div className="grid grid-cols-6 gap-2 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
                {AVATAR_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`h-11 flex items-center justify-center text-xl rounded-lg transition-all ${
                      avatar === item
                        ? 'bg-indigo-600 scale-105 shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400'
                        : 'hover:bg-gray-800 hover:scale-105'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Message */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Current Status
              </label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="What's your vibe today?"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STATUS_SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusText(s)}
                    className="text-[11px] px-2 py-1 rounded-md bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Hop In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
