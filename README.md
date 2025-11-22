# ComfyUI-IcyHider

A ComfyUI custom node extension that hides image previews until you hover over the node, helping keep your workflow clean and organized.

## Features

- **Auto-hide on mouse leave**: Images are automatically hidden when your mouse is not hovering over the node
- **Customizable cover style**: Fully customizable icy-themed cover with gradient, border, icon, and text
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

You can customize the cover appearance through ComfyUI Settings:

1. Open ComfyUI Settings
2. Navigate to the **IcyHider** section
3. Customize the following options:
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
3. The image will be hidden behind a stylish cover when you're not hovering over the node
4. Hover over the node to reveal the image

## License

MIT License

## Credits

Created for ComfyUI
