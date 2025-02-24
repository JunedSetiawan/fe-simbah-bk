"use client";

import { dataProvider } from "@rest-data-provider";

const API_URL = "http://localhost:3333/api";

export const dataProviders = dataProvider(API_URL);
