import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Resume, Session } from "@/client";
import * as apiClient from "@/client";

// Define the shape of the context value
interface SessionContextValue {
  session: Session | null;
  setResume: (resume: Resume | null) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

// Create a provider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setResume = useCallback(
    (resume: Resume | null) => {
      if (session && session.user) {
        setSession({
          ...session,
          user: { ...session.user, userResume: resume },
        });
      }
    },
    [session]
  );

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await apiClient.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error getting session", error);
      }
    };

    setIsLoading(true);
    getSession().finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      document.cookie =
        "sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setSession(null);
    } catch (error) {
      console.error("Error logging out", error);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ setResume, session, isLoading, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
