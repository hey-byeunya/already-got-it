"""OCR로 뽑은 텍스트(또는 이름 후보)를 보고 카테고리를 추천한다.
Ollama에게 목업 카테고리 목록 중 하나를 고르게 하고, 목록에 없는 값을 내놓으면
"미분류"로 처리한다 — 원래 계획했지만 1차 실험 스크립트엔 빠져 있던 기능.

실제로는 Supabase list_owned_categories()로 대체될 목록 — PoC 단계에서는 하드코딩.

사용법:
    .venv/bin/python experiments/05_recommend_category.py "Eucerin HYALURON BoosTING ESSENCE"
"""

import sys

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:3b"

MOCK_CATEGORIES = ["스킨케어", "헤어케어", "메이크업", "바디케어", "식품"]

UNCLASSIFIED = "미분류"


def recommend_category(text: str) -> dict:
    categories_list = ", ".join(MOCK_CATEGORIES)
    prompt = (
        f"다음 물건 이름 또는 라벨 텍스트를 보고, 아래 카테고리 중 가장 알맞은 것 딱 하나만 골라줘.\n"
        f"카테고리 목록: {categories_list}\n\n"
        f"물건: {text}\n\n"
        "목록에 있는 카테고리 이름을 한 글자도 바꾸지 말고 그대로 출력해. 설명 없이 답만 출력해."
    )
    response = requests.post(
        OLLAMA_URL,
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=60,
    )
    response.raise_for_status()
    answer = response.json()["response"].strip()

    if answer in MOCK_CATEGORIES:
        return {"category": answer, "raw_response": answer}
    return {"category": UNCLASSIFIED, "raw_response": answer}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print('사용법: python 05_recommend_category.py "물건 이름/텍스트"')
        sys.exit(1)

    result = recommend_category(sys.argv[1])
    print(result)
