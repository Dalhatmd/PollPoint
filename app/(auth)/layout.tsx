export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-10">
      {children}
    </div>
  );
}



