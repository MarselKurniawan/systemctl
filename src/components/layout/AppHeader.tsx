import { Bell, ChevronDown, User, LogOut } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="h-16 gradient-primary flex items-center justify-between px-8 shadow-md">
      <div />
      <div className="flex items-center gap-5">
        <button className="relative text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-secondary text-[9px] font-bold flex items-center justify-center text-secondary-foreground">3</span>
        </button>
        <div className="h-6 w-px bg-primary-foreground/20" />
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-primary-foreground/20">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground">
            <p className="text-sm font-semibold leading-none">Super Admin</p>
            <p className="text-[10px] text-primary-foreground/60 mt-0.5">Administrator</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-primary-foreground/60 group-hover:text-primary-foreground transition-colors" />
        </div>
      </div>
    </header>
  );
}
