function status() {
  console.log("Performing health check...");
  
  const response = UrlFetchApp.fetch("https://assistant-xi-azure.vercel.app/api/status", {
    method: "GET",
    contentType: "application/json",
  });

  return response.getResponseCode()
}
