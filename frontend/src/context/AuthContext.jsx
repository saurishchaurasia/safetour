import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("sts_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sts_token");
    if (!token) return;
    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("sts_user", JSON.stringify(data.user));
      })
      .catch(() => logout());
  }, []);

  async function authenticate(path, payload) {
    setLoading(true);
    try {
      const { data } = await api.post(path, payload);
      localStorage.setItem("sts_token", data.token);
      localStorage.setItem("sts_user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Welcome to SafeTrail");
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("sts_token");
    localStorage.removeItem("sts_user");
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    login: (payload) => authenticate("/api/auth/login", payload),
    signup: (payload) => authenticate("/api/auth/signup", payload),
    logout,
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
