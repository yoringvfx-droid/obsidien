$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$width = 1600
$height = 1200
$outputPath = "C:\Users\AD01770003\Documents\Obsidian Vault\Projects\translated_vfx_color_kr.png"

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = [System.Drawing.Color]::FromArgb(32, 32, 34)
$gridMinor = [System.Drawing.Color]::FromArgb(48, 48, 50)
$gridMajor = [System.Drawing.Color]::FromArgb(70, 70, 74)
$white = [System.Drawing.Brushes]::White
$soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 235, 235))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 210, 210))
$yellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 240, 100))
$green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(106, 232, 161))
$blue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(110, 103, 255))

$g.Clear($bg)

for ($x = 0; $x -lt $width; $x += 16) {
    $pen = if ($x % 80 -eq 0) { New-Object System.Drawing.Pen($gridMajor, 1) } else { New-Object System.Drawing.Pen($gridMinor, 1) }
    $g.DrawLine($pen, $x, 0, $x, $height)
    $pen.Dispose()
}
for ($y = 0; $y -lt $height; $y += 16) {
    $pen = if ($y % 80 -eq 0) { New-Object System.Drawing.Pen($gridMajor, 1) } else { New-Object System.Drawing.Pen($gridMinor, 1) }
    $g.DrawLine($pen, 0, $y, $width, $y)
    $pen.Dispose()
}

$fontTitle = New-Object System.Drawing.Font("Malgun Gothic", 34, [System.Drawing.FontStyle]::Bold)
$fontSection = New-Object System.Drawing.Font("Malgun Gothic", 22, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Malgun Gothic", 13, [System.Drawing.FontStyle]::Regular)
$fontBodyBold = New-Object System.Drawing.Font("Malgun Gothic", 15, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Malgun Gothic", 11, [System.Drawing.FontStyle]::Regular)
$fontSmallBold = New-Object System.Drawing.Font("Malgun Gothic", 12, [System.Drawing.FontStyle]::Bold)
$fontBig = New-Object System.Drawing.Font("Malgun Gothic", 30, [System.Drawing.FontStyle]::Bold)

$sf = New-Object System.Drawing.StringFormat
$sf.Trimming = [System.Drawing.StringTrimming]::Word

$S = ConvertFrom-Json @'
{
  "title":"\uD2B9\uC218\uD6A8\uACFC \uC0C9\uCC44 \uBC30\uD569",
  "watermark":"\uD6A8\uACFC \uC5F0\uCD9C \uD575\uC2EC \uC815\uB9AC",
  "sec1":"1. \uC0C9\uC744 \uC5B4\uB5BB\uAC8C \uACE0\uB97C\uAE4C",
  "p1":"\uB9CE\uC740 \uC774\uD399\uD2B8 \uD29C\uD1A0\uB9AC\uC5BC\uC740 \uC0C9\uC744 \uC124\uBA85\uD560 \uB54C \uC778\uC811\uC0C9, \uB300\uBE44\uC0C9, \uBCF4\uC0C9 \uAC19\uC740 \uAE30\uBCF8 \uC6D0\uB9AC\uB9CC \uBC18\uBCF5\uD574\uC11C \uC18C\uAC1C\uD569\uB2C8\uB2E4. \uD558\uC9C0\uB9CC \uADF8\uAC83\uB4E4\uC740 \uC5B4\uB514\uAE4C\uC9C0\uB098 \uC6D0\uB9AC\uC77C \uBFD0\uC774\uACE0, \uC2E4\uC81C \uC801\uC6A9\uC740 \uAC01\uC790\uC758 \uC774\uD574\uC640 \uD574\uC11D\uC774 \uC911\uC694\uD569\uB2C8\uB2E4.",
  "site":"\uC0C9\uC0C1 \uC0AC\uC774\uD2B8  https://www.csnpc.com/color-scheme-designer/",
  "lum":"\uC0C9\uC758 \uBA85\uB3C4",
  "sec2":"2. \uC5B4\uB5BB\uAC8C \uBC30\uC0C9\uD560\uAE4C",
  "rule1":"1. \uAE30\uBCF8\uC801\uC774\uBA74\uC11C \uD6A8\uACFC\uAC00 \uC798 \uB098\uB294 \uBC29\uC2DD: \uC778\uC811\uC0C9 \uD55C \uC138\uD2B8 + \uB300\uBE44\uC0C9 \uD558\uB098",
  "ratio":"2. \uC0C9 \uBE44\uC728",
  "contrast":"3. \uC21C\uD68C\uC0C9, \uBA85\uC554 \uB300\uBE44",
  "contrastNote":"*\uC774\uD399\uD2B8\uC758 \uD22C\uBA85\uB3C4 \uBCC0\uD654\uC640 \uC804\uD6C4 \uC0C9 \uBCC0\uD654\uAC00 \uD568\uAED8 \uC77C\uC5B4\uB098\uB294 \uC9C0\uC810\uC744 \uCD94\uAC00\uB85C \uC2E0\uACBD \uC4F0\uAE30",
  "sec3":"3. \uBC30\uC0C9\uC744 \uD48D\uBD80\uD558\uAC8C \uD558\uB294 \uBC29\uBC95",
  "reduce":"1. \uAC10\uC0C9    \uD575\uC2EC: \uD751\uBC31 \uAD00\uACC4\uAC00 \uBE44\uC2B7\uD574\uC57C \uD568",
  "grad":"2. \uADF8\uB77C\uB370\uC774\uC158    \uD575\uC2EC: '\uC8FD\uC740 \uAD6C\uAC04' \uD53C\uD558\uAE30",
  "detail":"3. \uB514\uD14C\uC77C\uC5D0 \uC0C9 \uCC44\uC6CC \uB123\uAE30",
  "easy":"\uAC04\uD3B8\uD558\uBA74\uC11C\uB3C4 \uD6A8\uACFC\uC801",
  "sec4":"4. \uD654\uBA74 \uC0C9\uC744 \uC2A4\uC2A4\uB85C \uC810\uAC80\uD558\uB294 \uBC29\uBC95",
  "bw":"1. \uD751\uBC31",
  "bwNote":"\uC0C9\uC774 \uB108\uBB34 \uBCF5\uC7A1\uD568 / \uC0C9\uC774 \uB108\uBB34 \uD0C1\uD568",
  "gray":"2. \uC21C\uD68C\uC0C9",
  "grayNote":"\uC0C9\uC774 \uB5A0 \uBCF4\uC784 / \uC0C9\uC774 \uB108\uBB34 \uACFC\uD568",
  "ok":"\u2713",
  "no":"\u2715"
}
'@

function Draw-WrappedText {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height
    )
    $rect = New-Object System.Drawing.RectangleF($X, $Y, $Width, $Height)
    $Graphics.DrawString($Text, $Font, $Brush, $rect, $sf)
}

function Draw-GradientBar {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [System.Drawing.Color[]]$Colors
    )
    $segment = $W / $Colors.Count
    for ($i = 0; $i -lt $Colors.Count; $i++) {
        $brush = New-Object System.Drawing.SolidBrush($Colors[$i])
        $Graphics.FillRectangle($brush, $X + ($segment * $i), $Y, [Math]::Ceiling($segment), $H)
        $brush.Dispose()
    }
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220,220,220), 1)
    $Graphics.DrawRectangle($pen, $X, $Y, $W, $H)
    $pen.Dispose()
}

function Draw-Placeholder {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [System.Drawing.Color]$C1,
        [System.Drawing.Color]$C2
    )
    $rect = New-Object System.Drawing.RectangleF($X, $Y, $W, $H)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $C1, $C2, 35)
    $Graphics.FillRectangle($brush, $X, $Y, $W, $H)
    $brush.Dispose()
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230,230,230), 1)
    $Graphics.DrawRectangle($pen, $X, $Y, $W, $H)
    $pen.Dispose()
}

function Draw-LabelBox {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [string]$Text
    )
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 8, 8, 10))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 235, 235, 235), 1)
    $Graphics.FillRectangle($brush, $X, $Y, $W, $H)
    $Graphics.DrawRectangle($pen, $X, $Y, $W, $H)
    $Graphics.DrawString($Text, $fontSmallBold, $white, ($X + 10), ($Y + 6))
    $brush.Dispose()
    $pen.Dispose()
}

$g.DrawString($S.title, $fontTitle, $white, 34, 24)

$wmBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
$wmFont = New-Object System.Drawing.Font("Malgun Gothic", 84, [System.Drawing.FontStyle]::Bold)
$state = $g.Save()
$g.TranslateTransform(230, 860)
$g.RotateTransform(-8)
$g.DrawString($S.watermark, $wmFont, $wmBrush, 0, 0)
$g.Restore($state)

$leftX = 70
$rightX = 710

$g.DrawString($S.sec1, $fontSection, $white, $leftX, 170)
$p1 = $S.p1
Draw-WrappedText $g $p1 $fontBody $soft ($leftX + 10) 228 500 96
$g.DrawString($S.site, $fontBodyBold, $soft, ($leftX + 10), 318)
$g.DrawString($S.lum, $fontBodyBold, $white, ($leftX + 10), 386)
Draw-Placeholder $g 120 428 190 170 ([System.Drawing.Color]::FromArgb(245,245,245)) ([System.Drawing.Color]::FromArgb(120,120,120))
Draw-GradientBar $g 118 606 210 20 @(
    [System.Drawing.Color]::FromArgb(255,82,82),
    [System.Drawing.Color]::FromArgb(255,196,65),
    [System.Drawing.Color]::FromArgb(98,232,150),
    [System.Drawing.Color]::FromArgb(61,201,255),
    [System.Drawing.Color]::FromArgb(162,101,255)
)

$g.DrawString($S.sec2, $fontSection, $white, $leftX, 680)
$g.DrawString($S.rule1, $fontBodyBold, $white, ($leftX + 10), 738)
Draw-Placeholder $g 122 800 230 140 ([System.Drawing.Color]::FromArgb(255,245,160)) ([System.Drawing.Color]::FromArgb(120,120,255))
Draw-Placeholder $g 380 800 215 140 ([System.Drawing.Color]::FromArgb(160,70,110)) ([System.Drawing.Color]::FromArgb(245,170,60))
Draw-GradientBar $g 122 966 230 24 @(
    [System.Drawing.Color]::FromArgb(255,248,100),
    [System.Drawing.Color]::FromArgb(106,232,184),
    [System.Drawing.Color]::FromArgb(106,103,255)
)

$g.DrawString($S.ratio, $fontBodyBold, $white, ($leftX + 10), 1036)
Draw-GradientBar $g 122 1084 230 24 @(
    [System.Drawing.Color]::FromArgb(255,248,100),
    [System.Drawing.Color]::FromArgb(106,232,184),
    [System.Drawing.Color]::FromArgb(106,103,255),
    [System.Drawing.Color]::FromArgb(106,103,255)
)
Draw-GradientBar $g 382 1084 230 24 @(
    [System.Drawing.Color]::FromArgb(255,248,100),
    [System.Drawing.Color]::FromArgb(106,232,184),
    [System.Drawing.Color]::FromArgb(106,232,184),
    [System.Drawing.Color]::FromArgb(106,103,255)
)

$g.DrawString($S.contrast, $fontBodyBold, $white, ($leftX + 10), 1128)
Draw-WrappedText $g $S.contrastNote $fontSmall $muted 122 1160 510 30

$g.DrawString($S.sec3, $fontSection, $white, $rightX, 170)
$g.DrawString($S.reduce, $fontBodyBold, $white, ($rightX + 10), 226)
$thumbY = 276
foreach ($i in 0..4) {
    $cx = $rightX + 14 + ($i * 140)
    Draw-Placeholder $g $cx $thumbY 118 76 ([System.Drawing.Color]::FromArgb((120 + $i*20),80,255)) ([System.Drawing.Color]::FromArgb(255,(100 + $i*10),180))
}

$g.DrawString($S.grad, $fontBodyBold, $white, ($rightX + 10), 384)
Draw-Placeholder $g ($rightX + 18) 430 130 140 ([System.Drawing.Color]::FromArgb(118,93,255)) ([System.Drawing.Color]::FromArgb(255,90,190))
Draw-GradientBar $g ($rightX + 182) 430 230 24 @(
    [System.Drawing.Color]::FromArgb(255,246,106),
    [System.Drawing.Color]::FromArgb(255,247,106),
    [System.Drawing.Color]::FromArgb(92,78,255),
    [System.Drawing.Color]::FromArgb(92,78,255)
)
Draw-GradientBar $g ($rightX + 182) 485 230 24 @(
    [System.Drawing.Color]::FromArgb(255,246,106),
    [System.Drawing.Color]::FromArgb(255,247,106),
    [System.Drawing.Color]::FromArgb(163,175,120),
    [System.Drawing.Color]::FromArgb(92,78,255)
)
Draw-GradientBar $g ($rightX + 182) 540 230 24 @(
    [System.Drawing.Color]::FromArgb(255,246,106),
    [System.Drawing.Color]::FromArgb(105,255,140),
    [System.Drawing.Color]::FromArgb(48,180,255),
    [System.Drawing.Color]::FromArgb(62,71,255)
)
Draw-GradientBar $g ($rightX + 182) 595 230 24 @(
    [System.Drawing.Color]::FromArgb(255,246,106),
    [System.Drawing.Color]::FromArgb(255,160,110),
    [System.Drawing.Color]::FromArgb(235,42,210),
    [System.Drawing.Color]::FromArgb(62,71,255)
)

$g.DrawString($S.detail, $fontBodyBold, $white, ($rightX + 10), 650)
Draw-Placeholder $g ($rightX + 18) 694 135 115 ([System.Drawing.Color]::FromArgb(60,70,120)) ([System.Drawing.Color]::FromArgb(130,160,255))
Draw-Placeholder $g ($rightX + 160) 694 135 115 ([System.Drawing.Color]::FromArgb(70,30,120)) ([System.Drawing.Color]::FromArgb(255,90,220))
$g.DrawString($S.easy, $fontBig, $white, ($rightX + 360), 742)

$g.DrawString($S.sec4, $fontSection, $white, $rightX, 855)
$g.DrawString($S.bw, $fontBodyBold, $white, ($rightX + 10), 915)
$g.DrawString($S.bwNote, $fontSmallBold, $white, ($rightX + 24), 950)
$g.DrawString($S.gray, $fontBodyBold, $white, ($rightX + 10), 993)
$g.DrawString($S.grayNote, $fontSmallBold, $white, ($rightX + 24), 1028)

$greenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(124,255,124), 3)
$redPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255,132,132), 3)
$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,132,132))
$g.DrawRectangle($greenPen, ($rightX + 192), 900, 540, 88)
$g.DrawRectangle($redPen, ($rightX + 192), 995, 540, 66)

foreach ($i in 0..3) {
    Draw-Placeholder $g ($rightX + 198 + ($i * 132)) 906 120 76 ([System.Drawing.Color]::FromArgb(255,70,190)) ([System.Drawing.Color]::FromArgb(80,180,255))
}
foreach ($i in 0..3) {
    Draw-Placeholder $g ($rightX + 198 + ($i * 132)) 1001 120 54 ([System.Drawing.Color]::FromArgb(255,255,255)) ([System.Drawing.Color]::FromArgb(210,210,210))
}
Draw-LabelBox $g ($rightX + 206) 961 185 28 $S.bwNote
Draw-LabelBox $g ($rightX + 206) 1031 170 28 $S.grayNote
$g.DrawString($S.ok, $fontBig, $green, ($rightX + 204), 894)
$g.DrawString($S.no, $fontBig, $redBrush, ($rightX + 204), 989)

$g.DrawRectangle($redPen, ($rightX + 52), 1088, 760, 116)
foreach ($i in 0..4) {
    Draw-Placeholder $g ($rightX + 62 + ($i * 148)) 1098 132 96 ([System.Drawing.Color]::FromArgb((255 - $i*20),120,40)) ([System.Drawing.Color]::FromArgb(30,220,(120 + $i*20)))
}

$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$fontTitle.Dispose()
$fontSection.Dispose()
$fontBody.Dispose()
$fontBodyBold.Dispose()
$fontSmall.Dispose()
$fontSmallBold.Dispose()
$fontBig.Dispose()
$wmFont.Dispose()
$wmBrush.Dispose()
$soft.Dispose()
$muted.Dispose()
$yellow.Dispose()
$green.Dispose()
$blue.Dispose()
$greenPen.Dispose()
$redPen.Dispose()
$redBrush.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Output $outputPath
