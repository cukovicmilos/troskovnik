#!/bin/bash
# Troskovnik Setup Script
# Run with: sudo bash /var/www/html/troskovnik/setup.sh

set -e

echo "=== Installing Troskovnik ==="

# 1. Install systemd service
echo "Installing systemd service..."
cp /var/www/html/troskovnik/troskovnik.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable troskovnik
systemctl start troskovnik
echo "✓ Systemd service installed and started"

# 2. Add nginx config
echo "Adding nginx configuration..."
NGINX_CONF="/etc/nginx/sites-available/labubush.duckdns.org"
TROSKOVNIK_BLOCK='
    # Troskovnik - Monthly Expense Tracker
    location /troskovnik/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
'

# Check if already configured
if grep -q "location /troskovnik/" "$NGINX_CONF"; then
    echo "✓ Nginx already configured for troskovnik"
else
    # Insert after legomil block (after line with "proxy_cache_bypass $http_upgrade;" in legomil section)
    sed -i '/# LEGO Mil reverse proxy/,/proxy_cache_bypass \$http_upgrade;/{/proxy_cache_bypass \$http_upgrade;/a\
    \
    # Troskovnik - Monthly Expense Tracker\
    location /troskovnik/ {\
        proxy_pass http://localhost:3000/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_cache_bypass $http_upgrade;\
    }
}' "$NGINX_CONF"
    echo "✓ Nginx configuration added"
fi

# 3. Test and reload nginx
echo "Testing nginx configuration..."
nginx -t
echo "Reloading nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"

# 4. Show status
echo ""
echo "=== Setup Complete ==="
systemctl status troskovnik --no-pager
echo ""
echo "Access at: https://labubush.duckdns.org/troskovnik/"
