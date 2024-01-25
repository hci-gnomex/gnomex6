package hci.gnomex.utility;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.util.*;
import java.util.logging.Logger;


public class DataTrackQuery implements Serializable {

  long et = 0;


	// Criteria
	private String             scopeLevel = "";
	private String             number;
	private Integer            idLab;
	private Integer            idOrganism;
	private Integer            idGenomeBuild;
	private String             isVisibilityPublic = "Y";
    private String             isVisibilityOwner = "Y";
	private String             isVisibilityMembers = "Y";
	private String             isVisibilityInstitute = "Y";
	private String             isServerRefreshMode = "N";
	private String             emphasizeText = "";
	private List<Integer>      ids = null;

	private int                hitCount = 0;


	private StringBuffer       queryBuf;
	private boolean            addWhere = true;

	private static String      KEY_DELIM = "!!!!";

	private static final int                         FOLDER_LEVEL = 1;
	private static final int                         DATATRACK_LEVEL = 2;



  private TreeMap<String, TreeMap<GenomeBuild, ?>> organismToGenomeBuild;
  private HashMap<String, TreeMap<String, ?>>      genomeBuildToRootFolders;
  private HashMap<String, TreeMap<String, ?>>      folderToFolders;
  private HashMap<String, TreeMap<String, ?>>      folderToDataTracks;

  private HashMap<String, List<Segment>>           genomeBuildToSegments;

  private HashMap<String, Organism>                organismMap;
  private HashMap<String, GenomeBuild>             genomeBuildNameMap;
  private HashMap<Integer, DataTrack>              dataTrackMap;
  private HashMap<Integer, DataTrackFolder>        dataTrackFolderMap;

  public static final int       COL_ORGANISM = 0;
  public static final int       COL_GENOME_BUILD = 1;
  public static final int       COL_DATATRACK = 4;

  public static final int       COL_ID_DATATRACK = 0;
  public static final int       COL_ID_PROPERTY = 1;
  public static final int       COL_PROPERTY_TYPE = 2;
  public static final int       COL_PROPERTY_NAME = 3;
  public static final int       COL_PROPERTY_VALUE = 4;
  public static final int       COL_PROPERTY_MULTI_VALUE = 5;
  public static final int       COL_PROPERTY_OPTION = 6;


	@SuppressWarnings("unchecked")
	public static List<UnloadDataTrack> getUnloadedDataTracks(Session sess, SecurityAdvisor secAdvisor, GenomeBuild genomeBuild) throws Exception {
		StringBuffer queryBuf = new StringBuffer();
		queryBuf.append(" SELECT     u  ");
		queryBuf.append(" FROM       UnloadDataTrack as u  ");
		queryBuf.append(" WHERE      u.idGenomeBuild = " + genomeBuild.getIdGenomeBuild());

		if (secAdvisor != null && !secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
			queryBuf.append(" AND u.idAppUser = " + secAdvisor.getIdAppUser());
		}

		queryBuf.append(" ORDER BY   u.idUnloadDataTrack");

		List<UnloadDataTrack> results = sess.createQuery(queryBuf.toString()).list();

		return results;
	}

	public DataTrackQuery() {
		if (scopeLevel == null || scopeLevel.equals("")) {
			scopeLevel = SecurityAdvisor.ALL_SCOPE_LEVEL;
		}
	}

	public DataTrackQuery(HttpServletRequest req) {
		scopeLevel         = req.getParameter("scopeLevel");
    number         = req.getParameter("number");
		idLab        = DataTrackUtil.getIntegerParameter(req, "idLab");
		idOrganism         = DataTrackUtil.getIntegerParameter(req, "idOrganism");
		idGenomeBuild    = DataTrackUtil.getIntegerParameter(req, "idGenomeBuild");
        this.isVisibilityOwner = DataTrackUtil.getFlagParameter(req, "isVisibilityOwner");
		this.isVisibilityMembers = DataTrackUtil.getFlagParameter(req, "isVisibilityMembers");
		this.isVisibilityInstitute = DataTrackUtil.getFlagParameter(req, "isVisibilityInstitute");
		this.isVisibilityPublic = DataTrackUtil.getFlagParameter(req, "isVisibilityPublic");
		this.emphasizeText = req.getParameter("emphasizeText");

		if (scopeLevel == null || scopeLevel.equals("")) {
			scopeLevel = SecurityAdvisor.ALL_SCOPE_LEVEL;
		}
	}

	public DataTrackQuery(List ids) {
	  this.ids = ids;
	}

	public Document getDataTrackDocument(Session sess, SecurityAdvisor secAdvisor) throws Exception {
		return this.getDataTrackDocument(sess, secAdvisor, null);
	}

	@SuppressWarnings("unchecked")
	public Document getDataTrackDocument(Session sess, SecurityAdvisor secAdvisor, Integer maxDataTrackCount) throws Exception {
	  // If we are looking up data track by number, prime the idGenomeBuild
	  // criteria so that the folders are limited to the genome build
	  // of the specific data track
	  if (number != null && !number.equals("")) {
	    idGenomeBuild = (Integer)sess.createQuery("SELECT distinct dt.idGenomeBuild from DataTrack dt where dt.fileName = '" + number + "'").uniqueResult();
	  }


	  // Run query to get dataTrack folders, organized under
	  // organism and genome build
	  StringBuffer queryBuf = this.getDataTrackFolderQuery(secAdvisor);
	  Logger.getLogger(this.getClass().getName()).fine("DataTrack folder query: " + queryBuf.toString());
	  Query query = sess.createQuery(queryBuf.toString());
	  List<Object[]> dataTrackFolderRows = query.list();

	  // Run query to get dataTrack folder and dataTracks, organized under
	  // organism and genome build
	  queryBuf = this.getDataTrackQuery(secAdvisor);
	  Logger.getLogger(this.getClass().getName()).fine("DataTrack query: " + queryBuf.toString());
	  query = sess.createQuery(queryBuf.toString());

//	  if (maxDataTrackCount != null && maxDataTrackCount > -1) {
//		  query.setFirstResult(0);
//		  query.setMaxResults(maxDataTrackCount);
//	  }
	  List<Object[]> dataTrackRows = query.list();

    // Run query to get parent folder count by data track
    queryBuf = this.getFolderCountQuery(secAdvisor);
    Logger.getLogger(this.getClass().getName()).fine("Folder count query: " + queryBuf.toString());

    query = sess.createQuery(queryBuf.toString());


	List<Object[]> folderCountRows = query.list();

	  // Now run query to get the genome build segments
	  queryBuf = this.getSegmentQuery();
	  query = sess.createQuery(queryBuf.toString());
		List<Segment> segmentRows = query.list();

	  String message = "";
	  if (maxDataTrackCount != null && maxDataTrackCount > -1 && dataTrackRows.size() == maxDataTrackCount) {
		  message = "First " + maxDataTrackCount + " displayed";
	  }

	  // Create an XML document
	  Document doc = this.getDataTrackDocument(dataTrackFolderRows, dataTrackRows, folderCountRows, segmentRows, DictionaryHelper.getInstance(sess), secAdvisor);
	  doc.getRootElement().setAttribute("message", message);
	  return doc;

	}


	@SuppressWarnings("unchecked")
	public void runDataTrackQuery(Session sess, SecurityAdvisor secAdvisor, boolean isServerRefreshMode) throws Exception {
		this.isServerRefreshMode = isServerRefreshMode ? "Y" : "N";

		// Run query to get dataTrack folders, organized under
		// organism and genome build
		StringBuffer queryBuf = this.getDataTrackFolderQuery(secAdvisor);
		Logger.getLogger(this.getClass().getName()).fine("DataTrack folder query: " + queryBuf.toString());
    Query query = sess.createQuery(queryBuf.toString());
		List<Object[]> dataTrackFolderRows = query.list();

		// Run query to get dataTracks, organized under dataTrack folder,
		// organism, and genome build
		queryBuf = this.getDataTrackQuery(secAdvisor);
		Logger.getLogger(this.getClass().getName()).fine("DataTrack query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
		List<Object[]> dataTrackRows = query.list();


		// Run query to get parent folder count by data track
		queryBuf = this.getFolderCountQuery(secAdvisor);
		Logger.getLogger(this.getClass().getName()).fine("Folder count query: " + queryBuf.toString());
		query = sess.createQuery(queryBuf.toString());
        List<Object[]> folderCountRows = query.list();


		// Now run query to get the genome build segments
		queryBuf = this.getSegmentQuery();
    	query = sess.createQuery(queryBuf.toString());
		List<Segment> segmentRows = query.list();

		this.hashDataTracks(dataTrackFolderRows, dataTrackRows, folderCountRows, segmentRows, DictionaryHelper.getInstance(sess));

	}

	private StringBuffer getDataTrackFolderQuery(SecurityAdvisor secAdvisor) throws Exception {

		addWhere = true;
		queryBuf = new StringBuffer();

		queryBuf.append(" SELECT     org, ");
		queryBuf.append("            gb, ");
		queryBuf.append("            folder, ");
		queryBuf.append("            parentFolder ");
		queryBuf.append(" FROM       Organism as org ");
		queryBuf.append(" JOIN       org.genomeBuilds as gb ");
		queryBuf.append(" JOIN       gb.dataTrackFolders as folder ");
		queryBuf.append(" LEFT JOIN  folder.parentFolder as parentFolder ");


		addWhere = true;

		addCriteria(FOLDER_LEVEL);

		queryBuf.append(" ORDER BY org.das2Name asc, gb.buildDate desc, folder.name asc ");

		return queryBuf;

	}

	private StringBuffer getFolderCountQuery(SecurityAdvisor secAdvisor) throws Exception {
    addWhere = true;
    queryBuf = new StringBuffer();

    queryBuf.append(" SELECT     dataTrack.idDataTrack, count(folder) ");
    queryBuf.append(" FROM       DataTrack dataTrack");
    queryBuf.append(" JOIN       dataTrack.folders as folder ");
    queryBuf.append(" LEFT JOIN  dataTrack.collaborators as collab ");

    addWhere = true;

    if (secAdvisor != null) {
      addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "dataTrack", "collab", addWhere, false, false, false);
    }


    // If this is a server reload, get dataTracks not yet loaded
    if (this.isServerRefreshMode.equals("Y")) {
      this.AND();
      queryBuf.append("(");
      queryBuf.append(" dataTrack.isLoaded = 'N' ");

      if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
        this.AND();
        queryBuf.append(" dataTrack.idAppUser = " + secAdvisor.getIdAppUser());
      }

      queryBuf.append(")");
    }

    queryBuf.append(" GROUP BY dataTrack.idDataTrack ");

    return queryBuf;

	}

	public StringBuffer getDataTrackQuery(SecurityAdvisor secAdvisor) throws Exception{
	  return getDataTrackQuery(secAdvisor, false);
	}
	public StringBuffer getDataTrackQuery(SecurityAdvisor secAdvisor, Boolean isCreateReport) throws Exception {

		addWhere = true;
		queryBuf = new StringBuffer();

		queryBuf.append(" SELECT     org, ");
		queryBuf.append("            gb, ");
		queryBuf.append("            folder, ");
		queryBuf.append("            parentFolder, ");

		if(this.idLab != null){
	    queryBuf.append("            dataTrack,  ");
	    queryBuf.append("            lab  ");
		} else{
	    queryBuf.append("            dataTrack  ");
		}

		queryBuf.append(" FROM       Organism as org ");
		queryBuf.append(" JOIN       org.genomeBuilds as gb ");
		queryBuf.append(" JOIN       gb.dataTrackFolders as folder ");
		queryBuf.append(" LEFT JOIN  folder.parentFolder as parentFolder ");
		queryBuf.append(" LEFT JOIN  folder.dataTracks as dataTrack ");

		if(this.idLab != null) {
			queryBuf.append(" JOIN       dataTrack.lab as lab ");
		}
	    queryBuf.append(" LEFT JOIN  dataTrack.collaborators as collab ");

		addWhere = true;

		addCriteria(DATATRACK_LEVEL);
		if(isCreateReport){
		  filterByExcludeUsage();
		}

		if (secAdvisor != null) {
			addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "dataTrack", "collab", addWhere, false, false, false);
		}
		// If this is a server reload, get dataTracks not yet loaded
		if (this.isServerRefreshMode.equals("Y")) {
			this.AND();
			queryBuf.append("(");
			queryBuf.append(" dataTrack.isLoaded = 'N' ");

			if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
				this.AND();
				queryBuf.append(" dataTrack.idAppUser = " + secAdvisor.getIdAppUser());
			}

			queryBuf.append(")");
		}

		queryBuf.append(" ORDER BY org.das2Name asc, gb.buildDate desc, folder.name asc, dataTrack.name asc ");

		return queryBuf;

	}


	public StringBuffer getAnnotationQuery(SecurityAdvisor secAdvisor){
	  return getAnnotationQuery(secAdvisor, false);
	}

  public StringBuffer getAnnotationQuery(SecurityAdvisor secAdvisor, Boolean isCreateReport) {
    addWhere = true;
    queryBuf = new StringBuffer();

    queryBuf.append(" SELECT     DISTINCT ");
    queryBuf.append("            dataTrack.idDataTrack,  ");
    queryBuf.append("            prop.idProperty, ");
    queryBuf.append("            prop.codePropertyType, ");
    queryBuf.append("            prop.name, ");
    queryBuf.append("            propEntry.value, ");
    queryBuf.append("            value.value, ");
    queryBuf.append("            option.option, ");
    queryBuf.append("            lab ");
    queryBuf.append(" FROM       Organism as org ");
    queryBuf.append(" JOIN       org.genomeBuilds as gb ");
    queryBuf.append(" JOIN       gb.dataTrackFolders as folder ");
    queryBuf.append(" LEFT JOIN  folder.parentFolder as parentFolder ");
    queryBuf.append(" LEFT JOIN  folder.dataTracks as dataTrack ");
    queryBuf.append(" LEFT JOIN  dataTrack.collaborators as collab ");
    queryBuf.append(" JOIN        dataTrack.propertyEntries as propEntry ");
    queryBuf.append(" JOIN        dataTrack.lab as lab ");
    queryBuf.append(" JOIN        propEntry.property as prop ");
    queryBuf.append(" LEFT JOIN   propEntry.values as value ");
    queryBuf.append(" LEFT JOIN   propEntry.options as option ");


    addWhere = true;

    addCriteria(DATATRACK_LEVEL);

    if(isCreateReport){
      filterByExcludeUsage();
    }


    if (secAdvisor != null) {
      addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "dataTrack", "collab", addWhere, false, false, false);
    }

    return queryBuf;
  }

	private StringBuffer getSegmentQuery() throws Exception {
		addWhere = true;
		queryBuf = new StringBuffer();
		queryBuf.append(" SELECT     seg  ");
		queryBuf.append(" FROM       Segment as seg  ");
		queryBuf.append(" ORDER BY   seg.sortOrder");

		return queryBuf;

	}

	private Document getDataTrackDocument(List<Object[]> dataTrackFolderRows, List<Object[]> dataTrackRows, List<Object[]> folderCountRows, List<Segment> segmentRows,  DictionaryHelper dictionaryHelper, SecurityAdvisor secAdvisor) throws Exception {

		// Organize results rows into hash tables
		hashDataTracks(dataTrackFolderRows, dataTrackRows, folderCountRows, segmentRows, dictionaryHelper);


		Document doc = new Document(new Element("DataTrackList"));
		Element root = doc.getRootElement();


		// Use hash to create XML Document.  Perform 2 passes so that organisms
		// with populated genome builds (dataTracks or sequences) appear first
		// in the list.

		hitCount = 0;
		fillOrganismNodes(root, dictionaryHelper, secAdvisor, true);
		fillOrganismNodes(root, dictionaryHelper, secAdvisor, false);
    root.setAttribute("hitCount", Integer.valueOf(hitCount).toString());

		return doc;

	}

	private void fillOrganismNodes(Element root, DictionaryHelper dictionaryHelper, SecurityAdvisor secAdvisor, boolean fillPopulatedOrganisms) throws Exception {
		Element organismNode = null;
		Element genomeBuildNode  = null;
		String[] tokens;
		for (String organismBinomialName : organismToGenomeBuild.keySet()) {
			TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organismBinomialName);
			Organism organism = organismMap.get(organismBinomialName);

			boolean keep = false;
			boolean isPopulated = hasPopulatedGenomes(organism);
			if (fillPopulatedOrganisms) {
				keep = isPopulated;
			} else {
				keep = !isPopulated;
			}

			if (!keep) {
				continue;
			}

			organismNode = organism.getXML(secAdvisor).getRootElement();
			organismNode.setAttribute("isPopulated", isPopulated ? "Y" : "N");
			emphasizeMatch(organismNode);
			root.addContent(organismNode);

			// For each genome build, build up hierarchy
			if (genomeBuildMap != null) {
				for (GenomeBuild genomeBuild : genomeBuildMap.keySet()) {

					genomeBuildNode = genomeBuild.getXML(secAdvisor, null).getRootElement();

		       if (genomeBuild.getDas2Name() == null || genomeBuild.getDas2Name().equals("")) {
		          System.out.println("Warning - skipping genome build " + genomeBuild.getGenomeBuildName() + " because das2 name is blank");
		          continue;
		        }

					// Indicate if the genome build has segments
					List<Segment> segments = this.getSegments(organism, genomeBuild.getDas2Name());
					genomeBuildNode.setAttribute("hasSegments", (segments != null && segments.size() > 0 ? "Y" : "N"));
					emphasizeMatch(genomeBuildNode);

					// Attach the genome build node
					organismNode.addContent(genomeBuildNode);

					// For each root dataTrack folder, recurse to create dataTracks
					// and folders.
					TreeMap<String, ?> rootFolders = genomeBuildToRootFolders.get(genomeBuild.getDas2Name());
					fillFolderNode(genomeBuild, genomeBuildNode, rootFolders, secAdvisor, dictionaryHelper, false);

					// If selection criteria was applied to query, prune out nodes that don't
					// have any content
					if (this.hasDataTrackCriteria()) {
						if (!genomeBuildNode.hasChildren()) {
							organismNode.removeContent(genomeBuildNode);
						}
					}

				}

			}

			// If selection criteria was applied to query, prune out nodes that don't
			// have any content
			if (this.hasDataTrackCriteria()) {
				if (!organismNode.hasChildren()) {
					root.removeContent(organismNode);
				}
			}

		}

	}

	private void emphasizeMatch(Element node) {
	  boolean emphasize = false;
	  if (emphasizeText != null && !emphasizeText.equals("")) {
	    emphasize = isMatch(node, "label");
	    if (!emphasize) {
	      if (node.getName().equals("Organism")) {
          emphasize = isMatch(node, "commonName");
        } else if (node.getName().equals("GenomeBuild")) {
          emphasize = isMatch(node, "genomeBuildName");
        } else if (node.getName().equals("DataTrackFolder")) {
          emphasize = isMatch(node, "description");
        } else if (node.getName().equals("DataTrack")) {
          emphasize = isMatch(node, "summary");
          if (!emphasize) {
            emphasize = isMatch(node, "description");
          }
        }
	    }
	    node.setAttribute("emphasize", emphasize ? "Y" : "N");
	    if (emphasize) {
	      hitCount++;
	    }
	  }
	}

	private boolean isMatch(Element node, String attributeName) {
	  if (node.getAttribute(attributeName) != null && node.getAttribute(attributeName).getValue() != null) {
	    String value = node.getAttribute(attributeName).getValue();
	    // The attribute matches the emphasize text if it is contained within its text.
	    // Match is case-insensitive.
	    return value.toUpperCase().contains(emphasizeText.toUpperCase());
	  } else {
	    return false;
	  }
	}

	private boolean hasPopulatedGenomes(Organism organism) {
		boolean isPopulated = false;

		TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());
		if (genomeBuildMap != null) {
			for (GenomeBuild genomeBuild : genomeBuildMap.keySet()) {
				if (isPopulated) {
					break;
				}
				if (genomeBuild.getDas2Name() == null || genomeBuild.getDas2Name().equals("")) {
				  System.out.println("Warning - skipping genome build " + genomeBuild.getGenomeBuildName() + " because das2 name is blank");
				  continue;
				}
				List<Segment> segments = this.getSegments(organism, genomeBuild.getDas2Name());
				if (segments != null && segments.size() > 0) {
					isPopulated = true;
					break;
				}
				TreeMap<String, ?> rootFolders = genomeBuildToRootFolders.get(genomeBuild.getDas2Name());
				if (rootFolders != null && rootFolders.size() > 0) {
					for (String folderKey : rootFolders.keySet()) {

						//String[] tokens     = folderKey.split(KEY_DELIM);
						//String folderName          = tokens[0];


						TreeMap<String, ?> dtNameMap = folderToDataTracks.get(folderKey);
						if (dtNameMap != null && dtNameMap.size() > 0) {
							isPopulated = true;
						}

						TreeMap<String, ?> childFolders = folderToFolders.get(folderKey);
						if (childFolders != null && childFolders.size() > 0) {
							isPopulated = true;
						}
					}
				}


			}
		}
		return isPopulated;
	}



	private void hashDataTracks(List<Object[]> dataTrackFolderRows, List<Object[]> dataTrackRows, List<Object[]> folderCountRows, List<Segment> segmentRows, DictionaryHelper dictionaryHelper) {

		organismToGenomeBuild      = new TreeMap<String, TreeMap<GenomeBuild, ?>>();
		genomeBuildToRootFolders   = new HashMap<String, TreeMap<String, ?>>();
		folderToFolders            = new HashMap<String, TreeMap<String, ?>>();
		folderToDataTracks         = new HashMap<String, TreeMap<String, ?>>();
		genomeBuildToSegments      = new HashMap<String, List<Segment>>();

		organismMap                = new HashMap<String, Organism>();
		genomeBuildNameMap         = new HashMap<String, GenomeBuild>();
		dataTrackFolderMap         = new HashMap<Integer, DataTrackFolder>();
		dataTrackMap               = new HashMap<Integer, DataTrack>();

		// Prefill organism, genome build, and root dataTrack folder
		// hash map with known entries
		// since those without dataTracks would otherwise not show up.
		for (Organism o : dictionaryHelper.getOrganisms()) {
		  // Skip organisms that don't have a binomial name or das2 name
		  if (o.getBinomialName() == null || o.getBinomialName().equals("") ||
		      o.getDas2Name() == null || o.getDas2Name().equals("")) {
		    continue;
		  }

			organismMap.put(o.getBinomialName(), o);

			// If we are filtering by organism, only include that one
			if (this.idOrganism != null) {
				if (!this.idOrganism.equals(o.getIdOrganism())) {
					continue;
				}
			}
			TreeMap<GenomeBuild, ?> genomeBuildMap = new TreeMap<GenomeBuild, Object>(new GenomeBuildComparator());
			organismToGenomeBuild.put(o.getBinomialName(), genomeBuildMap);
			if (dictionaryHelper.getGenomeBuilds(o.getIdOrganism()) != null) {
				for(GenomeBuild v : dictionaryHelper.getGenomeBuilds(o.getIdOrganism())) {

				  // Skip genome builds that don't have a das2 name
				  if (v.getDas2Name() == null || v.getDas2Name().equals("")) {
				    continue;
				  }
					genomeBuildNameMap.put(v.getDas2Name(), v);

					// If we are filtering by genome build, only include that one
					if (this.idGenomeBuild != null) {
						if (!this.idGenomeBuild.equals(v.getIdGenomeBuild())) {
							continue;
						}
					}

					genomeBuildMap.put(v, null);

					DataTrackFolder rootFolder = v.getRootDataTrackFolder();

					if (rootFolder != null) {
						String folderKey       = rootFolder.getName()  + KEY_DELIM + rootFolder.getIdDataTrackFolder();
						TreeMap<String, String> folders = new TreeMap<String, String>();
						folders.put(folderKey, null);
						genomeBuildToRootFolders.put(v.getDas2Name(), folders);
					}

				}

			}
		}
		// Hash segments for each genome build
		if (segmentRows != null) {
			for (Segment segment : segmentRows) {
				if (segment == null) {
					continue;
				}
				GenomeBuild genomeBuild = dictionaryHelper.getGenomeBuildObject(segment.getIdGenomeBuild());
				if (genomeBuild == null) {
					System.out.println("Warning - Segment " + segment.getIdSegment() + " does not belong to a valid Genome Build");
					continue;
				}
				if (genomeBuild.getDas2Name() == null || genomeBuild.getDas2Name().equals("")) {
				  System.out.println("Warning - Segment " + segment.getIdSegment() + " ignored because Genome Build " + genomeBuild.getGenomeBuildName() + " has a blank das2 name");
				  continue;
				}
				List<Segment> segments = genomeBuildToSegments.get(genomeBuild.getDas2Name());
				if (segments == null) {
					segments = new ArrayList<Segment>();
					genomeBuildToSegments.put(genomeBuild.getDas2Name(), segments);
				}
				segments.add(segment);
			}
		}







		// Hash to create hierarchy:
		//   Organism
		//     Genome Build
		//       DataTrack
		//       DataTrack Folder
		//          DataTrack

		// Hash the dataTrack folder->dataTrack.  We get
		// a row for each dataTrack folder.
		// 1. Hash the genome builds under the organism.
		// 2. Hash the root dataTrack folders under the organism.
		//    (root dataTracks are under the root dataTrack folder for
		//     the genome build.  We just hide this dataTrack folder
		//     and show the dataTracks under the genome build node instead.
		// 3. Hash the dataTrack folders under parent dataTrack folder
		//    and the dataTracks under the parent dataTrack folder.

		// First hash the dataTrack folders
		for (Object[] row : dataTrackFolderRows) {
			Organism organism                  = (Organism) row[0];
			GenomeBuild genomeBuild            = (GenomeBuild)  row[1];
			DataTrackFolder dtFolder           = (DataTrackFolder) row[2];
			DataTrackFolder parentAnnotFolder  = (DataTrackFolder) row[3];

			// Hash genome builds for an organism
			TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());
			if (genomeBuildMap == null) {
				genomeBuildMap = new TreeMap<GenomeBuild, Object>(new GenomeBuildComparator());
				organismToGenomeBuild.put(organism.getBinomialName(), genomeBuildMap);
				organismMap.put(organism.getBinomialName(), organism);
			}
			if (genomeBuild != null && genomeBuild.getDas2Name() != null && !genomeBuild.getDas2Name().equals("")) {
				genomeBuildMap.put(genomeBuild, null);
				genomeBuildNameMap.put(genomeBuild.getDas2Name(), genomeBuild);
			}


			// Hash root dataTrack folders for a genome build
			String folderKey       = dtFolder.getName()  + KEY_DELIM + dtFolder.getIdDataTrackFolder();
			if (parentAnnotFolder == null) {

				TreeMap<String, ?> folderNameMap = genomeBuildToRootFolders.get(genomeBuild.getDas2Name());
				if (folderNameMap == null) {
					folderNameMap = new TreeMap<String, String>();
					genomeBuildToRootFolders.put(genomeBuild.getDas2Name(), folderNameMap);
				}
				folderNameMap.put(folderKey, null);
			} else {
				String parentFolderKey = parentAnnotFolder.getName() + KEY_DELIM + parentAnnotFolder.getIdDataTrackFolder();

				// Hash dataTrack folder for a parent dataTrack folder
				TreeMap<String, ?> childFolderNameMap = folderToFolders.get(parentFolderKey);
				if (childFolderNameMap == null) {
					childFolderNameMap = new TreeMap<String, String>();
					folderToFolders.put(parentFolderKey, childFolderNameMap);
				}
				childFolderNameMap.put(folderKey, null);
			}
			dataTrackFolderMap.put(dtFolder.getIdDataTrackFolder(), dtFolder);
		}

		// Now hash the dataTrack rows
		for (Object[] row : dataTrackRows) {
			Organism organism                  = (Organism) row[0];
			GenomeBuild genomeBuild            = (GenomeBuild)  row[1];
			DataTrackFolder dtFolder           = (DataTrackFolder) row[2];
			DataTrackFolder parentAnnotFolder  = (DataTrackFolder) row[3];
			DataTrack dt                       = (DataTrack) row[4];

			// Load properties for dataTracks
			if (dt != null) {
				//dt.loadProps(dictionaryHelper);
			}

			// Hash genome builds for an organism
			TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());
			if (genomeBuildMap == null) {
				genomeBuildMap = new TreeMap<GenomeBuild, Object>(new GenomeBuildComparator());
				organismToGenomeBuild.put(organism.getBinomialName(), genomeBuildMap);
			}
			if (genomeBuild != null) {
				genomeBuildMap.put(genomeBuild, null);
			}

			if (dtFolder != null) {
				String folderKey       = dtFolder.getName()  + KEY_DELIM + dtFolder.getIdDataTrackFolder();
				// Hash root dataTrack folders for a genome build
				if (parentAnnotFolder == null) {

					TreeMap<String, ?> folderNameMap = genomeBuildToRootFolders.get(genomeBuild.getDas2Name());
					if (folderNameMap == null) {
						folderNameMap = new TreeMap<String, String>();
						genomeBuildToRootFolders.put(genomeBuild.getDas2Name(), folderNameMap);
					}
					folderNameMap.put(folderKey, null);
				} else {
					String parentFolderKey = parentAnnotFolder.getName() + KEY_DELIM + parentAnnotFolder.getIdDataTrackFolder();

					// Hash dataTrack folder for a parent dataTrack folder
					TreeMap<String, ?> childFolderNameMap = folderToFolders.get(parentFolderKey);
					if (childFolderNameMap == null) {
						childFolderNameMap = new TreeMap<String, String>();
						folderToFolders.put(parentFolderKey, childFolderNameMap);
					}
					childFolderNameMap.put(folderKey, null);
				}
				dataTrackFolderMap.put(dtFolder.getIdDataTrackFolder(), dtFolder);

				// Hash dataTracks for an dataTrack folder
				if (dt != null) {
					TreeMap<String, ?> dtNameMap = folderToDataTracks.get(folderKey);
					if (dtNameMap == null) {
						dtNameMap = new TreeMap<String, String>();
						folderToDataTracks.put(folderKey, dtNameMap);
					}
					String dtKey       = dt.getName()  + KEY_DELIM + dt.getIdDataTrack();
					dtNameMap.put(dtKey, null);
					dataTrackMap.put(dt.getIdDataTrack(), dt);
				}
			}
		}

    // Now set the folderCount for each dataTrack
    for (Object[] row : folderCountRows) {
      Integer idDataTrack               = (Integer) row[0];
      Object folderCount                = row[1];

      DataTrack dataTrack = dataTrackMap.get(idDataTrack);
      if (dataTrack != null) {
        if (folderCount instanceof Long) {
          dataTrack.setFolderCount((Long)folderCount);
        } else if (folderCount instanceof Integer) {
          dataTrack.setFolderCount((Integer)folderCount);
        } else {
          throw new RuntimeException("Folder count not an expected data type (Long or Integer)");
        }
      }
    }

	}

	public GenomeBuild getGenomeBuild(String genomeBuildName) {
		return genomeBuildNameMap.get(genomeBuildName);
	}

	public HashMap<String, GenomeBuild> getGenomeBuildNameMap() {
		return genomeBuildNameMap;
	}


	public Set<Organism> getOrganisms() {
		TreeSet<Organism> organisms = new TreeSet<Organism>(new OrganismComparator());
		for(String organismBinomialName: organismToGenomeBuild.keySet()) {
			Organism organism = organismMap.get(organismBinomialName);
			organisms.add(organism);
		}
		return organisms;
	}

	public Set<String> getGenomeBuildNames(Organism organism) {
		Set<String> genomeBuildNames = new TreeSet<String>();

		TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());
		if (genomeBuildMap != null) {
			for(GenomeBuild gb : genomeBuildMap.keySet()) {
				genomeBuildNames.add(gb.getDas2Name());
			}
		}

		return genomeBuildNames;
	}

	public List<Segment> getSegments(Organism organism, String genomeBuildDas2Name) {
		List<Segment> segments = null;
		TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());

		// For each genome build...
		if (genomeBuildMap != null) {
			for (GenomeBuild genomeBuild: genomeBuildMap.keySet()) {

				if (genomeBuild.getDas2Name().equals(genomeBuildDas2Name)) {
					segments = genomeBuildToSegments.get(genomeBuild.getDas2Name());
					break;
				}
			}
		}
		return segments;
	}

	public List<QualifiedDataTrack> getQualifiedDataTracks(Organism organism, String genomeBuildName) {
		List<QualifiedDataTrack> qualifiedDataTracks = new ArrayList<QualifiedDataTrack>();


		TreeMap<GenomeBuild, ?> genomeBuildMap = organismToGenomeBuild.get(organism.getBinomialName());

		// For each genome build...
		if (genomeBuildMap != null) {
			for (GenomeBuild genomeBuild : genomeBuildMap.keySet()) {

				if (genomeBuild.getDas2Name().equals(genomeBuildName)) {
					// For each root dataTrack folder, recurse dataTrack folder
					// hierarchy to get leaf dataTracks.
					TreeMap<String, ?> rootFolderNameMap = genomeBuildToRootFolders.get(genomeBuild.getDas2Name());
					String qualifiedName = "";
					getQualifiedDataTrack(rootFolderNameMap, qualifiedDataTracks, qualifiedName, false);

				}

			}

		}
		return qualifiedDataTracks;
	}

	private void getQualifiedDataTrack(TreeMap<String, ?> theFolders, List<QualifiedDataTrack> qualifiedDataTracks, String typePrefix, boolean showFolderLevel) {
		if (theFolders != null) {
			for (String folderKey : theFolders.keySet()) {
				String[] tokens     = folderKey.split(KEY_DELIM);
				String folderName          = tokens[0];

				// For each dataTrack....
				TreeMap<String, ?> dtNameMap = folderToDataTracks.get(folderKey);
				if (dtNameMap != null) {
					// For each dataTrack...
					for (String dtNameKey : dtNameMap.keySet()) {
						String[] tokens1    = dtNameKey.split(KEY_DELIM);
						Integer idDataTrack = Integer.valueOf(tokens1[1]);

						DataTrack dt = dataTrackMap.get(idDataTrack);


						String fullTypePrefix = concatenateTypePrefix(typePrefix, folderName, showFolderLevel);
						if (fullTypePrefix != null && fullTypePrefix.length() > 0) {
							fullTypePrefix += Constants.FILE_SEPARATOR;
						}

						qualifiedDataTracks.add(new QualifiedDataTrack(dt,
								fullTypePrefix + dt.getName(),
								fullTypePrefix + dt.getName() ));
					}
				}

				// Recurse for each dataTrack folder (under a folder)
				TreeMap<String, ?> childFolders = folderToFolders.get(folderKey);
				if (childFolders != null) {
					getQualifiedDataTrack(childFolders, qualifiedDataTracks, concatenateTypePrefix(typePrefix, folderName, showFolderLevel), true);
				}
			}
		}
	}

	private String concatenateTypePrefix(String typePrefix, String folderName, boolean showFolderLevel) {
		if (showFolderLevel) {
			if (typePrefix == null || typePrefix.equals("")) {
				return folderName;
			} else {
				return typePrefix + Constants.FILE_SEPARATOR + folderName;
			}
		} else {
			return typePrefix != null ? typePrefix : "";
		}
	}



	private void fillFolderNode(GenomeBuild genomeBuild, Element parentNode, TreeMap<String, ?> theFolders, SecurityAdvisor secAdvisor, DictionaryHelper dictionaryHelper, boolean showFolderLevel) throws Exception {
	  if (theFolders != null) {

			for (String folderKey : theFolders.keySet()) {
				String[] tokens     = folderKey.split(KEY_DELIM);
				String folderName          = tokens[0];
				Integer idDataTrackFolder = Integer.valueOf(tokens[1]);

				Element folderNode = null;
				DataTrackFolder dtFolder = null;
				if (showFolderLevel) {
					dtFolder = dataTrackFolderMap.get(idDataTrackFolder);

				    folderNode = dtFolder.getXML(secAdvisor, dictionaryHelper).getRootElement();
				    emphasizeMatch(folderNode);
				    parentNode.addContent(folderNode);


				} else {
					folderNode = parentNode;
				}


				// For each dataTrack

				TreeMap<String, ?> dtNameMap = folderToDataTracks.get(folderKey);
				if (dtNameMap != null && dtNameMap.size() > 0) {
					folderNode.setAttribute("dataTrackCount", String.valueOf(dtNameMap.size()));
					// For each dataTrack...
					for (String dtNameKey : dtNameMap.keySet()) {
						String[] tokens1    = dtNameKey.split(KEY_DELIM);
						Integer idDataTrack = Integer.valueOf(tokens1[1]);

						DataTrack dt = dataTrackMap.get(idDataTrack);

						Element dtNode = dt.getXML(secAdvisor, dictionaryHelper, null, null).getRootElement();
						dtNode.setAttribute("idDataTrackFolder", dtFolder != null ? dtFolder.getIdDataTrackFolder().toString() : "");
						emphasizeMatch(dtNode);

						folderNode.addContent(dtNode);

					}
				}

				// Recurse for each dataTrack folder (under a folder)
				TreeMap<String, ?> childFolders = folderToFolders.get(folderKey);
				fillFolderNode(genomeBuild, folderNode, childFolders, secAdvisor, dictionaryHelper, true);

				// Prune out other group's folders that don't have
				// any content (no authorized dataTracks in its folder
				// or its descendent's folder).

				if (!folderNode.hasChildren()) {
					String folderIdUserGroup = folderNode.getAttributeValue("idLab");

					boolean prune = true;
					// always prune if guest user.
					if (secAdvisor.isGuest()) {
					  prune = true;
					}
					// Public folders
					else if (folderNode.getName().equals("DataTrackFolder") &&
						(folderIdUserGroup == null || folderIdUserGroup.equals(""))) {
						// If we are not filtering by user group,
						// always show empty public empty folders
						if (this.idLab == null && this.ids == null) {
							prune = false;
						} else {
							// If we are filtering by user group, prune
							// empty public folders.
							prune = true;
						}
					}
					// User group folders
					else if (folderNode.getName().equals("DataTrackFolder") &&
							    folderIdUserGroup != null &&
							    !folderIdUserGroup.equals("") &&
							  	(secAdvisor.isGroupIAmMemberOrManagerOf(Integer.valueOf(folderIdUserGroup)))) {
						if (this.idLab == null && this.ids == null) {
							// If we are not filtering by user group, then always
							// show my group's empty folders
							prune = false;
						} else {
							// If we are filtering by user group, prune any empty
							// folders not specifically for the group being filtered
							if (this.idLab != null && this.idLab.equals(Integer.valueOf(folderIdUserGroup))) {
								prune = false;
							} else {
								prune = true;
							}

						}
					}	else {
						// Prune empty folders for other groups
						prune = true;
					}
					if (prune) {
						parentNode.removeContent(folderNode);
					}
				}
			}
		}

	}




    private boolean hasDataTrackCriteria() {
    	if (idLab != null ||
    	    hasVisibilityCriteria()
    	    || ids != null) {
    		return true;
    	} else {
    		return false;
    	}
    }


    private boolean hasVisibilityCriteria() {
    	if (this.isVisibilityOwner.equals("Y") && this.isVisibilityMembers.equals("Y") && this.isVisibilityInstitute.equals("Y") && this.isVisibilityPublic.equals("Y")) {
    		return false;
    	} else if (this.isVisibilityOwner.equals("N") && this.isVisibilityMembers.equals("N") && this.isVisibilityInstitute.equals("N") && this.isVisibilityPublic.equals("N")) {
    		return false;
    	} else {
    		return true;
    	}
    }


    private void filterByExcludeUsage(){
      //If getting lab info for all labs don't include labs with excludeUsage == 'Y'
      if(idLab == null){
        this.AND();
        queryBuf.append(" lab.excludeUsage != 'Y' ");
      }
    }
	private void addCriteria(int joinLevel) {

	  this.AND();
	  queryBuf.append(" org.binomialName is not NULL");
	  this.AND();
    queryBuf.append(" org.binomialName != ''");
    this.AND();
	  queryBuf.append(" org.das2Name is not NULL");
	  this.AND();
    queryBuf.append(" org.das2Name != ''");
    this.AND();
    queryBuf.append(" gb.das2Name is not NULL");
    this.AND();
    queryBuf.append(" gb.das2Name != ''");

    // Search by list of data track ids
    if (ids != null) {
      if (joinLevel == DATATRACK_LEVEL) {
        this.AND();
        queryBuf.append(" dataTrack.idDataTrack in (");
        // if ids supplied but an empty list, then make sure we get no data tracks.
        if (ids.size() == 0) {
          queryBuf.append("-1");
        } else {
          Boolean firstId = true;
          for (Integer id : ids) {
            if (!firstId) {
              queryBuf.append(", ");
            }
            firstId = false;
            queryBuf.append(id.toString());
          }
        }
        queryBuf.append(")");
      }
    }

    // Search for datatrack by number
    if (number != null && !number.equals("")) {
      if (joinLevel == DATATRACK_LEVEL) {
        this.AND();
        queryBuf.append(" (dataTrack.fileName = '" + this.number + "'");
        if(idGenomeBuild != null){
          queryBuf.append(" OR dataTrack.idGenomeBuild = " + this.idGenomeBuild + ") ");
        } else{
          queryBuf.append(" ) ");
        }
      }
    }

		// Search by organism
		if (idOrganism != null) {
			this.AND();
			queryBuf.append(" org.idOrganism = ");
			queryBuf.append(idOrganism);
		}
		// Search by genome build
		if (idGenomeBuild != null) {
			this.AND();
			queryBuf.append(" gb.idGenomeBuild = ");
			queryBuf.append(idGenomeBuild);
		}
		// Search for dataTracks and dataTrack groups for a particular group
		if (idLab != null) {
			this.AND();
			queryBuf.append("(");
			if (joinLevel == DATATRACK_LEVEL) {
				queryBuf.append(" dataTrack.idLab = " + this.idLab);
			} else if (joinLevel == FOLDER_LEVEL) {
				queryBuf.append(" folder.idLab = " + this.idLab);
				queryBuf.append(" OR ");
				queryBuf.append(" folder.idLab is NULL");
			}
			queryBuf.append(")");
		}
		// Filter by dataTrack's visibility
		if (joinLevel == DATATRACK_LEVEL) {
			if (hasVisibilityCriteria()) {
				this.AND();
				int count = 0;
				queryBuf.append(" dataTrack.codeVisibility in (");
				if (this.isVisibilityOwner.equals("Y")) {
					queryBuf.append("'" + Visibility.VISIBLE_TO_OWNER + "'");
					count++;
				}
				if (this.isVisibilityMembers.equals("Y")) {
          if (count > 0) {
            queryBuf.append(", ");
          }
          queryBuf.append("'" + Visibility.VISIBLE_TO_GROUP_MEMBERS + "'");
          count++;
        }
				if (this.isVisibilityInstitute.equals("Y")) {
					if (count > 0) {
						queryBuf.append(", ");
					}
					queryBuf.append("'" + Visibility.VISIBLE_TO_INSTITUTION_MEMBERS + "'");
					count++;
				}
				if (this.isVisibilityPublic.equals("Y")) {
					if (count > 0) {
						queryBuf.append(", ");
					}
					queryBuf.append("'" + Visibility.VISIBLE_TO_PUBLIC + "'");
					count++;
				}
				queryBuf.append(")");
			}

		}




	}




	protected boolean AND() {
		if (addWhere) {
			queryBuf.append(" WHERE ");
			addWhere = false;
		} else {
			queryBuf.append(" AND ");
		}
		return addWhere;
	}

	public String getIsVisibilityPublic() {
    	return isVisibilityPublic;
    }

	public void setIsVisibilityPublic(String isVisibilityPublic) {
    	this.isVisibilityPublic = isVisibilityPublic;
    }

	public String getIsVisibilityMembers() {
    	return isVisibilityMembers;
    }

	public void setIsVisibilityMembers(String isVisibilityMembers) {
    	this.isVisibilityMembers = isVisibilityMembers;
    }

	public String getIsVisibilityInstitute() {
    	return isVisibilityInstitute;
    }

	public void setIsVisibilityInstitute(String isVisibilityInstitute) {
    	this.isVisibilityInstitute = isVisibilityInstitute;
   }

	public String getIsVisibilityOwner() {
    return isVisibilityOwner;
  }

	public void setIsVisibilityOwner(String isVisibilityOwner) {
    this.isVisibilityOwner = isVisibilityOwner;
  }

  public Integer getIdLab() {
    return idLab;
  }

  public void setIdLab(Integer idLab) {
    this.idLab = idLab;
  }
}
