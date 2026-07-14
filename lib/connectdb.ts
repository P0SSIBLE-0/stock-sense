import mongoose from 'mongoose';
import dns from 'node:dns';

// Explicitly set DNS servers to override local network restrictions
if (typeof window === 'undefined') {
    dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please provide a MONGODB_URI in the environment variables');
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = {
        conn: null,
        promise: null,
    }
}

export const connectToDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    console.log(`MongoDB connected successfully with ${process.env.NODE_ENV}`);

    return cached.conn;
}
