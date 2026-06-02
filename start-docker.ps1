# 设置不使用 BuildKit（国内网络兼容）
$env:DOCKER_BUILDKIT = "0"

Write-Host "正在构建并启动所有服务..." -ForegroundColor Cyan

docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== 所有服务已启动 ===" -ForegroundColor Green
    Write-Host "用户商城: http://localhost:5173" -ForegroundColor Yellow
    Write-Host "管理后台: http://localhost:5174" -ForegroundColor Yellow
    Write-Host "API 文档: http://localhost:3000/api-docs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "停止服务: docker compose down" -ForegroundColor Gray
} else {
    Write-Host "启动失败，请检查上面的错误信息" -ForegroundColor Red
}
