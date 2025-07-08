import axios from 'axios';
import  keycloak  from './keycloak';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

api.interceptors.request.use(cfg => {
    if (keycloak.token) {
        cfg.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return cfg;
});
