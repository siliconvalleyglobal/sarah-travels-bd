import { AgentShell } from "@/components/agent-shell";

export default function AgentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentShell>{children}</AgentShell>;
}
