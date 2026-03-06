# Astra Link - UAV Ground Control Station (GCS)

![Astra Link Banner](https://img.shields.io/badge/Astra--Link-GCS-00d1ff?style=for-the-badge&logoColor=white)

Astra Link is a modern, high-performance Ground Control Station interface designed for real-time UAV mission management, tactical operations, and live telemetry visualization.

## 🚀 Features

### 📡 Live Mission Tracking
- **Real-time Waypoints:** Monitor UAV progress along path sequences with automatic status updates.
*   **Auto-Completion:** Missions automatically transition to "COMPLETED" status upon arrival at the final target.
- **Dynamic UAV Icon:** Professional green triangle icon with snappy, reactive heading and movement logic.

### 🎮 Tactical Operator Controls
- **Parameter Overrides:** Change Airspeed and Altitude on the fly, overriding planned waypoint parameters.
- **Weapon/Payload System:** Dedicated tactical interface to trigger actions like **FIRE WEAPON** or **DROP PAYLOAD**.
- **Mission Management:** Create, Activate, Abort, and Delete mission logs directly from the dashboard.

### 🗺️ Advanced Mapping
- **Custom Launch Sites:** Right-click anywhere on the map to set the UAV's Home/Launch location.
- **Waypoint Planning:** Intuitive click-to-add waypoint system with editable altitude and speed per point.

## 🛠️ Technology Stack
- **Frontend:** Angular, NgRx (State Management), Leaflet (Map Integration), Socket.io-client.
- **Backend:** Node.js, Express, Sequelize (ORM), MySQL, Socket.io (Real-time Telemetry Bridge).
- **Communication:** Bi-directional WebSocket bridge for low-latency telemetry and command execution.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with your DB credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start -- --port 4202
```

## 🔐 Demo Credentials
*   **URL:** `http://localhost:4202`
*   **Email:** `admin@astralink.io`
*   **Password:** `Admin@1234`

## 📊 Live Dashboard
- **Telemetry:** Real-time Battery, Signal, GPS Lock, and Attitude data.
- **System Logs:** Live feed for UAV events and tactical action confirmations.
- **Sensor Health:** Visual indicators for subsystem statuses.

---
*Developed for Advanced Agentic Coding - Astra Link Demo Repository.*
