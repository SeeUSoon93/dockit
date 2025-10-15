import Calculator from "../components/panel/Calculator";
import Dictionary from "../components/panel/Dictionary";
import Memo from "../components/panel/Memo";
import SpecialChar from "../components/panel/SpecialChar";
import ObjectEditer from "../components/panel/ObjectEditer";
import MadeChart from "../components/panel/MadeChart";
import Index from "../components/panel/Index";
import CalendarWidget from "../components/panel/CalendarWidget";
import Timer from "../components/panel/Timer";
import Translate from "../components/panel/Translate";
import ImageSearch from "../components/panel/ImageSearch";
import AiChat from "../components/panel/AiChat";
import AiImage from "../components/panel/AiImage";
import GeoJson from "../components/panel/GeoJson";
import WikipediaSearch from "../components/panel/WikipediaSearch";
import MapWidget from "../components/panel/MapWidget";
import Fortune from "../components/panel/Fortune";
import Dice from "../components/panel/Dice";
import MusicPlayer from "../components/panel/MusicPlayer";

export const widgets = {
  objectEditor: <ObjectEditer />, // 글자 수
  calculator: <Calculator />, // 계산기
  dictionary: <Dictionary />, // 사전
  memo: <Memo />, // 메모
  specialChar: <SpecialChar />, // 특수 문자
  madeChart: <MadeChart />, // 차트
  index: <Index />, // 목차
  calendar: <CalendarWidget />, // 달력
  timer: <Timer />, // 타이머
  translate: <Translate />, // 번역기
  imageSearch: <ImageSearch />, // 이미지 검색
  aiChat: <AiChat />, // AI 채팅
  aiImage: <AiImage />, // AI 이미지
  geoJson: <GeoJson />, // 행정지도
  wikipediaSearch: <WikipediaSearch />, // 위키
  map: <MapWidget />, // 지도
  fortune: <Fortune />, // 띠별 운세
  dice: <Dice />, // 주사위
  musicPlayer: <MusicPlayer />, // 음악 플레이어
};
