// service_worker.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_text") {
    const blob = new Blob([request.text], { type: "text/plain" });
    const reader = new FileReader();

    reader.onload = function () {
      const url = reader.result as string;
      chrome.storage.local.get(["fastDownload"], (result) => {
        const skipDialog = !!result.fastDownload;
        chrome.downloads.download(
          {
            url: url,
            filename: request.filename || "extracted_text.txt",
            saveAs: !skipDialog,
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
      });
    };

    reader.readAsDataURL(blob);
    return true; // Keep the message channel open for async response
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-activation") {
    chrome.storage.local.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState });
      
      // Update badge for immediate feedback
      chrome.action.setBadgeText({ text: newState ? "ON" : "" });
      chrome.action.setBadgeBackgroundColor({ color: newState ? "#4CAF50" : "#808080" });
    });
  }
});
