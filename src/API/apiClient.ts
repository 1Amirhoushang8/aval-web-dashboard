import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://localhost:7208/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;