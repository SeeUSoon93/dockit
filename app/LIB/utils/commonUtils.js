export const formatTime = (time) => {
  const now = new Date();
  const target = new Date(time);

  // 👇 KST(UTC+9)로 보정하기 위해 9시간을 더합니다.
  target.setHours(target.getHours() + 9);

  const diff = Math.floor((now - target) / 1000); // 초 단위 차이

  // 1분 미만
  if (diff < 60) {
    return "방금 전";
  }

  // 1시간 이내
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}분 전`;
  }

  // 하루 이내
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}시간 전`;
  }

  // 일주일 이내
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}일 전`;
  }

  // 일주일 이상
  const year = target.getFullYear();
  const month = target.getMonth() + 1; // getMonth()는 0부터 시작
  const day = target.getDate();

  return `${year}년 ${month}월 ${day}일`;
};
