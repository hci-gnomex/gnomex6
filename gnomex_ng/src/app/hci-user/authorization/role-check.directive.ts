import {Directive, Input, TemplateRef, ViewContainerRef, isDevMode} from "@angular/core";

import {UserService} from "../user.service";
import {UserEntity} from "../user.entity";

/**
 * A structural directive for adding and removing elements of the client application based on a users <em>role</em>
 * authorization claims.
 *
 * This directive requires the {@link UserService} as a provider.
 *
 * @since 1.0.0
 */
@Directive({
  selector: "[hciHasRole]",
  providers: [UserService]
})
export class RoleCheckDirective {
  protected _lastCheck: boolean = null;

  constructor(protected _viewContainer: ViewContainerRef,
              protected _templateRef: TemplateRef<Object>,
              protected _usrSvc: UserService) {
  }

  /**
   * Calculates the availability of a decorated element based on the authenticated users available roles.
   *
   * @param roleName for the role required to make the decorated element available
   */
  @Input()
  set hciHasRole(roleName: string) {
    if (isDevMode() && <any>console && <any>console.debug) {
      console.debug("hciHasRole");
    }

    this._usrSvc.getAuthenticatedUser().subscribe((authUser: UserEntity) => {
      let found: boolean;

      if (authUser && authUser.Roles) {
        found = authUser.Roles.some((role) => {
          return role.RoleName === roleName;
        });
      } else {
        found = false;
      }

      if (found && (this._lastCheck === null || !this._lastCheck)) {
        this._viewContainer.createEmbeddedView(this._templateRef);
      } else if (!found && (this._lastCheck === null || this._lastCheck)) {
        this._viewContainer.clear();
      }
    }, (error) => {
      // TODO: BHY (08/19/16) - Determine requirements around errors and then REMOVE CONSOLE LOGGING. Display to user,
      // log to external source, gobble?
      // Gobble up the error.
    });
  }
}

