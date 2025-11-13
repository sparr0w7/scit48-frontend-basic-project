#!/bin/bash

# 스크립트가 있는 디렉토리 기준으로 경로 설정
BASE_DIR=$(dirname "$0")/..
SCHEMA_DIR=$BASE_DIR/prisma/schemas
OUTPUT_FILE=$BASE_DIR/prisma/schema.prisma

# Explicitly ordered core schema files
CORE_SCHEMAS=(
  "base.prisma"
  "user.prisma"
  "store.prisma"
  "menu.prisma"
  "order.prisma"
)

# 기존 schema.prisma 파일 삭제
rm -f "$OUTPUT_FILE"

# 헤더 추가
echo "// -------------------------------------------------------" >> "$OUTPUT_FILE"
echo "// 이 파일은 combine-prisma-schemas.sh 스크립트에 의해 자동 생성되었습니다." >> "$OUTPUT_FILE"
echo "// 절대로 직접 수정하지 마세요." >> "$OUTPUT_FILE"
echo "// -------------------------------------------------------" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Concatenate explicitly ordered core schemas
for schema_file in "${CORE_SCHEMAS[@]}"; do
  cat "$SCHEMA_DIR/$schema_file" >> "$OUTPUT_FILE"
done

# Concatenate any other .prisma files not in the core schemas
# These will be appended in alphabetical order
find "$SCHEMA_DIR" -maxdepth 1 -name "*.prisma" | sort | while read -r file; do
  filename=$(basename "$file")
  is_core_schema=false
  for core_schema in "${CORE_SCHEMAS[@]}"; do
    if [[ "$filename" == "$core_schema" ]]; then
      is_core_schema=true
      break
    fi
  done
  if ! $is_core_schema; then
    # Ensure we don't append the output file itself if it's in SCHEMA_DIR (unlikely but good to be safe)
    if [[ "$filename" != "$(basename "$OUTPUT_FILE")" ]]; then
      cat "$file" >> "$OUTPUT_FILE"
    fi
  fi
done

echo "✅ Prisma schema.prisma 파일이 성공적으로 생성되었습니다."