import { ProjectListView } from "./ProjectListView";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const { teamId } = await searchParams;
  return <ProjectListView teamId={teamId} />;
}
