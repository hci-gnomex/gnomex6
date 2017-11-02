package hci.framework.model;

import hci.framework.utilities.Annotations;
import hci.framework.utilities.ConfigurationPlugin;
import hci.framework.utilities.DirtyMarker;
import hci.framework.utilities.PluginFactory;
import hci.framework.utilities.XMLReflectException;

import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;

/**
 *  A base class for detail objects
 *
 *@author     Kirt Henrie
 *@author     Jen Heninger-Potter
 *@created    August 17, 2002
 */
public abstract class DetailObject extends FieldInputValidator implements DirtyMarker, Serializable, Comparator<Object> {

  /** used by various auditing methods */
  protected String username;
  /**
   *  invalidFields should hold the field name as a key and the display message
   *  as the value example: key phoneNr, value you must enter a phone number in
   *  the form nnn-nnn-nnnn
   */
  protected HashMap<String, String> invalidFields;

  /**
   *  Description of the Field
   */
  protected boolean dirty;
  /**
   *  Description of the Field
   */
  protected boolean remove;
  /**
   *  Description of the Field
   */
  protected boolean create;
  /**
   *  Description of the Field
   */
  protected HashMap<String, String> excludeMethodsFromXML;
  /**
   * List of annotations that are used to increase the scope of the object during XML generation/copy.
	 * Note: If this list is used, then the object will ignore any annotations passed into toXML and copy
   * methods.
   */
  protected List<Class<? extends Annotation>> verifyAnnotationsList = new ArrayList<Class<? extends Annotation>>();
  /**
   * User has permission to view this instance. If this is set to false, then the 
   * object isn't included in XML.
   */
  protected boolean canRead = true;
  /**
   * User has permission to update this instance
   */
  protected boolean canUpdate = true;  
  /**
   * User has permission to delete this instance
   */
  protected boolean canDelete = true;  
  /**
   * Set inTraversal when traversing this object, such as for exporting the object
   * to XML. When leaving the method, clear the flag. Traversal methods should
   * not process the object if this flag is set (to avoid circular processing).
   */
  protected boolean inTraversal;
  /**
   * Set to the value of the field you wish to sort a set of these objects by.
   */
  protected Object sortField;
  /**
   * Set to the outputStyle of format to use for outputting dates to XML
   */
  protected int dateOutputStyle = DATE_OUTPUT_UNKNOWN;

  /**
  * The method to initialize excludeMethodsFromXML
  */
  protected void initExcludeMethodsFromXML() {
    excludeMethodsFromXML = new HashMap<String, String>();
    excludeMethodsFromXML.put("getInvalidFields", "exclude");
    excludeMethodsFromXML.put("getClass", "exclude");
    excludeMethodsFromXML.put("getUsername", "exclude");
    excludeMethodsFromXML.put("getDateOutputStyle", "exclude");
    excludeMethodsFromXML.put("getVerifyAnnotationsList", "exclude");
  }

  /**
   *  Returns true if there are no invalid fields in the invalidFields HashMap,
   *  otherwise false
   *
   *@return    The valid value
   */
  public boolean isValid() {
    if (invalidFields == null || invalidFields.size() < 1) {
      return true;
    }
    return false;
  }


  /**
   *  Adds an entry to the invalidFields HashMap
   *
   *@param  fieldName  The name of the field to be entered
   *@param  message    The message to display
   */
  public void addInvalidField(String fieldName, String message) {
    if (invalidFields == null) {
      invalidFields = new HashMap<String, String>();
    }
    if (fieldName != null && message != null) {
      invalidFields.put(fieldName, message);
    }
  }

  /**
   * This method returns our DetailObject as XML using reflection. It will not process if already in Traversal 
   * (to avoid circular references). It also will not process if the object hasn't been initialized by Hibernate. 
   * It will only include attributes that haven't been annotated and defaults to DATE_OUTPUT_SLASH as the proper 
   * date output.
   */
  public String toXMLString() throws XMLReflectException {
    return toXMLString(null, DATE_OUTPUT_SLASH);
  }

  /**
   * This method returns our DetailObject as XML using reflection. It will not process if already in Traversal 
   * (to avoid circular references). It also will not process if the object hasn't been initialized by Hibernate. 
   * It will only include attributes that haven't been annotated.
   * 
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   */
  public String toXMLString(int dateOutputStyle) throws XMLReflectException {
    return toXMLString(null, dateOutputStyle);
  }

  /**
   * This method returns our DetailObject as XML using reflection. It will not process if already in Traversal 
   * (to avoid circular references). It also will not process if the object hasn't been initialized by Hibernate. 
   * It will only include attributes that haven't been annotated and defaults to DATE_OUTPUT_SLASH as the proper 
   * date output.
   * 
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   */
  public String toXMLString(Class[] useBaseClassAsRootNode) throws XMLReflectException {
    return toXMLString(useBaseClassAsRootNode, DATE_OUTPUT_SLASH);
  }

  /**
   * This method returns our DetailObject as XML using reflection. It will not process if already in Traversal 
   * (to avoid circular references). It also will not process if the object hasn't been initialized by Hibernate. 
   * It will only include attributes that haven't been annotated.
   * 
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   */
  public String toXMLString(Class[] useBaseClassAsRootNode, int dateOutputStyle) throws XMLReflectException {
    List l = null;
    if (useBaseClassAsRootNode != null) {
      l = Arrays.asList(useBaseClassAsRootNode);
    }

    Document doc = this.toXMLDocument(l, dateOutputStyle);
    org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();

    String result = null;
    result = out.outputString(doc);
    return result;
  }
  
  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only  
   * include certain attributes based on the method/attribute annotations. If all of the method/attribute's
   * annotations are located within the verifyAnnotationsList, then the attribute is displayed.
   *
   * @param useBaseClassAsRootNode Use this list to identify classes that should use the base class at the root 
   * xml node. This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   * @param verifyAnnotationsList The master list of annotations to compare against.
   */
  public String toXMLString(Class[] useBaseClassAsRootNode, int dateOutputStyle, List<Class<? extends Annotation>> verifyAnnotationsList)
    throws XMLReflectException
  {
    List l = null;
    if (useBaseClassAsRootNode != null) {
      l = Arrays.asList(useBaseClassAsRootNode);
    }

    Document doc = this.toXMLDocument(l, dateOutputStyle, verifyAnnotationsList);
    org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();

    String result = null;
    result = out.outputString(doc);
    return result;
  }
  
  /**
   * This method returns our DetailObject as XML using reflection. It will not process if already in Traversal 
   * (to avoid circular references). It also will not process if the object hasn't been initialized by Hibernate. 
   * It will only include certain attributes based on the method/attribute annotations and the type of 
   * annotationLogic passed in:
   * 
   * <ul><li>ANNOTATIONS_ANY: This tests to see if any of the method/attribute's annotations are located
   * within the annotations list passed in. If there is a match, then the attribute is displayed. 
   * <li>ANNOTATIONS_ALL &lt;default&gt;: This tests to see if all of the method/attribute's annotations are
   * located within the annotations list passed in. If there is a match then the attribute is displayed.
   * <li>ANNOTATIONS_IGNORE: This method ignores annotations and displays all fields.</ul>
   *
   * @param useBaseClassAsRootNode Use this list to identify classes that should use the base class at the root 
   * xml node. This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   * @param annotations The master list of annotations to compare against.
   * @param annotationLogic This is one of the ANNOTATION_X statics available in the framework.
   */
  public String toXMLString(Class[] useBaseClassAsRootNode, int dateOutputStyle, List<Class<? extends Annotation>> verifyAnnotationsList, 
    int annotationLogic) throws XMLReflectException {
       
    List l = null;
    if (useBaseClassAsRootNode != null) {
      l = Arrays.asList(useBaseClassAsRootNode);
    }

    Document doc = this.toXMLDocument(l, dateOutputStyle, verifyAnnotationsList, annotationLogic);
    org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();

    String result = null;
    result = out.outputString(doc);
    return result;
  }

  /**
   * Returns the base class name. This is the highest class name in the superclass hierarchy subbed under 
   * DetailObject.
   */
  protected String getBaseClassName() {

    Class<?> baseClass = this.getClass();

    while (true) {
      if (baseClass.getSuperclass().getName().substring(baseClass.getSuperclass().getName().lastIndexOf(".") + 1).equals("DetailObject")) {
        break;
      } else {
        baseClass = baseClass.getSuperclass();
      }
    }

    return baseClass.getName().substring(baseClass.getName().lastIndexOf(".") + 1);

  }

  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only
   * include attributes that haven't been annotated and defaults to DATE_OUTPUT_SLASH as the proper date
   * output.
   * 
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   */
  public Document toXMLDocument(List useBaseClass) throws XMLReflectException {
    return toXMLDocument(useBaseClass, DATE_OUTPUT_SLASH);
  }
  
  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only
   * include attributes that haven't been annotated.
   * 
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   */
  public Document toXMLDocument(List useBaseClass, int dateOutputStyle) throws XMLReflectException {
    return toXMLDocumentRecursion(useBaseClass, dateOutputStyle, null, Annotations.ALL, DetailObject.XML_METHOD_PARAM2);
  }
  
  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only  
   * include certain attributes based on the method/attribute annotations. If all of the method/attribute's
   * annotations are located within the verifyAnnotationsList, then the attribute is displayed.
   *
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   * @param verifyAnnotationsList The master list of annotations to compare against.
   */
  public Document toXMLDocument(List useBaseClass, int dateOutputStyle, List<Class<? extends Annotation>> verifyAnnotationsList) 
    throws XMLReflectException
  {
    return toXMLDocumentRecursion(useBaseClass, dateOutputStyle, verifyAnnotationsList, Annotations.ALL, DetailObject.XML_METHOD_PARAM3);
  }
  
  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only
   * include certain attributes based on the method/attribute annotations and the type of annotationLogic
   * passed in:
   * 
   * <ul><li>ANNOTATIONS_ANY: This tests to see if any of the method/attribute's annotations are located
   * within the annotations list passed in. If there is a match, then the attribute is displayed. 
   * <li>ANNOTATIONS_ALL &lt;default&gt;: This tests to see if all of the method/attribute's annotations are
   * located within the annotations list passed in. If there is a match then the attribute is displayed.
   * <li>ANNOTATIONS_IGNORE: This method ignores annotations and displays all fields.</ul>
   *
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   * @param verifyAnnotationsList The master list of annotations to compare against.
   * @param annotationLogic This is one of the ANNOTATION_X statics available in the framework.
   */
  public Document toXMLDocument(List useBaseClass, int dateOutputStyle, List<Class<? extends Annotation>> verifyAnnotationsList,
    int annotationLogic) throws XMLReflectException
  {
    return toXMLDocumentRecursion(useBaseClass, dateOutputStyle, verifyAnnotationsList, annotationLogic, DetailObject.XML_METHOD_PARAM4);
  }
  
  /**
   * This method performs the XML Formatting. It will not process if already in Traversal (to avoid circular 
   * references). It also will not process if the object hasn't been initialized by Hibernate. It will only
   * include certain attributes based on the method/attribute annotations and the type of annotationLogic
   * passed in:
   * 
   * <ul><li>ANNOTATIONS_ANY: This tests to see if any of the method/attribute's annotations are located
   * within the annotations list passed in. If there is a match, then the attribute is displayed. 
   * <li>ANNOTATIONS_ALL &lt;default&gt;: This tests to see if all of the method/attribute's annotations are
   * located within the annotations list passed in. If there is a match then the attribute is displayed.
   * <li>ANNOTATIONS_IGNORE: This method ignores annotations and displays all fields.</ul>
   *
   * @param useBaseClass Use this list to identify classes that should use the base class at the root xml node.
   * This list gets passed in recursion.
   * @param dateOutputStyle Format dates using dateOutputStyle parameter, but override if instance has set its
   * own dateOutputStyle property. This parameter gets passed in recursion.
   * @param verifyAnnotationsList The master list of annotations to compare against.
   * @param annotationLogic This is one of the ANNOTATION_X statics available in the framework.
   * @param xmlMethod This determines which method gets called on recursion based on the method that called private
   * method. For example, if the toXMLDocument with only one parameter calls this method (XML_METHOD_PARAM1), then
   * it is called on recursion. This ensures that if the method was overwritten, it gets called recursively.
   */
  private Document toXMLDocumentRecursion(List useBaseClass, int dateOutputStyle, List<Class<? extends Annotation>> verifyAnnotationsList, 
    int annotationLogic, int xmlMethod) throws XMLReflectException 
  {

    // Call registerMethodsToExcludeFromXML() in case subclass has overridden it
    registerMethodsToExcludeFromXML();
    // Initialize the excludeMethodsFromXML, if still needed
    if (this.excludeMethodsFromXML == null) {
      initExcludeMethodsFromXML();
    }

    // use parameter for local dateOutputStyle
    int dateOutputStyleLocal = dateOutputStyle;
    // But if instance has a value, use it instead
    if (this.dateOutputStyle != DATE_OUTPUT_UNKNOWN) {
      dateOutputStyleLocal = this.dateOutputStyle;
    }

    Class<?> clazz = this.getClass();

    // our class name, the root element of the xml and the prefix to the row
    String clazzName = clazz.getName().substring(clazz.getName().lastIndexOf(".") + 1);

    // if in List passed in, use the base class name for the root element
    if (useBaseClass != null && useBaseClass.contains(clazz)) {

      clazzName = this.getBaseClassName();
    }

    // bypass XML generation if canRead = false on object instance
    if (!canRead()) {
      return null;
    }
    
    // bypass XML generation if class annotation signature isn't verified
    try {
      if (!this.verifyAnnotations(((getVerifyAnnotationsList() == null || getVerifyAnnotationsList().size() == 0)? 
        verifyAnnotationsList:getVerifyAnnotationsList()), annotationLogic))
      {
        return null;
      }
    } catch (Exception e) { }

    // our main element and document
    Element mainEle = new Element(clazzName);
    if(isInTraversal()) {
      Attribute a = new Attribute("repeat", "true");
      mainEle.setAttribute(a);
      return new Document(mainEle);
    }

    // set state to in traversal
    this.setInTraversal();

    Document doc = new Document(mainEle);

    Method[] methods = clazz.getMethods();

    // iterate through the fields
    for (int i = 0;i < methods.length; i++) {
      // if this is a wrapper or primative field get the value for our xml

      Method currMethod = methods[i];
      String fieldName = null;

      String mn = currMethod.getName();
      
      if ((this.excludeMethodsFromXML == null || this.excludeMethodsFromXML.get(mn) == null) &&
          //mn.indexOf("get") != -1 && currMethod.getParameterTypes().length == 0 && verifyAnnotationsResult) {
          mn.indexOf("get") != -1 && currMethod.getParameterTypes().length == 0) {
        // we have a getter
        // bypass XML generation if method annotation signature isn't verified
        boolean verifyAnnotationsResult = true;
        try {
          verifyAnnotationsResult = this.verifyAnnotations(mn, ((getVerifyAnnotationsList() == null || getVerifyAnnotationsList().size() == 0)? 
            verifyAnnotationsList:getVerifyAnnotationsList()), annotationLogic);
        } catch (Exception e) { }
        if(verifyAnnotationsResult) {
          fieldName = mn.substring(3, 4).toLowerCase();
          if (mn.length() > 4) {
            fieldName = fieldName + mn.substring(4);
          }

          Class<?> type = currMethod.getReturnType();

          // take care of 1:1 relationships
          try {
            Object o = currMethod.invoke(this, null);

            if (o == null) {
              o = "";
            }

            //if (type.getSuperclass() != null && type.getSuperclass().getName().equals("hci.framework.model.DetailObject")) {
            Method meth = getXMLDocumentMethod(type, xmlMethod);
            if (meth != null) {
              // If we have a complex class, create an attribute element and put class details inside
              Element attEle = new Element(fieldName);
              Document d = callXMLDocumentMethod(meth, o, useBaseClass, dateOutputStyle, verifyAnnotationsList, annotationLogic, xmlMethod);
              if (d != null) {
                attEle.addContent(d.getRootElement());
              }
              mainEle.addContent(attEle);
            } else if (o != null && type.getInterfaces() != null && type.getInterfaces().length > 0) {
              boolean notCollection = true;
              for (int j = 0; j < type.getInterfaces().length; j++) {
                Class<?>[] intf = type.getInterfaces();
                if (intf[j].getName().equals("java.util.Set") ||
                    intf[j].getName().equals("java.util.Map") ||
                    intf[j].getName().equals("java.util.List")||
                    intf[j].getName().equals("java.util.Collection")) {
                  notCollection = false;
                }
              }
              if (notCollection) {
                String convertedDate = this.convertDate(o, dateOutputStyleLocal);
                if (convertedDate != null) {
                  mainEle.setAttribute(fieldName, convertedDate);
                } else {
                  mainEle.setAttribute(fieldName, o.toString());
                }
              } else {
                // take care of the 1:N
                // iterate through the collection and call toXML or if Wrapper/primative insert values
                Iterator it = ((java.util.Collection) o).iterator();

                // we may have an empty collection, but let it create the element so the item will exist, but empty
                //if (it.hasNext()) {
                  //Element setEle = new Element(fieldName + "_COLLECTION");
                  Element setEle = new Element(fieldName);

                  while (it.hasNext()) {
                    Object ob = it.next();
                    Class<?> obType = ob.getClass();

                    //if (obType.getSuperclass() != null && obType.getSuperclass().getName().equals("hci.framework.model.DetailObject")) {
                    Method obMeth = getXMLDocumentMethod(obType, xmlMethod);
                    if (obMeth != null) {
                      Document obd = callXMLDocumentMethod(obMeth, ob, useBaseClass, dateOutputStyle, verifyAnnotationsList, annotationLogic, xmlMethod);
                      if (obd != null) {
                        setEle.addContent(obd.getRootElement());
                      }
                    } else {
                      // This is the previous approach - hard-code row name
                      //Element colRow = new Element("COLLECTION_ROW");

                      // Another possible approach - use the class name to represent the row
                      // (what if it is a primary type?)
                      // String obTypeName = obType.getName().substring(obType.getName().lastIndexOf(".") + 1);
                      // Element colRow = new Element(obTypeName);

                      // For now, use the collection name (fieldName) with _ROW appended
                      Element colRow = new Element(fieldName + "_ROW");
                      colRow.setAttribute("value", ob.toString());
                      setEle.addContent(colRow);
                    }
                  }
                  mainEle.addContent(setEle);
                //}
              }
            } else {
              String convertedDate = this.convertDate(o, dateOutputStyleLocal);
              if (convertedDate != null) {
                mainEle.setAttribute(fieldName, convertedDate);
              } else {
                mainEle.setAttribute(fieldName, o.toString());
              }
            }

          }catch (InvocationTargetException ex) {
            throw new XMLReflectException("unable to reflect XML in class " + this.getClass().getName());
          }catch (SecurityException ex) {
            throw new XMLReflectException("unable to reflect XML in class " + this.getClass().getName());
          }catch (IllegalAccessException ex) {
            throw new XMLReflectException("unable to reflect XML in class " + this.getClass().getName());
          }catch (IllegalArgumentException ex) {
            throw new XMLReflectException("unable to reflect XML in class " + this.getClass().getName());
          }    
        }
      }
    }

    //doc.getRootElement().addContent(mainEle);

    // if we marked it for traversal, then clear it
    this.clearInTraversal();
    return doc;
  }
  
  protected static final int XML_METHOD_PARAM1 = 1; // toXMLDocument(List useBaseClass);
  protected static final int XML_METHOD_PARAM2 = 2; // toXMLDocument(List useBaseClass, int dateOutputStyle);
  protected static final int XML_METHOD_PARAM3 = 3; // toXMLDocument(List useBaseClass, int dateOutputStyle, List verifyAnnotationsList);
  protected static final int XML_METHOD_PARAM4 = 4; // toXMLDocument(List useBaseClass, int dateOutputStyle, List verifyAnnotationsList, int annotationLogic);
  
  /**
   * Sets the method to the appropriate toXMLDocument based on the number of parameters specified by xmlMethod.
   * @param type This is the object the method resides in.
   * @param xmlMethod This determines which method gets called on recursion based on the method that called private
   * method. For example, if the toXMLDocument with only one parameter calls this method (XML_METHOD_PARAM1), then
   * it is called on recursion. This ensures that if the method was overwritten, it gets called recursively.
   * @return The method if it was found; otherwise, it returns null.
   */
  protected Method getXMLDocumentMethod(Class<?> type, int xmlMethod)
  {
    Method method = null;
    try
    {
      if (xmlMethod == DetailObject.XML_METHOD_PARAM1)
        method = type.getMethod("toXMLDocument", new Class[] {java.util.List.class});
      else if (xmlMethod == DetailObject.XML_METHOD_PARAM2)
        method = type.getMethod("toXMLDocument", new Class[] {java.util.List.class, Integer.TYPE});
      else if (xmlMethod == DetailObject.XML_METHOD_PARAM3)
        method = type.getMethod("toXMLDocument", new Class[] {java.util.List.class, Integer.TYPE, java.util.List.class});
      else if (xmlMethod == DetailObject.XML_METHOD_PARAM4)
        method = type.getMethod("toXMLDocument", new Class[] {java.util.List.class, Integer.TYPE, java.util.List.class, int.class});
    }
    catch (SecurityException ex) 
    {
      method = null;
    }
    catch (NoSuchMethodException ex) 
    {
      method = null;
    }
    
    return method;
  }
  
  /**
   * Calls the appropriate xmlDocument method retrieved by calling getXMLDocumentMethod(*) based on the number of parameters
   * specified by xmlMethod.
   * @param method The method to call.
   * @param object The object the method exists in.
   * @param useBaseClass (See toXMLDocumentRecursion(*) for details.)
   * @param dateOutputStyle (See toXMLDocumentRecursion(*) for details.)
   * @param verifyAnnotationsList (See toXMLDocumentRecursion(*) for details.)
   * @param annotationLogic (See toXMLDocumentRecursion(*) for details.)
   * @param xmlMethod This determines which method gets called on recursion based on the method that called private
   * method. For example, if the toXMLDocument with only one parameter calls this method (XML_METHOD_PARAM1), then
   * it is called on recursion. This ensures that if the method was overwritten, it gets called recursively.
   * @return The document returned by calling the toXMLDocument(*) recursively.
   * @throws IllegalAccessException
   * @throws InvocationTargetException
   */
  protected Document callXMLDocumentMethod(Method method, Object object, List useBaseClass, int dateOutputStyle, 
    List<Class<? extends Annotation>> verifyAnnotationsList, int annotationLogic, int xmlMethod) throws IllegalAccessException,
    InvocationTargetException
  {
    Document document = null;
    if (xmlMethod == DetailObject.XML_METHOD_PARAM1)
      document = (Document) method.invoke(object, new Object[] {useBaseClass});
    else if (xmlMethod == DetailObject.XML_METHOD_PARAM2)
      document = (Document) method.invoke(object, new Object[] {useBaseClass, new Integer(dateOutputStyle)});
    else if (xmlMethod == DetailObject.XML_METHOD_PARAM3)
      document = (Document) method.invoke(object, new Object[] {useBaseClass, new Integer(dateOutputStyle), verifyAnnotationsList});
    else if (xmlMethod == DetailObject.XML_METHOD_PARAM4)
      document = (Document) method.invoke(object, new Object[] {useBaseClass, new Integer(dateOutputStyle), verifyAnnotationsList, annotationLogic});
    return document;
  }

  /**
   *  Replaces ' with '', returns the string "null" if null and encloses result with '
   *
   *@param  o  Description of the Parameter
   *@return    The SQLString value
   */
  public String getSQLString(Object o) {
    if (o == null || o.toString().trim().length() < 1 || o.toString().equals("null")) {
      return "null";
    }
    else {
      StringBuffer tempBuf = new StringBuffer(o.toString());

      for (int i = 0; i < tempBuf.length(); i++) {
        if (tempBuf.charAt(i) == '\'') {
          tempBuf.insert(i, '\'');
          i++;
        }
      }
      return "'" + tempBuf.toString() + "'";
    }
  }

  /**
   *  Used to remove " and ' characters from sql statements, set the string null
   *  to the value null, and return null if empty string
   *
   *@param  o  Description of the Parameter
   *@return    The goodString value
   */
  public String getGoodString(Object o) {
    if (o == null || o.toString().trim().length() < 1 || o.toString().equals("null")) {
      return null;
    }
    else {
      StringBuffer tempBuf = new StringBuffer(o.toString());
      for (int i = 0; i < tempBuf.length(); i++) {
        if (tempBuf.charAt(i) == '\'') {
          tempBuf.insert(i, '\'');
          i++;
        }
        else if (tempBuf.charAt(i) == '\"') {
          tempBuf.replace(i, i + 1, " ");
        }
      }
      return tempBuf.toString();
    }
  }

  /**
   *  Accepts an object and if a date type returns a string formatted to the
   * requested output style.
   *
   */
  private String convertDate(Object o, int outputStyle) {
    String result = null;

    if (o != null) {
      if ((o instanceof java.sql.Date)) {
        java.sql.Date d = (java.sql.Date) o;
        result = this.formatDate(d, outputStyle);
      }
      else if ((o instanceof java.sql.Timestamp)) {
        java.sql.Timestamp t = (java.sql.Timestamp) o;
        //SimpleDateFormat sd = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss.SSSSSSSSS");
        //result = sd.format(t);
        result = this.formatTimestamp(t, outputStyle);
      }
      else if ((o instanceof java.util.Date)) {
        java.util.Date d = (java.util.Date) o;
        result = this.formatDateTime(d, outputStyle);
      }
    }

    return result;
  }

  /**
   *  Gets the dirty attribute of the DetailObject object
   *
   *@return    The dirty value
   */
  public boolean isDirty() {
    return dirty;
  }


  /**
   *  Sets the dirty attribute of the DetailObject object
   */
  public void setDirty() {
    this.dirty = true;
  }


  /**
   *  Description of the Method
   */
  public void clearDirty() {
    this.dirty = false;
  }


  /**
   *  Gets the remove attribute of the DetailObject object
   *
   *@return    The remove value
   */
  public boolean isRemove() {
    return remove;
  }


  /**
   *  Sets the remove attribute of the DetailObject object
   */
  public void setRemove() {
    this.remove = true;
  }


  /**
   *  Description of the Method
   */
  public void clearRemove() {
    this.remove = false;
  }


  /**
   *  Gets the create attribute of the DetailObject object
   *
   *@return    The create value
   */
  public boolean isCreate() {
    return create;
  }


  /**
   *  Sets the create attribute of the DetailObject object
   */
  public void setCreate() {
    this.create = true;
  }


  /**
   *  Description of the Method
   */
  public void clearCreate() {
    this.create = false;
  }


  /**
   *  Gets the invalidFields attribute of the DetailObject object
   *
   *@return    The invalidFields value
   */
  public HashMap<String, String> getInvalidFields() {
    return invalidFields;
  }

  public void clearInvalidFields() {
    this.invalidFields = null;
  }
  
  /**
   * Returns the currently defined list of annotations that are accepted for this object.
   * @return annotations
   */
  public List<Class<? extends Annotation>> getVerifyAnnotationsList() { return verifyAnnotationsList; }
  
  /**
   * Adds the annotation to the verifyAnnotationsList (as long as it doesn't already exist in the list).
   * @param annotation The annotation to add to verifyAnnotationsList.
   */
  public void addAnnotationToVerifyAnnotationsList(Class<? extends Annotation> annotation)
  {
    if (!verifyAnnotationsList.contains(annotation))
      verifyAnnotationsList.add(annotation);
  }
  
  /**
   * Clears all annotations in the verifyAnnotationsList.
   */
  public void clearVerifyAnnotationsList()
  {
    verifyAnnotationsList.clear();
  }
  
  /**
   * Sets the currently defined list of annotations that are accepted for this object.
   * @param annotations
   */
  public void setVerifyAnnotationsList(List<Class<? extends Annotation>> verifyAnnotationsList) 
  { 
    this.verifyAnnotationsList = verifyAnnotationsList; 
  }

  /**
   *  Adds an entry to the excludeMethodsFromXML HashMap
   *
   *@param  methodName  The name of the method to be excluded
   */
  public void excludeMethodFromXML(String methodName) {
    if (excludeMethodsFromXML == null) {
      initExcludeMethodsFromXML();
    }
    if (methodName != null) {
      excludeMethodsFromXML.put(methodName, "exclude");
    }
  }

  /**
   *  Clear the excludeMethodsFromXML HashMap
   *
   *@param  methodName  The name of the method to be excluded
   */
  public void clearExcludeMethodsFromXML() {
    this.excludeMethodsFromXML = null;
  }

  /**
   * Stub that will be called from toXMLDocument(). Subclass can
   * override and use calls to excludeMethodFromXML() to register
   * methods to be excluded from the XML output.
   */
  public void registerMethodsToExcludeFromXML() {
  }

  /**
   *  Gets the inTraversal attribute of the DetailObject object
   *
   *@return    The inTraversal value
   */
  public boolean isInTraversal() {
    return inTraversal;
  }


  /**
   *  Sets the create attribute of the DetailObject object
   */
  public void setInTraversal() {
    this.inTraversal = true;
  }


  /**
   *  Description of the Method
   */
  public void clearInTraversal() {
    this.inTraversal = false;
  }

  public int compare(Object one, Object two) {
    int result = 1;

    if (one != null && two != null
        && one instanceof DetailObject && two instanceof DetailObject
        && ((DetailObject) one).sortField != null && ((DetailObject) two).sortField != null) {

      DetailObject oneD = (DetailObject) one;
      DetailObject twoD = (DetailObject) two;

      if (oneD.equals(twoD)) {
        result = 0;
      }
      else if (oneD.sortField instanceof String) {
        String oneS = (String) ((DetailObject) one).sortField;
        String twoS = (String) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof java.sql.Date) {
        java.sql.Date oneS = (java.sql.Date) ((DetailObject) one).sortField;
        java.sql.Date twoS = (java.sql.Date) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof java.sql.Timestamp) {
        java.sql.Timestamp oneS = (java.sql.Timestamp) ((DetailObject) one).sortField;
        java.sql.Timestamp twoS = (java.sql.Timestamp) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof java.util.Date) {
        java.util.Date oneS = (java.util.Date) ((DetailObject) one).sortField;
        java.util.Date twoS = (java.util.Date) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof Integer) {
        Integer oneS = (Integer) ((DetailObject) one).sortField;
        Integer twoS = (Integer) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof Long) {
        Long oneS = (Long) ((DetailObject) one).sortField;
        Long twoS = (Long) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      } else if(oneD.sortField instanceof BigDecimal) {
        BigDecimal oneS = (BigDecimal) ((DetailObject) one).sortField;
        BigDecimal twoS = (BigDecimal) ((DetailObject) two).sortField;
        result = oneS.compareTo(twoS);
      }
      if (result == 0) {
        result = 1;
      }
    }
    else if(((DetailObject) one).sortField == null && ((DetailObject) two).sortField == null) {
      if (one.equals(two)) {
        result = 0;
      }
    }
    else if(one == null && two == null) {
      result = 0;
    }
    return result;
  }
  public String getUsername() {
    return username;
  }
  public void setUsername(String username) {
    this.username = username;
  }
  public int getDateOutputStyle() {
    return dateOutputStyle;
  }
  public void setDateOutputStyle(int dateOutputStyle) {
    this.dateOutputStyle = dateOutputStyle;
  }
  public boolean canRead() {
    return canRead;
  }
  public void canRead(boolean canRead) {
    this.canRead = canRead;
  }
  public boolean canUpdate() {
    return canUpdate;
  }
  public void canUpdate(boolean canUpdate) {
    this.canUpdate = canUpdate;
  }  public boolean canDelete() {
    return canDelete;
  }
  public void canDelete(boolean canDelete) {
    this.canDelete = canDelete;
  }
  
  public ConfigurationPlugin getPlugin(Connection con, String codeSecurityContext, String filter1, String filter2) {
  	PluginFactory factory = PluginFactory.getFactory(con);
    ClassLoader classloader = Thread.currentThread().getContextClassLoader();
  	Thread.currentThread().setContextClassLoader(getClass().getClassLoader());
    ConfigurationPlugin plugin = factory.getPlugin(codeSecurityContext, getClass().getName(), filter1, filter2);   
    Thread.currentThread().setContextClassLoader(classloader);
  	return plugin;
  }
  
  /**
   * This method copies over all the attributes from the input object to the object this method was called
   * from using the method's getters/setters. (Note: If an attribute is to be copied, it needs to have both a 
   * getter and a setter.) It will exclude certain attributes based on the setter/attribute annotations. If 
   * all the setter/attribute's annotations are located within the annotations list passed in, then the
   * attribute is copied.
   * <p>
   * <b>Example:</b> Let's say we have the following DetailObject:<br>
   * <pre>
   * public class Test extends DetailObject
   * {
   *   Integer idIdentityField;
   *   String testValue;
   *   
   *   public Integer getIdIdentityField() { return idIdentityField; }
   *   public &#64;Identity void setIdIdentityField(Integer idIdentityField) { this.idIdentityField = idIdentityField; }
   *   public String getTestValue() { return testValue; }
   *   public void setTestValue(String testValue) { this.testValue = testValue; }
   * }
   * </pre>
   * Now, in our command class if we want to copy all the fields except for those marked with the &#64;Identity 
   * annotation, we would do the following:
   * <pre>
   * ...
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, null);
   * ...
   * </pre>
   * If we want to copy all fields (including those marked with the &#64;Identity annotation), we could do the 
   * following:
   * <pre>
   * ...
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;();
   * annotations.add(hci.framework.utilities.Identity.class);
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, annotations);
   * 
   * @param input The DetailObject to copy fields from (must be of the same type as the class to copy to).
   */
  public void copyFieldsFrom(DetailObject input)
  {
    this.copyFieldsFrom(input, null);
  }
  
  /**
   * This method copies over all the attributes from the input object to the object this method was called
   * from using the method's getters/setters. (Note: If an attribute is to be copied, it needs to have both a 
   * getter and a setter.) It will exclude certain attributes based on the setter/attribute annotations. If 
   * all the setter/attribute's annotations are located within the annotations list passed in, then the
   * attribute is copied.
   * <p>
   * <b>Example:</b> Let's say we have the following DetailObject:<br>
   * <pre>
   * public class Test extends DetailObject
   * {
   *   Integer idIdentityField;
   *   String testValue;
   *   
   *   public Integer getIdIdentityField() { return idIdentityField; }
   *   public &#64;Identity void setIdIdentityField(Integer idIdentityField) { this.idIdentityField = idIdentityField; }
   *   public String getTestValue() { return testValue; }
   *   public void setTestValue(String testValue) { this.testValue = testValue; }
   * }
   * </pre>
   * Now, in our command class if we want to copy all the fields except for those marked with the &#64;Identity 
   * annotation, we would do the following:
   * <pre>
   * ...
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, null);
   * ...
   * </pre>
   * If we want to copy all fields (including those marked with the &#64;Identity annotation), we could do the 
   * following:
   * <pre>
   * ...
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;();
   * annotations.add(hci.framework.utilities.Identity.class);
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, annotations);
   * 
   * @param input The DetailObject to copy fields from (must be of the same type as the class to copy to).
   * @param verifyAnnotationsList This is the master list of annotations to compare against.
   */
  public void copyFieldsFrom(DetailObject input, List<Class<? extends Annotation>> verifyAnnotationsList)
  {
    this.copyFieldsFrom(input, verifyAnnotationsList, Annotations.ALL);
  }
  
  /**
   * This method copies over all the attributes from the input object to the object this method was called
   * from using the method's getters/setters. (Note: If an attribute is to be copied, it needs to have both a 
   * getter and a setter.) It only does a shallow copy only, and will not copy all the children objects of this
   * object. It will exclude certain attributes based on the setter/attribute annotations and the type of 
   * annotationLogic passed in:
   * 
   * <ul><li>ANNOTATIONS_ANY: This tests to see if any of the setter/attribute's annotations are located
   * within the annotations list passed in. If there is a match, then the attribute is copied.  
   * <li>ANNOTATIONS_ALL &lt;default&gt;: This tests to see if all of the setter/attribute's annotations are
   * located within the annotations list passed in. If there is a match then the attribute is copied.
   * <li>ANNOTATIONS_IGNORE: This method ignores annotations and copies all fields.</ul>
   * <p>
   * <b>Example:</b> Let's say we have the following DetailObject:<br>
   * <pre>
   * public class Test extends DetailObject
   * {
   *   Integer idIdentityField;
   *   String testValue;
   *   
   *   public Integer getIdIdentityField() { return idIdentityField; }
   *   public &#64;Identity void setIdIdentityField(Integer idIdentityField) { this.idIdentityField = idIdentityField; }
   *   public String getTestValue() { return testValue; }
   *   public void setTestValue(String testValue) { this.testValue = testValue; }
   * }
   * </pre>
   * Now, in our command class if we want to copy all the fields except for those marked with the &#64;Identity 
   * annotation, we would do the following:
   * <pre>
   * ...
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, null, DetailObject.ANNOTATIONS_ALL);
   * ...
   * </pre>
   * If we want to copy all fields (including those marked with the &#64;Identity annotation), we could do the 
   * following:
   * <pre>
   * ...
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;();
   * annotations.add(hci.framework.utilities.Identity.class);
   * Test test = new Test();
   * test.copyFieldsFrom(anotherTest, annotations, DetailObject.ANNOTATIONS_ALL);
   * 
   * @param input The DetailObject to copy fields from (must be of the same type as the class to copy to).
   * @param annotations This is the master list of annotations to compare against.
   * @param annotationLogic This is one of the ANNOTATION_X statics available in the framework.
   */
  public void copyFieldsFrom(DetailObject input, List<Class<? extends Annotation>> verifyAnnotationsList, int annotationLogic)
  {
    if (!canUpdate())
      return;
    
    Method[] methods = this.getClass().getMethods();
    if (methods == null)
      return;
    for(int i = 0; i < methods.length; i++)
    {
      String setMethodName = methods[i].getName();
      // Only copy if this is a set method...
      if (setMethodName.indexOf("set") == 0)
      {
        String getMethodName = "get" + setMethodName.substring(3);
        Method getMethod = null;
        try
        {
          getMethod = this.getClass().getMethod(getMethodName, (Class [])null);
        } catch (Exception e) { }
        
        // Only copy if it has a corresponding getter...
        if (getMethod != null)
        {
          try
          {
            // Only copy if the annotations can be verified...
            if (setMethodName.indexOf("set") == 0 && this.verifyAnnotations(setMethodName, ((getVerifyAnnotationsList() == null || getVerifyAnnotationsList().size() == 0)? 
              verifyAnnotationsList:getVerifyAnnotationsList()), annotationLogic))
            {
              methods[i].invoke(this, new Object[] {getMethod.invoke(input, (Object [])null)});
            }
          } catch (Exception e) { }
        }
      }
    }
  }
  
  //-------------------
  // Annotation Methods
  //-------------------
  
  /**
   * This method tests to see if the class has at least one java.lang.annotation.Annotation.
   * <p>
   * <b>Example:</b><br>
   * TumorRegPatient trPatient = new TumorRegPatient();<br>
   * trPatient.isAnnotated(); <br>
   * &#47;&#47;This returns true if the TumorRegPatient class has an annotation.
   * 
   * @return true if the class has at least one Annotation, false if it has no Annotations.
   * @throws ClassNotFoundException This gets thrown if the class can't be found.
   */
  public boolean isAnnotated() throws ClassNotFoundException
  {
    return Annotations.isAnnotated(this.getClass());
  }
  
  /**
   * This method tests to see if the method/attribute associated with this class has at least one 
   * java.lang.annotation.Annotation. The following rules apply:
   * <ul><li>All class annotations are passed down to the class' attributes and methods.</li>
   * <li>All attribute annotations are passed on to its associated getters/setters.</li>
   * <li>All getter annotations are passed up to its associated attribute. (However, they are not passed on to the
   * attribute's setter as well.)</li></ul>
   * <p>
   * <b>Example:</b><br>
   * Patient patient = new Patient();<br>
   * patient.isAnnotated("lastName"); <br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param attributeOrMethodName the name of the attribute or method within the desired class.
   * @return true if the attribute/method has at least one Annotation, false if it has no Annotations.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class.
   */
  public boolean isAnnotated(String attributeOrMethodName) throws ClassNotFoundException, IllegalArgumentException
  {
    return Annotations.isAnnotated(this.getClass(), attributeOrMethodName);
  }
  
  /**
   * This method tests to see if the class has the requested annotation
   * <p>
   * <b>Example:</b><br>
   * TumorRegPatient trPatient = new TumorRegPatient();<br>
   * trPatient.hasAnnotation(hci.framework.utilities.EMRTag.class);<br>
   * &#47;&#47;This returns true if the TumorRegPatient class is annotated with the &#64;EMRTag.
   * 
   * @param annotation the annotation to search for.
   * @return true if the class has the requested annotation, false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   */
  public boolean hasAnnotation(Class<? extends Annotation> annotation) throws ClassNotFoundException
  {
    return Annotations.hasAnnotation(this.getClass(), annotation);
  }
  
  /**
   * This method tests to see if the method/attribute associated with this class has the requested
   * java.lang.annotation.Annotation. The following rules apply:
   * <ul><li>All class annotations are passed down to the class' attributes and methods.</li>
   * <li>All attribute annotations are passed on to its associated getters/setters.</li>
   * <li>All getter annotations are passed up to its associated attribute. (However, they are not passed on to the
   * attribute's setter as well.)</li></ul>
   * <p>
   * <b>Example:</b>
   * Patient patient = new Patient();<br>
   * patient.hasAnnotation("lastName", hci.framework.utilitiex.IdentityTag.class);<br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated with the 
   * &#64IdentityTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param attributeOrMethodName the name of the attribute or method to test for the annotation on.
   * @param annotation the annotation to search for.
   * @return true if the attribute/method has the requested annotation, false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class.
   */
  public boolean hasAnnotation(String attributeOrMethodName, Class<? extends Annotation> annotation) throws ClassNotFoundException, IllegalArgumentException
  {
    return Annotations.hasAnnotation(this.getClass(), attributeOrMethodName, annotation);
  }
  
  /**
   * This method tests to see if all the class annotations are found within the given set of annotations.
   * <p> 
   * <b>Example:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * TumorRegPatient trPatient = new TumorRegPatient();<br>
   * trPatient.verifyAnnotations(annotations);<br>
   * &#47;&#47;This will return true if the class has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * 
   * @param verifyAnnotationsList This is the mast list of annotations to compare the class' annotation(s) against. 
   * @return true if there are no class annotations, or if the class' annotations are all found in the annotations
   * passed in; false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   */
  public boolean verifyAnnotations(List<Class<? extends Annotation>> verifyAnnotationsList) throws ClassNotFoundException
  {
    return verifyAnnotations(verifyAnnotationsList, Annotations.ALL);
  }
  
  /**
   * This method's logic differs based on the annotationLogic passed in:
   * <ul><li>ANY: This tests to see if the any of the class's annotations are located within the provided 
   * annotation list.
   * <li>ALL &lt;default&gt;: This tests to see if all of the class's annotations are located within the provided 
   * annotation list.
   * <li>IGNORE: This method will always return true.</ul>
   * <p>
   * <b>Example 1:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * TumorRegPatient trPatient = new TumorRegPatient();<br>
   * trPatient.verifyAnnotations(annotations, hci.framework.utilities.Annotations.ALL);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * <p>
   * <b>Example 2:</b> Using the same annotation list and object defined in Example 1...<br>
   * trPatient.verifyAnnotations(annotations, hci.framework.utilities.Annotations.ANY);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations; or has either &#64IdentityTag or &#64EMRTag. 
   * 
   * @param verifyAnnotationsList the list of annotations to compare the class' annotation(s) against. 
   * @param annotationLogic any of the defined hci.framework.utilities.Annotations constants described in the list above.
   * @return true or false based on the selected logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   */
  public boolean verifyAnnotations(List<Class<? extends Annotation>> verifyAnnotationsList, int annotationLogic) throws ClassNotFoundException
  {
    return Annotations.verifyAnnotations(this.getClass(), verifyAnnotationsList, annotationLogic);
  }
  
  /**
   * This method tests to see if all the method/attribute annotations are found within the given set of annotations.
   * The following rules apply:
   * <ul><li>All class annotations are passed down to the class' attributes and methods.</li>
   * <li>All attribute annotations are passed on to its associated getters/setters.</li>
   * <li>All getter annotations are passed up to its associated attribute. (However, they are not passed on to the
   * attribute's setter as well.)</li></ul>
   * <p> 
   * <b>Example:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * Patient patient = new Patient();<br>
   * patient.verifyAnnotations("lastName", annotations);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param verifyAnnotationsList This is the master list of annotations to compare against.
   * @return true or false based on the logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class.
   */
  public boolean verifyAnnotations(String attributeOrMethodName, List<Class<? extends Annotation>> verifyAnnotationsList) 
    throws ClassNotFoundException, IllegalArgumentException
  {
    return verifyAnnotations(attributeOrMethodName, verifyAnnotationsList, Annotations.ALL);
  }
  
  /**
   * This method's logic differs based on the annotationLogic passed in:
   * <ul><li>ANY: This tests to see if the any of the attribute/method's annotations are located within the provided 
   * annotation list.
   * <li>ALL &lt;default&gt;: This tests to see if all of the attribute/method's annotations are located within the 
   * provided annotation list.
   * <li>IGNORE: This method will always return true.</ul>
   * <p>
   * <b>Example 1:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * Patient patient = new Patient();<br>
   * patient.verifyAnnotations("lastName", annotations, hci.framework.utilities.Annotations.ALL);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * <b>Example 2:</b> Using the same object and annotation list defined in Example 1...<br>
   * patient.verifyAnnotations("lastName", annotations, hci.framework.utilities.Annotations.ANY);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations; or has either &#64IdentityTag or 
   * &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param verifyAnnotationsList the list of annotations to compare against.
   * @param annotationLogic any of the defined hci.framework.utilities.Annotations constants described in the list above.
   * @return true or false based on the logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class.
   */
  public boolean verifyAnnotations(String attributeOrMethodName, List<Class<? extends Annotation>> verifyAnnotationsList, int annotationLogic) 
    throws ClassNotFoundException, IllegalArgumentException
  {
    return Annotations.verifyAnnotations(this.getClass(), attributeOrMethodName, verifyAnnotationsList, annotationLogic);
  }
}