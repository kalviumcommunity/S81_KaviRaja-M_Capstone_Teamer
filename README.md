# Teamer :

**Teamer** is a simple real-time teamwork app made for busy teams. Like Microsoft Teams or WhatsApp, it helps people chat, share tasks, track progress, and send payments — all in one place.

---

## Tech Stack Overview

### Frontend

- React (Vite)
- React Router DOM
- Tailwind CSS
- Axios
- Context API

### Backend

- Node.js + Express
- JWT-based login system
- MongoDB with Mongoose
- Real-time chat with Socket.IO

### Dev Tools

- Git + GitHub
- ESLint & Prettier
- Chart.js for showing stats

---

## Main Features

### Login & User Info

- Secure login and register with JWT
- Update profile with photo
- Auth state managed in frontend

### Live Chat

- Chat one-on-one or in groups
- Use emojis, mentions, GIFs, and more
- Forward, reply, and delete messages
- Messages are private and safe

### Group Features

- Make groups (up to 50 members)
- Admins can control group settings
- Send group polls and announcements

### Task Features

- Admin gives tasks using checkboxes
- Users mark tasks done
- Admins can approve them in real-time

### Performance Tracking

- See live progress charts for users and groups
- Only admins see task updates
- Users can view their team’s progress

### File Sharing

- Share images, videos, docs, and audio (up to 2GB)
- Send files without losing quality

### Audio & Video Calls

- Start voice or video calls from chat
- Fast connection using Socket.IO

### Payments

- Send payments right inside chats
- View full payment history

---

## 10-Day Build Plan

### Daily Steps

**Day 1** – Project setup: folders, routing, and base layout

**Day 2** – Login system: Register, login, and protect pages

**Day 3** – Make dashboard UI with sidebar and pages

**Day 4** – Start chat UI + connect Socket.IO

**Day 5** – Add group chat, reply, mention, etc.

**Day 6** – Upload media, show previews, edit/delete messages

**Day 7** – Task system: assign, mark done, admin verify

**Day 8** – Build charts for tracking progress

**Day 9** – Add payment system + history

**Day 10** – Call features + fix bugs + final polish

---

## How to Run It Locally

### Before You Start

- Install Node.js (v16+)
- Setup MongoDB
- Use Yarn or npm

### Run Backend

```bash
cd backend
npm install
npm run dev
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

