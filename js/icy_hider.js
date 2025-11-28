import { app } from "../../scripts/app.js";

// Check if a node is "Icy" by checking if its class name starts with "Icy"
function isIcyNode(node) {
    return node.comfyClass && node.comfyClass.startsWith("Icy");
}

// Single source of truth: should this node be hidden right now?
function computeHiddenForNode(node) {
    const Avalanche = app.ui.settings.getSettingValue("IcyHider.Avalanche", true);
    
    if (Avalanche) {
        // Avalanche ON: All nodes hidden unless selected
        return !node.selected;
    } else {
        // Avalanche OFF: Only Icy nodes hidden, and only if not hovered
        if (isIcyNode(node)) {
            return !node.icy_is_hovered;
        }
        return false;
    }
}

function updateNodeHidden(node) {
    node.icy_should_be_hidden = computeHiddenForNode(node);
    node.icy_hidden = node.icy_should_be_hidden;
    updateNodeDOMElements(node, node.icy_hidden);
}

function updateAllNodes() {
    if (!app.graph || !app.graph._nodes) return;
    app.graph._nodes.forEach(updateNodeHidden);
    if (app.canvas) {
        app.canvas.setDirty(true, true);
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
    
    node.widgets.forEach(widget => {
        // Find the actual DOM element for this widget
        const element = widget.inputEl || widget.element;
        if (!element) return;
        
        const globalHideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");

        // Animated media (video, gif, apng, avif, etc) is ALWAYS covered,
        // even if the global mode is "blur".
        const effectiveMode = isAnimatedMediaElement(element) ? "cover" : globalHideMode;
        
        if (hide && effectiveMode === "blur") {
            const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
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
    });
}



// Show confirmation dialog for reload
function showReloadDialog() {
    const dialog = document.createElement("div");
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
            tooltip: "Amount of blur to apply (0-50px). Only applies when Hide Mode is 'blur'."
        },
        {
            id: "IcyHider.GradientStart",
            name: "Gradient Start Color",
            type: "color",
            defaultValue: "1E3C72",
            tooltip: "The starting color of the gradient background (cover mode only)."
        },
        {
            id: "IcyHider.GradientEnd",
            name: "Gradient End Color",
            type: "color",
            defaultValue: "2A5298",
            tooltip: "The ending color of the gradient background (cover mode only)."
        },
        {
            id: "IcyHider.BorderColor",
            name: "Border Color",
            type: "color",
            defaultValue: "A5DEE5",
            tooltip: "The color of the border around the cover (cover mode only)."
        },
        {
            id: "IcyHider.Icon",
            name: "Icon",
            type: "text",
            defaultValue: "❄️",
            tooltip: "The emoji or text icon to display (cover mode only)."
        },
        {
            id: "IcyHider.Text",
            name: "Text",
            type: "text",
            defaultValue: "FROZEN",
            tooltip: "The text to display below the icon (cover mode only)."
        },
        {
            id: "IcyHider.TextColor",
            name: "Text Color",
            type: "color",
            defaultValue: "E0F7FA",
            tooltip: "The color of the text and icon (cover mode only)."
        }
    ],

    async nodeCreated(node, appInstance) {
        // Initialize hover state
        node.icy_is_hovered = false;
        
        // Initial hidden state when node appears
        updateNodeHidden(node);

        // Store original selected state
        let wasSelected = false;

        // Override onSelected - This gets called when node is selected
        const origOnSelected = node.onSelected;
        node.onSelected = function () {
            wasSelected = true;
            this.selected = true;
            updateNodeHidden(this);
            this.setDirtyCanvas(true, true);
            if (origOnSelected) origOnSelected.apply(this, arguments);
        };

        // Override onDeselected - This gets called when node is deselected
        const origOnDeselected = node.onDeselected;
        node.onDeselected = function () {
            wasSelected = false;
            this.selected = false;
            updateNodeHidden(this);
            this.setDirtyCanvas(true, true);
            if (origOnDeselected) origOnDeselected.apply(this, arguments);
        };

        // Also monitor the selected property directly in case callbacks aren't fired
        const checkSelectionState = () => {
            if (node.selected !== wasSelected) {
                wasSelected = node.selected;
                updateNodeHidden(node);
                node.setDirtyCanvas(true, true);
            }
        };

        // Check selection state periodically as a fallback
        setInterval(checkSelectionState, 100);

        // Override onMouseEnter for hover detection
        const origOnMouseEnter = node.onMouseEnter;
        node.onMouseEnter = function (e) {
            this.icy_is_hovered = true;
            updateNodeHidden(this);
            this.setDirtyCanvas(true, true);
            if (origOnMouseEnter) origOnMouseEnter.apply(this, arguments);
        };

        // Override onMouseLeave for hover detection
        const origOnMouseLeave = node.onMouseLeave;
        node.onMouseLeave = function (e) {
            this.icy_is_hovered = false;
            updateNodeHidden(this);
            this.setDirtyCanvas(true, true);
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

            const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");

            if (hideMode === "blur") {
                ctx.save();

                const titleHeight = 30;
                ctx.beginPath();
                ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                ctx.clip();

                const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
                ctx.filter = `blur(${blurAmount}px)`;

                if (origDrawWidgets) {
                    origDrawWidgets.apply(this, arguments);
                }

                ctx.filter = "none";
                ctx.restore();
            } else {
                // cover mode: skip drawing widgets entirely
                return;
            }
        };

        // Override onDrawBackground
        let originalOnDrawBackground = node.onDrawBackground;
        Object.defineProperty(node, "onDrawBackground", {
            get: function () {
                return function (ctx) {
                    const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");

                    if (this.icy_hidden && hideMode === "blur") {
                        const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
                        ctx.save();

                        const titleHeight = 30;
                        ctx.beginPath();
                        ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                        ctx.clip();

                        ctx.filter = `blur(${blurAmount}px)`;

                        if (originalOnDrawBackground) {
                            originalOnDrawBackground.apply(this, arguments);
                        }

                        ctx.filter = "none";
                        ctx.restore();
                    } else {
                        if (originalOnDrawBackground) {
                            originalOnDrawBackground.apply(this, arguments);
                        }
                    }
                };
            },
            set: function (val) {
                originalOnDrawBackground = val;
            }
        });

        // Override onDrawForeground
        let originalOnDrawForeground = node.onDrawForeground;
        Object.defineProperty(node, "onDrawForeground", {
            get: function () {
                return function (ctx) {
                    const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");

                    if (this.icy_hidden && hideMode === "blur") {
                        const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
                        ctx.save();

                        const titleHeight = 30;
                        ctx.beginPath();
                        ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                        ctx.clip();

                        ctx.filter = `blur(${blurAmount}px)`;

                        if (originalOnDrawForeground) {
                            originalOnDrawForeground.apply(this, arguments);
                        }

                        ctx.filter = "none";
                        ctx.restore();
                    } else if (this.icy_hidden && hideMode === "cover") {
                        if (originalOnDrawForeground) {
                            originalOnDrawForeground.apply(this, arguments);
                        }

                        ctx.save();
                        const titleHeight = 30;

                        const gradStart =
                            "#" +
                            (app.ui.settings.getSettingValue("IcyHider.GradientStart", "1E3C72") ||
                                "1E3C72");
                        const gradEnd =
                            "#" +
                            (app.ui.settings.getSettingValue("IcyHider.GradientEnd", "2A5298") ||
                                "2A5298");
                        const borderColor =
                            "#" +
                            (app.ui.settings.getSettingValue("IcyHider.BorderColor", "A5DEE5") ||
                                "A5DEE5");
                        const icon =
                            app.ui.settings.getSettingValue("IcyHider.Icon", "❄️") || "❄️";
                        const text =
                            app.ui.settings.getSettingValue("IcyHider.Text", "FROZEN") ||
                            "FROZEN";
                        const textColor =
                            "#" +
                            (app.ui.settings.getSettingValue("IcyHider.TextColor", "E0F7FA") ||
                                "E0F7FA");

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
                        if (originalOnDrawForeground) {
                            originalOnDrawForeground.apply(this, arguments);
                        }
                    }
                };
            },
            set: function (val) {
                originalOnDrawForeground = val;
            }
        });
    },

    async setup() {
        // Monitor for dynamically created widgets
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (node.tagName === 'TEXTAREA' || node.tagName === 'VIDEO' || node.tagName === 'IMG')) {

                        // Find which graph node this belongs to
                        if (app.graph && app.graph._nodes) {
                            app.graph._nodes.forEach(graphNode => {
                                if (graphNode.icy_hidden) {
                                    updateNodeDOMElements(graphNode, true);
                                }
                            });
                        }
                    }
                });
            });
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