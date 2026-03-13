"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../connectdb";
import { StockAlert, type AlertCondition, type AlertFrequency, type AlertMetric } from "../../models/alert.model";
import { Watchlist } from "../../models/watchlist.model";
import { formatPrice, normalizeSymbol } from "../utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

export type CreateWatchlistAlertInput = {
    email: string;
    alertName: string;
    symbol: string;
    metric: AlertMetric;
    condition: AlertCondition;
    threshold: number;
    frequency: AlertFrequency;
};

export type UpdateWatchlistAlertInput = CreateWatchlistAlertInput & {
    alertId: string;
};

export type WatchlistAlertView = {
    id: string;
    symbol: string;
    company: string;
    alertName: string;
    metric: AlertMetric;
    condition: AlertCondition;
    threshold: number;
    frequency: AlertFrequency;
    conditionLabel: string;
    frequencyLabel: string;
    priceLabel: string;
    changeLabel: string;
    priceTone: "up" | "down" | "flat";
    logoUrl?: string;
    createdAt: string;
};

export type AlertProcessingRecord = {
    id: string;
    userEmail: string;
    symbol: string;
    company: string;
    alertName: string;
    metric: AlertMetric;
    condition: AlertCondition;
    threshold: number;
    frequency: AlertFrequency;
    lastTriggeredAt: string | null;
    triggeredCount: number;
};

export type AlertMarketSnapshot = {
    currentPrice: number;
    changePercent: number;
    currentVolume: number;
    averageVolume: number | null;
};

type InternalUserRecord = {
    userId: string;
    email: string;
};

type AlertProfile = {
    logo?: string;
};

type NormalizedAlertPayload = {
    symbol: string;
    alertName: string;
    threshold: number;
};

async function fetchJSON<T>(url: string): Promise<T> {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Finnhub request failed ${response.status}: ${text}`);
    }

    return (await response.json()) as T;
}

function getFinnhubToken() {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!token) {
        throw new Error("FINNHUB API key is not configured");
    }

    return token;
}

async function getUserByEmail(email: string): Promise<InternalUserRecord | null> {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
        return null;
    }

    const user = await db.collection("user").findOne(
        { email },
        { projection: { id: 1, _id: 1, email: 1 } }
    );

    if (!user?.email) {
        return null;
    }

    return {
        userId: user.id || user._id?.toString() || "",
        email: user.email,
    };
}

function normalizeAlertInput(input: CreateWatchlistAlertInput): NormalizedAlertPayload | null {
    const symbol = normalizeSymbol(input.symbol || "");
    const alertName = input.alertName.trim();
    const threshold = Number(input.threshold);

    if (!symbol || !alertName || !Number.isFinite(threshold) || threshold <= 0) {
        return null;
    }

    return {
        symbol,
        alertName,
        threshold,
    };
}

async function ensureWatchlistOwnership(userId: string, symbol: string) {
    return Watchlist.findOne({ userId, symbol }).lean();
}

async function hasDuplicateActiveAlert(params: {
    userId: string;
    symbol: string;
    metric: AlertMetric;
    condition: AlertCondition;
    threshold: number;
    frequency: AlertFrequency;
    excludeAlertId?: string;
}) {
    const query: Record<string, unknown> = {
        userId: params.userId,
        symbol: params.symbol,
        metric: params.metric,
        condition: params.condition,
        threshold: params.threshold,
        frequency: params.frequency,
        status: "active",
    };

    if (params.excludeAlertId) {
        query._id = { $ne: params.excludeAlertId };
    }

    return StockAlert.exists(query);
}

function formatAlertConditionLabel(metric: AlertMetric, condition: AlertCondition, threshold: number) {
    const operator = condition === "greater" ? ">" : "<";
    const formattedThreshold = metric === "price"
        ? formatPrice(threshold)
        : `${threshold.toFixed(2)}M shares`;

    return `${metric === "price" ? "Price" : "Volume"} ${operator} ${formattedThreshold}`;
}

function formatAlertFrequencyLabel(frequency: AlertFrequency) {
    if (frequency === "hourly") return "Once per hour";
    if (frequency === "once") return "Only once";
    return "Once per day";
}

function formatChangeLabel(changePercent: number) {
    if (!Number.isFinite(changePercent) || changePercent === 0) {
        return "0.00%";
    }

    const sign = changePercent > 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(2)}%`;
}

async function getAlertQuote(symbol: string) {
    const token = getFinnhubToken();
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    return fetchJSON<{ c?: number; dp?: number; v?: number }>(url);
}

async function getAlertProfile(symbol: string) {
    const token = getFinnhubToken();
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    return fetchJSON<AlertProfile>(url);
}

async function getAverageDailyVolume(symbol: string) {
    const token = getFinnhubToken();
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60);
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${token}`;
    const data = await fetchJSON<{ s?: string; v?: number[] }>(url);

    if (data.s !== "ok" || !Array.isArray(data.v) || data.v.length === 0) {
        return null;
    }

    const total = data.v.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    return total > 0 ? total / data.v.length : null;
}

export async function createWatchlistAlert(input: CreateWatchlistAlertInput) {
    try {
        const user = await getUserByEmail(input.email);

        if (!user?.userId) {
            return { success: false, message: "User not found." };
        }

        const normalizedInput = normalizeAlertInput(input);

        if (!normalizedInput) {
            return { success: false, message: "Fill in a valid alert name, symbol, and threshold." };
        }

        const watchlistItem = await ensureWatchlistOwnership(user.userId, normalizedInput.symbol);

        if (!watchlistItem) {
            return { success: false, message: "You can only create alerts for stocks in your watchlist." };
        }

        const duplicate = await hasDuplicateActiveAlert({
            userId: user.userId,
            symbol: normalizedInput.symbol,
            metric: input.metric,
            condition: input.condition,
            threshold: normalizedInput.threshold,
            frequency: input.frequency,
        });

        if (duplicate) {
            return { success: false, message: "That alert already exists." };
        }

        await StockAlert.create({
            userId: user.userId,
            userEmail: user.email,
            symbol: normalizedInput.symbol,
            company: watchlistItem.company,
            alertName: normalizedInput.alertName,
            metric: input.metric,
            condition: input.condition,
            threshold: normalizedInput.threshold,
            frequency: input.frequency,
        });

        revalidatePath("/watchlist");

        return { success: true, message: "Alert created successfully." };
    } catch (error) {
        console.error("Error creating stock alert:", error);
        return { success: false, message: "Failed to create alert." };
    }
}

export async function updateWatchlistAlert(input: UpdateWatchlistAlertInput) {
    try {
        const user = await getUserByEmail(input.email);

        if (!user?.userId) {
            return { success: false, message: "User not found." };
        }

        const normalizedInput = normalizeAlertInput(input);

        if (!normalizedInput) {
            return { success: false, message: "Fill in a valid alert name, symbol, and threshold." };
        }

        const existingAlert = await StockAlert.findOne({ _id: input.alertId, userId: user.userId }).lean();

        if (!existingAlert) {
            return { success: false, message: "Alert not found." };
        }

        const watchlistItem = await ensureWatchlistOwnership(user.userId, normalizedInput.symbol);

        if (!watchlistItem) {
            return { success: false, message: "You can only update alerts for stocks in your watchlist." };
        }

        const duplicate = await hasDuplicateActiveAlert({
            userId: user.userId,
            symbol: normalizedInput.symbol,
            metric: input.metric,
            condition: input.condition,
            threshold: normalizedInput.threshold,
            frequency: input.frequency,
            excludeAlertId: input.alertId,
        });

        if (duplicate) {
            return { success: false, message: "An identical active alert already exists." };
        }

        await StockAlert.findOneAndUpdate(
            { _id: input.alertId, userId: user.userId },
            {
                $set: {
                    symbol: normalizedInput.symbol,
                    company: watchlistItem.company,
                    alertName: normalizedInput.alertName,
                    metric: input.metric,
                    condition: input.condition,
                    threshold: normalizedInput.threshold,
                    frequency: input.frequency,
                    lastTriggeredAt: null,
                    status: "active",
                },
            }
        );

        revalidatePath("/watchlist");

        return { success: true, message: "Alert updated successfully." };
    } catch (error) {
        console.error("Error updating stock alert:", error);
        return { success: false, message: "Failed to update alert." };
    }
}

export async function deleteWatchlistAlert(email: string, alertId: string) {
    try {
        const user = await getUserByEmail(email);

        if (!user?.userId) {
            return { success: false, message: "User not found." };
        }

        const deleted = await StockAlert.findOneAndDelete({
            _id: alertId,
            userId: user.userId,
        });

        if (!deleted) {
            return { success: false, message: "Alert not found." };
        }

        revalidatePath("/watchlist");

        return { success: true, message: "Alert removed." };
    } catch (error) {
        console.error("Error deleting stock alert:", error);
        return { success: false, message: "Failed to remove alert." };
    }
}

export async function getAlertsByEmail(email: string): Promise<WatchlistAlertView[]> {
    try {
        const user = await getUserByEmail(email);

        if (!user?.userId) {
            return [];
        }

        const alerts = await StockAlert.find({ userId: user.userId, status: "active" }).sort({ createdAt: -1 }).lean();

        if (!alerts.length) {
            return [];
        }

        const symbols = [...new Set(alerts.map((alert) => alert.symbol))];
        const symbolDataEntries = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const [quote, profile] = await Promise.all([
                        getAlertQuote(symbol),
                        getAlertProfile(symbol),
                    ]);

                    return [symbol, { quote, logoUrl: profile.logo ?? "" }] as const;
                } catch (error) {
                    console.error(`Error fetching market/profile data for alert symbol ${symbol}:`, error);
                    return [symbol, { quote: { c: 0, dp: 0, v: 0 }, logoUrl: "" }] as const;
                }
            })
        );

        const symbolDataMap = new Map(symbolDataEntries);

        return alerts.map((alert) => {
            const symbolData = symbolDataMap.get(alert.symbol);
            const currentPrice = Number(symbolData?.quote?.c ?? 0);
            const changePercent = Number(symbolData?.quote?.dp ?? 0);

            return {
                id: alert._id.toString(),
                symbol: alert.symbol,
                company: alert.company,
                alertName: alert.alertName,
                metric: alert.metric,
                condition: alert.condition,
                threshold: alert.threshold,
                frequency: alert.frequency,
                conditionLabel: formatAlertConditionLabel(alert.metric, alert.condition, alert.threshold),
                frequencyLabel: formatAlertFrequencyLabel(alert.frequency),
                priceLabel: currentPrice > 0 ? formatPrice(currentPrice) : "N/A",
                changeLabel: formatChangeLabel(changePercent),
                priceTone: changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat",
                logoUrl: symbolData?.logoUrl || undefined,
                createdAt: alert.createdAt instanceof Date ? alert.createdAt.toISOString() : new Date(alert.createdAt).toISOString(),
            };
        });
    } catch (error) {
        console.error("Error fetching user alerts:", error);
        return [];
    }
}

export async function getProcessableAlerts(): Promise<AlertProcessingRecord[]> {
    try {
        const alerts = await StockAlert.find({ status: "active" }).lean();

        return alerts.map((alert) => ({
            id: alert._id.toString(),
            userEmail: alert.userEmail,
            symbol: alert.symbol,
            company: alert.company,
            alertName: alert.alertName,
            metric: alert.metric,
            condition: alert.condition,
            threshold: alert.threshold,
            frequency: alert.frequency,
            lastTriggeredAt: alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).toISOString() : null,
            triggeredCount: alert.triggeredCount ?? 0,
        }));
    } catch (error) {
        console.error("Error fetching active alerts:", error);
        return [];
    }
}

export async function getAlertMarketSnapshot(symbol: string, metric: AlertMetric): Promise<AlertMarketSnapshot> {
    const cleanSymbol = normalizeSymbol(symbol);
    const quote = await getAlertQuote(cleanSymbol);
    const averageVolume = metric === "volume" ? await getAverageDailyVolume(cleanSymbol) : null;

    return {
        currentPrice: Number(quote.c ?? 0),
        changePercent: Number(quote.dp ?? 0),
        currentVolume: Number(quote.v ?? 0),
        averageVolume,
    };
}

export async function markAlertTriggered(alertId: string, frequency: AlertFrequency) {
    const now = new Date();

    await StockAlert.findByIdAndUpdate(alertId, {
        $set: {
            lastTriggeredAt: now,
            ...(frequency === "once" ? { status: "triggered" } : {}),
        },
        $inc: { triggeredCount: 1 },
    });

    revalidatePath("/watchlist");
}
