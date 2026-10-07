package hci.gnomex.utility;

import java.util.LinkedHashMap;
import java.util.Map;

public class XMLTools {

	private static final LinkedHashMap<String, String> escapeCharsXML;
	static {
		// Generates Map with XML special chars and their escaped representations.
		// Insertion order matters: "&" must be replaced first, otherwise the "&" in
		// entities produced by the other replacements gets escaped again.
		escapeCharsXML = new LinkedHashMap<String, String>();
		escapeCharsXML.put("&", "&amp;");
		escapeCharsXML.put("<", "&lt;");
		escapeCharsXML.put(">", "&gt;");
		escapeCharsXML.put("\'", "&apos;");
		escapeCharsXML.put("\"", "&quot;");
	}
	
	public static String escapeXMLChars(String s) {
		  // Iterate over Map and replace any instances of XML special chars in String with escaped representations
		  for (Map.Entry<String, String> entry : escapeCharsXML.entrySet()) {
			  s = s.replace(entry.getKey(), entry.getValue());
		  }
		  
		  return s;
	}
	
	public static String safeXMLValue(Object field) {
		if (field == null) {
			return "";
		}
		
		return escapeXMLChars(field.toString());
	}

}
