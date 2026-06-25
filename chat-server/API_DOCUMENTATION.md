# Smart Railway Gate Live Monitoring System - API Documentation

This document provides complete, production-ready REST API documentation for the React Native Frontend Team to integrate with the Node.js backend.

---

## 1. Project Overview

### Purpose
The backend serves as the central hub connecting IoT hardware (ESP32) deployed at railway crossings with mobile application users (React Native). It processes high-frequency sensor events, stores immutable history logs, and serves current gate statuses to the mobile app.

### Overall Architecture
The backend is built using the MERN stack (MongoDB, Express.js, Node.js) with Mongoose for ODM.

### System Flow
```text
ESP32 Hardware
      ↓
HTTP POST Payload (JSON)
      ↓
Express.js Backend (iotController)
      ↓
MongoDB Atlas (Master Data & Time-Series Logs)
      ↓
React Native App (Fetches via REST API)
```

---

## 2. Base URL

All endpoints are relative to the Base URL.

**Development URL:**
```text
http://localhost:3000/api
```

**Production URL:**
```text
https://your-production-url.onrender.com/api
```

---

## 3. Authentication

The API uses stateless **JSON Web Tokens (JWT)** for authentication.

- When a user logs in (or verifies their OTP), they receive an `accessToken`.
- This token must be included in the `Authorization` header of all protected requests.

**Format:**
```http
Authorization: Bearer <access_token>
```

- **Public APIs:** `/auth/register`, `/auth/login`, `/auth/verify-otp`, `/iot/status`, `/iot/heartbeat`
- **Protected APIs:** All User, Gates, Devices, and Notification routes.

---

## 4. Standard Response Format

The backend enforces a strict, predictable JSON response format across all endpoints.

### Success
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "key": "value"
  }
}
```

### Validation / Client Error (400)
```json
{
  "success": false,
  "message": "Invalid input provided",
  "error": "Phone number is required"
}
```

### Unauthorized / Forbidden (401 / 403)
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

## 5. Endpoints Documentation

### Authentication

#### POST `/api/auth/register`
**Description:** Register a new user account. (Public)
**Headers:** `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+919876543210",
  "email": "jane@example.com",
  "role": "USER"
}
```
**Success Response (201):** Returns the newly created user object.

#### POST `/api/auth/login`
**Description:** Request an OTP for login. (Public)
**Request Body:**
```json
{ "phone": "+919876543210" }
```
**Success Response (200):** Generates and sends OTP (mocked in response for MVP).

#### POST `/api/auth/verify-otp`
**Description:** Verify OTP and receive JWT tokens. (Public)
**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```
**Success Response (200):** 
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "..." },
    "accessToken": "eyJhbG...",
    "refreshToken": "abc123..."
  }
}
```
**Frontend Note:** Save `accessToken` in SecureStore/AsyncStorage. Send it in headers for future requests.

#### POST `/api/auth/refresh-token`
**Description:** Get a new access token using a refresh token.
**Request Body:** `{ "token": "abc123..." }`
**Success Response (200):** Returns new `accessToken`.

#### POST `/api/auth/logout`
**Description:** Revoke the refresh token to end the session.
**Request Body:** `{ "token": "abc123..." }`

---

### User

#### GET `/api/users/profile`
**Description:** Fetch current user's profile. (Protected)
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):** Returns User document populated with favourite gates.

#### PATCH `/api/users/profile`
**Description:** Update user profile (name, email, fcmToken).
**Request Body:** `{ "name": "New Name" }`

#### GET `/api/users/favourite-gates`
**Description:** Get list of saved gates for the user.

#### PUT `/api/users/favourite-gates`
**Description:** Update the array of favourite gates.
**Request Body:** `{ "gates": ["60d5ec49f1b2c8b1f8e4b2a2"] }`

#### PATCH `/api/users/notifications/enable` & `/disable`
**Description:** Global toggle for push notifications.

---

### Railway Gates

#### POST `/api/gates`
**Description:** Create a new gate (Admin).

#### GET `/api/gates`
**Description:** Get all active railway gates on the map.
**Success Response (200):** Array of gate objects.

#### GET `/api/gates/:id`
**Description:** Get details of a specific gate.

#### GET `/api/gates/code/:gateCode`
**Description:** Lookup gate by unique code (e.g., LC-145).

#### PATCH `/api/gates/:id`
**Description:** Update gate location or details (Admin).

#### DELETE `/api/gates/:id`
**Description:** Soft-delete a gate (isActive: false) (Admin).

#### GET `/api/gates/:id/current-status`
**Description:** Gets the live open/closed status instantly without fetching heavy metadata.
**Frontend Note:** Use this for frequent polling to check if a specific gate is open or closed.

#### GET `/api/gates/:id/history`
**Description:** Fetches reverse-chronological event logs for a specific gate.
**Query Parameters:** `?limit=50` (default 50)
**Frontend Note:** Use this to populate the timeline/history list in the UI.

#### PUT `/api/gates/:id/assign-device`
**Description:** Map hardware to the gate (Admin).

#### DELETE `/api/gates/:id/unassign-device`
**Description:** Remove hardware from gate (Admin).

---

### ESP32 Devices

*(All device routes under `/api/devices` require Admin privileges and handle hardware CRUD, firmware updates, and status overrides.)*
- `POST /api/devices`
- `GET /api/devices`
- `PATCH /api/devices/:id/firmware`
- `PATCH /api/devices/:id/online`

---

### IoT APIs (Hardware Endpoints)

**Note:** These endpoints are specifically designed to be called by the ESP32 hardware, not by the React Native app.

#### POST `/api/iot/status`
**Description:** Triggered by ESP32 when the physical switch detects a state change.
**Request Body:**
```json
{
  "deviceCode": "ESP001",
  "status": "OPEN",
  "sensorType": "REED_SWITCH",
  "source": "HTTP",
  "eventTime": "2026-06-25T14:30:00Z"
}
```
**Backend Flow:** Locates device -> Locates assigned gate -> Updates gate's live status -> Inserts immutable log into `GateEventLog` -> Returns 201.

#### POST `/api/iot/heartbeat`
**Description:** Periodic health ping from ESP32.
**Request Body:**
```json
{
  "deviceCode": "ESP001",
  "rssi": -61,
  "freeHeap": 220000,
  "uptimeSeconds": 4200
}
```
**Backend Flow:** Locates device -> Updates onlineStatus -> Inserts `DeviceHeartbeat` log.

---

### Notifications

- `GET /api/notifications`: Fetch user's alert inbox.
- `POST /api/notifications`: Trigger an alert (System/Admin).
- `PATCH /api/notifications/:id/read`: Mark an alert as read.
- `DELETE /api/notifications/:id`: Delete an alert.
- `GET /api/notifications/unread-count`: Fetch the badge count for the app icon.

---

## 6. Database Reference (For Frontend Understanding)

- **User**: The mobile app user. Can have multiple `Favourite Gates`.
- **RailwayGate**: Master data. Stores the exact location and the *LATEST* state (`OPEN` or `CLOSED`).
- **ESP32Device**: Master hardware data. Linked 1:1 with a `RailwayGate`.
- **GateEventLog**: Huge collection. Stores every status change historically. Maps to a Gate.
- **DeviceHeartbeat**: High-frequency ping logs for hardware health.

*Frontend developers should query `RailwayGate` for current status, and `GateEventLog` for history.*

---

## 7. Common Status Codes

- **200 OK**: Request successful.
- **201 Created**: Resource successfully generated (e.g., Register, IoT Event).
- **400 Bad Request**: Validation failed (missing fields, wrong format). Check `error` property.
- **401 Unauthorized**: JWT token missing, expired, or invalid. (Requires Login).
- **403 Forbidden**: You have a valid token, but lack permissions (e.g., User trying to access Admin route).
- **404 Not Found**: The requested ID or resource does not exist.
- **409 Conflict**: Resource already exists (e.g., Duplicate phone number).
- **500 Server Error**: Backend crashed. Contact the backend team.

---

## 8. API Integration Examples (Axios)

### Setup Axios Instance
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Automatically inject JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Fetching Data Example
```javascript
const fetchGates = async () => {
  try {
    const response = await api.get('/gates');
    if (response.data.success) {
      setGates(response.data.data);
    }
  } catch (err) {
    console.error(err.response?.data?.message || 'Error fetching gates');
  }
};
```

---

## 9. Frontend Integration Guide

### Recommended App Flow
1. **App Launch**: Check SecureStore for `accessToken`.
   - If missing: Show **Login Screen** (`POST /auth/login` -> `POST /auth/verify-otp`).
   - If present: Load Home Screen.
2. **Home Screen (Map/List)**: Fetch `/api/gates` to render pins and initial statuses.
3. **Gate Details Screen**:
   - Fetch `/api/gates/:id/current-status` to display the big OPEN/CLOSED indicator.
   - Fetch `/api/gates/:id/history` to render the timeline UI.
4. **Polling Strategy**: Until WebSocket/Socket.IO is implemented, ping `/api/gates/:id/current-status` every 5-10 seconds while the user is actively viewing a specific gate details screen.

---

## 10. Future APIs (Roadmap)

These features are planned but not yet implemented in the MVP:
- **Socket.IO**: Real-time push of gate status changes directly to the React Native UI.
- **Firebase (FCM)**: Push notifications to wake up the phone when a favourite gate closes.
- **MQTT**: Alternative lightweight protocol for the ESP32.
- **Train Schedule Integration**: Fetching IRCTC or local data.
- **Traffic Analytics**: Calculating average wait times at crossings.
