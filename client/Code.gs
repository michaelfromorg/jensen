function processEmails() {
  console.log("Hello, world!");

  const targetEmail = "michaelfromyeg+ai@gmail.com";
  const endpointUrl = "https://assistant-xi-azure.vercel.app/api/status"; // 
  
  // Search for threads with the target email
  const threads = GmailApp.search(`to:${targetEmail}`);
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    const emailData = messages.map(message => ({
      from: message.getFrom(),
      subject: message.getSubject(),
      body: message.getPlainBody(),
      date: message.getDate(),
    }));
    
    // Send the email data to the endpoint
    const payload = JSON.stringify({
      threadId: thread.getId(),
      messages: emailData
    });
    
    const options = {
      method: "POST",
      contentType: "application/json",
      payload: payload
    };
    
    try {
      console.log(endpointUrl, options)

      const response = UrlFetchApp.fetch(endpointUrl, {
        method: "GET",
        contentType: "application/json",
      });
      console.log(`Thread ${thread.getId()} processed successfully:`, response.getContentText());
    } catch (error) {
      console.error(`Failed to process thread ${thread.getId()}:`, error.message);
    }
  });
}
