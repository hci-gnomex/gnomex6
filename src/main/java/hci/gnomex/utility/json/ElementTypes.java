package hci.gnomex.utility.json;

/**
 */
public class ElementTypes {

    public static final byte JSON_OBJECT_START           = 1;   // {
    public static final byte JSON_OBJECT_END             = 2;   // }
    public static final byte JSON_ARRAY_START            = 3;   // [
    public static final byte JSON_ARRAY_VALUE_STRING     = 4;   //
    public static final byte JSON_ARRAY_VALUE_STRING_ENC = 5;   // String with encoded characters, like \t or \u2345
    public static final byte JSON_ARRAY_VALUE_NUMBER     = 6;   // [
    public static final byte JSON_ARRAY_VALUE_BOOLEAN    = 7;   // [
    public static final byte JSON_ARRAY_VALUE_NULL       = 8;   // [
    public static final byte JSON_ARRAY_END              = 9;   // ]
    public static final byte JSON_PROPERTY_NAME          = 10;   //
    public static final byte JSON_PROPERTY_VALUE_STRING  = 11;   //
    public static final byte JSON_PROPERTY_VALUE_STRING_ENC = 12;   // String with encoded characters, like \t or \u2345
    public static final byte JSON_PROPERTY_VALUE_NUMBER  = 13;  //
    public static final byte JSON_PROPERTY_VALUE_BOOLEAN = 14;  //
    public static final byte JSON_PROPERTY_VALUE_NULL    = 15;  //

	public static final String [] elements = {"",
	"object start",
	"object end",
	"array start",
	"array value string",
	"array value string enc",
	"array value number",
	"array value boolean",
	"array value null",
	"array end",
	"property name",
	"property value string",
	"property value string_enc",
	"property value number",
	"property value boolean",
	"property value null" };


public static String toString(byte element) {
	if (element < 1 || element > 15) {
		return "** Invalid element type **";
	}

	return elements[element];
}
}
