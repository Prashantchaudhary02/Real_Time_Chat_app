import React, { useState } from 'react';
import { Users, X, Sparkles, Shield, Search } from 'lucide-react';

export default function MembersSidebar({ users, currentRoomName, currentUser, isOpen, onClose }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#0d121f] border-l border-gray-800/80 flex flex-col shrink-0 h-full animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Members ({users.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Member Search */}
      <div className="p-3 border-b border-gray-800/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Online — {filteredUsers.length}
        </div>

        {filteredUsers.map((user) => {
          const isMe = user.username === currentUser?.username;
          return (
            <div
              key={user.id}
              className={`px-2.5 py-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                isMe ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-base">
                  {user.avatar}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-gray-900 rounded-full" />
              </div>

              <div className="truncate flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-xs font-semibold text-gray-200 truncate">
                    {user.username}
                  </span>
                  {isMe && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      YOU
                    </span>
                  )}
                </div>
                {user.statusText && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {user.statusText}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-500">
            No members found
          </div>
        )}
      </div>
    </aside>
  );
}
