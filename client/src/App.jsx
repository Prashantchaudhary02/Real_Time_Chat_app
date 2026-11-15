import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MembersSidebar from './components/MembersSidebar';
import LoginModal from './components/LoginModal';
import CreateRoomModal from './components/CreateRoomModal';
import UserProfileModal from './components/UserProfileModal';
import ImageLightbox from './components/ImageLightbox';
import { playSentSound, playReceivedSound, playJoinSound } from './utils/sound';

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsechat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General', description: 'General conversation & casual vibes', icon: '💬', userCount: 0 },
    { id: 'tech-talk', name: 'Tech Talk', description: 'Code, frameworks, architecture & tech news', icon: '⚡', userCount: 0 },
    { id: 'random', name: 'Random', description: 'Memes, music, off-topic fun and links', icon: '🎲', userCount: 0 },
    { id: 'showcase', name: 'Showcase', description: 'Show off your projects, designs & ideas', icon: '✨', userCount: 0 }
  ]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // UI state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('pulsechat_sound') !== 'false';
  });
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // References to keep event handlers current without re-binding
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const currentRoomRef = useRef(currentRoom);
  currentRoomRef.current = currentRoom;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Initialize Socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server with ID:', newSocket.id);
      // If user is already set, rejoin room
      if (currentUserRef.current) {
        newSocket.emit('join_room', {
          ...currentUserRef.current,
          room: currentRoomRef.current
        });
      }
    });

    newSocket.on('rooms_update', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    newSocket.on('room_history', (history) => {
      setMessages(history);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Sound notification
      if (soundEnabledRef.current) {
        if (msg.type === 'system') {
          playJoinSound();
        } else if (msg.user?.username === currentUserRef.current?.username) {
          playSentSound();
        } else {
          playReceivedSound();
        }
      }
    });

    newSocket.on('message_reaction_update', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
    });

    newSocket.on('users_update', (users) => {
      setRoomUsers(users);
    });

    newSocket.on('user_typing', ({ userId, username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.some((u) => u.userId === userId)) {
            return [...prev, { userId, username }];
          }
          return prev;
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    });

    newSocket.on('error_notification', ({ message }) => {
      alert(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // When room changes, emit join_room
  useEffect(() => {
    if (socket && currentUser) {
      setMessages([]);
      setTypingUsers([]);
      socket.emit('join_room', {
        ...currentUser,
        room: currentRoom
      });
    }
  }, [currentRoom, socket]);

  // Join handler from LoginModal
  const handleJoin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('pulsechat_user', JSON.stringify(userData));

    if (socket) {
      socket.emit('join_room', {
        ...userData,
        room: currentRoom
      });
    }
  };

  // Switch/Logout user
  const handleLogout = () => {
    localStorage.removeItem('pulsechat_user');
    setCurrentUser(null);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  // Profile update
  const handleUpdateProfile = (updatedData) => {
    const merged = { ...currentUser, ...updatedData };
    setCurrentUser(merged);
    localStorage.setItem('pulsechat_user', JSON.stringify(merged));

    if (socket) {
      socket.emit('join_room', {
        ...merged,
        room: currentRoom
      });
    }
  };

  // Send message
  const handleSendMessage = ({ text, image, replyTo }) => {
    if (!socket || !currentUser) return;
    socket.emit('send_message', {
      room: currentRoom,
      text,
      image,
      replyTo
    });
  };

  // React to message
  const handleReactMessage = (messageId, emoji) => {
    if (!socket || !currentUser) return;
    socket.emit('react_message', {
      messageId,
      room: currentRoom,
      emoji
    });
  };

  // Typing indicator
  const handleTyping = (isTyping) => {
    if (!socket || !currentUser) return;
    socket.emit('typing', {
      room: currentRoom,
      isTyping
    });
  };

  // Create new channel
  const handleCreateRoom = ({ name, description, icon }) => {
    if (!socket) return;
    socket.emit('create_room', { name, description, icon });
    const formattedId = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');
    setCurrentRoom(formattedId);
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('pulsechat_sound', next.toString());
      return next;
    });
  };

  const currentRoomData = rooms.find((r) => r.id === currentRoom) || {
    id: currentRoom,
    name: currentRoom,
    icon: '💬',
    description: '',
    userCount: roomUsers.length
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d1a] text-gray-100 font-sans select-none">
      {/* Login Modal if user hasn't set profile yet */}
      {!currentUser && <LoginModal onJoin={handleJoin} />}

      {/* Left Sidebar */}
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={setCurrentRoom}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* Main Chat View */}
      <ChatArea
        currentRoomData={{
          ...currentRoomData,
          userCount: roomUsers.length
        }}
        messages={messages}
        currentUser={currentUser}
        typingUsers={typingUsers}
        onSendMessage={handleSendMessage}
        onReactMessage={handleReactMessage}
        onTyping={handleTyping}
        onToggleMembers={() => setIsMembersOpen((prev) => !prev)}
        isMembersOpen={isMembersOpen}
        onToggleSidebarMobile={() => setIsSidebarMobileOpen((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onImageClick={(imgUrl) => setLightboxImage(imgUrl)}
      />

      {/* Right Online Members Panel */}
      <MembersSidebar
        users={roomUsers}
        currentRoomName={currentRoomData?.name}
        currentUser={currentUser}
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreate={handleCreateRoom}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdate={handleUpdateProfile}
      />

      {/* Lightbox for full size image view */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
