package hci.framework.utilities;

/**
 *  HCI Application Framework Description: A collection of classes for
 *  developing HTML based enterprise applications Copyright: Copyright (c) 2001
 *  Company: HCI Informatics
 *
 *@author     Kirt Henrie
 *@created    August 17, 2002
 *@version    1.0
 */

/**
 *  A marker that can be used to prevent entity beans from storing clean data to
 *  the database in the ejbStore method, it is also a base interface for the
 *  dependant to store its state status to prevent its aggregator entity bean
 *  from storing it if the data is clean
 *
 *@author     Kirt Henrie
 *@created    August 17, 2002
 */
public interface DirtyMarker {
  /**
   *  Sets the dirty attribute of the DirtyMarker object
   */
  public void setDirty();


  /**
   *  Gets the dirty attribute of the DirtyMarker object
   *
   *@return    The dirty value
   */
  public boolean isDirty();


  /**
   *  Description of the Method
   */
  public void clearDirty();


  /**
   *  Sets the remove attribute of the DirtyMarker object
   */
  public void setRemove();


  /**
   *  Gets the remove attribute of the DirtyMarker object
   *
   *@return    The remove value
   */
  public boolean isRemove();


  /**
   *  Description of the Method
   */
  public void clearRemove();
}
