package hci.framework.control;

/**
 *  An exception that will cause the executing command to roll back the transaction
 *
 *@author     Kirt Henrie
 *@created    August 18, 2002
 *@version    1.0
 */

public class RollBackCommandException extends Exception {

  private String error;

  /**
   *  Constructor for the RollBackCommandException object
   */
  public RollBackCommandException() {
    super();
  }

  /**
   *  Constructor for the RollBackCommandException object
   */
  public RollBackCommandException(String message) {
    super(message);
    this.error = message;
  }

  /** {@inheritDoc} */
  public RollBackCommandException( String msg, Throwable e ) {
    super(msg, e);
  }

  /** {@inheritDoc} */
  public RollBackCommandException( Throwable e ) {
    super(e);
  }


  public String getError() {
    return error;
  }
  public void setError(String error) {
    this.error = error;
  }

}
