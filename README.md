-----------InternID: CITS9868--------------

# PulseChat ⚡ — Modern Real-Time Chat Application

A sleek, responsive, and feature-packed real-time chat application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **Socket.io**.

![PulseChat Preview](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/message-square.svg)

---

## ✨ Features

- **⚡ Real-Time Messaging**: Instant two-way communication powered by Socket.io with low latency.
- **🎨 Modern Dark UI**: Frosted glass effects (`backdrop-blur`), glowing gradients, responsive mobile-friendly sidebar, and clean typography.
- **💬 Channels & Rooms**:
  - Built-in channels: `#general`, `#tech-talk`, `#random`, `#showcase`.
  - Create custom channels on the fly with custom icons, titles, and descriptions.
  - Live active participant counter per channel.
- **😊 Emoji Reactions**: React directly to any message with emojis (👍, ❤️, 🔥, 😂, 🎉, 🚀) with live real-time counters.
- **🖼️ Image & Media Sharing**: Click to attach images or photos with automatic thumbnail previews and full-screen lightbox zoom.
- **⌨️ Live Typing Indicators**: Real-time indication when someone is actively typing.
- **👥 Active Member Presence**: Dedicated right drawer showing online members in the channel with custom status badges.
- **🔔 Built-in Sound Synthesizer**: Pleasant audio notifications for incoming/sent messages and user joins using the Web Audio API (100% self-contained, no external audio files required).
- **📝 Code Snippet & Link Support**: Automatic syntax formatting for ````code blocks```` with 1-click copy, and clickable URLs.
- **🔍 Channel & Message Search**: Filter channels in the sidebar and search through message history instantly.
- **🔄 Zero-Config Running**: The backend server automatically serves the built frontend on a single unified port (`5000`), or supports hot-reloading dev mode.

---

## 📁 Project Structure

```text
Real_time_chat_App/
├── client/                     # Frontend (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatArea.jsx         # Main chat timeline, formatting & input bar
│   │   │   ├── Sidebar.jsx          # Channel navigation, search & user footer
│   │   │   ├── MembersSidebar.jsx   # Live room participants drawer
│   │   │   ├── LoginModal.jsx       # Welcome modal with avatar & status picker
│   │   │   ├── CreateRoomModal.jsx  # Modal for creating custom channels
│   │   │   ├── UserProfileModal.jsx # Profile edit modal
│   │   │   └── ImageLightbox.jsx    # Fullscreen image viewer
│   │   ├── utils/
│   │   │   ├── sound.js             # Web Audio API sound generator
│   │   │   └── avatars.js           # Avatar presets and formatting helpers
│   │   ├── App.jsx                  # Main application container & socket orchestrator
│   │   ├── index.css                # Tailwind CSS v4 setup & custom styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend (Express + Socket.io)
│   ├── server.js               # Socket.io handlers, rooms, presence & static serving
│   └── package.json
├── start-dev.js                # Dual dev-runner script
├── package.json                # Root package scripts
└── README.md
```

---

## 🚀 Quick Start

### 1. Run Everything (Production / Single Port)
```bash
# Start server (serves the frontend on http://localhost:5000)
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser. Open multiple browser tabs to chat in real time between different users!

---

### 2. Run in Development Mode (Live Hot Reloading)
```bash
# Run both server & client concurrently with live reload
npm run dev
```
- Client dev server: **[http://localhost:5173](http://localhost:5173)**
- Backend server: **[http://localhost:5000](http://localhost:5000)**

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Socket.io Client.
- **Backend**: Node.js, Express, Socket.io, CORS.
- **Audio**: Web Audio API (Synthesizer).
- **Communication**: WebSockets with automatic HTTP long-polling fallback.

---

## 📝 License
MIT
