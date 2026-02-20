import { COCKTAIL_DB_URL } from "@/constants/common";
import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const client:AxiosInstance = axios.create({
    baseURL: BASE_URL,
});

export const cocktailDBClient:AxiosInstance = axios.create({
    baseURL: COCKTAIL_DB_URL,
})
