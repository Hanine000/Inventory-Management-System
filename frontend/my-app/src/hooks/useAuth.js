import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  loginApi,
  registerApi,
  getMeApi,
  updateProfileApi,
  changePasswordApi,
  deleteAccountApi,
} from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

// ─── LOGIN ─────────────────────────────────────────────────────────────────
export const useLogin = () => {
  const queryClient       = useQueryClient();
  const { login }         = useContext(AuthContext);

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      // Backend shape: { success: true, data: { id, name, email, token } }
      // Axios wraps it:  response.data = { success, data: { ... } }
      const userData = response.data?.data;          // ← { id, name, email, token }

      if (userData?.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        login({ data: userData });                   // AuthProvider.login expects { data: userData }
        queryClient.setQueryData(["me"], userData);
      }
    },
  });
};

// ─── REGISTER ──────────────────────────────────────────────────────────────
export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};

// ─── GET CURRENT USER (/auth/me) ───────────────────────────────────────────
export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMeApi();
      return res.data?.data;                         // { _id, name, email, ... }
    },
    enabled: Boolean(localStorage.getItem("token")),
    staleTime: 1000 * 60 * 10,                       // 10 min
  });
};

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (response) => {
      const updated = response.data?.data;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
        queryClient.setQueryData(["me"], updated);
      }
    },
  });
};

// ─── CHANGE PASSWORD ───────────────────────────────────────────────────────
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
  });
};

// ─── DELETE ACCOUNT ────────────────────────────────────────────────────────
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccountApi,
  });
};