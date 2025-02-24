import { AccessControlProvider } from "@refinedev/core";
import { authProviderClient } from "./auth-provider/auth-provider.client";
async function checkAccess(resource: string, action: string) {
  // You can implement your server-side permission logic here
  // For example, getting the user's role from session/token
  const permissions = authProviderClient.getPermissions
    ? await authProviderClient.getPermissions()
    : undefined;

  if (resource === "users") {
    return permissions === "superadmin";
  }

  return true;
}
/**
 * Check out the Access Control Provider documentation for detailed information
 * https://refine.dev/docs/api-reference/core/providers/accessControl-provider
 **/
export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    try {
      const result = await checkAccess(resource ?? "", action ?? "");
      return {
        can: result,
      };
    } catch (error) {
      return {
        can: false,
        reason: "Unauthorized",
      };
    }
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
  },
};
