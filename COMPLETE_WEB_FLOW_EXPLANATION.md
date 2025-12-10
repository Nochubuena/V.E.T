# Complete Web Application Flow - From Sign Up to Auto Updates

This document explains the complete flow of the V.E.T web application, starting from user sign up through to automatic updates when collar data is received.

---

## Table of Contents
1. [User Sign Up Flow](#1-user-sign-up-flow)
2. [Adding a Dog](#2-adding-a-dog)
3. [Manual vs Automatic Updates](#3-manual-vs-automatic-updates)
4. [Complete Data Flow](#4-complete-data-flow)
5. [What Happens Without Collar Hardware](#5-what-happens-without-collar-hardware)
6. [What Happens With Collar Hardware](#6-what-happens-with-collar-hardware)
7. [Auto-Update Mechanism Explained](#7-auto-update-mechanism-explained)

---

## 1. User Sign Up Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Opens Web App                                  │
│                                                              │
│ User navigates to: https://your-app.vercel.app              │
│ Sees: Login Screen                                          │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ User clicks "Sign Up"
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Sign Up Screen                                      │
│                                                              │
│ User enters:                                                │
│ - Name (optional)                                           │
│ - Email: user@example.com                                   │
│ - Password: ********                                        │
│                                                              │
│ Frontend validates:                                         │
│ ✓ Email format                                              │
│ ✓ Password length (min 6 chars)                            │
│ ✓ Name format (if provided)                                │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ User clicks "Sign Up" button
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Backend API Call                                    │
│                                                              │
│ Frontend sends:                                             │
│ POST /api/auth/signup                                       │
│ Body: {                                                     │
│   email: "user@example.com",                               │
│   password: "hashed_password",                             │
│   name: "John Doe"                                          │
│ }                                                           │
│                                                              │
│ Backend:                                                    │
│ 1. Checks if email already exists                          │
│ 2. Hashes password with bcrypt                             │
│ 3. Creates new Owner in MongoDB                             │
│ 4. Generates JWT token                                      │
│ 5. Returns: { token, owner: {...} }                        │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ Success response received
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend Stores Token                               │
│                                                              │
│ Frontend (AppContext.tsx):                                  │
│ - Saves token to localStorage                               │
│ - Sets owner state                                          │
│ - Sets isLoggedIn = true                                    │
│ - Automatically navigates to HomePage                       │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ User is now logged in
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Initial Data Fetch                                  │
│                                                              │
│ AppContext useEffect detects isLoggedIn = true              │
│ Automatically calls: fetchDogs()                           │
│                                                              │
│ Frontend sends:                                             │
│ GET /api/dogs                                               │
│ Headers: Authorization: Bearer <token>                      │
│                                                              │
│ Backend:                                                    │
│ - Validates token                                           │
│ - Finds all dogs for this owner                             │
│ - Returns: [] (empty array - no dogs yet)                   │
│                                                              │
│ Frontend:                                                   │
│ - Sets dogs = []                                            │
│ - HomePage shows "You don't have any dogs registered yet"  │
└─────────────────────────────────────────────────────────────┘
```

### Key Points:
- **User signs up** → Account created in database
- **Token stored** → Used for all future API calls
- **Auto-login** → User immediately logged in after signup
- **Auto-fetch dogs** → AppContext automatically fetches dogs (empty initially)

---

## 2. Adding a Dog

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Clicks "Sign up your dog now"                 │
│                                                              │
│ HomePage shows button (when dogs.length === 0)             │
│ User clicks → Navigates to SignUpDogScreen                 │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ User fills form
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: User Enters Dog Information                        │
│                                                              │
│ User enters:                                                │
│ - Dog Name: "Max"                                           │
│ - Optional: Upload image                                    │
│ - Optional: Initial heart rate (manual entry)               │
│ - Optional: Initial temperature (manual entry)             │
│                                                              │
│ User clicks "Add Dog"                                       │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ Form submitted
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Backend API Call                                    │
│                                                              │
│ Frontend sends:                                             │
│ POST /api/dogs                                              │
│ Headers: Authorization: Bearer <token>                      │
│ Body: {                                                     │
│   name: "Max",                                             │
│   imageUri: "data:image/...",                              │
│   heartRate: 72,                                           │
│   temperature: 38.5                                         │
│ }                                                           │
│                                                              │
│ Backend:                                                    │
│ 1. Validates token                                          │
│ 2. Checks if dog name already exists for this owner        │
│ 3. Creates new Dog document in MongoDB:                     │
│    {                                                        │
│      name: "Max",                                           │
│      ownerId: <owner_id>,                                   │
│      imageUri: "...",                                       │
│      heartRate: 72,                                        │
│      temperature: 38.5,                                    │
│      vitalRecords: []                                      │
│    }                                                        │
│ 4. Returns created dog with MongoDB _id                     │
└────────────────────┬────────────────────────────────────────┘
                      │
                      │ Success response received
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend Updates State                              │
│                                                              │
│ AppContext (addDog function):                              │
│ - Adds new dog to dogs array                                │
│ - Updates UI immediately                                    │
│                                                              │
│ HomePage:                                                   │
│ - Shows dog profile card                                    │
│ - Displays "Max" with image                                 │
│ - Shows vitals: Heart Rate: 72, Temp: 38.5°C               │
└─────────────────────────────────────────────────────────────┘
```

### Key Points:
- **Dog added** → Stored in MongoDB with owner association
- **Immediate UI update** → Dog appears on HomePage right away
- **Initial vitals** → Can be set manually or left empty (will be updated by collar later)

---

## 3. Manual vs Automatic Updates

### Manual Updates (Before Collar Integration)

**How it worked before:**
- User manually enters heart rate and temperature
- User clicks "Update" button
- Frontend sends PUT request to backend
- Backend saves data
- Frontend refreshes to show new data

**Current state:**
- Manual updates still work
- But now there's also automatic updates

### Automatic Updates (With Polling)

**How it works now:**
- Frontend automatically fetches latest data every 5 seconds
- No user interaction needed
- If backend has new data (from collar or manual update), frontend shows it automatically

---

## 4. Complete Data Flow

### Scenario A: User Just Signed Up (No Collar Yet)

```
┌─────────────────────────────────────────────────────────────┐
│ TIME: 10:00 AM                                              │
│                                                              │
│ 1. User signs up                                            │
│    → Account created                                        │
│    → Token stored                                           │
│    → Logged in                                              │
│                                                              │
│ 2. AppContext auto-fetches dogs                             │
│    → GET /api/dogs                                          │
│    → Returns: [] (empty)                                   │
│                                                              │
│ 3. HomePage shows: "You don't have any dogs registered"    │
│                                                              │
│ 4. Polling starts (every 5 seconds)                       │
│    → GET /api/dogs (every 5s)                             │
│    → Still returns: []                                     │
│    → UI shows: "Live" indicator                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIME: 10:05 AM                                              │
│                                                              │
│ 1. User adds dog "Max"                                      │
│    → POST /api/dogs                                         │
│    → Dog created in database                                │
│    → Frontend updates immediately                           │
│                                                              │
│ 2. HomePage shows Max's profile                             │
│    → Heart Rate: 72 (from initial data)                    │
│    → Temperature: 38.5°C (from initial data)              │
│    → "Live" indicator showing                              │
│                                                              │
│ 3. Polling continues (every 5 seconds)                    │
│    → GET /api/dogs                                          │
│    → Returns: [{ id: "123", name: "Max", ... }]           │
│    → UI updates automatically                               │
│    → Shows "Updated Xs ago"                                │
└─────────────────────────────────────────────────────────────┘
```

### Scenario B: With Collar Hardware (Future)

```
┌─────────────────────────────────────────────────────────────┐
│ TIME: 10:00 AM                                              │
│                                                              │
│ COLLAR HARDWARE (Arduino):                                  │
│ - Reads temperature sensor: 38.5°C                         │
│ - Reads pulse sensor: 72 BPM                               │
│ - Sends serial: "Temperature:38.5C 101.3F\nWaveform:1850  │
│   BPM:72 \n"                                                │
└────────────────────┬────────────────────────────────────────┘
                      │ USB/Serial
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ BRIDGE SERVICE (Running at home):                           │
│ - Receives serial data                                      │
│ - Parses: { temp: 38.5, bpm: 72 }                          │
│ - Calculates status: "normal"                              │
│ - Sends HTTP PUT to backend                                 │
└────────────────────┬────────────────────────────────────────┘
                      │ Internet
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API:                                                │
│ - Receives: PUT /api/dogs/123/vitals                       │
│ - Validates data                                            │
│ - Updates MongoDB:                                          │
│   {                                                         │
│     heartRate: 72,                                         │
│     temperature: 38.5,                                     │
│     vitalRecords: [                                        │
│       { heartRate: 72, temp: 38.5, time: "10:00:00", ... }│
│     ]                                                       │
│   }                                                         │
│ - Returns updated dog data                                  │
└────────────────────┬────────────────────────────────────────┘
                      │ Database updated
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Web App):                                         │
│ - Polling runs every 5 seconds                             │
│ - At 10:00:05, sends GET /api/dogs                         │
│ - Receives updated dog data                                 │
│ - Updates UI automatically                                  │
│ - Shows: Heart Rate: 72, Temp: 38.5°C                     │
│ - "Live" indicator pulses                                  │
│ - "Updated 5s ago" updates                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIME: 10:00:10 (10 seconds later)                          │
│                                                              │
│ COLLAR → BRIDGE → BACKEND → DATABASE                       │
│ (Same flow, new data: HR=73, Temp=38.6)                    │
│                                                              │
│ FRONTEND:                                                   │
│ - At 10:00:10, polling fetches again                        │
│ - Receives new data                                         │
│ - UI updates automatically                                  │
│ - Shows: Heart Rate: 73, Temp: 38.6°C                     │
│ - Charts update smoothly                                    │
│                                                              │
│ USER SEES:                                                  │
│ - Data updates automatically                                │
│ - No page refresh needed                                    │
│ - Real-time feel (5 second delay)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. What Happens Without Collar Hardware

### Current State (No Hardware)

```
┌─────────────────────────────────────────────────────────────┐
│ USER EXPERIENCE:                                            │
│                                                              │
│ 1. User signs up                                            │
│    ✓ Account created                                        │
│    ✓ Logged in                                              │
│                                                              │
│ 2. User adds dog                                            │
│    ✓ Dog created                                            │
│    ✓ Can set initial vitals manually                       │
│                                                              │
│ 3. Polling starts automatically                            │
│    ✓ Fetches data every 5 seconds                         │
│    ✓ Shows "Live" indicator                                │
│    ✓ Shows "Updated Xs ago"                                │
│                                                              │
│ 4. Data stays static                                        │
│    ⚠ No collar sending data                                │
│    ⚠ Vitals don't change automatically                     │
│    ⚠ But polling still works (just no new data)            │
│                                                              │
│ 5. User can manually update                                │
│    ✓ Can edit vitals through UI (if you add that feature)  │
│    ✓ Or use API directly                                   │
│    ✓ Polling will pick up changes                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Points:
- **Everything works** except automatic data collection
- **Polling still runs** - just fetches same data repeatedly
- **UI shows "Live"** - indicates polling is active
- **Ready for collar** - when hardware is connected, data will flow automatically

---

## 6. What Happens With Collar Hardware

### Future State (With Hardware)

```
┌─────────────────────────────────────────────────────────────┐
│ SETUP PHASE:                                                │
│                                                              │
│ 1. User connects Arduino collar to computer                │
│    → USB cable connected                                    │
│                                                              │
│ 2. User sets up bridge service                             │
│    → cd bridge-service                                      │
│    → npm install                                            │
│    → Copy .env.example to .env                              │
│    → Configure: SERIAL_PORT, DOG_ID, AUTH_TOKEN             │
│    → npm start                                              │
│                                                              │
│ 3. Bridge service connects                                 │
│    → Connects to serial port                                │
│    → Starts reading Arduino data                           │
│    → Begins sending to backend API                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RUNTIME PHASE:                                              │
│                                                              │
│ CONTINUOUS LOOP (Every Second):                            │
│                                                              │
│ Arduino:                                                    │
│ → Reads sensors                                             │
│ → Sends serial data                                         │
│                                                              │
│ Bridge Service:                                             │
│ → Receives serial data                                      │
│ → Parses temperature & BPM                                 │
│ → Sends HTTP PUT to backend (every 5 seconds)             │
│                                                              │
│ Backend:                                                    │
│ → Receives PUT request                                      │
│ → Validates data                                            │
│ → Updates MongoDB                                           │
│ → Returns success                                            │
│                                                              │
│ Frontend (Web App):                                         │
│ → Polling fetches GET /api/dogs (every 5 seconds)          │
│ → Receives updated dog data                                 │
│ → Updates UI automatically                                  │
│ → Shows latest vitals                                       │
│                                                              │
│ USER SEES:                                                  │
│ → Data updating automatically                               │
│ → "Live" indicator active                                  │
│ → Real-time health monitoring                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Auto-Update Mechanism Explained

### How Polling Works

```typescript
// In AppContext.tsx

// This useEffect runs when user logs in
useEffect(() => {
  if (!isLoggedIn || !owner) {
    setIsPolling(false);
    return; // Stop polling if logged out
  }

  // Start polling every 5 seconds
  const interval = setInterval(() => {
    fetchDogs(); // Fetch latest data from backend
  }, 5000); // 5000ms = 5 seconds

  setIsPolling(true);

  // Cleanup when component unmounts or user logs out
  return () => {
    clearInterval(interval);
    setIsPolling(false);
  };
}, [isLoggedIn, owner]);
```

### Timeline Example

```
TIME    | EVENT                          | RESULT
--------|--------------------------------|------------------
10:00:00| User logs in                   | Polling starts
10:00:00| fetchDogs() called             | Gets initial data
10:00:05| Polling: fetchDogs()           | Gets latest data
10:00:10| Polling: fetchDogs()           | Gets latest data
10:00:15| Polling: fetchDogs()           | Gets latest data
10:00:20| Collar sends new data          | Backend updates DB
10:00:20| Polling: fetchDogs()           | Gets NEW data! UI updates
10:00:25| Polling: fetchDogs()           | Gets latest data
10:00:30| User logs out                  | Polling stops
```

### What Happens During Polling

1. **Every 5 seconds**, frontend sends: `GET /api/dogs`
2. **Backend responds** with current dog data from MongoDB
3. **Frontend updates** `dogs` state with new data
4. **React re-renders** components that use `dogs`
5. **UI updates** automatically (no page refresh needed)

### Visual Indicators

**HomePage shows:**
- **"Live" badge** - Green dot + "Live" text (when `isPolling === true`)
- **"Updated Xs ago"** - Shows seconds since last update
- **Manual refresh button** - User can force refresh

**DogHealthScreen shows:**
- **Last updated timestamp** - When vitals were last updated
- **Stale warning** - If data is >1 minute old

---

## Complete User Journey

### Day 1: Sign Up and Setup

```
10:00 AM - User signs up
           → Account created
           → Logged in automatically
           → Polling starts
           → No dogs yet

10:05 AM - User adds dog "Max"
           → Dog created in database
           → Appears on HomePage
           → Shows initial vitals (if provided)
           → Polling continues

10:10 AM - User browses app
           → Sees "Live" indicator
           → Sees "Updated Xs ago"
           → Data stays same (no collar yet)
```

### Day 2: Collar Setup (Future)

```
09:00 AM - User connects Arduino collar
           → USB connected to computer

09:05 AM - User sets up bridge service
           → Installs dependencies
           → Configures .env file
           → Starts bridge service
           → Bridge connects to Arduino

09:10 AM - Collar starts sending data
           → Arduino reads sensors every second
           → Bridge sends to backend every 5 seconds
           → Backend updates database
           → Frontend polling picks up changes
           → User sees data updating automatically!

09:15 AM - User checks web app
           → Sees "Live" indicator active
           → Sees current heart rate: 72 BPM
           → Sees current temperature: 38.5°C
           → Sees "Updated 3s ago"
           → Data updates every 5 seconds
```

### Ongoing: Continuous Monitoring

```
Every Second:
  Arduino → Reads sensors → Sends serial data

Every 5 Seconds:
  Bridge → Sends HTTP PUT → Backend updates DB
  Frontend → Sends GET → Receives latest data → UI updates

User Experience:
  → Opens web app anytime
  → Sees current vitals
  → Sees "Live" indicator
  → Data updates automatically
  → Can check from anywhere (phone, computer, tablet)
```

---

## Key Takeaways

### 1. **Auto-Update Works Immediately**
   - No collar needed for polling to work
   - Polling starts when user logs in
   - Shows "Live" indicator even without hardware

### 2. **Ready for Collar Integration**
   - Backend ready to receive collar data
   - Frontend ready to display updates
   - Bridge service code ready (just needs hardware)

### 3. **User Doesn't Need to Do Anything**
   - Once logged in, polling starts automatically
   - Once collar is set up, data flows automatically
   - User just opens web app and sees updates

### 4. **Works Without Hardware**
   - All code works without Arduino
   - Polling still runs (just no new data)
   - UI shows "Live" indicator
   - Ready to receive data when hardware is connected

### 5. **Seamless Experience**
   - No page refreshes needed
   - Data updates automatically
   - Real-time feel (5 second delay)
   - Works on any device (web app)

---

## Summary Flow Diagram

```
USER SIGN UP
    ↓
ACCOUNT CREATED → TOKEN STORED → LOGGED IN
    ↓
POLLING STARTS (every 5 seconds)
    ↓
USER ADDS DOG → DOG CREATED IN DATABASE
    ↓
POLLING FETCHES DOG DATA → UI SHOWS DOG
    ↓
[WITHOUT HARDWARE]
    → Polling continues, data stays same
    → "Live" indicator shows
    → Ready for collar

[WITH HARDWARE]
    → Collar sends data → Backend updates
    → Polling fetches → UI updates automatically
    → User sees real-time updates
```

---

This is how the complete flow works from sign up to automatic updates!

