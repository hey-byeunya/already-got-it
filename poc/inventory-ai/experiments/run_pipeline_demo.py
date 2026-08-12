"""4개 스크립트를 순서대로 엮어서 이미지 1장에 대해 전체 파이프라인을 한 번에 실행한다.
입력 → YOLO 크롭 → OCR → 매칭 분기(잔소리봇 / 등록후보) → (매칭 시) TTS까지.

사용법:
    .venv/bin/python experiments/run_pipeline_demo.py samples/물건사진1-1.jpeg
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from importlib import import_module

yolo_crop = import_module("01_yolo_crop")
ocr_read = import_module("02_ocr_read")
match_and_nag = import_module("03_match_and_nag")
tts_speak = import_module("04_tts_speak")


def run(image_path: Path):
    out_dir = Path(__file__).parent / "outputs"

    print(f"\n=== 입력: {image_path.name} ===")

    crop_result = yolo_crop.crop_product(image_path, out_dir)
    print(f"[1] YOLO 크롭: {crop_result}")

    ocr_lines = ocr_read.read_text(Path(crop_result["crop_path"]))
    combined_text = " ".join(line["text"] for line in ocr_lines)
    print(f"[2] OCR 텍스트: {combined_text!r}")
    for line in ocr_lines:
        print(f"    [{line['confidence']:.2f}] {line['text']}")

    if not combined_text.strip():
        print("[3] OCR 결과가 비어 있어 매칭을 건너뜀 (실패 사례로 기록)")
        return

    match_result = match_and_nag.match_and_nag(combined_text)
    print(f"[3] 매칭 결과: {json.dumps(match_result, ensure_ascii=False, indent=2)}")

    if match_result["matched"]:
        print("[4] TTS 음성 생성:")
        for preset, phrase in match_result["phrases"].items():
            out_path = tts_speak.speak_to_file(preset, phrase, out_dir)
            print(f"    {preset}: \"{phrase}\" -> {out_path}")
    else:
        print(f"[4] 있템/위시 등록 후보 — 등록 폼 프리필용 텍스트: {combined_text!r}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("사용법: python run_pipeline_demo.py <이미지경로>")
        sys.exit(1)

    run(Path(sys.argv[1]))
