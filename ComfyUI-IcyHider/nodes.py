import nodes

class IcyPreviewImage(nodes.PreviewImage):
    CATEGORY = "IcyHider"

class IcyLoadImage(nodes.LoadImage):
    CATEGORY = "IcyHider"

class IcySaveImage(nodes.SaveImage):
    CATEGORY = "IcyHider"

NODE_CLASS_MAPPINGS = {
    "IcyPreviewImage": IcyPreviewImage,
    "IcyLoadImage": IcyLoadImage,
    "IcySaveImage": IcySaveImage,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "IcyPreviewImage": "Icy Preview Image",
    "IcyLoadImage": "Icy Load Image",
    "IcySaveImage": "Icy Save Image",
}
