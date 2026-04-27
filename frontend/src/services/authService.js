import axios from "axios";

const API = "http://localhost:8080/auth";

export const login = (data) => axios.post(`${API}/login`, data);
export const register = (data) => axios.post(`${API}/signup`, data);
