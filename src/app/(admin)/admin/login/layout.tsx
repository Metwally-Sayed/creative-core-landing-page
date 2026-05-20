export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-admin className="min-h-screen">
      {children}
    </div>
  );
}
