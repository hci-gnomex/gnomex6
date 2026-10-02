package hci.gnomex.utility;

/**
 * A sample sheet could not be read. The message is intended to be shown to the user.
 */
public class SampleSheetException extends Exception {

    private static final long serialVersionUID = 1L;

    public SampleSheetException(String message) {
        super(message);
    }

    public SampleSheetException(String message, Throwable cause) {
        super(message, cause);
    }
}
