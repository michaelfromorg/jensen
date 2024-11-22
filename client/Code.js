function processEmails() {
  console.log("Processing emails...");

  const targetEmail = "michaelfromyeg+ai@gmail.com";
  const endpointUrl = "https://assistant-xi-azure.vercel.app/api/process-email";

  // Get the processed thread IDs from the script properties
  const properties = PropertiesService.getScriptProperties();
  const processedThreads = JSON.parse(properties.getProperty("processedThreads") || "[]");

  // Search for threads with the target email
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
      cc: message.getCc(), // Add CC if needed
      subject: message.getSubject(),
      body: message.getPlainBody(),
      date: message.getDate(),
    }));

    // for now, just get the last one; it implicitly includes the others if forwarded
    const emailChainData2 = emailChainData[emailChainData.length - 1]
    console.log("Sending", emailChainData2)

    // Construct the full payload
    const payload = JSON.stringify({
      threadId: threadId,
      messages: [emailChainData2], // Includes all emails in the thread
    });

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: payload,
    };

    try {
      console.log("Sending payload:", payload);

      // const response = UrlFetchApp.fetch("https://assistant-xi-azure.vercel.app/api/status", {
      //   method: "GET",
      //   contentType: "application/json",
      // });

      const response = UrlFetchApp.fetch(endpointUrl, options);
      console.log(`Thread ${threadId} processed successfully:`, response.getContentText());

      // Add the thread ID to the list of processed threads
      processedThreads.push(threadId);
      properties.setProperty("processedThreads", JSON.stringify(processedThreads));
    } catch (error) {
      console.error(`Failed to process thread ${threadId}:`, error.message);
    }
  });
}
