export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-admin
      className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] p-6 text-[hsl(var(--admin-text))]"
    >
      {children}
    </div>
  );
}
