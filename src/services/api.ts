// src/services/api.ts

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;