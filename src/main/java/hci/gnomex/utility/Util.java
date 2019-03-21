package hci.gnomex.utility;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hci.framework.control.Command;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.Lab;
import net.sf.json.JSON;
import net.sf.json.xml.XMLSerializer;
import org.hibernate.Session;
import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.*;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.Reader;
import java.io.InputStreamReader;
import java.util.zip.GZIPInputStream;
import java.io.*;

import static java.lang.Integer.parseInt;

public class Util {

    private static Map<String, String> iconLookupMap = new HashMap<>();
    static {
        iconLookupMap.put("Analysis", "assets/map.png");
        iconLookupMap.put("AnalysisGroup", "assets/folder.png");
        iconLookupMap.put("AnalysisGroupList", "assets/folder.png");
        iconLookupMap.put("AnalysisNode", "assets/map.png");
        iconLookupMap.put("BillingItem", "assets/money.png");
        iconLookupMap.put("BillingLab", "assets/group.png");
        iconLookupMap.put("Hybridization", "assets/bullet_red.png");
        iconLookupMap.put("Item", "assets/bullet_green.png");
        iconLookupMap.put("Lab", "assets/group.png");
        iconLookupMap.put("PriceCategory", "assets/folder_money.png");
        iconLookupMap.put("PriceCriteria", "assets/attach.png");
        iconLookupMap.put("PriceSheet", "assets/pricesheet.png");
        iconLookupMap.put("Product", "assets/bullet_green.png");
        iconLookupMap.put("ProductOrder", "assets/basket.png");
        iconLookupMap.put("Project", "assets/folder.png");
        iconLookupMap.put("ProjectRequestList", "assets/folder.png");
        iconLookupMap.put("Protocol", "assets/brick.png");
        iconLookupMap.put("Protocols", "assets/folder.png");
        iconLookupMap.put("ProtocolList", "assets/folder.png");
        iconLookupMap.put("Request", "assets/flask.png");
        iconLookupMap.put("RequestCategory", "assets/basket.png");
        iconLookupMap.put("RequestNode", "assets/flask.png");
        iconLookupMap.put("SequenceLane", "assets/bullet_green.png");
        iconLookupMap.put("Status", "assets/folder.png");
    }

    // Parses a comma delimited string where commas are ignored if between quotes.
    public static String[] parseCommaDelimited(String s) {
        if (s == null) {
            return new String[0];
        } else {
            String otherThanQuote = " [^\"] ";
            String quotedString = String.format(" \" %s* \" ", otherThanQuote);
            String regex = String.format("(?x) " + // enable comments, ignore white spaces
                            ",                         " + // match a comma
                            "(?=                       " + // start positive look ahead
                            "  (                       " + // start group 1
                            "    %s*                   " + // match 'otherThanQuote' zero or more times
                            "    %s                    " + // match 'quotedString'
                            "  )*                      " + // end group 1 and repeat it zero or more times
                            "  %s*                     " + // match 'otherThanQuote'
                            "  $                       " + // match the end of the string
                            ")                         ", // stop positive look ahead
                    otherThanQuote, quotedString, otherThanQuote);

            String[] tokens = s.split(regex);

            return tokens;
        }
    }

    public static int compareRequestNumbers(String reqNumber1, String reqNumber2) {
        int comp = 0;

        String firstChar1 = getReqFirstChar(reqNumber1);
        String firstChar2 = getReqFirstChar(reqNumber2);

        Integer num1 = getReqNumber(reqNumber1);
        Integer num2 = getReqNumber(reqNumber2);

        if (firstChar1.equals(firstChar2)) {
            comp = num1.compareTo(num2);
        } else {
            comp = firstChar1.compareTo(firstChar2);
        }

        return comp;
    }

    private static String getReqFirstChar(String reqNumber) {
        String c = "0";
        if ("0123456789".indexOf(reqNumber.substring(0, 1)) < 0) {
            c = reqNumber.substring(0, 1);
        }

        return c;
    }

    private static Integer getReqNumber(String reqNumber) {
        String intStr = reqNumber;
        if ("0123456789".indexOf(intStr.substring(0, 1)) < 0) {
            intStr = intStr.substring(1);
        }
        if (intStr.indexOf("R") >= 0) {
            intStr = intStr.substring(0, intStr.indexOf("R"));
        }

        Integer num = Integer.parseInt(intStr);

        return num;
    }

    /*
     * return the key set of the Map as an array of Strings.
     */
    public static String[] keysToArray(Map<String, ?> map) {
        String[] keys = new String[map.size()];

        int index = 0;
        for (String key : map.keySet()) {
            keys[index] = key;
            index++;
        }
        return keys;
    }

    public static String addURLParameter(String url, String parameter) {
        if (parameter.startsWith("&") || parameter.startsWith("?")) {
            parameter = parameter.substring(1);
        }
        if (url.contains("?")) {
            url += "&";
        } else {
            url += "?";
        }
        url += parameter;
        return url;
    }

    /**
     * Converts a list of objects to a comma-delimited string
     *
     * @param list the list of objects to be converted
     * @return a String listing the provided objects
     */
    public static String listToString(List list) {
        return listToString(list, null, null, null, 0);
    }

    /**
     * Converts a list of objects to a comma-delimited string
     *
     * @param list     the list of objects to be converted
     * @param maxItems the maximum number of items to display (additional items are ignored)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, int maxItems) {
        return listToString(list, null, null, null, maxItems);
    }

    /**
     * Converts a list of objects to a delimited string
     *
     * @param list      the list of objects to be converted
     * @param delimiter the String to use as a delimiter instead of the default comma
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String delimiter) {
        return listToString(list, delimiter, null, null, 0);
    }

    /**
     * Converts a list of objects to a delimited string
     *
     * @param list      the list of objects to be converted
     * @param delimiter the String to use as a delimiter instead of the default comma
     * @param maxItems  the maximum number of items to display (additional items are ignored)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String delimiter, int maxItems) {
        return listToString(list, delimiter, null, null, maxItems);
    }

    /**
     * Converts a list of objects to a comma-delimited string
     *
     * @param list    the list of objects to be converted
     * @param prefix  the String to insert before each item (i.e. an opening quote or brace)
     * @param postfix the String to insert after each item (i.e. a closing quote or brace)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String prefix, String postfix) {
        return listToString(list, null, prefix, postfix, 0);
    }

    /**
     * Converts a list of objects to a comma-delimited string
     *
     * @param list     the list of objects to be converted
     * @param prefix   the String to insert before each item (i.e. an opening quote or brace)
     * @param postfix  the String to insert after each item (i.e. a closing quote or brace)
     * @param maxItems the maximum number of items to display (additional items are ignored)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String prefix, String postfix, int maxItems) {
        return listToString(list, null, prefix, postfix, maxItems);
    }

    /**
     * Converts a list of objects to a delimited string
     *
     * @param list      the list of objects to be converted
     * @param delimiter the String to use as a delimiter instead of the default comma
     * @param prefix    the String to insert before each item (i.e. an opening quote or brace)
     * @param postfix   the String to insert after each item (i.e. a closing quote or brace)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String delimiter, String prefix, String postfix) {
        return listToString(list, delimiter, prefix, postfix, 0);
    }

    /**
     * Converts a list of objects to a delimited string
     *
     * @param list      the list of objects to be converted
     * @param delimiter the String to use as a delimiter instead of the default comma
     * @param prefix    the String to insert before each item (i.e. an opening quote or brace)
     * @param postfix   the String to insert after each item (i.e. a closing quote or brace)
     * @param maxItems  the maximum number of items to display (additional items are ignored)
     * @return a String listing the provided objects
     */
    public static String listToString(List list, String delimiter, String prefix, String postfix, int maxItems) {
        if (delimiter == null) {
            delimiter = ",";
        }
        if (prefix == null) {
            prefix = "";
        }
        if (postfix == null) {
            postfix = "";
        }
        int numItems = list.size();
        if (maxItems > 0 && maxItems < list.size()) {
            numItems = maxItems;
        }
        String output = "";
        for (int i = 0; i < numItems; i++) {
            if (!output.isEmpty()) {
                output += delimiter;
            }
            output += prefix + list.get(i) + postfix;
        }
        return output;
    }

    public static void showTime(long start, String info) {
        long endTime = System.currentTimeMillis();
        long numMillis = endTime - start;

        double numsec = numMillis / 1000.0;

        Date d = new Date(System.currentTimeMillis());

        System.out.println(d.toString() + info + numsec + " seconds elapsed time. Start: " + start + " End: " + endTime);

    }

    public static String encodeName(String nameIn) {
        String nameOut = nameIn;
        if (nameOut == null) {
            return nameOut;
        }

        while (nameOut.indexOf('+') >= 0) {
            nameOut = nameOut.replace("+", "%2B");
        }

        return nameOut;

    }


    //get request headers
    public static StringBuffer getRequestHeader(HttpServletRequest request) {
        StringBuffer headerInfo = new StringBuffer();

        Enumeration headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String key = (String) headerNames.nextElement();
            String value = request.getHeader(key);
            headerInfo.append(key + ": ");
            headerInfo.append(value + "\n");
        }

        return headerInfo;
    }

    // output request header / parameters and postrequestbody
    public static StringBuilder printRequest(HttpServletRequest httpRequest) {
        int MAXSIZE = 250000;
        String theRequest = "";
        StringBuilder request = new StringBuilder(65536);
        String headers = "\n\n *** Headers ***\n";
        request.append(headers);
        System.out.print(headers);
        String warning = "";

        Enumeration headerNames = httpRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            warning = "";
            String headerName = (String) headerNames.nextElement();
            String theHeader = httpRequest.getHeader(headerName);
            System.out.println(headerName + " = " + theHeader);
            if (theHeader.length() > MAXSIZE) {
                warning = "\nWARNING: header truncated to " + MAXSIZE + " characters\n";
                theHeader = theHeader.substring(0, MAXSIZE);
            }
            request.append(warning + headerName + " = " + theHeader + "\n");
        }

        String parameters = "\n\n *** Parameters ***\n";
        System.out.print(parameters);
        request.append(parameters);

        Enumeration params = httpRequest.getParameterNames();
        while (params.hasMoreElements()) {
            warning = "";
            String paramName = (String) params.nextElement();
            String theParameter = httpRequest.getParameter(paramName);
            System.out.println(paramName + " = " + theParameter);
            if (theParameter.length() > MAXSIZE) {
                warning = "\nWARNING: parameter truncated to " + MAXSIZE + " characters\n";
                theParameter = theParameter.substring(0, MAXSIZE);
            }
            request.append(warning + paramName + " = " + theParameter + "\n");
        }

        return request;
    }

    public static String extractPostRequestBody(HttpServletRequest request) {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            Scanner s = null;
            try {
                s = new Scanner(request.getInputStream(), "UTF-8").useDelimiter("\\A");
            } catch (IOException e) {
                e.printStackTrace();
            }
            return s.hasNext() ? s.next() : "";
        }
        return "";
    }

    public static String GNLOG(org.apache.log4j.Logger LOG, String whathappend, Exception e) {
        String theInfo = null;

        theInfo = whathappend + "\n\n";

        StringWriter errors = new StringWriter();
        e.printStackTrace(new PrintWriter(errors));
        theInfo = theInfo + errors.toString() + "\n";

        LOG.error(whathappend, e);

        return theInfo;
    }

    public static boolean isParameterTrue(String requestParameter) {
        return requestParameter.equalsIgnoreCase("Y") || requestParameter.equalsIgnoreCase("true");
    }

    public static boolean isParameterFalse(String requestParameter) {
        return requestParameter.equalsIgnoreCase("N") || requestParameter.equalsIgnoreCase("false");
    }

    public static boolean isParameterNonEmpty(String requestParameter) {
        return requestParameter != null && !requestParameter.trim().equals("");
    }

    public static Integer retrieveRequestIntegerParameter(HttpServletRequest request, String parameterName, Command command) {
        String parameter = request.getParameter(parameterName);
        Integer result = null;
        if (isParameterNonEmpty(parameter)) {
            try {
                result = parseInt(parameter);
            } catch (NumberFormatException e) {
                command.addInvalidField(parameterName, parameterName + " must be an integer");
            }
        }
        return result;
    }

    public static Boolean retrieveRequestBooleanParameter(HttpServletRequest request, String parameterName, Command command) {
        return retrieveRequestBooleanParameter(request, parameterName, command, null);
    }

    public static Boolean retrieveRequestBooleanParameter(HttpServletRequest request, String parameterName, Command command, Boolean defaultValue) {
        String parameter = request.getParameter(parameterName);
        Boolean result = defaultValue;
        if (isParameterNonEmpty(parameter)) {
            if (isParameterTrue(parameter)) {
                result = true;
            } else if (isParameterFalse(parameter)) {
                result = false;
            } else {
                command.addInvalidField(parameterName, parameterName + " must be a boolean");
            }
        }
        return result;
    }

    public static String retrieveRequestStringParameter(HttpServletRequest request, String parameterName) {
        String parameter = request.getParameter(parameterName);
        String result = null;
        if (isParameterNonEmpty(parameter)) {
            result = parameter;
        }
        return result;
    }

    public static void sendErrorReport(org.hibernate.Session sess, String softwareTestEmail, String fromAddress, String userName, String errorMessage, StringBuilder requestDump) {
        try {
            String errorMessageString = "User: " + userName + "\n";
            if (errorMessage != null) {
                errorMessageString = errorMessageString + errorMessage + "\n" + requestDump.toString() + "\n";
            } else {
                errorMessageString = errorMessageString + "No traceback available" + "\n" + requestDump.toString() + "\n";
            }

            // if it wasn't really a trace back then just leave
            if (errorMessageString.equals("")) {
                return;
            }

            String toaddress = softwareTestEmail;
            java.net.InetAddress localMachine = java.net.InetAddress.getLocalHost();
            String serverName = localMachine.getHostName();

            // If the error occurred on a developer workstation, get their email address and use it instead
            String localhostEmail = getLocalhostEmail(sess, serverName);
            if (localhostEmail != null) {
                toaddress = localhostEmail;
            }

            MailUtilHelper helper = new MailUtilHelper(toaddress, null, null, fromAddress,
                    "GNomEx Runtime Error [Server: " + localMachine.getHostName() + "]", errorMessageString, null,
                    false, DictionaryHelper.getInstance(sess), serverName, false, toaddress);
            MailUtil.validateAndSendEmail(helper);

        } catch (Exception e) {
            System.err.println("GNomExFrontController unable to email error report.   " + e.toString());
        }
    }

    private static String getLocalhostEmail(Session sess, String serverName) {
        if (serverName != null && !serverName.equals("")) {

            // This property looks like 'COMPUTER1 email1@server.com,COMPUTER2 email2@server.com'
            String machinelist = PropertyDictionaryHelper.getInstance(sess).getProperty(
                    PropertyDictionaryHelper.PROPERTY_RUNTIME_ERROR_SERVER_LIST);

            if (machinelist != null) {
                for (String machineEntry : machinelist.toLowerCase().split(",")) {
                    String[] items = machineEntry.trim().split(" ", 2);
                    String machine = items[0];
                    if (items.length == 2 && machine.equals(serverName.toLowerCase())) {
                        String email = items[1];
                        return email;
                    }
                }
            }

        }
        return null;
    }

    /* getVCFHeader -- get the line with the sample id's from a vcf.gz file
     */
    public static String getVCFHeader(String filename) {
        String encoding = "US-ASCII";

        try {
            InputStream fileStream = new FileInputStream(filename);
            InputStream gzipStream = new GZIPInputStream(fileStream);
            Reader decoder = new InputStreamReader(gzipStream, encoding);
            BufferedReader br = new BufferedReader(decoder);

            String line = null;

            while ((line = br.readLine()) != null) {
//                System.out.println(line);

                if (line.substring(0, 6).equals("#CHROM")) {
                    // we are done
                    br.close();
                    return line;
                }
            }

        } catch (Exception e) {
            System.out.println("[Util.getVCFHeader] Exception: " + e);
            return "";
        }

        return "";
    }


    public static String getGRCName(String genomeBuildName) {
        String theName = null;

        if (genomeBuildName == null || genomeBuildName.equals("")) {
            return theName;
        }

        String[] name = genomeBuildName.split(";");

        for (int ii = 0; ii < name.length; ii++) {
            String thename = name[ii].trim();
            if (thename.startsWith("GRC")) {
                theName = thename;
                break;
            }
        }

        return theName;
    }

    public static void createTransferLogFile (String taskFileDir, String uuidStr, StringBuilder filesToTransfer, String transferLogPath ) {
        String taskFileName = taskFileDir + "/" + "fdtDownloadTransferLog" + "_" + uuidStr;
        File taskFile;
        int numTries = 10;
        while(true) {
            taskFile = new File(taskFileName);
            if(!taskFile.exists()) {
                boolean success;
                try {
                    success = taskFile.createNewFile();
                    if (!success) {
                        System.out.println("[createTransferLogFile] Error: unable to create fdtDownloadTransferLog file. " + taskFileName);
                        return;
                    }
                    break;
                } catch (IOException e) {
                    System.out.println("[createTransferLogFile] Error: unable to create fdtDownloadTransferLog file. " + taskFileName);
                    return;
                }
            }
            // If the file already exists then try again but don't try forever
            numTries--;
            if(numTries == 0) {
                System.out.println("[createTransferLogFile] Error: Unable to create fdtDownloadTransferLog file: " + taskFileName);
                return;
            }
        }


        try {
            BufferedWriter pw = new BufferedWriter(new FileWriter(taskFile));
            pw.write(filesToTransfer.toString());
            pw.flush();
            pw.close();
        } catch (IOException e) {
            System.out.println("[createTransferLogFile] IOException: file " + taskFileName + " " + e.getMessage());
            return;
        }
    }

    public static String getCurrentDateString() {
        Calendar runDate = Calendar.getInstance();
        return new SimpleDateFormat("MM-dd-yyyy_HH:mm:ss").format(runDate.getTime());

    }


    public static String getAnalysisDirectory(String baseDir, Analysis analysis) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy");
        String createYear = formatter.format(analysis.getCreateDate());

        if (!baseDir.endsWith(Constants.FILE_SEPARATOR) && !baseDir.endsWith("\\")) {
            baseDir += Constants.FILE_SEPARATOR;
        }

        String directoryName = baseDir + createYear + Constants.FILE_SEPARATOR + analysis.getNumber();
        return directoryName;
    }
    /*
     * Converts xml to json the same way that GNomExFrontController does
     */
    public static String xmlToJson (String thexml) {
        String thejson = "";

        if (thexml == null || thexml.equals("")) {
            return thexml;
        }

            if (thexml.length() < 80) {
                System.out.println("WARNING short xml: -->" + thexml + "<--");
            }
            XMLSerializer xmlSerializer = new XMLSerializer();

            boolean hasType = false;
            if (thexml.indexOf("type=") >= 0) {
                hasType = true;
                thexml = thexml.replace(" type="," notype=");
            }
            JSON json = xmlSerializer.read(thexml);
            thejson = json.toString(2);

            // get rid of the "@
            thejson = thejson.replace("\"@", "\"");

            // if we dealt with the "type" being a JSON keyword then changes things back
            if (hasType) {
                hasType = false;
                thejson = thejson.replace("\"notype\":","\"type\":");
            }

        return thejson;
    }
    public static JsonObject addToJsonObject(JsonObject obj, String key, JsonValue val) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        for (Map.Entry<String, JsonValue> e : obj.entrySet()) {
            builder.add(e.getKey(), e.getValue());
        }
        builder.add(key, val);
        return builder.build();
    }

    private static void setElementIconRecursively(Element node) {
        if (node.getAttributeValue("icon") == null) {
            String icon = "";
            if (iconLookupMap.containsKey(node.getName())) {
                icon = iconLookupMap.get(node.getName());
            } else {
                if (node.getName().equals("FileDescriptor")) {
                    if (node.getAttributeValue("type") != null && node.getAttributeValue("type").equals("dir")) {
                        if (node.getAttributeValue("isEmpty") != null && node.getAttributeValue("isEmpty").equals("Y")) {
                            icon = "assets/folder_disable.png";
                        } else {
                            icon = "assets/folder.png";
                        }
                    } else if (node.getAttributeValue("isSupportedDataTrack") != null && node.getAttributeValue("isSupportedDataTrack").equals("Y")) {
                        icon = "assets/datatrack.png";
                    }
                } else if (node.getName().equals("RequestDownload")) {
                    if (node.getAttributeValue("isEmpty") != null && node.getAttributeValue("isEmpty").equals("Y")) {
                        icon = "assets/folder_disable.png";
                    } else {
                        icon = "assets/folder.png";
                    }
                } else if (node.getName().equals("AnalysisDownload")) {
                    if (node.getAttributeValue("type") != null && node.getAttributeValue("type").equals("dir")) {
                        if (node.getAttributeValue("isEmpty") != null && node.getAttributeValue("isEmpty").equals("Y")) {
                            icon = "assets/folder_disable.png";
                        } else {
                            icon = "assets/folder.png";
                        }
                    }
                } else if(node.getName().equals("SampleGroup")){
                        if(node.getChildren().size() > 0){
                            icon = "assets/blue_folder.png";
                        }else {
                            icon = "assets/folder_disable.png";
                        }
                } else if(node.getName().equals("SeqRunNumber")){
                    if(node.getChildren().size() > 0){
                        icon = "assets/folder.png";
                    }else {
                        icon = "assets/folder_disable.png";
                    }
                }
            }

            if (!icon.equals("")) {
                node.setAttribute("icon", icon);
            }
        }

        for (final Element contentElement : (List<Element>) node.getChildren()) {
            setElementIconRecursively(contentElement);
        }
    }

    public static void setIcons(Document doc) {
        setElementIconRecursively(doc.getRootElement());
    }

    private static void setFileDescriptorDisplayRecursively(Element node) {
        if (node.getName().equals("FileDescriptor")) {
            String color = "black";
            if (isParameterNonEmpty(node.getAttributeValue("viewURL"))) {
                color = "blue";
                if (node.getAttributeValue("PROTECTED") != null && node.getAttributeValue("PROTECTED").equals("Y")) {
                    color = "purple";
                }
            } else {
                if (node.getAttributeValue("PROTECTED") != null && node.getAttributeValue("PROTECTED").equals("Y")) {
                    color = "red";
                }
            }
            node.setAttribute("displayColor", color);
        }

        for (final Element contentElement : (List<Element>) node.getChildren()) {
            setFileDescriptorDisplayRecursively(contentElement);
        }
    }

    public static void setFileDescriptorDisplay(Document doc) {
        setFileDescriptorDisplayRecursively(doc.getRootElement());
    }

    public static String convertXMLDocumentToJSONString(Document doc) throws JsonProcessingException {
        final ObjectMapper mapper = new ObjectMapper();
        ObjectNode docNode = mapper.createObjectNode();
        final Element root = doc.getRootElement();
        for (final Element rootContent : (List<Element>) root.getChildren()) {
            ObjectNode rootNode = docNode.putObject(rootContent.getName());
            convertXMLElementToObjectNode(mapper, rootContent, rootNode);
        }
        return mapper.writeValueAsString(docNode);
    }

    private static ObjectNode convertXMLElementToObjectNode(final ObjectMapper mapper, final Element element, ObjectNode node) {
        ObjectNode convertedNode = node;
        if (convertedNode == null) {
            convertedNode = mapper.createObjectNode();
        }

        for (final Attribute attribute : (List<Attribute>) element.getAttributes()) {
            convertedNode.put(attribute.getName(), attribute.getValue());
        }

        Map<String, List<ObjectNode>> contentMap = new HashMap<>();
        for (final Element contentElement : (List<Element>) element.getChildren()) {
            ObjectNode contentNode = convertXMLElementToObjectNode(mapper, contentElement, null);
            if (!contentMap.containsKey(contentElement.getName())) {
                contentMap.put(contentElement.getName(), new ArrayList<>());
            }
            contentMap.get(contentElement.getName()).add(contentNode);
        }

        for (Map.Entry<String, List<ObjectNode>> entry : contentMap.entrySet()) {
            ArrayNode array = convertedNode.putArray(entry.getKey());
            for (ObjectNode contentNode : entry.getValue()) {
                array.add(contentNode);
            }
        }

        return convertedNode;
    }

    public static JsonArray readJSONArray(HttpServletWrappedRequest request, String parameterName) {
        String JSONString = request.getParameter(parameterName);
        if (isParameterNonEmpty(JSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(JSONString))) {
                return jsonReader.readArray();
            }
        } else {
            return Json.createArrayBuilder().build();
        }
    }
    public static JsonObject readJSONObject(HttpServletWrappedRequest request, String parameterName) {
        String JSONString = request.getParameter(parameterName);
        if (isParameterNonEmpty(JSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(JSONString))) {
                return jsonReader.readObject();
            }
        } else {
            return null;
        }
    }

    public static String getJsonStringSafe(JsonObject object, String valueName) {
        return object.get(valueName) != null ? object.getString(valueName) : null;
    }

    public static String getJsonStringSafeNonNull(JsonObject object, String valueName) {
        String value = getJsonStringSafe(object, valueName);
        return value != null ? value : "";
    }


    public static void preserveXMLNodeName(Element experimentItem) {
        String name = experimentItem.getName();
        experimentItem.setAttribute("xmlNodeName", name);
        List<Element> children = experimentItem.getChildren();

        for(int i = 0; i < children.size(); i++){
            Element childNode = (Element) children.get(i);
            preserveXMLNodeName(childNode);
        }
    }

    public static String getAppUserDisplayName(AppUser userToPrint, UserPreferences userPreferences) {
        return userPreferences.getFormatNamesFirstLast() ? userToPrint.getFirstLastDisplayName() : userToPrint.getDisplayName();
    }

    public static String formatUserDisplayName(String firstName, String lastName, UserPreferences userPreferences) {
        StringBuilder builder = new StringBuilder();
        if (userPreferences.getFormatNamesFirstLast()) {
            if (firstName != null && firstName.length() > 0) {
                builder.append(firstName);
                if (lastName != null && lastName.length() > 0) {
                    builder.append(" ");
                }
            }
            if (lastName != null && lastName.length() > 0) {
                builder.append(lastName);
            }
        } else {
            if (lastName != null && lastName.length() > 0) {
                builder.append(lastName);
                if (firstName != null && firstName.length() > 0) {
                    builder.append(", ");
                }
            }
            if (firstName != null && firstName.length() > 0) {
                builder.append(firstName);
            }
        }
        return builder.toString();
    }

    public static String getLabDisplayName(Lab labToPrint, UserPreferences userPreferences) {
        return userPreferences.getFormatNamesFirstLast() ? labToPrint.getNameFirstLast() : labToPrint.getName();
    }

    public static String formatLabDisplayName(String firstName, String lastName, UserPreferences userPreferences) {
        StringBuilder builder = new StringBuilder();
        if (userPreferences.getFormatNamesFirstLast()) {
            if (firstName != null && firstName.length() > 0) {
                builder.append(firstName);
                if (lastName != null && lastName.length() > 0) {
                    builder.append(" ");
                }
            }
            if (lastName != null && lastName.length() > 0) {
                builder.append(lastName);
            }
        } else {
            if (lastName != null && lastName.length() > 0) {
                builder.append(lastName);
                if (firstName != null && firstName.length() > 0) {
                    builder.append(", ");
                }
            }
            if (firstName != null && firstName.length() > 0) {
                builder.append(firstName);
            }
        }
        if (builder.length() > 0) {
            builder.append(" ");
        }
        builder.append("Lab");
        return builder.toString();
    }

}


