"use client";

import { Suspense } from "react";

import { Authenticated } from "@refinedev/core";
import { NavigateToResource } from "@refinedev/nextjs-router";
import { ThemedLayoutV2 } from "@components/layout";
import { Header } from "@components/header";

export default function IndexPage() {
  return (
    <Suspense>
      <Authenticated key="home-page">
        <NavigateToResource></NavigateToResource>
        <ThemedLayoutV2 Header={Header}> Hello World</ThemedLayoutV2>
      </Authenticated>
    </Suspense>
  );
}
