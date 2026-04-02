import { Bell, User } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="h-16 bg-card border-b flex items-center justify-end px-6 gap-4">
      <button className="relative h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
        <Bell className="h-[17px] w-[17px] text-muted-foreground" />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>
      <div className="h-7 w-px bg-border" />
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-none">Super Admin</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Administrator</p>
        </div>
      </div>
    </header>
  );
}
