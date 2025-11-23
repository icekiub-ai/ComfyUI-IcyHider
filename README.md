# ComfyUI-IcyHider

A ComfyUI custom node extension that hides image previews until you hover over the node, helping keep your workflow clean and organized.

## ✨ What's New in v2.0
<img width="2282" height="1117" alt="image" src="https://github.com/user-attachments/assets/9d05c7e7-d716-43c0-be5f-2365a45652f1" />

- **🎛️ Enable/Disable Toggle**: Easily turn the hiding functionality on/off without removing nodes
- **🌫️ Blur Mode**: New blur effect option as an alternative to the cover overlay
- **📊 Adjustable Blur Intensity**: Fine-tune blur amount with a slider (0-50px)
- **⚡ Instant Setting Updates**: Changes apply immediately without page refresh
- **🎨 Enhanced Customization**: More control over your workflow's appearance

## Features

- **Auto-hide on mouse leave**: Images are automatically hidden when your mouse is not hovering over the node
- **Two hiding modes**: Choose between stylish cover overlay or subtle blur effect
- **Customizable cover style**: Fully customizable icy-themed cover with gradient, border, icon, and text
- **Adjustable blur**: Control blur intensity from subtle to completely obscured
- **Easy toggle**: Enable or disable hiding functionality with a single switch
- **Works with multiple node types**: Compatible with Preview Image, Load Image, and Save Image nodes

## Installation

1. Clone this repository into your ComfyUI custom nodes folder:
   ```
   cd ComfyUI/custom_nodes
   git clone https://github.com/icekiub-ai/ComfyUI-IcyHider.git
   ```

2. Restart ComfyUI

## Nodes

### Icy Preview Image
A preview image node that hides the image when not hovering.

### Icy Load Image
A load image node that hides the image preview when not hovering.

### Icy Save Image
A save image node that hides the image preview when not hovering.

## Customization

You can customize the hiding behavior and appearance through ComfyUI Settings:

1. Open ComfyUI Settings
2. Navigate to the **IcyHider** section
3. Customize the following options:

### General Settings
   - **Enable Hiding**: Toggle the hiding functionality on/off
   - **Hide Mode**: Choose between "cover" (overlay) or "blur" effect
   - **Blur Amount**: Adjust blur intensity (0-50px) when using blur mode

### Cover Mode Settings (only apply when Hide Mode is "cover")
   - **Gradient Start Color**: Top color of the gradient background
   - **Gradient End Color**: Bottom color of the gradient background
   - **Border Color**: Color of the border around the cover
   - **Icon**: The emoji or text icon to display (default: ❄️)
   - **Text**: The text to display below the icon (default: FROZEN)
   - **Text Color**: Color of the text and icon

All color settings use a color picker for easy selection.

## Usage

1. Add any of the Icy nodes to your workflow from the **IcyHider** category
2. Connect them like you would use standard Preview/Load/Save Image nodes
3. The image will be hidden behind a stylish cover (or blurred) when you're not hovering over the node
4. Hover over the node to reveal the image
5. Customize the appearance in Settings → IcyHider

## Tips

- Use **blur mode** for a subtle preview effect that still shows composition
- Use **cover mode** for complete privacy or a cleaner workspace
- Disable hiding temporarily when debugging without removing nodes
- Adjust blur amount based on your preference and image sensitivity

## Changelog

### v2.0.0
- Added enable/disable toggle for hiding functionality
- Added blur mode as alternative to cover overlay
- Added adjustable blur intensity slider
- Improved settings with instant updates
- Added canvas clipping to prevent blur bleeding

### v1.0.0
- Initial release with cover mode
- Customizable gradient, border, icon, and text
- Preview, Load, and Save image node support

## License

MIT License

## Credits

Created for ComfyUI

