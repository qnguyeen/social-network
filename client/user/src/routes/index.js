import { ChatPage, GroupPage, NotFoundPage, ProfilePage, ReplyPage, SavedsPage, SearchPage, SettingPage, VerifyPage } from "~/pages";
import FundraisingPage from "~/pages/FundraisingPage";
import CookiePolicyPage from "~/pages/HelpPage/CookiePolicyPage";
import HelpCenter from "~/pages/HelpPage/HelpCenter";
import PrivacyPolicyPage from "~/pages/HelpPage/PrivacyPolicyPage";
import TermsOfServicePage from "~/pages/HelpPage/TermsOfServicePage";
import MyProfilePage from "~/pages/MyProfilePage";
import PaymentFailed from "~/pages/Payment/PaymentFailed";
import PaymentSuccess from "~/pages/Payment/PaymentSuccess";

export const route = [
    {
        path: '/profile/:id',
        element: ProfilePage,
    },
    {
        path: '/profile/me',
        element: MyProfilePage,
    },
    {
        path: '/group/:id',
        element: GroupPage,
    },
    {
        path: '*',
        element: NotFoundPage,
    },
    {
        path: '/post/:id',
        element: ReplyPage,
    },
    {
        path: '/chat',
        element: ChatPage,
    },
    {
        path: '/settings',
        element: SettingPage,
    },
    {
        path: '/settings/help',
        element: HelpCenter,
    },
    {
        path: '/settings/privacy',
        element: PrivacyPolicyPage,
    },
    {
        path: '/settings/terms',
        element: TermsOfServicePage,
    },
    {
        path: '/settings/cookies',
        element: CookiePolicyPage,
    },
    {
        path: '/saveds',
        element: SavedsPage,
    },
    {
        path: '/verify-email',
        element: VerifyPage,
    },
    {
        path: '/search',
        element: SearchPage,
    },
    {
        path: '/fundraisers/payment-success',
        element: PaymentSuccess,
    },
    {
        path: '/ad-campaigns/payment-success',
        element: PaymentSuccess,
    },
    {
        path: '/ad-campaigns/payment-failed',
        element: PaymentFailed,
    },
    {
        path: '/fundraisers/payment-failed',
        element: PaymentFailed,
    },
    {
        path: '/fundraisers',
        element: FundraisingPage,
    }
]

