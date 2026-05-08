param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile($inputPath)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)

$titleFont = New-Object System.Drawing.Font("Malgun Gothic", 30, [System.Drawing.FontStyle]::Bold)
$sectionFont = New-Object System.Drawing.Font("Malgun Gothic", 18, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font("Malgun Gothic", 10, [System.Drawing.FontStyle]::Regular)
$bodyBold = New-Object System.Drawing.Font("Malgun Gothic", 12, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font("Malgun Gothic", 9, [System.Drawing.FontStyle]::Regular)
$sloganFont = New-Object System.Drawing.Font("Malgun Gothic", 26, [System.Drawing.FontStyle]::Bold)

$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245,245,245))
$soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(228,228,228))
$shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120,0,0,0))
$cover = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 8, 8, 8))
$coverSoft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 8, 8, 8))
$outlineGreen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100,124,255,124), 1)
$outlineRed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100,255,132,132), 1)

$sf = New-Object System.Drawing.StringFormat
$sf.Trimming = [System.Drawing.StringTrimming]::Word

$S = ConvertFrom-Json @'
{
  "title":"\uD2B9\uC218\uD6A8\uACFC \uC0C9\uCC44\uBC30\uD569",
  "sec1":"1. \uC0C9\uC744 \uC5B4\uB5BB\uAC8C \uACE0\uB97C\uAE4C",
  "p1":"\uB9CE\uC740 \uC774\uD399\uD2B8 \uD29C\uD1A0\uB9AC\uC5BC\uC740 \uBC30\uC0C9\uC744 \uC124\uBA85\uD560 \uB54C \uC778\uC811\uC0C9, \uB300\uBE44\uC0C9, \uBCF4\uC0C9 \uAC19\uC740 \uC6D0\uB9AC\uB9CC \uAC15\uC870\uD569\uB2C8\uB2E4. \uD558\uC9C0\uB9CC \uADF8\uAC83\uC740 \uAE30\uBCF8 \uC6D0\uCE59\uC77C \uBFD0\uC774\uACE0, \uC2E4\uC81C \uC801\uC6A9\uC740 \uAC01\uC790\uC758 \uC774\uD574\uC640 \uD574\uC11D\uC774 \uC911\uC694\uD569\uB2C8\uB2E4.",
  "site":"\uBC30\uC0C9 \uC0AC\uC774\uD2B8  https://www.csnpc.com/color-scheme-designer/",
  "lum":"\uC0C9\uC758 \uBA85\uB3C4",
  "sec2":"2. \uC5B4\uB5BB\uAC8C \uBC30\uC0C9\uD560\uAE4C",
  "rule1":"1. \uAE30\uBCF8\uC801\uC774\uBA74\uC11C \uD6A8\uACFC\uAC00 \uC798 \uB098\uB294 \uBC29\uC2DD: \uC778\uC811\uC0C9 \uD55C \uC138\uD2B8 + \uB300\uBE44\uC0C9 \uD558\uB098",
  "ratio":"2. \uC0C9\uC758 \uBE44\uC728",
  "contrast":"3. \uC21C\uD68C\uC0C9, \uBA85\uC554 \uB300\uBE44",
  "contrastNote":"*\uD6A8\uACFC\uAC00 \uC9C4\uD589\uB418\uBA70 \uB098\uD0C0\uB098\uB294 \uC804\uD6C4 \uC0C9 \uBCC0\uD654\uC640 \uBA85\uB3C4 \uBCC0\uD654\uB97C \uD568\uAED8 \uBCF4\uAE30",
  "sec3":"3. \uBC30\uC0C9\uC744 \uD48D\uBD80\uD558\uAC8C \uD558\uB294 \uBC29\uBC95",
  "reduce":"1. \uAC10\uC0C9    \uD575\uC2EC: \uD751\uBC31 \uAD00\uACC4\uAC00 \uBE44\uC2B7\uD568",
  "grad":"2. \uADF8\uB77C\uB370\uC774\uC158    \uD575\uC2EC: '\uC8FD\uC740 \uAD6C\uAC04' \uD53C\uD558\uAE30",
  "detail":"3. \uB514\uD14C\uC77C \uC0C9 \uB123\uAE30",
  "easy":"\uAC04\uD3B8\uD558\uBA74\uC11C\uB3C4 \uD6A8\uACFC\uC801",
  "sec4":"4. \uD654\uBA74\uC0C9\uC744 \uC2A4\uC2A4\uB85C \uC810\uAC80\uD558\uB294 \uBC29\uBC95",
  "bw":"1. \uD751\uBC31",
  "bw1":"\uC0C9\uC774 \uB108\uBB34 \uBCF5\uC7A1\uD568",
  "bw2":"\uC0C9\uC774 \uB108\uBB34 \uD0C1\uD568",
  "gray":"2. \uC21C\uD68C\uC0C9",
  "gray1":"\uC0C9\uC774 \uB72C \uB290\uB08C",
  "gray2":"\uC0C9\uC774 \uB108\uBB34 \uACFC\uD568"
}
'@

function Draw-TextShadow {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y
    )
    $Graphics.DrawString($Text, $Font, $shadow, ($X + 2), ($Y + 2))
    $Graphics.DrawString($Text, $Font, $Brush, $X, $Y)
}

function Draw-Wrap {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H
    )
    $rect = New-Object System.Drawing.RectangleF($X, $Y, $W, $H)
    $Graphics.DrawString($Text, $Font, $shadow, (New-Object System.Drawing.RectangleF(($X + 1.5), ($Y + 1.5), $W, $H)), $sf)
    $Graphics.DrawString($Text, $Font, $Brush, $rect, $sf)
}

function Cover-Rect {
    param([float]$X,[float]$Y,[float]$W,[float]$H,[switch]$Soft)
    if ($Soft) {
        $g.FillRectangle($coverSoft, $X, $Y, $W, $H)
    } else {
        $g.FillRectangle($cover, $X, $Y, $W, $H)
    }
}

function Draw-LabelAuto {
    param(
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y,
        [float]$PadX = 8,
        [float]$PadY = 4
    )
    $size = $g.MeasureString($Text, $Font)
    Cover-Rect $X $Y ($size.Width + ($PadX * 2)) ($size.Height + ($PadY * 2))
    Draw-TextShadow $g $Text $Font $Brush ($X + $PadX) ($Y + $PadY - 1)
}

function Draw-WrapBox {
    param(
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$PadX = 8,
        [float]$PadY = 5
    )
    Cover-Rect $X $Y $W $H
    Draw-Wrap $g $Text $Font $Brush ($X + $PadX) ($Y + $PadY) ($W - ($PadX * 2)) ($H - ($PadY * 2))
}

# Title
Draw-LabelAuto $S.title $titleFont $white 18 18 10 6

# Left column
Draw-LabelAuto $S.sec1 $sectionFont $white 74 146 10 5
Draw-WrapBox $S.p1 $bodyFont $soft 96 205 470 76
Draw-LabelAuto $S.site $bodyBold $soft 96 286 8 4
Draw-LabelAuto $S.lum $bodyBold $white 96 326 8 4

Draw-LabelAuto $S.sec2 $sectionFont $white 74 548 10 5
Draw-WrapBox $S.rule1 $bodyBold $white 96 595 455 62
Draw-LabelAuto $S.ratio $bodyBold $white 96 860 8 4
Draw-LabelAuto $S.contrast $bodyBold $white 96 930 8 4
Draw-WrapBox $S.contrastNote $smallFont $soft 96 963 340 42

# Right top
Draw-LabelAuto $S.sec3 $sectionFont $white 640 146 10 5
Draw-LabelAuto $S.reduce $bodyBold $white 676 186 7 3
Draw-LabelAuto $S.grad $bodyBold $white 676 335 7 3
Draw-LabelAuto $S.detail $bodyBold $white 676 506 7 3

# Center slogan
Draw-LabelAuto $S.easy $sloganFont $white 918 560 14 8

# Right bottom headings and notes
Draw-LabelAuto $S.sec4 $sectionFont $white 640 685 10 5
Draw-LabelAuto $S.bw $bodyBold $white 676 740 7 3
Draw-WrapBox $S.bw1 $smallFont $soft 676 768 108 20 6 3
Draw-WrapBox $S.bw2 $smallFont $soft 676 790 108 20 6 3
Draw-LabelAuto $S.gray $bodyBold $white 676 816 7 3
Draw-WrapBox $S.gray1 $smallFont $soft 676 844 108 20 6 3
Draw-WrapBox $S.gray2 $smallFont $soft 676 866 108 20 6 3

# Tiny check/x icons labels area cleanup
$g.DrawRectangle($outlineGreen, 810, 744, 476, 83)
$g.DrawRectangle($outlineRed, 810, 832, 477, 58)

$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$titleFont.Dispose()
$sectionFont.Dispose()
$bodyFont.Dispose()
$bodyBold.Dispose()
$smallFont.Dispose()
$sloganFont.Dispose()
$white.Dispose()
$soft.Dispose()
$shadow.Dispose()
$cover.Dispose()
$coverSoft.Dispose()
$outlineGreen.Dispose()
$outlineRed.Dispose()
$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Output $outputPath
