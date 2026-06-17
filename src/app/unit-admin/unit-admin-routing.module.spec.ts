import { routes } from './unit-admin-routing.module';
import { RoleComponent } from './pages/role/role.component';
import { UnitAdminRoleComponent } from './pages/unit-admin-role/unit-admin-role.component';
import { ArchiveComponent } from './pages/archive/archive.component';

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
