package hci.framework.utilities;


import java.io.IOException;
import java.security.Principal;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.MDC;
public class MDCUserServletFilter implements Filter{
  
  public void init(FilterConfig arg0) throws ServletException
  {
  }

  public void doFilter(ServletRequest request, ServletResponse response,
          FilterChain chain) throws IOException, ServletException
  {
      HttpServletRequest httprequest = (HttpServletRequest) request;
      Principal user = httprequest.getUserPrincipal();

      boolean bUserAdded = false;
      if (user != null)
      {
          String strUser = user.getName();
          if (strUser != null && strUser.length() > 0)
          {
              // Put the principal's name into the message diagnostic
              // context. May be shown using %X{username} in the layout
              // pattern.
              MDC.put("username", strUser);
              bUserAdded = true;
          }
      }

      try
      {
          // Continue processing the rest of the filter chain.
          chain.doFilter(request, response);
      }
      finally
      {
          if (bUserAdded)
          {
              // Remove the added element again - only if added.
              MDC.remove("username");
          }
      }
  }

  public void destroy()
  {
  }
}
