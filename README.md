# Obsidien 자료 내려받기

이 저장소에는 Obsidian 노트와 관련 자료가 들어 있습니다.

## 다른 컴퓨터에 처음 내려받기

1. 새 컴퓨터에 Git과 Obsidian을 설치합니다.
2. 자료를 둘 폴더에서 터미널(Windows: PowerShell, macOS/Linux: Terminal)을 엽니다.
3. 아래 명령을 실행합니다.

```bash
git clone https://github.com/yoringvfx-droid/obsidien.git
```

4. Obsidian에서 **보관함 열기**를 선택하고, 방금 생긴 `obsidien` 폴더를 지정합니다.

저장소가 비공개라면 복제할 때 이 저장소에 접근할 수 있는 GitHub 계정으로 로그인해야 합니다. 비밀번호나 인증 토큰을 노트에 적어 두지 마세요.

## 나중에 최신 내용 받기

`obsidien` 폴더에서 터미널을 열고 실행합니다.

```bash
git pull --ff-only origin main
```

로컬에서 같은 파일을 수정해 업데이트가 막히면, 변경 내용을 먼저 확인하고 보관한 뒤 다시 시도하세요. 로컬 변경을 강제로 지우지 마세요.

## Git 없이 한 번만 내려받기

GitHub 저장소 페이지에서 **Code > Download ZIP**을 선택해 압축을 풀 수 있습니다. 다만 이 방법으로 받은 폴더는 `git pull`로 업데이트할 수 없으므로, 계속 동기화하려면 위의 `git clone` 방법을 사용하세요.

## 포함되지 않는 파일

MP4, MP3, ZIP과 일부 대용량 제작 원본, 로컬 로그 및 백업은 업로드 대상에서 제외했습니다. 다른 컴퓨터에서 필요하다면 해당 파일은 별도로 옮겨야 합니다.
