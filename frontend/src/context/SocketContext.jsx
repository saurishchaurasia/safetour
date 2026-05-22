import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    const client = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    client.emit("join:user", user.id);
    if (user.role === "admin") client.emit("join:admin");

    client.on("alert:nearby", () => toast.error("Nearby danger alert received"));
    client.on("emergency:new", () => toast.error("New SOS event in admin queue"));
    setSocket(client);

    return () => client.disconnect();
  }, [user]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
