import { routes } from './unit-admin-routing.module';
import { RoleComponent } from './pages/role-management/manage-role/role.component';
import { UnitAdminRoleComponent } from './pages/role-management/manage-unit-admin/unit-admin-role.component';
import { ArchiveComponent } from './pages/role-management/archive/archive.component';

describe('UnitAdminRoutingModule', () => {
  const childRoutes = routes[0].children || [];

  it('maps legacy unit admin URLs to the current Angular components', () => {
    expect(childRoutes.find((route) => route.path === 'manage-unit-admin')?.component).toBe(UnitAdminRoleComponent);
    expect(childRoutes.find((route) => route.path === 'manage-role')?.component).toBe(RoleComponent);
    expect(childRoutes.find((route) => route.path === 'archive')?.component).toBe(ArchiveComponent);
  });

  it('keeps existing Angular route URLs working', () => {
    expect(childRoutes.find((route) => route.path === 'unit-admin')?.component).toBe(UnitAdminRoleComponent);
    expect(childRoutes.find((route) => route.path === 'role')?.component).toBe(RoleComponent);
  });
});
