import { Button } from "..";
import CommentCard from "~/components/CreateComment/CommentCard";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { message, Modal, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import { MdOutlineFileUpload, MdClose } from "react-icons/md";
import TextArea from "antd/es/input/TextArea";
import { useTranslation } from "react-i18next";
import { IoCloseOutline } from "react-icons/io5";

const CreateComment = ({
  handleClose,
  open,
  id,
  comments,
  post,
  isSuccessChange,
  isDeleteCommentSuccess,
  isCreateCommentSuccess,
}) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [content, setContent] = useState("");
  const [listComments, setListComments] = useState(
    [...(comments || [])].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    )
  );

  useEffect(() => {
    if (comments && Array.isArray(comments)) {
      const sorted = [...comments].sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setListComments(sorted);
    }
  }, [comments]);

  const [file, setFile] = useState();
  const { t } = useTranslation();
  const [charCount, setCharCount] = useState(0);

  const handleClear = () => {
    setContent("");
    setFile(null);
    setCharCount(0);
  };

  const handleEmojiClick = (emojiObject) => {
    if (charCount >= 200) {
      message.warning("Comment cannot exceed 200 characters");
      return;
    }
    const newContent = content + emojiObject.emoji;
    if (newContent.length <= 200) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const handleContentChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= 200) {
      setContent(newText);
      setCharCount(newText.length);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (file) {
      message.warning("Only one file can be uploaded");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      message.error("File must be smaller than 5MB!");
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const mutation = useMutationHook(({ id, data }) =>
    PostService.comment({ id, data })
  );

  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      handleClear();
      isCreateCommentSuccess({ isCreate: true });
      message.success({ content: t("Comment successfully") });
      isSuccessChange(data?.result?.commentCount);
      setListComments(data?.result?.comments);
    }
  }, [isSuccess]);

  const handleSubmitPost = () => {
    const request = { content };
    const data = {
      request,
      files: file ? [file] : [],
    };
    mutation.mutate({ id, data });
  };

  const getShortFileName = (name, maxLength = 20) => {
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
  };

  const onDeleteCommentSuccess = (newComments) => {
    isDeleteCommentSuccess({ isDelete: true });
    setListComments(newComments);
  };

  const onEditCommentSuccess = (newComments) => {
    setListComments(newComments);
  };

  return (
    <Modal
      className="customized-modal"
      open={open}
      closable={false}
      onClose={handleClose}
      centered
      width={550}
      footer={null}
    >
      <div className="w-full rounded-2xl mx-auto h-full bg-bgColor flex flex-col">
        {/* Header */}
        <div className="w-full flex items-center justify-between py-4 px-6 text-lg border-b border-borderNewFeed font-semibold">
          <span>{t("Comments")}</span>
          <IoCloseOutline
            onClick={() => handleClose()}
            size={26}
            className="cursor-pointer transition-transform hover:opacity-50 active:scale-95"
          />
        </div>

        {/* Comments List - Set default height here */}
        <div className="overflow-y-auto flex flex-col py-4 gap-y-4 h-96">
          {listComments?.length > 0 ? (
            listComments.map((comment, i) => (
              <CommentCard
                key={i}
                comment={comment}
                id={id}
                post={post}
                onEditCommentSuccess={onEditCommentSuccess}
                onDeleteCommentSuccess={onDeleteCommentSuccess}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              {t("No comments yet")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full relative rounded-bl-xl rounded-br-xl border-t px-6 border-borderNewFeed p-3 bg-white flex items-center gap-3">
          {showEmoji && (
            <div className="absolute bottom-20 z-50 left-2 ">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEmoji(!showEmoji)}
            aria-label="Pick emoji"
          >
            <BsEmojiSmile className="text-xl" />
          </button>

          {/* Input comment */}
          <div className="w-full relative border border-gray-300 rounded-lg p-2">
            <TextArea
              maxLength={200}
              className="w-full border-none focus:ring-0"
              autoSize={{ minRows: 1, maxRows: 2 }}
              onChange={handleContentChange}
              value={content}
              placeholder={`${t("Comments")}...`}
            />

            <div className="flex items-center justify-between">
              {/* Upload file input */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!!file}
                  />
                  <MdOutlineFileUpload
                    size={25}
                    className={`pl-2 ${
                      file ? "text-gray-400" : "text-gray-700"
                    }`}
                  />
                </label>

                {/* Display file name + delete button */}
                {file && (
                  <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md">
                    <Tooltip title={file.name} placement="top">
                      <span className="text-xs text-gray-700">
                        {getShortFileName(file.name)}
                      </span>
                    </Tooltip>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove file"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Character counter */}
              <span className="text-xs text-gray-500">{charCount}/200</span>
            </div>
          </div>

          <Button
            onClick={handleSubmitPost}
            title={isPending ? <Spin size="small" /> : t("Đăng")}
            disable={!content.trim() && !file}
            className={`py-2 text-sm px-2 font-semibold ${
              !content.trim() && !file ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateComment;
