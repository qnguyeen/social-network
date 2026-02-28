import React, { useState } from "react";
import { Badge } from "@mui/material";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AlertWelcome from "~/components/AlertWelcome";

const Chat = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAlertWelcome, setOpenAlertWelcome] = useState(false);
  const openMessage = Boolean(anchorEl);

  const handleChatIconClick = () => {
    if (user?.token) {
      navigate("/chat");
    } else {
      setOpenAlertWelcome(true);
    }
  };

  // Render
  return (
    <>
      <AlertWelcome
        type="chat"
        open={openAlertWelcome}
        handleClose={() => setOpenAlertWelcome(!openAlertWelcome)}
      />
      {/* Chat Icon */}
      <div className="p-1 flex items-center hover:scale-105 hover:opacity-50 active:scale-95 transition-transform justify-center">
        <Badge
          variant="dot"
          color="warning"
          onClick={handleChatIconClick}
          className="cursor-pointer"
        >
          <IoChatboxEllipsesOutline
            size={25}
            aria-controls={openMessage ? "chat-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMessage ? "true" : undefined}
            className={`text-bgStandard cursor-pointer transition-colors duration-200 ${
              openMessage && "text-blue-700"
            }`}
          />
        </Badge>
      </div>
    </>
  );
};

export default Chat;
