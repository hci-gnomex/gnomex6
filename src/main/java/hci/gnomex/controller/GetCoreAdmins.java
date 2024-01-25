package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;
/**
 * Created by u0395021 on 7/29/2016.
 */
public class GetCoreAdmins extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(GetRequest.class);

    private Integer idCoreFacility;

    @Override
    public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {
        if (request.getParameter("idCoreFacility") != null && !request.getParameter("idCoreFacility").equals("")) {
            idCoreFacility = Integer.valueOf(request.getParameter("idCoreFacility"));
        } else{
            this.addInvalidField("idCoreFacility", "idCoreFacility must be provided");
        }

    }

    @Override
    public Command execute() throws RollBackCommandException {
        try{
            if(this.isValid()){
                Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
                Query q = sess.createQuery("Select au from AppUser au JOIN au.managingCoreFacilities as cf where cf.idCoreFacility = :idCoreFacility and au.isActive = 'Y' ");
                q.setParameter("idCoreFacility", idCoreFacility);
                List admins = q.list();

                Document doc = new Document(new Element("AdminList"));
                // add a blank element
                Element blank = new Element("Admin");
                blank.setAttribute("idAppUser", "");
                blank.setAttribute("display", "");
                doc.getRootElement().addContent(blank);

                for(Iterator<AppUser> i = admins.iterator(); i.hasNext();){
                    AppUser au = i.next();
                    Element admin = new Element("Admin");
                    admin.setAttribute("idAppUser", au.getIdAppUser().toString());
                    admin.setAttribute("display", Util.getAppUserDisplayName(au, this.getUserPreferences()));
                    doc.getRootElement().addContent(admin);
                }

                org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
                this.xmlResult = out.outputString(doc);

                setResponsePage(this.SUCCESS_JSP);

            } else{
                setResponsePage(this.ERROR_JSP);
            }

        }catch(Exception e){
            this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetCoreAdmins ", e);

        }

        return this;
    }

    public void validate() {
    }
}
