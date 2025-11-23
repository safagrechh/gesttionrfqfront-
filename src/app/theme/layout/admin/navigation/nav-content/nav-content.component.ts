// angular import
import { Component, inject, output } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { environment } from 'src/environments/environment';
import { NavigationItem, NavigationItems } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { UserService } from 'src/app/api';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent {
  private location = inject(Location);
  private userService = inject(UserService);

  // public method
  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  navigations!: NavigationItem[];
  wrapperWidth: number;
  windowWidth = window.innerWidth;

  NavCollapsedMob = output();

  // constructor
  constructor() {
    // Start with a deep copy of the static navigation
    this.navigations = this.cloneItems(NavigationItems);

    // Apply role-based visibility once the current user is known
    this.userService.apiUserMeGet().subscribe(user => {
      const isAdmin = user.role === 2;
      const isEngineer = user.role === 1;
      this.navigations = this.applyRoleVisibility(this.navigations, { isAdmin, isEngineer });
    });
  }

  private cloneItems(items: NavigationItem[]): NavigationItem[] {
    return items.map(item => ({
      ...item,
      children: item.children ? this.cloneItems(item.children) : undefined
    }));
  }

  private applyRoleVisibility(items: NavigationItem[], roles: { isAdmin: boolean; isEngineer: boolean }): NavigationItem[] {
    return items.map(item => {
      const copy: NavigationItem = { ...item };

      // Hide User Management and Historique Management for non-admins
      if (!roles.isAdmin && (copy.id === 'user-manage' || copy.id === 'historique-manage')) {
        copy.hidden = true;
      }

      // Show Assigned RFQ only to engineers
      if (copy.id === 'assigned-rfqs' && !roles.isEngineer) {
        copy.hidden = true;
      }

      // Hide Create RFQ for admin
      if (copy.id === 'create-rfq' && roles.isAdmin) {
        copy.hidden = true;
      }

      // Hide Reclame for admin
      if (copy.id === 'reclame' && roles.isAdmin) {
        copy.hidden = true;
      }

      if (copy.children && copy.children.length) {
        copy.children = this.applyRoleVisibility(copy.children, roles);
      }

      return copy;
    });
  }

  fireOutClick() {
    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;
      if (parent.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
