interface SidebarNavProps {
  children: React.ReactNode;
  label: string;
}

export default function SidebarNav({ children, label }: Readonly<SidebarNavProps>) {
  return (
    <nav aria-label={label}>
      <ul className="relative ml-0.5 space-y-1 border-l-2 border-border-light dark:border-border-dark md:space-y-0.5">
        {children}
      </ul>
    </nav>
  );
}
