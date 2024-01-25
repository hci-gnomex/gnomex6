
package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.Assay;
import hci.gnomex.model.PlateWell;
import hci.gnomex.model.Primer;
import hci.gnomex.model.Sample;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class PlateWellParser extends DetailObject implements Serializable
{

  private Document doc;
  private Map      wellMap = new HashMap();

  public PlateWellParser(Document doc) {
    this.doc = doc;
  }

  public void init() {
    wellMap = new HashMap();
  }

  public void parse(Session sess) throws Exception {
    PlateWell well = new PlateWell();
    Element root = this.doc.getRootElement();

    for (Iterator i = root.getChildren("PlateWell").iterator(); i.hasNext();) {
      Boolean isNewWell = false;
      Element node = (Element) i.next();

      String idPlateWellString = node.getAttributeValue("idPlateWell");

      if (idPlateWellString==null || idPlateWellString.equals("0")) {

        isNewWell = true;
        well = new PlateWell();

      } else {
        isNewWell = false;
        well = (PlateWell) sess.get(PlateWell.class,
            Integer.parseInt(idPlateWellString));
      }

      this.initializePlateWell(sess, node, well);
      sess.flush();

      if (isNewWell) {
        sess.save(well);
        idPlateWellString = well.getIdPlateWell().toString();
      }
      wellMap.put(idPlateWellString, well);
    }
  }

  protected void initializePlateWell(Session sess, Element n,
      PlateWell well) throws Exception {

    // Sample 
    if (n.getAttributeValue("idSample") != null
        && !n.getAttributeValue("idSample").equals("0")) {

      Sample samp = (Sample) sess.get(Sample.class,
          Integer.valueOf(n.getAttributeValue("idSample")));

      if (samp!=null) {
        well.setIdSample(Integer.valueOf(n.getAttributeValue("idSample")));
        well.setSample(samp);
      }
    } 
    // Request
    if (n.getAttributeValue("idRequest") != null
        && !n.getAttributeValue("idRequest").equals("0")) {
      try {
        well.setIdRequest(Integer.valueOf(n.getAttributeValue("idRequest")));
      } catch (NumberFormatException e) {
        well.setIdRequest(null);
      }
    } else {
      well.setIdRequest(null);
    }
    // Assay
    if (n.getAttributeValue("idAssay") != null
        && !n.getAttributeValue("idAssay").equals("0")) {
      try {
        well.setIdAssay(Integer.valueOf(n.getAttributeValue("idAssay")));
        Assay assay = (Assay) sess.get(Assay.class,well.getIdAssay());
        if ( assay != null ) {
          well.setAssay( assay );
        }
      } catch (NumberFormatException e) {
        well.setIdAssay(null);
      }
    } 
    // Primer
    if (n.getAttributeValue("idPrimer") != null
        && !n.getAttributeValue("idPrimer").equals("0")) {
      try {
        well.setIdPrimer(Integer.valueOf(n.getAttributeValue("idPrimer")));
        Primer primer = (Primer) sess.get(Primer.class,well.getIdPrimer());
        if ( primer != null ) {
          well.setPrimer( primer );
        }
      } catch (NumberFormatException e) {
        well.setIdPrimer(null);
      }
    } 
    // Redo
    if (n.getAttributeValue("redoFlag") != null
        && !n.getAttributeValue("redoFlag").equals("")) {
      well.setRedoFlag(n.getAttributeValue("redoFlag"));
    }
    // Control
    if (n.getAttributeValue("isControl") != null
        && !n.getAttributeValue("isControl").equals("")) {
      well.setIsControl(n.getAttributeValue("isControl"));
    }
    // Row
    if (n.getAttributeValue("row") != null
        && !n.getAttributeValue("row").equals("")) {
      well.setRow(n.getAttributeValue("row"));
    } 
    // Col
    if (n.getAttributeValue("col") != null
        && !n.getAttributeValue("col").equals("")) {
      well.setCol(Integer.valueOf(n.getAttributeValue("col")));
    } 
    // Index
    if (n.getAttributeValue("index") != null
        && !n.getAttributeValue("index").equals("")) {
      well.setPosition(Integer.valueOf(n.getAttributeValue("index")));
    } 

  }

  public Map getWellMap() {
    return wellMap;
  }

  public void setWellMap(Map wellMap) {
    this.wellMap = wellMap;
  }

}
