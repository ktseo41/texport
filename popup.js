document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn");
  const downloadBtn = document.getElementById("downloadAction");
  const copyBtn = document.getElementById("copyAction");

  // Get current status from storage
  chrome.storage.local.get(["enabled", "clickAction"], (result) => {
    updateUI(result.enabled);
    updateActionUI(result.clickAction || "download");
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

  // Action button listeners
  [downloadBtn, copyBtn].forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      chrome.storage.local.set({ clickAction: action }, () => {
        updateActionUI(action);
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

  function updateActionUI(action) {
    [downloadBtn, copyBtn].forEach((btn) => {
      if (btn.getAttribute("data-action") === action) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
});
