import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '~/redux/Slices/themeSlice'
import userReducer from '~/redux/Slices/userSlice'
import languageReducer from '~/redux/Slices/languageSlice'
import postReducer from "~/redux/Slices/postSlice"
import chatReducer from "~/redux/Slices/chatSlice"
import messageReducer from "~/redux/Slices/messageSlice"
import groupReducer from "~/redux/Slices/groupSlice"
import storyReducer from "~/redux/Slices/storySlice"

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        group: groupReducer,
        story: storyReducer,
        user: userReducer,
        language: languageReducer,
        post: postReducer,
        chat: chatReducer,
        message: messageReducer
    }
})


