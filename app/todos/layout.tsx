import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Todo List',
};

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
