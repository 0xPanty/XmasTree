from PIL import Image
import os

def remove_transparency(input_path, output_path, bg_color=(245, 235, 220)):
    """
    Remove transparency from PNG and replace with solid background
    
    Args:
        input_path: Path to input PNG file
        output_path: Path to save output file
        bg_color: RGB tuple for background color (default: cream/beige)
    """
    # Open the image
    img = Image.open(input_path)
    
    # Check if image has transparency
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Create a background image with the desired color
        background = Image.new('RGB', img.size, bg_color)
        
        # Convert image to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Paste the original image on the background
        # The alpha channel is used as mask
        background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
        
        # Save the result
        background.save(output_path, 'PNG', quality=95)
        print(f"[OK] Processed: {os.path.basename(input_path)}")
        return True
    else:
        print(f"[WARN] No transparency found in: {os.path.basename(input_path)}")
        # Just copy the file
        img.save(output_path, 'PNG', quality=95)
        return False

def process_stamps():
    """Process all stamp images in the stamp folder"""
    stamp_folder = 'stamp'
    backup_folder = 'stamp/backup'
    
    # Create backup folder
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
        print(f"Created backup folder: {backup_folder}")
    
    stamps = ['neynar.png', 'farcaster.png', 'warplet.png', 'based.png']
    
    print("\nProcessing stamp images...")
    print("=" * 50)
    
    for stamp in stamps:
        input_path = os.path.join(stamp_folder, stamp)
        backup_path = os.path.join(backup_folder, stamp)
        
        if not os.path.exists(input_path):
            print(f"X File not found: {stamp}")
            continue
        
        # Backup original
        img = Image.open(input_path)
        img.save(backup_path)
        print(f"Backed up: {stamp} -> backup/")
        
        # Remove transparency
        remove_transparency(input_path, input_path, bg_color=(245, 235, 220))
    
    print("=" * 50)
    print("All stamps processed!")
    print(f"Original files backed up to: {backup_folder}")

if __name__ == "__main__":
    process_stamps()
