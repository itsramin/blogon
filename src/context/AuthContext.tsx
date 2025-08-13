import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState } from "../types";

interface AuthContextType extends AuthState {
  loginWithGitHub: () => void;
  handleGitHubCallback: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
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

  const loginWithGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const currentDomain = window.location.origin;
    const redirectUri = `${currentDomain}/githubCallback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user`;
  };

  // AuthContext.tsx
  const handleGitHubCallback = async (code: string): Promise<boolean> => {
    setAuthState((p) => ({ ...p, loading: true }));
    try {
      const mockToken = `github_${code.substring(0, 8)}_${Date.now()}`;
      localStorage.setItem("weblog_auth_token", mockToken);

      setAuthState({ isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      console.error("GitHub authentication failed:", error);
      setAuthState({ isAuthenticated: false, loading: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("weblog_auth_token");
    setAuthState({ isAuthenticated: false, loading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginWithGitHub,
        handleGitHubCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
