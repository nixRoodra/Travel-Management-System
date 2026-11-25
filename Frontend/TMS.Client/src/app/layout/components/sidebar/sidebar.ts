import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { NavSection } from '../../../shared/models/navigation.model';
import { UserRole } from '../../../shared/models/role.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly sections = input.required<readonly NavSection[]>();
  readonly currentRole = input.required<UserRole>();
  readonly itemSelected = output<void>();

  protected readonly visibleSections = computed(() => {
    const role = this.currentRole();
    return this.sections()
      .map((section) => ({
        title: section.title,
        items: section.items.filter((item) => item.roles.includes(role)),
      }))
      .filter((section) => section.items.length > 0);
  });

  protected onNavigate(): void {
    this.itemSelected.emit();
  }
}
