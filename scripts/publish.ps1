$source = "d:\MySelf-App"
$dest = "D:\Publish\MySelf-App\Home"

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

Write-Host ""
Write-Host "=== Step 3: Deploy server ==="
Copy-Item -Path "$source\scripts\server.js" -Destination "D:\Publish\MySelf-App\server.js" -Force
Copy-Item -Path "$source\scripts\start.bat" -Destination "D:\Publish\MySelf-App\start.bat" -Force
Write-Host "server.js -> D:\Publish\MySelf-App\server.js"
Write-Host "start.bat -> D:\Publish\MySelf-App\start.bat"

Write-Host ""
Write-Host "Publish completed successfully."
Write-Host ""
Write-Host "Start server:  node D:\Publish\MySelf-App\server.js"
exit 0
