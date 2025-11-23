import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "Comfy.IcyHider",
    settings: [
        {
            id: "IcyHider.Enabled",
            name: "Enable Hiding",
            type: "boolean",
            defaultValue: true,
            tooltip: "Enable or disable the image hiding functionality.",
            onChange: (newVal) => {
                // Update all IcyHider nodes when toggled
                if (app.graph && app.graph._nodes) {
                    app.graph._nodes.forEach(node => {
                        if (node.comfyClass === "IcyPreviewImage" || node.comfyClass === "IcyLoadImage" || node.comfyClass === "IcySaveImage") {
                            if (newVal) {
                                node.icy_hidden = true;
                            } else {
                                node.icy_hidden = false;
                            }
                            node.setDirtyCanvas(true, true);
                        }
                    });
                }
            }
        },
        {
            id: "IcyHider.HideMode",
            name: "Hide Mode",
            type: "combo",
            defaultValue: "cover",
            options: ["cover", "blur"],
            tooltip: "Choose between cover overlay or blur effect."
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
	async nodeCreated(node, app) {
		if (node.comfyClass === "IcyPreviewImage" || node.comfyClass === "IcyLoadImage" || node.comfyClass === "IcySaveImage") {
            // Check if enabled on creation
            const enabled = app.ui.settings.getSettingValue("IcyHider.Enabled", true);
            node.icy_hidden = enabled;

            // Override onMouseEnter
            const origOnMouseEnter = node.onMouseEnter;
            node.onMouseEnter = function(e) {
                const enabled = app.ui.settings.getSettingValue("IcyHider.Enabled", true);
                if (enabled) {
                    this.icy_hidden = false;
                    this.setDirtyCanvas(true, true);
                }
                if (origOnMouseEnter) origOnMouseEnter.apply(this, arguments);
            }

            // Override onMouseLeave
            const origOnMouseLeave = node.onMouseLeave;
            node.onMouseLeave = function(e) {
                const enabled = app.ui.settings.getSettingValue("IcyHider.Enabled", true);
                if (enabled) {
                    this.icy_hidden = true;
                    this.setDirtyCanvas(true, true);
                }
                if (origOnMouseLeave) origOnMouseLeave.apply(this, arguments);
            }

            // Override drawWidgets to hide widgets when hidden
            // This is crucial for LoadImage and any node using widgets for display
            const origDrawWidgets = node.drawWidgets;
            node.drawWidgets = function(ctx, posY) {
                if (!this.icy_hidden) {
                    if (origDrawWidgets) {
                        origDrawWidgets.apply(this, arguments);
                    }
                    return;
                }
                
                const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");
                
                if (hideMode === "blur") {
                    // In blur mode, draw widgets with blur and clipping
                    ctx.save();
                    
                    // Clip to node bounds
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
                    // Cover mode - skip drawing widgets
                    return;
                }
            };

            // Override onDrawBackground for blur effect
            let originalOnDrawBackground = node.onDrawBackground;
            
            Object.defineProperty(node, 'onDrawBackground', {
                get: function() {
                    return function(ctx) {
                        const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");
                        
                        if (this.icy_hidden && hideMode === "blur") {
                            // Apply blur in background drawing with clipping
                            const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
                            ctx.save();
                            
                            // Clip to node bounds
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
                set: function(val) {
                    originalOnDrawBackground = val;
                }
            });

            // Override onDrawForeground
            let originalOnDrawForeground = node.onDrawForeground;

            Object.defineProperty(node, 'onDrawForeground', {
                get: function() {
                    return function(ctx) {
                        const hideMode = app.ui.settings.getSettingValue("IcyHider.HideMode", "cover");
                        
                        if (this.icy_hidden && hideMode === "blur") {
                            // In blur mode, still draw foreground but with blur and clipping
                            const blurAmount = app.ui.settings.getSettingValue("IcyHider.BlurAmount", 20);
                            ctx.save();
                            
                            // Clip to node bounds
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
                            // Cover mode - draw original content first
                            if (originalOnDrawForeground) {
                                originalOnDrawForeground.apply(this, arguments);
                            }
                            
                            // Then draw cover on top
                            ctx.save();
                            const titleHeight = 30;
                            
                            // Get settings or use defaults
                            const gradStart = "#" + (app.ui.settings.getSettingValue("IcyHider.GradientStart", "1E3C72") || "1E3C72");
                            const gradEnd = "#" + (app.ui.settings.getSettingValue("IcyHider.GradientEnd", "2A5298") || "2A5298");
                            const borderColor = "#" + (app.ui.settings.getSettingValue("IcyHider.BorderColor", "A5DEE5") || "A5DEE5");
                            const icon = app.ui.settings.getSettingValue("IcyHider.Icon", "❄️") || "❄️";
                            const text = app.ui.settings.getSettingValue("IcyHider.Text", "FROZEN") || "FROZEN";
                            const textColor = "#" + (app.ui.settings.getSettingValue("IcyHider.TextColor", "E0F7FA") || "E0F7FA");
                            
                            // Icy Gradient Background
                            const grad = ctx.createLinearGradient(0, titleHeight, 0, this.size[1]);
                            grad.addColorStop(0, gradStart);
                            grad.addColorStop(1, gradEnd);
                            ctx.fillStyle = grad;
                            
                            // Draw rounded rectangle for the cover
                            ctx.beginPath();
                            if (ctx.roundRect) {
                                ctx.roundRect(0, titleHeight, this.size[0], this.size[1] - titleHeight, [0, 0, 10, 10]);
                            } else {
                                ctx.rect(0, titleHeight, this.size[0], this.size[1] - titleHeight);
                            }
                            ctx.fill();

                            // Add a frost border
                            ctx.strokeStyle = borderColor;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            
                            // Text and Icon
                            const centerX = this.size[0]/2;
                            const centerY = (this.size[1] + titleHeight)/2;

                            ctx.fillStyle = textColor;
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            
                            // Snowflake icon
                            ctx.font = "32px Arial";
                            ctx.fillText(icon, centerX, centerY - 15);
                            
                            // Text
                            ctx.font = "bold 14px Arial";
                            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                            ctx.shadowBlur = 4;
                            ctx.fillText(text, centerX, centerY + 15);
                            
                            ctx.restore();
                        } else {
                            // Not hidden, draw normally
                            if (originalOnDrawForeground) {
                                originalOnDrawForeground.apply(this, arguments);
                            }
                        }
                    };
                },
                set: function(val) {
                    originalOnDrawForeground = val;
                }
            });
        }
	}
});
