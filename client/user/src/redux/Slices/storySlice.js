import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stories: [],
};

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {
        setStory(state, action) {
            state.stories = action.payload;
        }
    }
});

export const { setStory } = storySlice.actions

export default storySlice.reducer;
