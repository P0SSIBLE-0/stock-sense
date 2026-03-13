import { Schema, model, models, type Document, type Model } from "mongoose";

export type AlertMetric = "price" | "volume";
export type AlertCondition = "greater" | "less";
export type AlertFrequency = "daily" | "hourly" | "once";
export type AlertStatus = "active" | "triggered";

export interface StockAlertDocument extends Document {
    userId: string;
    userEmail: string;
    symbol: string;
    company: string;
    alertName: string;
    metric: AlertMetric;
    condition: AlertCondition;
    threshold: number;
    frequency: AlertFrequency;
    status: AlertStatus;
    lastTriggeredAt?: Date | null;
    triggeredCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema = new Schema<StockAlertDocument>(
    {
        userId: { type: String, required: true, index: true },
        userEmail: { type: String, required: true, index: true, lowercase: true, trim: true },
        symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
        company: { type: String, required: true, trim: true },
        alertName: { type: String, required: true, trim: true, maxlength: 120 },
        metric: { type: String, enum: ["price", "volume"], required: true },
        condition: { type: String, enum: ["greater", "less"], required: true },
        threshold: { type: Number, required: true, min: 0 },
        frequency: { type: String, enum: ["daily", "hourly", "once"], required: true, default: "daily" },
        status: { type: String, enum: ["active", "triggered"], required: true, default: "active" },
        lastTriggeredAt: { type: Date, default: null },
        triggeredCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

AlertSchema.index(
    {
        userId: 1,
        symbol: 1,
        metric: 1,
        condition: 1,
        threshold: 1,
        frequency: 1,
        status: 1,
    },
    { name: "alert_dedupe_lookup" }
);

export const StockAlert: Model<StockAlertDocument> =
    (models?.StockAlert as Model<StockAlertDocument>) ||
    model<StockAlertDocument>("StockAlert", AlertSchema);
