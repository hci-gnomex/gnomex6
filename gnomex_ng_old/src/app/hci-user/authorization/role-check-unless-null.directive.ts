import {Directive, Input, ViewContainerRef, TemplateRef} from "@angular/core";
import {RoleCheckDirective} from "./role-check.directive";
import {UserService} from "../user.service";

/**
 * An extension of the {@link RoleCheckDirective} the only evaluates the role if is it not null or undefined.
 *
 * This directive requires the {@link UserService} as a provider.
 *
 * @since 1.0.0
 */
@Directive({
   selector: "[hciHasRoleUnlessNull]"
})
export class RoleCheckUnlessNullDirective extends RoleCheckDirective {

  private _context: HciHasRoleUnlessNullContext = new HciHasRoleUnlessNullContext();

  constructor(
    _viewContainer: ViewContainerRef,
    _templateRef: TemplateRef<Object>,
    _usrSvc: UserService) {
    super(_viewContainer, _templateRef, _usrSvc);
  }

  @Input()
  set hciHasRoleUnlessNull(roleName: string) {
    if (!roleName) {
      // if the roleName is undefined or null then render
      if (this._context._condition !== true) {
        this._context._condition = true;
        this._updateView();
      }
    } else {
      // otherwise delegate the check to RoleCheckDirective
      this.hciHasRole = roleName;
    }
  }

  private _updateView() {
    this._viewContainer.clear();
    if (this._context._condition) {
      this._viewContainer.createEmbeddedView(this._templateRef, this._context);
    } else {
      this._viewContainer.createEmbeddedView(this._templateRef, this._context);
    }
  }
}

/**
 * I totally ripped off *ngIf source to get this to work correctly to prevent infinit loop rendering.
 */
export class HciHasRoleUnlessNullContext {
  public _condition: boolean = false;
}
