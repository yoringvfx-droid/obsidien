#!/usr/bin/env bash
# 분석 환경 준비. 세션마다 한 번. 사용: bash setup.sh TOOLDIR
# - ffmpeg/ffprobe, python3(numpy, pillow) 확인
# - 헤드리스 크롬(@sparticuz/chromium + puppeteer-core)을 TOOLDIR/node_modules에 설치
# 끝나면 "export NODE_PATH=TOOLDIR/node_modules" 를 출력한다. shoot.js 실행 전에 그 줄을 같이 쓴다.
set -e
T="${1:-/tmp/vfxtools}"; mkdir -p "$T"
command -v ffmpeg >/dev/null || { echo "ffmpeg 없음: 이 환경에서는 영상 분석 불가"; exit 1; }
python3 - <<'EOF' || pip install numpy pillow --break-system-packages -q
import numpy, PIL
EOF
if [ ! -d "$T/node_modules/@sparticuz/chromium" ]; then
  (cd "$T" && npm init -y >/dev/null 2>&1 && npm install @sparticuz/chromium@131 puppeteer-core@23 --silent >/dev/null 2>&1) || echo "크롬 설치 실패: 스크린샷 검수 없이 진행하고 사용자에게 알린다"
fi
python3 -c "import cv2" 2>/dev/null || pip install opencv-python-headless --break-system-packages -q  # projectile.py
echo "export NODE_PATH=$T/node_modules"
