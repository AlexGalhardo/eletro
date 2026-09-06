#!/bin/bash

# Script de Otimização de Imagens para WebP
# Converte e otimiza imagens mantendo qualidade visual

echo "🖼️  Iniciando otimização de imagens..."
echo ""

# Verifica se o cwebp está instalado
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp não encontrado. Instalando via Homebrew..."
    brew install webp
    echo ""
fi

# Cria pasta para as imagens otimizadas
mkdir -p optimized

# Contador de arquivos processados
count=0

# Processa cada arquivo de imagem
shopt -s nullglob
for file in *.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}; do
    # Verifica se o arquivo existe (para evitar erro quando não há matches)
    [ -e "$file" ] || continue
    
    # Detecta o tipo real do arquivo
    file_type=$(file -b --mime-type "$file")
    
    echo "📁 Processando: $file"
    echo "   Tipo detectado: $file_type"
    
    # Pega o tamanho original
    original_size=$(du -h "$file" | cut -f1)
    echo "   Tamanho original: $original_size"
    
    # Nome do arquivo de saída (remove extensão antiga e adiciona .webp)
    filename="${file%.*}"
    output="optimized/${filename}.webp"
    
    # Pega bytes do original antes da conversão
    original_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    
    # Converte para WebP com alta qualidade e otimização
    # -q 82: qualidade 82 (melhor balanço para web)
    # -m 6: método de compressão máximo
    # -mt: usa multi-threading
    # -af: auto-ajuste do filtro
    # -sharp_yuv: melhor qualidade de cor
    cwebp -q 82 -m 6 -mt -af -sharp_yuv "$file" -o "$output" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        new_bytes=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        
        # Se a imagem otimizada for MAIOR, reconverte mantendo extensão .webp
        if [ $new_bytes -ge $original_bytes ]; then
            echo "   ⚠️  Otimização aumentou o tamanho - convertendo sem otimização"
            # Converte novamente com qualidade máxima para não aumentar o tamanho
            cwebp -q 100 -lossless "$file" -o "$output" 2>/dev/null
            new_bytes=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
            reduction=0
        else
            # Calcula a redução percentual
            reduction=$(echo "scale=1; (1 - $new_bytes / $original_bytes) * 100" | bc)
        fi
        
        # Mostra o novo tamanho
        new_size=$(du -h "$output" | cut -f1)
        echo "   ✅ Final: $new_size (WebP)"
        echo "   💾 Redução: ${reduction}%"
        
        count=$((count + 1))
    else
        echo "   ❌ Erro ao processar"
    fi
    
    echo ""
done

echo "✨ Concluído! $count imagens otimizadas na pasta 'optimized/'"
echo ""
echo "📊 Comparação de tamanhos:"
echo "   Pasta original: $(du -sh . | cut -f1)"
echo "   Pasta otimizada: $(du -sh optimized | cut -f1)"