package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.Lab;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.*;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GetNewAccountServlet extends HttpServlet {
    private static Logger LOG = Logger.getLogger(GetNewAccountServlet.class);
    private String idCoreFacility;
    private boolean isUniversityUserAuthentication;
    private String publicDataNotice;
    private static String webContextPath;




    protected static void initLog4j() {
        String configFile = "";
        configFile = webContextPath + "/WEB-INF/classes/" + Constants.LOGGING_PROPERTIES;
        org.apache.log4j.PropertyConfigurator.configure(configFile);
        if (configFile == null) {
            System.err.println("[GNomExFrontController] No configuration file specified for log4j!");
        }
        org.apache.log4j.PropertyConfigurator.configure(configFile);
    }

    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        webContextPath = config.getServletContext().getRealPath(Constants.FILE_SEPARATOR);

        initLog4j();

        // we should only do this once
    } // end of init


    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Session sess = null;
        CoreFacility facility = null;
        List<CoreFacility> facilities = new ArrayList<CoreFacility>();

        try {
            JsonObjectBuilder value = null;
            idCoreFacility = req.getParameter("idCoreFacility");

            sess = HibernateSession.currentReadOnlySession("guest");
            PropertyDictionaryHelper.getInstance(sess);
            String siteLogo = "";

            if(idCoreFacility != null){
                siteLogo = PropertyDictionaryHelper.getSiteLogo(sess, Integer.valueOf(idCoreFacility));
            }else{
                siteLogo = PropertyDictionaryHelper.getSiteLogo(sess,null);
            }



            if(idCoreFacility != null){
                List<Lab> labs = new ArrayList<Lab>();
                isUniversityUserAuthentication = false;

                System.out.println("I am in the register user screen");
                isUniversityUserAuthentication = PropertyDictionaryHelper.getInstance(sess).isUniversityUserAuthentication();
                PropertyDictionary dataNote = (PropertyDictionary)sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.PUBLIC_DATA_NOTICE + "'").uniqueResult();
                if(dataNote != null && dataNote.getPropertyValue()!=null && !dataNote.getPropertyValue().equals("")) {
                    publicDataNotice = dataNote.getPropertyValue();
                }
                labs = sess.createQuery("from Lab l where l.isActive = 'Y' order by l.lastName, l.firstName").list();

                JsonArrayBuilder jsonArrayLabs = Json.createArrayBuilder();

                for(Lab l : labs){
                    JsonObject jsonObjectLab = Json.createObjectBuilder()
                            .add("idLab", l.getIdLab())
                            .add("name", l.getName())
                            .build();

                    jsonArrayLabs.add(jsonObjectLab);
                }
                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("Labs", jsonArrayLabs.build())
                        .add("isUniversityUserAuthentication" , isUniversityUserAuthentication ? "Y" : "N");
                if(publicDataNotice != null){
                    value.add( "publicDataNotice", publicDataNotice );
                }

            }else{
                facilities = CoreFacility.getActiveCoreFacilities(sess);
                JsonArrayBuilder jsonArrayFacilities = Json.createArrayBuilder();
                for(CoreFacility cf  :   facilities){
                    JsonObject jsonObjectFacility = Json.createObjectBuilder()
                            .add("idCoreFacility", cf.getIdCoreFacility())
                            .add( "description", cf.getDescription() != null ? cf.getDescription() : "" )
                            .add("display", cf.getDisplay())
                            .build();
                    jsonArrayFacilities.add(jsonObjectFacility);
                }
                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("CoreFacilities", jsonArrayFacilities.build());

            }

            value.add("siteLogo", siteLogo);


            if(value != null){
                JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());
                res.setContentType("application/json; charset=UTF-8");
                jsonWriter.writeObject(value.build());
                jsonWriter.close();
            }else{
                throw new Exception("Json Object is empty");
            }


        } catch (Exception e) {
            LOG.error("An error occurred in GetNewAccountServlet", e);
            res.addHeader("message", e.getMessage());

            JsonObject value = Json.createObjectBuilder()
                    .add("message", e.getMessage())
                    .add("result", "ERROR")
                    .build();
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

            res.setContentType("application/json; charset=UTF-8");
            jsonWriter.writeObject(value);
            jsonWriter.close();

        }finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("An error occurred in GetNewAccountServlet", e);
                }
            }
            res.setHeader("Cache-Control", "max-age=0, must-revalidate");

        }

    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

    }

}
