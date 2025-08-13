// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState } from "../types";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGitHub: () => void;
  handleGitHubCallback: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME,
  password: import.meta.env.VITE_ADMIN_PASSWORD,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("weblog_auth_token");
    if (token) {
      setAuthState({ isAuthenticated: true, loading: false });
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setAuthState((p) => ({ ...p, loading: true }));
    await new Promise((r) => setTimeout(r, 1000));

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem("weblog_auth_token", "demo_token_123");
      setAuthState({ isAuthenticated: true, loading: false });
      return true;
    }
    setAuthState((p) => ({ ...p, loading: false }));
    return false;
  };

  const loginWithGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_DOMAIN;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}/githubCallback&scope=read:user`;
  };

  const handleGitHubCallback = async (code: string) => {
    // Normally you'd send this `code` to your backend to exchange for an access token
    // For demo, we just mock:
    console.log("GitHub OAuth code:", code);
    localStorage.setItem("weblog_auth_token", "github_oauth_token");
    setAuthState({ isAuthenticated: true, loading: false });
  };

  const logout = () => {
    localStorage.removeItem("weblog_auth_token");
    setAuthState({ isAuthenticated: false, loading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithGitHub,
        handleGitHubCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
