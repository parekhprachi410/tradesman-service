import axios from "axios";

const api = axios.create({
    baseURL:
    "https://scaling-space-halibut-7vjqqg967prqc4vg-5000.app.github.dev/api"
});

export default api;