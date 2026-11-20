#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_DIR = ROOT / "site" / "assets" / "backgrounds"
SOURCES = sorted(BACKGROUND_DIR.glob("*-v01.jpeg"))
if not SOURCES:
    raise SystemExit("No semantic *-v01.jpeg backgrounds found.")

total_source = 0
total_webp = 0
for source in SOURCES:
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        rgb = image.convert("RGB")
        rgb.save(target, "WEBP", quality=84, method=6)
        with Image.open(target) as check:
            if check.size != rgb.size or check.format != "WEBP":
                raise RuntimeError(f"WebP verification failed: {target.name}")
    source_size = source.stat().st_size
    target_size = target.stat().st_size
    total_source += source_size
    total_webp += target_size
    reduction = (1 - target_size / source_size) * 100
    print(f"{source.name} -> {target.name}: {source_size:,} -> {target_size:,} bytes ({reduction:.1f}% smaller)")

print(f"TOTAL: {len(SOURCES)} backgrounds, {total_source:,} -> {total_webp:,} bytes ({(1-total_webp/total_source)*100:.1f}% smaller)")
