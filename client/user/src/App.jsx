import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { route } from "./routes";
import { useEffect, useState } from "react";
import * as UserService from "~/services/UserService";
import { updateUser } from "./redux/Slices/userSlice";
import { ProtectedRoute } from "./components";
import {
  ForgotPasswordpage,
  HomePage,
  LoginPage,
  RegisterPage,
  ResetPassword,
} from "./pages";
import { jwtDecode } from "jwt-decode";
import SplashScreen from "~/components/SplashScreen";
import PopupAI from "~/components/PopupAI";

function App() {
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const [initialLoading, setInitialLoading] = useState(true);
  const user = useSelector((state) => state?.user);
  const loadingGetDetailUser = user?.loadingGetDetailUserById;
  const isLoading = initialLoading || loadingGetDetailUser;

  useEffect(() => {
    const init = () => {
      if (token && token !== "undefined") {
        const decoded = jwtDecode(token);
        if (decoded?.sub) {
          handleGetDetailUser({ token });
          return;
        }
      }
      setInitialLoading(false);
    };
    init();
  }, []);

  const handleGetDetailUser = async ({ token }) => {
    try {
      setInitialLoading(true);
      const res = await UserService.getMyProfile();
      dispatch(updateUser({ ...res?.result, token }));
    } finally {
      setInitialLoading(false);
    }
  };

  const isLoggedIn = !!token && token !== "undefined";

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div data-theme={theme} className="w-full min-h-[100vh] antialiased">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordpage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<HomePage />} />
        {route.map((route, i) => {
          const Page = route.element;
          return (
            <Route
              key={i}
              path={route.path}
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <PopupAI />
                  <Page />
                </ProtectedRoute>
              }
            />
          );
        })}
      </Routes>
    </div>
  );
}

export default App;
