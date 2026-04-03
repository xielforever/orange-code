from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import math

def draw_structural_resonance(c):
    width, height = A4
    
    # Base background
    c.setFillColor(colors.HexColor("#F8F9FA"))
    c.rect(0, 0, width, height, fill=True, stroke=False)
    
    # Margin and grid definition
    margin = 40
    content_width = width - 2 * margin
    content_height = height - 2 * margin
    
    # Title
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(colors.HexColor("#212529"))
    c.drawString(margin, height - margin - 30, "ORANGE CODE")
    
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor("#6C757D"))
    c.drawString(margin, height - margin - 55, "ARCHITECTURE & EXTENSION BLUEPRINT")
    
    # A central geometric motif representing the architecture
    center_x = width / 2
    center_y = height / 2 + 50
    radius = 180
    
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.HexColor("#DEE2E6"))
    
    # Concentric circles and grid
    for i in range(5):
        c.circle(center_x, center_y, radius - i * 30)
    
    for i in range(12):
        angle = i * (math.pi / 6)
        x2 = center_x + radius * math.cos(angle)
        y2 = center_y + radius * math.sin(angle)
        c.line(center_x, center_y, x2, y2)
        
    # The 'Rust' Core - Solid inner structure
    c.setFillColor(colors.HexColor("#212529"))
    c.circle(center_x, center_y, 45, fill=True, stroke=False)
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.drawCentredString(center_x, center_y - 3, "RUST CORE")
    
    # Outer 'Python' Prototype Ring
    c.setLineWidth(2)
    c.setStrokeColor(colors.HexColor("#FD7E14")) # The 'Orange' accent
    c.circle(center_x, center_y, 120, fill=False, stroke=True)
    
    # Nodes on the outer ring (Extensions)
    extension_points = [
        (center_x + 120 * math.cos(math.pi/4), center_y + 120 * math.sin(math.pi/4), "PLUGINS"),
        (center_x + 120 * math.cos(3*math.pi/4), center_y + 120 * math.sin(3*math.pi/4), "TOOLS"),
        (center_x + 120 * math.cos(5*math.pi/4), center_y + 120 * math.sin(5*math.pi/4), "PROVIDERS"),
        (center_x + 120 * math.cos(7*math.pi/4), center_y + 120 * math.sin(7*math.pi/4), "COMMANDS")
    ]
    
    for x, y, label in extension_points:
        c.setFillColor(colors.HexColor("#FD7E14"))
        c.circle(x, y, 6, fill=True, stroke=False)
        c.setFillColor(colors.HexColor("#212529"))
        c.setFont("Helvetica-Bold", 8)
        if x > center_x:
            c.drawString(x + 12, y - 3, label)
        else:
            c.drawRightString(x - 12, y - 3, label)
            
    # Connecting lines from core to extensions
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.HexColor("#FD7E14"))
    for x, y, _ in extension_points:
        c.line(center_x + 45 * (x - center_x) / 120, center_y + 45 * (y - center_y) / 120, x, y)

    # Minimalist text blocks for guidance
    text_y_start = margin + 180
    
    c.setFillColor(colors.HexColor("#212529"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, text_y_start, "EXTENSION VECTORS")
    
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#495057"))
    
    text_y = text_y_start - 20
    c.drawString(margin, text_y, "I. PROVIDER INTEGRATION")
    c.drawString(margin, text_y - 12, "   Target: rust/crates/api/src/providers/")
    c.drawString(margin, text_y - 24, "   Action: Implement request constructor and SSE parser.")
    
    text_y -= 50
    c.drawString(margin, text_y, "II. BUILT-IN TOOLS")
    c.drawString(margin, text_y - 12, "   Target: rust/crates/tools/src/lib.rs")
    c.drawString(margin, text_y - 24, "   Action: Register JSON Schema, implement logic in runtime.")
    
    text_y -= 50
    c.drawString(margin, text_y, "III. SLASH COMMANDS")
    c.drawString(margin, text_y - 12, "   Target: rust/crates/commands/src/lib.rs")
    c.drawString(margin, text_y - 24, "   Action: Add to SlashCommand enum, implement handler.")
    
    text_y -= 50
    c.drawString(margin, text_y, "IV. PLUGIN HOOKS")
    c.drawString(margin, text_y - 12, "   Target: rust/crates/plugins/ & conversation.rs")
    c.drawString(margin, text_y - 24, "   Action: Explicitly trigger PreToolUse/PostToolUse hooks.")
    
    # Bottom subtle branding
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#ADB5BD"))
    c.drawCentredString(width/2, margin, "STRUCTURAL RESONANCE // SYSTEM SCHEMATIC // VERSION 0.1.0")

def create_pdf(filename):
    c = canvas.Canvas(filename, pagesize=A4)
    draw_structural_resonance(c)
    c.showPage()
    c.save()

if __name__ == "__main__":
    create_pdf("/workspace/orange_code_architecture.pdf")
