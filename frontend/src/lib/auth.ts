export const getToken = () => localStorage.getItem("hometutors_token");

const parseJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(decoded.split("").map((c) => {
      return `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
    }).join("")));
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const token = getToken();
  const payload = token ? parseJwt(token) : null;
  return payload?.role ?? null;
};

export const getUserId = () => {
  const token = getToken();
  const payload = token ? parseJwt(token) : null;
  return payload?.id ?? null;
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("hometutors_token");
  window.dispatchEvent(new Event("authChange"));
};
