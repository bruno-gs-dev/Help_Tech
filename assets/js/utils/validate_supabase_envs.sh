#!/usr/bin/env bash
set -euo pipefail

DEPLOY_URL="${1:-https://help-tech-oficial.vercel.app}"
ADMIN_TOOL_KEY="${2:-}"

check_url="$DEPLOY_URL/api/check_supabase_service_role"
admin_list_url="$DEPLOY_URL/api/admin_list_users"

echo "Chamando: $check_url"
if [ -n "$ADMIN_TOOL_KEY" ]; then
  header=( -H "x-admin-tool-key: $ADMIN_TOOL_KEY" )
else
  header=()
fi

resp=$(curl -sS "${header[@]}" "$check_url" -w "\nHTTP_STATUS:%{http_code}") || true
http_status=$(echo "$resp" | tr '\n' ' ' | sed -E 's/.*HTTP_STATUS:([0-9]{3})/\1/')
body=$(echo "$resp" | sed -E 's/\nHTTP_STATUS:[0-9]{3}//')

echo "Status: $http_status"
echo "Body: $body"

if [ "$http_status" -eq 200 ]; then
  echo "Service Role Key válida. Tentando listar usuários..."
  echo "Chamando: $admin_list_url"
  curl -sS "${header[@]}" "$admin_list_url" | jq '.' || true
else
  echo "Chave inválida ou erro. Corrija as env vars no Vercel e redeploy." >&2
  exit 2
fi

echo "Validação concluída."
