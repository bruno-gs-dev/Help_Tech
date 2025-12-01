param(
    [string]$DeployUrl = 'https://help-tech-oficial.vercel.app',
    [string]$AdminToolKey = ''
)

function Invoke-JsonRequest {
    param($Uri, $Headers)
    try {
        return Invoke-RestMethod -Uri $Uri -Headers $Headers -Method GET -ErrorAction Stop
    } catch {
        $err = $_.Exception
        if ($err.Response) {
            try {
                $sr = $err.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($sr)
                $txt = $reader.ReadToEnd()
                Write-Host "Response body:`n$txt" -ForegroundColor Yellow
            } catch {
                Write-Host "Erro ao ler resposta: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

$checkUrl = "$DeployUrl/api/check_supabase_service_role"
$headers = @{}
if ($AdminToolKey -ne '') { $headers['x-admin-tool-key'] = $AdminToolKey }

Write-Host "Chamando endpoint de diagnóstico: $checkUrl" -ForegroundColor Cyan
$check = Invoke-JsonRequest -Uri $checkUrl -Headers $headers
if (-not $check) { Write-Host "Falha ao chamar o endpoint de diagnóstico." -ForegroundColor Red; exit 2 }

Write-Host "Resposta do diagnóstico:" -ForegroundColor Green
$check | ConvertTo-Json -Depth 5

if ($check.admin_key_valid -eq $true) {
    Write-Host "Service Role Key válida. Tentando listar usuários via /api/admin_list_users..." -ForegroundColor Green
    $adminListUrl = "$DeployUrl/api/admin_list_users"
    if ($AdminToolKey -eq '') { Write-Host "Aviso: /api/admin_list_users exige x-admin-tool-key — passe -AdminToolKey se aplicável." -ForegroundColor Yellow }
    $list = Invoke-JsonRequest -Uri $adminListUrl -Headers $headers
    if ($list) {
        Write-Host "Lista de usuários (resumo):" -ForegroundColor Green
        if ($list.data) {
            $list.data | ConvertTo-Json -Depth 4
        } else {
            $list | ConvertTo-Json -Depth 4
        }
    } else {
        Write-Host "Falha ao listar usuários." -ForegroundColor Red; exit 3
    }
} else {
    Write-Host "Service Role Key inválida ou sem privilégios admin. Corrija as env vars no Vercel e redeploy." -ForegroundColor Red
    exit 4
}

Write-Host "Validação concluída." -ForegroundColor Cyan
