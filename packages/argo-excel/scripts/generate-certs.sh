#!/bin/bash
#
# Generate self-signed SSL certificates for local development
# Office Add-ins require HTTPS, so we need localhost certificates
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/../certs"

echo "🔐 Generating self-signed SSL certificates for localhost..."

# Create certs directory if it doesn't exist
mkdir -p "$CERTS_DIR"

# Generate self-signed certificate
openssl req -x509 \
  -newkey rsa:2048 \
  -keyout "$CERTS_DIR/localhost-key.pem" \
  -out "$CERTS_DIR/localhost.pem" \
  -days 365 \
  -nodes \
  -subj "/CN=localhost"

echo "✅ Certificates generated successfully!"
echo ""
echo "Files created:"
echo "  - $CERTS_DIR/localhost-key.pem"
echo "  - $CERTS_DIR/localhost.pem"
echo ""
echo "These certificates are valid for 365 days."
echo "You can now run: npm run dev"
