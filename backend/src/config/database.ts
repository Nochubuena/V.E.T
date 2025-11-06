import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI ||
      'mongodb+srv://username:password@vetapp.leeyqyu.mongodb.net/Data?retryWrites=true&w=majority';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not found in environment. Using default Atlas host vetapp.leeyqyu.mongodb.net. Update credentials in backend/.env.');
    }

    await mongoose.connect(mongoURI);
    
    const dbName = mongoose.connection.db?.databaseName;
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Connected to database: ${dbName || 'default'}`);
    console.log(`🔗 Connection host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;

