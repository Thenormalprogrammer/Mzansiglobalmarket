import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  getAuthToken,
  getCurrentUser,
  setAuthToken,
  setCurrentUser,
  removeAuthToken,
  removeCurrentUser,
} from "@/lib/authService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getCurrentUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string, userType: "supplier" | "buyer") => {
    try {
      const { token: newToken, user: newUser } = await registerUser(email, password, name, userType);
      setAuthToken(newToken);
      setCurrentUser(newUser);
      setToken(newToken);
      setUser(newUser);
      setLocation("/");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { token: newToken, user: newUser } = await loginUser(email, password);
      setAuthToken(newToken);
      setCurrentUser(newUser);
      setToken(newToken);
      setUser(newUser);
      setLocation("/");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore errors on logout
    }
    removeAuthToken();
    removeCurrentUser();
    setToken(null);
    setUser(null);
    setLocation("/");
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };
}
