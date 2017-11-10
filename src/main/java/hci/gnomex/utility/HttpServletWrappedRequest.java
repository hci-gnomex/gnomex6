package hci.gnomex.utility;

import java.util.Collections;
import java.util.Enumeration;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

/**
 * Usage: "request" is the current HttpServletRequest
 * Map<String, String[]> extraParams = new TreeMap<String, String[]>()
 * HttpServletRequest wrappedRequest = new HttpServletWrappedRequest(request, extraParams);
 *
 */

public class HttpServletWrappedRequest extends HttpServletRequestWrapper
{
    private final TreeMap<String, String[]> modifiableParameters;
    private TreeMap<String, String[]> allParameters = null;
    boolean debug = false;

    /**
     * Create a new request wrapper that will merge additional parameters into
     * the request object without prematurely reading parameters from the
     * original request.
     * 
     * @param request
     * @param additionalParams
     */
    public HttpServletWrappedRequest(final HttpServletRequest request, final Map<String, String[]> additionalParams)
    {
        super(request);
        modifiableParameters = new TreeMap<String, String[]>();
        if (additionalParams != null) {
            modifiableParameters.putAll(additionalParams);
        }
    }

    public HttpServletWrappedRequest(final HttpServletRequest request)
    {
        super(request);
        modifiableParameters = new TreeMap<String, String[]>();
    }


    @Override
    public String getParameter(final String name)
    {
//        if (debug) System.out.println ("[HttpServletWrappedRequest:getParameter] name: " + name);
        String[] strings = getParameterValues (name);
        if (strings == null) {
            if (debug) System.out.println ("[HttpServletWrappedRequest:getParameter] 1st time name: " + name + " WARNING WARNING not found");
        }
        else {
            String shortvalue = strings[0];
            if (shortvalue.length() > 40) {
                shortvalue = shortvalue.substring(0, 40);
            }
            if (debug) System.out.println("[HttpServletWrappedRequest:getParameter] found: " + name + " size strings: " + strings.length + " short strings[0]: " + shortvalue);
            return strings[0];
        }

        String superstring = super.getParameter(name);
        if (debug) System.out.println ("[HttpServletWrappedRequest:getParameter] 2nd time found: " + name + " as superstring: " + superstring);
        return superstring;
    }

    public void setParameter(final String name, final String value)
    {
        String shortvalue = value;
        if (value.length() > 40) {
            shortvalue = value.substring(0,40);
        }
        if (debug) System.out.println ("[HttpServletWrappedRequest:setParameter] init size: " +  modifiableParameters.size() + " name: " + name + " shortvalue: " + shortvalue);
        String [] values = new String[1];
        values[0] = value;
        modifiableParameters.put(name,values);
        if (debug) System.out.println ("[HttpServletWrappedRequest:setParameter] size of modifiableParameters on exit: " + modifiableParameters.size());
    }

    @Override
    public Map<String, String[]> getParameterMap()
    {
//        if (allParameters == null)
//        {
            allParameters = new TreeMap<String, String[]>();
            allParameters.putAll(super.getParameterMap());
            if (debug) System.out.println ("[HttpServletWrappedRequest:getParameterMap] (super) size: " + allParameters.size() + " local size: " + modifiableParameters.size());
            allParameters.putAll(modifiableParameters);
            if (debug) System.out.println ("[HttpServletWrappedRequest:getParameterMap] RETURNING (total) size: " + allParameters.size());
//        }
        //Return an unmodifiable collection because we need to uphold the interface contract.
//        if (debug) System.out.println ("[HttpServletWrappedRequest:getParameterMap] RETURNING FINAL size: " + allParameters.size());
//        return Collections.unmodifiableMap(allParameters);
          return allParameters;
    }

    public void dumpParameterMap () {
        Enumeration params = getParameterNames();
        while (params.hasMoreElements()) {
            String paramName = (String) params.nextElement();
            String parameterValue = (String) getParameter(paramName);

            String shortvalue = parameterValue;
            if (shortvalue.length() > 40) {
                shortvalue = shortvalue.substring(0,40);
            if (debug) System.out.println("[dumpParameterMap] paramName: " + paramName + " parameterValue: " + shortvalue);
        }
    }
    }



    @Override
    public Enumeration<String> getParameterNames()
    {
        return Collections.enumeration(getParameterMap().keySet());
    }

    @Override
    public String[] getParameterValues(final String name)
    {
        String [] temp = null;
        temp = getParameterMap().get(name);
        if (temp == null) {
            if (debug) System.out.println ("[HttpServletWrappedRequest:getParameterValues] name: " + name + " WARNING WARNING not found");
            return temp;
        }
        if (debug) System.out.println ("[HttpServletWrappedRequest:getParameterValues] found: " + name + " temp size: " + temp.length);
        return temp;
    }
}
