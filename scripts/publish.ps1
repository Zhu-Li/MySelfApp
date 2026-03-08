$source = "d:\MySelf-App"
$dest = "D:\Publish\MySelf-App\Home"
$serviceDir = "D:\Publish\MySelf-App"

# 1. 先运行小说数据生成脚本（扫描源目录、拷贝章节文件、生成 index.json）
Write-Host "=== Step 1: Generate novel data ==="
$novelProc = Start-Process -FilePath "node" -ArgumentList "$source\scripts\generate-novel-data.js" -NoNewWindow -Wait -PassThru
if ($novelProc.ExitCode -ne 0) {
    Write-Host "Novel data generation failed (exit code: $($novelProc.ExitCode))."
    exit 1
}
Write-Host "Novel data generated successfully."

# 2. 同步应用代码（排除 novel 目录，小说文件由上一步已处理）
Write-Host ""
Write-Host "=== Step 2: Sync app files ==="
# /MIR 镜像同步，/IS 强制覆盖同名文件（防止时间戳一致但内容不同的情况）
$proc = Start-Process -FilePath "robocopy.exe" -ArgumentList "$source","$dest","/MIR","/IS","/XD",".git","node_modules",".qoder","scripts","novel","/XF","*.zip",".gitignore","package.json","package-lock.json","nul" -NoNewWindow -Wait -PassThru
Write-Host "App sync exit code: $($proc.ExitCode)"
if ($proc.ExitCode -gt 3) {
    Write-Host "App sync failed with errors."
    exit 1
}

# 3. 部署 API 服务文件
Write-Host ""
Write-Host "=== Step 3: Deploy API service ==="
Copy-Item -Path "$source\scripts\server.js" -Destination "$serviceDir\server.js" -Force
Copy-Item -Path "$source\scripts\install-service.ps1" -Destination "$serviceDir\install-service.ps1" -Force
# 确保 ps1 文件带 UTF-8 BOM（PowerShell 5.1 中文环境需要）
node -e "var f=require('fs'),p='D:\\Publish\\MySelf-App\\install-service.ps1',b=f.readFileSync(p);if(b[0]!==0xEF||b[1]!==0xBB||b[2]!==0xBF){f.writeFileSync(p,Buffer.concat([Buffer.from([0xEF,0xBB,0xBF]),b]))}"
Write-Host "server.js          -> $serviceDir\server.js"
Write-Host "install-service.ps1 -> $serviceDir\install-service.ps1"

# 4. 重启 Windows 服务（如果已安装）
Write-Host ""
Write-Host "=== Step 4: Restart API service ==="
$svc = Get-Service -Name "GuanJiNovelAPI" -ErrorAction SilentlyContinue
if ($svc) {
    $nssmExe = "$serviceDir\tools\nssm.exe"
    if (Test-Path $nssmExe) {
        Write-Host "Restarting GuanJiNovelAPI service..."
        & $nssmExe restart GuanJiNovelAPI
        Start-Sleep -Seconds 2
        $svc = Get-Service -Name "GuanJiNovelAPI" -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -eq 'Running') {
            Write-Host "Service restarted successfully."
        } else {
            Write-Host "Service restart may have failed, check logs."
        }
    } else {
        Write-Host "NSSM not found, skipping service restart."
    }
} else {
    Write-Host "Service not installed. Run install-service.ps1 to install:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File $serviceDir\install-service.ps1 install"
}

Write-Host ""
Write-Host "Publish completed successfully."
exit 0
