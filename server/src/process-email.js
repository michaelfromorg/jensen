/* eslint-disable @typescript-eslint/no-unused-vars */
import { openai } from '@ai-sdk/openai';
import { Client } from '@notionhq/client';
import { generateText } from 'ai';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const system = ```You are an assistant who formats Notion task payloads. Based on the given email chain (represented by an array of to, cc, subject, body, date), create a JSON object in the format: 
{
    "title": "string",
    "body": "string",
    "priority": "string",
    "estimate": "number",
    "due_date": "string (optional)"
}. 

- The title should summarize the task.
- The body should include detailed information or context for the task.
- For priority, classify based on urgency:
    - P0 for critical/urgent tasks,
    - P1 for high-priority tasks,
    - P2 for standard tasks.
- For estimate, assign a value (1, 2, 3, 5, 8) based on complexity or effort.
- If a due date is mentioned in the email or specified by the user, include it in the \`due_date\` property. Otherwise, omit it.

If the user asks you to do something in the task, ensure you follow their instructions and include the output in the body. (e.g., "Please include a joke" -> put a joke in the body!)
```;

const THREAD_IDS = []

/**
 * Email -> LLM -> Notion.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, messages } = req.body;

    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'No email messages provided' });
    }
    if (THREAD_IDS.includes(threadId)) {
        return res.status(200).json({ message: 'Email thread already processed' });
    }

    try {
        // TODO(michaelfromyeg): add support for multiple messages
        const { from, subject, body } = messages[0];
        const prompt = `
From: ${from}
Subject: ${subject}
Body: ${body}
        `;

        const { text: chatResponse } = await generateText({
            model: openai('gpt-4o'),
            system,
            prompt,
        });

        // sanitize the response; get rid of JSON markers
        const sanitizedResponse = chatResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const notionPayload = JSON.parse(sanitizedResponse);
        const notionResponse = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: notionPayload.title } }] },
                Description: { rich_text: [{ text: { content: notionPayload.body } }] },
            },
        });

        res.status(200).json({ success: true, notionPage: notionResponse });
        THREAD_IDS.push(threadId);
    } catch (error) {
        console.error("Error processing email:", error);
        res.status(500).json({ error: "Failed to process email", details: error.message });
    }
}
