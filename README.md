# FileShare 🚀

FileShare is a local network file sharing and communication platform. It features real-time chat, file transfer, calling capabilities, device discovery, and live notifications. The application is built using **Django (Python)** for the backend (with Channels for WebSockets) and **Next.js (React/TypeScript)** for the frontend.

---

## Tech Stack 🛠️

### Backend:
- **Django 6.0+** & **Django REST Framework**
- **Django Channels** & **Daphne** (for WebSockets)
- **SQLite** (Default local database)

### Frontend:
- **Next.js 16+** (App Router)
- **React 19**
- **TypeScript**
- **Lucide Icons**

---

## Features ✨
- **Device Discovery**: Discover active devices on the local network.
- **File Transfer**: Share files instantly across connected devices.
- **Real-time Chat**: Send and receive instant messages.
- **Real-time Calls & Notifications**: Real-time communication powered by WebSockets.

---

## Setup Instructions ⚙️

### 1. Prerequisites
Ensure you have the following installed:
- Python 3.10+
- Node.js 18+ & npm

---

### 2. Backend Setup (Django) 🐍

1. **Navigate to the project root directory**:
   ```bash
   cd FileShare
   ```

2. **Create a virtual environment (Optional but Recommended)**:
   ```bash
   python -m venv venv
   # Activate on Windows:
   venv\Scripts\activate
   # Activate on macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start Django & Daphne Server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   The backend server will run at `http://localhost:8000`.

---

### 3. Frontend Setup (Next.js) ⚡

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Repository Structure 📂

```
FileShare/
│
├── FileShare/            # Django main project settings and WSGI/ASGI configurations
├── accounts/             # User accounts and authentication
├── calls/                # Calling features (signaling/WebSockets)
├── chat/                 # Real-time chat functionality
├── devices/              # Device discovery logic
├── notifications/        # Live notifications
├── transfer/             # File sharing and transfer logic
├── settings/             # System and user settings
│
├── frontend/             # Next.js frontend code
│
├── db.sqlite3            # SQLite database (ignored in git)
├── manage.py             # Django entrypoint script
└── requirements.txt      # Python dependencies
```

---

## Git Guidelines 🤝
Ensure you do not commit temporary files or dependencies:
- Keep `db.sqlite3` and `node_modules` ignored.
- Virtual environment (`venv/`, `.venv/`) is ignored by default via `.gitignore`.
