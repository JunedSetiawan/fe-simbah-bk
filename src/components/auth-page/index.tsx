"use client";
import { LoginPage } from "@components/pages/auth/components";
import { AuthPage as AuthPageBase } from "@refinedev/antd";
import type { AuthPageProps } from "@refinedev/core";

export const AuthPage = (props: AuthPageProps) => {
  return <LoginPage {...props} />;
};
