package hci.gnomex.utility;

import hci.gnomex.utility.json.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;


public class JSONtoXML {
    public static boolean debugHint = false;
    public static boolean debugConvert = false;
    public static boolean debugTesting = false;

    public HashMap initHints(String fileName) throws Exception {
        HashMap xmlHintMap = new HashMap();

        DataCharBuffer dataBuffer = new DataCharBuffer();

        BufferedReader br = new BufferedReader(new FileReader(fileName));

        String theJson = "";
        String line = null;
        StringBuilder sb = new StringBuilder(1024000);

        String[] nameStack = new String[350];

        int numlines = 0;

        while ((line = br.readLine()) != null) {
            sb.append(line + "\n");
            numlines++;
        }

        dataBuffer.data = sb.toString().toCharArray();
        dataBuffer.length = dataBuffer.data.length;

        IndexBuffer tokenBuffer = new IndexBuffer(dataBuffer.data.length, true);
        IndexBuffer elementBuffer = new IndexBuffer(dataBuffer.data.length, true);

        JsonParser parser = new JsonParser(tokenBuffer, elementBuffer);

        parser.parse(dataBuffer);

        JsonNavigator jsonNavigator = new JsonNavigator(dataBuffer, elementBuffer);

        int stackptr = -1;

        String prevPropertyName = "";
        HintInformation hintInformation = null;

        while (true) {
            byte theType = jsonNavigator.type();
            int thePosition = jsonNavigator.position();
            int theLength = jsonNavigator.length();
            String text = jsonNavigator.asStringDecoded();
            String propertyName = "";
            boolean prevArrayStart = false;

            if (debugHint) {
                String theTypeAsString = jsonNavigator.typeAsString();
                String theTypeAsStringFixed = theTypeAsString;

                int nleft = 30 - theTypeAsString.length();
                for (int ii = 0; ii < nleft; ii++) {
                    theTypeAsStringFixed += " ";
                }

                if (debugHint)
                    System.out.println("\t--->" + theTypeAsStringFixed + " at " + thePosition + " length: " + theLength + " " + text);
            }

            if (debugHint) System.out.println("***before switch*** theType: " + theType + " -->" + ElementTypes.toString(theType));
            switch (theType) {
                case ElementTypes.JSON_OBJECT_START: {
                    if (debugHint) System.out.println("                     --->[object start] stackptr: " + stackptr);
                    prevArrayStart = false;
                    // previous token array start?
                    if (jsonNavigator.hasPrevious()) {
                        jsonNavigator.previous();
                        byte theType1 = jsonNavigator.type();
                        if (debugHint) System.out.println("                 --->[object start] theType1: " + theType1 + " -->" + ElementTypes.toString(theType1));

                        if (theType1 == ElementTypes.JSON_ARRAY_START) {
                            prevArrayStart = true;
                        }
                        jsonNavigator.next();
                    }

                    stackptr++;
                    if (debugHint)
                        System.out.println("[object start] prevArrayStart: " + prevArrayStart + " stackptr: " + stackptr);
                    if (stackptr == 0) {
                        // create the HintInformation structure
                        hintInformation = new HintInformation();
                    }
                    if (debugHint) System.out.println("[end of object start case statement]");
                    break;
                }
                case ElementTypes.JSON_PROPERTY_NAME: {
                    if (debugHint)
                        System.out.println("                --->[property name] stackptr: " + stackptr + " text: " + jsonNavigator.asStringDecoded());
                    if (stackptr == 0) {
                        prevPropertyName = "";
                    } else if (stackptr == 1) {
                        if (!jsonNavigator.hasNext()) {
                            System.out.println("Error: property name followed by EOF");
                            return xmlHintMap;
                        }
                        text = jsonNavigator.asStringDecoded();
                        propertyName = text;
                        if (debugHint)
                            System.out.println("[property name] stackptr == 1 propertyName: " + propertyName + " stackptr: " + stackptr );

                        jsonNavigator.next();
                        byte theType1 = jsonNavigator.type();
                        if (theType1 == ElementTypes.JSON_PROPERTY_VALUE_STRING) {
                            text = jsonNavigator.asStringDecoded();
                            if (debugHint) System.out.println("[property name] stackptr == 1 text: " + text + " theType1: " + theType1 + " -->" + ElementTypes.toString(theType1));

                            // remember it
                            if (propertyName.equals("command")) {
                                hintInformation.setCommand(text);
                            } else if (propertyName.equals("parameter")) {
                                hintInformation.setParameter(text);
                            } else if (propertyName.equals("nodeheader")) {
                                hintInformation.setNodeHeader(text);
                            } else if (propertyName.equals("nodeprefix")) {
                                hintInformation.setNodePrefix(text);
                            } else {
                                System.out.println("*** Unknown propertyName: " + propertyName);
                            }
                        } else {
                            jsonNavigator.previous();
                            prevPropertyName = propertyName;
                            nameStack[stackptr] = prevPropertyName;
                            if (debugHint) System.out.println("[property name] prevPropertyName: " + prevPropertyName);
                            break;
                        }
                    } else if (stackptr == 2) {
                        if (!jsonNavigator.hasNext()) {
                            System.out.println("Error: property name followed by EOF");
                            return xmlHintMap;
                        }

                        if (debugHint)
                            System.out.println("[property name] stackptr: == 2? " + stackptr + " text: " + text);
                        if (nameStack[stackptr - 1].equals("elementhints")) {
                            propertyName = text;
                            if (debugHint)
                                System.out.println("[property name] stackptr: " + stackptr + " text: " + propertyName);

                            jsonNavigator.next();
                            byte theType1 = jsonNavigator.type();
                            if (theType1 == ElementTypes.JSON_PROPERTY_VALUE_STRING) {
                                text = jsonNavigator.asStringDecoded();

                                // remember it
                                if (propertyName.equals("elementname")) {
                                    hintInformation.incrementNxtHint();
                                    hintInformation.setElementName(text);
                                    if (debugHint) System.out.println("[property name] elementname: " + text);
                                } else if (propertyName.equals("elementheader")) {
                                    hintInformation.setElementHeader(text);
                                    hintInformation.setNxtHint(-1);
                                    if (debugHint) System.out.println("[property name] elementheader: " + text);

                                }
                            } else {
                                jsonNavigator.previous();
                                break;
                            }
                        }
                    }
                    if (debugHint) System.out.println("[end of property name case statement]");
                    break;
                }
                case ElementTypes.JSON_ARRAY_START: {
                    if (debugHint) System.out.println("[array start] stackptr: " + stackptr);
                    if (debugHint) System.out.println("[end of array start case statement]");
                    break;
                }
                case ElementTypes.JSON_OBJECT_END: {
                    if (debugHint) System.out.println("[object end] stackptr: " + stackptr);

                    hintInformation.incrementNxtHint();
                    stackptr--;

                    if (debugHint) System.out.println("[object end] after decrement stackptr: " + stackptr);

                    if (stackptr == 0) {
                        // we are done save what we have
                        String hintName = hintInformation.getCommand() + "." + hintInformation.getParameter();
                        if (debugHint) System.out.println("[object end] stackptr == 0 saving hintinformation, hintName: " + hintName);
                        xmlHintMap.put(hintName, hintInformation);
                        hintInformation = new HintInformation();
                    }
                    break;
                }
                default: {
                    break;
                }
            } // end of switch
            if (debugHint) System.out.println("                    *** after switch ***");
            if (!jsonNavigator.hasNext()) {
                if (debugHint) System.out.println("jsonNavigator.hasNext failed at stackptr: " + stackptr);
                break;
            }

            jsonNavigator.next();
            if (debugHint) System.out.println("*** after jsonNavigator.next() before end of while ***");

        } // end of while
        if (debugHint) System.out.println("***** after while **** xmlHintMap.size(): " + xmlHintMap.size());

        return (xmlHintMap);

    } // end of initHint

    public String addNodeHeader(int mode, String nodeHeader, int nextElementType, JsonNavigator jsonNavigator) {
        if (debugConvert)
            System.out.println("[addNodeHeader] nodeHeader: --->" + nodeHeader + "<--- nextElementType: " + nextElementType);
        String result = "";

        if (nodeHeader == null || nodeHeader.equals("")) {
            if (debugConvert) System.out.println("[addNodeHeader] ERROR ERROR nodeHeader is undefined!");
            return result;
        }

        // only do it if next token is property value
        if (!jsonNavigator.hasNext()) {
            if (debugConvert) System.out.println("[addNodeHeader] jsonNavigator.hasNext() failed!!!!");
            return result;
        }

        jsonNavigator.next();
        int theType1 = jsonNavigator.type();
        if (debugConvert)
            System.out.println("[addNodeHeader] theType1: " + theType1 + " " + ElementTypes.JSON_PROPERTY_VALUE_STRING + " nextElementType: " + nextElementType);

        jsonNavigator.previous();

        // emit nodeHeader
        result = "<" + nodeHeader + ">\n";

        if (debugConvert) System.out.println("[addNodeHeader] result: " + result);
        return result;

    } // end of addNodeHeader

    public String addElementHint(String propertyName, HintInformation theHint, String[] theNodePrefix, String[] theEnclosingNode, JsonNavigator jsonNavigator, int [] ArrayDepth) {
        String result = "";
        ArrayDepth[0] = -1;

        if (propertyName == null || propertyName.equals("")) {
            return result;
        }

        if (theHint == null) {
            return result;
        }

        // if array start followed by array end then emit <property name />
        // 0 --> true
        // 1 --> true and saw array start
        // 2 --> false

        int nnok = nextNextElement(ElementTypes.JSON_ARRAY_START, ElementTypes.JSON_ARRAY_END, jsonNavigator);
        if (debugConvert) System.out.println ("[addElementHint] ----->nnok: " + nnok + "<-----");
        if (nnok != 2) {
            theNodePrefix[0] = propertyName;
            theEnclosingNode[0] = "";

            result = "<" + propertyName + " />\n";
            if (debugConvert) System.out.println ("[addElementHint 1st return: " + result);

            // skip past the next two tokens
            jsonNavigator.next();
            jsonNavigator.next();

            ArrayDepth[0] = -1;

            return result;
        }

        // do we match an element hint?
        String theNodeName = theHint.mapElementName(propertyName);
        if (debugConvert)
            System.out.println("[addElementHint] propertyName: " + propertyName + " mapped node name: ---->" + theNodeName + "<-------------------------");
        if (theNodeName.equals("")) {
            // no element hint just the property name right before array start
            theEnclosingNode[0] = theHint.getNodeHeader();
            theNodePrefix[0] = propertyName;

            result += "<" + propertyName + " ";
            if (debugConvert) System.out.println ("[addElementHint 2nd return: " + result);
            jsonNavigator.next();   // skip past the array start

            ArrayDepth[0] = 1;
            return result;

        }

        // we found an element hint
        theEnclosingNode[0] = propertyName;
        theNodePrefix[0] = theNodeName;

        result += "<" + theEnclosingNode[0] + ">\n";

        // 12/11/2017 tim ???
        // found element hint now put the other part out
        result += "<" + theNodePrefix[0] + " ";
        if (debugConvert) System.out.println ("[addElementHint 3rd return: " + result);

        jsonNavigator.next();   // skip past the array start

        ArrayDepth[0] = -2;
        return result;

    } // end of addElementHint

    public boolean nextElement(int elementType, JsonNavigator jsonNavigator) {
        boolean result = false;
        if (!jsonNavigator.hasNext()) {
            return result;
        }

        jsonNavigator.next();
        int theType1 = jsonNavigator.type();

        jsonNavigator.previous();

        if (theType1 != elementType) {
            return result;
        }

        return true;
    }

    public boolean previousElement(int elementType, JsonNavigator jsonNavigator) {
        boolean result = false;
        if (!jsonNavigator.hasPrevious()) {
            return result;
        }

        jsonNavigator.previous();
        int theType1 = jsonNavigator.type();

        jsonNavigator.next();

        if (theType1 != elementType) {
            return result;
        }

        return true;
    }

    // look ahead for matching two elementTypes
    public int nextNextElement(int elementType, int elementType1, JsonNavigator jsonNavigator) {

        // return values
        // 0 --> true
        // 1 --> true and saw array start
        // 2 --> false
//        boolean result = false;
        int iresult = 2;

        if (!jsonNavigator.hasNext()) {
            return iresult;
        }

        jsonNavigator.next();
        int theType1 = jsonNavigator.type();

        if (theType1 != elementType) {
            jsonNavigator.previous();
            return iresult;
        }

        if (!jsonNavigator.hasNext()) {
            jsonNavigator.previous();
            return iresult;
        }

        jsonNavigator.next();

        int theType2 = jsonNavigator.type();

        jsonNavigator.previous();
        jsonNavigator.previous();

        if (theType2 != elementType1) {
            return iresult;
        }

        if (theType1 == ElementTypes.JSON_ARRAY_START && theType2 == ElementTypes.JSON_ARRAY_END) {
            return 0;
        }

        if (theType1 == ElementTypes.JSON_ARRAY_START || theType2 == ElementTypes.JSON_ARRAY_START) {
            return 1;
        }

        return 0;
    }

    // look ahead for matching two elementTypes
    public boolean prevPrevElement(int elementType, int elementType1, JsonNavigator jsonNavigator) {
        boolean result = false;
        if (!jsonNavigator.hasPrevious()) {
            return result;
        }

        jsonNavigator.previous();
        int theType1 = jsonNavigator.type();

        if (theType1 != elementType) {
            jsonNavigator.next();
            return result;
        }

        if (!jsonNavigator.hasPrevious()) {
            jsonNavigator.next();
            return result;
        }

        jsonNavigator.previous();

        int theType2 = jsonNavigator.type();

        jsonNavigator.next();
        jsonNavigator.next();

        if (theType2 != elementType1) {
            return result;
        }

        return true;
    }

    public String convertJSONtoXML(String hintKey, String theJson, HashMap xmlHashMap) throws Exception {

        boolean debugConvert = false;
        // the end result will be here:
        String theXML = "";

        DataCharBuffer dataBuffer = new DataCharBuffer();

        String[] nameStack = new String[350];
        String[] nodeStack = new String[350];

        dataBuffer.data = theJson.toCharArray();
        dataBuffer.length = dataBuffer.data.length;

        IndexBuffer tokenBuffer = new IndexBuffer(dataBuffer.data.length, true);
        IndexBuffer elementBuffer = new IndexBuffer(dataBuffer.data.length, true);

        JsonParser parser = new JsonParser(tokenBuffer, elementBuffer);

        parser.parse(dataBuffer);

        JsonNavigator jsonNavigator = new JsonNavigator(dataBuffer, elementBuffer);
        if (debugConvert)
            System.out.println("[convertJSONtoXML] **************** Starting size ******************* " + jsonNavigator.size());

        int stackptr = -1;

        String prevPropertyName = "";

        // get the hint information
        HintInformation theHint = (HintInformation) xmlHashMap.get(hintKey);
        if (theHint == null) {
            System.out.println ("[JSONtoXML] *** WARNING WARNING WARNING *** theHint is null, hintKey: " + hintKey);
            return null;
        }
        String nodePrefix = theHint.getNodePrefix();
        String[] theNodePrefix = new String[256];
        String[] theEnclosingNode = new String[256];
        if (debugConvert) System.out.println("[convertJSONtoXML]***[convertJSONtoXML] ***  hintKey: " + hintKey);
        if (debugConvert)
            System.out.println("[convertJSONtoXML]***[convertJSONtoXML] *** theHint: " + theHint.toString() + "\nnodePrefix: " + nodePrefix);

        int theSize = jsonNavigator.size();

        int nameStackptr = 0;

        int arrayDepth = 0;
        int objectDepth = 0;

        while (true) {
            int theType = jsonNavigator.type();
            int thePosition = jsonNavigator.position();
            int theLength = jsonNavigator.length();
            String text = jsonNavigator.asStringDecoded();
            String propertyName = "";
            boolean prevArrayStart = false;

            if (debugConvert) {
                String theTypeAsString = jsonNavigator.typeAsString();
                String theTypeAsStringFixed = theTypeAsString;

                int nleft = 30 - theTypeAsString.length();
                for (int ii = 0; ii < nleft; ii++) {
                    theTypeAsStringFixed += " ";
                }

                if (debugConvert)
                    System.out.println("\t[convertJSONtoXML]--->" + theTypeAsStringFixed + " at " + thePosition + " length: " + theLength + " " + text);
            }

            if (debugConvert)
                System.out.println("[convertJSONtoXML]***[convertJSONtoXML] before switch*** theType: " + theType + " thePosition: " + thePosition + " thesize: " + theSize);

            switch (theType) {
                case ElementTypes.JSON_ARRAY_START: {

                    if (debugConvert) System.out.println("[array start]2  nameStackptr: " + nameStackptr + " arrayDepth: " + arrayDepth);

                    arrayDepth++;
                    if (!jsonNavigator.hasPrevious()) {

                        // add the top level node header <requests>
                        nameStackptr = 0;
                        nameStack[nameStackptr] = nodePrefix;

                        String nodeheader = theHint.getNodeHeader();
                        nodeStack[nameStackptr] = nodeheader;

                        if (!nodeheader.equals("")) {
                            // add the outer most nodeheader
                            if (debugConvert)
                                System.out.println("[convertJSONtoXML:object start] 2 (0) nameStackptr: " + nameStackptr + " nodePrefix: " + nodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                            theXML += addNodeHeader(0, nodeheader, ElementTypes.JSON_PROPERTY_NAME, jsonNavigator);
                            if (debugConvert)
                                System.out.println("[convertJSONtoXML JSON_ARRAY_START] theXML:\n" + theXML);

//  LOOK OUT                            nameStackptr++;
                        }
                        if (debugConvert) System.out.println("[end of array start no previous tokens case statement]");
                        break;
                    }

                    // previous token is property name
                    String thisNodePrefix = nameStack[nameStackptr];
                    if (thisNodePrefix == null ) {
                        if (theHint == null) {
                            System.out.println ("[convertJSONtoXML] 2 ERROR ERROR ERROR theHint is null!!!!");
                            return "<bad 2 Invalid JSON /bad>";
                        }
                        thisNodePrefix = theHint.getNodeHeader();
                        if (debugConvert) System.out.println ("[convertJSONtoXML] 2 new nodeprefix: " + thisNodePrefix);

                    }
                    if (debugConvert)
                        System.out.println("[convertJSONtoXML:object start] *** addding <" + thisNodePrefix + " 2 (had previous) nameStackptr: " + nameStackptr + " thisNodePrefix: " + thisNodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                    theXML += "<" + thisNodePrefix + " ";


                    if (debugConvert) System.out.println("[end of array start case statement]");
                    break;
                }
                case ElementTypes.JSON_OBJECT_START: {

                    if (!previousElement(ElementTypes.JSON_OBJECT_END, jsonNavigator)  && !prevPrevElement(ElementTypes.JSON_ARRAY_START, ElementTypes.JSON_PROPERTY_NAME, jsonNavigator)) {
                        nameStackptr++;
                        if (debugConvert) System.out.println ("[convertJSONtoXML:object start] incremented nameStackptr: " + nameStackptr);
                    }

                    if (debugConvert) System.out.println("[convertJSONtoXML:object start] nameStackptr: " + nameStackptr + " objectDepth: " + objectDepth);
                    objectDepth++;
                    if (!jsonNavigator.hasPrevious()) {

                        // we are add the very beginning
                        nameStackptr = 0;
                        nameStack[nameStackptr] = theHint.getNodePrefix();
                        String nodeheader = theHint.getNodeHeader();
                        nodeStack[nameStackptr] = nodeheader;
                        nameStackptr++;

                        // if no nodeheader just put out nodprefix
                        if (!nodeheader.equals("")) {
                            // add the outer most nodeHeader
                            // if (debugConvert)
                            if (debugConvert) System.out.println("[convertJSONtoXML:object start] (0) nameStackptr: " + nameStackptr + " nodePrefix: " + nodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                            // this really adding the nodeheader (if there is one) e.g., <requests>
                            theXML += addNodeHeader(0, nodeheader, ElementTypes.JSON_PROPERTY_NAME, jsonNavigator);
                            if (debugConvert) System.out.println("[convertJSONtoXML JSON_OBJECT_START] theXML:\n" + theXML);
                            break;
                        } // end of if we have a nodeheader
                    } // end of !hasPrevious


                    // add any inner nodePrefix if we haven't already done that
                    if (!prevPrevElement(ElementTypes.JSON_ARRAY_START, ElementTypes.JSON_PROPERTY_NAME,jsonNavigator)) {
                        String thisNodePrefix = nameStack[nameStackptr];
                        if (thisNodePrefix == null) {
                            if (theHint == null) {
                                if (debugConvert) System.out.println("[convertJSONtoXML] JSON_OBJECT_START ERROR ERROR ERROR theHint is null!!!!");
                                return "<bad Invalid JSON /bad>";
                            }
                            thisNodePrefix = theHint.getNodePrefix();
                            if (debugConvert) System.out.println("[convertJSONtoXML] JSON_OBJECT_START new nodeprefix: --->" + thisNodePrefix + "<---");
                            nameStack[nameStackptr] = thisNodePrefix;
                            nodeStack[nameStackptr] = theHint.getNodeHeader();
                        }

                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:object start NOT preceeded by array start property name] (had previous) nameStackptr: " + nameStackptr + " thisNodePrefix: " + thisNodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                        if (!thisNodePrefix.equals("")) {
                            theXML += "<" + thisNodePrefix + " ";
                            if (debugConvert)
                                System.out.println("[convertJSONtoXML JSON_OBJECT_START after processed nodeheader   *** added *** '<' nodeprefix ] theXML:\n" + theXML);
                        }
                    }


//                    } // end of else

                    if (debugConvert) System.out.println("[convertJSONtoXML:end of object start case statement]");
                    break;
                }
                case ElementTypes.JSON_PROPERTY_NAME: {
                    // are we followed by "property value ..."
                    if (debugConvert) System.out.println("[convertJSONtoXML] nameStackptr: " + nameStackptr);
                    if (nextElement(ElementTypes.JSON_PROPERTY_VALUE_STRING, jsonNavigator)) {
                        text = jsonNavigator.asStringDecoded();         // this is the property name
                        propertyName = text;
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:property name] propertyName: " + propertyName);

                        // emit propertyName + =
                        theXML += propertyName + "=";
//                       if (debugConvert) System.out.println("[convertJSONtoXML JSON_PROPERTY_NAME follwed by JSON_PROPERTY_VALUE] theXML:\n" + theXML);
                    } // end of next token was property value string...


                    else if (nextElement(ElementTypes.JSON_ARRAY_START, jsonNavigator)) {
                        // saw array start so it's compound
                        text = jsonNavigator.asStringDecoded();     // this is the property name
                        propertyName = text;
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:JSON array strart] propertyName: " + propertyName);

                        // if we are finishing a non-compound property name, end the line with ">\n"
                        if (previousElement(ElementTypes.JSON_PROPERTY_VALUE_STRING, jsonNavigator)) {
                            theXML += ">\n";
                            if (debugConvert) System.out.println("[convertJSONtoXML JSON_PROPERTY_NAME then JSON_ARRAY_START previous JSON_PROPERTY_VALUE  2  adding '>'] theXML:\n" + theXML);
                        }

                        arrayDepth++;

                        // add any enclosing node info
                        int [] ArrayDepth = new int[1];
                        String theResult = addElementHint(propertyName, theHint, theNodePrefix, theEnclosingNode, jsonNavigator,ArrayDepth);
                        if (debugConvert) System.out.println ("[convertJSONtoXML] theResult: " + theResult);

                        if (ArrayDepth[0] == -2) {
                            // push on nameStack
                            nameStackptr++;

                            // fix depth
                            ArrayDepth[0] = -1;
                        }
                        arrayDepth += ArrayDepth[0];
                        if (debugConvert) System.out.println ("[convertJSONtoXML] incremented arrayDepth based on theResult: " + arrayDepth + " nameStackptr: " + nameStackptr);


                        theXML += theResult;
                        if (debugConvert) System.out.println("[convertJSONtoXML JSON_PROPERTY_NAME then JSON_ARRAY_START] arrayDepth: " + arrayDepth + " theXML:\n" + theXML);
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML] nameStackptr: " + nameStackptr + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                        nameStack[nameStackptr] = theNodePrefix[0];
                        nodeStack[nameStackptr] = theEnclosingNode[0];
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML] AFTER nameStackptr: " + nameStackptr + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                    } // end of if array start

                    if (debugConvert)
                        System.out.println("[property name] nameStackptr: " + nameStackptr + " nameStack[]: " + nameStack[nameStackptr] + " " + nodeStack[nameStackptr]);
                    if (debugConvert) System.out.println("[end of property name case statement]");
                    break;
                }
                case ElementTypes.JSON_PROPERTY_VALUE_STRING: {
                    String propertyValue = jsonNavigator.asStringDecoded();
                    if (debugConvert)
                        System.out.println("[convertJSONtoXML:property value] nameStackptr: " + nameStackptr + " nodePrefix: " + nameStack[nameStackptr] + " propertyName: " + propertyName + " propertyValue: " + propertyValue);

                    theXML += "\"" + propertyValue + "\" ";
                    if (debugConvert) System.out.println("[property value string] nameStackptr: " + nameStackptr);
//                    if (debugConvert) System.out.println("[property value string] end of case statement theXML:\n" + theXML);
                    break;
                }
                case ElementTypes.JSON_ARRAY_END: {

                    if (debugConvert)
                        System.out.println("[convertJSONtoXML: array end] arrayDepth: " + arrayDepth + " objectDepth: " + objectDepth + " nameStackptr: " + nameStackptr);

//						// do we directly follow an array start?
//                    if (previousElement(ElementTypes.JSON_ARRAY_START, jsonNavigator)) {
//                        theXML += "/>\n";
//                        if (debugConvert) System.out.println("[convertJSONtoXML JSON_ARRAY_START JSON_ARRAY_END] WWWWWHHHHHYYYYY nodeStack! ADDING '>' %%%%%%%theXML:\n" + theXML);
//                        break;
//                    }

                    arrayDepth--;
                    if (debugConvert)
                        System.out.println("[convertJSONtoXML: array end] **after decrement** arrayDepth: " + arrayDepth + " objectDepth: " + objectDepth + " nameStackptr: " + nameStackptr + " nameStack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                    // only emit </nodeheader> if at level 0 or if the previous token was object start
                    if (arrayDepth <= 0) {
//						// emit nodeheader end xml (e.g., </requests>)
                        String thisNodeheader = nodeStack[nameStackptr];
                        if (thisNodeheader == null) {
                            thisNodeheader = theHint.getNodeHeader();
                        }
                        if (thisNodeheader != null && !thisNodeheader.equals("")) {
                            theXML += "</" + thisNodeheader + ">\n";
                            if (debugConvert)
                                System.out.println("[convertJSONtoXML JSON_ARRAY_END] nodeStack! **ADDED** </" + thisNodeheader + "> DECREMENTED nameStackptr theXML:\n" + theXML);
                            nameStackptr--;
                        }
                    }
                    if (debugConvert && nameStackptr >= 0) {
                        System.out.println("[convertJSONtoXML: array end] end of array end case statement new nameStackptr: " + nameStackptr + " " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr] + " arrayDepth: " + arrayDepth + " objectDepth: " + objectDepth);
                    }
                    break;
                }
                case ElementTypes.JSON_OBJECT_END: {
                    objectDepth--;
                    if (debugConvert)
                        System.out.println("[object end] objectDepth: " + objectDepth + " arrayDepth: " + arrayDepth + " nameStackptr: " + nameStackptr + " nameStack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                    if (jsonNavigator.hasNext() && !prevPrevElement(ElementTypes.JSON_ARRAY_END,ElementTypes.JSON_OBJECT_END,jsonNavigator )) {
                        // close it
                        theXML += "/>\n";
                        if (debugConvert) System.out.println("[convertJSONtoXML JSON_OBJECT_END  ***adding '/>'] theXML:\n" + theXML);
                    }
                    else {

                        // if previous token is PROPERTY_VALUE_STRING then emit " >\n"
                        if (previousElement(ElementTypes.JSON_PROPERTY_VALUE_STRING,jsonNavigator)) {
                            theXML += ">\n";
                            if (debugConvert) System.out.println("[convertJSONtoXML JSON_OBJECT_END  following PROPERTY_VALUE_STRING ***adding ' >'] theXML:\n" + theXML);
                        }

                        // Only do this if NOT followed by array end
                        // we are at the very end, emit </xxxxxx> if there is a nodeheader
                        String nodeheader = theHint.getNodeHeader();
                        if (debugConvert) System.out.println ("[convertJSONtoXML JSON_OBJECT_END nodeheader: "+ nodeheader);

                        if (nameStackptr >= 0) {
                            nodeheader = nodeStack[nameStackptr];
                            if (debugConvert) System.out.println ("[convertJSONtoXML JSON_OBJECT_END nodeheader: (from nodeStack) " + nodeheader);
                            if (nodeheader == null || nodeheader.equals("")) {
                                nodeheader = theHint.getNodeHeader();
                            }
                        }

                        if (!nodeheader.equals("")) {
                            if (debugConvert) System.out.println("[convertJSONtoXML nodePrefix is : " + theHint.getNodePrefix());
                            if (theHint.getNodePrefix().equals("analysisGroup")) {
                                // end this up
                                theXML += "</" + theHint.getNodePrefix() + ">\n";
                                if (debugConvert) System.out.println("[convertJSONtoXML ** after switch ** *** ADDING nodeprefix </" + theHint.getNodePrefix() + "> *** the end] theXML:\n" + theXML);
//                                nameStackptr--;
                            }

                            if (!jsonNavigator.hasNext()) {
                                // end this up
                                theXML += "</" + nodeheader + ">\n";
                                if (debugConvert)
                                    System.out.println("[convertJSONtoXML ** after switch ** *** ADDING </" + nodeheader + "> *** the end *** breaking out of it] theXML:\n" + theXML);
                                nameStackptr--;
                                break;
                            } else {
                                theXML += "</" + theHint.getNodePrefix() + ">\n";
                                if (debugConvert) System.out.println("[convertJSONtoXML ** after switch ** *** ADDING nodeprefix </" + theHint.getNodePrefix() + "> *** the end] theXML:\n" + theXML);
//                                nameStackptr--;
                            }
                        }
                        else
                        { // otherwise we emit </nodeprefix>
                            if (!nodePrefix.equals("")) {
                                theXML += "</" + nodePrefix + ">\n";
                                if (debugConvert) System.out.println("[convertJSONtoXML ** ZZZafter switch ** *** ADDING </" + theHint.getNodePrefix() + "> *** the end] theXML:\n" + theXML);
                                nameStackptr--;
                            }

                        }
                    }

//                        if (!nextElement(ElementTypes.JSON_OBJECT_START,jsonNavigator)) {
//                            nameStackptr--;
//                        }

                    if (debugConvert) System.out.println("[object end] after decrement nameStackptr: " + nameStackptr);

                    break;
                }
                default: {
                    break;
                }
            } // end of switch
            if (debugConvert) System.out.println("*** get next element ***");

            if (!jsonNavigator.hasNext()) {
                if (debugConvert) System.out.println("**** WE ARE DONE PARSING end of elements **** " + nameStackptr);

                break;
            }

            jsonNavigator.next();
            if (debugConvert) System.out.println("*** after jsonNavigator.next() at end of while ***");

        } // end of while
        if (debugConvert) System.out.println("***** after while ****");
        return theXML;
    }


    public static void main(String[] args) {

        HashMap xmlHintMap = new HashMap();
        if (args.length < 3) {
            System.out.println("Usage: java -cp .... JSONtoXML <hint filename> <hintKey> <json filename>.");
            System.exit(1);
        }
        JSONtoXML jsonTOxml = new JSONtoXML();

        try {
            String hintFile = args[0];
            xmlHintMap = jsonTOxml.initHints(hintFile);
        }
        catch (Exception e) {
            System.err.println("[GNomExFrontController] ERROR ERROR unable to initHints: " + e);
        }
        System.out.println ("[GNomExFrontController] xmlHintMap size: " + xmlHintMap.size());

        try {
            debugConvert = false;
            debugHint = false;
            debugTesting = false;

            // setup hintKey, the json to convert
            String hintKey = args[1];

            // read the file containing the json
            BufferedReader br = new BufferedReader(new FileReader(args[2]));

            String theJson = "";
            String line = null;
            StringBuilder sb = new StringBuilder(1024000);

            int numlines = 0;

            while ((line = br.readLine()) != null) {
                sb.append(line + "\n");
                numlines++;
            }

            theJson = sb.toString();
            String theXML = jsonTOxml.convertJSONtoXML(hintKey, theJson, xmlHintMap);


            System.out.println(theXML);
        } catch (Exception e) {
            System.out.print("WARNING error in main: ");
            e.printStackTrace();
        }

    }

}
