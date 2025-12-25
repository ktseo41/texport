// content.ts

interface Position {
  x: number;
  y: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

class OverlayManager {
  private overlay: HTMLDivElement | null = null;
  private label: HTMLDivElement | null = null;
  private isCopiedState: boolean = false;

  constructor() {}

  public create(): void {
    if (this.overlay) return;
    this.overlay = document.createElement("div");
    this.overlay.className = "texport-overlay";

    this.label = document.createElement("div");
    this.label.className = "texport-label";
    this.overlay.appendChild(this.label);

    document.body.appendChild(this.overlay);
  }

  public remove(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.label = null;
    }
  }

  public update(el: HTMLElement | null, isActive: boolean): void {
    if (!this.overlay || !this.label) return;

    if (!el || !isActive) {
      this.overlay.style.display = "none";
      return;
    }

    const rect = el.getBoundingClientRect();
    this.overlay.style.display = "block";
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;

    if (this.isCopiedState) return;

    const text = (el.innerText || "").trim();
    const tagName = el.tagName.toLowerCase();
    this.label.innerHTML = `<span class="texport-tag">${tagName}</span><span>${text.length}</span>`;

    this.updateLabelPosition(rect);
  }

  private updateLabelPosition(rect: DOMRect): void {
    if (!this.label) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const labelRect = this.label.getBoundingClientRect();

    let desiredX = rect.right - labelRect.width;
    if (desiredX + labelRect.width > viewportWidth - 10) {
      desiredX = viewportWidth - labelRect.width - 10;
    }
    if (desiredX < 10) {
      desiredX = 10;
    }

    let desiredY = rect.top - labelRect.height - 4;
    if (desiredY < 10) {
      desiredY = Math.max(10, rect.top + 4);
    }
    desiredY = Math.min(desiredY, rect.bottom - labelRect.height - 4);
    desiredY = Math.min(desiredY, viewportHeight - labelRect.height - 10);

    this.label.style.left = `${desiredX - rect.left}px`;
    this.label.style.top = `${desiredY - rect.top}px`;
    this.label.style.marginTop = "0";
  }

  public triggerPulse(): void {
    if (!this.overlay) return;
    this.overlay.classList.remove("pulse");
    void this.overlay.offsetWidth;
    this.overlay.classList.add("pulse");
  }

  public showCopiedFeedback(el: HTMLElement): void {
    if (!this.label) return;
    this.isCopiedState = true;
    this.label.innerHTML = "<span>Copied!</span>";
    this.label.classList.add("copied");

    setTimeout(() => {
      this.isCopiedState = false;
      if (this.label) {
        this.label.classList.remove("copied");
        this.update(el, true);
      }
    }, 1000);
  }
}

class ActionMenuManager {
  private menu: HTMLDivElement | null = null;

  constructor(
    private onCopy: () => void,
    private onDownload: () => void,
    private onCancel: () => void
  ) {}

  public show(x: number, y: number): void {
    this.remove();

    this.menu = document.createElement("div");
    this.menu.className = "texport-menu";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy to Clipboard";
    copyBtn.onclick = () => {
      this.onCopy();
      this.remove();
    };

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.textContent = "Save as .txt";
    downloadBtn.onclick = () => {
      this.onDownload();
      this.remove();
    };

    const hint = document.createElement("div");
    hint.className = "menu-hint";
    hint.textContent = "Esc to cancel";

    this.menu.appendChild(copyBtn);
    this.menu.appendChild(downloadBtn);
    this.menu.appendChild(hint);

    document.body.appendChild(this.menu);
    this.positionMenu(x, y);

    const closeMenu = (e: MouseEvent) => {
      if (this.menu && !this.menu.contains(e.target as Node)) {
        this.remove();
        document.removeEventListener("mousedown", closeMenu, true);
        this.onCancel();
      }
    };
    document.addEventListener("mousedown", closeMenu, true);
  }

  private positionMenu(x: number, y: number): void {
    if (!this.menu) return;

    const menuRect = this.menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let posX = x + window.scrollX;
    let posY = y + window.scrollY;

    if (x + menuRect.width > viewportWidth) posX -= menuRect.width;
    if (y + menuRect.height > viewportHeight) posY -= menuRect.height;

    this.menu.style.left = `${posX}px`;
    this.menu.style.top = `${posY}px`;
  }

  public remove(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }

  public isActive(): boolean {
    return this.menu !== null;
  }
}

class TextExporter {
  private active: boolean = false;
  private hoveredElement: HTMLElement | null = null;
  private currentFocusElement: HTMLElement | null = null;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private rafId: number | null = null;

  private overlayManager: OverlayManager;
  private actionMenuManager: ActionMenuManager;

  constructor() {
    this.overlayManager = new OverlayManager();
    this.actionMenuManager = new ActionMenuManager(
      () => this.handleCopy(),
      () => this.handleDownload(),
      () => {}
    );

    this.initialize();
  }

  private initialize(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggle") {
        this.toggle(request.enabled);
        sendResponse({ status: "ok" });
      } else if (request.action === "getStatus") {
        sendResponse({ active: this.active });
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.enabled) {
        this.toggle(!!changes.enabled.newValue);
      }
    });

    chrome.storage.local.get(["enabled"], (result) => {
      if (result.enabled) {
        this.toggle(true);
      }
    });

    // Track mouse position even when inactive to have a starting point
    document.addEventListener("mousemove", (e) => {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }, true);
  }

  private toggle(state: boolean): void {
    if (this.active === state) return;
    this.active = state;

    if (this.active) {
      window.focus();
      this.overlayManager.create();
      this.addEventListeners();
      document.body.style.cursor = "crosshair";
      this.updateFromCurrentPosition();
    } else {
      this.overlayManager.remove();
      this.actionMenuManager.remove();
      this.removeEventListeners();
      document.body.style.cursor = "";
      this.hoveredElement = null;
      this.currentFocusElement = null;
    }
  }

  private addEventListeners(): void {
    document.addEventListener("mousemove", this.handleMouseMove, true);
    document.addEventListener("keydown", this.handleKeyDown, true);
    document.addEventListener("click", this.handleClick, true);
    window.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  private removeEventListeners(): void {
    document.removeEventListener("mousemove", this.handleMouseMove, true);
    document.removeEventListener("keydown", this.handleKeyDown, true);
    document.removeEventListener("click", this.handleClick, true);
    window.removeEventListener("scroll", this.handleScroll);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (!this.active || this.actionMenuManager.isActive()) return;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const el = document.elementFromPoint(this.lastMouseX, this.lastMouseY) as HTMLElement | null;
      if (el && this.isSelectable(el)) {
        if (this.hoveredElement !== el) {
          this.hoveredElement = el;
          this.currentFocusElement = el;
          this.overlayManager.update(this.currentFocusElement, this.active);
        }
      }
      this.rafId = null;
    });
  };

  private isSelectable(el: HTMLElement): boolean {
    // Basic check to avoid selecting the overlay itself
    return !el.classList.contains("texport-overlay") && !el.closest(".texport-overlay");
  }

  private handleScroll = (): void => {
    if (!this.active || !this.currentFocusElement) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.overlayManager.update(this.currentFocusElement, this.active);
      this.rafId = null;
    });
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.active) return;

    if (e.key === "Escape") {
      if (this.actionMenuManager.isActive()) {
        this.actionMenuManager.remove();
      } else {
        this.toggle(false);
      }
      return;
    }

    if (this.actionMenuManager.isActive()) return;

    this.handleNavigation(e);
  };

  private handleNavigation(e: KeyboardEvent): void {
    if (!this.currentFocusElement) {
      this.updateFromCurrentPosition();
    }

    if (!this.currentFocusElement) return;

    if (e.key === "ArrowUp") {
      this.navigateUp(e);
    } else if (e.key === "ArrowDown") {
      this.navigateDown(e);
    }
  }

  private navigateUp(e: KeyboardEvent): void {
    const parent = this.currentFocusElement?.parentElement;
    if (parent && parent !== document.documentElement) {
      e.preventDefault();
      e.stopPropagation();
      this.currentFocusElement = parent as HTMLElement;
      this.overlayManager.update(this.currentFocusElement, this.active);
      this.overlayManager.triggerPulse();
    }
  }

  private navigateDown(e: KeyboardEvent): void {
    if (!this.hoveredElement || !this.currentFocusElement) return;
    
    if (this.currentFocusElement.contains(this.hoveredElement) && this.currentFocusElement !== this.hoveredElement) {
      e.preventDefault();
      e.stopPropagation();
      let child: HTMLElement = this.hoveredElement;
      while (child.parentElement !== this.currentFocusElement) {
        child = child.parentElement as HTMLElement;
      }
      this.currentFocusElement = child;
      this.overlayManager.update(this.currentFocusElement, this.active);
      this.overlayManager.triggerPulse();
    }
  }

  private handleClick = (e: MouseEvent): void => {
    if (!this.active || !this.currentFocusElement) return;
    if (this.actionMenuManager.isActive()) return;

    e.preventDefault();
    e.stopPropagation();

    chrome.storage.local.get(["clickAction"], (result) => {
      const action = result.clickAction || "download";
      if (action === "ask") {
        this.actionMenuManager.show(e.clientX, e.clientY);
      } else if (action === "copy") {
        this.handleCopy();
      } else {
        this.handleDownload();
      }
    });
  };

  private handleCopy(): void {
    if (!this.currentFocusElement) return;
    const text = this.currentFocusElement.innerText.trim();
    navigator.clipboard.writeText(text).then(() => {
      this.overlayManager.showCopiedFeedback(this.currentFocusElement!);
    }).catch(err => console.error("Failed to copy:", err));
  }

  private handleDownload(): void {
    if (!this.currentFocusElement) return;
    const text = this.currentFocusElement.innerText.trim();
    const filename = (document.title || "extracted_text").replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".txt";

    chrome.runtime.sendMessage({
      action: "download_text",
      text: text,
      filename: filename
    }, (response) => {
      if (response?.success) console.log("Text saved successfully");
      else console.error("Failed to save text", response?.error || "No response");
    });
  }

  private updateFromCurrentPosition(): void {
    const el = document.elementFromPoint(this.lastMouseX, this.lastMouseY) as HTMLElement | null;
    if (el && this.isSelectable(el)) {
      this.hoveredElement = el;
      this.currentFocusElement = el;
      this.overlayManager.update(this.currentFocusElement, this.active);
    }
  }
}

new TextExporter();

