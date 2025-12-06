# ComfyUI-IcyHider ❄️

A ComfyUI custom node extension that hides image previews until you hover over or select nodes, helping keep your workflow clean, organized, and private.

## ✨ What's New in v3.1
<img width="2211" height="1222" alt="image" src="https://github.com/user-attachments/assets/42a7f876-1690-4530-8dff-bf0913728c83" />

- **🌊 Avalanche Mode**: Hide ALL nodes in your workflow (not just Icy nodes) - reveal by selecting!
- **🎬 Animated Media Detection**: Automatically covers videos, GIFs, APNGs, AVIFs, and WebPs
- **🔌 Extended Node Support**: Now wraps WAS Node Suite and WAS Extras nodes automatically
- **⚡ Performance Optimized**: Settings caching and debounced DOM updates for smooth operation
- **✨ Smooth Transitions**: CSS animations for elegant show/hide effects
- **🔄 Dynamic Node Wrapping**: Automatically creates Icy versions of all compatible nodes
- **Keybind toggle**: You can now configure a keybinding (default: Ctrl+H) to quickly enable/disable IcyHider. Configure in ComfyUI Settings → IcyHider → Toggle Key and press the combo to toggle hiding.

## Features

- **Avalanche Mode**: When ON, hides ALL nodes until selected. When OFF, only Icy nodes are hidden (revealed on hover)
- **Two hiding modes**: Choose between stylish cover overlay or subtle blur effect
- **Animated media handling**: Videos and animated images are always covered (never blurred) for privacy
- **Customizable cover style**: Fully customizable icy-themed cover with gradient, border, icon, and text
- **Adjustable blur**: Control blur intensity from subtle to completely obscured
- **Dynamic node wrapping**: Automatically wraps ComfyUI core nodes, WAS Node Suite, and WAS Extras
- **Works with all node types**: Compatible with any node that has image outputs

Shoutout to @RobertAgee for this latest update

## Installation

### Via ComfyUI Manager (Recommended)
1. Open ComfyUI Manager
2. Search for "IcyHider"
3. Click Install

### Manual Installation
1. Clone this repository into your ComfyUI custom nodes folder:
   ```
   cd ComfyUI/custom_nodes
   git clone https://github.com/icekiub-ai/ComfyUI-IcyHider.git
   ```

2. Restart ComfyUI

## Nodes

IcyHider dynamically creates Icy versions of nodes from multiple sources:

### ComfyUI Core Nodes
- **Icy PreviewImage**, **Icy LoadImage**, **Icy SaveImage**, and many more...

### WAS Node Suite (if installed)
- All compatible WAS nodes are automatically wrapped

### WAS Extras (if installed)
- All compatible WAS Extras nodes are automatically wrapped

All wrapped nodes appear in the **IcyHider** category in the node menu.

## Customization

You can customize the hiding behavior and appearance through ComfyUI Settings:

1. Open ComfyUI Settings
2. Navigate to the **IcyHider** section
3. Customize the following options:

### General Settings
- **Hide All Nodes (Avalanche)**: When ON, all nodes are hidden until selected. When OFF, only Icy nodes are hidden (revealed on hover)
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

### With Avalanche Mode ON (Default)
1. All nodes in your workflow are hidden by default
2. **Click/select a node** to reveal its content
3. Content hides again when you deselect the node
4. Great for privacy and clean screenshots!

### With Avalanche Mode OFF
1. Add any Icy nodes to your workflow from the **IcyHider** category
2. Connect them like standard nodes
3. **Hover over a node** to reveal its content
4. Content hides when you move your mouse away

## Tips

- Use **Avalanche Mode** for maximum privacy - hide everything at once!
- Use **blur mode** for a subtle preview effect that still shows composition
- Use **cover mode** for complete privacy or a cleaner workspace
- Animated content (videos, GIFs) is always covered, never blurred, for better privacy
- Changing Avalanche Mode or Hide Mode requires a page reload to take effect

## Changelog

### v3.0.0
- Added Avalanche Mode to hide ALL nodes (not just Icy nodes)
- Added automatic animated media detection (video, GIF, APNG, AVIF, WebP)
- Added dynamic wrapping for WAS Node Suite and WAS Extras
- Added performance optimizations (settings caching, debounced updates)
- Added smooth CSS transitions for show/hide effects
- Improved selection-based reveal in Avalanche mode

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




