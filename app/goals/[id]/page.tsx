import GoalExecutionView from '@/components/app/goals/GoalExecutionView';

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoalExecutionView goalId={id} />;
}
