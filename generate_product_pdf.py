from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import math

def draw_citrus_constructivism(c):
    width, height = A4
    
    # Obsidian black background for absolute contrast and depth
    c.setFillColor(colors.HexColor("#0B0B0C"))
    c.rect(0, 0, width, height, fill=True, stroke=False)
    
    # Margin and layout definition
    margin = 50
    content_width = width - 2 * margin
    content_height = height - 2 * margin
    
    # ---------------------------------------------------------
    # GRID ARCHITECTURE
    # ---------------------------------------------------------
    c.setLineWidth(0.1)
    c.setStrokeColor(colors.HexColor("#1A1A1D"))
    
    # Subtle vertical grid lines
    for i in range(1, int(width/20)):
        x = i * 20
        c.line(x, 0, x, height)
        
    # Subtle horizontal grid lines
    for i in range(1, int(height/20)):
        y = i * 20
        c.line(0, y, width, y)
        
    # ---------------------------------------------------------
    # THE CORE (The "Orange")
    # ---------------------------------------------------------
    center_x = width / 2
    center_y = height / 2 + 60
    core_radius = 65
    
    # Luminous Orange Core
    c.setFillColor(colors.HexColor("#FF6B00"))
    c.circle(center_x, center_y, core_radius, fill=True, stroke=False)
    
    # Inner geometric segments (Citrus slices / Code modules)
    c.setStrokeColor(colors.HexColor("#0B0B0C"))
    c.setLineWidth(1.5)
    num_segments = 8
    for i in range(num_segments):
        angle = i * (2 * math.pi / num_segments)
        x2 = center_x + (core_radius - 5) * math.cos(angle)
        y2 = center_y + (core_radius - 5) * math.sin(angle)
        c.line(center_x, center_y, x2, y2)
        
    # Central void (The seed/kernel)
    c.setFillColor(colors.HexColor("#0B0B0C"))
    c.circle(center_x, center_y, 15, fill=True, stroke=False)
    
    c.setFillColor(colors.HexColor("#FF6B00"))
    c.circle(center_x, center_y, 4, fill=True, stroke=False)
    
    # ---------------------------------------------------------
    # ORBITAL STRUCTURES (CLI Architecture)
    # ---------------------------------------------------------
    c.setLineWidth(0.3)
    c.setStrokeColor(colors.HexColor("#495057"))
    
    # Concentric orbital rings
    orbits = [120, 180, 240]
    for r in orbits:
        c.circle(center_x, center_y, r, fill=False, stroke=True)
        
    # Nodes on the orbits
    nodes = [
        (orbits[0], math.pi/4, "RST_RNTM"),
        (orbits[0], 3*math.pi/4, "PY_PRTOTYP"),
        (orbits[0], 5*math.pi/4, "MCP_SYST"),
        (orbits[0], 7*math.pi/4, "LSP_CLNT"),
        
        (orbits[1], 0, "PLGN_01"),
        (orbits[1], math.pi/2, "PLGN_02"),
        (orbits[1], math.pi, "PLGN_03"),
        (orbits[1], 3*math.pi/2, "PLGN_04"),
        
        (orbits[2], math.pi/6, "EXT_API"),
        (orbits[2], 5*math.pi/6, "LOCAL_ENV"),
        (orbits[2], 7*math.pi/6, "VCS_SYNC"),
        (orbits[2], 11*math.pi/6, "SYS_IO")
    ]
    
    for r, angle, label in nodes:
        nx = center_x + r * math.cos(angle)
        ny = center_y + r * math.sin(angle)
        
        # Node marker
        c.setFillColor(colors.HexColor("#E9ECEF"))
        c.circle(nx, ny, 3, fill=True, stroke=False)
        
        # Connecting lines to previous orbit or core
        if r == orbits[0]:
            c.setStrokeColor(colors.HexColor("#343A40"))
            c.line(center_x + core_radius * math.cos(angle), center_y + core_radius * math.sin(angle), nx, ny)
            
        # Clinical labeling
        c.setFont("Helvetica", 5)
        c.setFillColor(colors.HexColor("#868E96"))
        
        # Align labels based on quadrant
        if nx > center_x:
            c.drawString(nx + 8, ny - 2, label)
        else:
            c.drawRightString(nx - 8, ny - 2, label)
            
    # ---------------------------------------------------------
    # DATA STREAMS / EXECUTION PATHS
    # ---------------------------------------------------------
    c.setLineWidth(1)
    c.setStrokeColor(colors.HexColor("#FF6B00"))
    
    # Highlighted active execution paths
    active_paths = [
        (math.pi/4, orbits[0]),
        (3*math.pi/2, orbits[1]),
        (11*math.pi/6, orbits[2])
    ]
    
    for angle, target_r in active_paths:
        c.line(
            center_x + core_radius * math.cos(angle),
            center_y + core_radius * math.sin(angle),
            center_x + target_r * math.cos(angle),
            center_y + target_r * math.sin(angle)
        )
        # Highlight node
        c.setFillColor(colors.HexColor("#FF6B00"))
        c.circle(center_x + target_r * math.cos(angle), center_y + target_r * math.sin(angle), 4, fill=True, stroke=False)

    # ---------------------------------------------------------
    # TYPOGRAPHY & LAYOUT (Clinical Notation)
    # ---------------------------------------------------------
    
    # Main Header
    c.setFont("Helvetica-Bold", 42)
    c.setFillColor(colors.HexColor("#F8F9FA"))
    c.drawString(margin, height - margin - 40, "ORANGE CODE")
    
    # Sub Header
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#FF6B00"))
    c.drawString(margin, height - margin - 60, "CLI ARCHITECTURE // V.1.0.0")
    
    # Lower Data Block
    text_y_start = margin + 120
    
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#E9ECEF"))
    c.drawString(margin, text_y_start, "SYSTEM PARAMETERS")
    
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#868E96"))
    
    params = [
        "CORE_LANG: RUST_STABLE",
        "EXEC_MODE: LOCAL_AGENT",
        "PROTOCOLS: MCP | LSP | SSE",
        "COMPRESSION: TOKEN_COMPACT_V1",
        "ORBIT_CAPACITY: MAX_INT"
    ]
    
    for i, param in enumerate(params):
        c.drawString(margin, text_y_start - 15 - (i * 12), param)
        
    # Right side structural block
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#E9ECEF"))
    c.drawRightString(width - margin, text_y_start, "STRUCTURAL INTEGRITY")
    
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#868E96"))
    
    integrity = [
        "MODULAR_PLUGINS: TRUE",
        "SANDBOX_EXEC: TRUE",
        "OAUTH_SYNC: TRUE",
        "TELEMETRY: OPT_IN"
    ]
    
    for i, val in enumerate(integrity):
        c.drawRightString(width - margin, text_y_start - 15 - (i * 12), val)

    # Bottom Indexing
    c.setFont("Helvetica", 5)
    c.setFillColor(colors.HexColor("#495057"))
    c.drawString(margin, margin, "FIG 01. CITRUS CONSTRUCTIVISM")
    c.drawRightString(width - margin, margin, "GENERATED VIA CANVAS-DESIGN // 2026")

def create_pdf(filename):
    c = canvas.Canvas(filename, pagesize=A4)
    draw_citrus_constructivism(c)
    c.showPage()
    c.save()

if __name__ == "__main__":
    create_pdf("/workspace/orange_code_product_design.pdf")
