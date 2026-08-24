import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        // Map user data to match expected format in app
        setUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email.split("@")[0],
          role: "admin", // forcing admin for demo purposes
          user_id: session.user.id
        });
        localStorage.setItem(`nomad_user_${session.user.id}`, JSON.stringify({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email.split("@")[0],
          role: "admin",
          user_id: session.user.id
        }));
        return;
      }
    } catch (err) {
      console.warn("Auth check error, falling back to mock:", err);
    }
    
    // Fallback logic
    const mockUser = localStorage.getItem("mock_admin_user");
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      // Supabase automatically handles the hash internally, just wait a bit
    }
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email.split("@")[0],
          role: "admin", // forcing admin
          user_id: session.user.id
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const loggedUser = {
        ...data.user,
        name: data.user.user_metadata?.name || email.split("@")[0],
        role: "admin",
        user_id: data.user.id
      };
      setUser(loggedUser);
      localStorage.setItem("mock_admin_user", JSON.stringify(loggedUser));
      localStorage.setItem(`nomad_user_${loggedUser.user_id}`, JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      console.warn("Supabase login failed, using fallback mock", err);
      const mockUser = {
        email,
        name: email.split("@")[0],
        role: "admin",
        user_id: "mock-user-" + Date.now(),
        id: "mock-user-" + Date.now()
      };
      setUser(mockUser);
      localStorage.setItem("mock_admin_user", JSON.stringify(mockUser));
      localStorage.setItem(`nomad_user_${mockUser.user_id}`, JSON.stringify(mockUser));
      return mockUser;
    }
  };

  const register = async (payload) => {
    const { email, password, name } = payload;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0]
          }
        }
      });
      
      if (error) throw error;
      
      const newUser = {
        ...data.user,
        name: name || email.split("@")[0],
        role: "admin",
        user_id: data.user.id
      };
      setUser(newUser);
      localStorage.setItem("mock_admin_user", JSON.stringify(newUser));
      localStorage.setItem(`nomad_user_${newUser.user_id}`, JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      console.warn("Supabase register failed, using fallback mock", err);
      const mockUser = {
        email,
        name: name || email.split("@")[0],
        role: "admin",
        user_id: "mock-user-" + Date.now(),
        id: "mock-user-" + Date.now()
      };
      setUser(mockUser);
      localStorage.setItem("mock_admin_user", JSON.stringify(mockUser));
      localStorage.setItem(`nomad_user_${mockUser.user_id}`, JSON.stringify(mockUser));
      return mockUser;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem("mock_admin_user");
    setUser(null);
  };

  const refresh = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
