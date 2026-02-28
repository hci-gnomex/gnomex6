package hci.framework.utilities;

/**
 * <p>Title: </p>
 * <p>Description: </p>
 * <p>Copyright: Copyright (c) </p>
 * <p>Company: HCI Informatics</p>
 * @author unascribed
 * @version 1.0
 */


import hci.utility.server.JNDILocator;
import hci.utility.server.ResourceNames;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

import javax.ejb.EJBException;
import javax.naming.NamingException;

/**
 *  Description of the Class
 *
 *@author     Kirt Henrie
 *@created    April 16, 2002
 */
public class UIDServer implements ResourceNames {
  private static UIDServer uidServer;


  private UIDServer() { }


  /**
   *  Gets the uIDServer attribute of the UIDServer class
   *
   *@return    The uIDServer value
   */
  public static UIDServer getUIDServer() {
    if (uidServer == null) {
      uidServer = new UIDServer();
    }
    return uidServer;
  }


  /**
   *  Gets the uID attribute of the UIDServer object
   *
   *@param  table  Description of the Parameter
   *@param  datasource The datasource for the connection
   *@return        The uID value
   */
  public int getUID(String table, String datasource) {
    int id = 0;

    ResultSet rs = null;
    CallableStatement stmt = null;
    //Statement stmt = null;
    Connection con = null;

    try {
      con = getConnection(datasource);

      stmt = con.prepareCall("{ call dbo.pr_GetNextKey(?, ?, ?) }");

      stmt.setString(1, table);
      stmt.setInt(2, 0);
      stmt.setInt(3, 0);
      stmt.registerOutParameter(2, Types.INTEGER);

      stmt.executeUpdate();

      id = stmt.getInt(2);

    } catch (SQLException se) {
      se.printStackTrace();
    } finally {
      try {
        if (con != null && !con.isClosed()) {
          con.close();
        }
      } catch (SQLException se) {
        se.printStackTrace();
      }
    }

    return id;
  }


  private Connection getConnection(String datasource) {
    Connection con = null;
    try {
      con = JNDILocator.getJNDILocator().getDataSource(datasource).getConnection();
    } catch (NamingException ne) {
      ne.printStackTrace();
      throw new EJBException(ne);
    } catch (SQLException se) {
      se.printStackTrace();
      throw new EJBException(se);
    }
    return con;
  }
}
