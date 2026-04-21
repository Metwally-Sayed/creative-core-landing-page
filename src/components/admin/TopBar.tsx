import UserMenu from "./UserMenu";

type Props = { email: string };

export default function TopBar({ email }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-6">
      <div />
      <UserMenu email={email} />
    </header>
  );
}
