import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/lib/require-role";
import { getRoleById } from "@genz/database/roles";
import { RoleEditorForm } from "../../role-editor-form";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Role | Admin",
  description: "Edit role settings and manage granular CRUD permissions.",
};

export default async function EditRolePage({ params }: EditRolePageProps) {
  await requirePermission("employees:write");
  const { id } = await params;

  const role = await getRoleById(id);

  if (!role) {
    notFound();
  }

  return <RoleEditorForm initialRole={role} />;
}
