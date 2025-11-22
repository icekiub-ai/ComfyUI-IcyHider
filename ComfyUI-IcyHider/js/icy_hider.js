import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "Comfy.IcyHider",
    settings: [
        {
            id: "IcyHider.GradientStart",
            name: "Gradient Start Color",
            type: "color",
            defaultValue: "1E3C72",
            tooltip: "The starting color of the gradient background."
        },
        {
            id: "IcyHider.GradientEnd",
            name: "Gradient End Color",
            type: "color",
            defaultValue: "2A5298",
            tooltip: "The ending color of the gradient background."
        },
        {
            id: "IcyHider.BorderColor",
            name: "Border Color",
            type: "color",
            defaultValue: "A5DEE5",
            tooltip: "The color of the border around the cover."
        },
        {
            id: "IcyHider.Icon",
            name: "Icon",
            type: "text",
            defaultValue: "❄️",
            tooltip: "The emoji or text icon to display."
        },
        {
            id: "IcyHider.Text",
            name: "Text",
            type: "text",
            defaultValue: "FROZEN",
            tooltip: "The text to display below the icon."
        },
        {
            id: "IcyHider.TextColor",
            name: "Text Color",
            type: "color",
            defaultValue: "E0F7FA",
            tooltip: "The color of the text and icon."
        }
    ],
	async nodeCreated(node, app) {
		if (node.comfyClass === "IcyPreviewImage" || node.comfyClass === "IcyLoadImage" || node.comfyClass === "IcySaveImage") {
            node.icy_hidden = true;

            // Override onMouseEnter
            const origOnMouseEnter = node.onMouseEnter;
            node.onMouseEnter = function(e) {
                this.icy_hidden = false;
                this.setDirtyCanvas(true, true);
                if (origOnMouseEnter) origOnMouseEnter.apply(this, arguments);
            }

            // Override onMouseLeave
            const origOnMouseLeave = node.onMouseLeave;
            node.onMouseLeave = function(e) {
                this.icy_hidden = true;
                this.setDirtyCanvas(true, true);
                if (origOnMouseLeave) origOnMouseLeave.apply(this, arguments);
            }

            // Override drawWidgets to hide widgets when hidden
            // This is crucial for LoadImage and any node using widgets for display
            const origDrawWidgets = node.drawWidgets;
            node.drawWidgets = function(ctx, posY) {
                if (this.icy_hidden) {
                    return; // Skip drawing widgets
                }
                if (origDrawWidgets) {
                    origDrawWidgets.apply(this, arguments);
                }
            };

            // Override onDrawForeground
            let originalOnDrawForeground = node.onDrawForeground;

            Object.defineProperty(node, 'onDrawForeground', {
                get: function() {
                    return function(ctx) {
                        if (originalOnDrawForeground) {
                            originalOnDrawForeground.apply(this, arguments);
                        }
                        if (this.icy_hidden) {
                            ctx.save();
                            // Draw a cover over the node content
                            // We leave the title bar visible (approx 30px)
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
