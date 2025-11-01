# MongoDB Connection Guide - Step by Step

This guide will walk you through connecting your V.E.T app to MongoDB. You'll need to set up a backend server and configure your frontend to communicate with it.

## Prerequisites

- Node.js (v18 or higher) installed
- MongoDB account (free tier available at MongoDB Atlas)
- Basic understanding of REST APIs

---

## Step 1: Set Up MongoDB Database

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create a MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster:**
   - Choose the FREE tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (SAVE THESE - you'll need them!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
   - Click "Confirm"

5. **Get Your Connection String:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual database password

### Option B: Local MongoDB Installation

1. **Install MongoDB Community Server:**
   - Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS
   - Start MongoDB service
   - Connection string will be: `mongodb://localhost:27017/vet-app`

---

## Step 2: Create Backend Server Directory

1. **Create a new folder for your backend:**
   ```bash
   # In your project root
   mkdir backend
   cd backend
   ```

2. **Initialize npm project:**
   ```bash
   npm init -y
   ```

---

## Step 3: Install Backend Dependencies

Install the required packages for your backend server:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev @types/express @types/node typescript ts-node nodemon
```

**Package explanations:**
- `express`: Web framework for Node.js
- `mongoose`: MongoDB object modeling for Node.js
- `cors`: Enable Cross-Origin Resource Sharing
- `dotenv`: Load environment variables
- `bcryptjs`: Hash passwords securely
- `jsonwebtoken`: Create authentication tokens
- `typescript`, `ts-node`: TypeScript support
- `nodemon`: Auto-restart server during development

---

## Step 4: Set Up Backend Project Structure

Create the following folder structure in your `backend` folder:

```
backend/
├── src/
│   ├── models/
│   │   ├── Owner.ts
│   │   └── Dog.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── owners.ts
│   │   └── dogs.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Step 5: Create TypeScript Configuration

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Step 6: Create Environment Variables File

Create `backend/.env`:

```env
# MongoDB Connection String
# For Atlas: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vet-app?retryWrites=true&w=majority
# For Local: mongodb://localhost:27017/vet-app
MONGODB_URI=your_connection_string_here

# Server Port
PORT=3000

# JWT Secret (change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**⚠️ IMPORTANT:** Add `.env` to `.gitignore` to keep your credentials safe!

Create `backend/.gitignore`:
```
node_modules/
dist/
.env
*.log
```

---

## Step 7: Create Database Models

### `backend/src/models/Owner.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IOwner extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOwner>('Owner', OwnerSchema);
```

### `backend/src/models/Dog.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalRecord {
  heartRate: number;
  temperature: number;
  status: string;
  time: string;
}

export interface IDog extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  imageUri?: string;
  heartRate?: number;
  temperature?: number;
  vitalRecords?: IVitalRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const VitalRecordSchema: Schema = new Schema({
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
}, { _id: false });

const DogSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },
    imageUri: {
      type: String,
    },
    heartRate: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    vitalRecords: {
      type: [VitalRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
DogSchema.index({ ownerId: 1, name: 1 });

export default mongoose.model<IDog>('Dog', DogSchema);
```

---

## Step 8: Create Database Connection

### `backend/src/config/database.ts`
```typescript
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## Step 9: Create Authentication Middleware

### `backend/src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

---

## Step 10: Create API Routes

### `backend/src/routes/auth.ts`
```typescript
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Owner from '../models/Owner';

const router = express.Router();

// Register Owner
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if owner exists
    const existingOwner = await Owner.findOne({ email: email.toLowerCase() });
    if (existingOwner) {
      return res.status(400).json({ error: 'Owner already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner
    const owner = new Owner({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
    });

    await owner.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: owner._id.toString() },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      owner: {
        id: owner._id.toString(),
        email: owner.email,
        name: owner.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Owner
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find owner
    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: owner._id.toString() },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      owner: {
        id: owner._id.toString(),
        email: owner.email,
        name: owner.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

### `backend/src/routes/dogs.ts`
```typescript
import express, { Response } from 'express';
import Dog from '../models/Dog';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all dogs for logged-in owner
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await Dog.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    res.json(dogs.map(dog => ({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
    })));
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new dog
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUri, heartRate, temperature } = req.body;

    // Check if dog with same name already exists for this owner
    const existingDog = await Dog.findOne({
      ownerId: req.userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive
    });

    if (existingDog) {
      return res.status(400).json({ error: 'Dog with this name already exists' });
    }

    const dog = new Dog({
      name: name.trim(),
      ownerId: req.userId,
      imageUri,
      heartRate,
      temperature,
      vitalRecords: [],
    });

    await dog.save();

    res.status(201).json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
    });
  } catch (error) {
    console.error('Add dog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update dog vitals
router.put('/:id/vitals', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { heartRate, temperature, status, time } = req.body;

    const dog = await Dog.findOne({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Update current vitals
    dog.heartRate = heartRate;
    dog.temperature = temperature;

    // Add to vital records
    if (heartRate && temperature && status && time) {
      dog.vitalRecords = dog.vitalRecords || [];
      dog.vitalRecords.push({
        heartRate,
        temperature,
        status,
        time,
      });
    }

    await dog.save();

    res.json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a dog
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findOneAndDelete({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Delete dog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

---

## Step 11: Create Main Server File

### `backend/src/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import dogsRoutes from './routes/dogs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'V.E.T API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## Step 12: Update Backend package.json Scripts

Update `backend/package.json` to include these scripts:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Step 13: Install Frontend API Client

In your main project root (not backend folder), install axios for making API calls:

```bash
npm install axios
```

---

## Step 14: Create API Service in Frontend

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

// Update this to your backend URL
// For local development: http://localhost:3000
// For production: https://your-backend-domain.com
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-backend-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get token from storage
const getStoredToken = (): string | null => {
  // Use AsyncStorage in React Native or localStorage in web
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to save token
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('authToken', token);
  }
};

// Helper function to remove token
export const removeToken = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('authToken');
  }
};

export default api;
```

---

## Step 15: Update AppContext to Use API

Update `src/context/AppContext.tsx` to make API calls instead of using in-memory storage. See the updated file in the next section.

---

## Step 16: Update Your Frontend Context

The AppContext needs to be updated to call your API. Here's what needs to change:

1. Import the API service
2. Replace in-memory storage with API calls
3. Handle loading and error states
4. Store authentication token

---

## Step 17: Test Your Setup

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **In a new terminal, start your frontend:**
   ```bash
   npm start
   ```

3. **Test the connection:**
   - Try signing up a new owner
   - Try logging in
   - Try adding a dog
   - Check MongoDB Atlas dashboard to see if data is saved

---

## Step 18: Environment-Specific Configuration

For web builds, you may need to handle CORS and API URLs differently. Update your API service to handle different environments:

```typescript
// In production, you'll need to deploy your backend and update this URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

Create a `.env` file in your frontend root:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## Troubleshooting

### Connection Issues
- **MongoDB Atlas:** Make sure your IP is whitelisted
- **Local MongoDB:** Ensure MongoDB service is running
- **Connection String:** Double-check your connection string in `.env`

### CORS Errors
- Make sure `cors()` middleware is enabled in your backend
- Check that your frontend URL is allowed

### Authentication Errors
- Verify JWT_SECRET is set in backend `.env`
- Check that token is being sent in Authorization header

### Network Errors
- For mobile apps, use your computer's IP address instead of `localhost`
- Update API_BASE_URL to `http://YOUR_IP:3000/api`

---

## Next Steps

1. ✅ Test all CRUD operations
2. ✅ Add error handling in frontend
3. ✅ Add loading states
4. ✅ Deploy backend to a hosting service (Heroku, Railway, Render, etc.)
5. ✅ Update frontend API URL for production
6. ✅ Add input validation
7. ✅ Add password strength requirements
8. ✅ Add email verification (optional)

---

## Deployment Options for Backend

### Option 1: Railway
- Push backend to GitHub
- Connect Railway to your repo
- Add environment variables
- Deploy!

### Option 2: Render
- Similar process to Railway
- Free tier available

### Option 3: Heroku
- Requires credit card for free tier
- Push to GitHub and connect

After deployment, update your frontend API_BASE_URL to point to your deployed backend URL.

---

## Security Notes

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Validate all user inputs**
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Add request validation**

---

Congratulations! You've successfully connected your V.E.T app to MongoDB! 🎉

