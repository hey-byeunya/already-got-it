"""EasyOCR로 이미지(크롭된 제품 영역 또는 원본)에서 텍스트를 읽어낸다.
한글+영문 라벨 혼용을 대응하기 위해 ko+en 리더를 함께 쓴다.

1차 실험에서 회전된 텍스트(물건사진2-2 등)가 거의 완전히 인식 실패하는 걸 확인해서,
EasyOCR 내장 rotation_info로 90/180/270도 회전본도 함께 시도하도록 했다(새 의존성 없음).

사용법:
    .venv/bin/python experiments/02_ocr_read.py outputs/물건사진1-1_crop.jpg
"""

import sys
from pathlib import Path

import easyocr

_reader = None


def get_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["ko", "en"], gpu=False)
    return _reader


def read_text(image_path: Path) -> list[dict]:
    reader = get_reader()
    results = reader.readtext(str(image_path), rotation_info=[90, 180, 270])
    # results: [(bbox, text, confidence), ...]
    return [
        {"text": text, "confidence": round(float(conf), 3)}
        for _bbox, text, conf in results
    ]


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("사용법: python 02_ocr_read.py <이미지경로>")
        sys.exit(1)

    image_path = Path(sys.argv[1])
    lines = read_text(image_path)
    for line in lines:
        print(f"[{line['confidence']:.2f}] {line['text']}")
