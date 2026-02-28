package hci.framework.security;


import java.lang.ref.WeakReference;
import java.util.HashMap;

public class SecurityAdvisorWeakMap {
	private static final HashMap<String, WeakReference<SecurityAdvisor>> weakAdvisorMap = new HashMap<String, WeakReference<SecurityAdvisor>>();
	
	private static String getDefaultKey(String applicationName, String userName) {
		return "app:" + applicationName + ",user:" + userName;
	}
	
	public static final SecurityAdvisor get(String key, String userName) {
		String appUserKey = getDefaultKey(key, userName);

		if (weakAdvisorMap.containsKey(appUserKey)) {
			return weakAdvisorMap.get(appUserKey).get();
		}
		else {
			return null;
		}
	}
	
	public static final void put(String key, String userName, SecurityAdvisor securityAdvisor) {
		String appUserKey = getDefaultKey(key, userName);
		weakAdvisorMap.put(appUserKey, new WeakReference<SecurityAdvisor>(securityAdvisor));
	}
}
