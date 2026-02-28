import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "..";
import { BlankAvatar } from "~/assets";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import DialogCustom from "~/components/DialogCustom";
import { setIsRefetchPostShare } from "~/redux/Slices/postSlice";

const SharePost = ({ open, handleClose, post, onSuccessSharePost }) => {
  const user = useSelector((state) => state.user);
  const [status, setStatus] = useState("");
  const [postState, setPostState] = useState("PUBLIC");
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state?.theme?.theme);

  const handleChangeStatus = useCallback((e) => {
    setStatus(e.target.value);
  }, []);

  const mutation = useMutationHook(({ data }) => PostService.share({ data }));
  const { isPending, isSuccess, data } = mutation;

  useEffect(() => {
    if (isPending) {
      handleClose();
      message.loading({ content: t("Share post..."), duration: 0 });
    } else if (isSuccess) {
      message.destroy();
      onSuccessSharePost(data);
      dispatch(setIsRefetchPostShare(true));
      message.success({ content: t("Post share successfully!") });
    }
  }, [isPending, isSuccess]);

  const handleSubmitPost = () => {
    const data = {
      postId: post?.id,
      postData: {
        content: status,
        visibility: postState,
      },
    };
    mutation.mutate({ data });
  };

  return (
    <DialogCustom
      isOpen={open}
      theme={theme}
      width={"660px"}
      style={{ overflow: "visible" }}
      handleCloseDiaLogAdd={handleClose}
    >
      <div className="w-full rounded-2xl bg-[url(/group.png)] bg-center bg-cover  shadow-sm">
        {/* header */}
        <div className="w-full flex items-center justify-between gap-2 md:gap-5 px-3 md:px-6 py-3 md:py-4">
          <button
            onClick={handleClose}
            className="text-sm md:text-base hover:opacity-50 font-medium text-ascent-2"
          >
            {t("Hủy")}
          </button>
          <span className="text-base md:text-lg font-semibold text-ascent-1">
            {t("Chia sẻ bài viết")}
          </span>
          <div className="w-7"></div>
        </div>
        <div className="w-full border-t-[0.1px] border-borderNewFeed" />

        {/* body */}
        <div className=" w-full flex flex-col px-5 py-4 justify-center gap-y-2">
          {/* 1 */}
          <div className="flex flex-col w-full gap-y-3">
            {/* 1 */}
            <div className="w-full flex gap-x-3">
              <img
                src={user?.imageUrl ?? BlankAvatar}
                alt="User Image"
                className="w-14 h-14 rounded-full border-1 flex-shrink-0 border-borderNewFeed  object-cover shadow-newFeed"
              />
              {/* 2 */}
              <TextField
                label={t("Có gì mới ?")}
                multiline
                id="content"
                inputProps={{ maxLength: 300 }}
                onChange={handleChangeStatus}
                maxRows={5}
                value={status}
                variant="standard"
                fullWidth
                sx={{
                  "& .MuiInput-root": {
                    color: "#000",
                    "&:before": {
                      display: "none",
                    },
                    "&:after": {
                      display: "none",
                    },
                  },
                  "& .MuiInputLabel-standard": {
                    color: "rgb(89, 91, 100)",
                    "&.Mui-focused": {
                      display: "none",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* 4 */}
          <div className="w-full flex mt-3 justify-between">
            <FormControl
              sx={{ m: 1, minWidth: 120 }}
              size="small"
              variant="standard"
            >
              <Select
                disableUnderline="true"
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={postState}
                onChange={(e) => setPostState(e.target.value)}
                sx={{
                  boxShadow: "none",
                  "& .MuiSelect-icon": {
                    display: "none",
                  },
                }}
              >
                <MenuItem value={"PUBLIC"}>
                  <span className="text-ascent-2">
                    {t("Bất cứ ai cũng có thể xem bài viết của bạn")}
                  </span>
                </MenuItem>
                <MenuItem value={"PRIVATE"}>
                  <span className="text-ascent-2">{t("Riêng tư")}</span>
                </MenuItem>
              </Select>
            </FormControl>
            <div className="relative py-1">
              <div>
                <Button
                  type="submit"
                  title={t("Chia sẻ")}
                  onClick={handleSubmitPost}
                  className="bg-bgColor relative hover:scale-105 active:scale-95 text-ascent-1 px-5 py-3 rounded-xl border-borderNewFeed border-1 font-semibold text-sm shadow-newFeed"
                  disable={isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogCustom>
  );
};

export default SharePost;
