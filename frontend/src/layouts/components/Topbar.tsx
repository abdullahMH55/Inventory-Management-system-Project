import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { SidebarNav, Wordmark } from './Sidebar';
import { UserMenu } from './UserMenu';

export function Topbar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  // Background refetches say so here and nowhere else. They must never take the
  // page back to a skeleton: that is the "dashboard flickers on every focus" bug.
  const isFetching = useIsFetching() > 0;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-rule bg-panel px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden />
        </SheetTrigger>

        <SheetContent side="left" className="w-64 bg-panel p-0">
          <SheetHeader className="h-14 justify-center border-b border-rule px-4">
            <SheetTitle render={<span />}>
              <Wordmark />
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-medium">{title}</h1>

      {isFetching ? (
        <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
          Updating
        </span>
      ) : null}

      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
