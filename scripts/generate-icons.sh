#!/bin/bash

# Скрипт для генерации иконок PWA из SVG логотипа
# Требует установки: npm install -g sharp-cli

INPUT_SVG="public/logo.svg"
OUTPUT_DIR="public/icons"

# Создаём директорию
mkdir -p $OUTPUT_DIR

# Генерируем иконки разных размеров
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
  echo "Generating ${size}x${size} icon..."
  npx sharp -i $INPUT_SVG -o "${OUTPUT_DIR}/icon-${size}x${size}.png" resize $size $size
done

# Генерируем apple-touch-icon
echo "Generating apple-touch-icon..."
npx sharp -i $INPUT_SVG -o "public/apple-touch-icon.png" resize 180 180

# Генерируем favicon.ico
echo "Generating favicon.ico..."
npx sharp -i $INPUT_SVG -o "public/favicon.ico" resize 32 32

echo "All icons generated successfully!"
