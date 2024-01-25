package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.Segment;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
public class ImportSegments extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(ImportSegments.class);

  private String             chromosomeInfo;
  private Integer            idGenomeBuild;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("chromosomeInfo") != null && !request.getParameter("chromosomeInfo").equals("")) {
      chromosomeInfo = request.getParameter("chromosomeInfo");
    }
    if (request.getParameter("idGenomeBuild") != null && !request.getParameter("idGenomeBuild").equals("")) {
      idGenomeBuild = Integer.valueOf(request.getParameter("idGenomeBuild"));
    } else {
      this.addInvalidField("idGenomeBuild", "idGenomeBuild is required");
    }


  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      GenomeBuild genomeBuild = (GenomeBuild)sess.load(GenomeBuild.class, idGenomeBuild);


      if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES)) {

        String line;
        int count = 1;
        if (chromosomeInfo != null && !chromosomeInfo.equals("")) {

          //work around, need to test on PC with IE and Firefox!
          Pattern pat = Pattern.compile("^([A-Za-z0-9_.]*)\\s+(\\d+)", Pattern.MULTILINE);
          chromosomeInfo = chromosomeInfo.replaceAll(",", "");
          Matcher mat = pat.matcher(chromosomeInfo);

          while (mat.find()){
            Segment s = new Segment();
            s.setName(mat.group(1));
            s.setLength(Integer.valueOf (mat.group(2)));
            s.setSortOrder(Integer.valueOf(count));
            s.setIdGenomeBuild(genomeBuild.getIdGenomeBuild());
            sess.save(s);
            count++;
          }

          //upload the data
          sess.flush();
        }

        this.xmlResult = "<SUCCESS idGenomeBuild=\"" + idGenomeBuild + "\"/>";

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save data track folder.");
        setResponsePage(this.ERROR_JSP);
      }

    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ImportSegments ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }
}
