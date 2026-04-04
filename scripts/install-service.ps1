# install-service.ps1 - 观己小说 API 服务安装/管理脚本
# 使用 NSSM (Non-Sucking Service Manager) 将 Node.js API 注册为 Windows 后台服务
#
# 用法:
#   .\install-service.ps1 install   - 安装并启动服务
#   .\install-service.ps1 uninstall - 停止并卸载服务
#   .\install-service.ps1 restart   - 重启服务
#   .\install-service.ps1 status    - 查看服务状态

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "uninstall", "restart", "status")]
    [string]$Action = "install"
)

# ============ 配置 ============

$ServiceName = "GuanJiNovelAPI"
$ServiceDisplayName = "观己书籍API服务"
$ServiceDescription = "观己应用后台API服务，提供书籍数据同步、古籍阅读、TTS语音等接口"
$ServicePort = 80
$NodeExe = "C:\Program Files\nodejs\node.exe"
$ServerScript = "D:\Publish\MySelf-App\server.js"
$NssmDir = "D:\Publish\MySelf-App\tools"
$NssmExe = "$NssmDir\nssm.exe"
$NssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$LogDir = "D:\Publish\MySelf-App\logs"

# ============ 工具函数 ============

function Write-Info($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "  [ OK ] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }

function Ensure-NSSM {
    if (Test-Path $NssmExe) {
        Write-Info "NSSM 已存在: $NssmExe"
        return $true
    }

    Write-Info "正在下载 NSSM..."
    $zipPath = "$env:TEMP\nssm.zip"
    $extractPath = "$env:TEMP\nssm-extract"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $NssmUrl -OutFile $zipPath -UseBasicParsing
        
        if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

        # 找到 win64 版本的 nssm.exe
        $nssmBin = Get-ChildItem -Path $extractPath -Recurse -Filter "nssm.exe" | 
                   Where-Object { $_.DirectoryName -like "*win64*" } | 
                   Select-Object -First 1

        if (-not $nssmBin) {
            # 退而求其次找 win32
            $nssmBin = Get-ChildItem -Path $extractPath -Recurse -Filter "nssm.exe" | 
                       Select-Object -First 1
        }

        if (-not $nssmBin) {
            Write-Err "解压后未找到 nssm.exe"
            return $false
        }

        if (-not (Test-Path $NssmDir)) { New-Item -Path $NssmDir -ItemType Directory -Force | Out-Null }
        Copy-Item $nssmBin.FullName -Destination $NssmExe -Force

        # 清理临时文件
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
        Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue

        Write-OK "NSSM 下载完成: $NssmExe"
        return $true
    }
    catch {
        Write-Err "NSSM 下载失败: $($_.Exception.Message)"
        Write-Warn "请手动下载 NSSM: https://nssm.cc/download"
        Write-Warn "将 nssm.exe 放到: $NssmDir"
        return $false
    }
}

# ============ 安装服务 ============

function Install-Service {
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor White
    Write-Host "  观己小说 API 服务安装" -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor White
    Write-Host ""

    # 检查 Node.js
    if (-not (Test-Path $NodeExe)) {
        Write-Err "未找到 Node.js: $NodeExe"
        Write-Warn "请先安装 Node.js: https://nodejs.org/"
        return
    }
    Write-OK "Node.js: $NodeExe"

    # 检查 server.js
    if (-not (Test-Path $ServerScript)) {
        Write-Err "未找到 server.js: $ServerScript"
        Write-Warn "请先运行 publish.ps1 发布应用"
        return
    }
    Write-OK "server.js: $ServerScript"

    # 确保 NSSM 可用
    if (-not (Ensure-NSSM)) { return }

    # 创建日志目录
    if (-not (Test-Path $LogDir)) { 
        New-Item -Path $LogDir -ItemType Directory -Force | Out-Null 
    }

    # 检查服务是否已存在
    $existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Warn "服务 $ServiceName 已存在 (状态: $($existingService.Status))"
        Write-Info "正在停止并移除旧服务..."
        & $NssmExe stop $ServiceName 2>$null
        Start-Sleep -Seconds 2
        & $NssmExe remove $ServiceName confirm 2>$null
        Start-Sleep -Seconds 1
    }

    # 安装服务
    Write-Info "正在注册 Windows 服务..."
    & $NssmExe install $ServiceName $NodeExe $ServerScript $ServicePort
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err "服务注册失败 (exit code: $LASTEXITCODE)"
        Write-Warn "请以管理员身份运行此脚本"
        return
    }

    # 配置服务属性
    & $NssmExe set $ServiceName DisplayName $ServiceDisplayName
    & $NssmExe set $ServiceName Description $ServiceDescription
    & $NssmExe set $ServiceName Start SERVICE_AUTO_START
    & $NssmExe set $ServiceName AppStdout "$LogDir\novel-api-stdout.log"
    & $NssmExe set $ServiceName AppStderr "$LogDir\novel-api-stderr.log"
    & $NssmExe set $ServiceName AppStdoutCreationDisposition 4
    & $NssmExe set $ServiceName AppStderrCreationDisposition 4
    & $NssmExe set $ServiceName AppRotateFiles 1
    & $NssmExe set $ServiceName AppRotateBytes 1048576
    & $NssmExe set $ServiceName AppDirectory "D:\Publish\MySelf-App"

    # 启动服务
    Write-Info "正在启动服务..."
    & $NssmExe start $ServiceName

    Start-Sleep -Seconds 2

    # 验证
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq 'Running') {
        Write-OK "服务已启动"
        Write-Host ""
        Write-Host "  服务名称: $ServiceName" -ForegroundColor White
        Write-Host "  API 地址: http://localhost:$ServicePort/api/novel/refresh" -ForegroundColor White
        Write-Host "  日志目录: $LogDir" -ForegroundColor White
        Write-Host ""

        # 测试 API 是否响应
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$ServicePort/api/novel/refresh" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-OK "API 端点响应正常 (HTTP 200)"
            }
        }
        catch {
            Write-Warn "API 端点暂未响应，服务可能正在初始化..."
        }
    }
    else {
        Write-Err "服务启动失败"
        Write-Warn "请检查日志: $LogDir"
        Write-Warn "或手动运行测试: node $ServerScript $ServicePort"
    }
}

# ============ 卸载服务 ============

function Uninstall-Service {
    Write-Host ""
    Write-Info "正在卸载服务 $ServiceName..."
    
    if (-not (Test-Path $NssmExe)) {
        Write-Err "未找到 NSSM: $NssmExe"
        return
    }

    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Warn "服务 $ServiceName 不存在"
        return
    }

    & $NssmExe stop $ServiceName
    Start-Sleep -Seconds 2
    & $NssmExe remove $ServiceName confirm

    Write-OK "服务已卸载"
}

# ============ 重启服务 ============

function Restart-ServiceCmd {
    Write-Host ""
    Write-Info "正在重启服务 $ServiceName..."
    
    if (-not (Test-Path $NssmExe)) {
        Write-Err "未找到 NSSM: $NssmExe"
        return
    }

    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Warn "服务 $ServiceName 不存在，请先安装"
        return
    }

    & $NssmExe restart $ServiceName
    Start-Sleep -Seconds 2
    
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq 'Running') {
        Write-OK "服务已重启"
    }
    else {
        Write-Err "重启失败，请检查日志: $LogDir"
    }
}

# ============ 查看状态 ============

function Show-Status {
    Write-Host ""
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Warn "服务 $ServiceName 未安装"
        return
    }

    Write-Host "  服务名称: $ServiceName" -ForegroundColor White
    Write-Host "  显示名称: $ServiceDisplayName" -ForegroundColor White

    switch ($svc.Status) {
        'Running'  { Write-OK   "状态: 运行中" }
        'Stopped'  { Write-Warn "状态: 已停止" }
        default    { Write-Info "状态: $($svc.Status)" }
    }

    # 尝试请求 API
    if ($svc.Status -eq 'Running') {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$ServicePort/api/novel/refresh" -UseBasicParsing -TimeoutSec 5
            Write-OK "API 响应: HTTP $($response.StatusCode)"
        }
        catch {
            Write-Warn "API 无法访问"
        }
    }
    Write-Host ""
}

# ============ 主入口 ============

switch ($Action) {
    "install"   { Install-Service }
    "uninstall" { Uninstall-Service }
    "restart"   { Restart-ServiceCmd }
    "status"    { Show-Status }
}
