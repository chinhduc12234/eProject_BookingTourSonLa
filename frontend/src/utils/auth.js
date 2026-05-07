export const saveAuth = (data) => {

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
};

export const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "/login";
};

export const getRole = () => {

    return localStorage.getItem("role");
};

export const isLoggedIn = () => {

    return !!localStorage.getItem("token");
};