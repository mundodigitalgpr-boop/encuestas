#!/usr/bin/env python3
"""
Genera un poster QR corporativo de Churrascos Chaca #5 con el logo embebido.

Uso:
    python3 generar_qr.py "https://tu-sitio.netlify.app/"

Salida:
    qr_chaca.png  (poster listo para imprimir)
"""
import sys
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont

# ---- Colores de marca ----
NEGRO   = (13, 13, 13)
DORADO  = (245, 158, 11)
ORO_CLR = (251, 191, 36)
BLANCO  = (255, 255, 255)

def cargar_fuente(tam, bold=True):
    rutas = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]
    for r in rutas:
        try:
            return ImageFont.truetype(r, tam)
        except OSError:
            continue
    return ImageFont.load_default()

def texto_centrado(draw, cy, txt, font, fill, W):
    b = draw.textbbox((0, 0), txt, font=font)
    w = b[2] - b[0]
    draw.text(((W - w) / 2, cy), txt, font=font, fill=fill)
    return b[3] - b[1]

def main():
    if len(sys.argv) < 2:
        print("Falta la URL. Uso: python3 generar_qr.py \"https://tu-sitio.netlify.app/\"")
        sys.exit(1)
    url = sys.argv[1].strip()

    # ---- QR con alta corrección de errores (permite logo al centro) ----
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=20, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=NEGRO, back_color=BLANCO).convert("RGB")
    qs = qr_img.size[0]

    # ---- Logo en el centro sobre recuadro blanco redondeado ----
    logo = Image.open("logo.jpg").convert("RGB")
    lw = int(qs * 0.22)
    lh = int(logo.size[1] * lw / logo.size[0])
    logo = logo.resize((lw, lh), Image.LANCZOS)
    pad = int(lw * 0.16)
    caja = Image.new("RGB", (lw + pad * 2, lh + pad * 2), BLANCO)
    mask = Image.new("L", caja.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, caja.size[0], caja.size[1]], radius=pad, fill=255)
    caja.paste(logo, (pad, pad))
    cx = (qs - caja.size[0]) // 2
    cy = (qs - caja.size[1]) // 2
    qr_img.paste(caja, (cx, cy), mask)

    # ---- Poster ----
    W, H = 1000, 1480
    poster = Image.new("RGB", (W, H), NEGRO)
    d = ImageDraw.Draw(poster)
    # marco dorado
    d.rounded_rectangle([18, 18, W - 18, H - 18], radius=36, outline=DORADO, width=6)

    # logo arriba
    logo_top = Image.open("logo.jpg").convert("RGB")
    ltw = 420
    lth = int(logo_top.size[1] * ltw / logo_top.size[0])
    logo_top = logo_top.resize((ltw, lth), Image.LANCZOS)
    poster.paste(logo_top, ((W - ltw) // 2, 70))

    y = 70 + lth + 30
    y += texto_centrado(d, y, "ESCANEA Y CALIFÍCANOS", cargar_fuente(58), ORO_CLR, W) + 26

    # QR sobre panel blanco
    panel = 640
    qr_r = qr_img.resize((panel - 60, panel - 60), Image.NEAREST)
    px = (W - panel) // 2
    d.rounded_rectangle([px, y, px + panel, y + panel], radius=28, fill=BLANCO)
    poster.paste(qr_r, (px + 30, y + 30))
    y += panel + 34

    y += texto_centrado(d, y, "Tu opinión nos toma menos de 1 minuto", cargar_fuente(36, bold=False), BLANCO, W) + 14
    texto_centrado(d, y, "¡Gracias por ayudarnos a mejorar!", cargar_fuente(34), DORADO, W)

    poster.save("qr_chaca.png", quality=95)
    qr_img.save("qr_chaca_simple.png")   # solo el QR, por si lo quieres aparte
    print("Generado: qr_chaca.png  (poster) y qr_chaca_simple.png (solo QR)")
    print("URL codificada:", url)

if __name__ == "__main__":
    main()
