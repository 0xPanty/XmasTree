#!/bin/bash

# Farcaster Mini App API测试脚本
# 使用方法: ./test-apis.sh

echo "🎄 Testing Jingle Gift APIs..."
echo "================================"

BASE_URL="https://xmas-tree-opal.vercel.app"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    
    echo -e "\n📡 Testing: ${YELLOW}${name}${NC}"
    echo "   URL: ${url}"
    
    response=$(curl -s -w "\n%{http_code}" "${url}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "   ${GREEN}✓ Success (HTTP $http_code)${NC}"
        echo "   Response: $(echo $body | head -c 100)..."
    else
        echo -e "   ${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "   Response: $body"
    fi
}

# 测试Neynar API
echo -e "\n${YELLOW}1. Neynar API Tests${NC}"
echo "-------------------"

test_endpoint "User Search" \
    "${BASE_URL}/api/neynar?action=search&q=vitalik&limit=1"

test_endpoint "Get User by FID" \
    "${BASE_URL}/api/neynar?action=user&fid=5650"

test_endpoint "Check Stamps Eligibility" \
    "${BASE_URL}/api/neynar?action=check_stamps&fid=5650"

test_endpoint "Best Friends" \
    "${BASE_URL}/api/neynar?action=best_friends&fid=5650"

# 测试Warplet API
echo -e "\n${YELLOW}2. Warplet NFT API Tests${NC}"
echo "------------------------"

test_endpoint "Check Warplet NFT" \
    "${BASE_URL}/api/warplet?fid=5650"

# 测试静态资源
echo -e "\n${YELLOW}3. Static Assets Tests${NC}"
echo "-----------------------"

test_endpoint "Preview SVG" \
    "${BASE_URL}/preview.svg"

test_endpoint "Icon SVG" \
    "${BASE_URL}/icon.svg"

test_endpoint "Index HTML" \
    "${BASE_URL}/index.html"

# 检查邮票图片
echo -e "\n${YELLOW}4. Stamp Images${NC}"
echo "---------------"

stamps=("neynar" "farcaster" "warplet" "based")
for stamp in "${stamps[@]}"; do
    test_endpoint "Stamp: $stamp" \
        "${BASE_URL}/stamp/${stamp}.png"
done

echo -e "\n================================"
echo "🎄 Testing Complete!"
echo ""
echo "Next steps:"
echo "1. If any tests failed, check Vercel environment variables"
echo "2. Check Vercel logs: https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/logs"
echo "3. Test in Farcaster client (Warpcast)"
echo ""
