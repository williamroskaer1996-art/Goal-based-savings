// Server component — defines the [id] params for static export.
// All pages nested under /accounts/[id]/* inherit these params.
export function generateStaticParams() {
  return [{ id: 'savings-1' }, { id: 'checking-1' }];
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
