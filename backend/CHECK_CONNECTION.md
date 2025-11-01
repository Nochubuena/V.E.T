# Troubleshooting: Data Not Showing in MongoDB

If you signed up but don't see data in the Users collection, check the following:

## 1. Verify Your Connection String

Your MongoDB connection string in `backend/.env` should include the database name "Data".

**Correct format:**
```
MONGODB_URI=mongodb+srv://username:password@vetapp.leeyqyu.mongodb.net/Data?retryWrites=true&w=majority
```

**Common mistake (missing database name):**
```
MONGODB_URI=mongodb+srv://username:password@vetapp.leeyqyu.mongodb.net/?retryWrites=true&w=majority
```
❌ Without `/Data` in the connection string, data might be saved to a default database.

## 2. Check Backend Console

When you start your backend server, you should see:
```
✅ MongoDB Connected Successfully
📊 Connected to database: Data
🔗 Connection host: ...
```

When you sign up, you should see:
```
✅ User saved to Users collection:
   Database: Data
   Collection: Users
   Email: your@email.com
   ID: ...
```

## 3. Verify Backend is Running

Make sure your backend server is running:
```bash
cd backend
npm run dev
```

## 4. Check for Errors

Look for any error messages in the backend console. Common issues:
- Connection string is incorrect
- Database name mismatch
- Network/authentication issues

## 5. Refresh MongoDB Compass

After signing up, refresh your MongoDB Compass view (click the refresh button or press F5).

## 6. Check the Correct Database

Make sure you're looking at the right database in Compass:
- Connection: `vetapp.leeyqyu.mongodb.net`
- Database: `Data` (not `admin`, `config`, or `local`)
- Collection: `Users`

## Quick Fix

1. Open `backend/.env`
2. Ensure your connection string includes `/Data` before the `?`:
   ```
   MONGODB_URI=mongodb+srv://username:password@vetapp.leeyqyu.mongodb.net/Data?retryWrites=true&w=majority
   ```
3. Restart your backend server
4. Try signing up again
5. Check MongoDB Compass

