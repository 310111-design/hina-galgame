#!/usr/bin/env python3
"""Create pixel-identical lossless WebP runtime copies of the 13 expression PNGs."""

from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CHARACTER_DIR = ROOT / "site" / "assets" / "characters"
SOURCES = sorted(CHARACTER_DIR.glob("hina-expression-*.png"))

if len(SOURCES) != 13:
    raise SystemExit(f"Expected 13 source expression PNGs, found {len(SOURCES)}")

png_total = 0
webp_total = 0
for source_path in SOURCES:
    with Image.open(source_path) as source:
        if source.size != (896, 1200) or source.mode != "RGBA":
            raise SystemExit(f"Unexpected source format for {source_path.name}: {source.size} {source.mode}")
        source_rgba = source.convert("RGBA")
        buffer = BytesIO()
        source_rgba.save(buffer, format="WEBP", lossless=True, quality=100, method=0, exact=True)
        encoded = buffer.getvalue()

    output_path = source_path.with_suffix(".webp")
    output_path.write_bytes(encoded)
    with Image.open(output_path) as decoded:
        decoded_rgba = decoded.convert("RGBA")
        if decoded.size != source_rgba.size or decoded_rgba.tobytes() != source_rgba.tobytes():
            raise SystemExit(f"WebP pixels differ from source: {source_path.name}")

    png_size = source_path.stat().st_size
    webp_size = output_path.stat().st_size
    if webp_size >= png_size:
        raise SystemExit(f"Lossless WebP did not reduce size for {source_path.name}: {png_size} -> {webp_size}")
    png_total += png_size
    webp_total += webp_size
    print(f"{source_path.name}: {png_size} -> {webp_size} bytes")

reduction = (1 - webp_total / png_total) * 100
print(f"Total: {png_total} -> {webp_total} bytes ({reduction:.1f}% smaller); 13 images pixel-identical")
