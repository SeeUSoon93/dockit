import { Button, Card, Segmented, Typography, toast, Tag, Div } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { BsMusicPlayerFill } from "react-icons/bs";
import { useState, useEffect, useRef } from "react";
import { useMusic } from "../../context/MusicContext";
import {
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeMute,
  IoMusicalNotesOutline,
  IoPlayBack,
  IoPlayForward
} from "react-icons/io5";
import {
  PiMusicNotesFill,
  PiNumberOneBold,
  PiRepeatBold,
  PiRepeatOnceBold
} from "react-icons/pi";

export default function MusicPlayer({ dragHandleProps }) {
  const [selected, setSelected] = useState("nature");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState("all"); // "one", "all", "once"
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  const [thumb, setThumb] = useState(null);
  const audioRef = useRef(null);

  const { natureMusic, musicList, loading, error } = useMusic();

  const playList = selected === "nature" ? natureMusic : musicList;

  // 오디오 엘리먼트 초기화
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 현재 트랙 변경 시 재생
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack, isPlaying]);

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    if (!currentTrack && playList.length > 0) {
      // 선택된 노래가 없으면 첫번째 곡 재생
      const firstTrack = playList[0];
      setCurrentTrack(firstTrack);
      setCurrentIndex(0);
      setIsPlaying(true);
    } else if (currentTrack) {
      // 선택된 노래가 있으면 재생/일시정지 토글
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  // 특정 트랙 재생
  const playTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
    setHasPlayedOnce(false); // 새 곡 재생 시 한번 반복 상태 초기화
  };

  // 이전 곡
  const handlePrevious = () => {
    if (playList.length === 0) return;

    let newIndex;
    if (currentIndex <= 0) {
      // 첫번째일 경우 마지막 곡
      newIndex = playList.length - 1;
    } else {
      newIndex = currentIndex - 1;
    }

    const track = playList[newIndex];
    playTrack(track, newIndex);
  };

  // 반복 모드 토글
  const handleRepeatToggle = () => {
    const modes = ["one", "all", "once"];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextModeIndex = (currentModeIndex + 1) % modes.length;
    setRepeatMode(modes[nextModeIndex]);
    setHasPlayedOnce(false); // 반복 모드 변경 시 초기화
  };

  // 반복 모드별 아이콘 반환
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <PiNumberOneBold />; // 한곡 반복
      case "all":
        return <PiRepeatBold />; // 전체 반복
      case "once":
        return <PiRepeatOnceBold />; // 한번 반복
      default:
        return <PiRepeatBold />;
    }
  };

  // 다음 곡
  const handleNext = () => {
    if (playList.length === 0) return;

    if (repeatMode === "one") {
      // 한곡 반복: 현재 곡 다시 재생
      if (currentTrack) {
        playTrack(currentTrack, currentIndex);
      }
      return;
    }

    let newIndex;
    if (currentIndex >= playList.length - 1) {
      // 마지막 곡일 때
      if (repeatMode === "all") {
        // 전체 반복: 첫번째 곡으로
        newIndex = 0;
      } else if (repeatMode === "once" && !hasPlayedOnce) {
        // 한번 반복: 첫번째 곡으로 (한번만)
        newIndex = 0;
        setHasPlayedOnce(true);
      } else {
        // 한번 반복 완료: 재생 중지
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentIndex(-1);
        return;
      }
    } else {
      newIndex = currentIndex + 1;
    }

    const track = playList[newIndex];
    playTrack(track, newIndex);
  };

  // 기존 handlePlayPause (리스트에서 클릭할 때)
  const handleTrackClick = (track) => {
    const index = playList.findIndex((t) => t.url === track.url);
    playTrack(track, index);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const formatFileName = (fileName) => {
    if (!fileName) return "";
    return fileName
      .replace(/\.[^/.]+$/, "") // 확장자 제거
      .replace(/[-_]/g, " ") // 언더스코어, 하이픈을 공백으로
      .replace(/\s+\d+$/, ""); // 뒤에 붙은 숫자 제거 (공백 + 숫자)
  };

  useEffect(() => {
    if (selected === "music") {
      setThumb("/player/video.mp4");
    } else {
      if (currentTrack) {
        setThumb(currentTrack.thumbnailUrl);
      } else {
        setThumb(null);
      }
    }
  }, [currentTrack, selected]);

  return (
    <WidgetCard
      icon={BsMusicPlayerFill}
      title="음악 플레이어"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Segmented
          options={[
            { value: "nature", label: "자연" },
            { value: "music", label: "Lofi" }
          ]}
          value={selected}
          onChange={setSelected}
          block
          size="sm"
        />
        <Card width="100%" shadow="none">
          <div className="flex flex-col gap-10 justify-center items-center w-100">
            {/* 썸네일 */}
            <div
              className="w-px-150 h-px-150 flex justify-center items-center shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              {thumb ? (
                <video
                  src={thumb}
                  alt="thumb"
                  className="w-100 h-100 object-cover"
                  style={{ borderRadius: "10px" }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <Div
                  color="mint"
                  className="w-100 h-100 flex justify-center items-center"
                >
                  <PiMusicNotesFill size={40} />
                </Div>
              )}
            </div>
            {/* 제목 */}
            <Typography color="mint-7">
              {formatFileName(currentTrack?.name)}
            </Typography>
            {/* 버튼 */}
            <div className="grid col-5 w-100 gap-10">
              {/* 반복 */}
              <Button
                size="sm"
                colorType="text"
                icon={getRepeatIcon()}
                onClick={handleRepeatToggle}
                title={`반복: ${
                  repeatMode === "one"
                    ? "한곡 반복"
                    : repeatMode === "all"
                    ? "전체 반복"
                    : "한번 반복"
                }`}
              />
              {/* 이전 */}
              <Button
                size="sm"
                colorType="text"
                icon={<IoPlayBack />}
                onClick={handlePrevious}
                disabled={playList.length === 0}
              />
              {/* 재생/일시정지 */}
              <Button
                size="sm"
                colorType="text"
                icon={isPlaying ? <IoPause size={20} /> : <IoPlay size={20} />}
                onClick={handlePlayPause}
                disabled={playList.length === 0}
              />
              {/* 다음 */}
              <Button
                size="sm"
                colorType="text"
                icon={<IoPlayForward />}
                onClick={handleNext}
                disabled={playList.length === 0}
              />
              {/* 빈공간 */}
              <div />
            </div>
          </div>
        </Card>

        {/* 음악 목록 */}
        <Card width="100%" shadow="none">
          <div className="flex flex-col gap-10 max-h-px-100 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Typography size="sm" color="gray-6">
                  음악을 불러오는 중...
                </Typography>
              </div>
            ) : error ? (
              <div className="flex justify-center py-20">
                <Typography size="sm" color="red-6">
                  {error}
                </Typography>
              </div>
            ) : playList.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-10">
                <IoMusicalNotesOutline size={32} className="text-gray-4" />
                <Typography size="sm" color="cool-gray-6">
                  {selected === "nature"
                    ? "자연 소리가 없습니다"
                    : "음악이 없습니다"}
                </Typography>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {playList.map((track, index) => (
                  <Tag
                    key={track.fullPath}
                    className="flex justify-between items-center"
                    style={{ width: "100%" }}
                    colorType={
                      currentTrack?.url === track.url ? "mint" : "gray"
                    }
                  >
                    <div className="flex-1">
                      <Typography size="sm" weight="medium">
                        {index + 1}. {formatFileName(track.name)}
                      </Typography>
                    </div>
                    <Button
                      size="sm"
                      colorType="text"
                      icon={<IoPlay />}
                      onClick={() => handleTrackClick(track)}
                    />
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 볼륨 컨트롤 */}
        <div className="flex items-center gap-10">
          <Button
            size="sm"
            colorType="text"
            onClick={handleMuteToggle}
            icon={isMuted ? <IoVolumeMute /> : <IoVolumeHigh />}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1"
            style={{ accentColor: "#3b82f6" }}
          />
          <Typography size="xs" color="cool-gray-6">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </Typography>
        </div>
      </div>

      {/* 숨겨진 오디오 엘리먼트 */}
      <audio
        ref={audioRef}
        onEnded={() => {
          // 곡이 끝나면 반복 모드에 따라 처리
          if (repeatMode === "one") {
            // 한곡 반복: 현재 곡 다시 재생
            if (currentTrack) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(console.error);
            }
          } else {
            // 다른 모드: 다음 곡으로 이동
            handleNext();
          }
        }}
        onError={(e) => {
          console.error("오디오 재생 오류:", e);
          toast.error("음악 재생에 실패했습니다.");
          setIsPlaying(false);
        }}
      />
    </WidgetCard>
  );
}
