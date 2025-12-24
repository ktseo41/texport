// popup.ts
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn") as HTMLButtonElement | null;
  const downloadBtn = document.getElementById("downloadAction") as HTMLButtonElement | null;
  const copyBtn = document.getElementById("copyAction") as HTMLButtonElement | null;
  const askBtn = document.getElementById("askAction") as HTMLButtonElement | null;
  const toggleKbdContainer = document.getElementById("toggleKbdContainer") as HTMLDivElement | null;

  if (!toggleBtn || !downloadBtn || !copyBtn || !askBtn) {
    console.error("Required elements not found");
    return;
  }

  const actionButtons = [downloadBtn, copyBtn, askBtn];

  // Update shortcut display based on platform
  const ua = navigator.userAgent.toUpperCase();
  const isMac = ua.indexOf("MAC") >= 0;

  if (toggleKbdContainer) {
    const keys = isMac ? ["Cmd", "Shift", "X"] : ["Ctrl", "Shift", "X"];
    toggleKbdContainer.innerHTML = keys
      .map((key) => `<kbd>${key}</kbd>`)
      .join("");
  }

  // Get current status from storage
  chrome.storage.local.get(["enabled", "clickAction"], (result) => {
    updateUI(!!result.enabled);
    updateActionUI((result.clickAction as string) || "download");
  });

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        updateUI(newState);

        // Notify content script in all tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id !== undefined) {
              chrome.tabs
                .sendMessage(tab.id, {
                  action: "toggle",
                  enabled: newState,
                })
                .catch((err) => {
                  // Ignore errors for tabs where content script might not be loaded or accessible
                  console.debug(`Could not send message to tab ${tab.id}:`, err);
                });
            }
          });
        });
      });
    });
  });

  // Action button listeners
  actionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action) {
        chrome.storage.local.set({ clickAction: action }, () => {
          updateActionUI(action);
        });
      }
    });
  });

  function updateUI(isEnabled: boolean) {
    if (!toggleBtn) return;
    if (isEnabled) {
      toggleBtn.textContent = "Deactivate";
      toggleBtn.classList.add("active");
    } else {
      toggleBtn.textContent = "Activate";
      toggleBtn.classList.remove("active");
    }
  }

  function updateActionUI(action: string) {
    actionButtons.forEach((btn) => {
      if (btn.getAttribute("data-action") === action) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Listen for storage changes to sync UI
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.enabled) {
        updateUI(!!changes.enabled.newValue);
      }
      if (changes.clickAction) {
        updateActionUI(changes.clickAction.newValue as string);
      }
    }
  });
});
