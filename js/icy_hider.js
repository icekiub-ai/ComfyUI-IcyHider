import { app } from "../../scripts/app.js";

// Cache for settings to avoid repeated lookups
let settingsCache = {
    avalanche: true,
    hideMode: "cover",
    blurAmount: 20,
    gradientStart: "1E3C72",
    gradientEnd: "2A5298",
    borderColor: "A5DEE5",
    icon: "❄️",
    text: "FROZEN",
    textColor: "E0F7FA",
    dirty: true
};

// Refresh settings cache (call sparingly)
function refreshSettingsCache() {
    if (!settingsCache.dirty) return;
    settingsCache.avalanche = app.ui.settings.getSettingValue("IcyHider.Avalanche", true);
    settingsCache.hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");
    settingsCache.blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
    settingsCache.gradientStart = app.ui.settings.getSettingValue("IcyHider.GradientStart", "1E3C72") || "1E3C72";
    settingsCache.gradientEnd = app.ui.settings.getSettingValue("IcyHider.GradientEnd", "2A5298") || "2A5298";
    settingsCache.borderColor = app.ui.settings.getSettingValue("IcyHider.BorderColor", "A5DEE5") || "A5DEE5";
    settingsCache.icon = app.ui.settings.getSettingValue("IcyHider.Icon", "❄️") || "❄️";
    settingsCache.text = app.ui.settings.getSettingValue("IcyHider.Text", "FROZEN") || "FROZEN";
    settingsCache.textColor = app.ui.settings.getSettingValue("IcyHider.TextColor", "E0F7FA") || "E0F7FA";
    settingsCache.dirty = false;
}

function markSettingsDirty() {
    settingsCache.dirty = true;
}

// Check if a node is "Icy" by checking if its class name starts with "Icy"
function isIcyNode(node) {
    return node.comfyClass && node.comfyClass.startsWith("Icy");
}

// Single source of truth: should this node be hidden right now?
// This is called during draw, so it checks current state directly
function computeHiddenForNode(node) {
    if (settingsCache.avalanche) {
        // Avalanche ON: All nodes hidden unless selected
        // Check is_selected which is more reliable than selected property
        const isSelected = node.is_selected || node.selected || 
            (app.canvas && app.canvas.selected_nodes && app.canvas.selected_nodes[node.id]);
        return !isSelected;
    } else {
        // Avalanche OFF: Only Icy nodes hidden, and only if not hovered
        if (isIcyNode(node)) {
            return !node.icy_is_hovered;
        }
        return false;
    }
}

// Update hidden state - returns true if changed
function updateNodeHidden(node, skipDOMUpdate = false) {
    const newHidden = computeHiddenForNode(node);
    // Only update if state actually changed
    if (node.icy_hidden === newHidden) return false;
    
    node.icy_hidden = newHidden;
    if (!skipDOMUpdate) {
        updateNodeDOMElements(node, node.icy_hidden);
    }
    return true;
}

// Sync hidden state during draw (cheap check)
function syncHiddenState(node) {
    const newHidden = computeHiddenForNode(node);
    if (node.icy_hidden !== newHidden) {
        node.icy_hidden = newHidden;
        updateNodeDOMElements(node, newHidden);
    }
}

// Check if element contains an animated media type
function isAnimatedMediaElement(element) {
    if (!element || !element.tagName) return false;

    const tag = element.tagName.toUpperCase();

    // Any <video> is treated as animated
    if (tag === "VIDEO") {
        return true;
    }

    if (tag === "IMG") {
        const src = (element.src || "").toLowerCase();

        if (!src) return false;

        // Cover both filename and query param hints
        const animatedHints = [
            ".gif",
            ".apng",
            ".avif",
            ".webp",
            "format=image%2Fgif",
            "format=image/gif",
        ];

        return animatedHints.some(h => src.includes(h));
    }

    return false;
}

// Function to apply blur/cover to DOM elements within a node
function updateNodeDOMElements(node, hide) {
    if (!node.widgets) return;
    
    const hideMode = settingsCache.hideMode;
    const blurAmount = settingsCache.blurAmount;
    
    for (let i = 0; i < node.widgets.length; i++) {
        const widget = node.widgets[i];
        // Find the actual DOM element for this widget
        const element = widget.inputEl || widget.element;
        if (!element) continue;

        // Animated media (video, gif, apng, avif, etc) is ALWAYS covered,
        // even if the global mode is "blur".
        const effectiveMode = isAnimatedMediaElement(element) ? "cover" : hideMode;
        
        if (hide && effectiveMode === "blur") {
            element.style.filter = `blur(${blurAmount}px)`;
            element.style.opacity = "1";
            element.style.pointerEvents = "none";
            element.style.userSelect = "none";
        } else if (hide && effectiveMode === "cover") {
            element.style.filter = "none";
            element.style.opacity = "0";
            element.style.pointerEvents = "none";
            element.style.userSelect = "none";
        } else {
            element.style.filter = "none";
            element.style.opacity = "1";
            element.style.pointerEvents = "auto";
            element.style.userSelect = "auto";
        }
    }
}



// Show confirmation dialog for reload
function showReloadDialog() {
    // Prevent multiple dialogs
    if (document.getElementById("icy-reload-dialog")) return;
    
    const dialog = document.createElement("div");
    dialog.id = "icy-reload-dialog";
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        border: 2px solid #A5DEE5;
        border-radius: 10px;
        padding: 20px 30px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: Arial, sans-serif;
    `;
    
    dialog.innerHTML = `
        <div style="color: #E0F7FA; font-size: 16px; margin-bottom: 20px;">
            The page needs to reload for this setting to take effect.<br>
            Reload now?
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="icy-reload-yes" style="
                background: #2A5298;
                color: #E0F7FA;
                border: 1px solid #A5DEE5;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Reload</button>
            <button id="icy-reload-no" style="
                background: #333;
                color: #E0F7FA;
                border: 1px solid #666;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById("icy-reload-yes").onclick = () => {
        location.reload();
    };
    
    document.getElementById("icy-reload-no").onclick = () => {
        dialog.remove();
    };
}

app.registerExtension({
    name: "Comfy.IcyHider",
    settings: [
        {
            id: "IcyHider.Avalanche",
            name: "Hide All Nodes (Icy + Non-Icy)",
            type: "boolean",
            defaultValue: true,
            tooltip: "When ON: all nodes hidden until selected. When OFF: only Icy nodes hidden, revealed on hover.",
            onChange: (newVal, oldVal) => {
                markSettingsDirty();
                // Only show dialog if this is an actual user change, not initial load
                if (oldVal !== undefined && oldVal !== newVal) {
                    showReloadDialog();
                }
            }
        },
        {
            id: "IcyHider.HideMode",
            name: "Hide Mode",
            type: "combo",
            defaultValue: "cover",
            options: ["cover", "blur"],
            tooltip: "Choose between cover overlay or blur effect.",
            onChange: (newVal, oldVal) => {
                markSettingsDirty();
                // Only show dialog if this is an actual user change, not initial load
                if (oldVal !== undefined && oldVal !== newVal) {
                    showReloadDialog();
                }
            }
        },
        {
            id: "IcyHider.BlurAmount",
            name: "Blur Amount",
            type: "slider",
            defaultValue: 20,
            attrs: {
                min: 0,
                max: 50,
                step: 1
            },
            tooltip: "Amount of blur to apply (0-50px). Only applies when Hide Mode is 'blur'.",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.GradientStart",
            name: "Gradient Start Color",
            type: "color",
            defaultValue: "1E3C72",
            tooltip: "The starting color of the gradient background (cover mode only).",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.GradientEnd",
            name: "Gradient End Color",
            type: "color",
            defaultValue: "2A5298",
            tooltip: "The ending color of the gradient background (cover mode only).",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.BorderColor",
            name: "Border Color",
            type: "color",
            defaultValue: "A5DEE5",
            tooltip: "The color of the border around the cover (cover mode only).",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.Icon",
            name: "Icon",
            type: "text",
            defaultValue: "❄️",
            tooltip: "The emoji or text icon to display (cover mode only).",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.Text",
            name: "Text",
            type: "text",
            defaultValue: "FROZEN",
            tooltip: "The text to display below the icon (cover mode only).",
            onChange: () => markSettingsDirty()
        },
        {
            id: "IcyHider.TextColor",
            name: "Text Color",
            type: "color",
            defaultValue: "E0F7FA",
            tooltip: "The color of the text and icon (cover mode only).",
            onChange: () => markSettingsDirty()
        }
    ],

    async nodeCreated(node, appInstance) {
        // Initialize hover state
        node.icy_is_hovered = false;
        
        // Ensure settings are loaded
        refreshSettingsCache();
        
        // Initial hidden state when node appears
        node.icy_hidden = computeHiddenForNode(node);

        // Override onSelected - This gets called when node is selected
        const origOnSelected = node.onSelected;
        node.onSelected = function () {
            refreshSettingsCache();
            if (updateNodeHidden(this)) {
                this.setDirtyCanvas(true, true);
            }
            if (origOnSelected) origOnSelected.apply(this, arguments);
        };

        // Override onDeselected - This gets called when node is deselected
        const origOnDeselected = node.onDeselected;
        node.onDeselected = function () {
            refreshSettingsCache();
            if (updateNodeHidden(this)) {
                this.setDirtyCanvas(true, true);
            }
            if (origOnDeselected) origOnDeselected.apply(this, arguments);
        };

        // Override onMouseEnter for hover detection
        const origOnMouseEnter = node.onMouseEnter;
        node.onMouseEnter = function (e) {
            this.icy_is_hovered = true;
            refreshSettingsCache();
            if (updateNodeHidden(this)) {
                this.setDirtyCanvas(true, true);
            }
            if (origOnMouseEnter) origOnMouseEnter.apply(this, arguments);
        };

        // Override onMouseLeave for hover detection
        const origOnMouseLeave = node.onMouseLeave;
        node.onMouseLeave = function (e) {
            this.icy_is_hovered = false;
            refreshSettingsCache();
            if (updateNodeHidden(this)) {
                this.setDirtyCanvas(true, true);
            }
            if (origOnMouseLeave) origOnMouseLeave.apply(this, arguments);
        };

        // Override drawWidgets
        const origDrawWidgets = node.drawWidgets;
        node.drawWidgets = function (ctx, posY) {
            if (!this.icy_hidden) {
                if (origDrawWidgets) {
                    origDrawWidgets.apply(this, arguments);
                }
                return;
            }

            if (settingsCache.hideMode === "blur") {
                ctx.save();

                const titleHeight = 30;
                ctx.beginPath();
                ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                ctx.clip();

                ctx.filter = `blur(${settingsCache.blurAmount}px)`;

                if (origDrawWidgets) {
                    origDrawWidgets.apply(this, arguments);
                }

                ctx.filter = "none";
                ctx.restore();
            }
            // cover mode: skip drawing widgets entirely (implicit return)
        };

        // Use a symbol to store our wrapper to avoid conflicts with other extensions
        const icyDrawBgKey = Symbol.for("icy_onDrawBackground");
        const icyDrawFgKey = Symbol.for("icy_onDrawForeground");
        
        // Mark that we've processed this node
        node[icyDrawBgKey] = true;
        node[icyDrawFgKey] = true;

        // Simple wrapper approach - wrap the function directly without defineProperty
        const wrapDrawBackground = () => {
            const currentFn = node.onDrawBackground;
            // Skip if already our wrapper or no function
            if (currentFn && currentFn._icyWrapped) return;
            
            const wrappedFn = function(ctx) {
                // Sync hidden state on every draw (cheap check)
                syncHiddenState(this);
                
                if (this.icy_hidden && settingsCache.hideMode === "blur") {
                    ctx.save();

                    const titleHeight = 30;
                    ctx.beginPath();
                    ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                    ctx.clip();

                    ctx.filter = `blur(${settingsCache.blurAmount}px)`;

                    if (currentFn) {
                        currentFn.apply(this, arguments);
                    }

                    ctx.filter = "none";
                    ctx.restore();
                } else {
                    if (currentFn) {
                        currentFn.apply(this, arguments);
                    }
                }
            };
            wrappedFn._icyWrapped = true;
            wrappedFn._icyOriginal = currentFn;
            node.onDrawBackground = wrappedFn;
        };

        const wrapDrawForeground = () => {
            const currentFn = node.onDrawForeground;
            // Skip if already our wrapper or no function  
            if (currentFn && currentFn._icyWrapped) return;
            
            const wrappedFn = function(ctx) {
                if (this.icy_hidden && settingsCache.hideMode === "blur") {
                    ctx.save();

                    const titleHeight = 30;
                    ctx.beginPath();
                    ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                    ctx.clip();

                    ctx.filter = `blur(${settingsCache.blurAmount}px)`;

                    if (currentFn) {
                        currentFn.apply(this, arguments);
                    }

                    ctx.filter = "none";
                    ctx.restore();
                } else if (this.icy_hidden && settingsCache.hideMode === "cover") {
                    // In cover mode, still call original first (for any side effects)
                    if (currentFn) {
                        currentFn.apply(this, arguments);
                    }

                    // Then draw cover on top
                    ctx.save();
                    const titleHeight = 30;

                    const gradStart = "#" + settingsCache.gradientStart;
                    const gradEnd = "#" + settingsCache.gradientEnd;
                    const borderColor = "#" + settingsCache.borderColor;
                    const icon = settingsCache.icon;
                    const text = settingsCache.text;
                    const textColor = "#" + settingsCache.textColor;

                    const grad = ctx.createLinearGradient(
                        0,
                        titleHeight,
                        0,
                        this.size[1]
                    );
                    grad.addColorStop(0, gradStart);
                    grad.addColorStop(1, gradEnd);
                    ctx.fillStyle = grad;

                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(
                            0,
                            titleHeight,
                            this.size[0],
                            this.size[1] - titleHeight,
                            [0, 0, 10, 10]
                        );
                    } else {
                        ctx.rect(
                            0,
                            titleHeight,
                            this.size[0],
                            this.size[1] - titleHeight
                        );
                    }
                    ctx.fill();

                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    const centerX = this.size[0] / 2;
                    const centerY = (this.size[1] + titleHeight) / 2;

                    ctx.fillStyle = textColor;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    ctx.font = "32px Arial";
                    ctx.fillText(icon, centerX, centerY - 15);

                    ctx.font = "bold 14px Arial";
                    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                    ctx.shadowBlur = 4;
                    ctx.fillText(text, centerX, centerY + 15);

                    ctx.restore();
                } else {
                    if (currentFn) {
                        currentFn.apply(this, arguments);
                    }
                }
            };
            wrappedFn._icyWrapped = true;
            wrappedFn._icyOriginal = currentFn;
            node.onDrawForeground = wrappedFn;
        };

        // Wrap now
        wrapDrawBackground();
        wrapDrawForeground();
        
        // Re-wrap after a delay to catch late-binding extensions like VHS
        setTimeout(() => {
            // Check if someone replaced our wrapper
            if (!node.onDrawBackground || !node.onDrawBackground._icyWrapped) {
                wrapDrawBackground();
            }
            if (!node.onDrawForeground || !node.onDrawForeground._icyWrapped) {
                wrapDrawForeground();
            }
        }, 100);
    },

    async setup() {
        // Initial settings load
        refreshSettingsCache();
        
        // Debounced DOM update function for MutationObserver
        let domUpdateTimeout = null;
        const debouncedDOMUpdate = () => {
            if (domUpdateTimeout) return;
            domUpdateTimeout = setTimeout(() => {
                domUpdateTimeout = null;
                if (app.graph && app.graph._nodes) {
                    for (let i = 0; i < app.graph._nodes.length; i++) {
                        const graphNode = app.graph._nodes[i];
                        if (graphNode.icy_hidden) {
                            updateNodeDOMElements(graphNode, true);
                        }
                    }
                }
            }, 50);
        };
        
        // Monitor for dynamically created widgets
        const observer = new MutationObserver((mutations) => {
            let hasRelevantChanges = false;
            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.nodeType === 1 && (node.tagName === 'TEXTAREA' || node.tagName === 'VIDEO' || node.tagName === 'IMG')) {
                        hasRelevantChanges = true;
                        break;
                    }
                }
                if (hasRelevantChanges) break;
            }
            
            if (hasRelevantChanges) {
                debouncedDOMUpdate();
            }
        });
        
        // Observe the canvas container
        const canvasContainer = document.querySelector('.graphcanvas') || document.body;
        observer.observe(canvasContainer, {
            childList: true,
            subtree: true
        });

        // Add CSS for smooth transitions
        const style = document.createElement("style");
        style.textContent = `
            .graphcanvas textarea,
            .graphcanvas video,
            .graphcanvas img,
            .graphcanvas .comfy-multiline-input {
                transition: opacity 0.2s ease, filter 0.2s ease;
            }
        `;

        document.head.appendChild(style);
    }
});
