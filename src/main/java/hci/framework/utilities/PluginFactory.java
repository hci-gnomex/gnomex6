/*
 * Created on Jul 7, 2006
 *
 */
package hci.framework.utilities;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

/**
 * @author sharoldsen
 *
 */
public final class PluginFactory implements Serializable {
	private static int MATCHES_NONE = 0;
	private static int MATCHES_CONTEXT = 1;
	private static int MATCHES_FILTER1 = 2;
	private static int MATCHES_FILTER2 = 3;
	
	private static HashMap factoryMap = new HashMap();
	private HashMap pluginMap;
	
	private PluginFactory() {
		pluginMap = new HashMap();
	}
	
	/**
	 * 
	 * @param con
	 * @return
	 */
	public static synchronized PluginFactory getFactory(Connection con) {
		PluginFactory factory = null;
		
		try {
			//The factory map hashes factories by DB URL, since this package will be available to more than one application, 
			//each with its own DB and attribute configuration tables
			String url = con.getMetaData().getURL();
			url = url.toUpperCase();
			url = url.substring(url.indexOf("DATABASENAME=") + 13);
			url = url.substring(0, url.indexOf(";"));
			
			if (factoryMap.containsKey(url)) {
				factory = (PluginFactory) factoryMap.get(url);				
			}
			else {
				factory = new PluginFactory();
				factory.load(con);
				factoryMap.put(url, factory);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return factory;
	}	
	
	//Query for all attribute configurations with plugins
	public void load(Connection con) {
		try {
			Statement stmt = con.createStatement();
			ResultSet rs = stmt.executeQuery("SELECT p.codeSecurityContext, p.className, p.filter1, p.filter2, p.pluginClassName"
					+ " FROM Plugin p WHERE p.pluginClassName IS NOT NULL");
			
			while (rs.next()) {
				String codeSecurityContext = rs.getString("codeSecurityContext");
				String className = rs.getString("className");
				String filter1 = rs.getString("filter1");
				String filter2 = rs.getString("filter2");
				String pluginClassName = rs.getString("pluginClassName");
				
				//Create plugin configuration entries for each configuration with a plugin
				PluginConfigEntry pce = new PluginConfigEntry(codeSecurityContext, className, filter1, filter2, pluginClassName);
				ArrayList al = (ArrayList) this.pluginMap.get(codeSecurityContext);
				if (al == null) {
					al = new ArrayList();
					this.pluginMap.put(codeSecurityContext, al);
				}
				al.add(pce);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}	
	
	/**
	 * 
	 * @param codeAttributeSecurityContext
	 * @param codeAttributeContext
	 * @param idFilter1
	 * @param idFilter2
	 * @return
	 */
	public ConfigurationPlugin getPlugin(String codeSecurityContext, String className, String filter1, String filter2) {
		ConfigurationPlugin plugin = null;
		
		if(codeSecurityContext != null) {
			//Plugins are hashed by attribute security context (Usually Cancer Group)
			ArrayList al = (ArrayList) this.pluginMap.get(codeSecurityContext);
			if (al != null) {
				int bestMatch = 0;
				PluginConfigEntry bestPlugin = null;
				//Iterate through all plugins for security context (cancer group) and find the one that matches the most filters (if any)
				for (Iterator i = al.iterator(); i.hasNext();) {
					PluginConfigEntry pluginConfigEntry = (PluginConfigEntry) i.next();
					
					int match = pluginConfigEntry.match(codeSecurityContext, className, filter1, filter2);
					if (match > bestMatch) {
						bestPlugin = pluginConfigEntry;
						bestMatch = match;
					}
				}
				
				//If a matching plugin was found, instantiate it
				if (bestPlugin != null && bestPlugin.pluginClassName != null) {
					try {
						Class pluginClass = Class.forName(bestPlugin.pluginClassName, true, Thread.currentThread().getContextClassLoader());
						if (ConfigurationPlugin.class.isAssignableFrom(pluginClass)) {
							plugin = (ConfigurationPlugin) pluginClass.getConstructor(new Class[] {}).newInstance(new Object[] {});
						}
					} catch (InvocationTargetException ex) {	
						ex.printStackTrace();
					} catch (InstantiationException ex) {	
						ex.printStackTrace();
					} catch (NoSuchMethodException ex) {
						ex.printStackTrace();
					} catch (ClassNotFoundException ex) {
						ex.printStackTrace();
					} catch (IllegalAccessException ex) {
						ex.printStackTrace();
					}
				}
			}
		}
		
		return plugin;
	}
	
	
	
	private class PluginConfigEntry {
		public String codeSecurityContext;
		public String className;
		public String filter1;
		public String filter2;
		public String pluginClassName;
		
		public PluginConfigEntry(String codeSecurityContext, String className, String filter1, String filter2, String pluginClassName) {
			this.codeSecurityContext = codeSecurityContext;
			this.className = className;
			this.filter1 = filter1;
			this.filter2 = filter2;
			this.pluginClassName = pluginClassName;
		}
		
		public int match(String codeSecurityContext, String className, String filter1, String filter2) {
			int result = MATCHES_NONE;
			
			//All plugins (configurations) should have a security context
			if (this.codeSecurityContext != null && this.codeSecurityContext.equals(codeSecurityContext)) {
				//More than one plugin (configuration) might match - determine how good the match is
				if (this.className != null && this.filter1 != null && this.filter2 != null 
						&& this.className.equals(className) && this.filter1.equals(filter1) && this.filter2.equals(filter2)) {
					result = MATCHES_FILTER2;
				}
				else if (this.className != null && this.filter1 != null && this.filter2 == null
						&& this.className.equals(className) && this.filter1.equals(filter1)) {
					result = MATCHES_FILTER1;
				}
				else if (this.className != null && this.className.equals(className) && this.filter1 == null && this.filter2 == null) {
					result = MATCHES_CONTEXT;
				}							
			}
			
			return result;
		}
	}
}
