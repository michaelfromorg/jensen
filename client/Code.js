function processEmails() {
  console.log("Processing emails...");

  const targetEmail = "michaelfromyeg+ai@gmail.com";
  const endpointUrl = "https://assistant-xi-azure.vercel.app/api/process-email";

  // Get the processed thread IDs from the script properties
  // NOTE: this scales up to 500 kB, or about ~5000 thread IDs
  //       ...once that has been reached, switch to Sheets!
  //       (we can also store the last processed date to avoid duplicates)
  const properties = PropertiesService.getScriptProperties();
  const processedThreads = JSON.parse(properties.getProperty("processedThreads") || "[]");

  // Search my e-mail for messages forwarded to the AI service
  const threads = GmailApp.search(`to:${targetEmail}`);

  threads.forEach(thread => {
    const threadId = thread.getId();

    // Skip threads that have already been processed
    if (processedThreads.includes(threadId)) {
      console.log(`Thread ${threadId} already processed. Skipping.`);
      return;
    }

    const messages = thread.getMessages();
    const emailChainData = messages.map(message => ({
      from: message.getFrom(),
      to: message.getTo(),
      cc: message.getCc(),
      subject: message.getSubject(),
      body: message.getPlainBody(),
      date: message.getDate(),
    }));
    const emailChainData2 = emailChainData[emailChainData.length - 1]
    
    const payload = JSON.stringify({
      threadId,
      messages: [emailChainData2],
    });
    const options = {
      method: "POST",
      contentType: "application/json",
      payload,
    };
    console.log("Sending payload:", payload);

    try {
      const response = UrlFetchApp.fetch(endpointUrl, options);
      console.log(`Thread ${threadId} processed successfully:`, response.getContentText());

      processedThreads.push(threadId);
      properties.setProperty("processedThreads", JSON.stringify(processedThreads));
    } catch (error) {
      console.error(`Failed to process thread ${threadId}:`, error.message);
    }
  });
}
