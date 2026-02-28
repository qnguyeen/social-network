import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isReloadMemberList: false,
    isReloadGroupDetail: false,
};

const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {
        setIsReloadMemberList(state, action) {
            state.isReloadMemberList = action.payload;
        },
        setIsReloadGroupDetail(state, action) {
            state.isReloadGroupDetail = action.payload;
        }
    }
});

export const { setIsReloadMemberList, setIsReloadGroupDetail } = groupSlice.actions

export default groupSlice.reducer;
