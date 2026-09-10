#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Keep the deployment token out of arguments, output and files.
SWA_CLI_DEPLOYMENT_TOKEN="$(az staticwebapp secrets list \
  --name hack-links --resource-group rg-hack-links \
  --subscription ede0939c-80c4-4dfe-bf3d-84521f3f6d1f \
  --query properties.apiKey --output tsv)"
export SWA_CLI_DEPLOYMENT_TOKEN
npx --yes @azure/static-web-apps-cli@2.0.10 deploy workshop-intro/links --env production
