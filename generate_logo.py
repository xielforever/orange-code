from PIL import Image, ImageDraw, ImageFont
import math

def draw_syntactic_core_logo(filename):
    # Canvas parameters
    width, height = 1000, 1000
    
    # Colors
    bg_color = (11, 11, 12)        # Obsidian black
    accent_color = (255, 107, 0)   # Luminous, searing orange
    white_color = (248, 249, 250)  # Off-white for text
    grey_color = (134, 142, 150)   # Muted grey for sub-elements
    
    # Create image and drawing context
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = width // 2, (height // 2) - 50
    
    # ---------------------------------------------------------
    # THE GLYPH: "The Orange Core" intersected by "Code/Terminal"
    # ---------------------------------------------------------
    
    # Base Circle (The Organic / The Orange)
    radius = 220
    draw.ellipse(
        [(center_x - radius, center_y - radius), (center_x + radius, center_y + radius)],
        fill=accent_color, outline=None
    )
    
    # The Intersecting Cuts (The Construct / The CLI / Rust precision)
    # We carve out sections of the orange circle using the background color
    # to create a stylized 'O' and terminal prompt '>' or bracket '<'
    
    # Cut 1: The Inner Void (creating a ring)
    inner_radius = 110
    draw.ellipse(
        [(center_x - inner_radius, center_y - inner_radius), (center_x + inner_radius, center_y + inner_radius)],
        fill=bg_color, outline=None
    )
    
    # Cut 2: The Terminal Caret (>) slicing through the ring
    # This forms the right side of the 'O' into a code symbol
    poly_cut = [
        (center_x + 10, center_y - radius - 10),  # Top
        (center_x + radius + 10, center_y),       # Point (right)
        (center_x + 10, center_y + radius + 10),  # Bottom
        (center_x + 10, center_y + inner_radius - 20), # Inner bottom
        (center_x + inner_radius + 40, center_y),      # Inner point
        (center_x + 10, center_y - inner_radius + 20)  # Inner top
    ]
    draw.polygon(poly_cut, fill=bg_color)
    
    # Cut 3: A sharp horizontal slice to represent a cursor line '_'
    cursor_width = 140
    cursor_height = 40
    draw.rectangle(
        [(center_x - cursor_width//2, center_y + inner_radius + 20), 
         (center_x + cursor_width//2, center_y + inner_radius + 20 + cursor_height)],
        fill=bg_color
    )
    
    # Refined Geometry: Adding a precise architectural dot (The "seed")
    dot_radius = 20
    draw.ellipse(
        [(center_x - dot_radius, center_y - dot_radius), 
         (center_x + dot_radius, center_y + dot_radius)],
        fill=accent_color
    )

    # ---------------------------------------------------------
    # TYPOGRAPHY: Minimal, clinical, and perfectly aligned
    # ---------------------------------------------------------
    
    try:
        # Try to load a sans-serif font if available in the environment
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        sub_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        tiny_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except IOError:
        # Fallback to default PIL font (not ideal for museum quality, but safe)
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        tiny_font = ImageFont.load_default()

    # Main Brand Name
    text_main = "ORANGE CODE"
    # Manual centering approximation if getbbox is unavailable
    try:
        bbox = draw.textbbox((0, 0), text_main, font=title_font)
        text_w = bbox[2] - bbox[0]
    except AttributeError:
        text_w = title_font.getsize(text_main)[0] if hasattr(title_font, 'getsize') else len(text_main) * 35
        
    draw.text((center_x - text_w//2, center_y + radius + 80), text_main, fill=white_color, font=title_font)
    
    # Sub-brand / Descriptor
    text_sub = "L O C A L   A G E N T   C L I"
    try:
        bbox_sub = draw.textbbox((0, 0), text_sub, font=sub_font)
        sub_w = bbox_sub[2] - bbox_sub[0]
    except AttributeError:
        sub_w = sub_font.getsize(text_sub)[0] if hasattr(sub_font, 'getsize') else len(text_sub) * 14

    draw.text((center_x - sub_w//2, center_y + radius + 160), text_sub, fill=accent_color, font=sub_font)

    # Architectural framing markers (corners)
    m = 60
    l = 30
    draw.line([(m, m), (m+l, m)], fill=grey_color, width=2)
    draw.line([(m, m), (m, m+l)], fill=grey_color, width=2)
    
    draw.line([(width-m, m), (width-m-l, m)], fill=grey_color, width=2)
    draw.line([(width-m, m), (width-m, m+l)], fill=grey_color, width=2)
    
    draw.line([(m, height-m), (m+l, height-m)], fill=grey_color, width=2)
    draw.line([(m, height-m), (m, height-m-l)], fill=grey_color, width=2)
    
    draw.line([(width-m, height-m), (width-m-l, height-m)], fill=grey_color, width=2)
    draw.line([(width-m, height-m), (width-m, height-m-l)], fill=grey_color, width=2)
    
    # Micro-text labels (Version tag removed)
    pass

    # Save output
    img.save(filename, format="PNG")

if __name__ == "__main__":
    # Output to the structured assets folder
    draw_syntactic_core_logo("/workspace/assets/logos/orange_code_logo.png")
