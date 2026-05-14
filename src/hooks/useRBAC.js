"use client";

import { useSession } from "next-auth/react";
import { can as rbacCan } from "@/lib/rbac";

/**
 * Hook to check permissions on the client side.
 * Usage: const { can } = useRBAC(); 
 *        if (can('products.create')) { ... }
 */
export function useRBAC() {
    const { data: session } = useSession();

    const can = (permissionKey) => {
        if (!session?.user) return false;
        return rbacCan(session.user, permissionKey);
    };

    const isStaff = session?.user?.isStaff || false;
    const roleName = session?.user?.role?.name || "Guest";

    return { can, isStaff, roleName, session };
}
