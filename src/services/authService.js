import axios from "axios";

const API_URL = "http://seu-backend-api.com";

export async function loginUser(data) {
    try {
        const response = await axios.post(`${API_URL}/login`, data);
        return response.data; // Retorna os dados do backend
    } catch (error) {
        throw new Error(error.response?.data?.message || "Erro ao realizar login");
    }
}
