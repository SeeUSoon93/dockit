#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lottie JSON 파일에서 색상값을 추출하는 스크립트
"""

import json
import sys
from typing import Set, Dict, Any


def extract_colors_from_lottie(
    data: Dict[Any, Any], colors: Set[str] = None
) -> Set[str]:
    """
    Lottie JSON 데이터에서 색상값을 재귀적으로 추출합니다.

    Args:
        data: Lottie JSON 데이터
        colors: 색상을 저장할 Set (기본값: None)

    Returns:
        추출된 색상값들의 Set
    """
    if colors is None:
        colors = set()

    if isinstance(data, dict):
        # 색상 정보가 있는 경우 (c.k 배열이 RGBA 형태인 경우)
        if "c" in data and isinstance(data["c"], dict):
            c_data = data["c"]
            if (
                "k" in c_data
                and isinstance(c_data["k"], list)
                and len(c_data["k"]) == 4
            ):
                r, g, b, a = c_data["k"]
                # 0-1 범위의 값을 0-255로 변환하여 HEX로 변환
                hex_color = f"#{int(r * 255):02X}{int(g * 255):02X}{int(b * 255):02X}"
                colors.add(hex_color)

        # 모든 하위 객체를 재귀적으로 검사
        for value in data.values():
            extract_colors_from_lottie(value, colors)

    elif isinstance(data, list):
        # 리스트의 각 요소를 검사
        for item in data:
            extract_colors_from_lottie(item, colors)

    return colors


def main():
    """메인 함수"""
    try:
        # Lottie JSON 파일 읽기
        with open("public/lottie/main.json", "r", encoding="utf-8") as f:
            lottie_data = json.load(f)

        # 색상 추출
        colors = extract_colors_from_lottie(lottie_data)

        # 결과 출력
        print("🎨 Lottie 애니메이션에서 추출된 색상값들")
        print("=" * 50)

        if colors:
            sorted_colors = sorted(colors)
            for i, color in enumerate(sorted_colors, 1):
                print(f"{i:2d}. {color}")

            print(f"\n총 {len(colors)}개의 고유한 색상이 발견되었습니다.")

            # CSS 변수 형태로도 출력
            print("\n📝 CSS 변수 형태:")
            print("-" * 30)
            for i, color in enumerate(sorted_colors, 1):
                print(f"--color-{i}: {color};")

        else:
            print("색상값을 찾을 수 없습니다.")

    except FileNotFoundError:
        print("❌ 파일을 찾을 수 없습니다: public/lottie/main.json")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 오류: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
