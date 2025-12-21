from PIL import Image
import os

def check_image_info(image_path):
    """Check image properties"""
    img = Image.open(image_path)
    filename = os.path.basename(image_path)
    
    print(f"\n{filename}:")
    print(f"  Mode: {img.mode}")
    print(f"  Size: {img.size}")
    print(f"  Format: {img.format}")
    
    if img.mode == 'RGBA':
        # Check if there's any actual transparency
        alpha = img.split()[3]
        alpha_data = list(alpha.getdata())
        min_alpha = min(alpha_data)
        max_alpha = max(alpha_data)
        print(f"  Alpha range: {min_alpha} - {max_alpha}")
        
        # Count transparent pixels
        transparent_pixels = sum(1 for a in alpha_data if a < 255)
        total_pixels = len(alpha_data)
        transparency_percent = (transparent_pixels / total_pixels) * 100
        print(f"  Transparency: {transparency_percent:.2f}% ({transparent_pixels}/{total_pixels} pixels)")
        
        if transparent_pixels > 0:
            return True, transparency_percent
        else:
            print("  [No actual transparency - all alpha = 255]")
            return False, 0
    elif img.mode == 'P' and 'transparency' in img.info:
        print(f"  Has palette transparency")
        return True, 0
    else:
        print(f"  [No alpha channel]")
        return False, 0

def main():
    stamp_folder = 'stamp'
    stamps = ['neynar.png', 'farcaster.png', 'warplet.png', 'based.png']
    
    print("=" * 60)
    print("STAMP IMAGE ANALYSIS")
    print("=" * 60)
    
    for stamp in stamps:
        path = os.path.join(stamp_folder, stamp)
        if os.path.exists(path):
            has_trans, percent = check_image_info(path)
        else:
            print(f"\n{stamp}: NOT FOUND")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
