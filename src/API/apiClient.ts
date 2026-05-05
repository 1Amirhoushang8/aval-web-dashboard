import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://localhost:7208/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let csrfRequestToken: string | null = null;

export const initCsrfToken = async (): Promise<string | null> => {
    try {
        const response = await apiClient.get("/csrf");
        csrfRequestToken = response.data.token;
        return csrfRequestToken;
    } catch {
        return null;
    }
};

const ensureCsrfRequestToken = async (): Promise<string | null> => {
    if (!csrfRequestToken) {
        await initCsrfToken();
    }
    return csrfRequestToken;
};

apiClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase() ?? "";
    if (["post", "put", "delete", "patch"].includes(method)) {
        const reqToken = await ensureCsrfRequestToken();
        if (reqToken) {
            config.headers["X-CSRF-TOKEN"] = reqToken;
        }
    }

    return config;
});

export default apiClient;