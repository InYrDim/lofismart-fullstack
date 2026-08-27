import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { AuthContextType } from '@/context/AuthContextDef';

interface MyRouterContext {
  auth: AuthContextType;
}

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <TooltipProvider>
      <Outlet />
      <Toaster position="top-right" />
      <TanStackRouterDevtools />
    </TooltipProvider>
  ),
})
