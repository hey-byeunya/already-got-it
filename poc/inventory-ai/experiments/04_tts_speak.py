"""생성된 잔소리 문구를 macOS `say` 커맨드로 음성 파일(.aiff)로 저장한다.
추가 설치 없이 시스템에 이미 있는 한국어 보이스를 재사용한다.

세 프리셋 모두 표준 보이스 `Yuna` 하나로 통일하고, 속도(rate)와 피치(pbas 임베디드 커맨드)만
다르게 줘서 톤을 구분한다 — Eddy/Grandma 등 macOS 캐릭터(노벨티) 보이스는 발화가 매끄럽지
않다는 피드백을 받아 표준 보이스 기반으로 전환함.

사용법:
    .venv/bin/python experiments/04_tts_speak.py "다정" "이미 있는 세럼이에요~"
"""

import subprocess
import sys
from pathlib import Path

VOICE = "Yuna"

# 프리셋별 속도(rate, wpm)/피치(pbas, 음수=낮게 양수=높게) — say 기본 속도는 약 175wpm.
TONE_MAP = {
    "다정": {"rate": None, "pbas": None},
    "직설": {"rate": 170, "pbas": -10},
    "매운맛": {"rate": 235, "pbas": 15},
}


def speak_to_file(preset_key: str, text: str, out_dir: Path) -> Path:
    tone = TONE_MAP.get(preset_key, {"rate": None, "pbas": None})
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"nag_{preset_key}.aiff"

    spoken_text = text
    if tone["pbas"] is not None:
        spoken_text = f"[[pbas {tone['pbas']}]]{text}"

    command = ["say", "-v", VOICE]
    if tone["rate"] is not None:
        command += ["-r", str(tone["rate"])]
    command += ["-o", str(out_path), spoken_text]
    subprocess.run(command, check=True)
    return out_path


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print('사용법: python 04_tts_speak.py <프리셋(다정/직설/매운맛)> "문구"')
        sys.exit(1)

    preset_key, text = sys.argv[1], sys.argv[2]
    out_dir = Path(__file__).parent / "outputs"
    out_path = speak_to_file(preset_key, text, out_dir)
    print(f"저장됨: {out_path}")
