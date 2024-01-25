package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@SuppressWarnings("serial")
public class AnalysisSampleParser extends DetailObject implements Serializable {
	
	protected JsonArray samplesList;
	protected List<Integer>							idSampleList = new ArrayList<Integer>();
	protected HashMap<Integer, Integer>     		idRequestMap = new HashMap<Integer, Integer>();
	
	public AnalysisSampleParser(JsonArray samplesList) {
		this.samplesList = samplesList;
	}
	
	@SuppressWarnings("rawtypes")
	public void parse(Session sess) throws Exception {

		for (int i = 0; i < samplesList.size(); i++) {
			JsonObject obj = samplesList.getJsonObject(i);
			
			String idSampleString = obj.get("idSample") != null ? obj.getString("idSample") : null;
			Integer idSample = Integer.valueOf(idSampleString);
			
			String idRequestString = obj.get("idRequest") != null ? obj.getString("idRequest") : null;
			Integer idRequest = Integer.valueOf(idRequestString);
			if(idSample != null && idRequest != null){
				idSampleList.add(idSample);
				idRequestMap.put(idSample, idRequest);
			}
		}
	}
	
	public List<Integer> getIdSamples() {
		return idSampleList;
	}
	
	public Integer getIdRequest(Integer idSample) {
		return idRequestMap.get(idSample);
	}

}
