package hci.framework.utilities;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * This annotation indicates whether the class or method is excluded from XML.
 * <p>
 * Assumption: This tag will never be included in an annotation list for copy/display.
 * @author Jen Heninger-Potter
 * @created 11/2/2009
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcludeTag { }
