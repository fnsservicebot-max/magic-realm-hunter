#!/usr/bin/env python3
"""批次處理 47 張圖片：
1. 黑底 → 透明
2. 縮圖到 256x256
3. 存成 PNG（透明背景）

需要：PIL (Pillow)
"""
import os
import sys
from PIL import Image

ROOT = "/Users/alex_bot_0223/.openclaw/workspace/magic-realm-hunter/assets"
TARGET_SIZE = 256


def remove_black_bg_to_transparent(input_path, output_path, threshold=30):
    """把黑色背景轉成透明
    - threshold: 像素 RGB 任一通道 < threshold 視為背景
    """
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # 接近黑色 → 透明
            if r < threshold and g < threshold and b < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            # 接近純黑灰（避免誤刪主體邊緣）
            elif max(r, g, b) < threshold * 2:
                # 半透明
                alpha = int(255 * (max(r, g, b) / (threshold * 2)))
                pixels[x, y] = (r, g, b, alpha)

    # 縮圖
    img.thumbnail((TARGET_SIZE, TARGET_SIZE), Image.NEAREST)
    img.save(output_path, "PNG")
    return True


def main():
    weapons_dir = f"{ROOT}/weapons"
    monsters_dir = f"{ROOT}/monsters"

    # 武器
    print(f"=== 處理武器 ===")
    for fname in sorted(os.listdir(weapons_dir)):
        if not fname.endswith(".jpeg"):
            continue
        wid = fname.replace(".jpeg", "")
        inp = f"{weapons_dir}/{fname}"
        out = f"{weapons_dir}/{wid}.png"
        remove_black_bg_to_transparent(inp, out)
        size_kb = os.path.getsize(out) / 1024
        print(f"  ✅ {wid}.png ({size_kb:.0f}KB)")
        # 刪 jpeg
        os.remove(inp)

    # 魔物
    print(f"\n=== 處理魔物 ===")
    for fname in sorted(os.listdir(monsters_dir)):
        if not fname.endswith(".jpeg"):
            continue
        mid = fname.replace(".jpeg", "")
        inp = f"{monsters_dir}/{fname}"
        out = f"{monsters_dir}/{mid}.png"
        remove_black_bg_to_transparent(inp, out)
        size_kb = os.path.getsize(out) / 1024
        print(f"  ✅ {mid}.png ({size_kb:.0f}KB)")
        # 刪 jpeg
        os.remove(inp)

    print(f"\n✅ 完成！共處理 47 張")


if __name__ == '__main__':
    main()
