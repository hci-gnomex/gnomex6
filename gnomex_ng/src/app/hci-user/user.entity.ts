import {RoleEntity} from "./authorization/role.entity";

/**
 * An immutable representation of an HCI user entity.
 *
 * @since 1.0.0
 */
export class UserEntity {
  constructor(private id: string,
              private username: string,
              private roles?: RoleEntity[],
              private firstname?: string,
              private lastname?: string,
              private href?: string) {
  }

  /**
   * An accessor for the users system id.
   *
   * @returns {string} the system id
   * @constructor
   */
  get Id(): string {
    return this.id;
  }

  /**
   * An accessor for the users application identifier/username.
   *
   * @returns {string} the application id/username
   * @constructor
   */
  get Username(): string {
    return this.username;
  }

  /**
   * An accessor for the users assigned role authorization claims.
   *
   * @returns {@code RoleEntity[]} the role authorization claims
   * @constructor
   */
  get Roles(): RoleEntity[] {
    return this.roles;
  }

  /**
   * An accessor for the users firstname.
   *
   * @return {string} the firstname
   * @constructor
   */
  get Firstname(): string {
    return this.firstname;
  }

  /**
   * A accessor for the users lastname.
   *
   * @return {string} the lastname
   * @constructor
   */
  get Lastname(): string {
    return this.lastname;
  }

  /**
   * A access for the users fully qualified href location on the system.
   *
   * @return {string} the href location
   * @constructor
   */
  get Href(): string {
    return this.href;
  }

}
