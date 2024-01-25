package hci.gnomex.utility;

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


public class TopicQuery implements Serializable {

  long et = 0;


	// Criteria
	private String             scopeLevel = "";
	private String             number;
	private Integer            idLab;
	private String             isVisibilityPublic = "Y";
  private String             isVisibilityOwner = "Y";
	private String             isVisibilityMembers = "Y";
	private String             isVisibilityInstitute = "Y";
	private String             isServerRefreshMode = "N";

	private int                hitCount = 0;


	private StringBuffer       queryBuf;
	private boolean            addWhere = true;

	private static String      KEY_DELIM = "!!!!";

	private static final int                         TOPIC_LEVEL = 1;
  private static final int                         DATATRACK_LEVEL = 2;
  private static final int                         REQUEST_LEVEL = 3;
  private static final int                         ANALYSIS_LEVEL = 4;

  private LinkedHashMap<Integer, TreeMap<String, ?>>     rootTopics;
  private HashMap<String, TreeMap<String, ?>>      topicToTopics;
  private HashMap<String, TreeMap<String, ?>>      topicToRequests;
  private HashMap<Integer, Request>                requestMap;
  private HashMap<String, TreeMap<String, ?>>      topicToAnalyses;
  private HashMap<Integer, Analysis>               analysisMap;
  private HashMap<String, TreeMap<String, ?>>      topicToDataTracks;
  private HashMap<Integer, DataTrack>              dataTrackMap;
  private HashMap<Integer, Topic>                  topicMap;
  private ArrayList<Integer>                       restrictedRequestList;
  private ArrayList<Integer>                       restrictedAnalysisList;
  private ArrayList<Integer>                       restrictedDataTrackList;

	@SuppressWarnings("unchecked")

	public TopicQuery() {
		if (scopeLevel == null || scopeLevel.equals("")) {
			scopeLevel = SecurityAdvisor.ALL_SCOPE_LEVEL;
		}
	}

	public TopicQuery(HttpServletRequest req) {
		scopeLevel         = req.getParameter("scopeLevel");
    number         = req.getParameter("number");
		idLab        = DataTrackUtil.getIntegerParameter(req, "idLab");
    this.isVisibilityOwner = DataTrackUtil.getFlagParameter(req, "isVisibilityOwner");
		this.isVisibilityMembers = DataTrackUtil.getFlagParameter(req, "isVisibilityMembers");
		this.isVisibilityInstitute = DataTrackUtil.getFlagParameter(req, "isVisibilityInstitute");
		this.isVisibilityPublic = DataTrackUtil.getFlagParameter(req, "isVisibilityPublic");

		if (scopeLevel == null || scopeLevel.equals("")) {
			scopeLevel = SecurityAdvisor.ALL_SCOPE_LEVEL;
		}
	}

	@SuppressWarnings("unchecked")
	public Document getTopicDocument(Session sess, SecurityAdvisor secAdvisor) throws Exception {

	  // Run query to get topics this user has permissions to see
	  StringBuffer queryBuf = this.getTopicsQuery(secAdvisor);
	  Logger.getLogger(this.getClass().getName()).fine("Topics query: " + queryBuf.toString());
	  Query query = sess.createQuery(queryBuf.toString());
	  List<Object[]> topicRows = query.list();

    // Run query to get requests this user has permission to see, organized under topics
	  // the user won't necessarily have permission to see the topics these requests are stored under so they won't necessarily end up in the directory tree
    queryBuf = this.getRequestQuery(secAdvisor, DictionaryHelper.getInstance(sess), true);
    Logger.getLogger(this.getClass().getName()).fine("Request query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> accessibleRequestRows = query.list();

    // Run query to get all requests (no visibility restrictions), organized under topics
    // these might be stored under a topic the user has access to but the user doesn't have permissions to access the request
    //	we will display their names only to show the user they exist but are restricted to them
    //  only those requests which are organized up topics the user has access to will actually be used
    queryBuf = this.getRequestQuery(secAdvisor,  DictionaryHelper.getInstance(sess), false);
    Logger.getLogger(this.getClass().getName()).fine("Request query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> allRequestRows = query.list();

    // Run query to get analyses, organized under topics
    queryBuf = this.getAnalysisQuery(secAdvisor);
    Logger.getLogger(this.getClass().getName()).fine("Analysis query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> returnedAnalysisRows = query.list();

    // Run query to get analyses with no visibility restrictions, organized under topics
    queryBuf = this.getAnalysisQuery(null);
    Logger.getLogger(this.getClass().getName()).fine("Analysis query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> unrestrictedAnalysisRows = query.list();

    // Run query to get dataTracks, organized under topics
    queryBuf = this.getDataTrackQuery(secAdvisor);
    Logger.getLogger(this.getClass().getName()).fine("DataTrack query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> returnedDataTrackRows = query.list();

    // Run query to get dataTracks with no visibility restrictions, organized under topics
    queryBuf = this.getDataTrackQuery(null);
    Logger.getLogger(this.getClass().getName()).fine("DataTrack query: " + queryBuf.toString());
    query = sess.createQuery(queryBuf.toString());
    List<Object[]> unrestrictedDataTrackRows = query.list();


	  // Create an XML document
	  Document doc = this.getTopicDocument(topicRows, accessibleRequestRows, allRequestRows, returnedAnalysisRows, unrestrictedAnalysisRows, returnedDataTrackRows, unrestrictedDataTrackRows, DictionaryHelper.getInstance(sess), secAdvisor);
	  return doc;

	}

	private StringBuffer getTopicsQuery(SecurityAdvisor secAdvisor) throws Exception {

		addWhere = true;
		queryBuf = new StringBuffer();

		queryBuf.append(" SELECT     topic, ");
		queryBuf.append("            parentTopic ");
		queryBuf.append(" FROM       Topic as topic");
		queryBuf.append(" LEFT JOIN  topic.parentTopic as parentTopic ");


		addWhere = true;

		addCriteria(TOPIC_LEVEL);

    if (secAdvisor != null) {
      addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "topic", null, addWhere, false, false, false);
    }

		queryBuf.append(" ORDER BY topic.name asc ");

		return queryBuf;

	}

  private StringBuffer getRequestQuery(SecurityAdvisor secAdvisor, DictionaryHelper dictionaryHelper, boolean isRestricted) throws Exception {

    addWhere = true;
    queryBuf = new StringBuffer();

    queryBuf.append(" SELECT     tp, ");
    queryBuf.append("            parentTopic, ");
    queryBuf.append("            request  ");
    queryBuf.append(" FROM       Topic as tp ");
    queryBuf.append(" LEFT JOIN  tp.parentTopic as parentTopic ");
    queryBuf.append(" LEFT JOIN  tp.requests as request ");
    queryBuf.append(" LEFT JOIN  request.collaborators as collab ");


    addWhere = true;

    addCriteria(REQUEST_LEVEL);

    if (isRestricted) {
      addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "request", "collab", addWhere, false, true, false);
    }

    addWhere = secAdvisor.appendExcludeClinicResearchCriteria(queryBuf, addWhere, dictionaryHelper, "request");

    queryBuf.append(" ORDER BY tp.name asc, request.name asc ");

    return queryBuf;

  }

  private StringBuffer getAnalysisQuery(SecurityAdvisor secAdvisor) throws Exception {

    addWhere = true;
    queryBuf = new StringBuffer();

    queryBuf.append(" SELECT     tp, ");
    queryBuf.append("            parentTopic, ");
    queryBuf.append("            analysis  ");
    queryBuf.append(" FROM       Topic as tp ");
    queryBuf.append(" LEFT JOIN  tp.parentTopic as parentTopic ");
    queryBuf.append(" LEFT JOIN  tp.analyses as analysis ");
    queryBuf.append(" LEFT JOIN  analysis.collaborators as collab ");


    addWhere = true;

    addCriteria(ANALYSIS_LEVEL);

    if (secAdvisor != null) {
      addWhere = secAdvisor.buildSecurityCriteria(queryBuf, "analysis", "collab", addWhere, false, false, false);
    }

    queryBuf.append(" ORDER BY tp.name asc, analysis.name asc ");

    return queryBuf;

  }

  private StringBuffer getDataTrackQuery(SecurityAdvisor secAdvisor) throws Exception {

    addWhere = true;
    queryBuf = new StringBuffer();

    queryBuf.append(" SELECT     tp, ");
    queryBuf.append("            parentTopic, ");
    queryBuf.append("            dataTrack  ");
    queryBuf.append(" FROM       Topic as tp ");
    queryBuf.append(" LEFT JOIN  tp.parentTopic as parentTopic ");
    queryBuf.append(" LEFT JOIN  tp.dataTracks as dataTrack ");
    queryBuf.append(" LEFT JOIN  dataTrack.collaborators as collab ");


    addWhere = true;

    addCriteria(DATATRACK_LEVEL);

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

    queryBuf.append(" ORDER BY tp.name asc, dataTrack.name asc ");

    return queryBuf;

  }



	private Document getTopicDocument(List<Object[]> topicRows,
	    List<Object[]> accessibleRequestRows, List<Object[]> allRequestRows,
	    List<Object[]> returnedAnalysisRows, List<Object[]> unrestrictedAnalysisRows,
	    List<Object[]> returnedDataTrackRows, List<Object[]> unrestrictedDataTrackRows,
	    DictionaryHelper dictionaryHelper, SecurityAdvisor secAdvisor) throws Exception {

    // Build a list of requests that are not be visible to this user.
    // This list will be used later mark tag requests as restricted.
	  restrictedRequestList = new ArrayList<Integer>();
	  // check all Requests to see if the user has access to them, if not add them to
    for (Object[] row : allRequestRows) {
      Request thisRequest = (Request) row[2];
// this topic may not have a request &&  			is thisRequest restricted?				   && did we already see this request under a different topic?
      if(thisRequest != null && checkIfRequestIsRestricted(thisRequest, accessibleRequestRows) && !restrictedRequestList.contains(thisRequest.getIdRequest())) {
        restrictedRequestList.add(thisRequest.getIdRequest());
      }
    }
    // Same for Analyses
    restrictedAnalysisList = new ArrayList<Integer>();
    for (Object[] row : unrestrictedAnalysisRows) {
      Analysis thisUnrestrictedAnalysis = (Analysis) row[2];
      if(thisUnrestrictedAnalysis != null && checkForRestrictedAnalysis(thisUnrestrictedAnalysis, returnedAnalysisRows) && !restrictedAnalysisList.contains(thisUnrestrictedAnalysis.getIdAnalysis())) {
        restrictedAnalysisList.add(thisUnrestrictedAnalysis.getIdAnalysis());
      }
    }
    // Same for Data Tracks
    restrictedDataTrackList = new ArrayList<Integer>();
    for (Object[] row : unrestrictedDataTrackRows) {
      DataTrack thisUnrestrictedDataTrack = (DataTrack) row[2];
      if(thisUnrestrictedDataTrack != null && checkForRestrictedDataTrack(thisUnrestrictedDataTrack, returnedDataTrackRows) && !restrictedDataTrackList.contains(thisUnrestrictedDataTrack.getIdDataTrack())) {
        restrictedDataTrackList.add(thisUnrestrictedDataTrack.getIdDataTrack());
      }
    }

		hashRequestsAnalysesDataTracks(topicRows, allRequestRows, unrestrictedAnalysisRows, unrestrictedDataTrackRows, dictionaryHelper);

    Document doc = new Document(new Element("Folder"));
    Element root = doc.getRootElement();
    root.setAttribute("label", "Topics");

		// Use hash to create XML Document.
		hitCount = 0;
    for (Integer topicID : rootTopics.keySet()) {
      TreeMap<String, ?> topicMap = rootTopics.get(topicID);
      fillTopicNode(root, topicMap, secAdvisor, dictionaryHelper);
    }

    Document topDoc = new Document(new Element("TopicList"));
    Element topRoot = topDoc.getRootElement();
    topRoot.setAttribute("hitCount", Integer.valueOf(hitCount).toString());


    topRoot.addContent(root);

		return topDoc;

	}

  private boolean checkIfRequestIsRestricted(Request thisRequest, List<Object[]> accessibleRequestRows) {
	  // is this Request in the set of accessible requests for this user?
    for (Object[] row : accessibleRequestRows) {
      Request thisAccessibleRequest = (Request) row[2];
      if(thisAccessibleRequest != null && thisAccessibleRequest.getIdRequest().intValue() == thisRequest.getIdRequest().intValue()) {
        // we found thisRequest in the user's set of accessibleRequests -> NOT RESTRICTED
    	  return false;
      }
    }
    // Return indicating restricted if thisUnrestrictedRequest is on the unrestricted list but not in returnedRequestRows
    return true;
  }

  private boolean checkForRestrictedAnalysis(Analysis thisUnrestrictedAnalysis, List<Object[]> returnedAnalysisRows) {
    for (Object[] row : returnedAnalysisRows) {
      Analysis thisReturnedAnalysis = (Analysis) row[2];
      if(thisReturnedAnalysis != null && thisReturnedAnalysis.getIdAnalysis().intValue() == thisUnrestrictedAnalysis.getIdAnalysis().intValue()) {
        return false;
      }
    }
    // Return indicating restricted if thisUnrestrictedAnalysis is on the unrestricted list but not in returnedAnalysisRows
    return true;
  }

  private boolean checkForRestrictedDataTrack(DataTrack thisUnrestrictedDataTrack, List<Object[]> returnedDataTrackRows) {
    for (Object[] row : returnedDataTrackRows) {
      DataTrack thisReturnedDataTrack = (DataTrack) row[2];
      if(thisReturnedDataTrack != null && thisReturnedDataTrack.getIdDataTrack().intValue() == thisUnrestrictedDataTrack.getIdDataTrack().intValue()) {
        return false;
      }
    }
    // Return indicating restricted if thisUnrestrictedDataTrack is on the unrestricted list but not in returnedDataTrackRows
    return true;
  }

	private void hashRequestsAnalysesDataTracks(List<Object[]> topicRows, List<Object[]> requestRows, List<Object[]> analysisRows, List<Object[]> dataTrackRows, DictionaryHelper dictionaryHelper) {
	  rootTopics           = new LinkedHashMap<Integer, TreeMap<String, ?>>();
		topicToTopics        = new HashMap<String, TreeMap<String, ?>>();
    topicToRequests      = new HashMap<String, TreeMap<String, ?>>();
    topicToAnalyses      = new HashMap<String, TreeMap<String, ?>>();
    topicToDataTracks    = new HashMap<String, TreeMap<String, ?>>();
		topicMap             = new HashMap<Integer, Topic>();
    requestMap           = new HashMap<Integer, Request>();
    analysisMap          = new HashMap<Integer, Analysis>();
    dataTrackMap         = new HashMap<Integer, DataTrack>();

		// Hash to create hierarchy:
    //   Topic
    //     Request
    //     Analysis
    //     DataTrack

		// First hash the topics
		for (Object[] row : topicRows) {
			Topic dtTopic      = (Topic) row[0];
			Topic parentTopic  = (Topic) row[1];

			// Hash root topics
			String folderKey       = dtTopic.getName()  + KEY_DELIM + dtTopic.getIdTopic();
			if (parentTopic == null) {
				TreeMap<String, ?> topicNameMap = rootTopics.get(dtTopic.getIdTopic());
				if (topicNameMap == null) {
					topicNameMap = new TreeMap<String, String>();
					rootTopics.put(dtTopic.getIdTopic(), topicNameMap);
				}
				topicNameMap.put(folderKey, null);
			} else {
				String parentTopicKey = parentTopic.getName() + KEY_DELIM + parentTopic.getIdTopic();

				// Hash topic for a parent topic
				TreeMap<String, ?> childTopicNameMap = topicToTopics.get(parentTopicKey);
				if (childTopicNameMap == null) {
				  childTopicNameMap = new TreeMap<String, String>();
					topicToTopics.put(parentTopicKey, childTopicNameMap);
				}
				childTopicNameMap.put(folderKey, null);
			}
			topicMap.put(dtTopic.getIdTopic(), dtTopic);
		}

		// Now hash the request rows
		for (Object[] row : requestRows) {
			Topic dtTopic         = (Topic) row[0];
			//Topic parentTopic     = (Topic) row[1];
			Request req          = (Request) row[2];


			String folderKey       = dtTopic.getName()  + KEY_DELIM + dtTopic.getIdTopic();
			/*
			// Hash root topics
			if (parentTopic == null) {

				TreeMap<String, ?> topicNameMap = rootTopics.get(dtTopic.getIdTopic());
				if (topicNameMap == null) {
					topicNameMap = new TreeMap<String, String>();
					rootTopics.put(dtTopic.getIdTopic(), topicNameMap);
				}
				topicNameMap.put(folderKey, null);
			} else {
				String parentTopicKey = parentTopic.getName() + KEY_DELIM + parentTopic.getIdTopic();

				// Hash topic for a parent topic
				TreeMap<String, ?> childTopicNameMap = topicToTopics.get(parentTopicKey);
				if (childTopicNameMap == null) {
				  childTopicNameMap = new TreeMap<String, String>();
					topicToTopics.put(parentTopicKey, childTopicNameMap);
				}
				childTopicNameMap.put(folderKey, null);
			}
			topicMap.put(dtTopic.getIdTopic(), dtTopic);
			*/

			// Hash requests for a topic
			if (req != null) {
				TreeMap<String, ?> dtNameMap = topicToRequests.get(folderKey);
				if (dtNameMap == null) {
					dtNameMap = new TreeMap<String, String>();
					topicToRequests.put(folderKey, dtNameMap);
				}
				String dtKey       = req.getName()  + KEY_DELIM + req.getIdRequest();
				dtNameMap.put(dtKey, null);
				requestMap.put(req.getIdRequest(), req);
			}

		}

    // Now hash the analysis rows
    for (Object[] row : analysisRows) {
      Topic dtTopic         = (Topic) row[0];
      //Topic parentTopic     = (Topic) row[1];
      Analysis an          = (Analysis) row[2];

      String folderKey       = dtTopic.getName()  + KEY_DELIM + dtTopic.getIdTopic();

      /*
      // Hash root topics
      if (parentTopic == null) {

        TreeMap<String, ?> topicNameMap = rootTopics.get(dtTopic.getIdTopic());
        if (topicNameMap == null) {
          topicNameMap = new TreeMap<String, String>();
          rootTopics.put(dtTopic.getIdTopic(), topicNameMap);
        }
        topicNameMap.put(folderKey, null);
      } else {
        String parentTopicKey = parentTopic.getName() + KEY_DELIM + parentTopic.getIdTopic();

        // Hash topic for a parent topic
        TreeMap<String, ?> childTopicNameMap = topicToTopics.get(parentTopicKey);
        if (childTopicNameMap == null) {
          childTopicNameMap = new TreeMap<String, String>();
          topicToTopics.put(parentTopicKey, childTopicNameMap);
        }
        childTopicNameMap.put(folderKey, null);
      }
      topicMap.put(dtTopic.getIdTopic(), dtTopic);
      */

      // Hash analysis for a topic
      if (an != null) {
        TreeMap<String, ?> dtNameMap = topicToAnalyses.get(folderKey);
        if (dtNameMap == null) {
          dtNameMap = new TreeMap<String, String>();
          topicToAnalyses.put(folderKey, dtNameMap);
        }
        String dtKey       = an.getName()  + KEY_DELIM + an.getIdAnalysis();
        dtNameMap.put(dtKey, null);
        analysisMap.put(an.getIdAnalysis(), an);
      }

    }

    // Now hash the dataTrack rows
    for (Object[] row : dataTrackRows) {
      Topic dtTopic         = (Topic) row[0];
      //Topic parentTopic     = (Topic) row[1];
      DataTrack dt          = (DataTrack) row[2];

      String folderKey       = dtTopic.getName()  + KEY_DELIM + dtTopic.getIdTopic();
      /*
      // Hash root dataTrack folders for a genome build
      if (parentTopic == null) {

        TreeMap<String, ?> topicNameMap = rootTopics.get(dtTopic.getIdTopic());
        if (topicNameMap == null) {
          topicNameMap = new TreeMap<String, String>();
          rootTopics.put(dtTopic.getIdTopic(), topicNameMap);
        }
        topicNameMap.put(folderKey, null);
      } else {
        String parentTopicKey = parentTopic.getName() + KEY_DELIM + parentTopic.getIdTopic();

        // Hash topic for a parent topic
        TreeMap<String, ?> childTopicNameMap = topicToTopics.get(parentTopicKey);
        if (childTopicNameMap == null) {
          childTopicNameMap = new TreeMap<String, String>();
          topicToTopics.put(parentTopicKey, childTopicNameMap);
        }
        childTopicNameMap.put(folderKey, null);
      }
      topicMap.put(dtTopic.getIdTopic(), dtTopic);
      */

      // Hash dataTracks for a topic
      if (dt != null) {
        TreeMap<String, ?> dtNameMap = topicToDataTracks.get(folderKey);
        if (dtNameMap == null) {
          dtNameMap = new TreeMap<String, String>();
          topicToDataTracks.put(folderKey, dtNameMap);
        }
        String dtKey       = dt.getName()  + KEY_DELIM + dt.getIdDataTrack();
        dtNameMap.put(dtKey, null);
        dataTrackMap.put(dt.getIdDataTrack(), dt);
      }

    }
	}

	private void fillTopicNode(Element parentNode, TreeMap<String, ?> theTopics, SecurityAdvisor secAdvisor, DictionaryHelper dictionaryHelper) throws Exception {
	  if (theTopics != null) {
			for (String folderKey : theTopics.keySet()) {
				String[] tokens     = folderKey.split(KEY_DELIM);
				Integer idTopic = Integer.valueOf(tokens[1]);

				Element topicNode = null;
        Topic childTopic = null;


        childTopic = topicMap.get(idTopic);

        topicNode = childTopic.getXML(secAdvisor, dictionaryHelper).getRootElement();

        // Add any requests that belong to this topic
        TreeMap<String, ?> reqNameMap = topicToRequests.get(folderKey);
        if (reqNameMap != null && reqNameMap.size() > 0) {

          Element labelNode = new Element("Category");
          labelNode.setAttribute("label", "Experiments");

          topicNode.setAttribute("requestCount", String.valueOf(reqNameMap.size()));
          // For each request...
          for (String reqNameKey : reqNameMap.keySet()) {
            String[] tokens1    = reqNameKey.split(KEY_DELIM);
            Integer idRequest = Integer.valueOf(tokens1[1]);

            Request req = requestMap.get(idRequest);

            boolean isRestrictedRequest = restrictedRequestList.contains(req.getIdRequest());

            Element reqNode;

            if(isRestrictedRequest) {
              reqNode = req.getRestrictedVisibilityXML(secAdvisor, dictionaryHelper).getRootElement();
            } else {
              reqNode = req.getXML(secAdvisor, dictionaryHelper).getRootElement();
            }

            reqNode.setAttribute("idTopic", childTopic != null ? childTopic.getIdTopic().toString() : "");

            labelNode.addContent(reqNode);
          }
          topicNode.addContent(labelNode);
        }

        // Add any analyses that belong to this topic
        TreeMap<String, ?> anNameMap = topicToAnalyses.get(folderKey);
        if (anNameMap != null && anNameMap.size() > 0) {

          Element labelNode = new Element("Category");
          labelNode.setAttribute("label", "Analysis");

          topicNode.setAttribute("analysisCount", String.valueOf(anNameMap.size()));
          // For each analysis...
          for (String anNameKey : anNameMap.keySet()) {
            String[] tokens1    = anNameKey.split(KEY_DELIM);
            Integer idAnalysis = Integer.valueOf(tokens1[1]);

            Analysis an = analysisMap.get(idAnalysis);

            boolean isRestrictedAnalysis = restrictedAnalysisList.contains(an.getIdAnalysis());

            Element anNode;

            if(isRestrictedAnalysis) {
              anNode = new Element("Analysis");
              anNode.setAttribute("number", an.getNumber() + " (Restricted Visibility)");
              anNode.setAttribute("idAnalysis", an.getIdAnalysis().toString());
            } else {
              anNode = an.getXML(secAdvisor, dictionaryHelper).getRootElement();
            }

            anNode.setAttribute("idTopic", childTopic != null ? childTopic.getIdTopic().toString() : "");

            labelNode.addContent(anNode);

          }
          topicNode.addContent(labelNode);
        }
        // Add any dataTracks that belong to this topic
        TreeMap<String, ?> dtNameMap = topicToDataTracks.get(folderKey);
        if (dtNameMap != null && dtNameMap.size() > 0) {

          Element labelNode = new Element("Category");
          labelNode.setAttribute("label", "Data Tracks");

          topicNode.setAttribute("dataTrackCount", String.valueOf(dtNameMap.size()));
          // For each dataTrack...
          for (String dtNameKey : dtNameMap.keySet()) {
            String[] tokens1    = dtNameKey.split(KEY_DELIM);
            Integer idDataTrack = Integer.valueOf(tokens1[1]);

            DataTrack dt = dataTrackMap.get(idDataTrack);

            boolean isRestrictedDataTrack = restrictedDataTrackList.contains(dt.getIdDataTrack());

            Element dtNode;

            if(isRestrictedDataTrack) {
              dtNode = new Element("DataTrack");
              dtNode.setAttribute("number", dt.getNumber() + " (Restricted Visibility)");
              dtNode.setAttribute("idDataTrack", dt.getIdDataTrack().toString());
              dtNode.setAttribute("codeVisibility", dt.getCodeVisibility() != null ? dt.getCodeVisibility() : "");
            } else {
              dtNode = dt.getXML(secAdvisor, dictionaryHelper, null, null).getRootElement();
            }

            dtNode.setAttribute("idTopic", childTopic != null ? childTopic.getIdTopic().toString() : "");

            labelNode.addContent(dtNode);
          }
          topicNode.addContent(labelNode);
        }

				// Recurse for each topic (under a topic)
				TreeMap<String, ?> childFolders = topicToTopics.get(folderKey);
				fillTopicNode(topicNode, childFolders, secAdvisor, dictionaryHelper);
	      parentNode.addContent(topicNode);
			}
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

	private void addCriteria(int joinLevel) {

    // Search for items by number
    if (number != null && !number.equals("")) {
      if (joinLevel == REQUEST_LEVEL) {
        this.AND();
        queryBuf.append(" request.fileName = '" + this.number + "'");
      } else if (joinLevel == ANALYSIS_LEVEL) {
        this.AND();
        queryBuf.append(" analysis.fileName = '" + this.number + "'");
      } else if (joinLevel == DATATRACK_LEVEL) {
        this.AND();
        queryBuf.append(" dataTrack.fileName = '" + this.number + "'");
      }
    }

		// Search for items and item groups for a particular group
		if (idLab != null) {
			this.AND();
			queryBuf.append("(");
			if (joinLevel == REQUEST_LEVEL) {
				queryBuf.append(" request.idLab = " + this.idLab);
      } else if (joinLevel == ANALYSIS_LEVEL) {
        queryBuf.append(" analysis.idLab = " + this.idLab);
      } else if (joinLevel == DATATRACK_LEVEL) {
        queryBuf.append(" dataTrack.idLab = " + this.idLab);
      } else if (joinLevel == TOPIC_LEVEL) {
				queryBuf.append(" topic.idLab = " + this.idLab);
				queryBuf.append(" OR ");
				queryBuf.append(" topic.idLab is NULL");
			}
			queryBuf.append(")");
		}

		// Filter by request, analysis, or dataTrack's visibility
		if (joinLevel == REQUEST_LEVEL || joinLevel == ANALYSIS_LEVEL || joinLevel == DATATRACK_LEVEL) {
			if (hasVisibilityCriteria()) {
				this.AND();
				int count = 0;
				if(joinLevel == REQUEST_LEVEL) {
				  queryBuf.append(" request.codeVisibility in (");
        } else if(joinLevel == ANALYSIS_LEVEL) {
          queryBuf.append(" analysis.codeVisibility in (");
        } else if(joinLevel == DATATRACK_LEVEL) {
          queryBuf.append(" dataTrack.codeVisibility in (");
        }
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

		if(joinLevel == REQUEST_LEVEL){
		  this.AND();
		  queryBuf.append(" (request.archived is null or request.archived = 'N') ");
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

  public static Topic getTopicFromTopicNumber(Session sess, String  topicNumber) {
    Topic t = null;

    StringBuffer buf = new StringBuffer("SELECT t from Topic as t where t.idTopic = '" + topicNumber + "'");
    List topics = sess.createQuery(buf.toString()).list();
    if (topics.size() > 0) {
      t = (Topic)topics.get(0);
    }
    return t;
  }
}
