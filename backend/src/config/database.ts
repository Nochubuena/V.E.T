import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
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

