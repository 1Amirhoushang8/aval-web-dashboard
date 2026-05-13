import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://localhost:7208/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let csrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<void> {
    const response = await apiClient.get("/csrf");
    csrfToken = response.data.token;
}

apiClient.interceptors.request.use((config) => {
    if (csrfToken && ["post", "put", "delete", "patch"].includes(
        config.method?.toLowerCase() ?? "")) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
    return config;
});

// Fetch token as soon as the module loads
fetchCsrfToken();

export default apiClient;