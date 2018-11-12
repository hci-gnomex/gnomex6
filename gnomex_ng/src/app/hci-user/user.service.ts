import {Injectable, InjectionToken, Inject, isDevMode} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";

import {UserEntity} from "./user.entity";
import {RoleEntity} from "./authorization/role.entity";
import {PermissionEntity} from "./authorization/permission.entity";

export let AUTHENTICATED_USER_ENDPOINT = new InjectionToken<string>("authenticated_user_url");

/**
 * @since 1.0.0
 */
@Injectable()
export class UserService {
  /**
   * The generic error message used when a server error is thrown without a status.
   *
   * @type {string}
   */
  public static GENERIC_ERR_MSG: string = "Server error";

  private _authenticatedUser: UserEntity = null;

  constructor(private _http: HttpClient, @Inject(AUTHENTICATED_USER_ENDPOINT) private _authenticationUserEndpoint: string) {}

  /**
   * An accessor for an {@code Observable<UserEntity>} reflecting the currently authenticated user. If no subject is
   * available, the appropriate response status should be returned from the server to indicate that condition
   * (i.e. 404 - Not Found).
   *
   * @returns {Observable<UserEntity>} the currently authenticated user representation
   */
  public getAuthenticatedUser(): Observable<UserEntity> {
    if (isDevMode() && <any>console && <any>console.debug) {
      console.debug("getAuthenticatedUser");
    }

    if (!this._authenticatedUser) {
      if (isDevMode() && <any>console && <any>console.debug) {
        console.debug("_authenticationUserEndpoint: " + this._authenticationUserEndpoint);
      }

      return this._http.get(this._authenticationUserEndpoint, { observe: "response" }).map((resp: HttpResponse<any>) => {
        if (resp.status === 200) {
          this._authenticatedUser = this.buildUserEntity(resp.body);
          return this._authenticatedUser;
        } else {
          throw new Error("Get authenticated user failed. " + resp.status + ": " + resp.statusText);
        }
      }).catch(this.handleError);
    } else {
      return Observable.of(this._authenticatedUser);
    }
  }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message : UserService.GENERIC_ERR_MSG;

    return Observable.throw(errMsg);
  }

  /**
   * TODO: Add in a deserializer into the entity.
   *
   * @param userJson
   * @returns {UserEntity}
   */
  private buildUserEntity(userJson: any): UserEntity {
    let roles: RoleEntity[] = [];
    if (userJson.roles) {
      userJson.roles.map((role: any) => {
        let permissions: PermissionEntity[];
        if (role.permissions) {
          /* TODO: JEH (10/27/16) - Revisit when we determine how permission are communicated to the client, if necessary */
          permissions = role.permissions.map((permission: any) => {
            return new PermissionEntity(permission.domain, permission.actions, permission.instances);
          });
        }
        roles.push(new RoleEntity(role.roleName, permissions));
      });
    }

    return new UserEntity(userJson.id, userJson.username, roles, userJson.firstname, userJson.lastname, userJson.href);
  }
}
