#!/bin/bash

echo "🖼️  Iniciando otimização PNG → WebP..."
echo ""

# Verifica se o cwebp está instalado
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp não encontrado. Instalando via Homebrew..."
    brew install webp
    echo ""
fi

count=0
total_original=0
total_new=0

process_png() {
    local png="$1"
    local base="${png%.png}"
    local webp="${base}.webp"
    local temp="${base}_temp.webp"

    echo "📁 Processando: $png"

    # Se já existe webp, remove o png antigo
    if [ -f "$webp" ]; then
        echo "   ⚠️  WebP já existe → removendo PNG antigo"
        rm "$png"
        echo ""
        return
    fi

    original_bytes=$(stat -f%z "$png" 2>/dev/null || stat -c%s "$png" 2>/dev/null)
    original_size=$(du -h "$png" | cut -f1)

    echo "   Tamanho original: $original_size"

    # Conversão otimizada
    cwebp -q 82 -m 6 -mt -af -sharp_yuv "$png" -o "$temp" 2>/dev/null

    if [ $? -ne 0 ]; then
        echo "   ❌ Erro ao converter"
        rm -f "$temp"
        echo ""
        return
    fi

    new_bytes=$(stat -f%z "$temp" 2>/dev/null || stat -c%s "$temp" 2>/dev/null)

    # Se não reduziu, tenta lossless
    if [ "$new_bytes" -ge "$original_bytes" ]; then
        echo "   ⚠️  Tentando compressão lossless"
        rm "$temp"
        cwebp -lossless "$png" -o "$temp" 2>/dev/null
        new_bytes=$(stat -f%z "$temp" 2>/dev/null || stat -c%s "$temp" 2>/dev/null)

        if [ "$new_bytes" -ge "$original_bytes" ]; then
            echo "   ℹ️  Sem ganho → mantendo PNG"
            rm "$temp"
            echo ""
            return
        fi
    fi

    reduction=$(echo "scale=1; (1 - $new_bytes / $original_bytes) * 100" | bc)

    rm "$png"
    mv "$temp" "$webp"

    new_size=$(du -h "$webp" | cut -f1)

    echo "   ✅ Convertido para WebP"
    echo "   📦 Novo tamanho: $new_size"
    echo "   💾 Redução: ${reduction}%"
    echo ""

    total_original=$((total_original + original_bytes))
    total_new=$((total_new + new_bytes))
    count=$((count + 1))
}

shopt -s nullglob nocaseglob

for png in *.png; do
    [ -e "$png" ] || continue
    process_png "$png"
done

if [ "$total_original" -gt 0 ]; then
    total_reduction=$(echo "scale=1; (1 - $total_new / $total_original) * 100" | bc)
else
    total_reduction=0
fi

echo "✨ Concluído! $count imagens convertidas"
echo ""
echo "📊 Estatísticas:"
echo "   Original total: $(numfmt --to=iec $total_original 2>/dev/null || echo "$total_original bytes")"
echo "   Final total: $(numfmt --to=iec $total_new 2>/dev/null || echo "$total_new bytes")"
echo "   💾 Redução total: ${total_reduction}%"
