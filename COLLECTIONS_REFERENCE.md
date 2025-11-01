# MongoDB Collections Reference

Your V.E.T app uses two MongoDB collections that you created on Render.

## 📊 Collection Structure

### **Users** Collection
Stores pet owner/user account information.

**Fields:**
- `_id` - ObjectId (auto-generated)
- `email` - String (required, unique, lowercase)
- `password` - String (required, hashed with bcrypt)
- `name` - String (optional)
- `createdAt` - Date (auto-generated timestamp)
- `updatedAt` - Date (auto-updated timestamp)

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john@example.com",
  "password": "$2a$10$encrypted_hash_here...",
  "name": "John Doe",
  "createdAt": ISODate("2025-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2025-01-15T10:30:00.000Z")
}
```

---

### **Dogs** Collection
Stores dog/pet profiles linked to their owners.

**Fields:**
- `_id` - ObjectId (auto-generated)
- `name` - String (required)
- `ownerId` - ObjectId (required, references Users._id)
- `imageUri` - String (optional, URL/path to dog image)
- `heartRate` - Number (optional, current heart rate)
- `temperature` - Number (optional, current temperature)
- `vitalRecords` - Array of objects (optional, historical vital signs)
  - `heartRate` - Number (required)
  - `temperature` - Number (required)
  - `status` - String (required, e.g., "Normal", "Abnormal")
  - `time` - String (required, timestamp)
- `createdAt` - Date (auto-generated timestamp)
- `updatedAt` - Date (auto-updated timestamp)

**Indexes:**
- Compound index on `ownerId` + `name` for faster queries

**Example Document:**
```json
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "name": "Buddy",
  "ownerId": ObjectId("507f1f77bcf86cd799439011"),
  "imageUri": "https://example.com/buddy.jpg",
  "heartRate": 120,
  "temperature": 100.5,
  "vitalRecords": [
    {
      "heartRate": 125,
      "temperature": 99.8,
      "status": "Normal",
      "time": "2:30 pm"
    },
    {
      "heartRate": 120,
      "temperature": 100.5,
      "status": "Normal",
      "time": "3:00 pm"
    }
  ],
  "createdAt": ISODate("2025-01-15T10:35:00.000Z"),
  "updatedAt": ISODate("2025-01-15T11:00:00.000Z")
}
```

---

## 🔗 Relationships

- **One-to-Many**: Each user (Users) can have multiple dogs (Dogs)
- **Many-to-One**: Each dog belongs to one owner
- The relationship is maintained via `ownerId` in the Dogs collection

---

## 🔍 How Queries Work

### Authentication & Authorization
- All requests include a JWT token in the `Authorization` header
- Token contains `userId` which maps to `Users._id`
- Backend validates token and extracts `userId`
- Users can only access their own dogs

### Common Query Patterns

**Get all dogs for logged-in user:**
```
Dogs.find({ ownerId: userId })
```

**Find owner by email:**
```
Users.findOne({ email: "john@example.com" })
```

**Find dog by owner and name:**
```
Dogs.findOne({ ownerId: userId, name: "Buddy" })
```

---

## ✅ What You Need on Render

✅ **Collections Created:**
- `Users` - For user accounts
- `Dogs` - For pet profiles

✅ **Backend Configured:**
- Models point to your collection names
- Authentication routes handle Users
- Dog routes handle Dogs
- Passwords are hashed
- Indexes are set up automatically

---

## 🧪 Testing the Collections

After deploying your backend:

1. **Sign up** → Creates document in `Users`
2. **Login** → Retrieves from `Users`
3. **Add dog** → Creates document in `Dogs`
4. **View dogs** → Queries `Dogs` by `ownerId`
5. **Update vitals** → Updates document in `Dogs`

---

## 📝 Important Notes

- **Collection names**: Fixed to `Users` and `Dogs` (capitalized)
- **Passwords**: Never stored in plain text (bcrypt hashed)
- **Timestamps**: Auto-managed by Mongoose
- **Vital records**: Stored as embedded documents (not separate collection)
- **Owner reference**: `ownerId` links dogs to owners
- **Unique constraint**: Email must be unique in Users collection

---

## 🚀 Ready to Use!

Your collections are properly configured. Just make sure your backend `.env` has the correct MongoDB connection string from Render, and you're all set!

