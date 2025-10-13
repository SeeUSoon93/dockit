import { RiChatAiFill } from "react-icons/ri";
import WidgetCard from "./WidgetCard";
import { useEffect, useRef, useState } from "react";
import { chatModel } from "../../config/firebaseConfig";
import ReactMarkdown from "react-markdown";
import {
  Avatar,
  Button,
  Div,
  DotSpinner,
  Progress,
  Textarea,
  Typography,
} from "sud-ui";
import { MapArrowFill } from "sud-icons";
import { useUser } from "../../context/UserContext";
import { refreshUserPoint } from "../../utils/authUtils";

export default function AiChat({ dragHandleProps }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, userLoading, setUser } = useUser();

  const model = chatModel;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const sendMessage = async () => {
    if (!user || userLoading) return;
    if (user.ai_beta_points < 50) {
      toast.danger("포인트가 부족합니다.");
      return;
    }
    if (input.trim() === "") return;
    setLoading(true);
    const trimmedInput = input.trim();

    // 새 메시지를 임시로 추가
    const newUserMessage = { role: "user", parts: [{ text: trimmedInput }] };
    const updatedMessages = [...messages, newUserMessage];

    // 입력창 즉시 비우기
    setInput("");

    const chat = model.startChat({
      history: messages,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
    console.log(chat);
    try {
      const result = await chat.sendMessage(trimmedInput);
      const response = result.response;
      const text = response.text();

      // 새 메시지와 응답을 추가
      setMessages([
        ...updatedMessages,
        { role: "model", parts: [{ text: text }] },
      ]);
      const response2 = await refreshUserPoint({
        ai_beta_points: user.ai_beta_points - 50,
      });
      setUser({
        ...user,
        ai_beta_points: response2.user.ai_beta_points,
      });
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <WidgetCard
      icon={RiChatAiFill}
      title="AI 채팅"
      dragHandleProps={dragHandleProps}
      titleBtn={
        <div className="w-30" style={{ minWidth: "100px" }}>
          <div className="grid col-2 gap-5 items-center">
            <Progress
              value={user.ai_beta_points || 0}
              max={2000}
              valuePosition="outside-right"
              color="mint-7"
              showText={false}
            />
            <Typography size="sm" pretendard="SB" color="mint-7">
              {user.ai_beta_points}P
            </Typography>
          </div>
        </div>
      }
    >
      <div className="w-100 flex flex-col gap-10">
        {/* 메시지 출력 영역 */}
        <div className="flex flex-col gap-20 overflow-y-auto max-h-px-300">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className="flex gap-10 justify-start items-start"
                style={{
                  flexDirection: isUser ? "row-reverse" : "row",
                }}
              >
                {!isUser && (
                  <Avatar
                    className="shadow-box"
                    size={40}
                    style={{ flexShrink: 0 }}
                  />
                )}
                <Div
                  className="rad-15 pd-10 inline-block whitespace-pre-wrap break-words"
                  background={isUser ? "mint-1" : "sky-1"}
                  style={{
                    maxWidth: "75%",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      ol: ({ children }) => (
                        <ol
                          style={{
                            listStylePosition: "inside", // ✅ 숫자를 안쪽으로
                            margin: 0,
                          }}
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li
                          style={{
                            marginBottom: "0.3em",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {children}
                        </li>
                      ),
                      p: ({ children }) => (
                        <p
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {msg.parts[0]?.text}
                  </ReactMarkdown>
                </Div>
              </div>
            );
          })}
          {/* 로딩 중 Spin */}
          {loading && (
            <div className="flex justify-center items-center">
              <DotSpinner />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 입력창 */}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`메시지를 입력하세요
(Shift+Enter 또는 버튼으로 메시지 전송)`}
          rows={2}
          shadow="none"
          bottomRight={
            <Button
              size="sm"
              icon={<MapArrowFill size={16} />}
              onClick={sendMessage}
              disabled={loading}
            />
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
      </div>
      <Typography size="sm">※ 채팅 시 50P 소모됩니다.</Typography>
    </WidgetCard>
  );
}
