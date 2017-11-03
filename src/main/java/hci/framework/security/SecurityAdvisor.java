/*
 * Created on Dec 20, 2005
 *
 */
package hci.framework.security;

import hci.framework.model.DetailObject;

import java.util.Set;

/**
 * @author sharoldsen
 *
 */
public interface SecurityAdvisor {
  public Set getGlobalPermissions();
  public boolean hasPermission(String permission);
	public boolean canRead(DetailObject detailObject) throws UnknownPermissionException;
  public boolean canRead(DetailObject detailObject, int dataProfile) throws UnknownPermissionException;
	public boolean canDelete(DetailObject detailObject) throws UnknownPermissionException;
	public boolean canUpdate(DetailObject detailObject) throws UnknownPermissionException;
	public boolean canUpdate(Class c) throws UnknownPermissionException;
  public boolean canUpdate(DetailObject detailObject, int dataProfile) throws UnknownPermissionException;
  public void scrub(DetailObject detailObject) throws UnknownPermissionException;
}
