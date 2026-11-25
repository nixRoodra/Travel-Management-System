import { UserRole } from './role.model';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: readonly UserRole[];
}

export interface NavSection {
  title: string;
  items: readonly NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}
