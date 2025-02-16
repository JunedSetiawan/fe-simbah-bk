import type { AuthProvider } from "@refinedev/core";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const cookieStore = cookies();
    const auth = cookieStore.get("auth");

    if (auth) {
      try {
        await jwtVerify(auth.value, secret);
        return {
          authenticated: true,
        };
      } catch (error) {
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
        };
      }
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
