# Study-App

A modern, high-fidelity video learning platform designed for developers. Study-App provides a cinematic viewing experience with features like seamless autoplay, progress tracking, and interactive engagement.

## Overview
Study-App redefines the learning experience with a clean, focus-driven UI. It allows users to watch course videos, track their progress, earn certificates, and engage with content through likes and keyboard shortcuts. The platform is built for speed and responsiveness across all devices.

## Core Features
-   **Cinematic Video Player**: Custom-built theater mode with persistent Autoplay and intelligent playlist management.
-   **Smart Progress Tracking**: Remembers video playback position and tracks overall course completion.
-   **Keyboard Shortcuts**: efficient control with hotkeys (Space/K to play, M to mute, F for fullscreen, L/J to seek).
-   **Engagement System**: Real-time "Likes" and view counters, plus "New" badges for fresh content.
-   **Certificates**: Auto-generated certificates upon course completion.
-   **Bitrate Calculator**: Integrated tools for optimizing video quality and estimating storage requirements.
-   **Responsive Design**: Fully optimized layout for desktop, tablet, and mobile viewing.
-   **Secure Authentication**: Robust JWT-based user session management.

## Tech Stack
**Frontend**
-   **React 19** (Vite): Fast, modern UI library.
-   **TailwindCSS**: Utility-first styling for a premium look.
-   **Video.js**: Robust video player integration.
-   **Lucide React**: Beautiful, consistent iconography.
-   **React Hot Toast**: Polished notifications.

**Backend**
-   **Node.js & Express**: Scalable API server.
-   **MySQL**: Relational database for structured data (users, videos, progress).
-   **JWT & Bcrypt**: Secure authentication and password hashing.

## Setup & Run Instructions

### Prerequisites
-   Node.js (v18+ recommended)
-   MySQL Server installed and running locally

### 1. Clone the Repository
```bash
git clone https://github.com/NikunjRanga/study-app.git
cd study-app
```

### 2. Database Setup
Ensure your MySQL server is running. Create a database named `study_app` (or match your `.env` config).
Run the initialization scripts to set up tables and seed data:
```bash
cd backend/scripts
node setup_likes_table.js
node setup_progress_table.js
node seed.js
```

### 3. Backend Setup
Navigate to the backend directory, install dependencies, and start the server:
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 4. Frontend Setup
In a new terminal, navigate to the root directory, install dependencies, and start the client:
```bash
# From root directory
npm install
npm run dev
# App runs on http://localhost:5173
```

## Environment Variables
Create a `.env` file in the `backend/` directory with the following keys. Sample values are provided below:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=study_app
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

## Deployment
-   **Frontend**: Run `npm run build` to generate static assets in the `dist/` folder. These can be served by any static host (Netlify, Vercel, Nginx).
-   **Backend**: Deploy the Node.js application to a process manager like PM2 or a cloud provider (Heroku, AWS, DigitalOcean). Ensure environment variables are set in the production environment.

## Assumptions & Limitations
-   **Payment Processing**: Currently a mock implementation; no real payment gateway is connected.
-   **Video Hosting**: Assumes video URLs (HLS or MP4) are directly accessible/public.
-   **Local Dev**: Instructions assume a local development environment with MySQL installed.
