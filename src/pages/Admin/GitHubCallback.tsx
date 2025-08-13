// GitHubCallback.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
          navigate("/?error=github_auth_failed");
        }
      });
    } else {
      navigate("/?error=missing_code");
    }
  }, [params, handleGitHubCallback, navigate]);

  return <p>Signing you in with GitHub...</p>;
};
