# MongoDB Quick Start - Command Reference

This is a quick reference for the MongoDB setup process. See `MONGODB_SETUP_GUIDE.md` for detailed explanations.

## 🚀 Quick Setup Steps

### 1. Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev @types/express @types/node typescript ts-node nodemon
```

### 2. Get MongoDB Connection String

**MongoDB Atlas (Cloud):**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP (Allow from anywhere for dev)
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vet-app?retryWrites=true&w=majority`

### 3. Configure Backend

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vet-app?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### 4. Create Backend Files

Copy all files from the guide:
- `backend/src/models/Owner.ts`
- `backend/src/models/Dog.ts`
- `backend/src/config/database.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/routes/auth.ts`
- `backend/src/routes/dogs.ts`
- `backend/src/server.ts`
- `backend/tsconfig.json`

### 5. Update Backend package.json

Add scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 6. Frontend Setup

```bash
# Install axios (from project root, not backend folder)
npm install axios
```

### 7. Update Frontend Files

- Use `src/services/api.ts` (already created)
- Update `src/context/AppContext.tsx` to use API (see `AppContext.API.example.tsx`)

### 8. Update Login/SignUp Screens

Make sure your login and signup screens handle async operations:

```typescript
// Example in LoginScreen
const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    navigation.navigate('Main');
  } else {
    // Show error message
    alert(error || 'Login failed');
  }
};
```

### 9. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### 10. Test Connection

1. Open app in browser/mobile
2. Try to sign up a new owner
3. Try to log in
4. Try to add a dog
5. Check MongoDB Atlas dashboard to verify data is saved

## 📁 File Structure After Setup

```
V.E.T/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Owner.ts
│   │   │   └── Dog.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── dogs.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── services/
│   │   └── api.ts ✅
│   ├── context/
│   │   ├── AppContext.tsx (needs update)
│   │   └── AppContext.API.example.tsx ✅
│   └── screens/
└── package.json
```

## 🔧 Common Issues & Solutions

### CORS Error
- Make sure `cors()` is enabled in backend `server.ts`
- Check that API URL in frontend matches backend port

### Connection Refused
- Ensure backend is running (`npm run dev` in backend folder)
- Check PORT in backend `.env` matches API_BASE_URL in frontend

### Authentication Fails
- Verify JWT_SECRET is set in backend `.env`
- Check that token is being saved and sent in requests

### MongoDB Connection Error
- Verify connection string in `.env`
- Check IP is whitelisted in Atlas
- Verify database user credentials

### For Mobile Apps (not web)
- Replace `localhost` with your computer's IP address
- Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Update `API_BASE_URL` in `src/services/api.ts`

## 🎯 Next Steps After Setup

1. ✅ Test all CRUD operations
2. ✅ Add error handling UI
3. ✅ Add loading states
4. ✅ Update screens to handle async operations
5. ✅ Deploy backend to hosting service
6. ✅ Update production API URL

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Register new owner
- `POST /api/auth/login` - Login owner

### Dogs
- `GET /api/dogs` - Get all dogs for logged-in owner
- `POST /api/dogs` - Add new dog
- `PUT /api/dogs/:id/vitals` - Update dog vitals
- `DELETE /api/dogs/:id` - Delete dog

### Health Check
- `GET /api/health` - Check if API is running

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] JWT_SECRET is strong and unique
- [ ] Passwords are hashed (using bcrypt)
- [ ] CORS is properly configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

---

For detailed explanations, see `MONGODB_SETUP_GUIDE.md`





