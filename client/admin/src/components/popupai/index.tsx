import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaArrowLeft, FaInfinity, FaHistory } from "react-icons/fa";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { Dropdown, Modal, List, Button } from "antd";
import ChatMessage from "@/components/popupai/ChatMessage";
import * as AIService from "@/services/AIService";
import { LuSendHorizontal } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setIsReloadUserList } from "@/redux/Slices/userSlice";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  isError?: boolean;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  id: string;
  label: string;
  command: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
  messages: ChatMessage[];
}

interface ChatSessions {
  [key: string]: ChatSession;
}

const PopupAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [wasDragging, setWasDragging] = useState<boolean>(false);
  const [chatPosition, setChatPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [dragStartPosition, setDragStartPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { t } = useTranslation();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSessions>({});
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const adminQuickActions: QuickAction[] = [
    {
      id: "lock",
      label: t("Khóa người dùng"),
      command: "Khóa tài khoản userId",
    },
    {
      id: "unlock",
      label: t("Mở khóa người dùng"),
      command: "Mở khóa tài khoản userId",
    },
    // {
    //   id: "delete",
    //   label: t("Xóa người dùng"),
    //   command: "Xóa tài khoản người dùng userId",
    // },
    {
      id: "changepass",
      label: t("Thay đổi mật khẩu"),
      command: "Đổi mật khẩu cho người dùng userId thành new_password",
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: t("Xin chào Admin! Tôi có thể hỗ trợ bạn điều gì hôm nay"),
      isUser: false,
      timestamp: new Date(),
      quickActions: adminQuickActions,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<{ originalX?: number; originalY?: number }>({});

  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions");
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions);
      Object.keys(parsedSessions).forEach((chatId) => {
        parsedSessions[chatId].messages.forEach((msg: ChatMessage) => {
          msg.timestamp = new Date(msg.timestamp);
        });
      });
      setChatSessions(parsedSessions);
    }

    createNewChatSession();
  }, []);

  useEffect(() => {
    if (Object.keys(chatSessions).length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    if (activeChatId && chatSessions[activeChatId]) {
      setMessages(chatSessions[activeChatId].messages);
    }
  }, [activeChatId]);

  const createNewChatSession = (): string => {
    const newChatId = `chat_${Date.now()}`;
    const welcomeMessage: ChatMessage = {
      id: 1,
      text: t("Xin chào Admin! Tôi có thể hỗ trợ bạn điều gì hôm nay"),
      isUser: false,
      timestamp: new Date(),
      quickActions: adminQuickActions,
    };

    setChatSessions((prev) => ({
      ...prev,
      [newChatId]: {
        id: newChatId,
        title: `Chat ${Object.keys(prev).length + 1}`,
        createdAt: new Date(),
        messages: [welcomeMessage],
      },
    }));

    setActiveChatId(newChatId);
    setMessages([welcomeMessage]);
    return newChatId;
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleChat = () => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateChatSession = (
    chatId: string,
    updatedMessages: ChatMessage[]
  ) => {
    setChatSessions((prev) => {
      const firstUserMessage = updatedMessages.find((msg) => msg.isUser);
      let title = prev[chatId].title;

      if (
        firstUserMessage &&
        prev[chatId].messages.length <= 1 &&
        updatedMessages.length > 1
      ) {
        title =
          firstUserMessage.text.substring(0, 30) +
          (firstUserMessage.text.length > 30 ? "..." : "");
      }

      return {
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: updatedMessages,
          title: title,
          updatedAt: new Date(),
        },
      };
    });
  };

  const isCommand = (text: string) => {
    return (
      text.startsWith("lock_") ||
      text.startsWith("unlock_") ||
      text.startsWith("delete_") ||
      text.startsWith("changePass_")
    );
  };

  const processCommand = async (command: string) => {
    try {
      let commandType = "";
      let data = {};

      if (command.startsWith("lock_")) {
        commandType = "lock";
        data = {
          userQuestion: `lock_${command.substring(5)}`,
        };
        // params = { userId: command.substring(5) };
      } else if (command.startsWith("unlock_")) {
        commandType = "unlock";
        data = {
          userQuestion: `unlock_ ${command.substring(7)}`,
        };
        // params = { userId: command.substring(7) };
      } else if (command.startsWith("delete_")) {
        commandType = "delete";
        data = {
          userQuestion: `delete user ${command.substring(7)}`,
        };
        // params = { userId: command.substring(7) };
      } else if (command.startsWith("changePass_")) {
        const parts = command.substring(11).split("_");
        if (parts.length < 3) {
          return "Invalid change password format. Use: changePass_userId_newpassword_confirmnewpassword";
        }
        commandType = "changepass";
        data = {
          userQuestion: `change password ${parts[0]} ${parts[1]}`,
        };
      }

      const res = await AIService.handle(data);
      return res || "Command processed, but no response received.";
    } catch (error) {
      console.error("Command processing error:", error);
      return "Error processing command. Please try again.";
    }
  };

  const handleQuickActionClick = (command: string) => {
    setMessage(command);
    chatInputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (message.trim() === "" || isTyping) return;

    const currentChatId = activeChatId || createNewChatSession();

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateChatSession(currentChatId, updatedMessages);

    setMessage("");

    setIsTyping(true);

    try {
      let response;
      if (isCommand(userMessage.text)) {
        response = await processCommand(userMessage.text);
      } else {
        response = await AIService.handle({ userQuestion: userMessage.text });
      }

      if (response) {
        dispatch(setIsReloadUserList(true));
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: response,
          isUser: false,
          timestamp: new Date(),
        };
        const newMessages = [...updatedMessages, botMessage];
        setMessages(newMessages);
        updateChatSession(currentChatId, newMessages);
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          text: t(
            "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại."
          ),
          isUser: false,
          isError: true,
          timestamp: new Date(),
        };
        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        updateChatSession(currentChatId, newMessages);
      }
    } catch (error) {
      console.error("AI service error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: t("Đã xảy ra lỗi. Vui lòng thử lại sau."),
        isUser: false,
        isError: true,
        timestamp: new Date(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      updateChatSession(currentChatId, newMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      text: "Đã xóa lịch sử trò chuyện. Tôi có thể hỗ trợ bạn như thế nào hôm nay?",
      isUser: false,
      timestamp: new Date(),
      quickActions: adminQuickActions,
    };

    setMessages([newMessage]);

    if (activeChatId) {
      updateChatSession(activeChatId, [newMessage]);
    } else {
      createNewChatSession();
    }
  };

  const clearAllChats = () => {
    localStorage.removeItem("chatSessions");
    setChatSessions({});
    createNewChatSession();
    setIsHistoryModalOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChatSessions((prev) => {
      const newSessions = { ...prev };
      delete newSessions[chatId];
      return newSessions;
    });

    if (chatId === activeChatId) {
      const remainingChats = Object.keys(chatSessions).filter(
        (id) => id !== chatId
      );
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0]);
      } else {
        createNewChatSession();
      }
    }
  };

  const switchToChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsHistoryModalOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;

    if (
      (isOpen &&
        e.target instanceof Element &&
        e.target.closest(".drag-handle")) ||
      !isOpen
    ) {
      setIsDragging(true);
      setWasDragging(false);
      setDragStartPosition({
        x: e.clientX - chatPosition.x,
        y: e.clientY - chatPosition.y,
      });

      iconButtonRef.current = {
        originalX: e.clientX,
        originalY: e.clientY,
      };

      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPosition.x;
    const newY = e.clientY - dragStartPosition.y;

    const hasMoved =
      Math.abs(e.clientX - (iconButtonRef.current.originalX || 0)) > 5 ||
      Math.abs(e.clientY - (iconButtonRef.current.originalY || 0)) > 5;

    if (hasMoved) {
      setWasDragging(true);
    }

    setChatPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStartPosition]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const dropdownItems = [
    {
      key: "1",
      label: (
        <div className="flex items-center gap-2" onClick={clearChat}>
          <span>{t("Xóa cuộc trò chuyện")}</span>
          <MdOutlineDeleteSweep size={18} />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className="flex items-center gap-2"
          onClick={() => setIsHistoryModalOpen(true)}
        >
          <span>{t("Lịch sử trò chuyện")}</span>
          <FaHistory size={16} />
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div className="flex items-center gap-2" onClick={createNewChatSession}>
          <span>{t("Cuộc trò chuyện mới")}</span>
          <span>+</span>
        </div>
      ),
    },
  ];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <>
      <div
        className={`fixed z-50 flex flex-col items-end ${
          isMobile ? "bottom-0 right-0 left-0" : "bottom-5 right-5"
        }`}
        style={{
          transform: isMobile
            ? "none"
            : `translate(${chatPosition.x}px, ${chatPosition.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
      >
        {isOpen ? (
          <div
            ref={chatContainerRef}
            className={`bg-white shadow-2xl rounded-3xl transition-all duration-300 overflow-hidden border-1 border-borderNewFeed ${
              isMobile
                ? "w-full h-[100vh] fixed inset-0 rounded-none"
                : "w-80 sm:w-96"
            }`}
            style={{
              opacity: isDragging ? 0.7 : 1,
              transform: `scale(${isDragging ? 0.98 : 1})`,
              transition: "all 0.2s ease",
            }}
          >
            <div
              className={`bg-brand-500 text-white p-3 flex justify-between items-center ${
                isMobile
                  ? "rounded-none"
                  : "rounded-tl-3xl rounded-tr-3xl drag-handle cursor-move"
              }`}
              onMouseDown={!isMobile ? handleMouseDown : undefined}
            >
              <div className="flex items-center gap-x-2">
                <button
                  onClick={toggleChat}
                  className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close chat"
                >
                  <FaArrowLeft size={16} />
                </button>
                <div className="flex gap-x-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <FaInfinity className="text-bgStandard" size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold">Admin Bot</h3>
                    <p className="text-xs text-ascent-2">{t("Trợ lý AI")}</p>
                  </div>
                </div>
              </div>
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{ items: dropdownItems }}
              >
                <button
                  className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Menu options"
                >
                  <HiOutlineDotsVertical size={20} />
                </button>
              </Dropdown>
            </div>

            <div
              className={`overflow-y-auto p-3 bg-white ${
                isMobile ? "h-[calc(100vh-136px)]" : "h-96"
              }`}
            >
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isError={msg.isError}
                  onQuickActionClick={handleQuickActionClick}
                />
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full shadow-md bg-black flex items-center justify-center">
                    <FaInfinity className="text-white" size={20} />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div
              className={`p-3 border-t border-zinc-200 bg-white ${
                isMobile ? "rounded-none" : "rounded-bl-3xl rounded-br-3xl"
              }`}
            >
              <div className="relative w-full">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={message}
                  disabled={isTyping}
                  onChange={handleMessageChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 pr-10 rounded-2xl text-black border border-zinc-200 focus:outline-none "
                  placeholder={t("Hỏi bất cứ điều gì...")}
                />
                <button
                  onClick={sendMessage}
                  className="absolute right-3 active:scale-95 transition-transform top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  disabled={isTyping}
                >
                  <LuSendHorizontal size={18} />
                </button>
              </div>
              {!isMobile && (
                <div
                  onMouseDown={handleMouseDown}
                  className="drag-handle cursor-move text-center mt-2"
                >
                  <span className="text-xs text-zinc-500 font-semibold">
                    {t("Được hỗ trợ bởi LinkVerse")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            ref={(el) => {
              if (el && !iconButtonRef.current) {
                iconButtonRef.current = {};
              }
            }}
            onClick={toggleChat}
            onMouseDown={!isMobile ? handleMouseDown : undefined}
            className={`group ${isDragging ? "" : "animate-bounce"} ${
              isMobile ? "mb-4 mr-4" : ""
            }`}
            style={{
              cursor: isDragging ? "grabbing" : "pointer",
            }}
          >
            <img
              src="/robot.gif"
              alt="chatbot"
              className={`${
                isMobile ? "w-14 h-14" : "w-16 h-16"
              } shadow-xl rounded-full border border-borderNewFeed bg-gradient-to-tr from-[#00c6ff] via-[#0072ff] to-[#71538b] transition-transform group-hover:scale-110`}
            />
          </button>
        )}
      </div>

      <Modal
        title={t("Lịch sử trò chuyện")}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="new" type="primary" onClick={createNewChatSession}>
            {t("Cuộc trò chuyện mới")}
          </Button>,
          <Button key="clear" danger onClick={clearAllChats}>
            {t("Xóa tất cả")}
          </Button>,
        ]}
      >
        <List
          dataSource={Object.values(chatSessions).sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime()
          )}
          renderItem={(session) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-100 rounded-md p-2 ${
                session.id === activeChatId ? "bg-blue-50" : ""
              }`}
              onClick={() => switchToChat(session.id)}
              actions={[
                <Button
                  key="delete"
                  danger
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(session.id);
                  }}
                >
                  {t("Delete")}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={session.title}
                description={formatDate(session.updatedAt || session.createdAt)}
              />
            </List.Item>
          )}
          locale={{ emptyText: t("Không có cuộc trò chuyện nào") }}
        />
      </Modal>
    </>
  );
};

export default PopupAI;
