import { Button, Input, Switch, Tabs, toast, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { TbReplace } from "react-icons/tb";
import { inputProps } from "../../constant/uiProps";
import { useState, useRef } from "react";
import { useEditorContext } from "../../context/EditorContext";
import { TiChevronLeft, TiChevronRight } from "react-icons/ti";

export default function FindAndReplace({ dragHandleProps }) {
  const { editor } = useEditorContext();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isReplace, setIsReplace] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const searchResultsRef = useRef([]); // 모든 검색 결과 위치 저장

  // 모든 텍스트 위치를 찾는 함수
  const findAllTextPositions = (searchText) => {
    if (!editor || !searchText) return [];

    const { doc } = editor.state;
    const fullText = doc.textContent;
    const results = [];
    let searchIndex = 0;

    // 모든 검색 결과의 텍스트 인덱스 찾기
    const textIndices = [];
    while (true) {
      const index = fullText.indexOf(searchText, searchIndex);
      if (index === -1) break;
      textIndices.push(index);
      searchIndex = index + 1;
    }

    if (textIndices.length === 0) return [];

    // 텍스트 인덱스를 ProseMirror position으로 변환
    let accumulatedTextLength = 0;
    let currentTextIndex = 0;

    doc.descendants((node, pos) => {
      if (currentTextIndex >= textIndices.length) return false; // 모든 결과를 찾았으면 중단

      if (node.isText) {
        const nodeText = node.text;
        const nodeStart = accumulatedTextLength;
        const nodeEnd = accumulatedTextLength + nodeText.length;

        // 현재 노드에 아직 찾지 못한 검색 결과가 있는지 확인
        while (
          currentTextIndex < textIndices.length &&
          textIndices[currentTextIndex] >= nodeStart &&
          textIndices[currentTextIndex] < nodeEnd
        ) {
          const textIndex = textIndices[currentTextIndex];
          const offset = textIndex - nodeStart;
          const from = pos + offset;
          const to = Math.min(from + searchText.length, pos + nodeText.length);
          results.push({ from, to });
          currentTextIndex++;
        }

        accumulatedTextLength += nodeText.length;
      }

      return true; // 계속 순회
    });

    return results;
  };

  // 특정 인덱스의 결과로 이동하는 함수
  const moveToResult = (index) => {
    if (!editor || searchResultsRef.current.length === 0) return;

    const result = searchResultsRef.current[index];
    if (!result) return;

    // 텍스트 선택 및 스크롤
    editor
      .chain()
      .setTextSelection({ from: result.from, to: result.to })
      .focus()
      .run();

    // 선택된 요소로 스크롤
    setTimeout(() => {
      try {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        const editorElement = editor.view.dom;

        // 스크롤 가능한 컨테이너 찾기
        let scrollContainer = editorElement.closest(".tiptap-container");
        if (!scrollContainer) {
          scrollContainer = editorElement.parentElement;
        }
        if (!scrollContainer) {
          scrollContainer = window;
        }

        if (scrollContainer === window) {
          // window 스크롤
          window.scrollTo({
            top: coords.top - 100,
            left: coords.left,
            behavior: "smooth",
          });
        } else {
          // 요소 스크롤
          const containerRect = scrollContainer.getBoundingClientRect();
          const relativeTop =
            coords.top - containerRect.top + scrollContainer.scrollTop;
          const relativeLeft =
            coords.left - containerRect.left + scrollContainer.scrollLeft;

          scrollContainer.scrollTo({
            top: relativeTop - 100, // 약간의 여백
            left: relativeLeft,
            behavior: "smooth",
          });
        }
      } catch (error) {
        console.error("스크롤 오류:", error);
      }
    }, 100);
  };

  // 찾기 기능
  const handleFind = () => {
    if (!editor || !findText.trim()) {
      setTotalCount(0);
      setCurrentCount(0);
      searchResultsRef.current = [];
      return;
    }

    const results = findAllTextPositions(findText);
    searchResultsRef.current = results;

    if (results.length > 0) {
      setTotalCount(results.length);
      setCurrentCount(1);
      moveToResult(0); // 첫 번째 결과로 이동
    } else {
      setTotalCount(0);
      setCurrentCount(0);
      toast.danger("찾을 수 없습니다.");
    }
  };

  // 이전 결과로 이동 (루프)
  const handlePrevious = () => {
    if (totalCount === 0) return;

    const newCount = currentCount > 1 ? currentCount - 1 : totalCount;
    setCurrentCount(newCount);
    moveToResult(newCount - 1); // 0-based index
  };

  // 다음 결과로 이동 (루프)
  const handleNext = () => {
    if (totalCount === 0) return;

    const newCount = currentCount < totalCount ? currentCount + 1 : 1;
    setCurrentCount(newCount);
    moveToResult(newCount - 1); // 0-based index
  };

  // 바꾸기 기능 (현재 선택된 결과만 바꾸고 다음으로 이동)
  const handleReplace = () => {
    if (!editor || !findText.trim() || searchResultsRef.current.length === 0) {
      return;
    }

    const currentIndex = currentCount - 1;
    const currentResult = searchResultsRef.current[currentIndex];

    if (!currentResult) return;

    // 현재 선택된 텍스트를 바꿀 텍스트로 교체
    editor
      .chain()
      .setTextSelection({ from: currentResult.from, to: currentResult.to })
      .insertContent(replaceText)
      .run();

    // 바꾼 후 검색 결과를 다시 찾고 다음 결과로 이동
    setTimeout(() => {
      // 검색 결과 다시 찾기
      const results = findAllTextPositions(findText);
      searchResultsRef.current = results;

      if (results.length > 0) {
        setTotalCount(results.length);
        // 다음 결과로 이동 (루프)
        const nextIndex = currentIndex < results.length ? currentIndex : 0;
        const nextCount = nextIndex + 1;
        setCurrentCount(nextCount);
        moveToResult(nextIndex);
      } else {
        // 더 이상 결과가 없으면
        setTotalCount(0);
        setCurrentCount(0);
        toast.success("모든 결과를 바꿨습니다.");
      }
    }, 100);
  };

  // 모두 바꾸기 기능
  const handleReplaceAll = () => {
    handleFind();

    if (!editor || !findText.trim() || searchResultsRef.current.length === 0) {
      return;
    }

    const results = [...searchResultsRef.current];
    let replaceCount = 0;

    // 역순으로 바꾸기 (앞에서부터 바꾸면 위치가 변경되므로)
    for (let i = results.length - 1; i >= 0; i--) {
      const result = results[i];
      editor
        .chain()
        .setTextSelection({ from: result.from, to: result.to })
        .insertContent(replaceText)
        .run();
      replaceCount++;
    }

    // 모든 결과를 바꾼 후 검색 결과 초기화
    setTotalCount(0);
    setCurrentCount(0);
    searchResultsRef.current = [];

    // toast 알림
    toast.success(`총 ${replaceCount}건이 변경되었습니다.`);
  };

  // Enter 키로 찾기 실행
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isReplace) {
      e.preventDefault();
      handleFind();
    }
  };

  return (
    <WidgetCard
      icon={TbReplace}
      title="찾기 및 바꾸기"
      dragHandleProps={dragHandleProps}
      titleBtn={
        <Switch
          checked={isReplace}
          onChange={() => setIsReplace(!isReplace)}
          size="sm"
          onColor="mint-7"
          offColor="mint-3"
        />
      }
    >
      <div className="w-100 flex flex-col gap-10">
        {/* 찾기 바꾸기 칸 */}
        <div className="flex gap-5 item-cen flex-col">
          <Input
            placeholder="찾을 내용을 입력하세요"
            {...inputProps}
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onEnter={handleKeyDown}
            label="찾을 내용"
          />
          {isReplace && (
            <Input
              placeholder="바꿀 내용을 입력하세요"
              {...inputProps}
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              label="바꿀 내용"
            />
          )}
        </div>

        {/* 결과 */}
        {totalCount > 0 && (
          <div className="flex jus-end item-cen">
            {/* 전체 찾은 갯수 */}
            <Typography size="sm" color="cool-gray-7">
              {currentCount} / {totalCount}
            </Typography>
            <Button
              size="sm"
              colorType="text"
              icon={<TiChevronLeft />}
              onClick={handlePrevious}
            />
            <Button
              size="sm"
              colorType="text"
              icon={<TiChevronRight />}
              onClick={handleNext}
            />
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex jus-end gap-10">
          <Button
            size="sm"
            background="mint-7"
            color="mint-1"
            onClick={handleFind}
            disabled={!findText.trim()}
          >
            <Typography size="sm">찾기</Typography>
          </Button>
          {isReplace && (
            <>
              <Button
                size="sm"
                background="mint-7"
                color="mint-1"
                onClick={handleReplace}
                disabled={!findText.trim() || !replaceText.trim()}
              >
                <Typography size="sm">바꾸기</Typography>
              </Button>
              <Button
                size="sm"
                background="mint-7"
                color="mint-1"
                onClick={handleReplaceAll}
                disabled={!findText.trim() || !replaceText.trim()}
              >
                <Typography size="sm">모두 바꾸기</Typography>
              </Button>
            </>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
