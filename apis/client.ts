import { COCKTAIL_DB_URL } from "@/constants/common";
import axios, { AxiosInstance } from "axios";

export const cocktailDBClient:AxiosInstance = axios.create({
    baseURL: COCKTAIL_DB_URL,
})
