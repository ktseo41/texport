// content.js
(function () {
  let active = false;
  let hoveredElement = null;
  let currentFocusElement = null;
  let overlay = null;
  let label = null;
  let actionMenu = null;
  let isCopiedState = false;

  let lastMouseX = 0;
  let lastMouseY = 0;

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "ext-text-extractor-overlay";

    label = document.createElement("div");
    label.className = "ext-text-extractor-label";
    overlay.appendChild(label);

    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
      label = null;
    }
  }

  function updateOverlay(el) {
    if (!el || !active) {
      if (overlay) overlay.style.display = "none";
      return;
    }

    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    overlay.style.display = "block";
    overlay.style.top = `${rect.top + scrollY}px`;
    overlay.style.left = `${rect.left + scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    if (isCopiedState) return;

    const text = (el.innerText || "").trim();
    const tagName = el.tagName.toLowerCase();

    label.innerHTML = `<span class="ext-text-extractor-tag">${tagName}</span><span>${text.length}</span>`;

    // Calculate label positioning
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const labelRect = label.getBoundingClientRect();

    // Horizontal: alignment to the right of the element, clamped to viewport
    let desiredX = rect.right - labelRect.width;
    if (desiredX + labelRect.width > viewportWidth - 10) {
      desiredX = viewportWidth - labelRect.width - 10;
    }
    if (desiredX < 10) {
      desiredX = 10;
    }

    // Vertical: above the element, clamped to viewport and element bounds
    let desiredY = rect.top - labelRect.height - 4;
    if (desiredY < 10) {
      // If no space above, try placing it inside at the top
      desiredY = Math.max(10, rect.top + 4);
    }
    // Ensure it doesn't go below the element's actual bottom or viewport bottom
    desiredY = Math.min(desiredY, rect.bottom - labelRect.height - 4);
    desiredY = Math.min(desiredY, viewportHeight - labelRect.height - 10);

    // Set position relative to the overlay
    label.style.left = `${desiredX - rect.left}px`;
    label.style.top = `${desiredY - rect.top}px`;
    label.style.marginTop = "0";
  }

  function handleMouseMove(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (!active) return;
    if (actionMenu) return; // Don't highlight while menu is open

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el !== overlay && !overlay.contains(el)) {
      if (hoveredElement !== el) {
        hoveredElement = el;
        currentFocusElement = el;
        updateOverlay(currentFocusElement);
      }
    }
  }

  function handleKeyDown(e) {
    if (!active) return;

    if (e.key === "Escape") {
      if (actionMenu) {
        removeActionMenu();
        return;
      }
      toggleActive(false);
      return;
    }

    if (actionMenu) return; // Disable navigation while menu is open

    // Ensure we have a focus element if keys are pressed
    if (!currentFocusElement) {
      const el = document.elementFromPoint(lastMouseX, lastMouseY);
      if (el && el !== overlay && !overlay.contains(el)) {
        hoveredElement = el;
        currentFocusElement = el;
        updateOverlay(currentFocusElement);
      }
    }

    if (!currentFocusElement) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (
        currentFocusElement.parentElement &&
        currentFocusElement.parentElement !== document.documentElement
      ) {
        currentFocusElement = currentFocusElement.parentElement;
        updateOverlay(currentFocusElement);
        triggerPulse();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      // Try to go back to the original hovered element if we are at a parent
      if (
        hoveredElement &&
        currentFocusElement.contains(hoveredElement) &&
        currentFocusElement !== hoveredElement
      ) {
        let child = hoveredElement;
        while (child.parentElement !== currentFocusElement) {
          child = child.parentElement;
        }
        currentFocusElement = child;
        updateOverlay(currentFocusElement);
        triggerPulse();
      }
    }
  }

  function triggerPulse() {
    if (!overlay) return;
    overlay.classList.remove("pulse");
    void overlay.offsetWidth; // Trigger reflow
    overlay.classList.add("pulse");
  }

  function performCopy(text, el) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Visual feedback
        isCopiedState = true;
        label.innerHTML = "<span>Copied!</span>";
        label.classList.add("copied");

        setTimeout(() => {
          isCopiedState = false;
          if (label) {
            label.classList.remove("copied");
            updateOverlay(el);
          }
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

  function performDownload(text) {
    const filename =
      (document.title || "extracted_text")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase() + ".txt";

    chrome.runtime.sendMessage(
      {
        action: "download_text",
        text: text,
        filename: filename,
      },
      (response) => {
        if (response && response.success) {
          console.log("Text saved successfully");
        } else {
          console.error(
            "Failed to save text",
            response ? response.error : "No response"
          );
        }
      }
    );
  }

  function showActionMenu(x, y, text, el) {
    removeActionMenu();

    actionMenu = document.createElement("div");
    actionMenu.className = "ext-text-extractor-menu";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy to Clipboard";
    copyBtn.onclick = () => {
      performCopy(text, el);
      removeActionMenu();
    };

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.textContent = "Save as .txt";
    downloadBtn.onclick = () => {
      performDownload(text);
      removeActionMenu();
    };

    const hint = document.createElement("div");
    hint.className = "menu-hint";
    hint.textContent = "Esc to cancel";

    actionMenu.appendChild(copyBtn);
    actionMenu.appendChild(downloadBtn);
    actionMenu.appendChild(hint);

    document.body.appendChild(actionMenu);

    // Position menu
    const menuRect = actionMenu.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let posX = x + scrollX;
    let posY = y + scrollY;

    // Adjust if it goes off screen
    if (x + menuRect.width > viewportWidth) posX -= menuRect.width;
    if (y + menuRect.height > viewportHeight) posY -= menuRect.height;

    actionMenu.style.left = `${posX}px`;
    actionMenu.style.top = `${posY}px`;

    // Close menu when clicking elsewhere
    const closeMenu = (e) => {
      if (actionMenu && !actionMenu.contains(e.target)) {
        removeActionMenu();
        document.removeEventListener("mousedown", closeMenu, true);
      }
    };
    document.addEventListener("mousedown", closeMenu, true);
  }

  function removeActionMenu() {
    if (actionMenu) {
      actionMenu.remove();
      actionMenu = null;
    }
  }

  function handleClick(e) {
    if (!active || !currentFocusElement) return;

    // If clicking on the action menu itself, let it happen
    if (actionMenu && actionMenu.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    const text = (currentFocusElement.innerText || "").trim();

    chrome.storage.local.get(["clickAction"], (result) => {
      const action = result.clickAction || "download";

      if (action === "ask") {
        showActionMenu(e.clientX, e.clientY, text, currentFocusElement);
      } else if (action === "copy") {
        performCopy(text, currentFocusElement);
      } else {
        performDownload(text);
      }
    });
  }

  function toggleActive(state) {
    if (active === state) return;
    active = state;
    if (active) {
      window.focus(); // Ensure focus for keyboard events
      createOverlay();
      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("click", handleClick, true);
      document.body.style.cursor = "crosshair";

      // Initial check for element under mouse
      const el = document.elementFromPoint(lastMouseX, lastMouseY);
      if (el) {
        hoveredElement = el;
        currentFocusElement = el;
        updateOverlay(currentFocusElement);
      }
    } else {
      removeOverlay();
      removeActionMenu();
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("click", handleClick, true);
      document.body.style.cursor = "";
      hoveredElement = null;
      currentFocusElement = null;
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
      toggleActive(request.enabled);
      sendResponse({ status: "ok" });
    } else if (request.action === "getStatus") {
      sendResponse({ active: active });
    }
  });

  // Listen for storage changes to sync state across all tabs
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) {
      toggleActive(changes.enabled.newValue);
    }
  });

  // Initialize state from storage (optional, but good for persistence)
  chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled) {
      toggleActive(true);
    }
  });
})();
