
package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.*;

public class SaveProperty extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger( SaveProperty.class );

  private JsonArray                     optionsArray = null;
  private JsonArray                     organismsArray = null;
  private JsonArray                     appUsersArray = null;
  private JsonArray                     platformsArray = null;
  private JsonArray                     analysisTypesArray = null;

  private Property                       propertyScreen;
  private boolean                        isNewProperty                 = false;
  private boolean                        includePricing                = false;

  private String                         annotationPropertyEquivalents = null;

  private String                         unitPriceInternal;
  private String                         unitPriceExternalAcademic;
  private String                         unitPriceExternalCommercial;

  private String                         codeBillingChargeKind;
  private String                         qtyType;


  public void validate() {
  }


  public void loadCommand(HttpServletWrappedRequest request, HttpSession session ) {

    propertyScreen = new Property();
    HashMap errors = this.loadDetailObject( request, propertyScreen );
    this.addInvalidFields( errors );
    if( propertyScreen.getIdProperty() == null
        || propertyScreen.getIdProperty() == 0 ) {
      isNewProperty = true;
    }

    if( ! propertyScreen.getForAnalysis().equals( "Y" )
        && ! propertyScreen.getForDataTrack().equals( "Y" )
        && ! propertyScreen.getForSample().equals( "Y" )
        && ! propertyScreen.getForRequest().equals( "Y" ) ) {
      this.addInvalidField( "AnnotationAppliesTo",
          "Please choose the object the annotation applies to" );
    }

    if( request.getParameter( "includePricing" ) != null
        && request.getParameter( "includePricing" ).equals( "Y" ) ) {
      includePricing = true;
    }

    String optionsJSONString = request.getParameter("optionsJSONString");
    if (Util.isParameterNonEmpty(optionsJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(optionsJSONString));
        this.optionsArray = jsonReader.readArray();
        jsonReader.close();
        checkOptions();
      } catch (Exception e) {
        this.addInvalidField("optionsJSONString", "Invalid optionsJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse optionsJSONString", e);
      }
    }

    String organismsJSONString = request.getParameter("organismsJSONString");
    if (Util.isParameterNonEmpty(organismsJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(organismsJSONString));
        this.organismsArray = jsonReader.readArray();
        jsonReader.close();
      } catch (Exception e) {
        this.addInvalidField("organismsJSONString", "Invalid organismsJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse organismsJSONString", e);
      }
    }

    String appUsersJSONString = request.getParameter("appUsersJSONString");
    if (Util.isParameterNonEmpty(appUsersJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(appUsersJSONString));
        this.appUsersArray = jsonReader.readArray();
        jsonReader.close();
      } catch (Exception e) {
        this.addInvalidField("appUsersJSONString", "Invalid appUsersJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse appUsersJSONString", e);
      }
    }

    String platformsJSONString = request.getParameter("platformsJSONString");
    if (Util.isParameterNonEmpty(platformsJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(platformsJSONString));
        this.platformsArray = jsonReader.readArray();
        jsonReader.close();
      } catch (Exception e) {
        this.addInvalidField("platformsJSONString", "Invalid platformsJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse platformsJSONString", e);
      }
    }

    String analysisTypesJSONString = request.getParameter("analysisTypesJSONString");
    if (Util.isParameterNonEmpty(analysisTypesJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(analysisTypesJSONString));
        this.analysisTypesArray = jsonReader.readArray();
        jsonReader.close();
      } catch (Exception e) {
        this.addInvalidField("analysisTypesJSONString", "Invalid analysisTypesJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse analysisTypesJSONString", e);
      }
    }

    if( request.getParameter( "unitPriceInternal" ) != null && request.getParameter( "unitPriceInternal" ).length() > 0 ) {
      unitPriceInternal = request.getParameter( "unitPriceInternal" );
    } else {
      unitPriceInternal = null;
    }

    if( request.getParameter( "unitPriceExternalAcademic" ) != null && request.getParameter( "unitPriceExternalAcademic" ).length() > 0 ) {
      unitPriceExternalAcademic = request.getParameter( "unitPriceExternalAcademic" );
    } else {
      unitPriceExternalAcademic = null;
    }

    if( request.getParameter( "unitPriceExternalCommercial" ) != null && request.getParameter( "unitPriceExternalCommercial" ).length() > 0 ) {
      unitPriceExternalCommercial = request.getParameter( "unitPriceExternalCommercial" );
    } else {
      unitPriceExternalCommercial = null;
    }

    if( request.getParameter( "codeBillingChargeKind" ) != null && request.getParameter( "codeBillingChargeKind" ).length() > 0 ) {
      codeBillingChargeKind = request.getParameter( "codeBillingChargeKind" );
    } else {
      codeBillingChargeKind = null;
    }

    if( request.getParameter( "qtyType" ) != null && request.getParameter( "qtyType" ).length() > 0 ) {
      qtyType = request.getParameter( "qtyType" );
    } else {
      qtyType = null;
    }

  }


  private void checkOptions() {
    PropertyDictionaryHelper pdh = PropertyDictionaryHelper.getInstance( null );
    this.annotationPropertyEquivalents = pdh.getProperty(
        PropertyDictionary.ANNOTATION_OPTION_EQUIVALENTS );
    String annotationPropertyInvalid = pdh.getProperty(
        PropertyDictionary.ANNOTATION_OPTION_INVALID );

    HashMap<String, String> invalidMap = new HashMap<>();
    if( annotationPropertyInvalid != null ) {
      for( String i : annotationPropertyInvalid.split( "," ) ) {
        invalidMap.put( i.trim().toUpperCase(), i );
      }
    }

    HashMap<String, String> nameMap = new HashMap<>();
    for(int i = 0; i < this.optionsArray.size(); i++) {
      JsonObject node = this.optionsArray.getJsonObject(i);

      String name = node.getString( "option" );
      name = mapPropertyOptionEquivalents( name );

      if( invalidMap.containsKey( name.toUpperCase() ) ) {
        this.addInvalidField( "Invalid Option", "The option '"
            + node.getString( "option" ) + "' is not allowed." );
      }

      if( nameMap.containsKey( name.toUpperCase() ) ) {
        this.addInvalidField( "Duplicate Option",
            "The options '" + node.getString( "option" ) + "' and '"
                + nameMap.get( name.toUpperCase() )
                + "' are duplicate.  Please correct and try again." );
      }
      nameMap.put( name.toUpperCase(), node.getString( "option" ) );
    }
  }


  private String mapPropertyOptionEquivalents( String option ) {
    if( option == null ) {
      return "";
    }
    option = option.trim();

    String eq = this.annotationPropertyEquivalents;
    if( eq == null || eq.trim().length() == 0 ) {
      return option;
    }

    String opts[] = eq.split( "," );
    if( opts.length < 2 ) {
      return option;
    }

    for( String opt : opts ) {
      opt = opt.trim();
      if( opt.toUpperCase().equals( option.toUpperCase() ) ) {
        return opts[0].trim();
      }
    }

    return option;
  }


  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession( this.getUsername() );

      if( this.getSecurityAdvisor().hasPermission( SecurityAdvisor.CAN_SUBMIT_REQUESTS ) ) {

        if( validatePropertyScreen( sess ) && checkPermissionToEdit() ) {

          Property sc;

          if( isNewProperty ) {
            sc = propertyScreen;

            sess.save( sc );
          } else {

            sc = sess.load( Property.class, propertyScreen.getIdProperty() );

            // Need to initialize billing accounts; otherwise new accounts
            // get in the list and get deleted.
            Hibernate.initialize( sc.getOptions() );
            Hibernate.initialize( sc.getOrganisms() );
            Hibernate.initialize( sc.getAppUsers() );

            initializeProperty( sc );
          }

          //
          // Set up price category
          //
          PriceCategory pc = null;
          if( includePricing ) {
            pc = createPriceCategoryForProperty( sc, sess );
            sc.setIdPriceCategory( pc.getIdPriceCategory() );
            sess.save( sc );
            if( sc.getCodePropertyType().equals( PropertyType.CHECKBOX ) ) {
              savePriceForCheckProperty(sc, pc, sess );
            }

          } else {
            Property.removePriceCategoryForProperty( sc, sess );
          }

          //
          // Save options
          //
          HashMap optionMap = new HashMap();
          if( optionsArray != null && sc.hasOptions() ) {
            for(int i = 0; i < this.optionsArray.size(); i++) {
              JsonObject node = this.optionsArray.getJsonObject(i);
              PropertyOption option;

              String idPropertyOption = node.getString( "idPropertyOption" );
              if( idPropertyOption.startsWith( "PropertyOption" ) ) {
                option = new PropertyOption();
              } else {
                option = sess.load( PropertyOption.class,
                    Integer.valueOf( idPropertyOption ) );
              }

              String name = node.getString( "option" );
              name = mapPropertyOptionEquivalents( name );

              option.setOption( name );
              option.setSortOrder( node.getString( "sortOrder" ) != null
                  && ! node.getString( "sortOrder" ).equals( "" )
                  ? Integer.valueOf( node.getString( "sortOrder" ) )
                      : null );
              option.setIsActive( node.getString( "isActive" ) );
              option.setIdProperty( sc.getIdProperty() );

              sess.save( option );
              sess.flush();
              optionMap.put( option.getIdPropertyOption(), null );

              if( includePricing && pc != null ) {
                // create price and price criteria for property option and price category
                savePricesForPropertyOption( node, option, pc, sess );
              }

            }
          }

          // Remove options no longer in the list or inactivate if they are
          // associated with any property entries.
          boolean inactivate = false;
          List optionsToRemove = new ArrayList();
          if( sc.getOptions() != null ) {
            for( Iterator i = sc.getOptions().iterator(); i.hasNext(); ) {
              PropertyOption op = ( PropertyOption ) i.next();

              if( ! sc.hasOptions()
                  || ! optionMap.containsKey( op.getIdPropertyOption() ) ) {
                optionsToRemove.add( op );
              }
            }

            for( Iterator i = optionsToRemove.iterator(); i.hasNext(); ) {
              PropertyOption op = ( PropertyOption ) i.next();

              Integer entryCount = 0;
              String buf = "SELECT count(*) from PropertyEntry pe where pe.value like '%"
                  + op.getOption() + "%' and pe.idProperty = "
                  + op.getIdProperty().toString();
              List entryCounts = sess.createQuery( buf ).list();
              if( entryCounts != null && entryCounts.size() > 0 ) {
                entryCount = (int) (long) entryCounts.get( 0 );
              }

              // Delete or inactivate prices/price criteria for that option
              removePriceForPropertyOption( op, pc, sess );

              // Inactive if there are existing property entries pointing to
              // this option.
              // If no existing entries, delete option.
              if( entryCount > 0 ) {
                inactivate = true;
                op.setIsActive( "N" );
              } else {
                sess.delete( op );
                sc.getOptions().remove( op );
              }
            }
          }
          sess.flush();


          //
          // Save property organisms
          //
          TreeSet organisms = new TreeSet( new OrganismComparator() );
          if( organismsArray != null ) {
            for(int i = 0; i < this.organismsArray.size(); i++) {
              JsonObject organismNode = this.organismsArray.getJsonObject(i);
              Organism organism = sess.load( Organism.class,
                  Integer.valueOf(
                      organismNode.getString( "idOrganism" ) ) );
              organisms.add( organism );
            }
          }
          sc.setOrganisms( organisms );

          //
          // Save property users
          //
          TreeSet appUsers = new TreeSet( new AppUserComparator() );
          // Only have app users if property is for sample.
          if( sc.getForSample() != null && sc.getForSample().equals( "Y" )
              && ( sc.getIsRequired() == null
              || ! sc.getIsRequired().equals( "Y" ) ) ) {
            if( appUsersArray != null ) {
              for(int i = 0; i < this.appUsersArray.size(); i++) {
                JsonObject appUserNode = this.appUsersArray.getJsonObject(i);
                AppUserLite appUser = sess.load(
                    AppUserLite.class, Integer.valueOf(
                        appUserNode.getString( "idAppUser" ) ) );
                appUsers.add( appUser );
              }
            }
          }
          sc.setAppUsers( appUsers );

          //
          // Save property platformApplications
          //
          TreeSet platformApplications = new TreeSet(
              new PlatformApplicationsComparator() );
          HashMap platformApplicationsMap = new HashMap();
          if( platformsArray != null ) {
            for(int i = 0; i < this.platformsArray.size(); i++) {
              JsonObject platformNode = this.platformsArray.getJsonObject(i);

              // See if this PropertyPlatformApplication object already exists
              StringBuilder queryBuf = new StringBuilder( "select pa" );
              queryBuf.append( " from PropertyPlatformApplication as pa" );
              queryBuf.append( " where pa.idProperty = ");
              queryBuf.append(sc.getIdProperty().toString());
              queryBuf.append(" and");
              queryBuf.append( " pa.codeRequestCategory = '");
              queryBuf.append(platformNode.getString( "codeRequestCategory" ));
              queryBuf.append("' and");
              queryBuf.append( " pa.codeApplication " );
              if( platformNode.getString( "codeApplication" ).length() > 0 ) {
                queryBuf.append("= '");
                queryBuf.append(platformNode.getString( "codeApplication" ));
                queryBuf.append("'");
              } else {
                queryBuf.append( "is null" );
              }

              Query query = sess.createQuery( queryBuf.toString() );
              List paRows = query.list();

              PropertyPlatformApplication pa;
              if( paRows.size() > 0 ) {
                pa = ( PropertyPlatformApplication ) paRows.get( 0 );
                platformApplicationsMap.put( pa.getIdPlatformApplication(),
                    null );
              } else {
                pa = new PropertyPlatformApplication();
                pa.setIdProperty( sc.getIdProperty() );
                pa.setCodeRequestCategory(
                    platformNode.getString( "codeRequestCategory" ) );
                if( platformNode.getString(
                    "codeApplication" ).length() > 0 ) {
                  pa.setCodeApplication(
                      platformNode.getString( "codeApplication" ) );
                } else {
                  pa.setCodeApplication( null );
                }
                sess.save( pa );
                platformApplicationsMap.put( pa.getIdPlatformApplication(),
                    null );
                sess.flush();
              }
              // Reload to insure RequestCategory and Application objects are
              // populated
              Integer idPlatformApplication = pa.getIdPlatformApplication();
              pa = sess.load(
                  PropertyPlatformApplication.class, idPlatformApplication );

              RequestCategory rc = sess.load(
                  RequestCategory.class, pa.getCodeRequestCategory() );


              pa.setRequestCategory( rc );
              if( pa.getCodeApplication() != null ) {
                Application a = sess.load( Application.class,
                    pa.getCodeApplication() );
                pa.setApplication( a );
              }

              platformApplications.add( pa );
            }
          }

          // Remove platformApplications no longer in the list
          List platformApplicationsToRemove = new ArrayList();
          if( sc.getPlatformApplications() != null ) {
            for( Iterator i = sc.getPlatformApplications().iterator(); i.hasNext(); ) {
              PropertyPlatformApplication pa = ( PropertyPlatformApplication ) i.next();

              if( ! platformApplicationsMap.containsKey(
                  pa.getIdPlatformApplication() ) ) {
                platformApplicationsToRemove.add( pa );
              }
            }
            for( Iterator i = platformApplicationsToRemove.iterator(); i.hasNext(); ) {
              PropertyPlatformApplication pa = ( PropertyPlatformApplication ) i.next();
              sess.delete( pa );
            }
          }
          sess.flush();

          sc.setPlatformApplications( platformApplications );

          if ( includePricing ) {
            //Update pricesheetpricecategories
            updatePriceSheetPriceCategoryEntries( sc, pc, sess );
          }

          //
          // Save property analysisTypes
          //
          TreeSet analysisTypes = new TreeSet( new AnalysisTypeComparator() );
          if( analysisTypesArray != null ) {
            for(int i = 0; i < this.analysisTypesArray.size(); i++) {
              JsonObject analysisTypeNode = this.analysisTypesArray.getJsonObject(i);
              AnalysisType at = sess.load( AnalysisType.class,
                  Integer.valueOf( analysisTypeNode.getString(
                      "idAnalysisType" ) ) );
              analysisTypes.add( at );
            }
          }
          sc.setAnalysisTypes( analysisTypes );
          sess.flush();

          DictionaryHelper.reload( sess );

          JsonObject value = Json.createObjectBuilder()
                  .add("result", "SUCCESS")
                  .add("idProperty", sc.getIdProperty().toString())
                  .add("inactivate", inactivate ? "true" : "false")
                  .build();
          this.jsonResult = value.toString();
          setResponsePage( this.SUCCESS_JSP );
        }
      } else {
        this.addInvalidField( "Insufficient permissions",
            "Insufficient permission to save sample property." );
        setResponsePage( this.ERROR_JSP );
      }
    } catch( Exception e ) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveProperty ", e);
      throw new RollBackCommandException( e.getMessage() );

    }

    return this;
  }


  private PriceCategory createPriceCategoryForProperty( Property property, Session sess ) {
    PriceCategory pc = null;

    // Create (or load) PriceCategory
    if( property.getIdPriceCategory() != null ) {
      pc = sess.load( PriceCategory.class, property.getIdPriceCategory() );
    }
    if( pc == null ) {
      pc = new PriceCategory();
    }

    // Set attributes for price category
    pc.setName( property.getDisplay() );
    pc.setDescription( property.getDescription() );
    pc.setIsActive( "Y" );
    pc.setCodeBillingChargeKind( codeBillingChargeKind );
    pc.setDictionaryClassNameFilter2( null );
    // Make this a property?
    pc.setPluginClassName( "hci.gnomex.billing.PropertyPricingPlugin" );
    if ( qtyType.equalsIgnoreCase( "NOTBYSAMPLE" )) {
      pc.setPluginClassName( "hci.gnomex.billing.PropertyPricingNotBySamplePlugin" );
    }

    if( property.getCodePropertyType().equals( PropertyType.CHECKBOX ) ) {
      pc.setDictionaryClassNameFilter1( null );
    } else {
      pc.setDictionaryClassNameFilter1( "hci.gnomex.model.PropertyOption" );
    }

    sess.save( pc );
    sess.flush();
    return pc;
  }

  private boolean removePriceForPropertyOption(PropertyOption po, PriceCategory pc, Session sess ) {

    boolean deletedPrice = false;

    Price price;

    // Look up price/price criteria or create new
    price = PropertyOption.getPriceForPropertyOption ( po, pc );
    if( price == null ) {
      return false;
    }
    Hibernate.initialize( price.getPriceCriterias() );

    // Determine if this category is already referenced on any billing items
    boolean existingBillingItems = PriceUtil.priceHasBillingItems( price, sess );

    // Delete the price if no fk violations will occur.
    if( ! existingBillingItems ) {
      sess.delete( price );
      deletedPrice = true;
    } else {
      price.setIsActive( "N" );
    }

    sess.flush();

    return deletedPrice;
  }

  private void updatePriceSheetPriceCategoryEntries( Property property, PriceCategory priceCategory, Session sess ) {

    // Delete links from price category to price sheets
    PriceCategory.deletePriceSheetPriceCategoryEntries( priceCategory, sess );

    // If there are no platforms, no links will need to be created (Should not happen)
    if( property.getPlatformApplications() == null ) {
      return;
    }

    // List of all price sheets
    List priceSheets = sess.createQuery("SELECT ps from PriceSheet as ps").list();
    HashSet addedPriceCat = new HashSet();
    // Get each platform application for property
    for( Iterator i2 = property.getPlatformApplications().iterator(); i2.hasNext(); ) {
      PropertyPlatformApplication pa = ( PropertyPlatformApplication ) i2.next();

      // Find price sheet
      PriceSheet priceSheet;
      boolean foundPriceSheet = false;
      for(Iterator i = priceSheets.iterator(); i.hasNext();) {
        PriceSheet ps = (PriceSheet)i.next();
        for(Iterator i1 = ps.getRequestCategories().iterator(); i1.hasNext();) {
          RequestCategory requestCategory = (RequestCategory)i1.next();

          // PriceSheet request category equals application request category
          if(requestCategory.getCodeRequestCategory().equals(pa.getCodeRequestCategory())) {
            priceSheet = ps;
            foundPriceSheet = true;

            // Search for PriceSheetPriceCategory
            boolean foundPriceSheetPriceCategory = false;
            Integer maxSortOrder = 0;
            for(Iterator i3 = priceSheet.getPriceCategories().iterator(); i3.hasNext();) {
              PriceSheetPriceCategory x  = (PriceSheetPriceCategory)i3.next();
              PriceCategory cat = x.getPriceCategory();
              if (x.getSortOrder().compareTo(maxSortOrder) > 0) {
                maxSortOrder = x.getSortOrder();
              }
              if (cat.getIdPriceCategory().equals(priceCategory.getIdPriceCategory())) {
                foundPriceSheetPriceCategory = true;
              }
            }
            if (!foundPriceSheetPriceCategory && !addedPriceCat.contains(priceSheet.getIdPriceSheet())) {
              PriceSheetPriceCategory x = new PriceSheetPriceCategory();
              x.setIdPriceCategory(priceCategory.getIdPriceCategory());
              x.setIdPriceSheet(priceSheet.getIdPriceSheet());
              x.setPriceCategory(priceCategory);
              x.setSortOrder(maxSortOrder + 1);
              sess.save(x);
              addedPriceCat.add(priceSheet.getIdPriceSheet());
            }
          }


        }


      }

      sess.flush();
      // Create a price sheet if there isn't one already for the request category
      if (!foundPriceSheet) {
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);
        RequestCategory category = dh.getRequestCategoryObject(pa.getCodeRequestCategory());

        PriceSheet newPriceSheet = new PriceSheet();
        newPriceSheet.setName( category.getDisplay() );
        newPriceSheet.setIsActive( "Y" );
        sess.save(newPriceSheet);
        sess.flush();


        TreeSet requestCategories = new TreeSet();
        requestCategories.add(category);
        newPriceSheet.setRequestCategories(requestCategories);
        sess.flush();

        PriceSheetPriceCategory x = new PriceSheetPriceCategory();
        x.setIdPriceCategory(priceCategory.getIdPriceCategory());
        x.setIdPriceSheet(newPriceSheet.getIdPriceSheet());
        x.setPriceCategory(priceCategory);
        x.setSortOrder(0);
        sess.save(x);
        sess.flush();
      }
    }

  }

  private void savePricesForPropertyOption( JsonObject poNode, PropertyOption po, PriceCategory pc, Session sess ) {
    Price price;
    PriceCriteria priceCriteria = null;

    // Look up price/price criteria or create new
    price = PropertyOption.getPriceForPropertyOption ( po, pc );
    if( price == null ) {
      price = new Price();
    } else {
      priceCriteria = getPriceCriteriaForPropertyOption ( price, po );
    }
    if( priceCriteria == null ) {
      priceCriteria = new PriceCriteria();
    }

    price.setName( poNode.getString( "option" ) );
    price.setIdPriceCategory( pc.getIdPriceCategory() );
    price.setIsActive( po.getIsActive() );

    // Update the prices
    setPrice( poNode.getString( "unitPriceInternal" ), price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL );
    setPrice( poNode.getString( "unitPriceExternalAcademic" ), price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC );
    setPrice( poNode.getString( "unitPriceExternalCommercial" ), price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL );

    sess.save( price );
    sess.flush();

    priceCriteria.setFilter1( po.getIdPropertyOption().toString() );
    priceCriteria.setIdPrice( price.getIdPrice() );

    sess.save( priceCriteria );
    sess.flush();
  }

  private PriceCriteria getPriceCriteriaForPropertyOption ( Price price, PropertyOption po ) {
    PriceCriteria priceCriteria = null;
    if ( po == null ) {
      return null;
    }
    for( Iterator i = price.getPriceCriterias().iterator(); i.hasNext(); ) {
      priceCriteria = ( PriceCriteria ) i.next();
      if ( priceCriteria.getFilter1().equalsIgnoreCase( po.getIdPropertyOption().toString() )) {
        break;
      }
    }
    return priceCriteria;
  }

  private void savePriceForCheckProperty(  Property property, PriceCategory pc, Session sess ) {
    Price price;
    PriceCriteria priceCriteria = new PriceCriteria();

    // Look up price/price criteria or create new
    price = Property.getPriceForCheckProperty ( property, pc );
    if( price == null ) {
      price = new Price();
    }
    if ( price.getPriceCriterias() != null && !price.getPriceCriterias().isEmpty() ) {
      for( Iterator i = price.getPriceCriterias().iterator(); i.hasNext(); ) {
        PriceCriteria criteria = ( PriceCriteria ) i.next();
        sess.delete( criteria );
      }
    }

    price.setName( property.getDisplay() );
    price.setIdPriceCategory( pc.getIdPriceCategory() );
    price.setIsActive( property.getIsActive() );

    // Update the prices
    setPrice( unitPriceInternal, price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL );
    setPrice( unitPriceExternalAcademic, price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC );
    setPrice( unitPriceExternalCommercial, price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL );

    sess.save( price );
    sess.flush();

    // priceCriteria.setFilter1( po.getIdPropertyOption().toString() ); // could set this to "Y" ?
    priceCriteria.setIdPrice( price.getIdPrice() );

    sess.save( priceCriteria );
    sess.flush();
  }


  private Boolean setPrice( String attributeValue, BigDecimal existingPrice, Price price, String whichPrice ) {

    Boolean modified = false;

    try {
      modified = PriceUtil.setPrice( attributeValue, existingPrice, price, whichPrice );
    } catch( NumberFormatException e ) {
      LOG.error( "Unable to parse price: " + attributeValue, e );
    }

    return modified;
  }

  private Boolean validatePropertyScreen( Session sess ) {
    if( propertyScreen.getIdCoreFacility() == null ) {
      this.addInvalidField( "No Core", propertyScreen.getName()
          + " does not have a core facility specified.  Please specify a core facility." );
      setResponsePage( this.ERROR_JSP );
      return false;
    }

    String queryString = "select p from Property p where name = :name";
    Query query = sess.createQuery( queryString );
    query.setParameter( "name", propertyScreen.getName() );
    @SuppressWarnings( "unchecked" )
    List<Property> l = query.list();
    for( Property p : l ) {
      // don't want to compare against itself.
      if( p.getIdProperty().equals( propertyScreen.getIdProperty() ) ) {
        continue;
      }
      // note that idCorefacility should never be null, but the check makes this
      // more robust.
      if( p.getIdCoreFacility() == null || p.getIdCoreFacility().equals(
          propertyScreen.getIdCoreFacility() ) ) {
        this.addInvalidField( "Duplicate Name", propertyScreen.getName()
            + " has been used as the name for a previously defined annotation.  Please choose another name." );
        setResponsePage( this.ERROR_JSP );
        return false;
      }
    }

    return true;
  }


  private Boolean checkPermissionToEdit() {
    if( propertyScreen.getForRequest() != null
        && propertyScreen.getForRequest().equals( "Y" ) ) {
      if( ! this.getSecurityAdvisor().hasPermission(
          SecurityAdvisor.CAN_ACCESS_ANY_OBJECT ) ) {
        this.addInvalidField( "Insufficient permissions",
            "Non-admins cannot edit annotations for experiment requests." );
        setResponsePage( this.ERROR_JSP );
        return false;
      }
    }

    return true;
  }


  private void initializeProperty( Property prop ) {
    prop.setName( propertyScreen.getName() );
    prop.setMageOntologyCode( propertyScreen.getMageOntologyCode() );
    prop.setMageOntologyDefinition(
        propertyScreen.getMageOntologyDefinition() );
    prop.setIsActive( propertyScreen.getIsActive() );
    prop.setForSample( propertyScreen.getForSample() );
    prop.setForDataTrack( propertyScreen.getForDataTrack() );
    prop.setForAnalysis( propertyScreen.getForAnalysis() );
    prop.setForRequest( propertyScreen.getForRequest() );
    prop.setIsRequired( propertyScreen.getIsRequired() );
    prop.setSortOrder( propertyScreen.getSortOrder() );
    prop.setCodePropertyType( propertyScreen.getCodePropertyType() );
    prop.setIdAppUser( propertyScreen.getIdAppUser() );
    prop.setDescription( propertyScreen.getDescription() );
    prop.setIdCoreFacility( propertyScreen.getIdCoreFacility() );
  }

  private class OrganismComparator implements Comparator, Serializable {

    public int compare( Object o1, Object o2 ) {
      Organism org1 = ( Organism ) o1;
      Organism org2 = ( Organism ) o2;

      return org1.getIdOrganism().compareTo( org2.getIdOrganism() );

    }
  }

  private class AppUserComparator implements Comparator, Serializable {

    public int compare( Object o1, Object o2 ) {
      AppUserLite org1 = ( AppUserLite ) o1;
      AppUserLite org2 = ( AppUserLite ) o2;

      return org1.getIdAppUser().compareTo( org2.getIdAppUser() );

    }
  }

  private class PlatformApplicationsComparator
  implements Comparator, Serializable {

    public int compare( Object o1, Object o2 ) {
      PropertyPlatformApplication pa1 = ( PropertyPlatformApplication ) o1;
      PropertyPlatformApplication pa2 = ( PropertyPlatformApplication ) o2;

      int compVal = pa1.getRequestCategory().getRequestCategory().compareTo(
          pa2.getRequestCategory().getRequestCategory() );
      if( compVal == 0 ) {
        String paApplication1 = "";
        String paApplication2 = "";
        if( pa1.getApplication() != null
            && pa1.getApplication().getApplication() != null ) {
          paApplication1 = pa1.getApplication().getApplication();
        }
        if( pa2.getApplication() != null
            && pa2.getApplication().getApplication() != null ) {
          paApplication2 = pa2.getApplication().getApplication();
        }
        compVal = paApplication1.compareTo( paApplication2 );
      }

      return compVal;

    }
  }

  private class AnalysisTypeComparator implements Comparator, Serializable {

    public int compare( Object o1, Object o2 ) {
      AnalysisType a1 = ( AnalysisType ) o1;
      AnalysisType a2 = ( AnalysisType ) o2;

      return a1.getIdAnalysisType().compareTo( a2.getIdAnalysisType() );

    }
  }

}
