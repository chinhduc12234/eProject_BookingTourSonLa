import Swal from "sweetalert2";

export const showSuccess = (title, text) => {
    return Swal.fire({
        icon: "success",
        title,
        text,
        confirmButtonColor: "#7FB77E",
        background: "#0b1f17",
        color: "#fff",
    });
};

export const showError = (title, text) => {
    return Swal.fire({
        icon: "error",
        title,
        text,
        confirmButtonColor: "#A67C52",
        background: "#0b1f17",
        color: "#fff",
    });
};

export const showWarning = (title, text) => {
    return Swal.fire({
        icon: "warning",
        title,
        text,
        confirmButtonColor: "#facc15",
        background: "#0b1f17",
        color: "#fff",
    });
};