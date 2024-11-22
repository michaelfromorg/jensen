# Jensen

Your personal product managers. AI driven task triage and management.

Built originally for the "World's Shortest Hackathon."

## About

Here's how it works.

1. The client is a Google Apps Script project (using [clasp](https://github.com/google/clasp)) that has the ability to comb through your e-mails
2. It checks for any e-mails sent to `<your-email>+ai@gmail.com"`
3. It forwards the thread to an endpoint `/process-email`, which will
    a. Read your Notion database schema
    b. Prompt an LLM to fill out the database schema as best it can, based on the e-mail thread
    c. Insert a new entry to your task database
4. Save that e-mail thread as being handled

## Usage

To get started with development, first run `bash scripts/setup.sh`.

Create a `.env` file in `server` with the following values.

```plaintext
NOTION_API_KEY="ntn_asdf"
NOTION_DATABASE_ID="some-uuid-value-from-your-database-view"

OPENAI_API_KEY="sk-proj-qwerty"
```

Run the server with `npm run dev`.

To use the client code, set up a Google Apps Script project via Google Drive. Then, follow the steps [here](https://github.com/google/clasp/blob/master/docs/run.md#setup-instructions).
