document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn");

  // Get current status from storage
  chrome.storage.local.get(["enabled"], (result) => {
    updateUI(result.enabled);
  });

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        updateUI(newState);

        // Notify content script in all tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs
              .sendMessage(tab.id, {
                action: "toggle",
                enabled: newState,
              })
              .catch((err) => {
                // Ignore errors for tabs where content script might not be loaded or accessible
              });
          });
        });
      });
    });
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      toggleBtn.textContent = "Deactivate";
      toggleBtn.classList.add("active");
    } else {
      toggleBtn.textContent = "Activate";
      toggleBtn.classList.remove("active");
    }
  }
});
