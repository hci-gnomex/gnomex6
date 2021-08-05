package hci.gnomex.security.tomcat;
import hci.gnomex.utility.TomcatCatalinaProperties;

import java.io.File;
import java.io.FileInputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Properties;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.naming.Context;
import javax.sql.DataSource;

import org.apache.tomcat.jdbc.pool.DataSourceFactory;
import org.apache.tomcat.jdbc.pool.PoolConfiguration;
import org.apache.tomcat.jdbc.pool.XADataSource;
import org.apache.log4j.Logger;
public class EncryptedDataSourceFactory extends DataSourceFactory {       
  private static Logger LOG = Logger.getLogger(EncryptedDataSourceFactory.class);
  
  private static TomcatCatalinaProperties catalinaProperties = null;
  
  public EncryptedDataSourceFactory() {         
  }       
  
  @Override    
  public DataSource createDataSource(Properties properties, Context context, boolean XA) throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException, SQLException, NoSuchAlgorithmException, NoSuchPaddingException {
    org.apache.tomcat.jdbc.pool.DataSource dataSource = null;

 // System.out.println ("[EncryptedDSF] start");
    try {
      if (catalinaProperties == null) {
        synchronized(this) {
          if (catalinaProperties == null) {
            String catalinaPath = System.getProperty("catalina.base") + "/conf/catalina.properties";
//            System.out.println ("[EncryptedDSF] catalinaPath: " + catalinaPath);

            catalinaProperties = new TomcatCatalinaProperties(catalinaPath);
          }
        }
      }

//      System.out.println ("[EncryptedDSF] catalinaProperties: " + catalinaProperties.toString());
      if (catalinaProperties.getTomcatPropertyToken(TomcatCatalinaProperties.GNOMEX_AES_KEY) == null) {
//        System.out.println ("[EncryptedDSF] GNOMEX_AES_KEY: is null");
        LOG.error("Unable to get key property in EncryptedDataSourceFactory class");
      }
      
      // Here we decrypt our password.
 //     System.out.println ("[EncryptedDSF] properties: " + properties.toString());

      PoolConfiguration poolProperties = EncryptedDataSourceFactory.parsePoolProperties(properties);
//      System.out.println ("[EncryptedDSF] poolProperties: " + poolProperties.toString());

      poolProperties.setPassword(catalinaProperties.decryptPassword(poolProperties.getPassword()));

      // The rest of the code is copied from Tomcat's DataSourceFactory.         
      if (poolProperties.getDataSourceJNDI() != null && poolProperties.getDataSource() == null) {             
        performJNDILookup(context, poolProperties);         
      }         
      dataSource = XA ? new XADataSource(poolProperties) : new org.apache.tomcat.jdbc.pool.DataSource(poolProperties);         
//System.out.println ("[EncryptedDSF] after dataSource= line 62");
      dataSource.createPool();
    } catch(Exception e) {
      LOG.fatal("Error from EncryptedDataSourceFactory class.", e);
      throw new RuntimeException(e);         
    }     
    return dataSource;     
  }   
} 
