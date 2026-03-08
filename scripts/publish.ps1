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
$proc = Start-Process -FilePath "robocopy.exe" -ArgumentList "$source","$dest","/MIR","/XD",".git","node_modules",".qoder","scripts","novel","/XF","*.zip",".gitignore","package.json","package-lock.json" -NoNewWindow -Wait -PassThru
Write-Host "App sync exit code: $($proc.ExitCode)"
if ($proc.ExitCode -gt 3) {
    Write-Host "App sync failed with errors."
    exit 1
}

Write-Host ""
Write-Host "Publish completed successfully."
exit 0
