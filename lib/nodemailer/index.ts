import nodemailer from "nodemailer";
import { NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./templates";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    // Validate environment variables
    if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        throw new Error('Nodemailer credentials not configured. Check NODEMAILER_EMAIL and NODEMAILER_PASSWORD env vars.');
    }

    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace("{{name}}", name)
        .replace("{{intro}}", intro)

    const mailOptions = {
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: "Welcome to Stock Sense",
        text: "Thanks for joining us! We are excited to have you on board.",
        html: htmlTemplate
    }

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!", result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        // Re-throw the error so Inngest can handle retries
        throw error;
    }
}

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: { email: string, date: string, newsContent: string }) => {
    // Validate environment variables
    if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        throw new Error('Nodemailer credentials not configured. Check NODEMAILER_EMAIL and NODEMAILER_PASSWORD env vars.');
    }

    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace("{{date}}", date)
        .replace("{{newsContent}}", newsContent)

    const mailOptions = {
        from: `Stock Sense <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from stock sense`,
        html: htmlTemplate
    }

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!", result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        // Re-throw the error so Inngest can handle retries
        throw error;
    }
}