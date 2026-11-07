Add-Type -AssemblyName PresentationCore, WindowsBase, System.Drawing

$src512 = "C:\Users\Administrator\.gemini\antigravity\brain\46f6dd90-3528-4785-a86c-9f767ff7e68d\.user_uploaded\media_1794011038266_0c042b0e.webp"
$src192 = "C:\Users\Administrator\.gemini\antigravity\brain\46f6dd90-3528-4785-a86c-9f767ff7e68d\.user_uploaded\media_1794011038265_206bd60b.webp"
$src96  = "C:\Users\Administrator\.gemini\antigravity\brain\46f6dd90-3528-4785-a86c-9f767ff7e68d\.user_uploaded\media_1794011038181_9c88af7f.webp"

$decoder512 = [System.Windows.Media.Imaging.BitmapDecoder]::Create((New-Object System.Uri($src512)), [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::Default)
$frame512 = $decoder512.Frames[0]

function Save-PngResized {
    param(
        [System.Windows.Media.Imaging.BitmapSource]$Source,
        [int]$TargetWidth,
        [int]$TargetHeight,
        [string]$DestinationPath
    )
    $dir = [System.IO.Path]::GetDirectoryName($DestinationPath)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }

    $scaleX = [double]$TargetWidth / $Source.PixelWidth
    $scaleY = [double]$TargetHeight / $Source.PixelHeight
    $transformed = New-Object System.Windows.Media.Imaging.TransformedBitmap($Source, (New-Object System.Windows.Media.ScaleTransform($scaleX, $scaleY)))

    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($transformed))
    $fs = [System.IO.File]::Create($DestinationPath)
    $encoder.Save($fs)
    $fs.Close()
    Write-Output "Created PNG: $DestinationPath ($TargetWidth x $TargetHeight)"
}

function Save-ForegroundAdaptive {
    param(
        [System.Windows.Media.Imaging.BitmapSource]$Source,
        [int]$CanvasSize,
        [string]$DestinationPath
    )
    $dir = [System.IO.Path]::GetDirectoryName($DestinationPath)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }

    $logoSize = [int]($CanvasSize * 0.72)
    $offset = [int](($CanvasSize - $logoSize) / 2)

    $visual = New-Object System.Windows.Media.DrawingVisual
    $dc = $visual.RenderOpen()
    $dc.DrawImage($Source, (New-Object System.Windows.Rect($offset, $offset, $logoSize, $logoSize)))
    $dc.Close()

    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($CanvasSize, $CanvasSize, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual)

    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
    $fs = [System.IO.File]::Create($DestinationPath)
    $encoder.Save($fs)
    $fs.Close()
    Write-Output "Created Adaptive Foreground: $DestinationPath ($CanvasSize x $CanvasSize)"
}

function Save-SplashScreen {
    param(
        [System.Windows.Media.Imaging.BitmapSource]$Source,
        [int]$Width,
        [int]$Height,
        [string]$DestinationPath
    )
    $dir = [System.IO.Path]::GetDirectoryName($DestinationPath)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }

    $visual = New-Object System.Windows.Media.DrawingVisual
    $dc = $visual.RenderOpen()
    # Draw pure black background
    $dc.DrawRectangle([System.Windows.Media.Brushes]::Black, $null, (New-Object System.Windows.Rect(0, 0, $Width, $Height)))

    # Draw centered logo
    $logoSize = [Math]::Min($Width, $Height) * 0.45
    $x = ($Width - $logoSize) / 2
    $y = ($Height - $logoSize) / 2
    $dc.DrawImage($Source, (New-Object System.Windows.Rect($x, $y, $logoSize, $logoSize)))
    $dc.Close()

    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($Width, $Height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual)

    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
    $fs = [System.IO.File]::Create($DestinationPath)
    $encoder.Save($fs)
    $fs.Close()
    Write-Output "Created Splash: $DestinationPath ($Width x $Height)"
}

function Save-Ico {
    param(
        [string]$Png32Path,
        [string]$DestinationIcoPath
    )
    $bmp = New-Object System.Drawing.Bitmap($Png32Path)
    $hIcon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fs = [System.IO.File]::Create($DestinationIcoPath)
    $icon.Save($fs)
    $fs.Close()
    $icon.Dispose()
    $bmp.Dispose()
    Write-Output "Created ICO: $DestinationIcoPath"
}

# 1. Copy WebP sources to all relevant locations
$webpTargets512 = @(
    "f:\TuzlaTourApp\resources\TuzlaTourGuideIcon512x512.webp",
    "f:\TuzlaTourApp\resources\icon.webp",
    "f:\TuzlaTourApp\public\resources\TuzlaTourGuideIcon512x512.webp",
    "f:\TuzlaTourApp\public\resources\icon.webp",
    "f:\TuzlaTourApp\public\assets\icons\TuzlaTourGuideIcon512x512.webp",
    "f:\TuzlaTourApp\public\assets\icons\Tuzlacrestsaturation.webp",
    "f:\TuzlaTourApp\public\assets\TZGoldlogo.webp",
    "f:\TuzlaTourApp\public\assets\Gallery\ilovebos.webp"
)
foreach ($t in $webpTargets512) {
    $dir = [System.IO.Path]::GetDirectoryName($t)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }
    Copy-Item -Path $src512 -Destination $t -Force
    Write-Output "Copied 512 WebP -> $t"
}

$webpTargets192 = @(
    "f:\TuzlaTourApp\resources\TuzlaTourGuideIcon192x192.webp",
    "f:\TuzlaTourApp\public\resources\TuzlaTourGuideIcon192x192.webp",
    "f:\TuzlaTourApp\public\assets\icons\TuzlaTourGuideIcon192x192.webp"
)
foreach ($t in $webpTargets192) {
    $dir = [System.IO.Path]::GetDirectoryName($t)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }
    Copy-Item -Path $src192 -Destination $t -Force
    Write-Output "Copied 192 WebP -> $t"
}

$webpTargets96 = @(
    "f:\TuzlaTourApp\resources\TuzlaTourGuideIcon96x96.webp",
    "f:\TuzlaTourApp\public\resources\TuzlaTourGuideIcon96x96.webp",
    "f:\TuzlaTourApp\public\assets\icons\TuzlaTourGuideIcon96x96.webp",
    "f:\TuzlaTourApp\public\assets\TZGoldlogo90x90.webp"
)
foreach ($t in $webpTargets96) {
    $dir = [System.IO.Path]::GetDirectoryName($t)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }
    Copy-Item -Path $src96 -Destination $t -Force
    Write-Output "Copied 96 WebP -> $t"
}

# 2. Generate PNGs across web and resources
Save-PngResized -Source $frame512 -TargetWidth 512 -TargetHeight 512 -DestinationPath "f:\TuzlaTourApp\resources\TuzlaTourAppLogo512x512.png"
Save-PngResized -Source $frame512 -TargetWidth 512 -TargetHeight 512 -DestinationPath "f:\TuzlaTourApp\public\resources\TuzlaTourAppLogo512x512.png"
Save-PngResized -Source $frame512 -TargetWidth 512 -TargetHeight 512 -DestinationPath "f:\TuzlaTourApp\public\assets\icons\icon-512x512.png"
Save-PngResized -Source $frame512 -TargetWidth 512 -TargetHeight 512 -DestinationPath "f:\TuzlaTourApp\public\assets\icons\TuzlaTourGuideIcon.png"
Save-PngResized -Source $frame512 -TargetWidth 512 -TargetHeight 512 -DestinationPath "f:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\TuzlaMenuLogo.png"

Save-PngResized -Source $frame512 -TargetWidth 384 -TargetHeight 384 -DestinationPath "f:\TuzlaTourApp\public\assets\icons\icon-384x384.png"
Save-PngResized -Source $frame512 -TargetWidth 350 -TargetHeight 350 -DestinationPath "f:\TuzlaTourApp\resources\TuzlaTourAppLogo350x350.png"
Save-PngResized -Source $frame512 -TargetWidth 350 -TargetHeight 350 -DestinationPath "f:\TuzlaTourApp\public\resources\TuzlaTourAppLogo350x350.png"

Save-PngResized -Source $frame512 -TargetWidth 192 -TargetHeight 192 -DestinationPath "f:\TuzlaTourApp\resources\TuzlaTourAppLogo192x192.png"
Save-PngResized -Source $frame512 -TargetWidth 192 -TargetHeight 192 -DestinationPath "f:\TuzlaTourApp\public\resources\TuzlaTourAppLogo192x192.png"
Save-PngResized -Source $frame512 -TargetWidth 192 -TargetHeight 192 -DestinationPath "f:\TuzlaTourApp\public\assets\icons\icon-192x192.png"

Save-PngResized -Source $frame512 -TargetWidth 96 -TargetHeight 96 -DestinationPath "f:\TuzlaTourApp\resources\TuzlaTourAppLogo96x96.png"
Save-PngResized -Source $frame512 -TargetWidth 96 -TargetHeight 96 -DestinationPath "f:\TuzlaTourApp\public\resources\TuzlaTourAppLogo96x96.png"
Save-PngResized -Source $frame512 -TargetWidth 96 -TargetHeight 96 -DestinationPath "f:\TuzlaTourApp\public\assets\icons\icon-96x96.png"

Save-PngResized -Source $frame512 -TargetWidth 48 -TargetHeight 48 -DestinationPath "f:\TuzlaTourApp\public\favicon.png"
Save-PngResized -Source $frame512 -TargetWidth 32 -TargetHeight 32 -DestinationPath "f:\TuzlaTourApp\public\favicon-32.png"
Save-Ico -Png32Path "f:\TuzlaTourApp\public\favicon-32.png" -DestinationIcoPath "f:\TuzlaTourApp\public\favicon.ico"
Remove-Item "f:\TuzlaTourApp\public\favicon-32.png" -Force

# 3. Android Mipmap App Icons
$androidMipmaps = @(
    @{ Folder = "mipmap-mdpi"; Size = 48; FgSize = 108 },
    @{ Folder = "mipmap-hdpi"; Size = 72; FgSize = 162 },
    @{ Folder = "mipmap-xhdpi"; Size = 96; FgSize = 216 },
    @{ Folder = "mipmap-xxhdpi"; Size = 144; FgSize = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($m in $androidMipmaps) {
    $folderPath = "f:\TuzlaTourApp\android\app\src\main\res\$($m.Folder)"
    Save-PngResized -Source $frame512 -TargetWidth $m.Size -TargetHeight $m.Size -DestinationPath "$folderPath\ic_launcher.png"
    Save-PngResized -Source $frame512 -TargetWidth $m.Size -TargetHeight $m.Size -DestinationPath "$folderPath\ic_launcher_round.png"
    Save-ForegroundAdaptive -Source $frame512 -CanvasSize $m.FgSize -DestinationPath "$folderPath\ic_launcher_foreground.png"
}

# 4. Android Splash Screens
$splashScreens = @(
    @{ Path = "drawable\splash.png"; W = 480; H = 320 },
    @{ Path = "drawable-land-mdpi\splash.png"; W = 480; H = 320 },
    @{ Path = "drawable-land-hdpi\splash.png"; W = 800; H = 480 },
    @{ Path = "drawable-land-xhdpi\splash.png"; W = 1280; H = 720 },
    @{ Path = "drawable-land-xxhdpi\splash.png"; W = 1600; H = 960 },
    @{ Path = "drawable-land-xxxhdpi\splash.png"; W = 1920; H = 1280 },
    @{ Path = "drawable-port-mdpi\splash.png"; W = 320; H = 480 },
    @{ Path = "drawable-port-hdpi\splash.png"; W = 480; H = 800 },
    @{ Path = "drawable-port-xhdpi\splash.png"; W = 720; H = 1280 },
    @{ Path = "drawable-port-xxhdpi\splash.png"; W = 960; H = 1600 },
    @{ Path = "drawable-port-xxxhdpi\splash.png"; W = 1280; H = 1920 }
)

foreach ($s in $splashScreens) {
    Save-SplashScreen -Source $frame512 -Width $s.W -Height $s.H -DestinationPath "f:\TuzlaTourApp\android\app\src\main\res\$($s.Path)"
}

Write-Output "ALL ICONS AND LOGOS GENERATED SUCCESSFULLY!"

