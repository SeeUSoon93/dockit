#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lottie 애니메이션의 분홍색 계열 색상들을 청록색과 같은 톤의 차분한 색상들로 변경하는 스크립트
"""

import json
import sys
from typing import Dict, Any, Tuple

# 분홍색 계열을 청록색과 같은 톤의 차분한 색상들로 매핑
PINK_TO_TEAL_MAPPING = {
    # 진한 분홍들 → 진한 청록색 계열
    "#AC0073": "#006d75",  # 진한 분홍 → 진한 청록
    "#B70083": "#13c2c2",  # 진한 분홍 → 중간 청록
    "#D2008D": "#5cdbd3",  # 진한 분홍 → 연한 청록
    # 주황빛 분홍들 → 청록색 계열의 따뜻한 톤
    "#C13C1A": "#36cfc9",  # 주황빛 분홍 → 따뜻한 청록
    "#DB5125": "#5cdbd3",  # 주황빛 분홍 → 연한 청록
    "#EE5F2D": "#87e8de",  # 주황빛 분홍 → 매우 연한 청록
    # 연한 분홍들 → 연한 청록색 계열
    "#EA9C92": "#b5f5ec",  # 연한 분홍 → 매우 연한 청록
    "#FF2C9C": "#b3ecff",  # 밝은 분홍 → 연한 청록
    "#FFC2AF": "#e6fffb",  # 연한 분홍 → 가장 연한 청록
}


def hex_to_rgba(hex_color: str) -> Tuple[float, float, float, float]:
    """HEX 색상을 RGBA 튜플로 변환 (Lottie 형식)"""
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    a = 1.0
    return (r, g, b, a)


def update_colors_in_lottie(data: Dict[Any, Any], color_mapping: Dict[str, str]) -> int:
    """Lottie 데이터에서 색상을 재귀적으로 업데이트"""
    changes_count = 0

    if isinstance(data, dict):
        # c.k 필드가 있는 색상 데이터인지 확인
        if "c" in data and isinstance(data["c"], dict):
            c_data = data["c"]
            if (
                "k" in c_data
                and isinstance(c_data["k"], list)
                and len(c_data["k"]) == 4
            ):
                r, g, b, a = c_data["k"]
                current_hex = f"#{int(r * 255):02X}{int(g * 255):02X}{int(b * 255):02X}"

                if current_hex in color_mapping:
                    new_hex = color_mapping[current_hex]
                    new_r, new_g, new_b, new_a = hex_to_rgba(new_hex)
                    c_data["k"] = [new_r, new_g, new_b, new_a]
                    changes_count += 1
                    print(f"✅ {current_hex} → {new_hex}")

        # 모든 값에 대해 재귀적으로 검색
        for value in data.values():
            changes_count += update_colors_in_lottie(value, color_mapping)

    elif isinstance(data, list):
        for item in data:
            changes_count += update_colors_in_lottie(item, color_mapping)

    return changes_count


def main():
    """메인 함수"""
    try:
        print("🎨 분홍색 계열을 청록색 톤으로 변경 시작")
        print("=" * 60)

        # Lottie 파일 읽기
        with open("public/lottie/main.json", "r", encoding="utf-8") as f:
            lottie_data = json.load(f)

        print("색상 매핑:")
        for old_color, new_color in PINK_TO_TEAL_MAPPING.items():
            print(f"  {old_color} → {new_color}")

        print("\n색상 변경 중...")
        changes_count = update_colors_in_lottie(lottie_data, PINK_TO_TEAL_MAPPING)

        if changes_count > 0:
            # 변경된 데이터를 파일에 저장
            with open("public/lottie/main.json", "w", encoding="utf-8") as f:
                json.dump(lottie_data, f, ensure_ascii=False, separators=(",", ":"))

            print(f"\n✅ 총 {changes_count}개의 분홍색이 청록색 톤으로 변경되었습니다.")
            print("📁 파일이 저장되었습니다: public/lottie/main.json")
        else:
            print("\n⚠️  변경할 분홍색을 찾을 수 없습니다.")

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
