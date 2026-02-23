import { COCKTAIL_DB_URL, COCKTAIL_NINJAS_URL } from "@/constants/common";
import axios, { AxiosInstance } from "axios";

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";

export const client:AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const cocktailDBClient:AxiosInstance = axios.create({
    baseURL: COCKTAIL_DB_URL,
    timeout: 10000,
})

export const cocktailNinjasClient:AxiosInstance = axios.create({
    baseURL: COCKTAIL_NINJAS_URL,
    timeout: 10000,
})
