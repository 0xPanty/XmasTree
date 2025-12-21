from PIL import Image, ImageChops
import os

def auto_crop(image_path, output_path, threshold=240):
    """
    Auto-crop image by removing white/light borders
    
    Args:
        image_path: Input image path
        output_path: Output image path
        threshold: RGB threshold for considering a pixel as "background" (default: 240)
                  Pixels with all RGB values > threshold will be considered background
    """
    img = Image.open(image_path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Get image data
    width, height = img.size
    pixels = img.load()
    
    # Find bounding box of non-background content
    left, top, right, bottom = width, height, 0, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            # If pixel is not background (darker than threshold)
            if r < threshold or g < threshold or b < threshold:
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    
    # Add small padding
    padding = 10
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(width, right + padding)
    bottom = min(height, bottom + padding)
    
    # Crop the image
    if left < right and top < bottom:
        cropped = img.crop((left, top, right, bottom))
        cropped.save(output_path, 'PNG', quality=95)
        
        old_size = f"{width}x{height}"
        new_size = f"{right-left}x{bottom-top}"
        reduction = ((width * height - (right-left) * (bottom-top)) / (width * height)) * 100
        
        print(f"[OK] {os.path.basename(image_path)}: {old_size} -> {new_size} ({reduction:.1f}% reduced)")
        return True
    else:
        print(f"[WARN] {os.path.basename(image_path)}: Could not find content to crop")
        img.save(output_path, 'PNG', quality=95)
        return False

def process_stamps():
    """Process all stamps with auto-crop"""
    stamp_folder = 'stamp'
    backup_folder = 'stamp/backup_original'
    
    # Create backup folder if not exists
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
    
    stamps = ['neynar.png', 'farcaster.png', 'warplet.png', 'based.png']
    
    print("\nAuto-cropping stamp images...")
    print("=" * 60)
    print("Removing white/light borders and extra space...")
    print("=" * 60)
    
    for stamp in stamps:
        input_path = os.path.join(stamp_folder, stamp)
        backup_path = os.path.join(backup_folder, stamp)
        
        if not os.path.exists(input_path):
            print(f"[X] File not found: {stamp}")
            continue
        
        # Backup original (if not already backed up)
        if not os.path.exists(backup_path):
            img = Image.open(input_path)
            img.save(backup_path)
            print(f"[BACKUP] {stamp} -> {backup_folder}/")
        
        # Auto-crop
        auto_crop(input_path, input_path, threshold=240)
    
    print("=" * 60)
    print("Done! All stamps have been cropped.")
    print(f"Originals backed up to: {backup_folder}")
    print("\nYou can adjust 'threshold' value if needed:")
    print("  - Higher value (250): Remove more (only very white borders)")
    print("  - Lower value (200): Keep more (remove light gray too)")

if __name__ == "__main__":
    process_stamps()
