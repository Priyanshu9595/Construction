import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, PageShell, Panel, StatCard } from "../components/ui/AppUI";

export default function ModulePage({
  title,
  subtitle = "This module is connected to the BuildFlow workflow.",
  backTo = "/app",
}) {
  const navigate = useNavigate();

  return (
    <PageShell
      eyebrow="BuildFlow Module"
      title={title}
      description={subtitle}
      actions={
        <>
          <Button onClick={() => navigate(backTo)} variant="secondary">
            <ArrowLeft size={16} /> Dashboard
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {["Live data", "Role access", "Audit ready"].map((label) => (
          <StatCard
            key={label}
            label={label}
            value="Ready"
            meta="Use the sidebar or dashboard actions to continue working in this area."
            tone="blue"
          />
        ))}
      </div>
      <Panel
        title="Module Workspace"
        description="This page is reserved for deeper workflow screens as the module expands."
      >
        <div className="rounded-lg bg-slate-50 p-5 text-sm font-medium text-slate-600">
          Navigation, permissions, and dashboard entry points are active. Add
          module-specific actions here as workflows mature.
        </div>
      </Panel>
    </PageShell>
  );
}
