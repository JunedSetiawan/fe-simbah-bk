"use client";

import { Suspense } from "react";

import { Authenticated, useApiUrl } from "@refinedev/core";
import { NavigateToResource } from "@refinedev/nextjs-router";
import { ThemedLayoutV2 } from "@components/layout";
import { Header } from "@components/header";
import { Dashboard } from "@components/dashboard";

export default function IndexPage() {
  const apiUrl = useApiUrl();

  return (
    <Suspense>
      <Authenticated key="home-page">
        <NavigateToResource></NavigateToResource>
        <ThemedLayoutV2 Header={Header}>
          <Dashboard />
        </ThemedLayoutV2>
      </Authenticated>
    </Suspense>
  );
}
