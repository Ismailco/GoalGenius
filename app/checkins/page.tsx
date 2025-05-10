import CheckInsClient from './CheckInsClient';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const dynamic = 'force-dynamic';

export default function CheckInsPage() {
  return <CheckInsClient />;
}
