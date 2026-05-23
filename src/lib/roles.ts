export type Role = "super_admin" | "admin" | "treasurer" | "member";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  treasurer: "Treasurer",
  member: "Member",
};

export const ROLE_ORDER: Role[] = ["super_admin", "admin", "treasurer", "member"];

export function hasRole(role: Role | undefined, allowed: Role[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export function canManageUsers(role?: Role) {
  return hasRole(role, ["super_admin", "admin"]);
}
export function canManageContributions(role?: Role) {
  return hasRole(role, ["super_admin", "admin", "treasurer"]);
}
export function canManageEvents(role?: Role) {
  return hasRole(role, ["super_admin", "admin"]);
}
export function canUploadMedia(role?: Role) {
  return hasRole(role, ["super_admin", "admin"]);
}
