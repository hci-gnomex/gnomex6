package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.billing.BillingPlugin;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.json.Json;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;

public class CreateBillingItems extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(CreateBillingItems.class);

  private Integer          idRequest;
  private Integer          idBillingPeriod;
  private String           requestXMLString;
  private Document         requestDoc;
  private RequestParser    requestParser;

  private String                propertiesXML;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
      idRequest = Integer.valueOf(request.getParameter("idRequest"));
    }

    if (request.getParameter("requestXMLString") != null && !request.getParameter("requestXMLString").equals("")) {
      requestXMLString = request.getParameter("requestXMLString");
      this.requestXMLString = this.requestXMLString.replaceAll("&", "&amp;");

      try (JsonReader jsonReader = Json.createReader(new StringReader(this.requestXMLString))) {
        requestParser = new RequestParser(jsonReader, this.getSecAdvisor());
      } catch (Exception e) {
        this.addInvalidField( "RequestXMLString", "Invalid request xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestXMLString", e);
      }
    }

    if (request.getParameter("propertiesXML") != null && !request.getParameter("propertiesXML").equals("")) {
      propertiesXML = request.getParameter("propertiesXML");
    }

    if (request.getParameter("idBillingPeriod") != null && !request.getParameter("idBillingPeriod").equals("")) {
      idBillingPeriod = Integer.valueOf(request.getParameter("idBillingPeriod"));
    }

    if (idRequest == null && requestParser == null) {
      this.addInvalidField("CreateBillingItems - idRequest", "idRequest or RequestXMLString is required.");
    }


    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());


      List billingItems = new ArrayList<BillingItem>();

      DictionaryHelper dh = DictionaryHelper.getInstance(sess);
      NumberFormat nf = NumberFormat.getCurrencyInstance();
      HashMap labelMap = new HashMap();

      // Get microarray labels
      List labels = sess.createQuery("SELECT label from Label label").list();
      for(Iterator i = labels.iterator(); i.hasNext();) {
        Label l = (Label)i.next();
        labelMap.put(l.getLabel(), l.getIdLabel());
      }


      // Get the current billing period
      BillingPeriod billingPeriod = null;
      if (idBillingPeriod == null) {
        billingPeriod = dh.getCurrentBillingPeriod();
      } else {
        billingPeriod = dh.getBillingPeriod(idBillingPeriod);
      }
      if (billingPeriod == null) {
        throw new RollBackCommandException("Cannot find current billing period in dictionary");
      }

      // Read the experiment
      Request request = null;
      BillingTemplate billingTemplate = null;
      Set hybs = null;
      Set samples = null;
      Set lanes = null;
      Set labeledSamples = null;
      int x = 0;

      Map labeledSampleChannel1Map = new HashMap();
      Map labeledSampleChannel2Map = new HashMap();
      if (idRequest != null) {
        request = (Request)sess.get(Request.class, idRequest);
        billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);


        // Only admins can create billing items for existing requests
        if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
          throw new RollBackCommandException("Insufficient permission to create new billing items");
        }


        samples = request.getSamples();
        hybs = request.getHybridizations();
        lanes = request.getSequenceLanes();
        Hibernate.initialize(request.getAppUser());

      } else {
        requestParser.parse(sess);
        request = requestParser.getRequest();
        billingTemplate = requestParser.getBillingTemplate();
        Set<BillingTemplateItem> btiSet = requestParser.getBillingTemplateItems();
        for (BillingTemplateItem newlyCreatedItem : btiSet) {
        	billingTemplate.getItems().add(newlyCreatedItem);
        }

        // Clear session here so we don't get caught with an auto-flush later on.
        sess.clear();

        // Admins and users authorized to submit requests can view estimated
        // charges
        Lab l = (Lab)sess.load(Lab.class, request.getIdLab());
        if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING) &&
            !this.getSecAdvisor().isGroupIAmMemberOrManagerOf(request.getIdLab()) && !this.getSecAdvisor().isLabICanSubmitTo(l) && !this.getSecAdvisor().isGroupICollaborateWith(request.getIdLab())) {
          throw new RollBackCommandException("Insufficient permission to view estimated charges");
        }

        if (request.getIdRequest() == null) {
          request.setIdRequest(Integer.valueOf(0));
          request.setNumber("");
        }


        // Plugin assumes lab is initialized on request
        if (request.getIdLab() != null) {
          request.setLab((Lab)sess.load(Lab.class, request.getIdLab()));
        }

        // AppUser
        if (request.getIdAppUser() != null) {
        	AppUser au = (AppUser)sess.load(AppUser.class,  request.getIdAppUser());
            request.setAppUser(au);
        }



        // Plugin assumes slide product initialized on request
        if (request.getIdSlideProduct() != null) {
          SlideProduct slideProduct = (SlideProduct)sess.load(SlideProduct.class, request.getIdSlideProduct());
          request.setSlideProduct(slideProduct);
        }


        hybs = new TreeSet(new HybComparator());
        samples = new TreeSet(new SampleComparator());
        lanes = new TreeSet(new LaneComparator());
        labeledSamples = new TreeSet(new LabeledSampleComparator());


        // Parse the samples.   Consider samples for billing if this
        // is a new request or a qc request being converted to a microarray
        // or next gen sequencing request
        x = 0;
        if (!requestParser.isAmendRequest() || requestParser.getAmendState().equals(Constants.AMEND_QC_TO_SEQ)) {
          for(Iterator i = requestParser.getSampleIds().iterator(); i.hasNext();) {
            String idSampleString = (String)i.next();
            Sample sample = (Sample)requestParser.getSampleMap().get(idSampleString);
            sample.setIdSampleString(idSampleString);
            if (sample.getIdSample() == null) {
              sample.setIdSample(Integer.valueOf(x++));
            }
            PlateWell well = requestParser.getWell(idSampleString);
            if (well != null) {
              Plate plate = requestParser.getPlate(idSampleString);
              if (plate != null) {
                plate.setCodePlateType(PlateType.SOURCE_PLATE_TYPE);
              }
              well.setPlate(plate);
              Set<PlateWell> wells = new TreeSet<PlateWell>(new PlateWellComparator());
              wells.add(well);
              sample.setWells(wells);
            }
            samples.add(sample);
          }
        }

        // Parse the hybs. Plugin just need a thinly initialized Hyb for count purposes in the
        x = 0;
        for(Iterator i = requestParser.getHybInfos().iterator(); i.hasNext();) {
          RequestParser.HybInfo hybInfo = (RequestParser.HybInfo)i.next();
          Hybridization hyb = new Hybridization();
          if (hyb.getIdHybridization() == null) {
            hyb.setIdHybridization(Integer.valueOf(x++));
          }
          hyb.setCodeSlideSource(hybInfo.getCodeSlideSource());
          if (hybInfo.getIdSampleChannel1String() != null && !hybInfo.getIdSampleChannel1String().equals("") && !hybInfo.getIdSampleChannel1String().equals("0")) {
            labeledSampleChannel1Map.put(hybInfo.getIdSampleChannel1String(), null);
          }
          if (hybInfo.getIdSampleChannel2String() != null && !hybInfo.getIdSampleChannel2String().equals("") && !hybInfo.getIdSampleChannel2String().equals("0") ) {
            labeledSampleChannel2Map.put(hybInfo.getIdSampleChannel2String(), null);
          }
          hybs.add(hyb);
        }

        // Use the hybs to initalize the set if labeled samples.
        // Plugin just need number of labeled samples
        x = 0;
        for(Iterator i = labeledSampleChannel1Map.keySet().iterator(); i.hasNext();) {
          Object key = i.next();
          LabeledSample ls = new LabeledSample();
          if (ls.getIdLabeledSample() == null) {
            ls.setIdLabeledSample(Integer.valueOf(x++));
          }
          ls.setIdLabel((Integer)labelMap.get("Cy3"));
          ls.setCodeLabelingReactionSize(LabelingReactionSize.STANDARD);
          ls.setNumberOfReactions(Integer.valueOf(1));
          labeledSamples.add(ls);
        }
        for(Iterator i = labeledSampleChannel2Map.keySet().iterator(); i.hasNext();) {
          Object key = i.next();
          LabeledSample ls = new LabeledSample();
          if (ls.getIdLabeledSample() == null) {
            ls.setIdLabeledSample(Integer.valueOf(x++));
          }
          ls.setIdLabel((Integer)labelMap.get("Cy5"));
          ls.setCodeLabelingReactionSize(LabelingReactionSize.STANDARD);
          ls.setNumberOfReactions(Integer.valueOf(1));
          labeledSamples.add(ls);
        }

        // Parse the sequence lanes
        x = 0;
        for(Iterator i = requestParser.getSequenceLaneInfos().iterator(); i.hasNext();) {
          RequestParser.SequenceLaneInfo laneInfo = (RequestParser.SequenceLaneInfo)i.next();
          SequenceLane lane = new SequenceLane();

          boolean isNewLane = requestParser.isNewRequest() || laneInfo.getIdSequenceLane() == null || laneInfo.getIdSequenceLane().startsWith("SequenceLane");

          if (isNewLane) {
            if (lane.getIdSequenceLane() == null) {
              lane.setIdSequenceLane(Integer.valueOf(x++));
              lane.setIdNumberSequencingCycles(laneInfo.getIdNumberSequencingCycles());
              lane.setIdNumberSequencingCyclesAllowed(laneInfo.getIdNumberSequencingCyclesAllowed());
            }
            lane.setIdSeqRunType(laneInfo.getIdSeqRunType());
            Sample sample = (Sample)requestParser.getSampleMap().get(laneInfo.getIdSampleString());
            lane.setSample(sample);

            lanes.add(lane);

          }
        }


      }

      Set propertyEntries;

      try {
        propertyEntries = SaveRequest.saveRequestProperties( propertiesXML, sess, requestParser, false );
      } catch (Exception e) {
        this.addInvalidField("propertiesXML", "Invalid properties json");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse propertiesXML", e);

        throw e;
      }

      List discountBillingItems = new ArrayList<BillingItem>();

      // Find the appropriate price sheet
      PriceSheet priceSheet = null;
      List priceSheets = sess.createQuery("SELECT ps from PriceSheet as ps").list();
      for(Iterator i = priceSheets.iterator(); i.hasNext();) {
        PriceSheet ps = (PriceSheet)i.next();
        for(Iterator i1 = ps.getRequestCategories().iterator(); i1.hasNext();) {
          RequestCategory requestCategory = (RequestCategory)i1.next();
          if(requestCategory.getCodeRequestCategory().equals(request.getCodeRequestCategory())) {
            priceSheet = ps;
            break;
          }

        }
      }

      if (priceSheet != null) {


        for(Iterator i1 = priceSheet.getPriceCategories().iterator(); i1.hasNext();) {
          PriceSheetPriceCategory priceCategoryX = (PriceSheetPriceCategory)i1.next();
          PriceCategory priceCategory = priceCategoryX.getPriceCategory();

          // Ignore inactive price categories
          if (priceCategory.getIsActive() != null && priceCategory.getIsActive().equals("N")) {
            continue;
          }


          // Instantiate plugin for billing category
          BillingPlugin plugin = null;
          Boolean isDiscount = false;
          if (priceCategory.getPluginClassName() != null) {
            try {
              plugin = (BillingPlugin)Class.forName(priceCategory.getPluginClassName()).newInstance();
              if ( priceCategory.getPluginClassName().toLowerCase().contains( "discount" ) ) {
                isDiscount = true;
              }
            } catch(Exception e) {
              LOG.error("Unable to instantiate billing plugin " + priceCategory.getPluginClassName(), e);
            }

          }

          // Get the billing items
          if (plugin != null) {
            List billingItemsForCategory = plugin.constructBillingItems(sess, idRequest != null ? "" : requestParser.getAmendState(), billingPeriod, priceCategory, request, samples, labeledSamples, hybs, lanes, requestParser != null ? requestParser.getSampleAssays() : null, BillingStatus.PENDING, propertyEntries, billingTemplate);
            if (isDiscount) {
              discountBillingItems.addAll(billingItemsForCategory);
            } else {
              billingItems.addAll(billingItemsForCategory);
            }
          }
        }

      }


      Document doc = new Document(new Element("NewBilling"));


      Element requestNode = new Element("Request");
      requestNode.setAttribute("idRequest", request.getIdRequest().toString());
      requestNode.setAttribute("requestNumber", request.getNumber());
      requestNode.setAttribute("idLab", request.getIdLab().toString());
      requestNode.setAttribute("label", request.getNumber());
      requestNode.setAttribute("submitter", request.getAppUser() != null ? Util.getAppUserDisplayName(request.getAppUser(), this.getUserPreferences()) : "");
      requestNode.setAttribute("codeRequestCategory", request.getCodeRequestCategory());
      requestNode.setAttribute("status", BillingStatus.NEW);
      requestNode.setAttribute("isDirty", "Y");
      requestNode.addContent(billingTemplate.toXML(sess, null, this.getUserPreferences()));
      doc.getRootElement().addContent(requestNode);


      BigDecimal grandInvoicePrice = new BigDecimal(0);
      for(Iterator i = billingItems.iterator(); i.hasNext();) {
        BillingItem bi = (BillingItem)i.next();
        Element billingItemNode = bi.toXMLDocument(null, this.DATE_OUTPUT_SQL).getRootElement();
        if (bi.getIdBillingAccount() != null) {
        	BillingAccount account = sess.load(BillingAccount.class, bi.getIdBillingAccount());
        	if (account != null && account.getAccountName() != null) {
        		billingItemNode.setAttribute("accountName", account.getAccountName());
        	}
        }
        if (bi.getInvoicePrice() != null) {
          grandInvoicePrice = grandInvoicePrice.add(bi.getInvoicePrice());
          billingItemNode.setAttribute("invoicePrice", nf.format(bi.getInvoicePrice().doubleValue()));
        }
        billingItemNode.setAttribute("isDirty", "Y");
        requestNode.addContent(billingItemNode);
      }
      // Add in any discounts
      for(Iterator i = discountBillingItems.iterator(); i.hasNext();) {
        BillingItem bi = (BillingItem)i.next();
        Element billingItemNode = bi.toXMLDocument(null, this.DATE_OUTPUT_SQL).getRootElement();
        if (bi.getIdBillingAccount() != null) {
        	BillingAccount account = sess.load(BillingAccount.class, bi.getIdBillingAccount());
        	if (account != null && account.getAccountName() != null) {
        		billingItemNode.setAttribute("accountName", account.getAccountName());
        	}
        }
        if (bi.getUnitPrice() != null) {
          BigDecimal invoicePrice = bi.getUnitPrice().multiply( grandInvoicePrice );
          bi.setUnitPrice( invoicePrice );
          bi.setInvoicePrice( invoicePrice );
          billingItemNode.setAttribute("invoicePrice", nf.format(bi.getInvoicePrice().doubleValue()));
          billingItemNode.setAttribute("unitPrice", nf.format(bi.getInvoicePrice().doubleValue()));
          grandInvoicePrice = grandInvoicePrice.add(invoicePrice);
        }
        billingItemNode.setAttribute("isDirty", "Y");
        requestNode.addContent(billingItemNode);
      }

      boolean exceedsBillingAccountBalance = false;
      for (BillingAccount account : billingTemplate.getBillingAccounts(sess)) {
    	  StringBuffer buf = new StringBuffer();
          buf.append("SELECT sum(bi.invoicePrice) from BillingItem bi where bi.idBillingAccount = " + account.getIdBillingAccount());
          List rows = sess.createQuery(buf.toString()).list();
          BigDecimal totalChargesToDate = new BigDecimal(0);
          if (rows.size() == 1) {
            totalChargesToDate = (BigDecimal)rows.iterator().next();
            if (totalChargesToDate == null) {
              totalChargesToDate = new BigDecimal(0);
            }
          }

          BigDecimal newCharges = new BigDecimal(0);
          for(Iterator i = billingItems.iterator(); i.hasNext();) {
        	  BillingItem bi = (BillingItem)i.next();
        	  if (bi.getIdBillingAccount().equals(account.getIdBillingAccount())) {
        		  newCharges = newCharges.add(bi.getInvoicePrice());
        	  }
          }
          for(Iterator i = discountBillingItems.iterator(); i.hasNext();) {
        	  BillingItem bi = (BillingItem)i.next();
        	  if (bi.getIdBillingAccount().equals(account.getIdBillingAccount())) {
        		  newCharges = newCharges.add(bi.getInvoicePrice());
        	  }
          }
          totalChargesToDate = totalChargesToDate.add(newCharges);

          account.setTotalChargesToDate(totalChargesToDate);

          if (!exceedsBillingAccountBalance) {
        	  exceedsBillingAccountBalance = account.getTotalDollarAmountRemaining() != null && account.getTotalDollarAmountRemaining().doubleValue() < 0;
          }
      }

      requestNode.setAttribute("invoicePrice", NumberFormat.getCurrencyInstance().format(grandInvoicePrice.doubleValue()));
      requestNode.setAttribute("exceedsBillingAccountBalance", exceedsBillingAccountBalance ? "Y" : "N");

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);

      // We don't want to save anything;
      sess.clear();

    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in CreateBillingItems ", e);
      throw new RollBackCommandException(e.getMessage());
    }
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }

  private Set saveRequestProperties(Session sess, RequestParser requestParser) throws org.jdom.JDOMException {
    Set<PropertyEntry> propertyEntries = new TreeSet<PropertyEntry>(new PropertyEntryComparator());
    // Delete properties
    if (propertiesXML != null && !propertiesXML.equals("")) {
      StringReader reader = new StringReader(propertiesXML);
      SAXBuilder sax = new SAXBuilder();
      Document propsDoc = sax.build(reader);

      // Add properties
      for(Iterator<?> i = propsDoc.getRootElement().getChildren().iterator(); i.hasNext();) {
        Element node = (Element)i.next();
        //Adding dataTracks
        String idPropertyEntry = node.getAttributeValue("idPropertyEntry");

        PropertyEntry pe = null;
        if (idPropertyEntry == null || idPropertyEntry.equals("")) {
          pe = new PropertyEntry();
        } else {
          pe  = PropertyEntry.class.cast(sess.get(PropertyEntry.class, Integer.valueOf(idPropertyEntry)));
        }
        pe.setIdProperty(Integer.valueOf(node.getAttributeValue("idProperty")));
        pe.setValue(node.getAttributeValue("value"));
        pe.setIdRequest( requestParser.getRequest().getIdRequest() );

        propertyEntries.add( pe );
      }
    }
    return propertyEntries;
  }

  public class SampleComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      Sample s1 = (Sample)o1;
      Sample s2 = (Sample)o2;
      return s1.getIdSample().compareTo(s2.getIdSample());

    }
  }
  public class LabeledSampleComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      LabeledSample ls1 = (LabeledSample)o1;
      LabeledSample ls2 = (LabeledSample)o2;
      return ls1.getIdLabeledSample().compareTo(ls2.getIdLabeledSample());

    }
  }
  public class HybComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      Hybridization h1 = (Hybridization)o1;
      Hybridization h2 = (Hybridization)o2;
      return h1.getIdHybridization().compareTo(h2.getIdHybridization());

    }
  }
  public class LaneComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      SequenceLane l1 = (SequenceLane)o1;
      SequenceLane l2 = (SequenceLane)o2;
      return l1.getIdSequenceLane().compareTo(l2.getIdSequenceLane());

    }
  }
}
