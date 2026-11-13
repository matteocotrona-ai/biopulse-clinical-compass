import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalProvider } from "@/components/bio/PortalProvider";
import { PortalShell } from "@/components/bio/PortalShell";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <PortalProvider>
      <PortalShell>
        <Outlet />
      </PortalShell>
    </PortalProvider>
  );
}
