"""OCR로 뽑은 텍스트를 "있템 목록"(하드코딩된 샘플, 실제 Supabase 연동은 다음 단계)과
매칭한다. 1차로 difflib 문자열 유사도를 시도하고, 임계값 미만이면 2차로 Ollama에게
"같은 제품인지" 의미 기반으로 판단시킨다(영문 라벨 vs 한글 있템 이름처럼 언어가 달라
문자열 유사도가 0이 되는 케이스 대응). 매칭되면 잔소리 문구를 생성하고, 생성된 문구가
한글/영문 외 잡음이 섞이면 재시도한 뒤 그래도 실패하면 고정 폴백 문구를 쓴다.
매칭 안 되면 "등록 후보"로 표시한다.

사용법:
    .venv/bin/python experiments/03_match_and_nag.py "에스티 로더 갈색병 세럼 75ml"
"""

import difflib
import re
import sys

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:3b"

# 실제로는 Supabase list_owned_items()로 대체될 목록 — PoC 단계에서는 하드코딩
MOCK_OWNED_ITEMS = [
    "유세린 하이알루론 부스팅 에센스",
    "에스티 로더 갈색병 세럼",
    "원씽 펩타이드 레티놀 세럼",
]

MATCH_THRESHOLD = 0.55  # difflib SequenceMatcher.ratio() 기준

NAG_PRESETS = {
    "다정": "다정하고 부드러운 말투로, 이미 같은 물건이 있다는 걸 살짝 알려주는 잔소리 한 문장",
    "직설": "직설적이고 단호한 말투로, 이미 같은 물건이 있으니 다시 생각해보라는 잔소리 한 문장",
    "매운맛": "장난스럽고 과장된 말투로, 또 사려고 하냐고 쏘아붙이는 잔소리 한 문장",
}

# LLM 문구 생성 검증: 한글/영문/숫자/기본 문장부호 외의 문자(한자, 이상한 기호 등)가
# 섞이면 거부한다 — 실제로 "별 거예요 그냥 안買세요astos"처럼 한자가 섞인 잡음이 관찰됨.
VALID_PHRASE_PATTERN = re.compile(
    r"^[가-힣ᄀ-ᇿ㄰-㆏a-zA-Z0-9\s.,!?~'\"·…\-]+$"
)

FALLBACK_PHRASES = {
    "다정": "어? 이거 이미 있는 물건 같은데, 다시 한 번 확인해볼래요?",
    "직설": "이미 가지고 있는 물건이에요. 다시 생각해보세요.",
    "매운맛": "야, 그거 이미 있잖아! 장바구니에서 빼!",
}


def is_valid_phrase(text: str) -> bool:
    return bool(VALID_PHRASE_PATTERN.fullmatch(text.strip()))


def find_best_match(candidate_text: str, owned_items: list[str]) -> tuple[str | None, float]:
    best_item, best_ratio = None, 0.0
    normalized_candidate = candidate_text.replace(" ", "").lower()
    for item in owned_items:
        normalized_item = item.replace(" ", "").lower()
        ratio = difflib.SequenceMatcher(None, normalized_candidate, normalized_item).ratio()
        if ratio > best_ratio:
            best_item, best_ratio = item, ratio
    return best_item, best_ratio


def _ollama_generate(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["response"].strip()


def llm_semantic_match(candidate_text: str, owned_items: list[str]) -> str | None:
    """difflib가 실패했을 때(주로 언어가 달라 문자열 유사도가 낮을 때) 의미 기반으로 재판단한다."""
    items_list = "\n".join(f"- {item}" for item in owned_items)
    prompt = (
        f"다음은 사용자가 이미 가지고 있는 물건 목록이다:\n{items_list}\n\n"
        f"장바구니에 담은 물건: '{candidate_text}'\n\n"
        "이 물건이 위 목록 중 하나와 같은 제품인가? 언어(한글/영문 표기 차이)나 "
        "일부 문구 생략은 같은 제품으로 봐도 된다. 같다면 목록에 있는 정확한 이름을 "
        "한 글자도 바꾸지 말고 그대로 출력하고, 다르다면 '없음'이라고만 출력해. "
        "설명 없이 답만 출력해."
    )
    answer = _ollama_generate(prompt)
    return answer if answer in owned_items else None


def generate_nag_phrase(item_name: str, preset_key: str, max_retries: int = 3) -> str:
    instruction = NAG_PRESETS[preset_key]
    prompt = (
        f"사용자가 '{item_name}'을 장바구니에 담았는데, 이미 같은 물건을 가지고 있다.\n"
        f"{instruction}을 한국어로 딱 한 문장만 만들어줘. 설명이나 따옴표 없이 문장만 출력해."
    )
    for _attempt in range(max_retries):
        text = _ollama_generate(prompt)
        if is_valid_phrase(text):
            return text
    return FALLBACK_PHRASES[preset_key]


def match_and_nag(candidate_text: str) -> dict:
    best_item, ratio = find_best_match(candidate_text, MOCK_OWNED_ITEMS)
    method = "difflib"

    if not (best_item and ratio >= MATCH_THRESHOLD):
        # difflib가 임계값을 못 넘기면(언어 차이 등) LLM에게 의미 기반으로 재확인
        llm_match = llm_semantic_match(candidate_text, MOCK_OWNED_ITEMS)
        if llm_match:
            best_item, method = llm_match, "llm"

    if best_item and (method == "llm" or ratio >= MATCH_THRESHOLD):
        phrases = {
            preset: generate_nag_phrase(best_item, preset) for preset in NAG_PRESETS
        }
        return {
            "matched": True,
            "matched_item": best_item,
            "similarity": round(ratio, 3),
            "method": method,
            "phrases": phrases,
        }

    return {"matched": False, "best_candidate": best_item, "similarity": round(ratio, 3), "action": "있템/위시 등록 후보"}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print('사용법: python 03_match_and_nag.py "상품명 텍스트"')
        sys.exit(1)

    result = match_and_nag(sys.argv[1])
    print(result)
