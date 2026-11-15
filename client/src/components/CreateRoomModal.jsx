import React, { useState } from 'react';
import { X, Hash, Sparkles } from 'lucide-react';

const ICON_PRESETS = ['💬', '🚀', '🔥', '🎮', '🎧', '⚡', '☕', '📚', '💡', '🤖', '🎉', '🌍'];

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a channel name');
      return;
    }
    onCreate({
      name: name.trim(),
      description: description.trim(),
      icon
    });
    setName('');
    setDescription('');
    setIcon('💬');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-bold text-white">Create New Channel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-300 mb-2">
              Select Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_PRESETS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    icon === ic
                      ? 'bg-indigo-600 scale-110 shadow-sm'
                      : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-300 mb-2">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-500 font-semibold text-sm">#</span>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  if (error) setError('');
                }}
                placeholder="design-critique"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
