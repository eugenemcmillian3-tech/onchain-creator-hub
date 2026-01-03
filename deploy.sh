#!/bin/bash

# ============================================================
# Onchain Creator & Bounty Hub - Netlify Deployment Script
# ============================================================

set -e  # Exit on error

echo "🚀 Onchain Creator & Bounty Hub - Netlify Deployment"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}❌ Netlify CLI not found${NC}"
    echo "Install it with: npm install -g netlify-cli"
    exit 1
fi

echo -e "${GREEN}✅ Netlify CLI found${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Make sure to set environment variables in Netlify dashboard"
    echo ""
fi

# Check if build exists
if [ ! -d .next ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Running build...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
    echo ""
fi

# Check if user is logged in to Netlify
echo "Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Netlify. Please log in:${NC}"
    netlify login
fi

echo -e "${GREEN}✅ Authenticated with Netlify${NC}"
echo ""

# Deployment options
echo "Choose deployment option:"
echo "1. Deploy to production"
echo "2. Deploy preview (draft)"
echo "3. Link to existing site"
echo "4. Create new site"
echo ""
read -p "Enter option (1-4): " OPTION

case $OPTION in
    1)
        echo ""
        echo -e "${YELLOW}📦 Deploying to production...${NC}"
        netlify deploy --prod
        echo ""
        echo -e "${GREEN}✅ Production deployment complete!${NC}"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}📦 Deploying preview...${NC}"
        netlify deploy
        echo ""
        echo -e "${GREEN}✅ Preview deployment complete!${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}🔗 Linking to existing site...${NC}"
        netlify link
        echo ""
        echo -e "${GREEN}✅ Site linked!${NC}"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}🆕 Creating new site...${NC}"
        netlify init
        echo ""
        echo -e "${GREEN}✅ New site created!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "===================================================="
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Netlify dashboard"
echo "2. Configure custom domain (optional)"
echo "3. Test Farcaster frame endpoints"
echo "4. Verify collector wallet integration"
echo "5. Monitor deployment logs"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo "===================================================="
