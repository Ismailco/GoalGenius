import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Goals',
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
