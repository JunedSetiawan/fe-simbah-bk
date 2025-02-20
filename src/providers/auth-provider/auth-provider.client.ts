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

      // Ambil token yang sebenarnya dari userData.token.token
      const actualToken = userData.token.token;

      // Enkripsi token sebelum disimpan di cookie
      const encryptedToken = await new SignJWT({ token: actualToken })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secret);

      console.log(userData, actualToken);

      // Simpan token yang dienkripsi di cookie
      Cookies.set("auth", encryptedToken, {
        expires: 30,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Simpan data pengguna di localStorage TANPA token
      const userDataWithoutToken = { ...userData };
      delete userDataWithoutToken.token; // Hapus objek token dari data pengguna
      localStorage.setItem("user", JSON.stringify(userDataWithoutToken));

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
    const auth = localStorage.getItem("user");
    if (auth) {
      try {
        const user = JSON.parse(auth);

        console.log({
          id: user.id,
          username: user.username,
          profileType: user.profileType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          teacher: user.teacher, // Relasi teacher
          student: user.student, // Relasi student
          parent: user.parent, // Relasi parent
        });
        return {
          id: user.id,
          username: user.username,
          profileType: user.profileType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          teacher: user.teacher, // Relasi teacher
          student: user.student, // Relasi student
          parent: user.parent, // Relasi parent
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
