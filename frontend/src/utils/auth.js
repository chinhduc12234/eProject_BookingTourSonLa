export const saveAuth = (data) => {

    if (data.token) localStorage.setItem("token", data.token);
    if (data.role) localStorage.setItem("role", data.role);
    if (data.id) localStorage.setItem("userId", data.id);
    if (data.fullName) localStorage.setItem("fullName", data.fullName);
    if (data.email) localStorage.setItem("email", data.email);

    window.dispatchEvent(new Event("auth-change"));
};

export const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");

    window.location.href = "/login";
};

export const getRole = () => {

    return localStorage.getItem("role");
};

export const isLoggedIn = () => {

    return !!localStorage.getItem("token");
};

export const getAuthName = () => {

    return localStorage.getItem("fullName");
};
