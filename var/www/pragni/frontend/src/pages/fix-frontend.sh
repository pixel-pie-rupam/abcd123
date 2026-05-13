#!/bin/bash

echo "🚀 Starting frontend auto-fix..."

BASE="/var/www/pragni/frontend/src"
BACKUP_DIR="/home/ubuntu/BCP"

COURSE_FILE="$BASE/pages/CourseDetail.js"
API_FILE="$BASE/utils/api.js"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup files
cp $COURSE_FILE $BACKUP_DIR/CourseDetail.js.bak
cp $API_FILE $BACKUP_DIR/api.js.bak

echo "✅ Backup stored in /home/ubuntu/BCP"

# 1. Fix loadVideo function
sed -i 's/setStreamUrl(getStreamUrl(tokenRes.data.token));/const streamRes = await getStreamUrl(tokenRes.data.token);\n    setStreamUrl(streamRes.data.embedUrl);/' $COURSE_FILE

echo "✅ Updated loadVideo()"

# 2. Fix iframe warning
sed -i 's/allowFullScreen//g' $COURSE_FILE

echo "✅ Cleaned iframe warning"

# 3. Fix API function
sed -i 's|export const getStreamUrl = (token) =>.*|import axios from "axios";\n\nexport const getStreamUrl = (token) => axios.get(`/api/videos/stream/${token}`);|' $API_FILE

echo "✅ Updated API function"

echo "🎉 Frontend fix completed!"
