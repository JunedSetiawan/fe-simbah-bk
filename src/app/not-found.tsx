"use client";

import { ErrorComponent } from "@refinedev/antd";
import { Authenticated } from "@refinedev/core";
import { Suspense } from "react";
import { ThemedLayoutV2 } from "@components/layout";
import { Header } from "@components/header";

export default function NotFound() {
  return (
    <Suspense>
      <Authenticated key="not-found">
        <ThemedLayoutV2 Header={Header}>
          <ErrorComponent />
        </ThemedLayoutV2>
      </Authenticated>
    </Suspense>
  );
}
