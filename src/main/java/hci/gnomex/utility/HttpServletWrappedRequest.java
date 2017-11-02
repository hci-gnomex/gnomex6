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
        String[] strings = getParameterMap().get(name);
        if (strings != null)
        {
            return strings[0];
        }
        return super.getParameter(name);
    }

    public void setParameter(final String name, final String value)
    {
        String [] values = new String[1];
        values[0] = value;
        modifiableParameters.put(name,values);
    }

    @Override
    public Map<String, String[]> getParameterMap()
    {
        if (allParameters == null)
        {
            allParameters = new TreeMap<String, String[]>();
            allParameters.putAll(super.getParameterMap());
            allParameters.putAll(modifiableParameters);
        }
        //Return an unmodifiable collection because we need to uphold the interface contract.
        return Collections.unmodifiableMap(allParameters);
    }

    @Override
    public String getHeader(String value) {
        String theHeader = "";

        return theHeader;
    }

    @Override
    public Enumeration<String> getParameterNames()
    {
        return Collections.enumeration(getParameterMap().keySet());
    }

    @Override
    public String[] getParameterValues(final String name)
    {
        return getParameterMap().get(name);
    }
}
