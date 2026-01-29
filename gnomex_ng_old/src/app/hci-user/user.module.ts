import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";

import {UserService} from "./user.service";
import {RoleCheckDirective} from "./authorization/role-check.directive";
import {RoleCheckUnlessNullDirective} from "./authorization/role-check-unless-null.directive";

/**
 * A feature module for user related services, directives, pipes, etc...
 *
 * @since 1.0.0
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    RoleCheckDirective,
    RoleCheckUnlessNullDirective
  ],
  exports: [
    RoleCheckDirective,
    RoleCheckUnlessNullDirective
  ]
})
export class UserModule {
  static forRoot(): ModuleWithProviders {
    return {
      providers: [
        UserService
      ],
      ngModule: UserModule
    };
  }
}
