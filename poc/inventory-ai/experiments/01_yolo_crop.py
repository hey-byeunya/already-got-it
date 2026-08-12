"""YOLOv8n으로 사진 속 제품(병/통 등) 영역을 찾아 크롭한다.
탐지 실패 시(통/박스형 제품처럼 COCO 클래스에 안 걸리는 경우) 원본 이미지를 그대로 반환한다.

사용법:
    .venv/bin/python experiments/01_yolo_crop.py samples/물건사진1-1.jpeg
"""

import sys
from pathlib import Path

from PIL import Image
from ultralytics import YOLO

# 화장품 용기와 겹칠 만한 COCO 클래스만 관심 대상으로 둔다 (그 외 클래스는 무시)
RELEVANT_CLASSES = {"bottle", "cup", "vase", "book"}  # book=박스형 물체가 종종 이렇게 잡힘
PADDING_RATIO = 0.08  # 크롭 시 바운딩박스 주변에 약간 여유를 둔다


def crop_product(image_path: Path, out_dir: Path) -> dict:
    model = YOLO("yolov8n.pt")  # 최초 실행 시 자동 다운로드
    image = Image.open(image_path).convert("RGB")
    results = model(image, verbose=False)[0]

    candidates = []
    for box in results.boxes:
        cls_name = model.names[int(box.cls[0])]
        conf = float(box.conf[0])
        if cls_name in RELEVANT_CLASSES:
            candidates.append((conf, cls_name, box.xyxy[0].tolist()))

    out_dir.mkdir(parents=True, exist_ok=True)
    stem = image_path.stem

    if not candidates:
        # 폴백: 탐지 실패 시 원본을 그대로 사용
        out_path = out_dir / f"{stem}_crop.jpg"
        image.save(out_path)
        return {"detected": False, "class": None, "confidence": None, "crop_path": str(out_path)}

    # 가장 신뢰도 높은 후보 하나를 크롭
    conf, cls_name, (x1, y1, x2, y2) = max(candidates, key=lambda c: c[0])
    w, h = image.size
    pad_x = (x2 - x1) * PADDING_RATIO
    pad_y = (y2 - y1) * PADDING_RATIO
    x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
    x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)

    cropped = image.crop((x1, y1, x2, y2))
    out_path = out_dir / f"{stem}_crop.jpg"
    cropped.save(out_path)
    return {"detected": True, "class": cls_name, "confidence": round(conf, 3), "crop_path": str(out_path)}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("사용법: python 01_yolo_crop.py <이미지경로>")
        sys.exit(1)

    image_path = Path(sys.argv[1])
    out_dir = Path(__file__).parent / "outputs"
    result = crop_product(image_path, out_dir)
    print(result)
