chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_text") {
    const blob = new Blob([request.text], { type: "text/plain" });
    const reader = new FileReader();

    reader.onload = function () {
      const url = reader.result;
      chrome.downloads.download(
        {
          url: url,
          filename: request.filename || "extracted_text.txt",
          saveAs: true,
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true, downloadId: downloadId });
          }
        }
      );
    };

    reader.readAsDataURL(blob);
    return true; // Keep the message channel open for async response
  }
});
