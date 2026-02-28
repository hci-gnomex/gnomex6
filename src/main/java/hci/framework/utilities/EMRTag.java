package hci.framework.utilities;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * This annotation indicates whether the class or method contains (or may contain)
 * data available in the patient's Medical Record (EMR). It is simply a marker 
 * annotation.
 * 
 * @author Jen Heninger-Potter
 * @created 10/28/2009
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface EMRTag { }
