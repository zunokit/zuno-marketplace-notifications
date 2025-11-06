#!/bin/bash
# Generate .env.local from .env.example with random secret

echo "🔧 Generating .env.local file..."

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Backup as .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy from example
cp .env.example .env.local

# Generate random secret
SECRET=$(openssl rand -base64 32)

# Replace placeholder with generated secret
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|your-secret-here-must-be-32-chars-long|$SECRET|g" .env.local
else
    # Linux
    sed -i "s|your-secret-here-must-be-32-chars-long|$SECRET|g" .env.local
fi

echo "✅ .env.local created with generated BETTER_AUTH_SECRET"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and update:"
echo "   - DATABASE_URL (if using NeonDB)"
echo "   - RESEND_API_KEY (get from resend.com)"
echo ""
echo "2. Start Docker services:"
echo "   pnpm docker:up"
echo ""
echo "3. Run database migrations:"
echo "   pnpm db:migrate"
echo ""
echo "4. Seed database:"
echo "   pnpm db:seed"
