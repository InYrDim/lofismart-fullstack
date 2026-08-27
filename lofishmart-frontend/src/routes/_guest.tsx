import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthService } from '@/services/auth.service';
import { getRoleId, checkRoleAny } from '@/hooks/useRoleAndPermission';
import { ROLES } from '@/config/roles';

export const Route = createFileRoute('/_guest')({
    beforeLoad: () => {
        if (AuthService.isAuthenticated()) {
            const user = AuthService.getCurrentUser();
            const roleId = getRoleId(user);
            const isAdminOrManager = checkRoleAny(roleId, ROLES.ADMIN, ROLES.MANAGER);
            throw redirect({
                to: isAdminOrManager ? '/dashboard' : '/pos',
            });
        }
    },
    component: () => <Outlet />,
});
