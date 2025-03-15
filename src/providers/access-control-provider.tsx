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

    if (resource === "dashboard" || resource === "profile") {
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

    // Handle Violations resource
    // Handle Violations resource
    // Handle Violations resource
    if (resource === "violations") {
      if (action === "list" || action === "show") {
        // if (isStudent(user) && action === "show") {
        //   const record = params?.record; // Access the violation record

        //   if (isStudent(user) && action === "show") {
        //     // Check if the violation belongs to the current student
        //     if (record && record.studentClass?.student_x_user_id) {
        //       return {
        //         can: user.id === record.studentClass.student_x_user_id,
        //       };
        //     }
        //     return { can: false };
        //   }

        //   if (isParent(user) && action === "show") {
        //     const record = params?.record; // Access the violation record
        //     console.log("Record", record);
        //     // Check if the violation belongs to the parent's child
        //     if (record && record.studentClass?.user?.student?.studentParents) {
        //       const studentParents =
        //         record.studentClass.user.student.studentParents;
        //       return {
        //         can: studentParents.some(
        //           (sp: any) => sp.parentXUserId === user.id
        //         ),
        //       };
        //     }
        //     return { can: false };
        //   }
        // }

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
    if (resource === "homeVisits") {
      if (action === "list" || action === "show") {
        if (isStudent(user) && action === "show") {
          // Check if the home visit belongs to the current student
          const homeVisit = params?.resource;
          if (
            homeVisit &&
            (homeVisit as any).studentClasses &&
            (homeVisit as any).studentClasses.student_x_user_id
          ) {
            return {
              can:
                user.id === (homeVisit as any).studentClasses.student_x_user_id,
            };
          }
          return { can: false };
        }

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

    // Handle Counseling resource
    if (resource === "counselings") {
      if (action === "list" || action === "show") {
        if (isStudent(user) && action === "show") {
          // Check if the counseling belongs to the current student
          const counseling = params?.resource;
          if (
            counseling &&
            (counseling as any).studentClasses &&
            (counseling as any).studentClasses.student_x_user_id
          ) {
            return {
              can:
                user.id ===
                (counseling as any).studentClasses.student_x_user_id,
            };
          }
          return { can: false };
        }

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
