import mongoose, { Mongoose } from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose || {
  conn: null,
  promise: null,
};

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGO_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: 'bookified',
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Mongo connection error', error);
    throw error;
  }

  console.info('Connected to MongoDB');
  return cached.conn;
};
