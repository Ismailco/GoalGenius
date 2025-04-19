import { pageMetadata } from '../metadata';

export const metadata = pageMetadata.profile;

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
