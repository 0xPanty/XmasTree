from PIL import Image, ImageDraw
import os

def smart_crop_and_resize(image_path, output_path, target_size=(400, 500)):
    """
    Smart crop stamp: remove background and resize to fill frame
    
    Args:
        image_path: Input stamp image
        output_path: Output processed image
        target_size: Target size (width, height) - default 400x500 for 4:5 ratio
    """
    img = Image.open(image_path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    width, height = img.size
    pixels = img.load()
    
    print(f"\nProcessing: {os.path.basename(image_path)}")
    print(f"  Original size: {width}x{height}")
    
    # Step 1: Find content bounding box (remove light backgrounds)
    # Try multiple thresholds to find the best crop
    best_crop = None
    
    for threshold in [250, 240, 230, 220, 210]:
        left, top, right, bottom = width, height, 0, 0
        
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                # Check if pixel is part of content (darker than threshold)
                if r < threshold or g < threshold or b < threshold:
                    left = min(left, x)
                    top = min(top, y)
                    right = max(right, x)
                    bottom = max(bottom, y)
        
        # Check if we found reasonable content
        if left < right and top < bottom:
            content_width = right - left
            content_height = bottom - top
            area_ratio = (content_width * content_height) / (width * height)
            
            # Use threshold that captures 40-95% of image (good content detection)
            if 0.4 <= area_ratio <= 0.95:
                best_crop = (left, top, right, bottom)
                print(f"  Found content with threshold {threshold}: {content_width}x{content_height} ({area_ratio*100:.1f}%)")
                break
    
    if not best_crop:
        # Use whole image if no good crop found
        best_crop = (0, 0, width, height)
        print(f"  No crop needed - using full image")
    
    # Step 2: Crop to content
    left, top, right, bottom = best_crop
    cropped = img.crop((left, top, right, bottom))
    
    # Step 3: Resize to target while maintaining aspect ratio (crop to fill)
    crop_width = right - left
    crop_height = bottom - top
    target_width, target_height = target_size
    
    # Calculate scaling to fill target (may crop edges)
    scale_w = target_width / crop_width
    scale_h = target_height / crop_height
    scale = max(scale_w, scale_h)  # Use larger scale to fill
    
    # Resize
    new_w = int(crop_width * scale)
    new_h = int(crop_height * scale)
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Step 4: Center crop to exact target size
    left = (new_w - target_width) // 2
    top = (new_h - target_height) // 2
    final = resized.crop((left, top, left + target_width, top + target_height))
    
    # Save
    final.save(output_path, 'PNG', quality=95)
    print(f"  Final size: {target_width}x{target_height}")
    print(f"  Saved: {output_path}")

def process_all_stamps():
    """Process all stamp files"""
    stamp_folder = 'stamp'
    backup_folder = 'stamp/backup_original'
    
    # Create backup if not exists
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
    
    stamps = ['neynar.png', 'farcaster.png', 'warplet.png', 'based.png']
    
    print("=" * 70)
    print("SMART STAMP PROCESSING")
    print("=" * 70)
    print("1. Remove light background")
    print("2. Crop to content")
    print("3. Resize to 400x500 (4:5 postcard ratio)")
    print("4. Fill frame completely")
    print("=" * 70)
    
    for stamp in stamps:
        input_path = os.path.join(stamp_folder, stamp)
        backup_path = os.path.join(backup_folder, stamp)
        
        if not os.path.exists(input_path):
            print(f"\n[X] Not found: {stamp}")
            continue
        
        # Backup original if not already backed up
        if not os.path.exists(backup_path):
            img = Image.open(input_path)
            img.save(backup_path)
            print(f"\n[BACKUP] {stamp} -> backup_original/")
        
        # Process
        smart_crop_and_resize(input_path, input_path, target_size=(400, 500))
    
    print("\n" + "=" * 70)
    print("[DONE] All stamps processed!")
    print(f"Originals saved to: {backup_folder}")
    print("All stamps are now 400x500 pixels (4:5 ratio)")
    print("=" * 70)

if __name__ == "__main__":
    process_all_stamps()
