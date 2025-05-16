import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Check-ins',
};

export default function CheckInsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
