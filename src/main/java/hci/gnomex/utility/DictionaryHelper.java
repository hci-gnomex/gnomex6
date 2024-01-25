package hci.gnomex.utility;

import hci.dictionary.model.DictionaryEntry;
import hci.dictionary.model.NullDictionaryEntry;
import hci.dictionary.utility.DictionaryManager;
import hci.gnomex.controller.ManageDictionaries;
import hci.gnomex.model.*;
import org.hibernate.Hibernate;
import org.hibernate.HibernateException;
import org.hibernate.Session;

import java.io.Serializable;
import java.util.*;

public class DictionaryHelper implements Serializable {
  private static DictionaryHelper theInstance;

  private PropertyDictionaryHelper propertyDictionaryHelper;
  private List requestCategoryList = new ArrayList();
  private Map requestCategoryMap = new HashMap();
  private Map productTypeMap = new HashMap();
  private Map oligoBarcodeMap = new HashMap();
  private Map submissionInstructionMap = new HashMap();
  private Map billingPeriodMap = new HashMap();
  private Map seqLibTreatmentMap = new HashMap();
  private Map slideDesignMap = new HashMap();
  private Map propertyDictionaryMap = new HashMap();
  private Map seqLibProtocolsMap = new HashMap();
  private Map<String, RequestCategoryType> requestCategoryTypeMap = new HashMap<String, RequestCategoryType>();
  private List seqRunTypeList = new ArrayList();
  private Boolean dictionariesLoaded = false; // Indicates if the non-managed dictionaries have been loaded.

  // For DataTrack functionality
  private final HashMap<Integer, Property> propertyMap = new HashMap<Integer, Property>();
  private final List<Property> propertyList = new ArrayList<Property>();
  private final HashMap<Integer, Organism> organismMap = new HashMap<Integer, Organism>();
  private final List<Organism> organismList = new ArrayList<Organism>();
  private final HashMap<Integer, GenomeBuild> genomeBuildMap = new HashMap<Integer, GenomeBuild>();
  private final List<GenomeBuild> genomeBuildList = new ArrayList<GenomeBuild>();
  private final HashMap<Integer, List<GenomeBuild>> organismToGenomeBuildMap = new HashMap<Integer, List<GenomeBuild>>();
  private final HashMap<Integer, AppUser> appUserMap = new HashMap<Integer, AppUser>();
  private final HashMap<Integer, Lab> labMap = new HashMap<Integer, Lab>();
  private final List<Lab> labList = new ArrayList<Lab>();

  private boolean managedDictionariesLoaded = false;

  public DictionaryHelper() {
  }

  public static synchronized DictionaryHelper getInstance(Session sess) {
    if (theInstance == null) {
      theInstance = new DictionaryHelper();
//      System.out.println ("[DictionaryHelper] getInstance: theInstance is null, creating new instance");
    }
    if (!theInstance.dictionariesLoaded && sess != null) {
//        System.out.println ("[DictionaryHelper] getInstance: dictionariesLoaded is false, loading dictionaries");
      theInstance.loadDictionaries(sess);
    }
    return theInstance;

  }

  public static synchronized DictionaryHelper reload(Session sess) {
    theInstance = new DictionaryHelper();
    WorkflowPropertyHelper.reload(sess);
    PropertyDictionaryHelper.reload(sess);
    theInstance.loadDictionaries(sess);
    theInstance.loadManagedDictionaries();
    return theInstance;

  }

  /**
   * Only reload the cached dictionaries here, not the dictionary managed dictionaries. we need this special reload for web apps outside of gnomex (das2) so that they can get a fresh copy of dictionaries like organism and genome build.
   */
  public static synchronized DictionaryHelper reloadLimited(Session sess) {
    theInstance = new DictionaryHelper();
    WorkflowPropertyHelper.reload(sess);
    PropertyDictionaryHelper.reload(sess);
    theInstance.loadDictionaries(sess);
    return theInstance;
  }

  public void lazyLoadManagedDictionaries() {
    if (!managedDictionariesLoaded) {
      synchronized (this) {
        if (!managedDictionariesLoaded) {
          loadManagedDictionaries();
        }
      }
    }
  }

  public void loadDictionaries(Session sess) {

    propertyDictionaryHelper = PropertyDictionaryHelper.getInstance(sess);

    StringBuffer queryBuf = new StringBuffer();
    queryBuf.append("SELECT p from Property as p order by case when sortOrder is null then 999999 else sortOrder end, p.name");
    List properties = sess.createQuery(queryBuf.toString()).list();
    for (Iterator i = properties.iterator(); i.hasNext();) {
      Property prop = (Property) i.next();
      try {
        Hibernate.initialize(prop.getOptions());
      } catch (HibernateException e) {
        System.out.println("warning - unable to initialize options on property " + prop.getIdProperty() + " " + e.toString());
      }
      propertyMap.put(prop.getIdProperty(), prop);
      propertyList.add(prop);
    }

    List<Organism> organisms = sess.createQuery("SELECT d from Organism d order by d.binomialName").list();
    for (Organism d : organisms) {
      organismMap.put(d.getIdOrganism(), d);
      organismList.add(d);
    }

    List<GenomeBuild> genomeBuilds = sess.createQuery("SELECT d from GenomeBuild d order by d.buildDate desc, d.genomeBuildName asc").list();
    for (GenomeBuild d : genomeBuilds) {
      Hibernate.initialize(d.getDataTrackFolders());
      genomeBuildMap.put(d.getIdGenomeBuild(), d);
      genomeBuildList.add(d);

      List<GenomeBuild> versions = organismToGenomeBuildMap.get(d.getIdOrganism());
      if (versions == null) {
        versions = new ArrayList<GenomeBuild>();
        organismToGenomeBuildMap.put(d.getIdOrganism(), versions);
      }
      versions.add(d);
    }

    List<Lab> labs = sess.createQuery("SELECT d from Lab d order by d.lastName, d.firstName").list();
    for (Lab l : labs) {
      labMap.put(l.getIdLab(), l);
      labList.add(l);
    }

    queryBuf = new StringBuffer();
    queryBuf.append("SELECT au from AppUser as au ");
    List appUsers = sess.createQuery(queryBuf.toString()).list();
    for (Iterator i = appUsers.iterator(); i.hasNext();) {
      AppUser appUser = (AppUser) i.next();
      appUserMap.put(appUser.getIdAppUser(), appUser);

    }

    this.dictionariesLoaded = true;
  }

  private void loadManagedDictionaries() {
    if (!ManageDictionaries.isLoaded) {
      theInstance = null;
      throw new RuntimeException("Please run ManageDictionaries command first");
    }
    requestCategoryList = new ArrayList();
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.RequestCategory").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      RequestCategory rc = (RequestCategory) de;
      requestCategoryList.add(rc);
      requestCategoryMap.put(rc.getCodeRequestCategory(), rc);
    }
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.ProductType").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      ProductType pt = (ProductType) de;
      productTypeMap.put(pt.getIdProductType(), pt);
    }
    seqRunTypeList = new ArrayList();
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.SeqRunType").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      SeqRunType srt = (SeqRunType) de;
      seqRunTypeList.add(srt);
    }
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.OligoBarcode").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      OligoBarcode ob = (OligoBarcode) de;
      oligoBarcodeMap.put(ob.getIdOligoBarcode(), ob);
    }
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.SubmissionInstruction").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      SubmissionInstruction si = (SubmissionInstruction) de;
      submissionInstructionMap.put(si.getIdSubmissionInstruction(), si);
    }
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.BillingPeriod").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      BillingPeriod bp = (BillingPeriod) de;
      billingPeriodMap.put(bp.getIdBillingPeriod(), bp);
    }
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.SeqLibTreatment").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      SeqLibTreatment st = (SeqLibTreatment) de;
      seqLibTreatmentMap.put(st.getIdSeqLibTreatment(), st);
    }

    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.SeqLibProtocol").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      SeqLibProtocol sp = (SeqLibProtocol) de;
      seqLibProtocolsMap.put(sp.getIdSeqLibProtocol(), sp);
    }

    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.SlideDesign").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      SlideDesign sd = (SlideDesign) de;
      slideDesignMap.put(sd.getIdSlideDesign(), sd);
    }

    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.RequestCategoryType").iterator(); i.hasNext();) {
      Object de = i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      RequestCategoryType type = (RequestCategoryType) de;
      this.requestCategoryTypeMap.put(type.getCodeRequestCategoryType(), type);
    }

    this.managedDictionariesLoaded = true;
  }

  public Property getPropertyDictionary(Integer idProperty) {
    return (Property) propertyDictionaryMap.get(idProperty);
  }

  public String getCodeStepName(String abbr) {
    lazyLoadManagedDictionaries();
    String codeStep = "";
    if (codeStep != null) {
      codeStep = DictionaryManager.getDisplay("hci.gnomex.model.Step", abbr);
    }
    return codeStep;
  }

  public Map getPropertyDictionaryMap() {
    return propertyDictionaryMap;
  }

  public String getIsolationPrepType(String codeIsolationPrepType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeIsolationPrepType != null && codeIsolationPrepType.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.IsolationPrepType", codeIsolationPrepType);
    }
    return name;
  }

  public String getPlateType(String codePlateType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codePlateType != null && codePlateType.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.PlateType", codePlateType);
    }
    return name;
  }

  public String getReactionType(String codeReactionType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeReactionType != null && codeReactionType.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.ReactionType", codeReactionType);
    }
    return name;
  }

  public String getSealType(String codeSealType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeSealType != null && codeSealType.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SealType", codeSealType);
    }
    return name;
  }

  public String getInstrumentRunStatus(String codeInstrumentRunStatus) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeInstrumentRunStatus != null && codeInstrumentRunStatus.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.InstrumentRunStatus", codeInstrumentRunStatus);
    }
    return name;
  }

  public String getRequestStatus(String codeRequestStatus) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeRequestStatus != null && codeRequestStatus.length() > 0) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.RequestStatus", codeRequestStatus);
    }
    return name;
  }

  public String getSampleType(Sample sample) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (sample.getIdSampleType() != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SampleType", sample.getIdSampleType().toString());
    }
    return name;
  }

  public String getOrganism(Sample sample) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (sample.getIdOrganism() != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.OrganismLite", sample.getIdOrganism().toString());
    }
    return name;
  }

  public String getOrganism(Integer idOrganism) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (idOrganism != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.OrganismLite", idOrganism.toString());
    }
    return name;
  }

  public String getVisibility(String codeVisibility) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeVisibility != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.Visibility", codeVisibility);
    }
    return name;
  }

  public String getSampleSource(Integer idSampleSource) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (idSampleSource != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SampleSource", idSampleSource.toString());
    }
    return name;
  }

  public String getSampleDropOffLocation(Integer idSampleDropOffLocation) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (idSampleDropOffLocation != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SampleDropOffLocation", idSampleDropOffLocation.toString());
    }
    return name;
  }

  public String getSampleType(Integer idSampleType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (idSampleType != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SampleType", idSampleType.toString());
    }
    return name;
  }

  public String getSequencingPlatform(String codeSequencingPlatform) {
    lazyLoadManagedDictionaries();
    String name = "";
    name = DictionaryManager.getDisplay("hci.gnomex.model.SequencingPlatform", codeSequencingPlatform);
    return name;
  }

  public String getSlideDesignName(Integer idSlideDesign) {
    String name = "";
    if (idSlideDesign != null) {
      SlideDesign sd = (SlideDesign) slideDesignMap.get(idSlideDesign);
      if (sd != null) {
        name = sd.getName();
      }
    }
    return name;
  }

  public String getSlideSource(String code) {
    lazyLoadManagedDictionaries();
    return DictionaryManager.getDisplay("hci.gnomex.model.SlideSource", code);
  }

  public String getSlideDesignProtocolName(Integer idSlideDesign) {
    String name = "";
    if (idSlideDesign != null) {
      SlideDesign sd = (SlideDesign) slideDesignMap.get(idSlideDesign);
      if (sd != null) {
        name = sd.getSlideDesignProtocolName();
      }
    }
    return name;
  }

  public String getChipTypeName(String codeBioanalyzerChipType) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (codeBioanalyzerChipType != null && !codeBioanalyzerChipType.equals("")) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.BioanalyzerChipType", codeBioanalyzerChipType);
    }
    return name;
  }

  public String getBioanalyzerCodeApplication(String codeBioanalyzerChipType) {
    String codeApplication = null;
    // Find the core facility for DNA Sequencing. If we can't find it, throw an error.
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.BioanalyzerChipType").iterator(); i.hasNext();) {
      DictionaryEntry de = (DictionaryEntry) i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      BioanalyzerChipType chip = (BioanalyzerChipType) de;
      if (chip.getCodeBioanalyzerChipType().equals(codeBioanalyzerChipType)) {
        codeApplication = chip.getCodeApplication();
        break;
      }
    }
    return codeApplication;
  }

  public String getApplication(String code) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (code != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.Application", code);
    }
    return name;
  }

  public List getRequestCategoryList() {
    lazyLoadManagedDictionaries();
    return requestCategoryList;
  }

  public List<RequestCategory> getClinicResearchRequestCategoryList() {
    lazyLoadManagedDictionaries();
    List<RequestCategory> list = new ArrayList<RequestCategory>();
    for (RequestCategory cat : (List<RequestCategory>) requestCategoryList) {
      if (cat != null && cat.getIsClinicalResearch() != null && cat.getIsClinicalResearch().equals("Y")) {
        list.add(cat);
      }
    }
    return list;
  }

  public List getSeqRunTypeList() {
    lazyLoadManagedDictionaries();
    return seqRunTypeList;
  }

  public String getRequestCategory(String code) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (code != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.RequestCategory", code);
    }
    return name;
  }

  public RequestCategory getRequestCategoryObject(String code) {
 //   System.out.println ("ManageDictionaries.getRequestCategoryObject(" + code + ")");
    if (!ManageDictionaries.isLoaded) {
 //     System.out.println ("ManageDictionaries.getRequestCategoryObject(" + code + ") - not isLoaded = false");
      return null;
    }
 //  System.out.println ("ManageDictionaries.getRequestCategoryObject(" + code + ") - requestCategoryMap.size() = " + requestCategoryMap.size());
    lazyLoadManagedDictionaries();
    return (RequestCategory) requestCategoryMap.get(code);
  }

  public ProductType getProductTypeObject(Integer id) {
    lazyLoadManagedDictionaries();
    return (ProductType) productTypeMap.get(id);
  }

  public String getSeqRunType(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SeqRunType", id.toString());
    }
    return name;
  }

  public String getNumberSequencingCycles(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.NumberSequencingCycles", id.toString());
    }
    return name;
  }

  public String getNumberSequencingCyclesAllowed(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.NumberSequencingCyclesAllowed", id.toString());
    }
    return name;
  }

  public String getGenomeBuild(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.GenomeBuildLite", id.toString());
    }
    return name;
  }

  public String getLabel(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.Label", id.toString());
    }
    return name;
  }

  public String getAnalysisType(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.AnalysisType", id.toString());
    }
    return name;
  }

  public String getAnalysisProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.AnalysisProtocol", id.toString());
    }
    return name;
  }

  public String getLabelingProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.LabelingProtocol", id.toString());
    }
    return name;
  }

  public String getHybProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.HybProtocol", id.toString());
    }
    return name;
  }

  public String getScanProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.ScanProtocol", id.toString());
    }
    return name;
  }

  public String getFeatureExtractionProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.FeatureExtractionProtocol", id.toString());
    }
    return name;
  }

  public String getSeqLibProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.SeqLibProtocol", id.toString());
    }
    return name;
  }

  public String getPipelineProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.PipelineProtocol", id.toString());
    }
    return name;
  }

  public String getBioanalyzerChipType(String code) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (code != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.BioanalyzerChipType", code);
    }
    return name;
  }

  public String getIlluminaSequencingProtocol(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.NumberSequencingCyclesAllowed", id.toString());
    }
    return name;
  }

  public SeqLibTreatment getSeqLibTreatment(Integer id) {
    lazyLoadManagedDictionaries();
    if (id != null) {
      SeqLibTreatment t = (SeqLibTreatment) seqLibTreatmentMap.get(id);
      return t;
    }
    return null;
  }

  public SeqLibProtocol getSeqLibProtocolObject(Integer id) {
    lazyLoadManagedDictionaries();
    if (id != null) {
      SeqLibProtocol sp = (SeqLibProtocol) seqLibProtocolsMap.get(id);
      return sp;
    }
    return null;
  }

  public Set getSeqLibTreatments() {
    lazyLoadManagedDictionaries();
    return DictionaryManager.getDictionaryEntries("hci.gnomex.model.SeqLibTreatment");
  }

  public String getBillingStatus(String codeBillingStatus) {
    lazyLoadManagedDictionaries();
    String billingStatus = "";
    if (codeBillingStatus != null) {
      billingStatus = DictionaryManager.getDisplay("hci.gnomex.model.BillingStatus", codeBillingStatus);
    }
    return billingStatus;
  }

  public String getBillingChargeKind(String codeBillingChargeKind) {
    lazyLoadManagedDictionaries();
    String billingChargeKind = "";
    if (codeBillingChargeKind != null) {
      billingChargeKind = DictionaryManager.getDisplay("hci.gnomex.model.BillingChargeKind", codeBillingChargeKind);
    }
    return billingChargeKind;
  }

  public BillingPeriod getBillingPeriod(Integer idBillingPeriod) {
    lazyLoadManagedDictionaries();
    BillingPeriod billingPeriod = null;
    if (idBillingPeriod != null) {
      BillingPeriod bp = (BillingPeriod) billingPeriodMap.get(idBillingPeriod);
      if (bp != null) {
        billingPeriod = bp;
      }
    }
    return billingPeriod;
  }

  public BillingPeriod getCurrentBillingPeriod() {
    lazyLoadManagedDictionaries();
    BillingPeriod billingPeriod = null;
    for (Iterator i = billingPeriodMap.keySet().iterator(); i.hasNext();) {
      Integer id = (Integer) i.next();
      BillingPeriod bp = (BillingPeriod) billingPeriodMap.get(id);
      if (bp.getIsCurrentPeriod().equals("Y")) {
        billingPeriod = bp;
        break;
      }
    }
    return billingPeriod;
  }

  public String getInstrument(Integer id) {
    lazyLoadManagedDictionaries();
    String name = "";
    if (id != null) {
      name = DictionaryManager.getDisplay("hci.gnomex.model.Instrument", id.toString());
    }
    return name;
  }

  public List<Organism> getOrganisms() {
    return this.organismList;
  }

  public List<GenomeBuild> getGenomeBuilds(Integer idOrganism) {
    return this.organismToGenomeBuildMap.get(idOrganism);
  }

  public GenomeBuild getGenomeBuildObject(Integer idGenomeBuild) {
    return genomeBuildMap.get(idGenomeBuild);
  }

  public String getOrganismName(GenomeBuild genomeBuild) {
    if (genomeBuild != null && genomeBuild.getIdOrganism() != null) {
      Organism organism = organismMap.get(genomeBuild.getIdOrganism());
      if (organism != null) {
        return organism.getOrganism();
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  public String getOrganismBinomialName(Integer idOrganism) {
    Organism organism = organismMap.get(idOrganism);
    if (organism != null) {
      return organism.getBinomialName();
    } else {
      return "";
    }
  }

  public String getOrganismBinomialName(GenomeBuild genomeBuild) {
    if (genomeBuild != null && genomeBuild.getIdOrganism() != null) {
      Organism organism = organismMap.get(genomeBuild.getIdOrganism());
      if (organism != null) {
        return organism.getBinomialName();
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  public String getGenomeBuildName(Integer idGenomeBuild) {
    GenomeBuild genomeBuild = genomeBuildMap.get(idGenomeBuild);
    if (genomeBuild != null) {
      return genomeBuild.getGenomeBuildName();
    } else {
      return "";
    }
  }

  public AppUser getAppUserObject(Integer idAppUser) {
    return appUserMap.get(idAppUser);
  }

  public Lab getLabObject(Integer idLab) {
    return labMap.get(idLab);
  }

  public Map getSubmissionInstructionMap() {
    lazyLoadManagedDictionaries();
    return submissionInstructionMap;
  }

  public String getBarcodeSequence(Integer idOligoBarcode) {
    lazyLoadManagedDictionaries();
    String barcodeSequence = null;
    if (idOligoBarcode != null) {
      OligoBarcode bc = (OligoBarcode) oligoBarcodeMap.get(idOligoBarcode);
      if (bc != null) {
        barcodeSequence = bc.getBarcodeSequence();
      }
    }
    return barcodeSequence;
  }

  public List<Property> getPropertyList() {
    return propertyList;
  }

  public Property getPropertyByNameAndCore(String name, Integer idCoreFacility) {
    for (Property p : propertyList) {
      if (p.getName().equals(name) && p.getIdCoreFacility().equals(idCoreFacility)) {
        return p;
      }
    }

    return null;
  }

  public Property getPropertyObject(Integer idProperty) {
    return propertyMap.get(idProperty);
  }

  public Map<Integer, Property> getPropertyMap() {
    return propertyMap;
  }

  public String getPropertyDictionary(String name) {
    return propertyDictionaryHelper.getProperty(name);
  }

  public boolean isProductionServer(String serverName) {
    return propertyDictionaryHelper.isProductionServer(serverName);
  }

  public static Integer getIdCoreFacilityDNASeq() {
    Integer idCoreFacility = null;
    // Find the core facility for DNA Sequencing. If we can't find it, throw an error.
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.CoreFacility").iterator(); i.hasNext();) {
      DictionaryEntry de = (DictionaryEntry) i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      CoreFacility cf = (CoreFacility) de;
      if (cf.getFacilityName().equals(CoreFacility.CORE_FACILITY_DNA_SEQ)) {
        idCoreFacility = cf.getIdCoreFacility();
        break;
      }
    }
    return idCoreFacility;

  }

  public RequestCategoryType getRequestCategoryType(String type) {
    lazyLoadManagedDictionaries();
    return this.requestCategoryTypeMap.get(type);
  }

  public Application getApplicationObject(String code) {
    Application app = null;
    // Find the core facility for DNA Sequencing. If we can't find it, throw an error.
    for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.Application").iterator(); i.hasNext();) {
      DictionaryEntry de = (DictionaryEntry) i.next();
      if (de instanceof NullDictionaryEntry) {
        continue;
      }
      Application a = (Application) de;
      if (a.getCodeApplication().equals(code)) {
        app = a;
        break;
      }
    }
    return app;
  }
}
