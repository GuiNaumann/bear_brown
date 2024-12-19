import axios from "axios";

const API_URL = "http://localhost:8080";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Garante o envio de cookies
});

export async function loginUser(data) {
    try {
        const response = await axiosInstance.post("/login", data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; // Retorna os dados do backend
    } catch (error) {
        console.error("Erro no login:", error.response?.data);
        throw new Error(error.response?.data?.message || "Erro ao realizar login");
    }
}
