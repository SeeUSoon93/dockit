import Calculator from "../components/panel/Calculator";
import Dictionary from "../components/panel/Dictionary";
import Memo from "../components/panel/Memo";
import SpecialChar from "../components/panel/SpecialChar";
import ObjectEditer from "../components/panel/ObjectEditer";

export const widgets = {
  objectEditor: <ObjectEditer />, // 글자 수
  calculator: <Calculator />, // 계산기
  dictionary: <Dictionary />, // 사전
  memo: <Memo />, // 메모
  specialChar: <SpecialChar /> // 특수 문자
};
