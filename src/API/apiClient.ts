import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://localhost:7208/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ---------- CSRF token management ----------
let csrfToken: string | null = null;

// Call this ONCE after the app starts (or after login) to get a fresh token
export async function fetchCsrfToken(): Promise<void> {
    const response = await apiClient.get("/csrf");
    csrfToken = response.data.token;
}


apiClient.interceptors.request.use((config) => {
    if (
        csrfToken &&
        ["post", "put", "delete", "patch"].includes(
            config.method?.toLowerCase() ?? ""
        )
    ) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
    return config;
});


fetchCsrfToken();

export default apiClient;