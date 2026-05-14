import AdminPageLayout from "@/components/admin/AdminPageLayout";
import ScriptEditor from "@/components/admin/ScriptEditor";

export default function NewScriptPage() {
  return (
    <AdminPageLayout 
      title="Add New Script" 
      subtitle="Create a new tracking pixel or custom code injection."
      breadcrumbs={[
        { label: "Settings", href: "/admin/settings" },
        { label: "Scripts", href: "/admin/settings/scripts" },
        { label: "New Script" }
      ]}
    >
      <ScriptEditor />
    </AdminPageLayout>
  );
}
