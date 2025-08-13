import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { message, Spin } from "antd";

export const GitHubCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { handleGitHubCallback } = useAuth();

  useEffect(() => {
    const code = params.get("code");
    if (code) {
      handleGitHubCallback(code).then((success) => {
        if (success) {
          navigate("/admin");
        } else {
          message.warning("There is a problem in logging. Try again");
          navigate("/");
        }
      });
    } else {
      message.warning("There is a problem in logging. Try again");
      navigate("/");
    }
  }, [params, handleGitHubCallback, navigate]);

  return (
    <div className="flex flex-col gap-y-4  items-center justify-center min-h-screen">
      <Spin size="large" />
      <div>Signing you in with GitHub...</div>
    </div>
  );
};
