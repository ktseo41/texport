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

        // Notify content script in the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggle",
              enabled: newState,
            });
          }
        });
      });
    });
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      toggleBtn.textContent = "비활성화하기";
      toggleBtn.classList.add("active");
    } else {
      toggleBtn.textContent = "활성화하기";
      toggleBtn.classList.remove("active");
    }
  }
});
