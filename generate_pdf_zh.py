from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math
import os

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
    
    # Check if a CJK font is available, if not fallback to Helvetica
    # We will try to use NotoSansSC or similar if we can find one, but in reportlab 
    # we usually need to load a TTF. To ensure it works out of the box in this environment,
    # we'll try to use a standard font or just use english for the main title and chinese 
    # if we have a font. Since we don't have a guaranteed CJK TTF in the container without installing one,
    # we will use the built-in CIDFont.
    
    try:
        from reportlab.pdfbase.cidfonts import UnicodeCIDFont
        pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
        zh_font = 'STSong-Light'
        zh_bold_font = 'STSong-Light' # Fallback for bold
    except:
        zh_font = 'Helvetica'
        zh_bold_font = 'Helvetica-Bold'

    c.setFont(zh_font, 14)
    c.setFillColor(colors.HexColor("#6C757D"))
    c.drawString(margin, height - margin - 55, "架构与二次开发蓝图")
    
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
    
    c.setFont(zh_bold_font, 10)
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.drawCentredString(center_x, center_y - 3, "RUST 核心")
    
    # Outer 'Python' Prototype Ring
    c.setLineWidth(2)
    c.setStrokeColor(colors.HexColor("#FD7E14")) # The 'Orange' accent
    c.circle(center_x, center_y, 120, fill=False, stroke=True)
    
    # Nodes on the outer ring (Extensions)
    extension_points = [
        (center_x + 120 * math.cos(math.pi/4), center_y + 120 * math.sin(math.pi/4), "插件"),
        (center_x + 120 * math.cos(3*math.pi/4), center_y + 120 * math.sin(3*math.pi/4), "工具"),
        (center_x + 120 * math.cos(5*math.pi/4), center_y + 120 * math.sin(5*math.pi/4), "提供商"),
        (center_x + 120 * math.cos(7*math.pi/4), center_y + 120 * math.sin(7*math.pi/4), "斜杠命令")
    ]
    
    for x, y, label in extension_points:
        c.setFillColor(colors.HexColor("#FD7E14"))
        c.circle(x, y, 6, fill=True, stroke=False)
        c.setFillColor(colors.HexColor("#212529"))
        c.setFont(zh_bold_font, 9)
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
    c.setFont(zh_bold_font, 12)
    c.drawString(margin, text_y_start, "扩展向量 (EXTENSION VECTORS)")
    
    c.setFont(zh_font, 10)
    c.setFillColor(colors.HexColor("#495057"))
    
    text_y = text_y_start - 20
    c.drawString(margin, text_y, "I. 大模型提供商集成 (PROVIDER INTEGRATION)")
    c.drawString(margin, text_y - 14, "   目标路径: rust/crates/api/src/providers/")
    c.drawString(margin, text_y - 28, "   操作指南: 实现请求构造器 (Request Constructor) 和 SSE 解析器。")
    
    text_y -= 55
    c.drawString(margin, text_y, "II. 内置工具扩展 (BUILT-IN TOOLS)")
    c.drawString(margin, text_y - 14, "   目标路径: rust/crates/tools/src/lib.rs")
    c.drawString(margin, text_y - 28, "   操作指南: 注册 JSON Schema，并在 runtime 模块中实现底层业务逻辑。")
    
    text_y -= 55
    c.drawString(margin, text_y, "III. 斜杠命令系统 (SLASH COMMANDS)")
    c.drawString(margin, text_y - 14, "   目标路径: rust/crates/commands/src/lib.rs")
    c.drawString(margin, text_y - 28, "   操作指南: 在 SlashCommand 枚举中增加指令，并实现对应的环境调度逻辑。")
    
    text_y -= 55
    c.drawString(margin, text_y, "IV. 插件与钩子机制 (PLUGIN HOOKS)")
    c.drawString(margin, text_y - 14, "   目标路径: rust/crates/plugins/ 与 conversation.rs")
    c.drawString(margin, text_y - 28, "   操作指南: 显式插入代码以触发 PreToolUse 和 PostToolUse 拦截器。")
    
    # Bottom subtle branding
    c.setFont(zh_font, 8)
    c.setFillColor(colors.HexColor("#ADB5BD"))
    c.drawCentredString(width/2, margin, "结构共振 (STRUCTURAL RESONANCE) // 系统原理图 // 版本 0.1.0")

def create_pdf(filename):
    c = canvas.Canvas(filename, pagesize=A4)
    draw_structural_resonance(c)
    c.showPage()
    c.save()

if __name__ == "__main__":
    create_pdf("/workspace/orange_code_architecture_zh.pdf")
