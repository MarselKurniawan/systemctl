import { Bell, Search, User } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="h-[68px] bg-card border-b flex items-center justify-between px-8">
      {/* Search */}
      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Cari apapun..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group pl-1">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md shadow-primary/20">
            SA
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Super Admin</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
