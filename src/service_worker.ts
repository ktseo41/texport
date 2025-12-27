// service_worker.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_text") {
    const blob = new Blob([request.text], { type: "text/plain" });
    const reader = new FileReader();

    reader.onload = function () {
      const url = reader.result as string;
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

  if (request.action === "broadcastHover") {
    // Notify all frames in the sender's tab EXCEPT the sender frame
    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: "otherFrameHovered",
        sourceFrameId: request.sourceFrameId
      });
    }
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
