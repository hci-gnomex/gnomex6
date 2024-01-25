package hci.framework.utilities;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Optional;

import java.lang.reflect.*;
import java.lang.StackWalker;


/**
 * This class contains several static constants and methods that are used for DetailObject Annotations.
 * @author Jen Heninger
 * @created 11/16/2009
 */
public class Annotations
{
  //-------------------------------------------------------------------------------------------------------------
  // Constants
  //-------------------------------------------------------------------------------------------------------------
  
  /**
   * Using this flag changes the logic for verifyAnnotations(*) to test to see if any of the class/method/attribute
   * annotations are found in the list provided.
   */
  public static int ANY = 0;
  
  /**
   * &lt;default&gt; Using this flag for verifyAnnotations(*) tests to see if all of the class/method/attribute
   * annotations are found in the list provided.
   */
  public static int ALL = 1;
  
  /**
   * Using this flag will ignore all annotations on the class/method/attribute.
   */
  public static int IGNORE = 2;
  
  
  //-------------------------------------------------------------------------------------------------------------
  // Methods
  //-------------------------------------------------------------------------------------------------------------
  /**
   * This method tests to see if the class has at least one java.lang.annotation.Annotation.
   * <p>
   * <b>Example:</b><br>
   * Annotations.isAnnotated("hci.tumorreg.model.TumorRegPatient"); <br>
   * &#47;&#47;This returns true if the TumorRegPatient class has an annotation.
   * 
   * @param className the fully qualified name of the desired class.
   * @return true if the class has at least one Annotation, false if it has no Annotations.
   * @throws ClassNotFoundException This gets thrown if the class can't be found. This is also thrown if the class
   * hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if className is null.
   */
  public static boolean isAnnotated(String className) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use isAnnotated(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.isAnnotated(clazz);
  }
  
  /**
   * This method tests to see if the class has at least one java.lang.annotation.Annotation.
   * <p>
   * <b>Example:</b><br>
   * Annotations.isAnnotated(hci.tumorreg.model.TumorRegPatient.class); <br>
   * &#47;&#47;This returns true if the TumorRegPatient class has an annotation.
   * 
   * @param clazz the the desired class to test against.
   * @return true if the class has at least one Annotation, false if it has no Annotations.
   * @throws IllegalArgumentException This gets thrown if clazz is null.
   */
  public static boolean isAnnotated(Class<?> clazz) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use isAnnotated(*).");
    
    Annotation[] annotations = clazz.getAnnotations();
    if (annotations != null && annotations.length > 0)
      return true;
    return false;
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
   * Annotations.isAnnotated("hci.ccr.model.Patient", "lastName"); <br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param className the fully qualified name of the desired class.
   * @param attributeOrMethodName the name of the attribute or method within the desired class.
   * @return true if the attribute/method has at least one Annotation, false if it has no Annotations.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if the className or attributeOrMethodName are null.
   */
  public static boolean isAnnotated(String className, String attributeOrMethodName) throws ClassNotFoundException, IllegalArgumentException
  {    
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use isAnnotated(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.isAnnotated(clazz, attributeOrMethodName);
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
   * Annotations.isAnnotated(hci.ccr.model.Patient.class, "lastName"); <br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param clazz the type of the class.
   * @param attributeOrMethodName the name of the attribute or method within the desired class.
   * @return true if the attribute/method has at least one Annotation, false if it has no Annotations.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. It also gets thrown if clazz or attributeOrMethodName are null.
   */
  public static boolean isAnnotated(Class<?> clazz, String attributeOrMethodName) throws IllegalArgumentException
  {    
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use isAnnotated(*).");
    if (attributeOrMethodName == null)
      throw new IllegalArgumentException("The attribute or method name is required to use isAnnotated(*).");
    
    //---------------------
    // Get Attribute/Method
    //---------------------
    Object[] returnObject = Annotations.getAttributeAndMethod(attributeOrMethodName, clazz);
    Field field = (Field) returnObject[0];
    Method method = (Method) returnObject[1];
    
    // Let the user know that an invalid attribute or method name was passed...
    if (method == null && field == null)
      throw new IllegalArgumentException("The attribute or method name (" + attributeOrMethodName + ") that was passed into " + 
        "Annotations.isAnnotated(*) doesn't exist in the " + clazz.getName() + " class.");
    
    //--------------------
    // Test for Annotation
    //--------------------
    // Is the class annotated?
    boolean isAnnotated = false;
    Annotation[] annotations = clazz.getAnnotations();
    if (annotations != null && annotations.length > 0)
      isAnnotated = true;
    
    // Is the method annotated?
    if (method != null && !isAnnotated)
    {
      annotations = method.getAnnotations();
      if (annotations != null && annotations.length > 0)
        isAnnotated = true;
    }
    
    // Is the attribute annotated?
    if (field != null && !isAnnotated)
    {
      annotations = field.getAnnotations();
      if (annotations != null && annotations.length > 0)
        isAnnotated = true;
    }
    
    return isAnnotated;
  }
  
  /**
   * This method tests to see if the class has the requested annotation
   * <p>
   * <b>Example:</b><br>
   * Annotations.hasAnnotation("hci.tumorreg.model.TumorRegPatient", hci.framework.utilities.EMRTag.class); <br>
   * &#47;&#47;This returns true if the TumorRegPatient class is annotated with the &#64;EMRTag.
   * 
   * @param className the fully qualified name of the desired class.
   * @param annotation the annotation to search for.
   * @return true if the class has the requested annotation, false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if className is null.
   */
  public static boolean hasAnnotation(String className, Class<? extends Annotation> annotation) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use hasAnnotation(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return clazz.isAnnotationPresent(annotation);
  }
  
  /**
   * This method tests to see if the class has the requested annotation
   * <p>
   * <b>Example:</b><br>
   * Annotations.hasAnnotation(hci.tumorreg.model.TumorRegPatient.class, hci.framework.utilities.EMRTag.class); <br>
   * &#47;&#47;This returns true if the TumorRegPatient class is annotated with the &#64;EMRTag.
   * 
   * @param clazz the desired class to test.
   * @param annotation the annotation to search for.
   * @return true if the class has the requested annotation, false otherwise.
   * @throws IllegalArgumentException This gets thrown if clazz is null.
   */
  public static boolean hasAnnotation(Class<?> clazz, Class<? extends Annotation> annotation) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use hasAnnotation(*).");
    
    return clazz.isAnnotationPresent(annotation);
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
   * Annotations.hasAnnotation("hci.ccr.model.Patient", "lastName", hci.framework.utilities.IdentityTag.class);<br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated with the 
   * &#64IdentityTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param className the fully qualified name of the desired class.
   * @param attributeOrMethodName the name of the attribute or method to test for the annotation on.
   * @param annotation the annotation to search for.
   * @return true if the attribute/method has the requested annotation, false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if className or attributeOrMethodName are null.
   */
  public static boolean hasAnnotation(String className, String attributeOrMethodName, Class<? extends Annotation> annotation) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use hasAnnotation(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.hasAnnotation(clazz, attributeOrMethodName, annotation);
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
   * Annotations.hasAnnotation(hci.ccr.model.Patient.class, "lastName", hci.framework.utilities.IdentityTag.class);<br>
   * &#47;&#47;This returns true if the Patient class, Patient.lastName or Patient.getLastName() is annotated with the 
   * &#64IdentityTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param clazz the type of the class
   * @param attributeOrMethodName the name of the attribute or method to test for the annotation on.
   * @param annotation the annotation to search for.
   * @return true if the attribute/method has the requested annotation, false otherwise.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. It also gets thrown if clazz or attributeOrMethodName are null.
   */
  public static boolean hasAnnotation(Class<?> clazz, String attributeOrMethodName, Class<? extends Annotation> annotation) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use hasAnnotation(*).");
    if (attributeOrMethodName == null)
      throw new IllegalArgumentException("The attribute or method name is required to use hasAnnotation(*).");
    
    //---------------------
    // Get Attribute/Method
    //---------------------
    Object[] returnObject = Annotations.getAttributeAndMethod(attributeOrMethodName, clazz);
    Field field = (Field) returnObject[0];
    Method method = (Method) returnObject[1];
    
    // Let the user know that an invalid attribute or method name was passed...
    if (method == null && field == null)
      throw new IllegalArgumentException("The attribute or method name (" + attributeOrMethodName + ") that was passed into " + 
        "Annotations.hasAnnotation(*) doesn't exist in the " +  clazz.getName() +  " class.");
    
    //--------------------
    // Test for Annotation
    //--------------------
    // Does the class have the annotation?
    boolean hasAnnotation = clazz.isAnnotationPresent(annotation);
    
    // Does the method have the annotation?
    if (method != null && !hasAnnotation)
      hasAnnotation = method.isAnnotationPresent(annotation);
    
    // Does the field have the annotation?
    if (field != null && !hasAnnotation)
      hasAnnotation = field.isAnnotationPresent(annotation);
    
    return hasAnnotation;
  }
  
  /**
   * This method tests to see if all the class annotations are found within the given set of annotations.
   * <p> 
   * <b>Example:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * Annotations.verifyAnnotations("hci.tumorreg.model.TumorRegPatient", annotations);<br>
   * &#47;&#47;This will return true if the class has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * 
   * @param className the fully qualified name of the desired class.
   * @param annotations This is the mast list of annotations to compare the class' annotation(s) against. 
   * @return true if there are no class annotations, or if the class' annotations are all found in the annotations
   * passed in; false otherwise.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if className is null.
   */
  public static boolean verifyAnnotations(String className, List<Class<? extends Annotation>> annotations) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use verifyAnnotations(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.verifyAnnotations(clazz, annotations);
  }
  
  /**
   * This method tests to see if all the class annotations are found within the given set of annotations.
   * <p> 
   * <b>Example:</b> <br>
   * List&lt;Class&lt;Annotation&gt;&gt; annotations = new ArrayList&lt;Class&lt;Annotation&gt;&gt;;<br>
   * annotations.add(hci.framework.utilities.IdentityTag);<br>
   * annotations.add(hci.framework.utilities.EMRTag);<br>
   * Annotations.verifyAnnotations(hci.tumorreg.model.TumorRegPatient.class, annotations);<br>
   * &#47;&#47;This will return true if the class has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * 
   * @param clazz the desired class to test.
   * @param annotations This is the mast list of annotations to compare the class' annotation(s) against. 
   * @return true if there are no class annotations, or if the class' annotations are all found in the annotations
   * passed in; false otherwise.
   * @throws IllegalArgumentException This gets thrown if clazz is null.
   */
  public static boolean verifyAnnotations(Class<?> clazz, List<Class<? extends Annotation>> annotations) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use verifyAnnotations(*).");

    return Annotations.verifyAnnotations(clazz.getAnnotations(), annotations, Annotations.ALL);
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
   * Annotations.verifyAnnotations("hci.tumorreg.model.TumorRegPatient", annotations, Annotations.ALL);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * <p>
   * <b>Example 2:</b> Using the same annotation list defined in Example 1...<br>
   * Annotations.verifyAnnotations("hci.tumorreg.model.TumorRegPatient", annotations, Annotations.ANY);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations; or has either &#64IdentityTag or &#64EMRTag. 
   * 
   * @param className the fully qualified name of the desired class.
   * @param annotations the list of annotations to compare the class' annotation(s) against. 
   * @param annotationLogic any of the defined constants described in the list above.
   * @return true or false based on the selected logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if className is null.
   */
  public static boolean verifyAnnotations(String className, List<Class<? extends Annotation>> annotations, int annotationLogic) 
    throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use verifyAnnotations(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.verifyAnnotations(clazz, annotations, annotationLogic);
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
   * Annotations.verifyAnnotations(hci.tumorreg.model.TumorRegPatient.class, annotations, Annotations.ALL);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations, has the &#64IdentityTag, or both &#64IdentityTag 
   * and &#64EMRTag
   * <p>
   * <b>Example 2:</b> Using the same annotation list defined in Example 1...<br>
   * Annotations.verifyAnnotations(hci.tumorreg.model.TumorRegPatient.class, annotations, Annotations.ANY);<br>
   * &#47;&#47;This will return true if TumorRegPatient has no annotations; or has either &#64IdentityTag or &#64EMRTag. 
   * 
   * @param clazz the desired class to test.
   * @param annotations the list of annotations to compare the class' annotation(s) against. 
   * @param annotationLogic any of the defined constants described in the list above.
   * @return true or false based on the selected logic described in the list above.
   * @throws IllegalArgumentException This gets thrown if clazz is null.
   */
  public static boolean verifyAnnotations(Class<?> clazz, List<Class<? extends Annotation>> annotations, int annotationLogic) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use verifyAnnotations(*).");
    
    return Annotations.verifyAnnotations(clazz.getAnnotations(), annotations, annotationLogic);
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
   * Annotations.verifyAnnotations("hci.ccr.model.Patient", "lastName", annotations);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param className the fully qualified name of the desired class.
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param annotations This is the master list of annotations to compare against.
   * @return true or false based on the logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. This also gets thrown if className or attributeOrMethodName are null.
   */
  public static boolean verifyAnnotations(String className, String attributeOrMethodName, List<Class<? extends Annotation>> annotations) 
    throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use verifyAnnotations(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.verifyAnnotations(clazz, attributeOrMethodName, annotations, Annotations.ALL);
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
   * Annotations.verifyAnnotations(hci.ccr.model.Patient.class, "lastName", annotations);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param clazz the type of the class.
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param annotations This is the master list of annotations to compare against.
   * @return true or false based on the logic described in the list above.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. This also gets thrown if clazz or attributeOrMethodName are null.
   */
  public static boolean verifyAnnotations(Class<?> clazz, String attributeOrMethodName, List<Class<? extends Annotation>> annotations) 
    throws IllegalArgumentException
  {
    return Annotations.verifyAnnotations(clazz, attributeOrMethodName, annotations, Annotations.ALL);
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
   * Annotations.verifyAnnotations("hci.ccr.model.Patient", "lastName", annotations, Annotations.ALL);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * <b>Example 2:</b> Using the same annotation list defined in Example 1...<br>
   * Annotations.verifyAnnotations("hci.ccr.model.Patient", "lastName", annotations, Annotations.ANY);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations; or has either &#64IdentityTag or 
   * &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param className the fully qualified name of the desired class.
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param annotations the list of annotations to compare against.
   * @param annotationLogic any of the constants described in the list above.
   * @return true or false based on the logic described in the list above.
   * @throws ClassNotFoundException This gets thrown if the current class can't be found. This is also thrown if the 
   * class hasn't implemented the default, no argument, constructor.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. This also gets thrown if className or attributeOrMethodName are null.
   */
  public static boolean verifyAnnotations(String className, String attributeOrMethodName, List<Class<? extends Annotation>> annotations, 
    int annotationLogic) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use verifyAnnotations(*).");
    
    Class<?> clazz = Annotations.forName(className);
    return Annotations.verifyAnnotations(clazz, attributeOrMethodName, annotations, annotationLogic);
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
   * Annotations.verifyAnnotations(hci.ccr.model.Patient.class, "lastName", annotations, Annotations.ALL);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations, has the &#64IdentityTag, or both 
   * &#64IdentityTag and &#64EMRTag.
   * <p>
   * <b>Example 2:</b> Using the same annotation list defined in Example 1...<br>
   * Annotations.verifyAnnotations(hci.ccr.model.Patient.class, "lastName", annotations, Annotations.ANY);<br>
   * &#47;&#47;This will return true if the "lastName" attribute has no annotations; or has either &#64IdentityTag or 
   * &#64EMRTag.
   * <p>
   * Assumption: If the method has been overloaded, all of the signatures for that method have the same set of
   * annotations.
   * 
   * @param clazz the desired class to test.
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param annotations the list of annotations to compare against.
   * @param annotationLogic any of the constants described in the list above.
   * @return true or false based on the logic described in the list above.
   * @throws IllegalArgumentException This gets thrown if the attribute or method name passed in wasn't found in
   * this class. This also gets thrown if clazz or attributeOrMethodName are null.
   */
  public static boolean verifyAnnotations(Class<?> clazz, String attributeOrMethodName, List<Class<? extends Annotation>> annotations, 
    int annotationLogic) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use verifyAnnotations(*).");
    if (attributeOrMethodName == null)
      throw new IllegalArgumentException("The attribute or method name is required to use verifyAnnotations(*).");
    if (annotationLogic == Annotations.IGNORE)
      return true;
      
    //---------------------
    // Get Attribute/Method
    //---------------------
    Object[] returnObject = Annotations.getAttributeAndMethod(attributeOrMethodName, clazz);
    Field field = (Field) returnObject[0];
    Method method = (Method) returnObject[1];
    
    // Let the user know that an invalid attribute or method name was passed...
    if (method == null && field == null)
      throw new IllegalArgumentException("The attribute or method name (" + attributeOrMethodName + ") that was passed into " + 
        "Annotations.VerifyAnnotations(*) doesn't exist in the " + clazz.getName() + " class.");
    
    //--------------------
    // Test for Annotation
    //--------------------
    // Construct a master annotation list
    Set<Annotation> attributeOrMethodAnnotations = new HashSet<Annotation>();
    
    // Add class annotations
    if (clazz.getAnnotations() != null)
    {
      for (int i = 0; i < clazz.getAnnotations().length; i++)
        attributeOrMethodAnnotations.add(clazz.getAnnotations()[i]);
    }
    
    // Add method annotations
    if (method != null && method.getAnnotations() != null)
    {
      for (int i = 0; i < method.getAnnotations().length; i++)
        attributeOrMethodAnnotations.add(method.getAnnotations()[i]);
    }
    
    // Add field annotations
    if (field != null && field.getAnnotations() != null)
    {
      for (int i = 0; i < field.getAnnotations().length; i++)
        attributeOrMethodAnnotations.add(field.getAnnotations()[i]);
    }
    
    Annotation[] verifyAnnotations = attributeOrMethodAnnotations.toArray(new Annotation[0]);
    
    // Return the result
    return Annotations.verifyAnnotations(verifyAnnotations, annotations, annotationLogic);
  }
  
  // Support Methods --------------------------------------------------------------------------------------------
  /**
   * This method tries to get the attribute and/or method for the given attributeOrMethodName and returns it in
   * the method and field parameters. (Note: If the method is a getter/setter, and the attribute exists, then the 
   * associated attribute is returned as well. Also, if the object is an attribute, and it has an associated getter, 
   * then the method is returned as well.)
   * 
   * @param attributeOrMethodName the name of the attribute or method to test for annotations on.
   * @param clazz the type of the class that the attribute or method belongs in.
   * @return Object[2]: Object[0] = attribute, Object[1] = method. (If the method was found and an attribute was 
   * associated with it, then both objects are returned. If the attribute was found and a getter was associated with 
   * it, then both objects are returned. Otherwise, only an attribute or method is returned.)
   * @throws IllegalArgumentException This gets thrown if attributeOrMethodName or clazz are null.
   */
  private static Object[] getAttributeAndMethod(String attributeOrMethodName, Class<?> clazz) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use getAttributeAndMethod(*).");
    if (attributeOrMethodName == null)
      throw new IllegalArgumentException("The attributeOrMethodName is required to use getAttributeAndMethod(*).");
    
    Field field = null;
    Method method = null;
    String fieldName = null;
    String methodName = null;
    
    // First pretend that this is an attribute and try to get the attribute & it's getter
    try
    {
      field = Annotations.getAttribute(clazz, attributeOrMethodName);
      if (field != null)
      {
        fieldName = attributeOrMethodName;
        methodName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
        method = Annotations.getMethod(field.getDeclaringClass(), methodName);
        if (method == null)
          methodName = null;
      }
    }
    catch (Exception e) {}
    
    // If we weren't successful, then try to get the method. 
    // If that method is a getter or setter, then try to get it's attribute.
    if (field == null && method == null)
    {
      try
      {
        method = Annotations.getMethod(clazz, attributeOrMethodName);
        if (method != null)
        {
          methodName = attributeOrMethodName;
          fieldName = method.getName().substring(3,4).toLowerCase() + method.getName().substring(4);
          field = Annotations.getAttribute(method.getDeclaringClass(), fieldName);
          if (field == null)
            fieldName = null;
        }
      }
      catch (Exception e) { }
    }
    
    Object[] returnObject = new Object[2];
    returnObject[0] = field;
    returnObject[1] = method;
    return returnObject;
  }
  
  /**
   * This method was required because we don't know what the parameter set is going to be. It searches
   * the class' set of methods for the first method that has a matching methodName and returns the result.
   * (Note: It searches both public methods that are declared in the class and those that are inherited.
   * If a method isn't found in that set, then it searches private/protected methods declared in the class.)
   * 
   * @param clazz the class the method is in.
   * @param methodName the name of the method to retrieve
   * @return the first method with that name that was found
   * @throws IllegalArgumentException This is returned if clazz or methodName are null.
   */
  private static Method getMethod(Class<?> clazz, String methodName) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use getMethod(*).");
    if (methodName == null)
      throw new IllegalArgumentException("The methodName is required to use getMethod(*).");
    
    // First try to get a public method declared in the class or inherited from a super class.
    Method[] methods = clazz.getMethods();
    Method method = null;
    if (methods != null)
    {
      for (int i = 0; i < methods.length && method == null; i++)
      {
        if(methods[i].getName().equals(methodName))
          method = methods[i];
      }
    }
    
    // If that didn't work, try to get a private/protected method declared in the class.
    if (method == null)
    {
      methods = clazz.getDeclaredMethods();
      if (methods != null)
      {
        for (int i = 0; i < methods.length && method == null; i++)
        {
          if (methods[i].getName().equals(methodName))
            method = methods[i];
        }
      }
    }
    
    return method;
  }
  
  /**
   * This method is used to search the class' set of public attributes for the first one that has a matching
   * attributeName. If a public attribute wasn't found in the class (or were inherited by the class), then
   * it searches the class' set of private/protected attributes for the first one that has a matching
   * attributeName.
   * 
   * @param clazz the class the attribute is in
   * @param attributeName the name of the attribute to retrieve
   * @return the first attribute with that name that was found
   * @throws IllegalArgumentException This is returned if clazz or attributeName are null.
   */
  private static Field getAttribute(Class<?> clazz, String attributeName) throws IllegalArgumentException
  {
    if (clazz == null)
      throw new IllegalArgumentException("The class is required to use getAttribute(*).");
    if (attributeName == null)
      throw new IllegalArgumentException("The attributeName is required to use getAttribute(*).");
    
    // First try to get a public attribute declared in the class or inherited from a super class.
    Field attribute = null;
    try
    {
      attribute = clazz.getField(attributeName);
    } catch (Exception e) { }
    
    // If that didn't work, try to get a private/protected attribute declared in the class.
    if (attribute == null)
    {
      try
      {
        attribute = clazz.getDeclaredField(attributeName);
      } catch (Exception e) { }
    }
    
    return attribute;
  }
  
  /**
   * This method's logic differs based on the annotationLogic passed in:
   * <ul><li>ANY: This tests to see if any of the verifyAnnotations are found in the masterAnnotations list.
   * <li>ALL &lt;default&gt;: This tests to see if all the verifyAnnotations are located within the 
   * masterAnnotations list.
   * <li>IGNORE: This method will always return true.</ul>
   * 
   * @param verifyAnnotations an array of annotations to verify against masterAnnotations.
   * @param masterAnnotations the list of master annotations to see if verifyAnnotations is within.
   * @param annotationLogic one of the constants defined in the list above.
   * @return true or false based on the requested annotation logic described above.
   */
  private static boolean verifyAnnotations(Annotation[] verifyAnnotations, List<Class<? extends Annotation>> masterAnnotations, int annotationLogic)
  {
    // If there are no annotations to verify, then they are contained within the master annotation list.
    if (verifyAnnotations == null || verifyAnnotations.length == 0 || annotationLogic == Annotations.IGNORE)
      return true;
    
    // ANY: Test to see if any of the verifyAnnotations are found in the masterAnnotations list.
    boolean matchesAnnotation = false;
    if (annotationLogic == Annotations.ANY && masterAnnotations != null)
    {
      for (int i = 0; i < verifyAnnotations.length; i++)
      {
        Class<? extends Annotation> annotationClass = verifyAnnotations[i].annotationType();
        if (masterAnnotations.contains(annotationClass))
          matchesAnnotation = true;
      }
    }
    
    // ALL: Test to see that all of the verifyAnnotations are found in the masterAnnotations list.
    else if (annotationLogic == Annotations.ALL && masterAnnotations != null)
    {
      int countMatches = 0;
      for (int i = 0; i < verifyAnnotations.length; i++)
      {
        Class<? extends Annotation> annotationClass = verifyAnnotations[i].annotationType();
        if (masterAnnotations.contains(annotationClass))
          countMatches++;
      }
      if (countMatches == verifyAnnotations.length)
        matchesAnnotation = true;
    }
    
    return matchesAnnotation;
  }
  
  /**
   * This class is used instead of Class.forName(String) because there is a bug that won't find the appropriate
   * class loader if forName(*) was called from a static method in a non-instantiated class. This method finds 
   * the appropriate class loader and passes it on to Class.forName(String, boolean, ClassLoader) to get the
   * proper result.
   * 
   * @param className the name of the class to retrieve.
   * @return the class that was found.
   * @throws ClassNotFoundException If the class wasn't found using any of the ClassLoader's in the stack trace.
   * @throws IllegalArgumentException If className is null.
   */

  private static Class<?> forName(String className) throws ClassNotFoundException, IllegalArgumentException
  {
    if (className == null)
      throw new IllegalArgumentException("The class name is required to use Annotations.forName(*).");

    try
    {
    Optional<Class<?>> callerClass = null;
    StackWalker walker = StackWalker.getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE);
    callerClass = walker.walk(s ->
            s.map(StackWalker.StackFrame::getDeclaringClass)
                    .filter(className::equals)
                    .findFirst());
      Class<?> clazz = callerClass.orElse(null);
      if (clazz != null)
        return clazz;
      else   throw new ClassNotFoundException(className);

  } catch (Exception ex) {}

// If we didn't find it, then it probably doesn't exist.

            throw new ClassNotFoundException(className);

//            return callerClass;
            }

/*
    // Get the current stack trace
    Exception e = new Exception();
    StackTraceElement[] ste = e.getStackTrace();
    Class<?> clazz = null;
    
    // Loop through the stack trace to find a classLoader that has the class 
    // (no need to start with this class (2) or the sun.reflect.Reflection class (1), so we'll start at 3 (the class that called this class))
    for (int i = 3; i < ste.length && clazz == null; i++)
    {

      try
      {
        Class<?> classElement = Reflection.getCallerClass(i);
        if(classElement != null) {
          ClassLoader classLoader = classElement.getClassLoader();
          clazz = Class.forName(className, true, classLoader);
        }
      } catch (Exception ex) {}
    }
    
    // If we didn't find it, then it probably doesn't exist.
    if (clazz == null)
      throw new ClassNotFoundException(className);
    
    return clazz;
  }
*/
}
