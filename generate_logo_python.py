from PIL import Image, ImageDraw, ImageFont
import math

def draw_syntactic_core_logo_python(filename):
    # Canvas parameters
    width, height = 1000, 1000
    
    # Colors
    bg_color = (11, 11, 12)        # Obsidian black
    
    # Core color changes to reflect Python prototype identity
    # While maintaining the Orange brand, we introduce the classic Python Yellow/Blue as a subtle gradient or dual tone
    # Here we use the classic Python Blue for the outer shell to represent the Python wrapper
    # and keep the Orange core inside to show it's still Orange Code
    python_blue = (55, 118, 171)   
    python_yellow = (255, 211, 67)
    orange_brand = (255, 107, 0)
    
    white_color = (248, 249, 250)  # Off-white for text
    grey_color = (134, 142, 150)   # Muted grey for sub-elements
    
    # Create image and drawing context
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = width // 2, (height // 2) - 50
    
    # ---------------------------------------------------------
    # THE GLYPH: The Python Prototype Variation
    # ---------------------------------------------------------
    
    # Base Circle (The Outer Python Shell)
    radius = 220
    
    # We draw two interlocking semi-circles to hint at the Python snake logo
    # Top snake body (Blue)
    draw.pieslice(
        [(center_x - radius, center_y - radius), (center_x + radius, center_y + radius)],
        180, 360, fill=python_blue, outline=None
    )
    # Bottom snake body (Yellow)
    draw.pieslice(
        [(center_x - radius, center_y - radius), (center_x + radius, center_y + radius)],
        0, 180, fill=python_yellow, outline=None
    )
    
    # Cut 1: The Inner Void
    inner_radius = 140
    draw.ellipse(
        [(center_x - inner_radius, center_y - inner_radius), (center_x + inner_radius, center_y + inner_radius)],
        fill=bg_color, outline=None
    )
    
    # The Inner Orange Seed (The brand identity)
    seed_radius = 70
    draw.ellipse(
        [(center_x - seed_radius, center_y - seed_radius), (center_x + seed_radius, center_y + seed_radius)],
        fill=orange_brand, outline=None
    )
    
    # Cut 2: Python 'Eyes' or structural dots
    eye_radius = 15
    # Top eye (in the blue segment)
    draw.ellipse(
        [(center_x - 120 - eye_radius, center_y - 120 - eye_radius), 
         (center_x - 120 + eye_radius, center_y - 120 + eye_radius)],
        fill=bg_color
    )
    # Bottom eye (in the yellow segment)
    draw.ellipse(
        [(center_x + 120 - eye_radius, center_y + 120 - eye_radius), 
         (center_x + 120 + eye_radius, center_y + 120 + eye_radius)],
        fill=bg_color
    )

    # Cut 3: Terminal cursor intersecting the inner Orange Seed
    cursor_width = 100
    cursor_height = 25
    draw.rectangle(
        [(center_x - cursor_width//2, center_y + seed_radius - 20), 
         (center_x + cursor_width//2, center_y + seed_radius - 20 + cursor_height)],
        fill=bg_color
    )

    # ---------------------------------------------------------
    # TYPOGRAPHY: Minimal, clinical, and perfectly aligned
    # ---------------------------------------------------------
    
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        sub_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        tiny_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except IOError:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        tiny_font = ImageFont.load_default()

    # Main Brand Name
    text_main = "ORANGE CODE"
    try:
        bbox = draw.textbbox((0, 0), text_main, font=title_font)
        text_w = bbox[2] - bbox[0]
    except AttributeError:
        text_w = title_font.getsize(text_main)[0] if hasattr(title_font, 'getsize') else len(text_main) * 35
        
    draw.text((center_x - text_w//2, center_y + radius + 80), text_main, fill=white_color, font=title_font)
    
    # Sub-brand / Descriptor
    text_sub = "P Y T H O N   P R O T O T Y P E"
    try:
        bbox_sub = draw.textbbox((0, 0), text_sub, font=sub_font)
        sub_w = bbox_sub[2] - bbox_sub[0]
    except AttributeError:
        sub_w = sub_font.getsize(text_sub)[0] if hasattr(sub_font, 'getsize') else len(text_sub) * 14

    draw.text((center_x - sub_w//2, center_y + radius + 160), text_sub, fill=python_blue, font=sub_font)

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
    
    # Micro-text labels
    draw.text((m + 10, m + 10), "V.0.x.x_LEGACY", fill=grey_color, font=tiny_font)
    
    text_right = "PY_SRC"
    try:
        bbox_tr = draw.textbbox((0, 0), text_right, font=tiny_font)
        tr_w = bbox_tr[2] - bbox_tr[0]
    except AttributeError:
        tr_w = tiny_font.getsize(text_right)[0] if hasattr(tiny_font, 'getsize') else len(text_right) * 8
        
    draw.text((width - m - 10 - tr_w, m + 10), text_right, fill=grey_color, font=tiny_font)

    # Save output
    img.save(filename, format="PNG")

if __name__ == "__main__":
    draw_syntactic_core_logo_python("/workspace/orange_code_logo_python.png")
