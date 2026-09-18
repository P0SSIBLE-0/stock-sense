import mongoose from 'mongoose';
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

        cached.promise = (async () => {
            try {
                // 1st attempt: system default DNS (works behind VPNs/firewalls
                // that block outbound queries to 8.8.8.8).
                return await mongoose.connect(MONGODB_URI!, opts);
            } catch (firstError) {
                const code = (firstError as NodeJS.ErrnoException)?.code;
                const syscall = (firstError as NodeJS.ErrnoException)?.syscall;
                const isDnsError = code === 'ECONNREFUSED' && syscall === 'querySrv';

                if (!isDnsError) throw firstError;

                // 2nd attempt: fall back to public DNS (helps on networks
                // whose default resolver can't answer SRV records).
                console.warn(
                    'MongoDB SRV lookup failed with system DNS, retrying via 8.8.8.8 / 1.1.1.1...'
                );
                const dns = (await import('dns')).default;
                dns.setServers(['8.8.8.8', '1.1.1.1']);
                return await mongoose.connect(MONGODB_URI!, opts);
            }
        })();
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
