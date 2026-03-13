import nodemailer from "nodemailer";
import {
    NEWS_SUMMARY_EMAIL_TEMPLATE,
    STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
    STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
    VOLUME_ALERT_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./templates";

type PriceAlertEmailInput = {
    email: string;
    symbol: string;
    company: string;
    currentPrice: string;
    targetPrice: string;
    condition: "greater" | "less";
    timestamp: string;
};

type VolumeAlertEmailInput = {
    email: string;
    symbol: string;
    company: string;
    currentVolume: string;
    averageVolume: string;
    currentPrice: string;
    changePercent: string;
    condition: "greater" | "less";
    thresholdLabel: string;
    volumeSpike: string;
    timestamp: string;
};

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
});

function ensureMailerConfigured() {
    if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        throw new Error("Nodemailer credentials not configured. Check NODEMAILER_EMAIL and NODEMAILER_PASSWORD env vars.");
    }
}

function applyTemplate(template: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce((html, [key, value]) => {
        return html.split(`{{${key}}}`).join(value);
    }, template);
}

async function sendMail(options: nodemailer.SendMailOptions) {
    ensureMailerConfigured();

    try {
        const result = await transporter.sendMail(options);
        console.log("Email sent successfully!", result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = applyTemplate(WELCOME_EMAIL_TEMPLATE, {
        name,
        intro,
    });

    return sendMail({
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: "Welcome to Stock Sense",
        text: "Thanks for joining us! We are excited to have you on board.",
        html: htmlTemplate,
    });
};

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: { email: string; date: string; newsContent: string }) => {
    const htmlTemplate = applyTemplate(NEWS_SUMMARY_EMAIL_TEMPLATE, {
        date,
        newsContent,
    });

    return sendMail({
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `Market News Summary Today - ${date}`,
        text: "Today's market news summary from Stock Sense.",
        html: htmlTemplate,
    });
};

export const sendPriceAlertEmail = async ({
    email,
    symbol,
    company,
    currentPrice,
    targetPrice,
    condition,
    timestamp,
}: PriceAlertEmailInput) => {
    const template = condition === "greater"
        ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE
        : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;

    const htmlTemplate = applyTemplate(template, {
        symbol,
        company,
        currentPrice,
        targetPrice,
        timestamp,
    });

    const subject = condition === "greater"
        ? `${symbol} moved above ${targetPrice}`
        : `${symbol} moved below ${targetPrice}`;

    return sendMail({
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject,
        text: `${symbol} triggered your price alert at ${currentPrice}. Target: ${targetPrice}.`,
        html: htmlTemplate,
    });
};

export const sendVolumeAlertEmail = async ({
    email,
    symbol,
    company,
    currentVolume,
    averageVolume,
    currentPrice,
    changePercent,
    condition,
    thresholdLabel,
    volumeSpike,
    timestamp,
}: VolumeAlertEmailInput) => {
    const numericChange = Number(changePercent);
    const safeChange = Number.isFinite(numericChange) ? numericChange : 0;
    const priceColor = safeChange >= 0 ? "#10b981" : "#ef4444";
    const direction = safeChange > 0 ? "+" : safeChange < 0 ? "-" : "";
    const alertMessage = condition === "greater"
        ? `Volume moved above your threshold of ${thresholdLabel}.`
        : `Volume moved below your threshold of ${thresholdLabel}.`;

    const htmlTemplate = applyTemplate(VOLUME_ALERT_EMAIL_TEMPLATE, {
        symbol,
        company,
        currentVolume,
        currentPrice,
        priceColor,
        changeDirection: direction,
        changePercent: Math.abs(safeChange).toFixed(2),
        alertMessage,
        averageVolume,
        volumeSpike,
        timestamp,
    });

    return sendMail({
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `${symbol} volume alert triggered`,
        text: `${symbol} volume alert triggered at ${currentVolume}M shares. Threshold: ${thresholdLabel}.`,
        html: htmlTemplate,
    });
};


