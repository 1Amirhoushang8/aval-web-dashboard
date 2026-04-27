import axios from "axios";

//http://localhost:4000


const apiClient = axios.create({
    baseURL: "https://localhost:7208/api",
    headers: {
        "Content-Type": "application/json",
    },
});


apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiClient;
