import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getAlertMarketSnapshot, getProcessableAlerts, markAlertTriggered } from "../actions/alert.actions";
import { getNews } from "../actions/finnhub.actions";
import { sendNewsSummaryEmail, sendPriceAlertEmail, sendVolumeAlertEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { formatDateToday, formatPrice } from "../utils";

const CHECK_STOCK_ALERTS_CRON = "*/30 * * * *";

function shouldSendAlert(frequency: "daily" | "hourly" | "once", lastTriggeredAt: string | null) {
    if (!lastTriggeredAt) {
        return true;
    }

    const elapsedMs = Date.now() - new Date(lastTriggeredAt).getTime();

    if (frequency === "daily") {
        return elapsedMs >= 24 * 60 * 60 * 1000;
    }

    if (frequency === "hourly") {
        return elapsedMs >= 60 * 60 * 1000;
    }

    return false;
}

function isThresholdMet(currentValue: number, threshold: number, condition: "greater" | "less") {
    if (!Number.isFinite(currentValue) || currentValue <= 0) {
        return false;
    }

    return condition === "greater" ? currentValue >= threshold : currentValue <= threshold;
}

function formatAlertTimestamp() {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(new Date());
}

export const sendSignUpEmail = inngest.createFunction(
    { id: "sign-up-email" },
    { event: "app/user.created" },
    async ({ event, step }) => {
        const userProfile = `
        - Country: ${event.data.country}
        - Investment Goal: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
    `;
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

        const response = await step.ai.infer("generate-welcome-intro", {
            model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
            body: {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            },
        });
        await step.run("send-welcome-email", async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && "text" in part ? part.text : null) || "Thanks for joining Stock Sense. You now have the tools to track markets and make smarter moves.";

            const {
                data: { email, name },
            } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        });

        return {
            success: true,
            message: "Welcome email sent successfully",
        };
    }
);

export const sendDailyNewsSummary = inngest.createFunction(
    { id: "daily-news-summary" },
    [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
    async ({ step }) => {
        const users = await step.run("get-all-users", async () => {
            return await getAllUsersForNewsEmail();
        });

        if (!users || users.length === 0) {
            return {
                success: false,
                message: "No users found",
            };
        }

        const results = await step.run("fetch-user-news", async () => {
            const perUserArticles = [];
            for (const user of users) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    const articles = await getNews(symbols);
                    const selectedArticles = articles.slice(0, 6);

                    perUserArticles.push({ user, articles: selectedArticles });
                } catch (error) {
                    console.error(`Error processing news for ${user.email}:`, error);
                    perUserArticles.push({ user, articles: [] });
                }
            }
            return perUserArticles;
        });

        const userNewsSummerises: { user: User; newsContent: string | null }[] = [];
        for (const { user, articles } of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", JSON.stringify(articles, null, 2));
                const response = await step.ai.infer(`summerize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
                    body: {
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                    },
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && "text" in part ? part.text : null) || "No news available";

                userNewsSummerises.push({ user, newsContent });
            } catch (error) {
                console.error(`Error summerizing news for ${user.email}:`, error);
                userNewsSummerises.push({ user, newsContent: null });
            }
        }

        await step.run("send-news-email", async () => {
            await Promise.all(userNewsSummerises.map(async ({ user, newsContent }) => {
                if (!newsContent) {
                    return false;
                }
                await sendNewsSummaryEmail({ email: user.email, date: formatDateToday(), newsContent });
                return true;
            }));
        });
        return {
            success: true,
            processedCount: results.length,
            message: "Daily news summary sent successfully!",
        };
    }
);

export const checkStockAlerts = inngest.createFunction(
    { id: "check-stock-alerts" },
    { cron: CHECK_STOCK_ALERTS_CRON },
    async ({ step }) => {
        const alerts = await step.run("get-active-stock-alerts", async () => {
            return await getProcessableAlerts();
        });

        if (!alerts.length) {
            return {
                success: true,
                checkedCount: 0,
                triggeredCount: 0,
                message: "No active alerts found.",
            };
        }

        let triggeredCount = 0;

        for (const [index, alert] of alerts.entries()) {
            const triggered = await step.run(`process-stock-alert-${index}`, async () => {
                if (!shouldSendAlert(alert.frequency, alert.lastTriggeredAt)) {
                    return false;
                }

                const snapshot = await getAlertMarketSnapshot(alert.symbol, alert.metric);
                const timestamp = formatAlertTimestamp();

                if (alert.metric === "price") {
                    const hit = isThresholdMet(snapshot.currentPrice, alert.threshold, alert.condition);

                    if (!hit) {
                        return false;
                    }

                    await sendPriceAlertEmail({
                        email: alert.userEmail,
                        symbol: alert.symbol,
                        company: alert.company,
                        currentPrice: formatPrice(snapshot.currentPrice),
                        targetPrice: formatPrice(alert.threshold),
                        condition: alert.condition,
                        timestamp,
                    });
                } else {
                    const currentVolumeInMillions = snapshot.currentVolume / 1_000_000;
                    const hit = isThresholdMet(currentVolumeInMillions, alert.threshold, alert.condition);

                    if (!hit) {
                        return false;
                    }

                    const averageVolumeInMillions = snapshot.averageVolume ? snapshot.averageVolume / 1_000_000 : 0;
                    const volumeSpike = averageVolumeInMillions > 0
                        ? `${(currentVolumeInMillions / averageVolumeInMillions).toFixed(2)}x`
                        : "N/A";

                    await sendVolumeAlertEmail({
                        email: alert.userEmail,
                        symbol: alert.symbol,
                        company: alert.company,
                        currentVolume: currentVolumeInMillions.toFixed(2),
                        averageVolume: averageVolumeInMillions.toFixed(2),
                        currentPrice: formatPrice(snapshot.currentPrice),
                        changePercent: snapshot.changePercent.toFixed(2),
                        condition: alert.condition,
                        thresholdLabel: `${alert.threshold.toFixed(2)}M shares`,
                        volumeSpike,
                        timestamp,
                    });
                }

                await markAlertTriggered(alert.id, alert.frequency);
                return true;
            });

            if (triggered) {
                triggeredCount += 1;
            }
        }

        return {
            success: true,
            checkedCount: alerts.length,
            triggeredCount,
            checkedAt: new Date().toISOString(),
        };
    }
);
