import React, { useState } from 'react';
import {
  Hash,
  Plus,
  Search,
  Settings,
  MessageSquare,
  Users,
  LogOut,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { getAvatarGradient } from '../utils/avatars';

export default function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  onOpenCreateRoom,
  currentUser,
  onOpenProfile,
  onLogout,
  soundEnabled,
  onToggleSound,
  isOpenMobile,
  onCloseMobile
}) {
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#0d121f] border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight">PulseChat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Real-time workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {/* Mobile close */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find channel..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Channels Section Header */}
        <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            Channels ({rooms.length})
          </span>
          <button
            onClick={onOpenCreateRoom}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Create Channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {filteredRooms.map((room) => {
            const isActive = currentRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all group ${
                  isActive
                    ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/30'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base shrink-0">{room.icon || '💬'}</span>
                  <div className="truncate">
                    <div className="text-sm truncate leading-tight flex items-center gap-1">
                      <span className={isActive ? 'text-indigo-300 font-semibold' : ''}>#{room.name}</span>
                    </div>
                    {room.description && (
                      <p className="text-[11px] text-gray-400 truncate opacity-90">{room.description}</p>
                    )}
                  </div>
                </div>

                {room.userCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-0.5" />
                    {room.userCount}
                  </span>
                )}
              </button>
            );
          })}

          {filteredRooms.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-500">
              No channels match "{search}"
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        {currentUser && (
          <div className="p-3 border-t border-gray-800/80 bg-gray-900/60">
            <div className="flex items-center justify-between">
              <div
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 truncate flex-1 cursor-pointer p-1.5 rounded-xl hover:bg-gray-800/80 transition-colors"
                title="Click to edit profile"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-lg border border-gray-700 shadow-sm">
                    {currentUser.avatar}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate leading-tight flex items-center gap-1">
                    {currentUser.username}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {currentUser.statusText || 'Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenProfile}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  title="Edit Profile"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Switch User / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
