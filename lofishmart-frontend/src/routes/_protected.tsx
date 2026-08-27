import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthService } from '@/services/auth.service';
import { MainLayout } from '@/components/layouts/MainLayout';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    if (!AuthService.isAuthenticated()) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: MainLayout,
})
