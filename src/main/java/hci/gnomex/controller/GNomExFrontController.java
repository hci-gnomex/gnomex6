package hci.gnomex.controller;

/**
 *  The front controller for the test application
 *
 *@author     Tonya Di Sera
 *@created    August 17, 2002
 */

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;

import java.io.*;
import java.net.InetAddress;
import java.sql.SQLException;
import java.util.Date;
import java.util.*;

import javax.ejb.EJBException;
import javax.mail.Session;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.web.servlet.ShiroHttpServletRequest;
import net.sf.json.JSON;
import net.sf.json.xml.XMLSerializer;

import org.apache.log4j.Logger;

public class GNomExFrontController extends HttpServlet {
private static Logger LOG = Logger.getLogger(GNomExFrontController.class);

  private static String webContextPath;
  private static Session mailSession;
  private static HashMap xmlHintMap = null;

/**
 * Initialize global variables
 *
 * @exception ServletException
 *                Description of the Exception
 */
public void init(ServletConfig config) throws ServletException {
	super.init(config);
	webContextPath = config.getServletContext().getRealPath(Constants.FILE_SEPARATOR);

	// Get the mail session
	try {
		Context ec = (Context) new InitialContext().lookup("java:comp/env");
//		mailSession = (Session) ec.lookup(Constants.MAIL_SESSION);
		mailSession = (javax.mail.Session) ec.lookup(Constants.MAIL_SESSION);
	} catch (Exception me) {
		LOG.error("Error in gnomexFrontController cannot get mail session: ", me);
	}

    initLog4j();

    // we should only do this once
    String hintFile = webContextPath + "/WEB-INF/classes/xmlHints.json";

    JSONtoXML jsonTOxml = new JSONtoXML();
    try {
      xmlHintMap = jsonTOxml.initHints(hintFile);
    } catch (Exception e) {
      System.err.println("[GNomExFrontController] ERROR ERROR unable to initHints: " + e);
      System.err.println("[GNomExFrontController] ERROR ERROR unable to initHints: " + e);
    }
    System.out.println("[GNomExFrontController] xmlHintMap size: " + xmlHintMap.size() + "\nxmlHintMap: " + xmlHintMap);
  } // end of init

public static void setWebContextPath(String theWebContextPath) {
	webContextPath = theWebContextPath;
}

public static String getWebContextPath() {
	return webContextPath;
}

public static Session getMailSession() {
	return mailSession;
}

protected static void initLog4j() {
	String configFile = "";
	configFile = webContextPath + "/WEB-INF/classes/" + Constants.LOGGING_PROPERTIES;
	org.apache.log4j.PropertyConfigurator.configure(configFile);
	if (configFile == null) {
		System.err.println("[GNomExFrontController] No configuration file specified for log4j!");
	}
	org.apache.log4j.PropertyConfigurator.configure(configFile);
}

  /**
   * Process the HTTP Get request
   *
   * @param request1 Description of the Parameter
   * @param response Description of the Parameter
   * @exception ServletException Description of the Exception
   * @exception IOException Description of the Exception
   */
  public void doGet(HttpServletRequest request1, HttpServletResponse response) throws ServletException, IOException {
    doPost(request1, response);
  }

  /**
   * Process the HTTP Post request
   *
   * @param request1 Description of the Parameter
   * @param response Description of the Parameter
   * @exception ServletException Description of the Exception
   * @exception IOException Description of the Exception
   */
  public void doPost(HttpServletRequest request1, HttpServletResponse response) throws ServletException, IOException {
    // wrap the request so we can modify parameters
//      TreeMap  modifiedParameters = new TreeMap<>();
      HttpServletWrappedRequest request = new HttpServletWrappedRequest(request1);

    // get the users session
    HttpSession session = request.getSession(true);

	session.setAttribute("lastGNomExAccessTime", new Long(new Date().getTime()));

	// get our request from the url (prefixing .test)
	String fullURI = request.getRequestURI();
	String requestName = fullURI.substring((fullURI.lastIndexOf(Constants.FILE_SEPARATOR_CHAR) + 1), fullURI.lastIndexOf('.'));

	// restrict commands to local host if request is not secure
	if (!ServletUtil.checkSecureRequest(request, LOG)) {
//		System.out.println(request.getRemoteAddr());
//		System.out.println(InetAddress.getLocalHost().getHostAddress());
		LOG.error("Accessing secure command over non-secure line from remote host is not allowed");
		this.forwardWithError(request, response, "Secure connection is required. Prefix your request with 'https:'");
		return;
	}

	// now get our command class and instantiate
	Class commandClass = null;
	Command commandInstance = null;
	try {
		commandClass = Class.forName("hci.gnomex.controller" + "." + requestName);
		commandInstance = (Command) commandClass.newInstance();

            String username = (request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "guest");
            if (request.getUserPrincipal() != null) {
                commandInstance.setUsername(username);
            }

	} catch (ClassNotFoundException cnfe) {
		LOG.error("Command " + requestName + ".class not found");
		this.forwardWithError(request, response);
		return;
	} catch (IllegalAccessException ias) {
		LOG.error("IllegalAccessException while getting command " + requestName);
		this.forwardWithError(request, response);
		return;
	} catch (InstantiationException ie) {
		LOG.error("Unable to instantiate command " + requestName);
		this.forwardWithError(request, response);
		return;
	}
	// we should have a valid command.

    // If we do not have a security advisor for the session, add error to command
    // But do not require for initial data services and CMD to set the sec advisor
    // If we have a security advisor, add it to the command instance
    if (session.getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY) != null) {
      commandInstance.setSecurityAdvisor((SecurityAdvisor) session.getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY));
    }

	  String username = commandInstance.getUsername();
    if (commandInstance instanceof GNomExCommand) {
		((GNomExCommand) commandInstance).setUserPreferences((UserPreferences) session.getAttribute(UserPreferences.USER_PREFERENCES_SESSION_KEY));
	}

    if (commandInstance.getSecurityAdvisor() == null
        && (requestName.compareTo("ManageDictionaries") != 0 // You can reload dictionary cache without
            // security
            || request.getParameter("action") == null
            || !request.getParameter("action").equals("reload"))
        && (!requestName.startsWith("CreateSecurityAdvisor"))
        && (!requestName.equals("ShowAnalysisDownloadForm"))
        && (!requestName.equals("ShowAnalysisDownloadFormForGuest"))
        && (!requestName.equals("ShowRequestDownloadForm"))
        && (!requestName.equals("ChangePassword"))
        && (!requestName.equals("GetLaunchProperties"))
        && (!requestName.equals("PublicSaveSelfRegisteredAppUser"))
        && (!requestName.equals("ShowRequestDownloadFormForGuest"))
        && (!requestName.equals("ShowExperimentMatrix"))
        && (!requestName.equals("ShowTopicTree"))) {
      LOG.debug("Invalid SecurityAdvisor");
      commandInstance.addInvalidField(
          "SecurityAdvisor", "You must create a SecurityAdvisor in order to run this command.");
    }
    // if command still valid, call the loadCommand method
    if (commandInstance.isValid()) {
      LOG.debug("Calling loadCommand on " + commandClass);
      System.out.println("--->Calling loadCommand on " + commandClass);

      // just testing....
        boolean [] converted = new boolean[1];
        converted[0] = false;
        convertJSONRequesttoXML(request, requestName,converted,username);

      commandInstance.loadCommand(request, session);
    }
    // see if it is valid, if so call execute
    if (commandInstance.isValid()) {
      LOG.debug("--->Forwarding " + commandClass + " to the request processor for execution");
//            System.out.println ("[GNomExFrontController] --->Forwarding " + commandClass + " to the request processor for execution");
            try {
                commandInstance.execute();
            } catch (Exception e) {
                LOG.error("Error in gnomex front controller:", e);
                System.out.println ("Error in gnomex front controller: " +  e);
                StringBuilder requestDump = Util.printRequest(request);
                String serverName = request.getServerName();

			commandInstance.setRequestState(request);

			String errorMessage = (String) request.getAttribute("errorDetails");
			username = commandInstance.getUsername();

                Util.sendErrorReport(HibernateSession.currentSession(), "GNomEx.Support@hci.utah.edu", "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);


			HibernateSession.rollback();
			String msg = null;

			if (requestName.compareTo("ChangePassword") == 0) {
				// Have to place error message here because by the time we get here the ChangePassword instance
				// no longer retains state it was in when RollBackCommandException was thrown
				request.setAttribute("message", "There was a database problem while changing the password.");
				ChangePassword changePwdCommand = (ChangePassword) commandInstance;
				forwardPage(request, response, changePwdCommand.ERROR_JSP);
				return;
			}

			if (requestName.compareTo("PublicSaveSelfRegisteredAppUser") == 0) {
				// Have to place error message here because by the time we get here the PublicSaveSelfRegisteredAppUser instance
				// no longer retains state it was in when RollBackCommandException was thrown
				request.setAttribute("message", "There was a database problem while running the self register command.");
				PublicSaveSelfRegisteredAppUser selfRegisterCommand = (PublicSaveSelfRegisteredAppUser) commandInstance;
				forwardPage(request, response, selfRegisterCommand.responsePageError);
				return;
			}

			if (msg != null) {
				this.forwardWithError(request, response, msg);
			} else {
				LOG.error(e.getClass().getName() + " while executing command " + commandClass);
				LOG.error("The stacktrace for the error:");
				LOG.error(e.getMessage(), e);

                    if (e instanceof GNomExRollbackException
                            && ((GNomExRollbackException) e).getDisplayFriendlyMessage() != null) {
                        this.forwardWithError(request, response, ((GNomExRollbackException) e).getDisplayFriendlyMessage());
                    } else {
                        String exMsg = "";
                        if (e != null && e.getMessage() != null && e.getMessage().indexOf(':') != -1) {
                            exMsg = e.getMessage().substring(e.getMessage().indexOf(':') + 1);
                        } else
                            if (e != null && e.getMessage() != null ) {
                                exMsg = e.getMessage();
                            }
                        this.forwardWithError(request, response, exMsg);
                    }
                }
                return;
            } finally {
                try {
                    HibernateSession.closeSession();
                } catch (Exception ex) {
                    LOG.error("GNomExFrontController: Error closing hibernate session", ex);
                }
            }
        }
        // now set the request state, response state, and session state
        LOG.debug("Calling setRequestState on " + commandClass);
        commandInstance.setRequestState(request);

	LOG.debug("Calling setResponseState on " + commandClass);
	commandInstance.setResponseState(response);

	LOG.debug("Calling setSessionState on " + commandClass);
	commandInstance.setSessionState(session);

	// get our response page
	String forwardJSP = commandInstance.getResponsePage();
    boolean skip = false;
    if (forwardJSP != null) {
        skip = forwardJSP.equals("/getHTML.jsp");
    }
	// if command didn't provide one, default to getJSON.jsp (for error)
	if (forwardJSP == null || forwardJSP.equals("")) {
		forwardJSP = "/message.jsp";
	}

	// Convert it to JSON and give it back
	System.out.println("[GNomExFrontController] requestName: " + requestName);
	String thexml = (String) request.getAttribute("xmlResult");
	String theJSON = (String) request.getAttribute("jsonResult");
	if (theJSON != null) {
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		out.print(theJSON);
		out.flush();
		out.close();
	} else if (thexml != null && !thexml.equals("") && !skip) {

		if (thexml.equals("<SUCCESS/>")) {
			request.setAttribute("statusCode", "SUCCESS");
			forwardPage(request, response, "/message.jsp");
			return;
		}

		if (thexml.length() < 80) {
			System.out.println("WARNING short xml: -->" + thexml + "<--");
		}
		XMLSerializer xmlSerializer = new XMLSerializer();

		boolean hasType = false;
		if (thexml.indexOf("type=") >= 0) {
			hasType = true;
			thexml = thexml.replace(" type="," notype=");
		}
		JSON json = xmlSerializer.read(thexml);
		String thejson = json.toString(2);

		// get rid of the "@
		thejson = thejson.replace("\"@", "\"");

		// if we dealt with the "type" being a JSON keyword then changes things back
		if (hasType) {
			hasType = false;
			thejson = thejson.replace("\"notype\":","\"type\":");
		}

		response.setContentType("application/json; charset=UTF-8");
		// Get the printwriter object from response to write the required json object to the output stream
		PrintWriter out = response.getWriter();
		// Assuming your json object is **jsonObject**, perform the following, it will return your json object
		out.print(thejson);
		out.flush();
		out.close();

		System.out.println("[GNomExFrontController] Returned " + thejson.length() + " bytes of JSON for request " + requestName);
		if (requestName.startsWith("Save")) {
			if (thejson.length() < 1500) {
				System.out.println("[GNomExFrontController] JSON returned: " + thejson + "\n");
			} else {
				String only8k = new String();
				only8k = thejson.substring(0, 1500);
				System.out.println("[GNomExFrontController] JSON returned (1st 1.5K):" + thejson + "\n");
			}
		}

	} else {
		// XLS, PDF, etc. reporting controllers route here
		System.out.println("Empty XML for request: " + requestName);

		if (!commandInstance.isValid()) {
			String tmpMessage = commandInstance.getInvalidFieldsMessage();
			request.setAttribute("message", tmpMessage);
			request.setAttribute("statusCode", "INVALID");
			forwardJSP = "/message.jsp";
		}

		if (commandInstance.isRedirect()) {
			this.sendRedirect(response, forwardJSP);
		} else {
			// forward to our response page
			forwardPage(request, response, forwardJSP);
		}
	}

}

private void forwardWithError(HttpServletRequest request, HttpServletResponse response) {

	String errMsg = "There has been a system error, please try the request again";
	this.forwardWithError(request, response, errMsg);
}

private void forwardWithError(HttpServletRequest request, HttpServletResponse response, String message) {
	String errMsg = message;

	request.setAttribute("message", errMsg);
	request.setAttribute("statusCode", "ERROR");
	this.forwardPage(request, response, "/message.jsp");
}

private void forwardPage(HttpServletRequest request, HttpServletResponse response, String url) {
	LOG.debug("Forwarding response to " + url);
	try {
		getServletContext().getRequestDispatcher(url).forward(request, response);
	} catch (Exception e) {
		LOG.error(e.getClass().getName() + " while attempting to forward to " + url);
		LOG.error("The stacktrace for the error:");
		LOG.error(e.getMessage(), e);
	}
}

private void sendRedirect(HttpServletResponse response, String url) {
	LOG.debug("Redirecting response to " + url);
	try {
		response.sendRedirect(url);
	} catch (Exception e) {
		LOG.error(e.getClass().getName() + " while attempting to redirect to " + url);
		LOG.error("The stacktrace for the error:");
		LOG.error(e.getMessage(), e);
	}
}

  /** Clean up resources */
  public void destroy() {}

  /*
   *   Convert all the parameter values in the httpservletrequest from json to xml
   */
  public void convertJSONRequesttoXML(HttpServletWrappedRequest httpRequest, String requestName, boolean [] converted, String username) {
  	String noConversionNecessary = httpRequest.getParameter("noJSONToXMLConversionNeeded");
  	//if not a param look for it in the header
    if(!Util.isParameterNonEmpty(noConversionNecessary) ){
    	noConversionNecessary = httpRequest.getHeader("noJSONToXMLConversionNeeded");
	}

  	if (Util.isParameterNonEmpty(noConversionNecessary) && Util.isParameterTrue(noConversionNecessary)) {
  		return;
	}

  	boolean debug = false;
    converted[0] = false;

//    System.out.println("[convertRequesttoJSON] *** starting *** " + requestName);

    // are any values XML?
/*
	  System.out.println("****************************************************************************************");
            Enumeration headerNames = httpRequest.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = (String) headerNames.nextElement();
                String theHeader = httpRequest.getHeader(headerName);
                if (theHeader != null && theHeader.length() > 40) {
                    theHeader = theHeader.substring(0,40);
                }
                System.out.println("[convertRequesttoJSON] *BEFORE* headerName: " + headerName + " theHeader: " + theHeader);
            }
	  System.out.println ("---------------------------------------------------------------------------------------");
*/
//	  if (debug) System.out.println("****************************************************************************************");
//	  if (debug) System.out.println ("---------------------------------------------------------------------------------------");
    Enumeration params = httpRequest.getParameterNames();
    while (params.hasMoreElements()) {
      String paramName = (String) params.nextElement();
      if (paramName.contains("JSONString")) {
      		continue;
	}
      String parameterValue = (String) httpRequest.getParameter(paramName);
//      System.out.println("[convertJSONRequesttoXML] paramName: " + paramName + " parameterValue: " + parameterValue);

        // is it JSON?
        if (parameterValue != null
            && parameterValue.length() > 0
            && (parameterValue.startsWith("{") || parameterValue.startsWith("["))) {
          // yes convert it
          String hintKey = requestName + "." + paramName;

          System.out.println("[convertJSONRequesttoXML] **** found a parameterValue to convert **** " + hintKey + " paramName: " + paramName + " parameterValue:\n " + parameterValue);

          JSONtoXML jsonTOxml = new JSONtoXML();

          String xmlParameterValue = null;
          try {
            xmlParameterValue = jsonTOxml.convertJSONtoXML(hintKey, parameterValue, xmlHintMap);
          } catch (Exception e) {
            System.out.println("[GNomExFrontController] ERROR ERROR from jsonTOxml.convertJSONtoXML hintKey: "
                    + hintKey
                    + " parameterValue: "
                    + parameterValue);
            e.printStackTrace();

            	String errorMessage = e.toString();
            	String requestDump1 = "[GNomExFrontController] ERROR ERROR from jsonTOxml.convertJSONtoXML hintKey: " + hintKey ;
            	requestDump1 = requestDump1 + " parameterValue: " + parameterValue + "\n" + Arrays.toString(e.getStackTrace());
				StringBuilder requestDump = new StringBuilder(requestDump1);

			  //String username = "guest";
			  if (username == null) {
			  	username = "Not Specified";
			  }
			  converted[0] = false;
			  Util.sendErrorReport(HibernateSession.currentSession(), "GNomEx.Support@hci.utah.edu", "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);
			  xmlParameterValue = null;
		  }

          // debug ******
          System.out.println("[convertJSONRequesttoXML]  *** AFTER *** paramName: " + paramName + " xmlParameterValue:\n" + xmlParameterValue);

        // Modify the value...
        if (xmlParameterValue != null) {
          httpRequest.setParameter(paramName, xmlParameterValue);
          converted[0] = true;
          }
        } else {
//          System.out.println("[convertJSONRequesttoXML] ** Nothing to convert **");
        }

    } // end of while

    // any parametervalues to change
//    System.out.println("[convertJSONRequesttoXML] *** returning ***: " + converted[0]);
      return;
    }

}
