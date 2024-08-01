package hci.framework.control;

import hci.framework.model.DetailObject;
import hci.framework.security.SecurityAdvisor;
import hci.framework.utilities.DetailLoader;
import hci.gnomex.utility.HttpServletWrappedRequest;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.HashMap;

/**
 * Description of the Class
 *
 * @author Kirt Henrie
 * @created August 17, 2002
 */
public abstract class Command extends DetailObject implements Serializable {

    HashMap invalidFields;
    String responsePage;
    DetailLoader loader;
    /**
     * Flag to tell the front controller to redirect the response instead of forwarding
     */
    boolean redirect;
    /**
     * Property to hold an instance of security advisor
     */
    SecurityAdvisor securityAdvisor;


    /**
     * Constructor for the Command object
     */
    public Command() {
    }


    /**
     * The callback method in which your business logic should be placed
     *
     * @return Returns the processed command
     */
    public abstract Command execute() throws RollBackCommandException;


    /**
     * The callback method where request processing should be placed (ex. load DetailObject from
     * the http request, validate data, etc.)
     *
     * @param request The HttpServletRequest object
     * @param session The HttpSession object
     */
    public abstract void loadCommand(HttpServletWrappedRequest request, HttpSession session);


    /**
     * The method in which any final validation logic could be placed, this method
     * should be called in the loadCommand before setting the response jsp
     */
    public abstract void validate();


    /**
     * A callback that allows you to manipulate the request object prior to forwarding to the
     * result JSP (add the results of the command execution, etc.)
     *
     * @param request The HttpServletRequest for this command
     * @return The processed HttpServletRequest
     */
    public abstract HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request);


/*
    public HttpServletRequest setRequestState(HttpServletRequest request) {
        return setRequestState ((HttpServletWrappedRequest) request);
    };
*/
    /**
     * A callback method that allows you to manipulate the response object prior to forwarding to
     * the result JSP
     *
     * @param response The HttpServeltResponse for this command
     * @return The processed HttpServletResponse
     */
    public abstract HttpServletResponse setResponseState(HttpServletResponse response);


    /**
     * A callback method that allows you to add, remove, or modify objects in the HttpSession
     * object prior to forwarding to the response JSP
     *
     * @param session The HttpSession
     * @return The processed HttpSession
     */
    public abstract HttpSession setSessionState(HttpSession session);

    /**
     * Adds an entry to the invalidFields HashMap
     *
     * @param fieldName The name of the field to be entered
     * @param message   The message to display
     */
    public void addInvalidField(String fieldName, String message) {
        if (invalidFields == null) {
            invalidFields = new HashMap();
        }
        if (fieldName != null && message != null) {
            invalidFields.put(fieldName, message);
        }
    }

    /**
     * Combines a HashMap of invalid fields with the invalidFields HashMap of this class
     * (used to combine invalid entries from multiple detail objects), this should be called
     * for every detail object loaded in the loadCommand method
     *
     * @param fieldsToAdd The HashMap to be added to the InvalidFields attribute
     */
    public void addInvalidFields(HashMap fieldsToAdd) {
        if (fieldsToAdd != null && fieldsToAdd.size() > 0 && invalidFields == null) {
            invalidFields = new HashMap();
        }
        if (fieldsToAdd != null && fieldsToAdd.size() > 0) {
            invalidFields.putAll(fieldsToAdd);
        }
    }


    /**
     * Returns true if there are no entries in the invalidFields HashMap, otherwise false
     *
     * @return The valid value
     */
    public boolean isValid() {
        return invalidFields == null || invalidFields.size() < 1;
    }


    /**
     * This method loads the specified detail object with the parameters from the
     * HttpServletRequest object specified.  The field names in the request must match the
     * field names in the DetailObject and the DetailObject must have setter methods
     * for each of the fields.  This method also handles the conversion of the string
     * request fields to the appropriate type in the DetailObject (for types Date,
     * BigDecimal, Integer, and any other Java Object that contains a valueOf method).
     * In the event that the request field to be converted can not be converted an
     * entry is put into the DetailObjects invalidFields HashMap.  The returned
     * HashMap is the invalidFields HashMap from the DetailObject which should be
     * put into this classes invalidFields HashMap using the addInvalidFields method.
     *
     * @param request The HttpServletRequest for this command
     * @param detail  The DetailObject to be populated
     * @return The DetailObjects invalidFields HashMap
     */
    public HashMap loadDetailObject(HttpServletWrappedRequest request, DetailObject detail) {
        if (loader == null) {
            loader = new DetailLoader();
        }
        detail = loader.loadDetailFromRequest(request, detail);

        HashMap invalidFields = detail.getInvalidFields();

        return invalidFields;
    }


    /**
     * Returns the html to display an html alert containing all the messages of all
     * the invalid fields in the invalidFields HashMap or an empty String if there
     * are no invalid fields.  This is used in the result JSP to alert the user that
     * there are invalid fields.
     *
     * @return The resulting html
     */
    public String getInvalidFieldJSAlert() {

        if (!isValid()) {
            return "<script language='JavaScript'>alert('" + this.getInvalidFieldsMessage() + "');</script>";
        } else {
            return "";
        }

    }

    /**
     * Returns a string representing the invalid fields from the invalidFields HashMap
     *
     * @return
     */

    public String getInvalidFieldsMessage() {

        if (!isValid()) {
            StringBuffer errorString = new StringBuffer();

            java.util.Iterator iter = this.getInvalidFields().values().iterator();

            while (iter.hasNext()) {
                errorString.append((String) iter.next());
                if (iter.hasNext()) {
                    errorString.append(", ");
                }
            }

            return errorString.toString();
        } else {
            return "";
        }
    }


    /**
     * Gets the invalidFields attribute of the Command object
     *
     * @return The invalidFields value
     */
    public HashMap getInvalidFields() {
        return invalidFields;
    }

    /**
     * Sets the invalidFields attribute of the Command object
     *
     * @param invalidFields The new invalidFields value
     */
    public void setInvalidFields(HashMap invalidFields) {
        this.invalidFields = invalidFields;
    }

    /**
     * Gets the responsePage attribute of the Command object
     *
     * @return The responsePage value
     */
    public String getResponsePage() {
        return responsePage;
    }

    /**
     * Sets the responsePage attribute of the Command object, this is the JSP that
     * the results of the command get forwarded to.  This can be determined by the
     * results of the callback methods on this command.
     *
     * @param responsePage The new responsePage value
     */
    public void setResponsePage(String responsePage) {
        this.responsePage = responsePage;
    }

    /**
     * Returns the value of the redirect attribute
     *
     * @return
     */
    public boolean isRedirect() {
        return redirect;
    }

    /**
     * Sets the redirect flag to indicate that the command should redirect instead of forward to the response jsp
     */
    public void setRedirect(boolean redirect) {
        this.redirect = redirect;
    }

    private void writeObject(ObjectOutputStream oos) throws IOException {
        oos.defaultWriteObject();
    }


    private void readObject(ObjectInputStream ois) throws ClassNotFoundException, IOException {
        ois.defaultReadObject();
    }


    public SecurityAdvisor getSecurityAdvisor() {
        return securityAdvisor;
    }


    public void setSecurityAdvisor(SecurityAdvisor securityAdvisor) {
        this.securityAdvisor = securityAdvisor;
    }

}
