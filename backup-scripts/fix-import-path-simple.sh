#!/bin/bash

# This script fixes the import path issue in server.js

# Navigate to the correct directory
cd /var/www/paulocell

# Backup the original server.js file
cp server.js server.js.backup-$(date +%Y%m%d%H%M%S)

# Check if the server.js file contains the incorrect import path
if grep -q "import apiRoutes from './routes.js';" server.js; then
  # Replace the incorrect import path with the correct one
  sed -i "s|import apiRoutes from './routes.js';|import apiRoutes from './src/api/routes.js';|g" server.js
  echo "Fixed incorrect import path in server.js"
fi

# Remove the copied routes.js file from root directory if it exists
if [ -f "routes.js" ]; then
  rm routes.js
  echo "Removed incorrect routes.js file from root directory."
fi

# Restart the application
pm2 restart paulocell

echo "Import path fix completed and application restarted."