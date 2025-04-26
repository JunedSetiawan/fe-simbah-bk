"use client";

import { dataProvider } from "@rest-data-provider";

const API_URL = process.env.NEXT_PUBLIC_BE_URL as string;

export const dataProviders = dataProvider(API_URL);
