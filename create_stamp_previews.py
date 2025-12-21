#!/usr/bin/env python3
"""
Create preview versions of stamps with dark green background
- Original: transparent PNG (for postcard canvas)
- Preview: dark green background PNG (for UI display)
"""
from PIL import Image
import os

# UI background color (dark green to match container)
PREVIEW_BG_COLOR = (0, 26, 16)  # #001a10

def create_preview_stamp(input_path, output_path):
    """Create preview version with dark green background"""
    # Open transparent PNG
    img = Image.open(input_path).convert("RGBA")
    
    # Create new image with dark green background
    preview = Image.new("RGBA", img.size, PREVIEW_BG_COLOR + (255,))
    
    # Composite original stamp on dark green background
    preview = Image.alpha_composite(preview, img)
    
    # Save as PNG (keep RGBA for consistency)
    preview.save(output_path, "PNG")
    print(f"✅ Created preview: {os.path.basename(output_path)}")

def main():
    stamp_folder = "stamp"
    
    if not os.path.exists(stamp_folder):
        print(f"❌ Folder '{stamp_folder}' not found!")
        return
    
    # Process all stamp files
    stamps = ["neynar.png", "farcaster.png", "warplet.png", "based.png"]
    
    for stamp_file in stamps:
        input_path = os.path.join(stamp_folder, stamp_file)
        
        if not os.path.exists(input_path):
            print(f"⚠️ Skipped: {stamp_file} (not found)")
            continue
        
        # Create preview version with -preview suffix
        name, ext = os.path.splitext(stamp_file)
        preview_file = f"{name}-preview{ext}"
        output_path = os.path.join(stamp_folder, preview_file)
        
        # Generate preview
        create_preview_stamp(input_path, output_path)
    
    print("\n✅ All preview stamps created!")
    print(f"🎨 Preview background: #{PREVIEW_BG_COLOR[0]:02x}{PREVIEW_BG_COLOR[1]:02x}{PREVIEW_BG_COLOR[2]:02x}")
    print("\n📦 Files:")
    print("   - Original stamps (transparent): for postcard canvas")
    print("   - Preview stamps (-preview): for UI display")

if __name__ == "__main__":
    main()
