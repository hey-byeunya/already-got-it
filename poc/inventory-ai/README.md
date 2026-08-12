# "이미 있어" AI PoC — 등록 자동화 + 장바구니 잔소리 봇

메인퀘스트 2(내 도메인에서 AI로 개선 지점 찾아 PoC 만들기) 결과물. "이미 있어"(개인 재고 관리 앱)에 물건 사진 자동 등록과 장바구니 중복구매 경고 기능을 더할 수 있는지 4개 모델(YOLO/OCR/LLM/TTS)을 실제로 돌려 검증했다.

- 문제 정의: [PROBLEM.md](./PROBLEM.md)
- 검증 결과(1차 실험 + 2차 개선 라운드): [EXPERIMENT_RESULTS.md](./EXPERIMENT_RESULTS.md)

## 파이프라인 구조

**A. 사진 한 장 → 있템 등록 자동 채움**
```
물건 사진 → YOLO(제품 영역 크롭) → OCR(라벨 텍스트 추출) → 파싱 → 이름/카테고리/사용기한 자동 채움
```

**B. 장바구니 스크린샷 → 매칭 후 분기**
```
장바구니 스크린샷 → OCR(A와 동일 컴포넌트 재사용) → 있템 DB 매칭
  ├─ 매칭됨   → LLM(잔소리 문구 생성) → TTS(음성 경고)
  └─ 매칭 안 됨 → "있템/위시로 등록" 선택 버튼 제공 (자동 등록 아님)
```

자세한 설계 근거는 [PROBLEM.md](./PROBLEM.md)의 "개선 가설"/"모델 선정 근거" 참고.

## 요구사항

- **macOS** (TTS가 시스템 `say` 커맨드에 의존 — Windows/Linux에서는 4단계 TTS만 동작 안 함)
- 인터넷 연결(최초 실행 시 YOLOv8n 가중치 자동 다운로드)
- [Homebrew](https://brew.sh), [uv](https://docs.astral.sh/uv/)
- 디스크 여유 공간 약 3GB (Ollama 모델 포함)

## 설치

```bash
cd poc/inventory-ai

# Python 3.12 가상환경 생성 + 의존성 설치 (시스템 Python 버전과 무관하게 uv가 알아서 받음)
uv venv --python 3.12
uv pip install -r requirements.txt

# 로컬 LLM (Ollama) 설치 + 모델 다운로드
brew install ollama
brew services start ollama
ollama pull qwen2.5:3b
```

TTS는 macOS에 이미 있는 `say` 커맨드를 그대로 쓰므로 추가 설치가 필요 없다.

## 실행 방법

각 스크립트는 독립적으로 실행해서 결과를 확인할 수 있다:

```bash
# ① 물건 사진에서 제품 영역 크롭
.venv/bin/python experiments/01_yolo_crop.py samples/물건사진1-1.jpeg

# ② 크롭된(또는 원본) 이미지에서 텍스트 추출
.venv/bin/python experiments/02_ocr_read.py experiments/outputs/물건사진1-1_crop.jpg

# ③ 추출된 텍스트를 있템 목록과 매칭 + 잔소리 문구 생성
.venv/bin/python experiments/03_match_and_nag.py "에스티 로더 갈색병 세럼 75ml"

# ④ 문구를 음성 파일로 합성
.venv/bin/python experiments/04_tts_speak.py "다정" "이미 있는 세럼이에요~"

# ⑤ 텍스트로 카테고리 추천
.venv/bin/python experiments/05_recommend_category.py "Eucerin HYALURON BoosTING ESSENCE"

# 전체 파이프라인을 한 번에 (①~③까지 이어서 실행, 매칭되면 ④까지)
.venv/bin/python experiments/run_pipeline_demo.py samples/물건사진1-1.jpeg
```

## 실행 결과 예시 (실제 로그)

**② OCR — 장바구니 스크린샷**
```
$ .venv/bin/python experiments/02_ocr_read.py samples/장바구니1.jpeg
[0.94] 11:22
[1.00] 장바구니
[1.00] 전체선택 3/3
[0.87] 상온 상품
[0.76] [에스티 로더] 갈색병 세럼 75ml
```

**③ 매칭 성공 — 이미 있는 물건**
```
$ .venv/bin/python experiments/03_match_and_nag.py "에스티 로더 갈색병 세럼 75ml"
{'matched': True, 'matched_item': '에스티 로더 갈색병 세럼', 'similarity': 0.833, 'method': 'difflib',
 'phrases': {'다정': '아까 동그란 원통한 액체 찾은 적 있어?',
             '직설': '이미 들고 있구나.',
             '매운맛': '뭐야 너! 이미 가져왔는데 이거 뭔지!'}}
```

**③ 매칭 안 됨 — 등록 후보**
```
$ .venv/bin/python experiments/03_match_and_nag.py "모로칸오일 헤어 트리트먼트 100ml"
{'matched': False, 'best_candidate': '에스티 로더 갈색병 세럼', 'similarity': 0.074, 'action': '있템/위시 등록 후보'}
```

**⑤ 카테고리 추천**
```
$ .venv/bin/python experiments/05_recommend_category.py "모로칸오일 헤어 트리트먼트 100ml"
{'category': '헤어케어', 'raw_response': '헤어케어'}
```

**④ 음성 파일**: `experiments/outputs/nag_*.aiff`로 저장되며 `afplay experiments/outputs/nag_다정.aiff`로 바로 들을 수 있다.

## 폴더 구조

```
poc/inventory-ai/
├── PROBLEM.md              # 문제 정의서
├── EXPERIMENT_RESULTS.md   # 검증 결과 (1차 실험 + 2차 개선 라운드)
├── README.md               # 이 파일
├── requirements.txt        # 정확히 고정된 의존성 (uv pip freeze)
├── samples/                # 실제 샘플 사진 8장 (물건 6장 + 장바구니 스크린샷 2장)
└── experiments/
    ├── 01_yolo_crop.py         # YOLO 객체 탐지 + 크롭
    ├── 02_ocr_read.py          # EasyOCR 텍스트 추출
    ├── 03_match_and_nag.py     # 매칭(difflib+LLM) + 잔소리 문구 생성
    ├── 04_tts_speak.py         # TTS 음성 합성
    ├── 05_recommend_category.py # 카테고리 추천
    ├── run_pipeline_demo.py    # 전체 파이프라인 통합 실행
    └── outputs/                # 실행 결과물 (크롭 이미지, 음성 파일 등 — 재실행 시 다시 생성됨)
```

## 알려진 제약

- **macOS 전용**: TTS가 시스템 `say` 커맨드에 의존한다.
- **표본이 작다**: 물건 사진 6장, 장바구니 스크린샷 2장으로만 검증했다 — 통계적으로 일반화하기엔 이르고, "다음에 뭘 개선해야 하는지" 방향을 잡는 용도로 본다.
- **로컬 소형 LLM(3B)의 출력 품질 편차**: 같은 입력이어도 실행마다 문구 품질이 달라진다(잡음 섞인 출력 필터링/재시도 로직은 있지만 완전하지 않음). 자세한 실패 사례는 `EXPERIMENT_RESULTS.md` 참고.
- **사용기한 자동 추출은 이번 표본에서 0/6 성공** — 앱의 핵심 가치와 가장 직결되는 지표인데 가장 약하다. 반사광 각인, 회전된 텍스트, 라벨이 다른 면에 있는 경우가 원인이며, 모델 개선 일부(회전 보정)를 시도했으나 효과가 제한적이었다.
- 첫 실행은 YOLO 가중치 다운로드 + EasyOCR 모델 다운로드로 몇 분 걸릴 수 있다(이후엔 캐시돼서 빠름).
