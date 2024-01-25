/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
package hci.gnomex.api;

import hci.gnomex.api.dto.UserSessionDTO;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * A stateless session bean providing the REST API for creating, getting and deleting user sessions on the server
 * (i.e. authentication).
 *
 * @author Cody Haroldsen <cody.haroldsen@hci.utah.edu>
 * @since 11/30/2016
 */
@Path("user-session")
public class UserSessionResource {

  /**
   * An end point to request the creation of a persistent user session. The request payload must include:
   * <ul>
   * <li>username</li>
   * <li>password</li>
   * </ul>
   * For example:
   * <pre>
   *   {"username":"u0077682", "password":"temppass"}
   * </pre>
   * <p>
   * The client will be authenticated with the submitted credentials and if that process is successful a user session will
   * be created and a session identifier will be provided in the location header.
   *
   * @param userSessionDTOBuilder a {@link UserSessionDTO.Builder} constructed by the submitted request which should
   *                             include username and password
   * @return a {@code Response} describing the result of this request. Expected response codes:
   * <ul>
   * <li>201 if the client was successfully authenticated</li>
   * <li>400 if the mandatory client credentials are missing.</li>
   * <li>401 if authentication fails with the submitted client credentials.</li>
   * </ul>
   */
  @POST
  @Consumes(MediaType.APPLICATION_JSON)
  public Response login(final UserSessionDTO.Builder userSessionDTOBuilder) {
    UserSessionDTO userSessionDTO = userSessionDTOBuilder.build();

    if(userSessionDTO.getUsername() == null || userSessionDTO.getPassword() == null) {
      throw new WebApplicationException(Response.Status.BAD_REQUEST);
    }

    UsernamePasswordToken token = new UsernamePasswordToken(userSessionDTO.getUsername(), userSessionDTO.getPassword());

    try {
      SecurityUtils.getSubject().login(token);
    } catch (Exception e) {
      return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    return Response.status(Response.Status.CREATED).build();
  }

  /**
   * An end point to delete the active user session. This action effectively logs a user out of the enterprise.
   *
   * @return a {@code Response} describing the result of this request. Expected response codes:
   * <ul>
   * <li>204 if the user session was successfully deleted.</li>
   * <li>404 if an active user session does not exist.</li>
   * </ul>
   */
  @DELETE
  public Response logout() {
    Subject subject = getSubject();

    if(subject.isAuthenticated()) {
      subject.logout();
    } else {
      return Response.status(Response.Status.NOT_FOUND).build();
    }

    return Response.status(Response.Status.NO_CONTENT).build();
  }

  private Subject getSubject() {
    final Subject activeSubject;

    try {
      activeSubject = SecurityUtils.getSubject();
    } catch (Exception e) {
      throw new InternalServerErrorException();
    }

    return activeSubject;
  }
}
