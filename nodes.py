import inspect
import nodes  # ComfyUI's core nodes module

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

def create_icy_wrappers(source_module, module_name=""):
    """
    Create Icy versions of all node classes from a given module.
    Returns count of successfully wrapped nodes.
    """
    wrapped_count = 0
    prefix = f"[{module_name}] " if module_name else ""
    
    for name, obj in inspect.getmembers(source_module, inspect.isclass):
        # Skip private/internal classes
        if name.startswith("_"):
            continue

        # Only wrap real, concrete node classes:
        # - Must have INPUT_TYPES (so it's a node)
        # - Must have RETURN_TYPES (so server.node_info won't crash)
        if not hasattr(obj, "INPUT_TYPES") or not hasattr(obj, "RETURN_TYPES"):
            continue

        icy_class_name = f"Icy{name}"

        try:
            icy_class = type(icy_class_name, (obj,), {"CATEGORY": f"IcyHider {module_name}"})
            NODE_CLASS_MAPPINGS[icy_class_name] = icy_class
            NODE_DISPLAY_NAME_MAPPINGS[icy_class_name] = f"Icy {name}"
            wrapped_count += 1
        except Exception as e:
            # Don't break ComfyUI if some exotic class misbehaves
            print(f"[ComfyUI-IcyHider] {prefix}Skipping {name}: {e}")
            continue
    
    return wrapped_count

# Wrap ComfyUI core nodes
core_count = create_icy_wrappers(nodes, "Comfy Core")
print(f"[ComfyUI-IcyHider] Wrapped {core_count} core nodes")

# Try to wrap WAS Node Suite (single file)
try:
    import sys
    import os
    
    # Add WAS path to sys.path if needed
    was_path = os.path.join(os.path.dirname(__file__), "..", "was-ns")
    if os.path.exists(was_path) and was_path not in sys.path:
        sys.path.insert(0, was_path)
    
    import WAS_Node_Suite
    was_count = create_icy_wrappers(WAS_Node_Suite, "WAS Node Suite")
    print(f"[ComfyUI-IcyHider] Wrapped {was_count} WAS Node Suite nodes")
except ImportError:
    print("[ComfyUI-IcyHider] WAS Node Suite not found, skipping")
except Exception as e:
    print(f"[ComfyUI-IcyHider] Error loading WAS Node Suite: {e}")

# Try to wrap WAS Extras (multiple files in nodes folder)
try:
    import sys
    import os
    import importlib.util
    
    # Path to WAS_Extras/nodes directory
    was_extras_path = os.path.join(os.path.dirname(__file__), "..", "was-extras", "nodes")
    
    if os.path.exists(was_extras_path):
        total_extras_count = 0
        
        # Iterate through all .py files in the nodes directory
        for filename in os.listdir(was_extras_path):
            if not filename.endswith(".py") or filename.startswith("_"):
                continue
            
            module_name = filename[:-3]  # Remove .py extension
            file_path = os.path.join(was_extras_path, filename)
            
            try:
                # Dynamically import the module
                spec = importlib.util.spec_from_file_location(module_name, file_path)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    
                    # Wrap nodes from this module
                    count = create_icy_wrappers(module, f"was-extras/{module_name}")
                    total_extras_count += count
            except Exception as e:
                print(f"[ComfyUI-IcyHider] Error loading was-extras/{module_name}: {e}")
                continue
        
        if total_extras_count > 0:
            print(f"[ComfyUI-IcyHider] Wrapped {total_extras_count} WAS Extras nodes")
    else:
        print("[ComfyUI-IcyHider] WAS Extras not found, skipping")
        
except Exception as e:
    print(f"[ComfyUI-IcyHider] Error loading WAS Extras: {e}")

print(f"[ComfyUI-IcyHider] Total nodes wrapped: {len(NODE_CLASS_MAPPINGS)}")
