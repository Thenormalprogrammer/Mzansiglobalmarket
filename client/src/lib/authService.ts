import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerUser(email: string, password: string, name: string, userType: "supplier" | "buyer"): Promise<AuthResponse> {
  const res = await apiRequest("POST", "/api/auth/register", {
    email,
    password,
    name,
    userType,
  });
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiRequest("POST", "/api/auth/login", {
    email,
    password,
  });
  return res.json();
}

export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", {});
}

export function setAuthToken(token: string) {
  localStorage.setItem("token", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function removeAuthToken() {
  localStorage.removeItem("token");
}

export function setCurrentUser(user: User) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function removeCurrentUser() {
  localStorage.removeItem("currentUser");
}
