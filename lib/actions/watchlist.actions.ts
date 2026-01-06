"use server";

import { connectToDatabase } from "../connectdb";
import { Watchlist } from "../../models/watchlist.model";

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            return [];
        }

        const user = await db.collection("user").findOne(
            { email },
            { projection: { id: 1, _id: 1, email: 1 } }
        );

        if (!user) {
            return [];
        }

        const userId = user.id || user._id.toString() || '';

        const watchlistItems = await Watchlist.find({ userId }).select("symbol").lean(); // Returns array of documents

        // Extract symbols via map
        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error("Error fetching watchlist symbols:", error);
        return [];
    }
};

export const removeFromWatchlist = async (email: string, symbol: string): Promise<boolean> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) return false;

        const user = await db.collection("user").findOne(
            { email },
            { projection: { id: 1, _id: 1, email: 1 } }
        );

        if (!user) return false;

        const userId = user.id || user._id.toString() || '';

        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

        return true;
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return false;
    }
};

export const checkWatchlistStatus = async (email: string, symbol: string): Promise<boolean> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) return false;

        const user = await db.collection("user").findOne(
            { email },
            { projection: { id: 1, _id: 1, email: 1 } }
        );

        if (!user) return false;

        const userId = user.id || user._id.toString() || '';

        const exists = await Watchlist.exists({ userId, symbol: symbol.toUpperCase() });
        return !!exists;
    } catch (error) {
        console.error("Error checking watchlist status:", error);
        return false;
    }
}

export const addToWatchlist = async (email: string, symbol: string, company: string): Promise<boolean> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            return false;
        }

        const user = await db.collection("user").findOne(
            { email },
            { projection: { id: 1, _id: 1, email: 1 } }
        );

        if (!user) {
            return false;
        }

        const userId = user.id || user._id.toString() || '';

        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company: company
        });

        return true;
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return false;
    }
};
