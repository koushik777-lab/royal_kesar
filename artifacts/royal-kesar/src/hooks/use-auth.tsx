import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, useLogin, useLogout, useRegister, User, LoginBody, RegisterBody, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (data: RegisterBody) => Promise<void>;
  login: (data: LoginBody) => Promise<void>;
  adminLogin: (data: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      queryClient.setQueryData(["/api/auth/me"], null);
    }
  }, [token, queryClient]);

  const login = async (data: LoginBody) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      setToken(response.token);
      localStorage.setItem("token", response.token);
      await refetch();
      toast({ title: "Welcome back", description: "Successfully logged in." });
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid credentials", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const adminLogin = async (data: LoginBody) => {
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }
      
      setToken(result.token);
      localStorage.setItem("token", result.token);
      await refetch();
      toast({ title: "Authorized", description: "Admin access granted." });
    } catch (error: any) {
      toast({ 
        title: "Admin login failed", 
        description: error.message || "Invalid admin credentials", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const register = async (data: RegisterBody) => {
    try {
      const response = await registerMutation.mutateAsync({ data });
      setToken(response.token);
      localStorage.setItem("token", response.token);
      await refetch();
      toast({ title: "Welcome", description: "Account created successfully." });
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message || "Could not create account", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      setToken(null);
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        register,
        login,
        adminLogin,
        logout: logoutUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
