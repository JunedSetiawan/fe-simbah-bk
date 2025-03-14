import { DevtoolsProvider } from "@providers/devtools";
import { useNotificationProvider, RefineThemes } from "@refinedev/antd";
import { GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import "./global.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { ColorModeContextProvider } from "@contexts/color-mode";
import {
  authProviderClient,
  accessControlProvider,
} from "@providers/auth-provider/auth-provider.client";
import { dataProviders } from "@providers/data-provider";
// import { accessControlProvider } from "@providers/access-control-provider";
import "@refinedev/antd/dist/reset.css";
import {
  ControlFilled,
  ControlOutlined,
  HomeFilled,
  HomeOutlined,
  ReadFilled,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const metadata: Metadata = {
  title: "Refine",
  description: "Generated by create refine app",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en">
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#3f7f80", // warna hijau
              // konfigurasi lainnya
            },
          }}
        >
          <Suspense>
            <RefineKbarProvider>
              <AntdRegistry>
                {/* <ColorModeContextProvider defaultMode={defaultMode}> */}
                <DevtoolsProvider>
                  <Refine
                    routerProvider={routerProvider}
                    dataProvider={dataProviders}
                    notificationProvider={useNotificationProvider}
                    authProvider={authProviderClient}
                    accessControlProvider={accessControlProvider}
                    resources={[
                      {
                        name: "profile",
                        list: "/profile",
                        meta: {
                          label: "My Profile",

                          hide: true,
                        },
                      },
                      {
                        name: "dashboard",
                        list: "/",
                        meta: {
                          label: "Dashboard",
                          icon: <HomeFilled />,
                        },
                      },
                      {
                        name: "users",
                        list: "/users",
                        create: "/users/create",
                        edit: "/users/edit/:id",
                        show: "/users/show/:id",
                        meta: {
                          canDelete: true,
                          label: "Pengguna",
                          icon: <UserOutlined />,
                        },
                      },
                      {
                        name: "regulations",
                        list: "/regulations",
                        create: "/regulations/create",
                        edit: "/regulations/edit/:id",
                        show: "/regulations/show/:id",
                        meta: {
                          canDelete: true,
                          label: "Peraturan Ketertiban",
                          icon: <ControlFilled />,
                        },
                      },
                      {
                        name: "violations",
                        list: "/violations",
                        create: "/violations/create",
                        edit: "/violations/edit/:id",
                        show: "/violations/show/:id",
                        meta: {
                          canDelete: true,
                          label: "Pelanggaran Ketertiban",
                          icon: <ReadFilled />,
                        },
                      },
                      {
                        name: "student-violations",
                        show: "/student-violations/show/:id",
                        meta: {
                          parent: "violations",

                          hide: true,
                        },
                      },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: "PPapVH-nZKuqU-6aYAL4",
                    }}
                  >
                    {children}
                    <RefineKbar />
                  </Refine>
                </DevtoolsProvider>
                {/* </ColorModeContextProvider> */}
              </AntdRegistry>
            </RefineKbarProvider>
          </Suspense>
        </ConfigProvider>
      </body>
    </html>
  );
}
