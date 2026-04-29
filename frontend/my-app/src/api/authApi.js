import api from "./axios";

// ─── LOGIN ─────────────────────────────────────────────
export const loginApi = async (data) => {
  return api.post("/users/login", data);
};

// ─── REGISTER ──────────────────────────────────────────
export const registerApi = async (data) => {
  return api.post("/users/register", data);
};

// ─── GET CURRENT USER ──────────────────────────────────
export const getMeApi = async () => {
  return api.get("/users/me");
};

// ─── UPDATE PROFILE ────────────────────────────────────
export const updateProfileApi = async (data) => {
  return api.put("/users/profile", data);
};

// ─── CHANGE PASSWORD ───────────────────────────────────
export const changePasswordApi = async (data) => {
  return api.put("/users/change-password", data);
};

// ─── DELETE ACCOUNT ────────────────────────────────────
export const deleteAccountApi = async () => {
  return api.delete("/users/account");
};