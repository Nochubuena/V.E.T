import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    const mongoURI = process.env.MONGODB_URI ||
      'mongodb+srv://username:password@vetapp.leeyqyu.mongodb.net/Data?retryWrites=true&w=majority';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not found in environment. Using default Atlas host vetapp.leeyqyu.mongodb.net. Update credentials in backend/.env.');
    }

    // Validate connection string format
    if (!mongoURI || (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://'))) {
      throw new Error('Invalid MongoDB connection string format');
    }

    // Connection options for better reliability
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    await mongoose.connect(mongoURI, options);
    
    const dbName = mongoose.connection.db?.databaseName;
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Connected to database: ${dbName || 'default'}`);
    console.log(`🔗 Connection host: ${mongoose.connection.host}`);
    console.log(`🔌 Connection state: ${getConnectionState(mongoose.connection.readyState)}`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    process.exit(1);
  }
};

// Helper function to get connection state name
const getConnectionState = (state: number): string => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state as keyof typeof states] || 'unknown';
};

// Set up connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;

