# -*- coding: utf-8 -*-
"""
《溯洄》素材转换脚本：TIFF → WebP
- 页面(59张: 00封面/01-57/00封底) → assets/img/pages/
- 人物设定图(5张) → assets/img/characters/
幂等：同名目标文件已存在则跳过，可安全重跑。
"""
import os
import re
import sys
from PIL import Image

SRC = r"C:\Users\JYM\Desktop\manga\第5组 姜又萌 王诗韵 邓文慧\第5组 姜又萌 王诗韵 邓文慧 作品创作\作品图片格式"
OUT_PAGES = r"D:\manga-portfolio\assets\img\pages"
OUT_CHARS = r"D:\manga-portfolio\assets\img\characters"

QUALITY = 82          # WebP 质量
MAX_EDGE = 1600       # 超长边缩放到此(封面/封底 2360px 太大，正文 1080 不动)

def to_rgb(img):
    """RGBA→RGB(若 alpha 全不透明)，其余模式转 RGB，保证 WebP 兼容"""
    if img.mode == "RGBA":
        alpha = img.getchannel("A")
        if alpha.getextrema() == (255, 255):
            return img.convert("RGB")
    elif img.mode != "RGB":
        return img.convert("RGB")
    return img

def convert(src_path, out_path):
    """单张转换；已存在则跳过。返回 (status, size_kb)"""
    if os.path.exists(out_path):
        return ("skip", os.path.getsize(out_path) // 1024)
    im = Image.open(src_path)
    im = to_rgb(im)
    w, h = im.size
    if max(w, h) > MAX_EDGE:
        scale = MAX_EDGE / max(w, h)
        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    im.save(out_path, "WEBP", quality=QUALITY, method=6)
    return ("ok", os.path.getsize(out_path) // 1024)

def page_sort_key(name):
    """按页序排序：封面=0，数字页按数字，封底=999"""
    base = os.path.splitext(name)[0]
    if "封面" in base:
        return (0,)
    if "封底" in base:
        return (999,)
    m = re.search(r"(\d+)", base)
    return (int(m.group(1)),) if m else (500,)

def main():
    os.makedirs(OUT_PAGES, exist_ok=True)
    os.makedirs(OUT_CHARS, exist_ok=True)

    # 1) 页面文件（源目录根下，不含子目录）
    page_files = [f for f in os.listdir(SRC)
                  if f.lower().endswith((".tif", ".tiff")) and os.path.isfile(os.path.join(SRC, f))]
    page_files.sort(key=page_sort_key)
    print(f"== 页面文件: {len(page_files)} 张 ==")
    total_in, total_out = 0, 0
    for f in page_files:
        base = os.path.splitext(f)[0]
        # 输出名：封面→00-cover，封底→00-back，数字页→NN
        if "封面" in base:
            out_name = "00-cover.webp"
        elif "封底" in base:
            out_name = "00-back.webp"
        else:
            m = re.search(r"(\d+)", base)
            out_name = f"{int(m.group(1)):02d}.webp" if m else base + ".webp"
        status, kb = convert(os.path.join(SRC, f), os.path.join(OUT_PAGES, out_name))
        total_out += kb
        print(f"  {f} → {out_name} [{status}] {kb}KB")

    # 2) 人物设定图（子目录）
    char_dir = os.path.join(SRC, "人物设定图")
    char_files = [f for f in os.listdir(char_dir)
                  if f.lower().endswith((".tif", ".tiff")) and os.path.isfile(os.path.join(char_dir, f))]
    print(f"\n== 人物设定图: {len(char_files)} 张 ==")
    for f in sorted(char_files):
        base = os.path.splitext(f)[0]
        out_name = base + ".webp"
        status, kb = convert(os.path.join(char_dir, f), os.path.join(OUT_CHARS, out_name))
        total_out += kb
        print(f"  {f} → {out_name} [{status}] {kb}KB")

    print(f"\n完成。输出总量约 {total_out/1024:.1f} MB")

if __name__ == "__main__":
    sys.exit(main())
