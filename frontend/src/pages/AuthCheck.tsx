import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "../store/store";
import { useSelector } from "react-redux";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = (props) => {
  const router = useRouter();
  const isAuth = useAppSelector((state) => state.admin.isAuth);

  useEffect(() => {
    if (!isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

  return <>{props.children}</>;
};

export default AuthCheck;