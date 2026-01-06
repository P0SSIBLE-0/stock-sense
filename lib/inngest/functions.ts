import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { formatDateToday } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: "sign-up-email" },
    { event: "app/user.created" },
    async ({ event, step }) => {
        const userProfile = `
        - Country: ${event.data.country}
        - Investment Goal: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
    `
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
            body: {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            }
        })
        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Stock Sense. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: "daily-news-summary" },
    [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }], // Runs every day at 12 PM
    async ({ event, step }) => {
        // step 1 : get all user for news delivery
        const users = await step.run('get-all-users', async () => {
            return await getAllUsersForNewsEmail();
        })

        if (!users || users.length === 0) {
            return {
                success: false,
                message: 'No users found'
            }
        }

        // step 2 : fetch personalized news for each user
        const results = await step.run('fetch-user-news', async () => {
            const perUserArticles = [];
            for (const user of users) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    const articles = await getNews(symbols);

                    // enforce max 6 articles per user
                    const maxArticles = 6;
                    const selectedArticles = articles.slice(0, maxArticles);

                    perUserArticles.push({ user, articles: selectedArticles });
                } catch (error) {
                    console.error(`Error processing news for ${user.email}:`, error);
                    perUserArticles.push({ user, articles: [] });
                }
            }
            return perUserArticles;
        });

        // step 3 : summerize the news via api
        const userNewsSummerises: { user: User, newsContent: string | null }[] = [];
        for (const { user, articles } of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));
                const response = await step.ai.infer(`summerize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
                    body: {
                        contents: [{ role: "user", parts: [{ text: prompt }] }]
                    }
                })

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No news available';

                userNewsSummerises.push({ user, newsContent });
            } catch (error) {
                console.error(`Error summerizing news for ${user.email}:`, error);
                userNewsSummerises.push({ user, newsContent: null });
            }
        }

        // step 4: send news in the mail
        await step.run('send-news-email', async () => {
            await Promise.all(userNewsSummerises.map(async ({ user, newsContent }) => {
                if (!newsContent) {
                    return false;
                }
                await sendNewsSummaryEmail({ email: user.email, date: formatDateToday(), newsContent });
            }))
        })
        return {
            success: true,
            processedCount: results.length,
            message: 'Daily news summary sent successfully!'
        }
    }
)
