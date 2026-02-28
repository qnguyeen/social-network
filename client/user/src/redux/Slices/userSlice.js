import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SearchService from "~/services/SearchService"
import * as UserService from "~/services/UserService"

const initialState = {
    id: "",
    profileId: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    city: "",
    company: "",
    coverImageUrl: "",
    imageUrl: "",
    jobTitle: "",
    emailVerified: false,
    createdAt: "",
    token: "",
    phoneNumber: "",
    dateOfBirth: "",
    quote: "",
    gender: "",
    themeColor: "",
    status: "",
    roles: null,
    searchUser: null,
    user: null,
    privateProfile: false,
    isRefetchRequestSent: false,
    isRefetchListFriend: false,
    loadingGetDetailUserById: false
};

export const searchUser = createAsyncThunk("user/searchUser", async (keyword) => {
    const res = await SearchService.searchUser({ keyword })
    return res?.result?.items
})

export const getDetailUserById = createAsyncThunk("user/getDetailUserById", async ({ id, token }) => {
    const res = await UserService.getDetailUserByUserId({ id })
    return { ...res?.result, token }
})

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser(state, action) {
            const {
                id = "",
                userId = "",
                lastName = "",
                firstName = "",
                username = "",
                email = "",
                bio = "",
                city = "",
                company = "",
                coverImageUrl = "",
                imageUrl = "",
                jobTitle = "",
                emailVerified = false,
                dateOfBirth = "",
                phoneNumber = "",
                createdAt = "",
                themeColor = "",
                quote = "",
                gender = "",
                token = "",
                privateProfile = false,
                status = "",
                roles = null,
            } = action.payload

            state.lastName = lastName
            state.firstName = firstName
            state.profileId = id
            state.imageUrl = imageUrl
            state.id = userId
            state.company = company
            state.quote = quote
            state.jobTitle = jobTitle
            state.coverImageUrl = coverImageUrl
            state.themeColor = themeColor
            state.privateProfile = privateProfile
            state.bio = bio
            state.gender = gender
            state.email = email
            state.createdAt = createdAt
            state.dateOfBirth = dateOfBirth
            state.username = username
            state.phoneNumber = phoneNumber
            state.city = city
            state.emailVerified = emailVerified
            state.token = token
            state.status = status
            state.roles = roles
        },
        updateStatus(state, action) {
            state.status = action.payload
        },
        updatePrivacy(state, action) {
            state.privateProfile = action.payload
        },
        setIsLoadingGetDetailUser(state, action) {
            state.loadingGetDetailUserById = action.payload
        },
        setIsRefetchRequestSent(state, action) {
            state.isRefetchRequestSent = action.payload
        },
        setIsRefetchListFriend(state, action) {
            state.isRefetchListFriend = action.payload
        },
        resetUser(state) {
            localStorage.removeItem("token")
            localStorage.removeItem("chatSessions")
            localStorage.removeItem("sentiment")
            localStorage.removeItem("language")
            state.id = ""
            state.profileId = ""
            state.firstName = ""
            state.lastName = ""
            state.username = ""
            state.email = ""
            state.bio = ""
            state.roles = ""
            state.privateProfile = false
            state.city = ""
            state.emailVerified = false
            state.createdAt = ""
            state.token = ""
            state.phoneNumber = ""
            state.dob = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchUser.fulfilled, (state, action) => {
                state.searchUser = action.payload
            })
            .addCase(getDetailUserById.pending, (state, action) => {
                state.loadingGetDetailUserById = true
            })
            .addCase(getDetailUserById.fulfilled, (state, action) => {
                state.loadingGetDetailUserById = false
                state.user = action.payload
            })
            .addCase(getDetailUserById.rejected, (state, action) => {
                state.loadingGetDetailUserById = false
                state.user = null
            })
    }
});

export const { updateUser, updatePrivacy, setIsRefetchListFriend, setIsRefetchRequestSent, resetUser, updateStatus, setIsLoadingGetDetailUser } = userSlice.actions

export default userSlice.reducer;
