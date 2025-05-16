import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Milestones',
};

export default function MilestonesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
