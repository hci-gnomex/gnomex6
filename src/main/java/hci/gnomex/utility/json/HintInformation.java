package  hci.gnomex.utility.json;

/**
 * The hint information we need to convert from JSON to XML with no
 * information lost.
 */
public class HintInformation {

    private String command = "";
    private String parameter = "";
    private String [][] elementHints = new String[2560][2];
    private int nxtHint = -1;
    private String nodeHeader = "";
    private String nodePrefix = "";

    public HintInformation() {
        this.command = "";
    	this.parameter = "";
    	this.elementHints = new String[256][2];
    	this.nxtHint = -1;
    }

	public String toString() {
		String outstr = "Hint Information:\n";
		outstr += "command: " + command + "\n";
		outstr += "parameter: " + parameter + "\n";
		outstr += "nodeHeader: " + nodeHeader + "\n";
		outstr += "nodePrefix: " + nodePrefix + "\n";
		outstr += "Element Hints:\n";

		for (int ii = 0; ii < 2560; ii++) {
			if (elementHints[ii][0] == null)
			{
				break;
			}
			outstr += "Element Name: " + elementHints[ii][0] + "\n";
			outstr += "Element Header: " + elementHints[ii][1] + "\n";
		}

		return outstr;
	}

    public void setCommand(String theCommand) {
        this.command = theCommand;
    }

    public void setParameter(String theParameter) {
        this.parameter = theParameter;
    }

    public String getCommand() {
        return (this.command);
    }

    public String getParameter() {
        return (this.parameter);
    }

    public void setNodeHeader (String theNodeHeader) {
        this.nodeHeader = theNodeHeader;
    }

    public String getNodeHeader () {
        return (this.nodeHeader);
    }

    public void setNodePrefix (String theNodePrefix) {
        this.nodePrefix = theNodePrefix;
    }

    public String getNodePrefix () {
        return (this.nodePrefix);
    }

    public void setElementName (String theElementName) {
        this.elementHints[nxtHint][0] = theElementName;
    }

    public void setElementHeader (String theElementHeader) {
        this.elementHints[nxtHint][1] = theElementHeader;
    }

    public int sizeElementHints () {
        return (this.nxtHint+1);
    }

    public String[][] getElementHints () {
        return (this.elementHints);
    }

	public void incrementNxtHint () {
		nxtHint++;
	}

    public void setNxtHint (int newNxtHint) {
        this.nxtHint = newNxtHint;
    }

	public String mapElementName (String theElementName) {
		for (int ii=0; ii <= this.nxtHint; ii++) {
			if (theElementName.equals(elementHints[ii][0])) {
				return (elementHints[ii][1]);
			}
		}
		return "";
	}
}
