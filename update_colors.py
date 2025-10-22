#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lottie JSON 파일의 색상값을 변경하는 스크립트
"""

import json
import sys
from typing import Set, Dict, Any, Tuple

# 색상 매핑 정의
COLOR_MAPPING = {
    "#163C79": "#006d75",
    "#274F88": "#13c2c2",
    "#396CAA": "#5cdbd3",
    "#5692CE": "#5cdbd3",
    "#D3EBFF": "#b5f5ec",
    "#FFD3FD": "#b3ecff",
    "#FFD4FD": "#b3ecff",
}


def hex_to_rgba(hex_color: str) -> Tuple[float, float, float, float]:
    """
    HEX 색상을 RGBA (0-1 범위)로 변환합니다.

    Args:
        hex_color: HEX 색상 코드 (#RRGGBB)

    Returns:
        (r, g, b, a) 튜플 (0-1 범위)
    """
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    a = 1.0  # 알파값은 1로 고정
    return (r, g, b, a)


def update_colors_in_lottie(data: Dict[Any, Any], color_mapping: Dict[str, str]) -> int:
    """
    Lottie JSON 데이터에서 색상값을 변경합니다.

    Args:
        data: Lottie JSON 데이터
        color_mapping: 색상 매핑 딕셔너리

    Returns:
        변경된 색상의 개수
    """
    changes_count = 0

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
                # 현재 색상을 HEX로 변환
                current_hex = f"#{int(r * 255):02X}{int(g * 255):02X}{int(b * 255):02X}"

                # 매핑에 해당하는 색상이 있는지 확인
                if current_hex in color_mapping:
                    new_hex = color_mapping[current_hex]
                    new_r, new_g, new_b, new_a = hex_to_rgba(new_hex)
                    c_data["k"] = [new_r, new_g, new_b, new_a]
                    changes_count += 1
                    print(f"✅ {current_hex} → {new_hex}")

        # 모든 하위 객체를 재귀적으로 검사
        for value in data.values():
            changes_count += update_colors_in_lottie(value, color_mapping)

    elif isinstance(data, list):
        # 리스트의 각 요소를 검사
        for item in data:
            changes_count += update_colors_in_lottie(item, color_mapping)

    return changes_count


def main():
    """메인 함수"""
    try:
        print("🎨 Lottie 애니메이션 색상 변경 시작")
        print("=" * 50)

        # Lottie JSON 파일 읽기
        with open("public/lottie/main.json", "r", encoding="utf-8") as f:
            lottie_data = json.load(f)

        print("색상 매핑:")
        for old_color, new_color in COLOR_MAPPING.items():
            print(f"  {old_color} → {new_color}")

        print("\n색상 변경 중...")

        # 색상 변경
        changes_count = update_colors_in_lottie(lottie_data, COLOR_MAPPING)

        if changes_count > 0:
            # 변경된 파일 저장
            with open("public/lottie/main.json", "w", encoding="utf-8") as f:
                json.dump(lottie_data, f, ensure_ascii=False, separators=(",", ":"))

            print(f"\n✅ 총 {changes_count}개의 색상이 성공적으로 변경되었습니다.")
            print("📁 파일이 저장되었습니다: public/lottie/main.json")
        else:
            print("\n⚠️  변경할 색상을 찾을 수 없습니다.")

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
