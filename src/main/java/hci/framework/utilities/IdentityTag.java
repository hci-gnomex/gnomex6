package hci.framework.utilities;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * This annotation indicates whether the class or method contains (or may contain)
 * Protected Health Information (PHI). It is simply a marker annotation.
 * 
 * @author Jen Heninger-Potter
 * @created 10/28/2009
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface IdentityTag { }
