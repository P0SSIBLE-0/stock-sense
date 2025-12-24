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
