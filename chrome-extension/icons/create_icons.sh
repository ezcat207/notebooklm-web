#!/bin/bash
# 创建简单的占位图标（使用 ImageMagick 或其他工具）
# 暂时创建空文件作为占位符

for size in 16 48 128; do
  # 创建一个简单的 SVG 文本图标
  cat > icon${size}.svg << SVGEOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4285f4"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="${size/2}">NB</text>
</svg>
SVGEOF
  
  # 注意：实际使用时需要将 SVG 转换为 PNG
  # 可以使用 ImageMagick: convert icon${size}.svg icon${size}.png
  # 或在线工具转换
done

echo "Placeholder icon files created. Convert SVG to PNG using ImageMagick or online tools."
