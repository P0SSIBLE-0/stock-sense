import { betterAuth } from "better-auth";
import { connectToDatabase } from "../connectdb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
    if (authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("Database connection not found");
    }

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
        secret: process.env.BETTER_AUTH_SECRET!,
        baseURL: process.env.BETTER_AUTH_URL!,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            maxPasswordLength: 128,
            minPasswordLength: 8,
            autoSignIn: true,
        },
        plugins: [
            nextCookies()
        ]
    })

    return authInstance;

}

export const auth = await getAuth();
// Don't use top-level await - it causes Turbopack to crash on Windows
// Use getAuth() inside your server actions instead