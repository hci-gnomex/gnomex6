/**
 * An immutable representation of an HCI permission entity, which represents a fine grained authorization claim that can
 * define a {@link RoleEntity}.
 *
 * @since 1.0.0
 */
export class PermissionEntity {
  constructor(private domain: string, private actions?: string[], private instances?: string[]) {
  }

  /**
   * An accessor for the domain this permission is defined for (i.e. user, study, specimen, etc...).
   *
   * @returns {string} the domain of this permission
   * @constructor
   */
  get Domain(): string {
    return this.domain;
  }

  /**
   * An accessor for the actions that this permission allows in the specified domain (i.e. create, read, activate, manage
   * etc...). If no actions are defined, this permission claims access to all actions of the specified domain.
   *
   * @returns {string[]} an array of actions for the specified domain
   * @constructor
   */
  get Actions(): string[] {
    return this.actions;
  }

  /**
   * An accessor for the instances that this permission is applicable to in the specified domain (i.e. joe, 1234, study-foo,
   * etc...). If no instances are defined, this permission claims applicability to all instances of the specified domain.
   * @returns {string[]}
   * @constructor
   */
  get Instances(): string[] {
    return this.instances;
  }
}
