package hci.gnomex.daemon.auto_import;

public class PersonEntry {


	private String mrn;
	private String shadowId;
	private String personId;
	private String fullName;
	private String gender; // n
	private String ccNumber;
	private String slNumber;
	private String testType; //testType
	private String tissueType; // tissueType
	public final static String AVATAR = "avatar";
	public final static String FOUNDATION = "foundation";
	public final static String TEMPUS = "tempus";



	private String sampleSubtype;  // sampleSubtype;
	private String submittedDiagnosis; // submittedDiagnosis;
	private String captureDesign;
	private String captureTestName;
	private String captureTestDescription;


	PersonEntry(){
	
	}
	PersonEntry(String mrn, String fullName, String gender,String ccNumber,String testType,
				String tissueType,String sampleSubtype, String submittedDiagnosis,
				String slNumber,String shadowId,String personId, String captureDesign,
				String captureTestName, String captureTestDescription  ){
		this.mrn = mrn;
		this.shadowId = shadowId;
		this.personId = personId;
		this.fullName = fullName;
		this.gender = gender;
		this.ccNumber = ccNumber;
		this.testType = testType;
		this.slNumber = slNumber;
		this.tissueType = tissueType;
		this.sampleSubtype = sampleSubtype;
		this.submittedDiagnosis = submittedDiagnosis;
		this.captureTestName = captureTestName;
		this.captureDesign = captureDesign;
		this.captureTestDescription = captureTestDescription;
	}
	

	public String getMrn() {
		return mrn;
	}
	public void setMrn(String mrn) {
		this.mrn = mrn;
	}
	
	public String getShadowId() {
		return shadowId;
	}
	public void setShadowId(String shadowId) {
		this.shadowId = shadowId;
	}
	public String getPersonId() {
		return personId;
	}
	public void setPersonId(String personId) {
		this.personId = personId;
	}

	public String getFullName() {
		return fullName;
	}


	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getGender() {
		return gender;
	}


	public void setGender(String gender) {
		this.gender = gender;
	}


	public String getCcNumber() {
		return ccNumber;
	}

	public void setCcNumber(String ccNumber) {
		this.ccNumber = ccNumber;
	}
	
	public String getSlNumber() {
		return slNumber;
	}
	public void setSlNumber(String slNumber) {
		this.slNumber = slNumber;
	}

	public String getTestType() {
		return testType;
	}

	public void setTestType(String aliasType) {
		this.testType = aliasType;
	}
	public String getTissueType() {
		return tissueType;
	}
	public void setTissueType(String tissueType) {
		this.tissueType = tissueType;
	}
	public String getSampleSubtype() {
		return sampleSubtype;
	}
	public void setSampleSubtype(String sampleSubtype) {
		this.sampleSubtype = sampleSubtype;
	}

	public String getSubmittedDiagnosis() {
		return submittedDiagnosis;
	}
	public void setSubmittedDiagnosis(String submittedDiagnosis) {
		this.submittedDiagnosis = submittedDiagnosis;
	}

	public String getCaptureDesign(){  return captureDesign; }
	public void setCaptureDesign(String cd) { this.captureDesign = cd; }

	public String getCaptureTestName() { return captureTestName; }
	public void setCaptureTestName(String captureTestName) { this.captureTestName = captureTestName; }

	public String getCaptureTestDescription() { return captureTestDescription; }
	public void setCaptureTestDescription(String captureTestDescription) { this.captureTestDescription = captureTestDescription; }



	public String setEmptyToNull(String val){
		if(val.equals("")){
			return "null";
		}
		return val;
	}
    //please remember order matters
	public String toString(String personType){
		StringBuilder strBuild = new StringBuilder();
		//order matters
		if(PersonEntry.AVATAR.equals(personType)){
			strBuild.append(setEmptyToNull(this.mrn) +"\t");
			strBuild.append(setEmptyToNull(this.personId) +"\t");
			strBuild.append(setEmptyToNull(this.fullName) +"\t");
			strBuild.append(setEmptyToNull(this.gender) +"\t");
			strBuild.append(setEmptyToNull(this.ccNumber) +"\t");
			strBuild.append(setEmptyToNull(this.shadowId) +"\t");
			strBuild.append(setEmptyToNull(this.testType) +"\t");
			strBuild.append(setEmptyToNull(this.slNumber) +"\t");
			strBuild.append(setEmptyToNull(this.tissueType) +"\t");
			strBuild.append(setEmptyToNull(this.sampleSubtype) +"\t");
			strBuild.append(setEmptyToNull(this.submittedDiagnosis) +"\t");
			strBuild.append(setEmptyToNull(this.captureTestName) +"\t");
			strBuild.append(setEmptyToNull(this.captureDesign) +"\t");
			strBuild.append(setEmptyToNull(this.captureTestDescription)+"\n");
		}
		else if (PersonEntry.FOUNDATION.equals(personType)
		|| PersonEntry.TEMPUS.equals(personType)){
			strBuild.append(setEmptyToNull(this.mrn) +"\t");
			strBuild.append(setEmptyToNull(this.personId) +"\t");
			strBuild.append(setEmptyToNull(this.fullName) +"\t");
			strBuild.append(setEmptyToNull(this.gender) +"\t");
			strBuild.append(setEmptyToNull(this.shadowId) +"\t");
			strBuild.append(setEmptyToNull(this.testType) +"\t");
			strBuild.append(setEmptyToNull(this.slNumber) +"\t");
			strBuild.append(setEmptyToNull(this.sampleSubtype) +"\t");
			strBuild.append(setEmptyToNull(this.tissueType) +"\t");
			strBuild.append(setEmptyToNull(this.submittedDiagnosis) +"\t");
			strBuild.append(setEmptyToNull(this.captureTestName) +"\t");
			strBuild.append(setEmptyToNull(this.captureDesign) +"\t");
			strBuild.append(setEmptyToNull(this.captureTestDescription)+"\n");
		}

		return strBuild.toString();

	}



}
