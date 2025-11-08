#!/bin/bash

# Fix Next.js 16 params Promise issue in all route handlers

files=(
  "src/app/api/api-keys/[id]/route.ts"
  "src/app/api/drops/[id]/route.ts"
  "src/app/api/drops/[id]/whitelist/route.ts"
  "src/app/api/notifications/[id]/resend/route.ts"
  "src/app/api/notifications/[id]/route.ts"
  "src/app/api/preferences/[userId]/route.ts"
  "src/app/api/price-alerts/[id]/route.ts"
  "src/app/api/templates/[id]/route.ts"
  "src/app/api/webhooks/[id]/route.ts"
  "src/app/api/webhooks/[id]/test/route.ts"
)

for file in "${files[@]}"; do
  echo "Processing $file..."

  # Replace params type from direct object to Promise
  sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"

  # Add await before params destructuring
  sed -i 's/const { \([^}]*\) } = params/const { \1 } = await params/g' "$file"

  echo "Done: $file"
done

echo "All files updated!"
