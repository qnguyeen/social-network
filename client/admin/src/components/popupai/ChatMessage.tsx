import { BlankAvatar } from "@/assets";
import { useTypewriterHook } from "@/hooks/useTypewriterHook";
import { FaInfinity } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface QuickAction {
  id: string;
  label: string;
  command: string;
}

interface ChatMessageProps {
  message: {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    quickActions?: QuickAction[];
  };
  isError?: boolean;
  onQuickActionClick: (command: string) => void;
}

const ChatMessage = ({
  message,
  isError,
  onQuickActionClick,
}: ChatMessageProps) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);

  const [typewriterText] = useTypewriterHook({
    words: [message.text],
    loop: 1,
    typeSpeed: 50,
    deleteSpeed: 0,
    delaySpeed: 1000,
  });

  const displayedText = useMemo(() => {
    return message.isUser ? message.text : typewriterText;
  }, [message.isUser, message.text, typewriterText]);

  return (
    <div
      className={`flex ${
        message?.isUser ? "justify-end" : "justify-start"
      } mb-3 max-w-full`}
    >
      {!message?.isUser && (
        <div className="w-8 h-8 mr-1 flex-shrink-0 rounded-full bg-black shadow-md flex items-center justify-center">
          <FaInfinity className="text-white" size={20} />
        </div>
      )}
      <div className="flex flex-col max-w-[75%] sm:max-w-[80%]">
        <div
          className={`py-2 px-3 rounded-lg border-[1px] border-zinc-200 break-words ${
            message?.isUser
              ? "bg-brand-500 text-white rounded-tr-none"
              : isError
              ? "bg-red-100 text-red-500 rounded-tl-none"
              : "bg-[rgb(244, 242, 240)] text-black rounded-tl-none"
          }`}
        >
          <p className="text-sm sm:text-base">{t(displayedText)}</p>
        </div>

        {!message.isUser &&
          message.quickActions &&
          message.quickActions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onQuickActionClick(action.command)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1 px-3 rounded-full border border-blue-200 transition-colors"
                >
                  {t(action.label)}
                </button>
              ))}
            </div>
          )}
      </div>
      {message?.isUser && (
        <img
          src={user?.imageUrl || BlankAvatar}
          alt="User"
          className="w-8 h-8 rounded-full ml-2 flex-shrink-0 object-cover"
        />
      )}
    </div>
  );
};

export default ChatMessage;
