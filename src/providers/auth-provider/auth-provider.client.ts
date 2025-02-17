"use client";

import type { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export const authProviderClient: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch("http://localhost:3333/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const userData = await response.json();

      // Encrypt the token and user data
      const encryptedData = await new SignJWT(userData)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secret);

      Cookies.set("auth", encryptedData, {
        expires: 30,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid username or password",
        },
      };
    }
  },

  logout: async () => {
    Cookies.remove("auth", { path: "/" });
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      try {
        await jwtVerify(auth, secret);
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
  getPermissions: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      try {
        const { payload } = await jwtVerify(auth, secret);
        const token = payload.token as { abilities: string[] };
        return token.abilities;
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  getIdentity: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      try {
        const { payload } = await jwtVerify(auth, secret);

        console.log({
          id: payload.id,
          username: payload.username,
          profileType: payload.profileType,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
          teacher: payload.teacher, // Relasi teacher
          student: payload.student, // Relasi student
          parent: payload.parent, // Relasi parent
        });
        return {
          id: payload.id,
          username: payload.username,
          profileType: payload.profileType,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
          teacher: payload.teacher, // Relasi teacher
          student: payload.student, // Relasi student
          parent: payload.parent, // Relasi parent
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
