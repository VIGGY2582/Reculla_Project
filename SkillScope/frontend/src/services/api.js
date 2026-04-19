import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to add the JWT token to headers
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle 401 errors
API.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        console.warn("Session expired or unauthorized. Redirecting to login...");
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
});

export default API;

