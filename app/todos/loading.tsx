import { AppPage } from '@/components/app/shared/AppPage';
import TasksSkeleton from '@/components/app/todos/TasksSkeleton';

export default function Loading() {
  return <AppPage><TasksSkeleton /></AppPage>;
}
