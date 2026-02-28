import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useRenderContentWithHashtags = ({ userState }) => {
  const navigate = useNavigate();

  const renderContentWithHashtags = useCallback(
    (content) => {
      if (!content) return null;

      const parts = content.split(/(#\w+)/g);

      return parts.map((part, index) => {
        if (part.startsWith("#")) {
          return (
            <span
              key={index}
              className={`text-blue-500 font-medium ${
                !userState?.token
                  ? "cursor-default"
                  : "cursor-pointer hover:underline"
              }`}
              onClick={(e) => {
                if (!userState?.token) return;
                e.stopPropagation();
                navigate("/search", {
                  state: {
                    stateKeyword: part,
                    activeTab: "hashtags",
                  },
                });
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      });
    },
    [navigate, userState?.token]
  );

  return renderContentWithHashtags;
};

export default useRenderContentWithHashtags;
