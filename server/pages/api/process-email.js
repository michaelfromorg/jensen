/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, messages } = req.body;

    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'No email messages provided' });
    }

    try {
        console.log(process.env.OPENAI_API_KEY);

        const { from, subject, body } = messages[0]; // Process the first message

        // Prepare the prompt for OpenAI
        const prompt = `
From: ${from}
Subject: ${subject}
Body: ${body}
        `;
        console.log("prompt", prompt);

        // Use Vercel's AI package to process the prompt
        const { text: chatResponse } = await generateText({
            model: openai('gpt-4o'),
            system: 'You are an assistant who formats Notion task payloads. Based on the given email chain (represented by an array of to, cc, subject, body, date), create a JSON object in the format: { "title": "string", "body": "string" }. The title should summarize the task, and the body should include detailed information or context for the task. If the user asks you to do something in the task, make sure to follow their instructions and include the output in the body! (e.g., "Please include a joke" -> put a joke in the body!)',
            prompt: prompt,
        });

        // Sanitize the response by removing markdown or unexpected characters
        const sanitizedResponse = chatResponse
            .replace(/```json/g, '') // Remove specific markdown start for JSON
            .replace(/```/g, '') // Remove generic markdown end
            .trim();

        console.log("Sanitized Response:", sanitizedResponse);

        // Parse the JSON response
        const notionPayload = JSON.parse(sanitizedResponse);

        // Create a task in Notion
        const notionResponse = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: notionPayload.title } }] },
                Description: { rich_text: [{ text: { content: notionPayload.body } }] },
            },
        });

        res.status(200).json({ success: true, notionPage: notionResponse });
    } catch (error) {
        console.error("Error processing email:", error);
        res.status(500).json({ error: "Failed to process email", details: error.message });
    }
}
