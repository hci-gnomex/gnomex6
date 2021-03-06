
package hci.gnomex.model;

import java.io.Serializable;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

import org.hibernate.Hibernate;
import org.hibernate.Session;

import hci.dictionary.model.DictionaryEntry;
import hci.gnomex.controller.DeletePriceCategory;
import org.jdom.Element;

public class Property extends DictionaryEntry
implements Serializable, OntologyEntry, DictionaryEntryUserOwned {

  private Integer idProperty;
  private String  name;
  private String  description;
  private String  mageOntologyCode;
  private String  mageOntologyDefinition;
  private String  isActive;
  private Integer idAppUser;
  private String  codePropertyType;
  private String  isRequired;
  private String  forSample;
  private String  forAnalysis;
  private String  forDataTrack;
  private String  forRequest;
  private Integer sortOrder;
  private Integer idCoreFacility;
  private Integer idPriceCategory;
  private Set     options              = new TreeSet();
  private Set     organisms            = new TreeSet();
  private Set     appUsers             = new TreeSet();
  private Set     platformApplications = new TreeSet();
  private Set     analysisTypes        = new TreeSet();



  public Set getAnalysisTypes() {
    return analysisTypes;
  }


  public void setAnalysisTypes( Set analysisTypes ) {
    this.analysisTypes = analysisTypes;
  }


  public String getDisplay() {
    String display = this.getNonNullString( getName() );
    return display;
  }


  public String getValue() {
    return getIdProperty().toString();
  }


  public String getName() {
    return name;
  }


  public void setName( String name ) {
    this.name = name;
  }


  public String getMageOntologyCode() {
    return mageOntologyCode;
  }


  public void setMageOntologyCode( String mageOntologyCode ) {
    this.mageOntologyCode = mageOntologyCode;
  }


  public String getMageOntologyDefinition() {
    return mageOntologyDefinition;
  }


  public void setMageOntologyDefinition( String mageOntologyDefinition ) {
    this.mageOntologyDefinition = mageOntologyDefinition;
  }


  public String getIsActive() {
    return isActive;
  }


  public void setIsActive( String isActive ) {
    this.isActive = isActive;
  }


  public Integer getIdAppUser() {
    return idAppUser;
  }


  public void setIdAppUser( Integer idAppUser ) {
    this.idAppUser = idAppUser;
  }


  public Set getOptions() {
    return this.options;
  }


  public void setOptions( Set options ) {
    this.options = options;
  }


  public String getCodePropertyType() {
    return codePropertyType;
  }


  public void setCodePropertyType( String codePropertyType ) {
    this.codePropertyType = codePropertyType;
  }


  public Set getOrganisms() {
    return organisms;
  }


  public void setOrganisms( Set organisms ) {
    this.organisms = organisms;
  }


  public Set getAppUsers() {
    return appUsers;
  }


  public void setAppUsers( Set appUsers ) {
    this.appUsers = appUsers;
  }


  public Integer getIdProperty() {
    return idProperty;
  }


  public void setIdProperty( Integer idProperty ) {
    this.idProperty = idProperty;
  }


  public String getCanRead() {
    if( this.canRead() ) {
      return "Y";
    } else {
      return "N";
    }
  }


  public String getCanUpdate() {
    if( this.canUpdate() ) {
      return "Y";
    } else {
      return "N";
    }
  }


  public String getCanDelete() {
    if( this.canDelete() ) {
      return "Y";
    } else {
      return "N";
    }
  }


  public String getDescription() {
    return description;
  }


  public void setDescription( String description ) {
    this.description = description;
  }


  public Set getPlatformApplications() {
    return platformApplications;
  }


  public void setPlatformApplications( Set platformApplications ) {
    this.platformApplications = platformApplications;
  }


  public String getIsRequired() {
    return isRequired;
  }


  public void setIsRequired( String isRequired ) {
    this.isRequired = isRequired;
  }


  public String getForSample() {
    return forSample;
  }


  public String getForAnalysis() {
    return forAnalysis;
  }


  public String getForDataTrack() {
    return forDataTrack;
  }


  public void setForSample( String forSample ) {
    this.forSample = forSample;
  }


  public void setForAnalysis( String forAnalysis ) {
    this.forAnalysis = forAnalysis;
  }


  public void setForDataTrack( String forDataTrack ) {
    this.forDataTrack = forDataTrack;
  }


  public String getForRequest() {
    return forRequest;
  }


  public void setForRequest( String forRequest ) {
    this.forRequest = forRequest;
  }


  public Integer getSortOrder() {
    return sortOrder;
  }


  public void setSortOrder( Integer sortOrder ) {
    this.sortOrder = sortOrder;
  }


  public Integer getIdCoreFacility() {
    return idCoreFacility;
  }


  public void setIdCoreFacility( Integer idCoreFacility ) {
    this.idCoreFacility = idCoreFacility;
  }


  public Integer getIdPriceCategory() {
    return idPriceCategory;
  }


  public void setIdPriceCategory( Integer idPriceCategory ) {
    this.idPriceCategory = idPriceCategory;
  }


  public String getAppliesToOrganism() {
    StringBuffer buf = new StringBuffer();
    if( getOrganisms() != null ) {
      for( Organism org : ( Set<Organism> ) getOrganisms() ) {
        if( buf.length() > 0 ) {
          buf.append( ", " );
        }
        buf.append( org.getOrganism() );
      }
    }
    return buf.toString();
  }


  public String getAppliesToAnalysisType() {
    StringBuffer buf = new StringBuffer();
    if( getAnalysisTypes() != null ) {
      for( AnalysisType at : ( Set<AnalysisType> ) getAnalysisTypes() ) {
        if( buf.length() > 0 ) {
          buf.append( ", " );
        }
        buf.append( at.getAnalysisType() );
      }
    }
    return buf.toString();
  }


  public String getAppliesToPlatform() {
    StringBuffer buf = new StringBuffer();

    if( getPlatformApplications() != null ) {
      for( PropertyPlatformApplication pa : ( Set<PropertyPlatformApplication> ) getPlatformApplications() ) {
        if( buf.length() > 0 ) {
          buf.append( ", " );
        }
        buf.append( pa.getDisplay() + ( pa.getApplicationDisplay().length() > 0
            ? " " + pa.getApplicationDisplay() : "" ) );
      }
    }
    return buf.toString();
  }


  public String getAppliesToRequestCategory() {
    StringBuffer buf = new StringBuffer();

    if( getPlatformApplications() != null ) {
      for( PropertyPlatformApplication pa : ( Set<PropertyPlatformApplication> ) getPlatformApplications() ) {
        if( buf.length() > 0 ) {
          buf.append( ", " );
        }
        buf.append( pa.getDisplay() );
      }
    }
    return buf.toString();

  }


  public String getAppliesToAppUser() {
    StringBuffer buf = new StringBuffer();
    if( getAppUsers() != null ) {
      for( AppUserLite user : ( Set<AppUserLite> ) getAppUsers() ) {
        if( buf.length() > 0 ) {
          buf.append( ", " );
        }
        buf.append( user.getDisplay() );
      }
    }
    return buf.toString();
  }


  public Boolean hasOptions() {
    if( getCodePropertyType().equals( PropertyType.MULTI_OPTION )
        || getCodePropertyType().equals( PropertyType.OPTION ) ) {
      return true;
    } else {
      return false;
    }
  }

  public static void appendEntryContentXML(Property property, PropertyEntry pe, Element propNode) {

    if (pe != null && pe.getValues() != null && pe.getValues().size() > 0) {
      for (Iterator i1 = pe.getValues().iterator(); i1.hasNext(); ) {
        PropertyEntryValue av = (PropertyEntryValue) i1.next();
        Element valueNode = new Element("PropertyEntryValue");
        propNode.addContent(valueNode);
        valueNode.setAttribute("idPropertyEntryValue", av.getIdPropertyEntryValue().toString());
        valueNode.setAttribute("value", av.getValue() != null ? av.getValue() : "");
        valueNode.setAttribute("url", av.getUrl() != null ? av.getUrl() : "");
        valueNode.setAttribute("urlDisplay", av.getUrlDisplay() != null ? av.getUrlDisplay() : "");
        valueNode.setAttribute("urlAlias", av.getUrlAlias() != null ? av.getUrlAlias() : "");
      }
    }
    /*
    if (property.getCodePropertyType().equals(PropertyType.URL)) {
      // Add an empty value for URL
      Element emptyNode = new Element("PropertyEntryValue");
      propNode.addContent(emptyNode);
      emptyNode.setAttribute("idPropertyEntryValue", "");
      emptyNode.setAttribute("url", "Enter URL here...");
      emptyNode.setAttribute("urlAlias", "Enter alias here...");
      emptyNode.setAttribute("urlDisplay", "");
      emptyNode.setAttribute("value", "");
    }
    */

    if (property.getOptions() != null && property.getOptions().size() > 0) {
      for (Iterator i1 = property.getOptions().iterator(); i1.hasNext(); ) {
        PropertyOption option = (PropertyOption) i1.next();
        Element optionNode = new Element("PropertyOption");
        propNode.addContent(optionNode);
        optionNode.setAttribute("idPropertyOption", option.getIdPropertyOption().toString());
        optionNode.setAttribute("name", option.getOption());
        boolean isSelected = false;
        if (pe != null && pe.getOptions() != null) {
          for (Iterator i2 = pe.getOptions().iterator(); i2.hasNext(); ) {
            PropertyOption optionSelected = (PropertyOption) i2.next();
            if (optionSelected.getIdPropertyOption().equals(option.getIdPropertyOption())) {
              isSelected = true;
              break;
            }
          }
        }
        optionNode.setAttribute("selected", isSelected ? "Y" : "N");
      }
    }
  }


  public static Price getPriceForCheckProperty ( Property property, PriceCategory pc ) {
    Price price = null;
    if ( property == null || property.getDisplay().length() == 0  ) {
      return price;
    }
    for( Iterator i = pc.getPrices().iterator(); i.hasNext(); ) {
      price = ( Price ) i.next();
      if ( price.getName().equalsIgnoreCase( property.getDisplay() )) {
        break;
      }
    }
    return price;
  }


  public static boolean removePriceCategoryForProperty( Property property, Session sess ) {

    boolean deletedPC = false;
    PriceCategory priceCategory = null;

    // Load PriceCategory
    if( property.getIdPriceCategory() != null ) {
      priceCategory = ( PriceCategory ) sess.load( PriceCategory.class, property.getIdPriceCategory() );
    }

    if( priceCategory == null ) {
      property.setIdPriceCategory( null );
      sess.save( property );
      return deletedPC;
    }

    // Determine if this category is already referenced on any billing items
    boolean existingBillingItems = DeletePriceCategory.hasBillingItems( priceCategory, sess );

    // Initialize the prices. We don't want to orphan them unintentionally.
    Hibernate.initialize( priceCategory.getPrices() );
    for( Iterator i = priceCategory.getPrices().iterator(); i.hasNext(); ) {
      Price price = ( Price ) i.next();
      Hibernate.initialize( price.getPriceCriterias() );
    }

    // Delete the price category if
    // no fk violations will occur.
    if( !existingBillingItems ) {
      // Unlink the category from the price sheet
      PriceCategory.deletePriceSheetPriceCategoryEntries( priceCategory, sess );
      property.setIdPriceCategory( null );
      sess.save( property );
      sess.delete( priceCategory );
      deletedPC = true;
    } else {
      priceCategory.setIsActive( "N" );
    }

    sess.flush();

    return deletedPC;
  }
}
