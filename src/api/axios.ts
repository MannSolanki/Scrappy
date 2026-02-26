import axios from 'axios';
import { API_BASE_URL } from '../config/apiBaseUrl';

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Attach JWT to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('scrappy_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 globally (logout if token expired)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('scrappy_token');
            localStorage.removeItem('scrappy_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
