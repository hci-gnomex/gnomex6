package hci.gnomex.utility;

import hci.gnomex.utility.json.*;

import java.util.HashMap;
import java.util.Map;
import java.util.*;
import java.io.*;


public class JSONtoXML {
//    public static HashMap xmlHintMap = new HashMap();
    public static boolean debugHint = false;
    public static boolean debugConvert = false;

    public HashMap initHints(String fileName) throws Exception {
        HashMap xmlHintMap = new HashMap();

        DataCharBuffer dataBuffer = new DataCharBuffer();

        BufferedReader br = new BufferedReader(new FileReader(fileName));

        String theJson = "";
        String line = null;
        StringBuilder sb = new StringBuilder(1024000);

        String[] nameStack = new String[35];

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
            int theType = jsonNavigator.type();
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

            if (debugHint) System.out.println("***before switch*** theType: " + theType);
            switch (theType) {
                case ElementTypes.JSON_OBJECT_START: {
                    if (debugHint) System.out.println("[object start] stackptr: " + stackptr);
                    prevArrayStart = false;
                    // previous token array start?
                    if (jsonNavigator.hasPrevious()) {
                        jsonNavigator.previous();
                        int theType1 = jsonNavigator.type();
                        if (debugHint) System.out.println("[object start] theType1: " + theType1);

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
                        System.out.println("[property name] stackptr: " + stackptr + " text: " + jsonNavigator.asStringDecoded());
                    if (stackptr == 0) {
                        prevPropertyName = "";
                    } else if (stackptr == 1) {
                        if (!jsonNavigator.hasNext()) {
                            System.out.println("Error: property name followed by EOF");
                            System.exit(1);
                        }
                        text = jsonNavigator.asStringDecoded();
                        propertyName = text;
                        if (debugHint)
                            System.out.println("[property name] stackptr == 1 propertyName: " + propertyName);

                        jsonNavigator.next();
                        int theType1 = jsonNavigator.type();
                        if (theType1 == ElementTypes.JSON_PROPERTY_VALUE_STRING) {
                            text = jsonNavigator.asStringDecoded();
                            if (debugHint) System.out.println("[property name] stackptr == 1 text: " + text);

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
                            System.exit(1);
                        }

                        if (debugHint)
                            System.out.println("[property name] stackptr: == 2? " + stackptr + " text: " + text);
                        if (nameStack[stackptr - 1].equals("elementhints")) {
                            propertyName = text;
                            if (debugHint)
                                System.out.println("[property name] stackptr: " + stackptr + " text: " + propertyName);

                            jsonNavigator.next();
                            int theType1 = jsonNavigator.type();
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
                if (debugHint) System.out.println("jsonNavigator.hasNext failed: " + stackptr);
                break;
            }

            jsonNavigator.next();
            if (debugHint) System.out.println("*** after jsonNavigator.next() before end of while ***");

        } // end of while
        if (debugHint) System.out.println("***** after while **** xmlHintMap.size(): " + xmlHintMap.size());

        return (xmlHintMap);

    } // end of initHint

    public String addNodePrefix(int mode, String nodePrefix, int nextElementType, JsonNavigator jsonNavigator) {
        if (debugConvert)
            System.out.println("[addNodePrefix] nodePrefix: --->" + nodePrefix + "<--- nextElementType: " + nextElementType);
        String result = "";

        if (nodePrefix == null || nodePrefix.equals("")) {
            if (debugConvert) System.out.println("[addNodePrefix] ERROR ERROR nodePrefix is undefined!");
            return result;
        }

        // only do it if next token is property value
        if (!jsonNavigator.hasNext()) {
            if (debugConvert) System.out.println("[addNodePrefix] jsonNavigator.hasNext() failed!!!!");
            return result;
        }

        jsonNavigator.next();
        int theType1 = jsonNavigator.type();
        if (debugConvert)
            System.out.println("[addNodePrefix] theType1: " + theType1 + " " + ElementTypes.JSON_PROPERTY_VALUE_STRING + " nextElementType: " + nextElementType);

        jsonNavigator.previous();

        if (theType1 == nextElementType) {
            // emit nodePrefix
            result = "<" + nodePrefix + " ";

        } else {
            if (debugConvert) System.out.println("[addNodePrefix] *FAILED nextElement was not property value string*");
        }
        if (debugConvert) System.out.println("[addNodePrefix] result: " + result);
        return result;

    } // end of addNodePrefix

    public String addElementHint(String propertyName, HintInformation theHint, String[] theNodePrefix, String[] theEnclosingNode, JsonNavigator jsonNavigator) {
        String result = "";

        if (propertyName == null || propertyName.equals("")) {
            return result;
        }

        if (theHint == null) {
            return result;
        }

        // if array start followed by array end then nothing to do
        if (nextNextElement(ElementTypes.JSON_ARRAY_START, ElementTypes.JSON_ARRAY_END, jsonNavigator)) {
            theNodePrefix[0] = propertyName;
            theEnclosingNode[0] = "";

            result = "<" + propertyName + " ";
            return result;
        }

        // do we match an element hint?
        String theNodeName = theHint.mapElementName(propertyName);
        if (debugConvert)
            System.out.println("[addElementHint] propertyName: " + propertyName + " mapped node name: " + theNodeName + " <-------------------------");
        if (theNodeName.equals("")) {
            theNodeName = "*** missing element hint for " + propertyName + "***";
        }
        theEnclosingNode[0] = propertyName;
        theNodePrefix[0] = theNodeName;

        result += "<" + theEnclosingNode[0] + ">\n";
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
    public boolean nextNextElement(int elementType, int elementType1, JsonNavigator jsonNavigator) {
        boolean result = false;
        if (!jsonNavigator.hasNext()) {
            return result;
        }

        jsonNavigator.next();
        int theType1 = jsonNavigator.type();

        if (theType1 != elementType) {
            jsonNavigator.previous();
            return result;
        }

        if (!jsonNavigator.hasNext()) {
            jsonNavigator.previous();
            return result;
        }

        jsonNavigator.next();

        int theType2 = jsonNavigator.type();

        jsonNavigator.previous();
        jsonNavigator.previous();

        if (theType2 != elementType1) {
            return result;
        }

        return true;
    }


    public String convertJSONtoXML(String hintKey, String theJson, HashMap xmlHashMap) throws Exception {
        // the end result will be here:
        String theXML = "";

        DataCharBuffer dataBuffer = new DataCharBuffer();

        String[] nameStack = new String[35];
        String[] nodeStack = new String[35];

        dataBuffer.data = theJson.toCharArray();
        dataBuffer.length = dataBuffer.data.length;

        IndexBuffer tokenBuffer = new IndexBuffer(dataBuffer.data.length, true);
        IndexBuffer elementBuffer = new IndexBuffer(dataBuffer.data.length, true);

        JsonParser parser = new JsonParser(tokenBuffer, elementBuffer);

        parser.parse(dataBuffer);

        JsonNavigator jsonNavigator = new JsonNavigator(dataBuffer, elementBuffer);
        if (debugConvert)
            System.out.println("**************** Starting size ******************* " + jsonNavigator.size());

        int stackptr = -1;

        String prevPropertyName = "";

        // get the hint information
        HintInformation theHint = (HintInformation) xmlHashMap.get(hintKey);
        String nodePrefix = theHint.getNodePrefix();
        String[] theNodePrefix = new String[256];
        String[] theEnclosingNode = new String[256];
        if (debugConvert) System.out.println("[convertJSONtoXML]***[convertJSONtoXML] ***  hintKey: " + hintKey);
        if (debugConvert)
            System.out.println("[convertJSONtoXML]***[convertJSONtoXML] *** theHint: " + theHint.toString() + "\nnodePrefix: " + nodePrefix);

        int theSize = jsonNavigator.size();

        int nameStackptr = 0;

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
                case ElementTypes.JSON_OBJECT_START: {
                    stackptr++;
                    if (debugConvert) System.out.println("[convertJSONtoXML:object start] stackptr: " + stackptr);
                    if (!jsonNavigator.hasPrevious()) {

                        nameStackptr = 0;
                        nameStack[nameStackptr] = nodePrefix;
                        // add the outer most nodePrefix
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:object start] (0) stackptr: " + stackptr + " nodePrefix: " + nodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                        theXML += addNodePrefix(0, nodePrefix, ElementTypes.JSON_PROPERTY_NAME, jsonNavigator);
//                        if (debugConvert) System.out.println("[convertJSONtoXML] theXML:\n" + theXML);
                        nameStackptr++;
                    } else {
                        // add any inner nodePrefix
                        String thisNodePrefix = nameStack[nameStackptr];
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:object start] (had previous) stackptr: " + stackptr + " thisNodePrefix: " + thisNodePrefix + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                        theXML += "<" + thisNodePrefix + " ";
                    }

                    if (debugConvert) System.out.println("[convertJSONtoXML:end of object start case statement]");
                    break;
                }
                case ElementTypes.JSON_PROPERTY_NAME: {
                    // are we followed by "property value ..."
                    if (debugConvert) System.out.println("[convertJSONtoXML] nameStackptr: " + nameStackptr);
                    if (nextElement(ElementTypes.JSON_PROPERTY_VALUE_STRING, jsonNavigator)) {
                        text = jsonNavigator.asStringDecoded();
                        propertyName = text;
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML:property name] propertyName: " + propertyName);

                        // emit propertyName + =
                        theXML += propertyName + "=";
//                        if (debugConvert) System.out.println("[convertJSONtoXML] theXML:\n" + theXML);
                    } // end of next token was property value string...


                    else if (nextElement(ElementTypes.JSON_ARRAY_START, jsonNavigator)) {
                        // saw array start so it's compound
                        text = jsonNavigator.asStringDecoded();
                        propertyName = text;

                        // if we are finishing a non-compound property name, end the line with ">\n"
                        if (previousElement(ElementTypes.JSON_PROPERTY_VALUE_STRING, jsonNavigator)) {
                            theXML += ">\n";
                        }

                        // add any enclosing node info
                        theXML += addElementHint(propertyName, theHint, theNodePrefix, theEnclosingNode, jsonNavigator);
                        if (debugConvert) System.out.println("[convertJSONtoXML] theXML:\n" + theXML);
                        if (debugConvert)
                            System.out.println("[convertJSONtoXML] stackptr: " + stackptr + " namestack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);
                        nameStack[nameStackptr] = theNodePrefix[0];
                        nodeStack[nameStackptr] = theEnclosingNode[0];

                    } // end of if array start

                    if (debugConvert)
                        System.out.println("[property name] stackptr: " + nameStackptr + " nameStack[]: " + nameStack[nameStackptr] + " " + nodeStack[nameStackptr]);
                    if (debugConvert) System.out.println("[end of property name case statement]");
                    break;
                }
                case ElementTypes.JSON_ARRAY_START: {
                    if (debugConvert) System.out.println("[array start] stackptr: " + nameStackptr);
                    if (debugConvert) System.out.println("[end of array start case statement]");
                    break;
                }
                case ElementTypes.JSON_PROPERTY_VALUE_STRING: {
                    String propertyValue = jsonNavigator.asStringDecoded();
                    if (debugConvert)
                        System.out.println("[convertJSONtoXML:property value] stackptr: " + nameStackptr + " nodePrefix: " + nameStack[nameStackptr] + " propertyName: " + propertyName + " propertyValue: " + propertyValue);

                    theXML += "\"" + propertyValue + "\" ";
                    if (debugConvert) System.out.println("[property value string] stackptr: " + nameStackptr);
//                    if (debugConvert) System.out.println("[property value string] end of case statement theXML:\n" + theXML);
                    break;
                }
                case ElementTypes.JSON_ARRAY_END: {
                    if (debugConvert)
                        System.out.println("[convertJSONtoXML: array end] nameStackptr: " + nameStackptr + " nameStack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

//						// do we directly follow an array start?
                    if (previousElement(ElementTypes.JSON_ARRAY_START, jsonNavigator)) {
                        theXML += "/>\n";
                        break;
                    }

//						// do we have a node prefix to emit?
                    if (nodeStack[nameStackptr] != null && !nodeStack[nameStackptr].equals("")) {
                        // yes
                        theXML += "</" + nodeStack[nameStackptr] + ">\n";
//                        if (debugConvert) System.out.println("[convertJSONtoXML] nodeStack! theXML:\n" + theXML);
                    }

                    if (previousElement(ElementTypes.JSON_OBJECT_END, jsonNavigator)) {
//						nameStackptr--;
                        break;
                    }

                    if (debugConvert)
                        System.out.println("[convertJSONtoXML: array end] end of array end case statement new nameStackptr: " + nameStackptr + " " + nameStack[nameStackptr] + " " + nodeStack[nameStackptr]);
                    break;
                }
                case ElementTypes.JSON_OBJECT_END: {
                    if (debugConvert)
                        System.out.println("[object end] nameStackptr: " + nameStackptr + " nameStack: " + nameStack[nameStackptr] + " nodeStack: " + nodeStack[nameStackptr]);

                    if (jsonNavigator.hasNext()) {
                        // close it
                        theXML += "/>\n";
//                        if (debugConvert) System.out.println("[convertJSONtoXML] theXML:\n" + theXML);
                    }
                    stackptr--;

                    if (debugConvert) System.out.println("[object end] after decrement nameStackptr: " + nameStackptr);

                    break;
                }
                default: {
                    break;
                }
            } // end of switch
            if (debugConvert) System.out.println("*** get next element ***");
            if (!jsonNavigator.hasNext()) {
                if (debugConvert) System.out.println("**** end of elements **** " + nameStackptr);

                // end this up
                theXML += "</" + nodePrefix + ">\n";
//                if (debugConvert) System.out.println("[convertJSONtoXML] theXML:\n" + theXML);
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

            // setup hintKey, the json to convert
            String hintKey = args[0] + "." + args[1];

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
