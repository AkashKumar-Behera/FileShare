# FileShare 🚀

FileShare is a premium, high-speed, **100% Offline Local Area Network (LAN)** file sharing and communication platform. It allows multiple devices connected to the same Wi-Fi router or Mobile Hotspot to chat, make calls, share screens, and transfer unlimited files (from MBs to TBs) at maximum hardware speeds without requiring any active internet connection.

---

## 🛠️ Tech Stack & Architecture

### Backend (Python/Django)
- **Django 6.0+ & Django REST Framework**: Handles API endpoints, data models, and business logic.
- **Django Channels & Daphne (ASGI)**: Manages real-time WebSockets for instant message delivery, calling signals, and notification relays.
- **SQLite**: Local lightweight relational database requiring zero external configuration.

### Frontend (Next.js/React)
- **Next.js 16+ & React 19**: Powered by React's latest architecture, leveraging TypeScript for type safety.
- **Vanilla CSS (Module-based)**: High-performance, pixel-perfect, custom design system featuring glassmorphism, glowing states, and responsive dark themes.
- **Framer Motion**: Delivers smooth micro-animations, transitions, and hover-to-play effects.

---

## 🏗️ Technical Implementation & Workflows

### 1. 📡 LAN-based Device Discovery
- **Self-Registration**: On application load, the frontend detects the device type, browser client details, and local connection IP. It submits this to `/api/devices` to self-register.
- **Heartbeat & Status**: The device polls `/api/devices` to keep its status active and fetch other online devices on the same local network.
- **Offline Fallback**: Since it works completely offline, discovery is entirely localized within the SQLite database network records.

### 2. 📺 HTTP Screen Share Broadcast (WebRTC Bypass)
- **Problem**: WebRTC peer connection setup often fails, times out, or gets blocked by firewalls when working strictly offline over a mobile hotspot without an internet-facing STUN/TURN server.
- **Solution**: A custom **HTTP Live Frame Broadcast Engine**:
  1. **Presenter Side**: Captures the screen media stream, draws video frames onto a virtual canvas, compresses it to WebP/JPEG format at 20-30 FPS, and uploads the frame data to the Django server endpoint `/api/calls/live_frame` via HTTP POST.
  2. **Server Side**: Temporarily stores the latest frame in memory/cache to minimize disk wear.
  3. **Viewer Side**: Long-polls the server endpoint `/api/calls/live_frame` at a optimized 50ms interval, dynamically updating an `<img>` element src to display the stream in real-time with zero blackout screens or connection failures.

### 3. 💾 Data Flow & Database Relations
```
 ┌──────────┐         ┌──────────┐
 │  Device  │◄────────┤   User   │
 └────┬─────┘         └────┬─────┘
      │                    │
      ├───────────┐        │
      ▼           ▼        ▼
┌──────────┐ ┌──────────┐┌──────────┐
│ Transfer │ │ Message  ││   Chat   │
└──────────┘ └──────────┘└──────────┘
```
- **Chats & Messages**: Messaging leverages the `Chat` and `Message` models. Files uploaded in chat are stored directly in the `media/chat_attachments/` folder.
- **Transfers Log**: The `Transfer` table tracks all file share operations. When a user queries their history or download lists, the backend dynamically queries both direct chunked uploads and chat attachments to guarantee successful file recovery.

---

## ⚙️ Setup & Installation Guide

Follow the guide corresponding to your system setup.

### Option 1: ⚡ Windows One-Click Auto-Launcher (Easiest)
If you are on Windows, we have provided an automated launcher. Just double-click:
- **`run_all.bat`** (Starts both Django backend and Next.js frontend automatically in separate command windows).

---

### Option 2: 🐍 Using Anaconda (Recommended for Python Beginners)
1. Open the **Anaconda Prompt** or **Miniconda Prompt**.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/AkashKumar-Behera/FileShare.git
   cd FileShare
   ```
3. **Create and Activate environment**:
   ```bash
   conda create -n fileshare python=3.11 -y
   conda activate fileshare
   ```
4. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Run backend database setup & migrations**:
   ```bash
   python manage.py migrate
   ```
6. **Start the Django server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
7. In a new conda prompt window, navigate to the `frontend` folder and start Next.js:
   ```bash
   cd frontend
   npm install
   npm run dev:https
   ```

---

### Option 3: 💻 Standard Python & Node.js Setup (Manual)

#### Prerequisites
- **Python 3.10+**: Ensure Python is checked in your system's PATH.
- **Node.js 18+**: For running the React/Next.js frontend.

#### Step 1: Backend Setup
1. Open Command Prompt (CMD) or PowerShell and navigate to the project directory:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

#### Step 2: Frontend Setup
1. In a new CMD window, navigate to the `frontend` folder and run:
   ```cmd
   cd frontend
   npm install
   npm run dev:https
   ```

---

### Option 4: 🚫 If you do not have Python or Node installed
1. **Install Python**: Download and run the Python installer from [python.org](https://www.python.org/). **Crucial**: Check the box **"Add Python to PATH"** before clicking Install.
2. **Install Node.js**: Download and run the Node.js installer from [nodejs.org](https://nodejs.org/).
3. **Install Git**: Download Git from [git-scm.com](https://git-scm.com/).
4. Follow the **Standard Python & Node.js Setup** guide above.

---

## 💡 Important Q&A / FAQs

#### Q1: Quick Downloader me download fail ya "File not found" kyu aata tha?
**Ans**: Chat attachments (`/media/chat_attachments/`) aur transfers (`/media/transfers/`) alag directory structures me saved the. Humne backend download routing logic me dynamic fallback integrate kiya hai jo dono directories ko sequentially inspect karta hai to prevent 404 errors.

#### Q2: Device ID badalne par user history aur file list khali kyu ho jati thi?
**Ans**: Pehle transfers local storage ke transient `deviceId` ke physical records se map hote the. Humne dynamic user matching implement kiya hai, jisse log-in karte hi user ke unique registration credentials se linked saare current aur past devices ki files merge hokar "My Files" dashboard me live show hone lagti hain.

#### Q3: System ki boundaries ya limitations kya hain?
- **LAN Speed**: File sharing speed router ke maximum capability (2.4 GHz vs 5 GHz) aur devices ke spacing par depend karegi.
- **Security**: Workstation and devices same host network me local browser HTTPS trust certs validation use karte hain for secure peer features.

---

## 🖼️ UI Gallery & Preview
Check out our premium user interfaces:
- **Dashboard**: High-fidelity overview cards, storage charts, and local online devices status.
- **Quick Downloader**: Dedicated anonymous screen card with file type category icons, real-time live search, and inline hover audio/video previews.
- **Chat & Screen Share**: Responsive double-pane layout with WebRTC-fallback HTTP broadcast stream.
