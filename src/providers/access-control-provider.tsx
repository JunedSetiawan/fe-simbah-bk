import { AccessControlProvider } from "@refinedev/core";
import { User, ProfileType } from "@providers/auth-provider/types";

// Helper functions to match your backend policy methods
const isSuperAdmin = (user?: User) => user?.profileType === "Super Admin";
const isAdmin = (user?: User) => user?.profileType === "Umum";
const isTeacher = (user?: User) => user?.profileType === "Guru";
const isStudent = (user?: User) => user?.profileType === "Siswa";
const isParent = (user?: User) => user?.profileType === "Orang Tua";

// Map your backend policies to frontend
// const debug = (message: any, data: any) => {
//   console.log(`[AccessControl] ${message}`, data);
// };

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const record = params?.record; // Access the violation record
    console.log("Record", record);
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return { can: false };
    }

    const user = JSON.parse(userStr) as User;

    if (
      resource === "dashboard" ||
      resource === "profile" ||
      resource === "management-violations"
    ) {
      return { can: true };
    }

    // Handle User resource
    if (resource === "users") {
      return { can: isSuperAdmin(user) };
    }

    // Handle Regulations resource
    if (resource === "regulations") {
      if (action === "create" || action === "edit" || action === "delete") {
        return { can: isSuperAdmin(user) || isAdmin(user) };
      }
      return {
        can: true, // Everyone can view regulations
      };
    }

    if (
      resource === "violations" ||
      resource === "violation-summary/class" ||
      resource === "violation-summary/semester" ||
      resource === "violation-summary/yearly"
    ) {
      if (action === "list" || action === "show") {
        return {
          can:
            isSuperAdmin(user) ||
            isAdmin(user) ||
            isTeacher(user) ||
            isParent(user) ||
            isStudent(user),
        };
      }
      // Rest of your code

      if (action === "generatePdf") {
        return {
          can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
        };
      }

      return {
        can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
      };
    }
    // Default deny for unhandled resources

    // Handle Home Visits resource
    if (resource === "home-visits") {
      if (action === "list" || action === "show") {
        return {
          can:
            isSuperAdmin(user) ||
            isAdmin(user) ||
            isTeacher(user) ||
            isStudent(user) ||
            isParent(user),
        };
      }
      if (action === "cancel") {
        return {
          can: isSuperAdmin(user) || isAdmin(user),
        };
      }

      return {
        can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
      };
    }

    // Handle Counseling resource
    if (resource === "counselings") {
      if (action === "list" || action === "show") {
        return {
          can:
            isSuperAdmin(user) ||
            isAdmin(user) ||
            isTeacher(user) ||
            isStudent(user) ||
            isParent(user),
        };
      }

      return {
        can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
      };
    }

    // Handle Award resource
    if (resource === "awards") {
      if (action === "list" || action === "show") {
        return {
          can:
            isSuperAdmin(user) ||
            isAdmin(user) ||
            isTeacher(user) ||
            isStudent(user) ||
            isParent(user),
        };
      }

      if (action === "approval") {
        return {
          can: isSuperAdmin(user) || isAdmin(user),
        };
      }

      return {
        can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
      };
    }

    // Handle student-calls resource
    if (resource === "student-calls") {
      if (action === "list" || action === "show") {
        return {
          can:
            isSuperAdmin(user) ||
            isAdmin(user) ||
            isTeacher(user) ||
            isStudent(user) ||
            isParent(user),
        };
      }

      return {
        can: isSuperAdmin(user) || isAdmin(user) || isTeacher(user),
      };
    }

    // Default deny
    return { can: false };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: true,
    },
  },
};
