import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Image as ImageIcon,
  Users,
  Search,
  Menu,
  Volume2,
  VolumeX,
  X,
  Reply,
  Copy,
  Check,
  Code,
  CornerDownRight
} from 'lucide-react';
import { POPULAR_EMOJIS, formatTime, formatDateLabel } from '../utils/avatars';

export default function ChatArea({
  currentRoomData,
  messages,
  currentUser,
  typingUsers,
  onSendMessage,
  onReactMessage,
  onTyping,
  onToggleMembers,
  isMembersOpen,
  onToggleSidebarMobile,
  soundEnabled,
  onToggleSound,
  onImageClick
}) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMessageSearch, setActiveMessageSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    onSendMessage({
      text: inputText.trim(),
      image: selectedImage,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            username: replyTarget.user?.username || 'User',
            text: replyTarget.text ? replyTarget.text.slice(0, 60) : 'Attachment'
          }
        : null
    });

    setInputText('');
    setSelectedImage(null);
    setReplyTarget(null);
    setShowEmojiPicker(false);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Image Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset
  };

  const handleCopyText = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter messages if search is active
  const displayedMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Render text with clickable links and code formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Check for code blocks ```
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const codeContent = part.slice(3, -3).trim();
          return (
            <div key={idx} className="my-2 rounded-lg bg-gray-950/80 p-3 font-mono text-xs border border-gray-800 text-emerald-400 overflow-x-auto relative group">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-200 p-1 rounded bg-gray-900 border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <pre className="whitespace-pre-wrap">{codeContent}</pre>
            </div>
          );
        }
        return <span key={idx}>{renderInlineLinks(part)}</span>;
      });
    }

    return renderInlineLinks(text);
  };

  const renderInlineLinks = (str) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = str.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080d1a] relative overflow-hidden">
      {/* Channel Header */}
      <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-800/80 bg-[#0d121f]/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">{currentRoomData?.icon || '💬'}</span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                #{currentRoomData?.name || 'general'}
              </h2>
              {currentRoomData?.description && (
                <p className="text-xs text-gray-400 hidden sm:block truncate max-w-xs md:max-w-md">
                  {currentRoomData.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Message search */}
          {activeMessageSearch ? (
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channel..."
                className="w-36 sm:w-48 px-3 py-1.5 text-xs rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => {
                  setActiveMessageSearch(false);
                  setSearchQuery('');
                }}
                className="p-1 ml-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveMessageSearch(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Search Messages"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onToggleMembers}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isMembersOpen
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Toggle Members List"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">
              {currentRoomData?.userCount || 0}
            </span>
          </button>
        </div>
      </header>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {searchQuery && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <span>
              Showing results for: <strong>"{searchQuery}"</strong> ({displayedMessages.length} found)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-400 hover:text-indigo-200 underline"
            >
              Clear
            </button>
          </div>
        )}

        {displayedMessages.map((msg, index) => {
          // Check date separator
          const prevMsg = displayedMessages[index - 1];
          const showDateSeparator =
            !prevMsg ||
            new Date(prevMsg.timestamp).toDateString() !==
              new Date(msg.timestamp).toDateString();

          // System message
          if (msg.type === 'system') {
            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-800/80" />
                    <span className="px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      {formatDateLabel(msg.timestamp)}
                    </span>
                    <div className="flex-1 border-t border-gray-800/80" />
                  </div>
                )}
                <div className="flex justify-center my-2">
                  <span className="text-[11px] text-gray-400 bg-gray-900/80 border border-gray-800/80 px-3 py-1 rounded-full shadow-xs">
                    {msg.text}
                  </span>
                </div>
              </React.Fragment>
            );
          }

          const isMe = msg.user?.username === currentUser?.username;

          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-800/80" />
                  <span className="px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {formatDateLabel(msg.timestamp)}
                  </span>
                  <div className="flex-1 border-t border-gray-800/80" />
                </div>
              )}

              <div
                className={`group relative flex items-start gap-3 p-1.5 -mx-1.5 rounded-xl transition-colors hover:bg-gray-900/40 ${
                  isMe ? 'flex-row-reverse' : ''
                }`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMsgId(null);
                  if (reactionPickerMsgId === msg.id) {
                    setReactionPickerMsgId(null);
                  }
                }}
              >
                {/* User Avatar */}
                <div className="shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700/80 flex items-center justify-center text-lg shadow-sm">
                    {msg.user?.avatar || '👤'}
                  </div>
                </div>

                {/* Content Container */}
                <div className={`flex flex-col max-w-[82%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender & Timestamp */}
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-semibold text-gray-300">
                      {isMe ? 'You' : msg.user?.username}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Reply Quote Banner if replying */}
                  {msg.replyTo && (
                    <div
                      className={`text-[11px] px-3 py-1 mb-1.5 rounded-lg border flex items-center gap-1.5 text-gray-400 max-w-full truncate ${
                        isMe
                          ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-300'
                          : 'bg-gray-900/80 border-gray-800'
                      }`}
                    >
                      <CornerDownRight className="w-3 h-3 shrink-0 opacity-70" />
                      <span className="font-semibold text-gray-300">@{msg.replyTo.username}:</span>
                      <span className="truncate">{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                        : 'bg-gray-850 bg-[#161c2d] border border-gray-800/80 text-gray-100 rounded-tl-xs'
                    }`}
                  >
                    {msg.text && (
                      <div className="break-words whitespace-pre-wrap select-text">
                        {renderFormattedText(msg.text)}
                      </div>
                    )}

                    {/* Image Attachment */}
                    {msg.image && (
                      <div className="mt-2 overflow-hidden rounded-xl cursor-pointer group/img max-w-sm">
                        <img
                          src={msg.image}
                          alt="Attachment"
                          onClick={() => onImageClick(msg.image)}
                          className="max-h-64 rounded-xl object-cover hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Reactions List */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 px-0.5">
                      {Object.entries(msg.reactions).map(([emoji, usersArr]) => {
                        const hasReacted = usersArr.includes(currentUser?.username);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onReactMessage(msg.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                              hasReacted
                                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                                : 'bg-gray-900/90 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                            }`}
                            title={`Reacted by: ${usersArr.join(', ')}`}
                          >
                            <span>{emoji}</span>
                            <span className="font-semibold text-[10px]">{usersArr.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Quick Action Bar */}
                {hoveredMsgId === msg.id && (
                  <div
                    className={`absolute -top-3 z-10 flex items-center bg-[#1e2433] border border-gray-700 rounded-lg shadow-xl px-1 py-0.5 gap-0.5 ${
                      isMe ? 'right-12' : 'left-12'
                    }`}
                  >
                    {/* Quick Reactions Trigger */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setReactionPickerMsgId(
                            reactionPickerMsgId === msg.id ? null : msg.id
                          )
                        }
                        className="p-1 rounded hover:bg-gray-700 text-gray-300 transition-colors text-xs"
                        title="React with emoji"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Emoji Reaction Popup */}
                      {reactionPickerMsgId === msg.id && (
                        <div className="absolute bottom-full mb-1 left-0 bg-[#161c2d] border border-gray-700 p-1.5 rounded-xl shadow-2xl flex gap-1 z-30">
                          {['👍', '❤️', '🔥', '😂', '🎉', '🚀'].map((em) => (
                            <button
                              key={em}
                              onClick={() => {
                                onReactMessage(msg.id, em);
                                setReactionPickerMsgId(null);
                              }}
                              className="text-base hover:scale-125 transition-transform p-1 rounded hover:bg-gray-800"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply */}
                    <button
                      onClick={() => {
                        setReplyTarget(msg);
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy text */}
                    {msg.text && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Bar */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="px-6 py-1.5 flex items-center gap-2 text-xs text-indigo-400 font-medium">
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].username} is typing...`
              : `${typingUsers.map((u) => u.username).join(', ')} are typing...`}
          </span>
        </div>
      )}

      {/* Input Section */}
      <div className="p-4 border-t border-gray-800/80 bg-[#0d121f]/90 relative">
        {/* Reply Context Banner */}
        {replyTarget && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-indigo-950/50 border border-indigo-900/60 text-xs text-indigo-300 animate-in fade-in">
            <div className="flex items-center gap-1.5 truncate">
              <Reply className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>Replying to <strong>@{replyTarget.user?.username}</strong>:</span>
              <span className="truncate opacity-80 text-gray-300">
                {replyTarget.text || 'Image attachment'}
              </span>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selected Image Preview Drawer */}
        {selectedImage && (
          <div className="relative inline-block mb-2">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-indigo-500/50 shadow-md">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-6 z-30 p-3 rounded-2xl bg-[#161c2d] border border-gray-700 shadow-2xl w-72 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Emojis</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  className="h-9 flex items-center justify-center text-lg hover:bg-gray-800 rounded-lg hover:scale-125 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Input Bar */}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex-1 flex items-center gap-1.5 bg-gray-900/90 border border-gray-700/80 rounded-2xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-gray-800 transition-colors"
              title="Attach image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${currentRoomData?.name || 'general'}...`}
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-sm focus:outline-none px-1"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim() || selectedImage
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
