import {PermissionEntity} from "./permission.entity";

/**
 * An immutable representation of an HCI role entity, which represents an authorization claim associated with an authenticated
 * subject.
 *
 * @since 1.0.0
 */
export class RoleEntity {
  constructor(private roleName: string, private permissions?: PermissionEntity[]) {
  }

  /**
   * An accessor for the name of this role.
   *
   * @returns {string} the role name
   * @constructor
   */
  get RoleName(): string {
    return this.roleName;
  }

  /**
   * An accessor for a collection of {@link PermissionEntity} authorization claims that define this role. Permissions
   * provide a finer grained authorization claim description and are not required.
   *
   * @returns {PermissionEntity[]} a collection of permission entities
   * @constructor
   */
  get Permissions(): PermissionEntity[] {
    return this.permissions;
  }
}
