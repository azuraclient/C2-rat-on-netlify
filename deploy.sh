#!/bin/bash

# Rat C2 Netlify Deployment Script

echo "🐀 Rat C2 Deployment Script"
echo "============================"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if user is logged in to Netlify
if ! netlify whoami &> /dev/null; then
    echo "🔐 Please login to Netlify:"
    netlify login
fi

# Link to Netlify site (or create new one)
echo "🔗 Linking to Netlify site..."
netlify link

# Set environment variables
echo "⚙️ Setting environment variables..."
if [ -f ".env" ]; then
    # Read AUTH_TOKEN from .env file
    AUTH_TOKEN=$(grep AUTH_TOKEN .env | cut -d '=' -f2)
    if [ ! -z "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "your-secure-auth-token-here-change-this-in-production" ]; then
        netlify env:set AUTH_TOKEN "$AUTH_TOKEN"
        echo "✅ AUTH_TOKEN set"
    else
        echo "⚠️ Please update AUTH_TOKEN in .env file"
    fi
else
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️ Please update AUTH_TOKEN in .env file before deploying"
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your C2 server is available at:"
echo "   Controller: https://your-site.netlify.app/controller.html"
echo "   API: https://your-site.netlify.app/.netlify/functions/"
echo ""
echo "🔐 Don't forget to:"
echo "   1. Set a strong AUTH_TOKEN in Netlify environment variables"
echo "   2. Test the controller interface"
echo "   3. Configure client connections"
