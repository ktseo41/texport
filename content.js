// content.js
(function () {
  let active = false;
  let hoveredElement = null;
  let currentFocusElement = null;
  let overlay = null;
  let label = null;

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

    const text = el.innerText || "";
    label.textContent = `Chars: ${text.trim().length}`;

    // Adjust label position if too close to top
    if (rect.top < 30) {
      label.style.top = "100%";
      label.style.borderRadius = "0 0 4px 4px";
    } else {
      label.style.top = "-24px";
      label.style.borderRadius = "4px 4px 0 0";
    }
  }

  function handleMouseMove(e) {
    if (!active) return;

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
    if (!active || !currentFocusElement) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (
        currentFocusElement.parentElement &&
        currentFocusElement.parentElement !== document.body
      ) {
        currentFocusElement = currentFocusElement.parentElement;
        updateOverlay(currentFocusElement);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      // Try to go back to the original hovered element if we are at a parent
      // or find the first child that contains text
      if (
        currentFocusElement.contains(hoveredElement) &&
        currentFocusElement !== hoveredElement
      ) {
        // Heuristic: move one step back towards hoveredElement
        let child = hoveredElement;
        while (child.parentElement !== currentFocusElement) {
          child = child.parentElement;
        }
        currentFocusElement = child;
        updateOverlay(currentFocusElement);
      }
    } else if (e.key === "Escape") {
      toggleActive(false);
    }
  }

  function handleClick(e) {
    if (!active || !currentFocusElement) return;

    e.preventDefault();
    e.stopPropagation();

    const text = currentFocusElement.innerText || "";
    const filename =
      (document.title || "extracted_text")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase() + ".txt";

    chrome.runtime.sendMessage(
      {
        action: "download_text",
        text: text.trim(),
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

    // Optionally deactivate after click? User didn't specify, but usually useful.
    // toggleActive(false);
  }

  function toggleActive(state) {
    active = state;
    if (active) {
      createOverlay();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("click", handleClick, true);
      document.body.style.cursor = "crosshair";
    } else {
      removeOverlay();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
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

  // Initialize state from storage (optional, but good for persistence)
  chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled) {
      toggleActive(true);
    }
  });
})();
