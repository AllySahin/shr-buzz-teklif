import { USER_CONFIGS } from "@/config/users";

export function generateStaticParams() {
  return Object.keys(USER_CONFIGS).map((username) => ({
    username,
  }));
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
