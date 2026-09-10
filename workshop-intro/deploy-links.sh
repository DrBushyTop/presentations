#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Uses the active Azure CLI subscription. Override these defaults for another target.
STATIC_WEB_APP_NAME="${STATIC_WEB_APP_NAME:-hack-links-zure-playground-2026}"
STATIC_WEB_APP_RESOURCE_GROUP="${STATIC_WEB_APP_RESOURCE_GROUP:-rg-hack-links}"

# Keep the deployment token out of arguments, output and files.
SWA_CLI_DEPLOYMENT_TOKEN="$(az staticwebapp secrets list \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$STATIC_WEB_APP_RESOURCE_GROUP" \
  --query properties.apiKey --output tsv)"
export SWA_CLI_DEPLOYMENT_TOKEN
npx --yes @azure/static-web-apps-cli@2.0.10 deploy workshop-intro/links --env production
