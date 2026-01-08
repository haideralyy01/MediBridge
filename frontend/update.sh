#!/bin/bash

# MediBridge Frontend Update Script
# This script updates the website with latest changes from Git

echo "🚀 Starting MediBridge Frontend Update..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project paths
PROJECT_DIR="/var/www/MediBridge/frontend"
DEPLOY_DIR="/var/www/medibridge/frontend"

# Step 1: Navigate to project directory
echo -e "${BLUE}📁 Navigating to project directory...${NC}"
cd $PROJECT_DIR || {
    echo -e "${RED}❌ Error: Could not navigate to $PROJECT_DIR${NC}"
    exit 1
}
echo -e "${GREEN}✅ In directory: $(pwd)${NC}"

# Step 2: Pull latest changes from Git
echo -e "${BLUE}📥 Pulling latest changes from Git...${NC}"
sudo git pull origin main || {
    echo -e "${RED}❌ Error: Git pull failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Git pull completed${NC}"

# Step 3: Check if logo file exists
echo -e "${BLUE}🖼️  Checking for logo file...${NC}"
if [ -f "public/Gemini_Generated_Image_p1hresp1hresp1hr.png" ]; then
    echo -e "${GREEN}✅ Logo file found${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Logo file not found${NC}"
fi

# Step 4: Install/update dependencies
echo -e "${BLUE}📦 Installing/updating dependencies...${NC}"
sudo npm install || {
    echo -e "${RED}❌ Error: npm install failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies updated${NC}"

# Step 5: Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
sudo rm -rf dist/
echo -e "${GREEN}✅ Previous build cleaned${NC}"

# Step 6: Build the project
echo -e "${BLUE}🔨 Building the project...${NC}"
sudo npm run build || {
    echo -e "${RED}❌ Error: Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 7: Verify build includes logo
echo -e "${BLUE}🔍 Verifying build includes logo...${NC}"
if [ -f "dist/Gemini_Generated_Image_p1hresp1hresp1hr.png" ]; then
    echo -e "${GREEN}✅ Logo included in build${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Logo not found in build${NC}"
fi

# Step 8: Backup current deployment (optional)
echo -e "${BLUE}💾 Creating backup of current deployment...${NC}"
sudo cp -r $DEPLOY_DIR $DEPLOY_DIR.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo -e "${YELLOW}⚠️  Backup skipped (deploy dir may not exist)${NC}"

# Step 9: Deploy new build
echo -e "${BLUE}🚀 Deploying new build...${NC}"
sudo rm -rf $DEPLOY_DIR/*
sudo cp -r dist/* $DEPLOY_DIR/ || {
    echo -e "${RED}❌ Error: Deployment failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Files deployed successfully${NC}"

# Step 10: Set proper permissions
echo -e "${BLUE}🔐 Setting proper permissions...${NC}"
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR
echo -e "${GREEN}✅ Permissions set${NC}"

# Step 11: Verify logo is deployed
echo -e "${BLUE}🔍 Verifying logo deployment...${NC}"
if [ -f "$DEPLOY_DIR/Gemini_Generated_Image_p1hresp1hresp1hr.png" ]; then
    echo -e "${GREEN}✅ Logo successfully deployed${NC}"
else
    echo -e "${RED}❌ Error: Logo not found in deployment${NC}"
fi

# Step 12: Test Nginx configuration
echo -e "${BLUE}🔧 Testing Nginx configuration...${NC}"
sudo nginx -t || {
    echo -e "${RED}❌ Error: Nginx configuration test failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Nginx configuration is valid${NC}"

# Step 13: Restart Nginx
echo -e "${BLUE}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx || {
    echo -e "${RED}❌ Error: Nginx restart failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Nginx restarted successfully${NC}"

# Step 14: Check Nginx status
echo -e "${BLUE}📊 Checking Nginx status...${NC}"
if sudo systemctl is-active nginx >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Error: Nginx is not running${NC}"
    exit 1
fi

# Step 15: Test website accessibility
echo -e "${BLUE}🌐 Testing website accessibility...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://mb.egamei.com)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Website is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Website returned HTTP $HTTP_STATUS${NC}"
fi

# Final summary
echo ""
echo "================================================"
echo -e "${GREEN}🎉 MediBridge Frontend Update Completed!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   • Git pull: ${GREEN}✅${NC}"
echo -e "   • Dependencies: ${GREEN}✅${NC}"
echo -e "   • Build: ${GREEN}✅${NC}"
echo -e "   • Deployment: ${GREEN}✅${NC}"
echo -e "   • Nginx: ${GREEN}✅${NC}"
echo ""
echo -e "${BLUE}🌐 Your website is now updated at: http://mb.egamei.com${NC}"
echo -e "${BLUE}🔍 Test the following:${NC}"
echo "   • Logo should show the real image (not fake SVG)"
echo "   • Dashboard functionality"
echo "   • Health Records CRUD operations"
echo "   • Mobile responsiveness"
echo ""
echo -e "${YELLOW}💡 If you encounter any issues, check:${NC}"
echo "   • Nginx logs: sudo tail -20 /var/log/nginx/error.log"
echo "   • Clear browser cache for logo changes"
echo ""
echo -e "${GREEN}🚀 Update completed successfully!${NC}"