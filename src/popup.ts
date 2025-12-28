// popup.ts
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn") as HTMLButtonElement | null;
  const downloadBtn = document.getElementById("downloadAction") as HTMLButtonElement | null;
  const copyBtn = document.getElementById("copyAction") as HTMLButtonElement | null;
  const askBtn = document.getElementById("askAction") as HTMLButtonElement | null;
  const fastDownloadToggle = document.getElementById("fastDownloadToggle") as HTMLInputElement | null;
  const toggleKbdContainer = document.getElementById("toggleKbdContainer") as HTMLDivElement | null;

  if (!toggleBtn || !downloadBtn || !copyBtn || !askBtn || !fastDownloadToggle) {
    console.error("Required elements not found");
    return;
  }

  const actionButtons = [downloadBtn, copyBtn, askBtn];
  const changeShortcutLink = document.getElementById("changeShortcutLink") as HTMLSpanElement | null;

  // Update shortcut display based on platform
  const ua = navigator.userAgent.toUpperCase();
  const isMac = ua.indexOf("MAC") >= 0;

  if (toggleKbdContainer) {
    const keys = isMac ? ["Cmd", "Shift", "X"] : ["Ctrl", "Shift", "X"];
    toggleKbdContainer.innerHTML = keys
      .map((key) => `<kbd>${key}</kbd>`)
      .join('<span class="shortcut-plus">+</span>');
  }

  // Get current status from storage
  chrome.storage.local.get(["enabled", "clickAction", "fastDownload"], (result) => {
    updateUI(!!result.enabled);
    updateBadge(!!result.enabled);
    updateActionUI((result.clickAction as string) || "download");
    if (fastDownloadToggle) {
      fastDownloadToggle.checked = !!result.fastDownload;
    }
  });

  // Fetch actual commands from Chrome
  chrome.commands.getAll((commands) => {
    const toggleCommand = commands.find((c) => c.name === "toggle-activation");
    if (toggleCommand && toggleCommand.shortcut && toggleKbdContainer) {
      const keys = parseShortcut(toggleCommand.shortcut);
      toggleKbdContainer.innerHTML = keys
        .map((key) => `<kbd>${key === "Command" ? "Cmd" : key}</kbd>`)
        .join('<span class="shortcut-plus">+</span>');
    }
  });

  function parseShortcut(shortcut: string): string[] {
    if (shortcut.includes("+")) {
      return shortcut.split("+").map((s) => s.trim());
    }

    const map: { [key: string]: string } = {
      "⌘": "Cmd",
      "⇧": "Shift",
      "⌥": "Option",
      "⌃": "Ctrl",
    };

    const result: string[] = [];
    let i = 0;
    while (i < shortcut.length) {
      const char = shortcut[i];
      if (map[char]) {
        result.push(map[char]);
        i++;
      } else {
        result.push(shortcut.slice(i));
        break;
      }
    }
    return result.length > 0 ? result : [shortcut];
  }

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        updateUI(newState);
        updateBadge(newState);

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

  // Fast download toggle listener
  fastDownloadToggle.addEventListener("change", () => {
    chrome.storage.local.set({ fastDownload: fastDownloadToggle.checked });
  });

  // Shortcut management listeners
  const openShortcuts = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  };

  changeShortcutLink?.addEventListener("click", openShortcuts);

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

  function updateBadge(isEnabled: boolean) {
    chrome.action.setBadgeText({ text: isEnabled ? "ON" : "" });
    chrome.action.setBadgeBackgroundColor({
      color: isEnabled ? "#4CAF50" : "#808080",
    });
  }

  function updateActionUI(action: string) {
    actionButtons.forEach((btn) => {
      if (btn.getAttribute("data-action") === action) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const isDownloadRelated = action === "download" || action === "ask";
    if (fastDownloadToggle) {
      fastDownloadToggle.disabled = !isDownloadRelated;
      const container = fastDownloadToggle.closest(".setting-item");
      if (container) {
        if (isDownloadRelated) {
          container.classList.remove("disabled");
        } else {
          container.classList.add("disabled");
        }
      }
    }
  }

  // Listen for storage changes to sync UI
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.enabled) {
        updateUI(!!changes.enabled.newValue);
        updateBadge(!!changes.enabled.newValue);
      }
      if (changes.clickAction) {
        updateActionUI(changes.clickAction.newValue as string);
      }
      if (changes.fastDownload && fastDownloadToggle) {
        fastDownloadToggle.checked = !!changes.fastDownload.newValue;
      }
    }
  });
});
