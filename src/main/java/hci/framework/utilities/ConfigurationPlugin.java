/*
 * Created on Jul 7, 2006
 *
 */
package hci.framework.utilities;

import hci.framework.model.DetailObject;
import hci.framework.security.SecurityAdvisor;

import java.util.HashMap;

/**
 * @author sharoldsen
 *
 */
public interface ConfigurationPlugin {
	
	/**
	 * 
	 * @param detail
	 */
	public void onDisplay(DetailObject detail, String username);
	
	/**
	 * 
	 * @param detail
	 */
	public void onSave(DetailObject detail, SecurityAdvisor securityAdvisor);
	
	/**
	 * 
	 * @param detail
	 */
	public void onCreate(DetailObject detail, SecurityAdvisor securityAdvisor);

	/**
	 * 
	 * @param detail
	 */
	public void onDelete(DetailObject detail, SecurityAdvisor securityAdvisor);
	
	/**
	 * 
	 * @param detail
	 * @param params
	 * @param invalidFields
	 */
	public void onValidate(DetailObject detail, HashMap params, HashMap invalidFields, SecurityAdvisor securityAdvisor);

}
