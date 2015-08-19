
USE gnomex;

delimiter $$

DROP TRIGGER IF EXISTS TrAI_alignmentplatform_FER
$$
DROP TRIGGER IF EXISTS TrAU_alignmentplatform_FER
$$
DROP TRIGGER IF EXISTS TrAD_alignmentplatform_FER
$$
DROP TRIGGER IF EXISTS TrAI_alignmentprofile_FER
$$
DROP TRIGGER IF EXISTS TrAU_alignmentprofile_FER
$$
DROP TRIGGER IF EXISTS TrAD_alignmentprofile_FER
$$
DROP TRIGGER IF EXISTS TrAI_alignmentprofilegenomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAU_alignmentprofilegenomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAD_alignmentprofilegenomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysis_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysis_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysis_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysiscollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysiscollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysiscollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisexperimentitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisexperimentitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisexperimentitem_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisfile_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisfile_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisfile_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisgenomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisgenomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisgenomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisgroup_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisgroup_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisgroup_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisgroupitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisgroupitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisgroupitem_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysisprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysisprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysisprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysistotopic_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysistotopic_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysistotopic_FER
$$
DROP TRIGGER IF EXISTS TrAI_analysistype_FER
$$
DROP TRIGGER IF EXISTS TrAU_analysistype_FER
$$
DROP TRIGGER IF EXISTS TrAD_analysistype_FER
$$
DROP TRIGGER IF EXISTS TrAI_annotationreportfield_FER
$$
DROP TRIGGER IF EXISTS TrAU_annotationreportfield_FER
$$
DROP TRIGGER IF EXISTS TrAD_annotationreportfield_FER
$$
DROP TRIGGER IF EXISTS TrAI_application_FER
$$
DROP TRIGGER IF EXISTS TrAU_application_FER
$$
DROP TRIGGER IF EXISTS TrAD_application_FER
$$
DROP TRIGGER IF EXISTS TrAI_applicationtheme_FER
$$
DROP TRIGGER IF EXISTS TrAU_applicationtheme_FER
$$
DROP TRIGGER IF EXISTS TrAD_applicationtheme_FER
$$
DROP TRIGGER IF EXISTS TrAI_applicationtype_FER
$$
DROP TRIGGER IF EXISTS TrAU_applicationtype_FER
$$
DROP TRIGGER IF EXISTS TrAD_applicationtype_FER
$$
DROP TRIGGER IF EXISTS TrAI_appuser_FER
$$
DROP TRIGGER IF EXISTS TrAU_appuser_FER
$$
DROP TRIGGER IF EXISTS TrAD_appuser_FER
$$
DROP TRIGGER IF EXISTS TrAI_arraycoordinate_FER
$$
DROP TRIGGER IF EXISTS TrAU_arraycoordinate_FER
$$
DROP TRIGGER IF EXISTS TrAD_arraycoordinate_FER
$$
DROP TRIGGER IF EXISTS TrAI_arraydesign_FER
$$
DROP TRIGGER IF EXISTS TrAU_arraydesign_FER
$$
DROP TRIGGER IF EXISTS TrAD_arraydesign_FER
$$
DROP TRIGGER IF EXISTS TrAI_assay_FER
$$
DROP TRIGGER IF EXISTS TrAU_assay_FER
$$
DROP TRIGGER IF EXISTS TrAD_assay_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingaccount_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingaccount_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingaccount_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingaccountuser_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingaccountuser_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingaccountuser_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingchargekind_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingchargekind_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingchargekind_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingitem_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingperiod_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingperiod_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingperiod_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingslideproductclass_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingslideproductclass_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingslideproductclass_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingslideserviceclass_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingslideserviceclass_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingslideserviceclass_FER
$$
DROP TRIGGER IF EXISTS TrAI_billingstatus_FER
$$
DROP TRIGGER IF EXISTS TrAU_billingstatus_FER
$$
DROP TRIGGER IF EXISTS TrAD_billingstatus_FER
$$
DROP TRIGGER IF EXISTS TrAI_bioanalyzerchiptype_FER
$$
DROP TRIGGER IF EXISTS TrAU_bioanalyzerchiptype_FER
$$
DROP TRIGGER IF EXISTS TrAD_bioanalyzerchiptype_FER
$$
DROP TRIGGER IF EXISTS TrAI_chromatogram_FER
$$
DROP TRIGGER IF EXISTS TrAU_chromatogram_FER
$$
DROP TRIGGER IF EXISTS TrAD_chromatogram_FER
$$
DROP TRIGGER IF EXISTS TrAI_concentrationunit_FER
$$
DROP TRIGGER IF EXISTS TrAU_concentrationunit_FER
$$
DROP TRIGGER IF EXISTS TrAD_concentrationunit_FER
$$
DROP TRIGGER IF EXISTS TrAI_contextsensitivehelp_FER
$$
DROP TRIGGER IF EXISTS TrAU_contextsensitivehelp_FER
$$
DROP TRIGGER IF EXISTS TrAD_contextsensitivehelp_FER
$$
DROP TRIGGER IF EXISTS TrAI_corefacility_FER
$$
DROP TRIGGER IF EXISTS TrAU_corefacility_FER
$$
DROP TRIGGER IF EXISTS TrAD_corefacility_FER
$$
DROP TRIGGER IF EXISTS TrAI_corefacilitylab_FER
$$
DROP TRIGGER IF EXISTS TrAU_corefacilitylab_FER
$$
DROP TRIGGER IF EXISTS TrAD_corefacilitylab_FER
$$
DROP TRIGGER IF EXISTS TrAI_corefacilitymanager_FER
$$
DROP TRIGGER IF EXISTS TrAU_corefacilitymanager_FER
$$
DROP TRIGGER IF EXISTS TrAD_corefacilitymanager_FER
$$
DROP TRIGGER IF EXISTS TrAI_corefacilitysubmitter_FER
$$
DROP TRIGGER IF EXISTS TrAU_corefacilitysubmitter_FER
$$
DROP TRIGGER IF EXISTS TrAD_corefacilitysubmitter_FER
$$
DROP TRIGGER IF EXISTS TrAI_creditcardcompany_FER
$$
DROP TRIGGER IF EXISTS TrAU_creditcardcompany_FER
$$
DROP TRIGGER IF EXISTS TrAD_creditcardcompany_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatrack_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatrack_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatrack_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatrackcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatrackcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatrackcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatrackfile_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatrackfile_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatrackfile_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatrackfolder_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatrackfolder_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatrackfolder_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatracktofolder_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatracktofolder_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatracktofolder_FER
$$
DROP TRIGGER IF EXISTS TrAI_datatracktotopic_FER
$$
DROP TRIGGER IF EXISTS TrAU_datatracktotopic_FER
$$
DROP TRIGGER IF EXISTS TrAD_datatracktotopic_FER
$$
DROP TRIGGER IF EXISTS TrAI_diskusagebymonth_FER
$$
DROP TRIGGER IF EXISTS TrAU_diskusagebymonth_FER
$$
DROP TRIGGER IF EXISTS TrAD_diskusagebymonth_FER
$$
DROP TRIGGER IF EXISTS TrAI_experimentdesign_FER
$$
DROP TRIGGER IF EXISTS TrAU_experimentdesign_FER
$$
DROP TRIGGER IF EXISTS TrAD_experimentdesign_FER
$$
DROP TRIGGER IF EXISTS TrAI_experimentdesignentry_FER
$$
DROP TRIGGER IF EXISTS TrAU_experimentdesignentry_FER
$$
DROP TRIGGER IF EXISTS TrAD_experimentdesignentry_FER
$$
DROP TRIGGER IF EXISTS TrAI_experimentfactor_FER
$$
DROP TRIGGER IF EXISTS TrAU_experimentfactor_FER
$$
DROP TRIGGER IF EXISTS TrAD_experimentfactor_FER
$$
DROP TRIGGER IF EXISTS TrAI_experimentfactorentry_FER
$$
DROP TRIGGER IF EXISTS TrAU_experimentfactorentry_FER
$$
DROP TRIGGER IF EXISTS TrAD_experimentfactorentry_FER
$$
DROP TRIGGER IF EXISTS TrAI_experimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAU_experimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAD_experimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAI_faq_FER
$$
DROP TRIGGER IF EXISTS TrAU_faq_FER
$$
DROP TRIGGER IF EXISTS TrAD_faq_FER
$$
DROP TRIGGER IF EXISTS TrAI_featureextractionprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_featureextractionprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_featureextractionprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_flowcell_FER
$$
DROP TRIGGER IF EXISTS TrAU_flowcell_FER
$$
DROP TRIGGER IF EXISTS TrAD_flowcell_FER
$$
DROP TRIGGER IF EXISTS TrAI_flowcellchannel_FER
$$
DROP TRIGGER IF EXISTS TrAU_flowcellchannel_FER
$$
DROP TRIGGER IF EXISTS TrAD_flowcellchannel_FER
$$
DROP TRIGGER IF EXISTS TrAI_fundingagency_FER
$$
DROP TRIGGER IF EXISTS TrAU_fundingagency_FER
$$
DROP TRIGGER IF EXISTS TrAD_fundingagency_FER
$$
DROP TRIGGER IF EXISTS TrAI_genomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAU_genomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAD_genomebuild_FER
$$
DROP TRIGGER IF EXISTS TrAI_genomebuildalias_FER
$$
DROP TRIGGER IF EXISTS TrAU_genomebuildalias_FER
$$
DROP TRIGGER IF EXISTS TrAD_genomebuildalias_FER
$$
DROP TRIGGER IF EXISTS TrAI_genomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAU_genomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAD_genomeindex_FER
$$
DROP TRIGGER IF EXISTS TrAI_hybprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_hybprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_hybprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_hybridization_FER
$$
DROP TRIGGER IF EXISTS TrAU_hybridization_FER
$$
DROP TRIGGER IF EXISTS TrAD_hybridization_FER
$$
DROP TRIGGER IF EXISTS TrAI_institution_FER
$$
DROP TRIGGER IF EXISTS TrAU_institution_FER
$$
DROP TRIGGER IF EXISTS TrAD_institution_FER
$$
DROP TRIGGER IF EXISTS TrAI_institutionlab_FER
$$
DROP TRIGGER IF EXISTS TrAU_institutionlab_FER
$$
DROP TRIGGER IF EXISTS TrAD_institutionlab_FER
$$
DROP TRIGGER IF EXISTS TrAI_instrument_FER
$$
DROP TRIGGER IF EXISTS TrAU_instrument_FER
$$
DROP TRIGGER IF EXISTS TrAD_instrument_FER
$$
DROP TRIGGER IF EXISTS TrAI_instrumentrun_FER
$$
DROP TRIGGER IF EXISTS TrAU_instrumentrun_FER
$$
DROP TRIGGER IF EXISTS TrAD_instrumentrun_FER
$$
DROP TRIGGER IF EXISTS TrAI_instrumentrunstatus_FER
$$
DROP TRIGGER IF EXISTS TrAU_instrumentrunstatus_FER
$$
DROP TRIGGER IF EXISTS TrAD_instrumentrunstatus_FER
$$
DROP TRIGGER IF EXISTS TrAI_internalaccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAU_internalaccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAD_internalaccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAI_invoice_FER
$$
DROP TRIGGER IF EXISTS TrAU_invoice_FER
$$
DROP TRIGGER IF EXISTS TrAD_invoice_FER
$$
DROP TRIGGER IF EXISTS TrAI_iscanchip_FER
$$
DROP TRIGGER IF EXISTS TrAU_iscanchip_FER
$$
DROP TRIGGER IF EXISTS TrAD_iscanchip_FER
$$
DROP TRIGGER IF EXISTS TrAI_isolationpreptype_FER
$$
DROP TRIGGER IF EXISTS TrAU_isolationpreptype_FER
$$
DROP TRIGGER IF EXISTS TrAD_isolationpreptype_FER
$$
DROP TRIGGER IF EXISTS TrAI_lab_FER
$$
DROP TRIGGER IF EXISTS TrAU_lab_FER
$$
DROP TRIGGER IF EXISTS TrAD_lab_FER
$$
DROP TRIGGER IF EXISTS TrAI_labcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAU_labcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAD_labcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAI_label_FER
$$
DROP TRIGGER IF EXISTS TrAU_label_FER
$$
DROP TRIGGER IF EXISTS TrAD_label_FER
$$
DROP TRIGGER IF EXISTS TrAI_labeledsample_FER
$$
DROP TRIGGER IF EXISTS TrAU_labeledsample_FER
$$
DROP TRIGGER IF EXISTS TrAD_labeledsample_FER
$$
DROP TRIGGER IF EXISTS TrAI_labelingprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_labelingprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_labelingprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_labelingreactionsize_FER
$$
DROP TRIGGER IF EXISTS TrAU_labelingreactionsize_FER
$$
DROP TRIGGER IF EXISTS TrAD_labelingreactionsize_FER
$$
DROP TRIGGER IF EXISTS TrAI_labmanager_FER
$$
DROP TRIGGER IF EXISTS TrAU_labmanager_FER
$$
DROP TRIGGER IF EXISTS TrAD_labmanager_FER
$$
DROP TRIGGER IF EXISTS TrAI_labuser_FER
$$
DROP TRIGGER IF EXISTS TrAU_labuser_FER
$$
DROP TRIGGER IF EXISTS TrAD_labuser_FER
$$
DROP TRIGGER IF EXISTS TrAI_metrixobject_FER
$$
DROP TRIGGER IF EXISTS TrAU_metrixobject_FER
$$
DROP TRIGGER IF EXISTS TrAD_metrixobject_FER
$$
DROP TRIGGER IF EXISTS TrAI_newsitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_newsitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_newsitem_FER
$$
DROP TRIGGER IF EXISTS TrAI_notification_FER
$$
DROP TRIGGER IF EXISTS TrAU_notification_FER
$$
DROP TRIGGER IF EXISTS TrAD_notification_FER
$$
DROP TRIGGER IF EXISTS TrAI_nucleotidetype_FER
$$
DROP TRIGGER IF EXISTS TrAU_nucleotidetype_FER
$$
DROP TRIGGER IF EXISTS TrAD_nucleotidetype_FER
$$
DROP TRIGGER IF EXISTS TrAI_numbersequencingcycles_FER
$$
DROP TRIGGER IF EXISTS TrAU_numbersequencingcycles_FER
$$
DROP TRIGGER IF EXISTS TrAD_numbersequencingcycles_FER
$$
DROP TRIGGER IF EXISTS TrAI_numbersequencingcyclesallowed_FER
$$
DROP TRIGGER IF EXISTS TrAU_numbersequencingcyclesallowed_FER
$$
DROP TRIGGER IF EXISTS TrAD_numbersequencingcyclesallowed_FER
$$
DROP TRIGGER IF EXISTS TrAI_oligobarcode_FER
$$
DROP TRIGGER IF EXISTS TrAU_oligobarcode_FER
$$
DROP TRIGGER IF EXISTS TrAD_oligobarcode_FER
$$
DROP TRIGGER IF EXISTS TrAI_oligobarcodescheme_FER
$$
DROP TRIGGER IF EXISTS TrAU_oligobarcodescheme_FER
$$
DROP TRIGGER IF EXISTS TrAD_oligobarcodescheme_FER
$$
DROP TRIGGER IF EXISTS TrAI_oligobarcodeschemeallowed_FER
$$
DROP TRIGGER IF EXISTS TrAU_oligobarcodeschemeallowed_FER
$$
DROP TRIGGER IF EXISTS TrAD_oligobarcodeschemeallowed_FER
$$
DROP TRIGGER IF EXISTS TrAI_organism_FER
$$
DROP TRIGGER IF EXISTS TrAU_organism_FER
$$
DROP TRIGGER IF EXISTS TrAD_organism_FER
$$
DROP TRIGGER IF EXISTS TrAI_otheraccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAU_otheraccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAD_otheraccountfieldsconfiguration_FER
$$
DROP TRIGGER IF EXISTS TrAI_plate_FER
$$
DROP TRIGGER IF EXISTS TrAU_plate_FER
$$
DROP TRIGGER IF EXISTS TrAD_plate_FER
$$
DROP TRIGGER IF EXISTS TrAI_platetype_FER
$$
DROP TRIGGER IF EXISTS TrAU_platetype_FER
$$
DROP TRIGGER IF EXISTS TrAD_platetype_FER
$$
DROP TRIGGER IF EXISTS TrAI_platewell_FER
$$
DROP TRIGGER IF EXISTS TrAU_platewell_FER
$$
DROP TRIGGER IF EXISTS TrAD_platewell_FER
$$
DROP TRIGGER IF EXISTS TrAI_price_FER
$$
DROP TRIGGER IF EXISTS TrAU_price_FER
$$
DROP TRIGGER IF EXISTS TrAD_price_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricecategorystep_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricecategorystep_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricecategorystep_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricecriteria_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricecriteria_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricecriteria_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricesheet_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricesheet_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricesheet_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricesheetpricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricesheetpricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricesheetpricecategory_FER
$$
DROP TRIGGER IF EXISTS TrAI_pricesheetrequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAU_pricesheetrequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAD_pricesheetrequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAI_primer_FER
$$
DROP TRIGGER IF EXISTS TrAU_primer_FER
$$
DROP TRIGGER IF EXISTS TrAD_primer_FER
$$
DROP TRIGGER IF EXISTS TrAI_product_FER
$$
DROP TRIGGER IF EXISTS TrAU_product_FER
$$
DROP TRIGGER IF EXISTS TrAD_product_FER
$$
DROP TRIGGER IF EXISTS TrAI_productledger_FER
$$
DROP TRIGGER IF EXISTS TrAU_productledger_FER
$$
DROP TRIGGER IF EXISTS TrAD_productledger_FER
$$
DROP TRIGGER IF EXISTS TrAI_productlineitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_productlineitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_productlineitem_FER
$$
DROP TRIGGER IF EXISTS TrAI_productorder_FER
$$
DROP TRIGGER IF EXISTS TrAU_productorder_FER
$$
DROP TRIGGER IF EXISTS TrAD_productorder_FER
$$
DROP TRIGGER IF EXISTS TrAI_productorderfile_FER
$$
DROP TRIGGER IF EXISTS TrAU_productorderfile_FER
$$
DROP TRIGGER IF EXISTS TrAD_productorderfile_FER
$$
DROP TRIGGER IF EXISTS TrAI_productorderstatus_FER
$$
DROP TRIGGER IF EXISTS TrAU_productorderstatus_FER
$$
DROP TRIGGER IF EXISTS TrAD_productorderstatus_FER
$$
DROP TRIGGER IF EXISTS TrAI_producttype_FER
$$
DROP TRIGGER IF EXISTS TrAU_producttype_FER
$$
DROP TRIGGER IF EXISTS TrAD_producttype_FER
$$
DROP TRIGGER IF EXISTS TrAI_project_FER
$$
DROP TRIGGER IF EXISTS TrAU_project_FER
$$
DROP TRIGGER IF EXISTS TrAD_project_FER
$$
DROP TRIGGER IF EXISTS TrAI_property_FER
$$
DROP TRIGGER IF EXISTS TrAU_property_FER
$$
DROP TRIGGER IF EXISTS TrAD_property_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyanalysistype_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyanalysistype_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyanalysistype_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyappuser_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyappuser_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyappuser_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertydictionary_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertydictionary_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertydictionary_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyentry_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyentry_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyentry_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyentryoption_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyentryoption_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyentryoption_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyentryvalue_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyentryvalue_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyentryvalue_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyoption_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyoption_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyoption_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyorganism_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyorganism_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyorganism_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertyplatformapplication_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertyplatformapplication_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertyplatformapplication_FER
$$
DROP TRIGGER IF EXISTS TrAI_propertytype_FER
$$
DROP TRIGGER IF EXISTS TrAU_propertytype_FER
$$
DROP TRIGGER IF EXISTS TrAD_propertytype_FER
$$
DROP TRIGGER IF EXISTS TrAI_protocoltype_FER
$$
DROP TRIGGER IF EXISTS TrAU_protocoltype_FER
$$
DROP TRIGGER IF EXISTS TrAD_protocoltype_FER
$$
DROP TRIGGER IF EXISTS TrAI_qualitycontrolstep_FER
$$
DROP TRIGGER IF EXISTS TrAU_qualitycontrolstep_FER
$$
DROP TRIGGER IF EXISTS TrAD_qualitycontrolstep_FER
$$
DROP TRIGGER IF EXISTS TrAI_qualitycontrolstepentry_FER
$$
DROP TRIGGER IF EXISTS TrAU_qualitycontrolstepentry_FER
$$
DROP TRIGGER IF EXISTS TrAD_qualitycontrolstepentry_FER
$$
DROP TRIGGER IF EXISTS TrAI_reactiontype_FER
$$
DROP TRIGGER IF EXISTS TrAU_reactiontype_FER
$$
DROP TRIGGER IF EXISTS TrAD_reactiontype_FER
$$
DROP TRIGGER IF EXISTS TrAI_request_FER
$$
DROP TRIGGER IF EXISTS TrAU_request_FER
$$
DROP TRIGGER IF EXISTS TrAD_request_FER
$$
DROP TRIGGER IF EXISTS TrAI_requestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAU_requestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAD_requestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAI_requestcategoryapplication_FER
$$
DROP TRIGGER IF EXISTS TrAU_requestcategoryapplication_FER
$$
DROP TRIGGER IF EXISTS TrAD_requestcategoryapplication_FER
$$
DROP TRIGGER IF EXISTS TrAI_requestcategorytype_FER
$$
DROP TRIGGER IF EXISTS TrAU_requestcategorytype_FER
$$
DROP TRIGGER IF EXISTS TrAD_requestcategorytype_FER
$$
DROP TRIGGER IF EXISTS TrAI_requestcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAU_requestcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAD_requestcollaborator_FER
$$
DROP TRIGGER IF EXISTS TrAI_requesthybridization_FER
$$
DROP TRIGGER IF EXISTS TrAU_requesthybridization_FER
$$
DROP TRIGGER IF EXISTS TrAD_requesthybridization_FER
$$
DROP TRIGGER IF EXISTS TrAI_requestseqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAU_requestseqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAD_requestseqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAI_requeststatus_FER
$$
DROP TRIGGER IF EXISTS TrAU_requeststatus_FER
$$
DROP TRIGGER IF EXISTS TrAD_requeststatus_FER
$$
DROP TRIGGER IF EXISTS TrAI_requesttotopic_FER
$$
DROP TRIGGER IF EXISTS TrAU_requesttotopic_FER
$$
DROP TRIGGER IF EXISTS TrAD_requesttotopic_FER
$$
DROP TRIGGER IF EXISTS TrAI_sample_FER
$$
DROP TRIGGER IF EXISTS TrAU_sample_FER
$$
DROP TRIGGER IF EXISTS TrAD_sample_FER
$$
DROP TRIGGER IF EXISTS TrAI_sampledropofflocation_FER
$$
DROP TRIGGER IF EXISTS TrAU_sampledropofflocation_FER
$$
DROP TRIGGER IF EXISTS TrAD_sampledropofflocation_FER
$$
DROP TRIGGER IF EXISTS TrAI_sampleexperimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAU_sampleexperimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAD_sampleexperimentfile_FER
$$
DROP TRIGGER IF EXISTS TrAI_samplefiletype_FER
$$
DROP TRIGGER IF EXISTS TrAU_samplefiletype_FER
$$
DROP TRIGGER IF EXISTS TrAD_samplefiletype_FER
$$
DROP TRIGGER IF EXISTS TrAI_sampleprepmethod_FER
$$
DROP TRIGGER IF EXISTS TrAU_sampleprepmethod_FER
$$
DROP TRIGGER IF EXISTS TrAD_sampleprepmethod_FER
$$
DROP TRIGGER IF EXISTS TrAI_samplesource_FER
$$
DROP TRIGGER IF EXISTS TrAU_samplesource_FER
$$
DROP TRIGGER IF EXISTS TrAD_samplesource_FER
$$
DROP TRIGGER IF EXISTS TrAI_sampletype_FER
$$
DROP TRIGGER IF EXISTS TrAU_sampletype_FER
$$
DROP TRIGGER IF EXISTS TrAD_sampletype_FER
$$
DROP TRIGGER IF EXISTS TrAI_sampletyperequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAU_sampletyperequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAD_sampletyperequestcategory_FER
$$
DROP TRIGGER IF EXISTS TrAI_scanprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_scanprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_scanprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_sealtype_FER
$$
DROP TRIGGER IF EXISTS TrAU_sealtype_FER
$$
DROP TRIGGER IF EXISTS TrAD_sealtype_FER
$$
DROP TRIGGER IF EXISTS TrAI_segment_FER
$$
DROP TRIGGER IF EXISTS TrAU_segment_FER
$$
DROP TRIGGER IF EXISTS TrAD_segment_FER
$$
DROP TRIGGER IF EXISTS TrAI_seqlibprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAU_seqlibprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAD_seqlibprotocol_FER
$$
DROP TRIGGER IF EXISTS TrAI_seqlibprotocolapplication_FER
$$
DROP TRIGGER IF EXISTS TrAU_seqlibprotocolapplication_FER
$$
DROP TRIGGER IF EXISTS TrAD_seqlibprotocolapplication_FER
$$
DROP TRIGGER IF EXISTS TrAI_seqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAU_seqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAD_seqlibtreatment_FER
$$
DROP TRIGGER IF EXISTS TrAI_seqruntype_FER
$$
DROP TRIGGER IF EXISTS TrAU_seqruntype_FER
$$
DROP TRIGGER IF EXISTS TrAD_seqruntype_FER
$$
DROP TRIGGER IF EXISTS TrAI_sequencelane_FER
$$
DROP TRIGGER IF EXISTS TrAU_sequencelane_FER
$$
DROP TRIGGER IF EXISTS TrAD_sequencelane_FER
$$
DROP TRIGGER IF EXISTS TrAI_sequencingcontrol_FER
$$
DROP TRIGGER IF EXISTS TrAU_sequencingcontrol_FER
$$
DROP TRIGGER IF EXISTS TrAD_sequencingcontrol_FER
$$
DROP TRIGGER IF EXISTS TrAI_sequencingplatform_FER
$$
DROP TRIGGER IF EXISTS TrAU_sequencingplatform_FER
$$
DROP TRIGGER IF EXISTS TrAD_sequencingplatform_FER
$$
DROP TRIGGER IF EXISTS TrAI_slide_FER
$$
DROP TRIGGER IF EXISTS TrAU_slide_FER
$$
DROP TRIGGER IF EXISTS TrAD_slide_FER
$$
DROP TRIGGER IF EXISTS TrAI_slidedesign_FER
$$
DROP TRIGGER IF EXISTS TrAU_slidedesign_FER
$$
DROP TRIGGER IF EXISTS TrAD_slidedesign_FER
$$
DROP TRIGGER IF EXISTS TrAI_slideproduct_FER
$$
DROP TRIGGER IF EXISTS TrAU_slideproduct_FER
$$
DROP TRIGGER IF EXISTS TrAD_slideproduct_FER
$$
DROP TRIGGER IF EXISTS TrAI_slideproductapplication_FER
$$
DROP TRIGGER IF EXISTS TrAU_slideproductapplication_FER
$$
DROP TRIGGER IF EXISTS TrAD_slideproductapplication_FER
$$
DROP TRIGGER IF EXISTS TrAI_slidesource_FER
$$
DROP TRIGGER IF EXISTS TrAU_slidesource_FER
$$
DROP TRIGGER IF EXISTS TrAD_slidesource_FER
$$
DROP TRIGGER IF EXISTS TrAI_state_FER
$$
DROP TRIGGER IF EXISTS TrAU_state_FER
$$
DROP TRIGGER IF EXISTS TrAD_state_FER
$$
DROP TRIGGER IF EXISTS TrAI_step_FER
$$
DROP TRIGGER IF EXISTS TrAU_step_FER
$$
DROP TRIGGER IF EXISTS TrAD_step_FER
$$
DROP TRIGGER IF EXISTS TrAI_submissioninstruction_FER
$$
DROP TRIGGER IF EXISTS TrAU_submissioninstruction_FER
$$
DROP TRIGGER IF EXISTS TrAD_submissioninstruction_FER
$$
DROP TRIGGER IF EXISTS TrAI_topic_FER
$$
DROP TRIGGER IF EXISTS TrAU_topic_FER
$$
DROP TRIGGER IF EXISTS TrAD_topic_FER
$$
DROP TRIGGER IF EXISTS TrAI_treatmententry_FER
$$
DROP TRIGGER IF EXISTS TrAU_treatmententry_FER
$$
DROP TRIGGER IF EXISTS TrAD_treatmententry_FER
$$
DROP TRIGGER IF EXISTS TrAI_unloaddatatrack_FER
$$
DROP TRIGGER IF EXISTS TrAU_unloaddatatrack_FER
$$
DROP TRIGGER IF EXISTS TrAD_unloaddatatrack_FER
$$
DROP TRIGGER IF EXISTS TrAI_userpermissionkind_FER
$$
DROP TRIGGER IF EXISTS TrAU_userpermissionkind_FER
$$
DROP TRIGGER IF EXISTS TrAD_userpermissionkind_FER
$$
DROP TRIGGER IF EXISTS TrAI_vendor_FER
$$
DROP TRIGGER IF EXISTS TrAU_vendor_FER
$$
DROP TRIGGER IF EXISTS TrAD_vendor_FER
$$
DROP TRIGGER IF EXISTS TrAI_visibility_FER
$$
DROP TRIGGER IF EXISTS TrAU_visibility_FER
$$
DROP TRIGGER IF EXISTS TrAD_visibility_FER
$$
DROP TRIGGER IF EXISTS TrAI_workitem_FER
$$
DROP TRIGGER IF EXISTS TrAU_workitem_FER
$$
DROP TRIGGER IF EXISTS TrAD_workitem_FER
$$


--
-- Audit Table For alignmentplatform 
--

CREATE TABLE IF NOT EXISTS `alignmentplatform_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAlignmentPlatform`  int(10)  NULL DEFAULT NULL
 ,`alignmentPlatformName`  varchar(120)  NULL DEFAULT NULL
 ,`webServiceName`  varchar(120)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for alignmentplatform 
--

INSERT INTO alignmentplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentPlatform
  , alignmentPlatformName
  , webServiceName
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAlignmentPlatform
  , alignmentPlatformName
  , webServiceName
  , isActive
  FROM alignmentplatform
  WHERE NOT EXISTS(SELECT * FROM alignmentplatform_Audit)
$$

--
-- Audit Triggers For alignmentplatform 
--


CREATE TRIGGER TrAI_alignmentplatform_FER AFTER INSERT ON alignmentplatform FOR EACH ROW
BEGIN
  INSERT INTO alignmentplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentPlatform
  , alignmentPlatformName
  , webServiceName
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAlignmentPlatform
  , NEW.alignmentPlatformName
  , NEW.webServiceName
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_alignmentplatform_FER AFTER UPDATE ON alignmentplatform FOR EACH ROW
BEGIN
  INSERT INTO alignmentplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentPlatform
  , alignmentPlatformName
  , webServiceName
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAlignmentPlatform
  , NEW.alignmentPlatformName
  , NEW.webServiceName
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_alignmentplatform_FER AFTER DELETE ON alignmentplatform FOR EACH ROW
BEGIN
  INSERT INTO alignmentplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentPlatform
  , alignmentPlatformName
  , webServiceName
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAlignmentPlatform
  , OLD.alignmentPlatformName
  , OLD.webServiceName
  , OLD.isActive );
END;
$$


--
-- Audit Table For alignmentprofilegenomeindex 
--

CREATE TABLE IF NOT EXISTS `alignmentprofilegenomeindex_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAlignmentProfile`  int(10)  NULL DEFAULT NULL
 ,`idGenomeIndex`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for alignmentprofilegenomeindex 
--

INSERT INTO alignmentprofilegenomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , idGenomeIndex )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAlignmentProfile
  , idGenomeIndex
  FROM alignmentprofilegenomeindex
  WHERE NOT EXISTS(SELECT * FROM alignmentprofilegenomeindex_Audit)
$$

--
-- Audit Triggers For alignmentprofilegenomeindex 
--


CREATE TRIGGER TrAI_alignmentprofilegenomeindex_FER AFTER INSERT ON alignmentprofilegenomeindex FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofilegenomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , idGenomeIndex )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAlignmentProfile
  , NEW.idGenomeIndex );
END;
$$


CREATE TRIGGER TrAU_alignmentprofilegenomeindex_FER AFTER UPDATE ON alignmentprofilegenomeindex FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofilegenomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , idGenomeIndex )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAlignmentProfile
  , NEW.idGenomeIndex );
END;
$$


CREATE TRIGGER TrAD_alignmentprofilegenomeindex_FER AFTER DELETE ON alignmentprofilegenomeindex FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofilegenomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , idGenomeIndex )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAlignmentProfile
  , OLD.idGenomeIndex );
END;
$$


--
-- Audit Table For alignmentprofile 
--

CREATE TABLE IF NOT EXISTS `alignmentprofile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAlignmentProfile`  int(10)  NULL DEFAULT NULL
 ,`alignmentProfileName`  varchar(120)  NULL DEFAULT NULL
 ,`description`  varchar(10000)  NULL DEFAULT NULL
 ,`parameters`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAlignmentPlatform`  int(10)  NULL DEFAULT NULL
 ,`idSeqRunType`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for alignmentprofile 
--

INSERT INTO alignmentprofile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , alignmentProfileName
  , description
  , parameters
  , isActive
  , idAlignmentPlatform
  , idSeqRunType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAlignmentProfile
  , alignmentProfileName
  , description
  , parameters
  , isActive
  , idAlignmentPlatform
  , idSeqRunType
  FROM alignmentprofile
  WHERE NOT EXISTS(SELECT * FROM alignmentprofile_Audit)
$$

--
-- Audit Triggers For alignmentprofile 
--


CREATE TRIGGER TrAI_alignmentprofile_FER AFTER INSERT ON alignmentprofile FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , alignmentProfileName
  , description
  , parameters
  , isActive
  , idAlignmentPlatform
  , idSeqRunType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAlignmentProfile
  , NEW.alignmentProfileName
  , NEW.description
  , NEW.parameters
  , NEW.isActive
  , NEW.idAlignmentPlatform
  , NEW.idSeqRunType );
END;
$$


CREATE TRIGGER TrAU_alignmentprofile_FER AFTER UPDATE ON alignmentprofile FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , alignmentProfileName
  , description
  , parameters
  , isActive
  , idAlignmentPlatform
  , idSeqRunType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAlignmentProfile
  , NEW.alignmentProfileName
  , NEW.description
  , NEW.parameters
  , NEW.isActive
  , NEW.idAlignmentPlatform
  , NEW.idSeqRunType );
END;
$$


CREATE TRIGGER TrAD_alignmentprofile_FER AFTER DELETE ON alignmentprofile FOR EACH ROW
BEGIN
  INSERT INTO alignmentprofile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAlignmentProfile
  , alignmentProfileName
  , description
  , parameters
  , isActive
  , idAlignmentPlatform
  , idSeqRunType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAlignmentProfile
  , OLD.alignmentProfileName
  , OLD.description
  , OLD.parameters
  , OLD.isActive
  , OLD.idAlignmentPlatform
  , OLD.idSeqRunType );
END;
$$


--
-- Audit Table For analysiscollaborator 
--

CREATE TABLE IF NOT EXISTS `analysiscollaborator_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`canUploadData`  char(1)  NULL DEFAULT NULL
 ,`canUpdate`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysiscollaborator 
--

INSERT INTO analysiscollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idAppUser
  , canUploadData
  , canUpdate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysis
  , idAppUser
  , canUploadData
  , canUpdate
  FROM analysiscollaborator
  WHERE NOT EXISTS(SELECT * FROM analysiscollaborator_Audit)
$$

--
-- Audit Triggers For analysiscollaborator 
--


CREATE TRIGGER TrAI_analysiscollaborator_FER AFTER INSERT ON analysiscollaborator FOR EACH ROW
BEGIN
  INSERT INTO analysiscollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.idAppUser
  , NEW.canUploadData
  , NEW.canUpdate );
END;
$$


CREATE TRIGGER TrAU_analysiscollaborator_FER AFTER UPDATE ON analysiscollaborator FOR EACH ROW
BEGIN
  INSERT INTO analysiscollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.idAppUser
  , NEW.canUploadData
  , NEW.canUpdate );
END;
$$


CREATE TRIGGER TrAD_analysiscollaborator_FER AFTER DELETE ON analysiscollaborator FOR EACH ROW
BEGIN
  INSERT INTO analysiscollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysis
  , OLD.idAppUser
  , OLD.canUploadData
  , OLD.canUpdate );
END;
$$


--
-- Audit Table For analysisexperimentitem 
--

CREATE TABLE IF NOT EXISTS `analysisexperimentitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisExperimentItem`  int(10)  NULL DEFAULT NULL
 ,`idSequenceLane`  int(10)  NULL DEFAULT NULL
 ,`idHybridization`  int(10)  NULL DEFAULT NULL
 ,`comments`  varchar(2000)  NULL DEFAULT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisexperimentitem 
--

INSERT INTO analysisexperimentitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisExperimentItem
  , idSequenceLane
  , idHybridization
  , comments
  , idAnalysis
  , idRequest
  , idSample )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisExperimentItem
  , idSequenceLane
  , idHybridization
  , comments
  , idAnalysis
  , idRequest
  , idSample
  FROM analysisexperimentitem
  WHERE NOT EXISTS(SELECT * FROM analysisexperimentitem_Audit)
$$

--
-- Audit Triggers For analysisexperimentitem 
--


CREATE TRIGGER TrAI_analysisexperimentitem_FER AFTER INSERT ON analysisexperimentitem FOR EACH ROW
BEGIN
  INSERT INTO analysisexperimentitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisExperimentItem
  , idSequenceLane
  , idHybridization
  , comments
  , idAnalysis
  , idRequest
  , idSample )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisExperimentItem
  , NEW.idSequenceLane
  , NEW.idHybridization
  , NEW.comments
  , NEW.idAnalysis
  , NEW.idRequest
  , NEW.idSample );
END;
$$


CREATE TRIGGER TrAU_analysisexperimentitem_FER AFTER UPDATE ON analysisexperimentitem FOR EACH ROW
BEGIN
  INSERT INTO analysisexperimentitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisExperimentItem
  , idSequenceLane
  , idHybridization
  , comments
  , idAnalysis
  , idRequest
  , idSample )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisExperimentItem
  , NEW.idSequenceLane
  , NEW.idHybridization
  , NEW.comments
  , NEW.idAnalysis
  , NEW.idRequest
  , NEW.idSample );
END;
$$


CREATE TRIGGER TrAD_analysisexperimentitem_FER AFTER DELETE ON analysisexperimentitem FOR EACH ROW
BEGIN
  INSERT INTO analysisexperimentitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisExperimentItem
  , idSequenceLane
  , idHybridization
  , comments
  , idAnalysis
  , idRequest
  , idSample )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisExperimentItem
  , OLD.idSequenceLane
  , OLD.idHybridization
  , OLD.comments
  , OLD.idAnalysis
  , OLD.idRequest
  , OLD.idSample );
END;
$$


--
-- Audit Table For analysisfile 
--

CREATE TABLE IF NOT EXISTS `analysisfile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisFile`  int(10)  NULL DEFAULT NULL
 ,`fileName`  varchar(2000)  NULL DEFAULT NULL
 ,`fileSize`  decimal(14,0)  NULL DEFAULT NULL
 ,`comments`  varchar(2000)  NULL DEFAULT NULL
 ,`uploadDate`  datetime  NULL DEFAULT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`qualifiedFilePath`  varchar(300)  NULL DEFAULT NULL
 ,`baseFilePath`  varchar(300)  NULL DEFAULT NULL
 ,`createDate`  date  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisfile 
--

INSERT INTO analysisfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisFile
  , fileName
  , fileSize
  , comments
  , uploadDate
  , idAnalysis
  , qualifiedFilePath
  , baseFilePath
  , createDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisFile
  , fileName
  , fileSize
  , comments
  , uploadDate
  , idAnalysis
  , qualifiedFilePath
  , baseFilePath
  , createDate
  FROM analysisfile
  WHERE NOT EXISTS(SELECT * FROM analysisfile_Audit)
$$

--
-- Audit Triggers For analysisfile 
--


CREATE TRIGGER TrAI_analysisfile_FER AFTER INSERT ON analysisfile FOR EACH ROW
BEGIN
  INSERT INTO analysisfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisFile
  , fileName
  , fileSize
  , comments
  , uploadDate
  , idAnalysis
  , qualifiedFilePath
  , baseFilePath
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisFile
  , NEW.fileName
  , NEW.fileSize
  , NEW.comments
  , NEW.uploadDate
  , NEW.idAnalysis
  , NEW.qualifiedFilePath
  , NEW.baseFilePath
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAU_analysisfile_FER AFTER UPDATE ON analysisfile FOR EACH ROW
BEGIN
  INSERT INTO analysisfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisFile
  , fileName
  , fileSize
  , comments
  , uploadDate
  , idAnalysis
  , qualifiedFilePath
  , baseFilePath
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisFile
  , NEW.fileName
  , NEW.fileSize
  , NEW.comments
  , NEW.uploadDate
  , NEW.idAnalysis
  , NEW.qualifiedFilePath
  , NEW.baseFilePath
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAD_analysisfile_FER AFTER DELETE ON analysisfile FOR EACH ROW
BEGIN
  INSERT INTO analysisfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisFile
  , fileName
  , fileSize
  , comments
  , uploadDate
  , idAnalysis
  , qualifiedFilePath
  , baseFilePath
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisFile
  , OLD.fileName
  , OLD.fileSize
  , OLD.comments
  , OLD.uploadDate
  , OLD.idAnalysis
  , OLD.qualifiedFilePath
  , OLD.baseFilePath
  , OLD.createDate );
END;
$$


--
-- Audit Table For analysisgenomebuild 
--

CREATE TABLE IF NOT EXISTS `analysisgenomebuild_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisgenomebuild 
--

INSERT INTO analysisgenomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idGenomeBuild )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysis
  , idGenomeBuild
  FROM analysisgenomebuild
  WHERE NOT EXISTS(SELECT * FROM analysisgenomebuild_Audit)
$$

--
-- Audit Triggers For analysisgenomebuild 
--


CREATE TRIGGER TrAI_analysisgenomebuild_FER AFTER INSERT ON analysisgenomebuild FOR EACH ROW
BEGIN
  INSERT INTO analysisgenomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAU_analysisgenomebuild_FER AFTER UPDATE ON analysisgenomebuild FOR EACH ROW
BEGIN
  INSERT INTO analysisgenomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAD_analysisgenomebuild_FER AFTER DELETE ON analysisgenomebuild FOR EACH ROW
BEGIN
  INSERT INTO analysisgenomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysis
  , OLD.idGenomeBuild );
END;
$$


--
-- Audit Table For analysisgroupitem 
--

CREATE TABLE IF NOT EXISTS `analysisgroupitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisGroup`  int(10)  NULL DEFAULT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisgroupitem 
--

INSERT INTO analysisgroupitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , idAnalysis )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisGroup
  , idAnalysis
  FROM analysisgroupitem
  WHERE NOT EXISTS(SELECT * FROM analysisgroupitem_Audit)
$$

--
-- Audit Triggers For analysisgroupitem 
--


CREATE TRIGGER TrAI_analysisgroupitem_FER AFTER INSERT ON analysisgroupitem FOR EACH ROW
BEGIN
  INSERT INTO analysisgroupitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisGroup
  , NEW.idAnalysis );
END;
$$


CREATE TRIGGER TrAU_analysisgroupitem_FER AFTER UPDATE ON analysisgroupitem FOR EACH ROW
BEGIN
  INSERT INTO analysisgroupitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisGroup
  , NEW.idAnalysis );
END;
$$


CREATE TRIGGER TrAD_analysisgroupitem_FER AFTER DELETE ON analysisgroupitem FOR EACH ROW
BEGIN
  INSERT INTO analysisgroupitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisGroup
  , OLD.idAnalysis );
END;
$$


--
-- Audit Table For analysisgroup 
--

CREATE TABLE IF NOT EXISTS `analysisgroup_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisGroup`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(500)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisgroup 
--

INSERT INTO analysisgroup_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , name
  , description
  , idLab
  , codeVisibility
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisGroup
  , name
  , description
  , idLab
  , codeVisibility
  , idAppUser
  FROM analysisgroup
  WHERE NOT EXISTS(SELECT * FROM analysisgroup_Audit)
$$

--
-- Audit Triggers For analysisgroup 
--


CREATE TRIGGER TrAI_analysisgroup_FER AFTER INSERT ON analysisgroup FOR EACH ROW
BEGIN
  INSERT INTO analysisgroup_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , name
  , description
  , idLab
  , codeVisibility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisGroup
  , NEW.name
  , NEW.description
  , NEW.idLab
  , NEW.codeVisibility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_analysisgroup_FER AFTER UPDATE ON analysisgroup FOR EACH ROW
BEGIN
  INSERT INTO analysisgroup_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , name
  , description
  , idLab
  , codeVisibility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisGroup
  , NEW.name
  , NEW.description
  , NEW.idLab
  , NEW.codeVisibility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_analysisgroup_FER AFTER DELETE ON analysisgroup FOR EACH ROW
BEGIN
  INSERT INTO analysisgroup_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisGroup
  , name
  , description
  , idLab
  , codeVisibility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisGroup
  , OLD.name
  , OLD.description
  , OLD.idLab
  , OLD.codeVisibility
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For analysisprotocol 
--

CREATE TABLE IF NOT EXISTS `analysisprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisProtocol`  int(10)  NULL DEFAULT NULL
 ,`analysisProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`idAnalysisType`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysisprotocol 
--

INSERT INTO analysisprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisProtocol
  , analysisProtocol
  , description
  , url
  , idAnalysisType
  , isActive
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisProtocol
  , analysisProtocol
  , description
  , url
  , idAnalysisType
  , isActive
  , idAppUser
  FROM analysisprotocol
  WHERE NOT EXISTS(SELECT * FROM analysisprotocol_Audit)
$$

--
-- Audit Triggers For analysisprotocol 
--


CREATE TRIGGER TrAI_analysisprotocol_FER AFTER INSERT ON analysisprotocol FOR EACH ROW
BEGIN
  INSERT INTO analysisprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisProtocol
  , analysisProtocol
  , description
  , url
  , idAnalysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisProtocol
  , NEW.analysisProtocol
  , NEW.description
  , NEW.url
  , NEW.idAnalysisType
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_analysisprotocol_FER AFTER UPDATE ON analysisprotocol FOR EACH ROW
BEGIN
  INSERT INTO analysisprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisProtocol
  , analysisProtocol
  , description
  , url
  , idAnalysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisProtocol
  , NEW.analysisProtocol
  , NEW.description
  , NEW.url
  , NEW.idAnalysisType
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_analysisprotocol_FER AFTER DELETE ON analysisprotocol FOR EACH ROW
BEGIN
  INSERT INTO analysisprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisProtocol
  , analysisProtocol
  , description
  , url
  , idAnalysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisProtocol
  , OLD.analysisProtocol
  , OLD.description
  , OLD.url
  , OLD.idAnalysisType
  , OLD.isActive
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For analysistotopic 
--

CREATE TABLE IF NOT EXISTS `analysistotopic_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idTopic`  int(10)  NULL DEFAULT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysistotopic 
--

INSERT INTO analysistotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idAnalysis )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idTopic
  , idAnalysis
  FROM analysistotopic
  WHERE NOT EXISTS(SELECT * FROM analysistotopic_Audit)
$$

--
-- Audit Triggers For analysistotopic 
--


CREATE TRIGGER TrAI_analysistotopic_FER AFTER INSERT ON analysistotopic FOR EACH ROW
BEGIN
  INSERT INTO analysistotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idAnalysis );
END;
$$


CREATE TRIGGER TrAU_analysistotopic_FER AFTER UPDATE ON analysistotopic FOR EACH ROW
BEGIN
  INSERT INTO analysistotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idAnalysis );
END;
$$


CREATE TRIGGER TrAD_analysistotopic_FER AFTER DELETE ON analysistotopic FOR EACH ROW
BEGIN
  INSERT INTO analysistotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idTopic
  , OLD.idAnalysis );
END;
$$


--
-- Audit Table For analysistype 
--

CREATE TABLE IF NOT EXISTS `analysistype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysisType`  int(10)  NULL DEFAULT NULL
 ,`analysisType`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysistype 
--

INSERT INTO analysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisType
  , analysisType
  , isActive
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysisType
  , analysisType
  , isActive
  , idAppUser
  FROM analysistype
  WHERE NOT EXISTS(SELECT * FROM analysistype_Audit)
$$

--
-- Audit Triggers For analysistype 
--


CREATE TRIGGER TrAI_analysistype_FER AFTER INSERT ON analysistype FOR EACH ROW
BEGIN
  INSERT INTO analysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisType
  , analysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysisType
  , NEW.analysisType
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_analysistype_FER AFTER UPDATE ON analysistype FOR EACH ROW
BEGIN
  INSERT INTO analysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisType
  , analysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysisType
  , NEW.analysisType
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_analysistype_FER AFTER DELETE ON analysistype FOR EACH ROW
BEGIN
  INSERT INTO analysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysisType
  , analysisType
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysisType
  , OLD.analysisType
  , OLD.isActive
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For analysis 
--

CREATE TABLE IF NOT EXISTS `analysis_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAnalysisType`  int(10)  NULL DEFAULT NULL
 ,`idAnalysisProtocol`  int(10)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`privacyExpirationDate`  datetime  NULL DEFAULT NULL
 ,`idSubmitter`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for analysis 
--

INSERT INTO analysis_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , number
  , name
  , description
  , idLab
  , idAnalysisType
  , idAnalysisProtocol
  , idOrganism
  , codeVisibility
  , createDate
  , idAppUser
  , idInstitution
  , idCoreFacility
  , privacyExpirationDate
  , idSubmitter )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnalysis
  , number
  , name
  , description
  , idLab
  , idAnalysisType
  , idAnalysisProtocol
  , idOrganism
  , codeVisibility
  , createDate
  , idAppUser
  , idInstitution
  , idCoreFacility
  , privacyExpirationDate
  , idSubmitter
  FROM analysis
  WHERE NOT EXISTS(SELECT * FROM analysis_Audit)
$$

--
-- Audit Triggers For analysis 
--


CREATE TRIGGER TrAI_analysis_FER AFTER INSERT ON analysis FOR EACH ROW
BEGIN
  INSERT INTO analysis_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , number
  , name
  , description
  , idLab
  , idAnalysisType
  , idAnalysisProtocol
  , idOrganism
  , codeVisibility
  , createDate
  , idAppUser
  , idInstitution
  , idCoreFacility
  , privacyExpirationDate
  , idSubmitter )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.number
  , NEW.name
  , NEW.description
  , NEW.idLab
  , NEW.idAnalysisType
  , NEW.idAnalysisProtocol
  , NEW.idOrganism
  , NEW.codeVisibility
  , NEW.createDate
  , NEW.idAppUser
  , NEW.idInstitution
  , NEW.idCoreFacility
  , NEW.privacyExpirationDate
  , NEW.idSubmitter );
END;
$$


CREATE TRIGGER TrAU_analysis_FER AFTER UPDATE ON analysis FOR EACH ROW
BEGIN
  INSERT INTO analysis_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , number
  , name
  , description
  , idLab
  , idAnalysisType
  , idAnalysisProtocol
  , idOrganism
  , codeVisibility
  , createDate
  , idAppUser
  , idInstitution
  , idCoreFacility
  , privacyExpirationDate
  , idSubmitter )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnalysis
  , NEW.number
  , NEW.name
  , NEW.description
  , NEW.idLab
  , NEW.idAnalysisType
  , NEW.idAnalysisProtocol
  , NEW.idOrganism
  , NEW.codeVisibility
  , NEW.createDate
  , NEW.idAppUser
  , NEW.idInstitution
  , NEW.idCoreFacility
  , NEW.privacyExpirationDate
  , NEW.idSubmitter );
END;
$$


CREATE TRIGGER TrAD_analysis_FER AFTER DELETE ON analysis FOR EACH ROW
BEGIN
  INSERT INTO analysis_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnalysis
  , number
  , name
  , description
  , idLab
  , idAnalysisType
  , idAnalysisProtocol
  , idOrganism
  , codeVisibility
  , createDate
  , idAppUser
  , idInstitution
  , idCoreFacility
  , privacyExpirationDate
  , idSubmitter )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnalysis
  , OLD.number
  , OLD.name
  , OLD.description
  , OLD.idLab
  , OLD.idAnalysisType
  , OLD.idAnalysisProtocol
  , OLD.idOrganism
  , OLD.codeVisibility
  , OLD.createDate
  , OLD.idAppUser
  , OLD.idInstitution
  , OLD.idCoreFacility
  , OLD.privacyExpirationDate
  , OLD.idSubmitter );
END;
$$


--
-- Audit Table For annotationreportfield 
--

CREATE TABLE IF NOT EXISTS `annotationreportfield_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAnnotationReportField`  int(10)  NULL DEFAULT NULL
 ,`source`  varchar(50)  NULL DEFAULT NULL
 ,`fieldName`  varchar(50)  NULL DEFAULT NULL
 ,`display`  varchar(50)  NULL DEFAULT NULL
 ,`isCustom`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`dictionaryLookUpTable`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for annotationreportfield 
--

INSERT INTO annotationreportfield_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnnotationReportField
  , source
  , fieldName
  , display
  , isCustom
  , sortOrder
  , dictionaryLookUpTable )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAnnotationReportField
  , source
  , fieldName
  , display
  , isCustom
  , sortOrder
  , dictionaryLookUpTable
  FROM annotationreportfield
  WHERE NOT EXISTS(SELECT * FROM annotationreportfield_Audit)
$$

--
-- Audit Triggers For annotationreportfield 
--


CREATE TRIGGER TrAI_annotationreportfield_FER AFTER INSERT ON annotationreportfield FOR EACH ROW
BEGIN
  INSERT INTO annotationreportfield_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnnotationReportField
  , source
  , fieldName
  , display
  , isCustom
  , sortOrder
  , dictionaryLookUpTable )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAnnotationReportField
  , NEW.source
  , NEW.fieldName
  , NEW.display
  , NEW.isCustom
  , NEW.sortOrder
  , NEW.dictionaryLookUpTable );
END;
$$


CREATE TRIGGER TrAU_annotationreportfield_FER AFTER UPDATE ON annotationreportfield FOR EACH ROW
BEGIN
  INSERT INTO annotationreportfield_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnnotationReportField
  , source
  , fieldName
  , display
  , isCustom
  , sortOrder
  , dictionaryLookUpTable )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAnnotationReportField
  , NEW.source
  , NEW.fieldName
  , NEW.display
  , NEW.isCustom
  , NEW.sortOrder
  , NEW.dictionaryLookUpTable );
END;
$$


CREATE TRIGGER TrAD_annotationreportfield_FER AFTER DELETE ON annotationreportfield FOR EACH ROW
BEGIN
  INSERT INTO annotationreportfield_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAnnotationReportField
  , source
  , fieldName
  , display
  , isCustom
  , sortOrder
  , dictionaryLookUpTable )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAnnotationReportField
  , OLD.source
  , OLD.fieldName
  , OLD.display
  , OLD.isCustom
  , OLD.sortOrder
  , OLD.dictionaryLookUpTable );
END;
$$


--
-- Audit Table For applicationtheme 
--

CREATE TABLE IF NOT EXISTS `applicationtheme_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idApplicationTheme`  int(10)  NULL DEFAULT NULL
 ,`applicationTheme`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for applicationtheme 
--

INSERT INTO applicationtheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idApplicationTheme
  , applicationTheme
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idApplicationTheme
  , applicationTheme
  , isActive
  , sortOrder
  FROM applicationtheme
  WHERE NOT EXISTS(SELECT * FROM applicationtheme_Audit)
$$

--
-- Audit Triggers For applicationtheme 
--


CREATE TRIGGER TrAI_applicationtheme_FER AFTER INSERT ON applicationtheme FOR EACH ROW
BEGIN
  INSERT INTO applicationtheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idApplicationTheme
  , applicationTheme
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idApplicationTheme
  , NEW.applicationTheme
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_applicationtheme_FER AFTER UPDATE ON applicationtheme FOR EACH ROW
BEGIN
  INSERT INTO applicationtheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idApplicationTheme
  , applicationTheme
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idApplicationTheme
  , NEW.applicationTheme
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_applicationtheme_FER AFTER DELETE ON applicationtheme FOR EACH ROW
BEGIN
  INSERT INTO applicationtheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idApplicationTheme
  , applicationTheme
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idApplicationTheme
  , OLD.applicationTheme
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For applicationtype 
--

CREATE TABLE IF NOT EXISTS `applicationtype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeApplicationType`  varchar(10)  NULL DEFAULT NULL
 ,`applicationType`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for applicationtype 
--

INSERT INTO applicationtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplicationType
  , applicationType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeApplicationType
  , applicationType
  FROM applicationtype
  WHERE NOT EXISTS(SELECT * FROM applicationtype_Audit)
$$

--
-- Audit Triggers For applicationtype 
--


CREATE TRIGGER TrAI_applicationtype_FER AFTER INSERT ON applicationtype FOR EACH ROW
BEGIN
  INSERT INTO applicationtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplicationType
  , applicationType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeApplicationType
  , NEW.applicationType );
END;
$$


CREATE TRIGGER TrAU_applicationtype_FER AFTER UPDATE ON applicationtype FOR EACH ROW
BEGIN
  INSERT INTO applicationtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplicationType
  , applicationType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeApplicationType
  , NEW.applicationType );
END;
$$


CREATE TRIGGER TrAD_applicationtype_FER AFTER DELETE ON applicationtype FOR EACH ROW
BEGIN
  INSERT INTO applicationtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplicationType
  , applicationType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeApplicationType
  , OLD.applicationType );
END;
$$


--
-- Audit Table For application 
--

CREATE TABLE IF NOT EXISTS `application_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`application`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idApplicationTheme`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`avgInsertSizeFrom`  int(10)  NULL DEFAULT NULL
 ,`avgInsertSizeTo`  int(10)  NULL DEFAULT NULL
 ,`hasCaptureLibDesign`  char(1)  NULL DEFAULT NULL
 ,`coreSteps`  varchar(5000)  NULL DEFAULT NULL
 ,`coreStepsNoLibPrep`  varchar(5000)  NULL DEFAULT NULL
 ,`codeApplicationType`  varchar(10)  NULL DEFAULT NULL
 ,`onlyForLabPrepped`  char(1)  NULL DEFAULT NULL
 ,`samplesPerBatch`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`hasChipTypes`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for application 
--

INSERT INTO application_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplication
  , application
  , isActive
  , idApplicationTheme
  , sortOrder
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , hasCaptureLibDesign
  , coreSteps
  , coreStepsNoLibPrep
  , codeApplicationType
  , onlyForLabPrepped
  , samplesPerBatch
  , idCoreFacility
  , hasChipTypes )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeApplication
  , application
  , isActive
  , idApplicationTheme
  , sortOrder
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , hasCaptureLibDesign
  , coreSteps
  , coreStepsNoLibPrep
  , codeApplicationType
  , onlyForLabPrepped
  , samplesPerBatch
  , idCoreFacility
  , hasChipTypes
  FROM application
  WHERE NOT EXISTS(SELECT * FROM application_Audit)
$$

--
-- Audit Triggers For application 
--


CREATE TRIGGER TrAI_application_FER AFTER INSERT ON application FOR EACH ROW
BEGIN
  INSERT INTO application_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplication
  , application
  , isActive
  , idApplicationTheme
  , sortOrder
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , hasCaptureLibDesign
  , coreSteps
  , coreStepsNoLibPrep
  , codeApplicationType
  , onlyForLabPrepped
  , samplesPerBatch
  , idCoreFacility
  , hasChipTypes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeApplication
  , NEW.application
  , NEW.isActive
  , NEW.idApplicationTheme
  , NEW.sortOrder
  , NEW.avgInsertSizeFrom
  , NEW.avgInsertSizeTo
  , NEW.hasCaptureLibDesign
  , NEW.coreSteps
  , NEW.coreStepsNoLibPrep
  , NEW.codeApplicationType
  , NEW.onlyForLabPrepped
  , NEW.samplesPerBatch
  , NEW.idCoreFacility
  , NEW.hasChipTypes );
END;
$$


CREATE TRIGGER TrAU_application_FER AFTER UPDATE ON application FOR EACH ROW
BEGIN
  INSERT INTO application_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplication
  , application
  , isActive
  , idApplicationTheme
  , sortOrder
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , hasCaptureLibDesign
  , coreSteps
  , coreStepsNoLibPrep
  , codeApplicationType
  , onlyForLabPrepped
  , samplesPerBatch
  , idCoreFacility
  , hasChipTypes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeApplication
  , NEW.application
  , NEW.isActive
  , NEW.idApplicationTheme
  , NEW.sortOrder
  , NEW.avgInsertSizeFrom
  , NEW.avgInsertSizeTo
  , NEW.hasCaptureLibDesign
  , NEW.coreSteps
  , NEW.coreStepsNoLibPrep
  , NEW.codeApplicationType
  , NEW.onlyForLabPrepped
  , NEW.samplesPerBatch
  , NEW.idCoreFacility
  , NEW.hasChipTypes );
END;
$$


CREATE TRIGGER TrAD_application_FER AFTER DELETE ON application FOR EACH ROW
BEGIN
  INSERT INTO application_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeApplication
  , application
  , isActive
  , idApplicationTheme
  , sortOrder
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , hasCaptureLibDesign
  , coreSteps
  , coreStepsNoLibPrep
  , codeApplicationType
  , onlyForLabPrepped
  , samplesPerBatch
  , idCoreFacility
  , hasChipTypes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeApplication
  , OLD.application
  , OLD.isActive
  , OLD.idApplicationTheme
  , OLD.sortOrder
  , OLD.avgInsertSizeFrom
  , OLD.avgInsertSizeTo
  , OLD.hasCaptureLibDesign
  , OLD.coreSteps
  , OLD.coreStepsNoLibPrep
  , OLD.codeApplicationType
  , OLD.onlyForLabPrepped
  , OLD.samplesPerBatch
  , OLD.idCoreFacility
  , OLD.hasChipTypes );
END;
$$


--
-- Audit Table For appuser 
--

CREATE TABLE IF NOT EXISTS `appuser_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`lastName`  varchar(200)  NULL DEFAULT NULL
 ,`firstName`  varchar(200)  NULL DEFAULT NULL
 ,`uNID`  varchar(50)  NULL DEFAULT NULL
 ,`email`  varchar(200)  NULL DEFAULT NULL
 ,`phone`  varchar(50)  NULL DEFAULT NULL
 ,`department`  varchar(100)  NULL DEFAULT NULL
 ,`institute`  varchar(100)  NULL DEFAULT NULL
 ,`jobTitle`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`codeUserPermissionKind`  varchar(10)  NULL DEFAULT NULL
 ,`userNameExternal`  varchar(100)  NULL DEFAULT NULL
 ,`passwordExternal`  varchar(100)  NULL DEFAULT NULL
 ,`ucscUrl`  varchar(250)  NULL DEFAULT NULL
 ,`salt`  varchar(300)  NULL DEFAULT NULL
 ,`guid`  varchar(100)  NULL DEFAULT NULL
 ,`guidExpiration`  datetime  NULL DEFAULT NULL
 ,`passwordExpired`  char(1)  NULL DEFAULT NULL
 ,`confirmEmailGuid`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for appuser 
--

INSERT INTO appuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAppUser
  , lastName
  , firstName
  , uNID
  , email
  , phone
  , department
  , institute
  , jobTitle
  , isActive
  , codeUserPermissionKind
  , userNameExternal
  , passwordExternal
  , ucscUrl
  , salt
  , guid
  , guidExpiration
  , passwordExpired
  , confirmEmailGuid )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAppUser
  , lastName
  , firstName
  , uNID
  , email
  , phone
  , department
  , institute
  , jobTitle
  , isActive
  , codeUserPermissionKind
  , userNameExternal
  , passwordExternal
  , ucscUrl
  , salt
  , guid
  , guidExpiration
  , passwordExpired
  , confirmEmailGuid
  FROM appuser
  WHERE NOT EXISTS(SELECT * FROM appuser_Audit)
$$

--
-- Audit Triggers For appuser 
--


CREATE TRIGGER TrAI_appuser_FER AFTER INSERT ON appuser FOR EACH ROW
BEGIN
  INSERT INTO appuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAppUser
  , lastName
  , firstName
  , uNID
  , email
  , phone
  , department
  , institute
  , jobTitle
  , isActive
  , codeUserPermissionKind
  , userNameExternal
  , passwordExternal
  , ucscUrl
  , salt
  , guid
  , guidExpiration
  , passwordExpired
  , confirmEmailGuid )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAppUser
  , NEW.lastName
  , NEW.firstName
  , NEW.uNID
  , NEW.email
  , NEW.phone
  , NEW.department
  , NEW.institute
  , NEW.jobTitle
  , NEW.isActive
  , NEW.codeUserPermissionKind
  , NEW.userNameExternal
  , NEW.passwordExternal
  , NEW.ucscUrl
  , NEW.salt
  , NEW.guid
  , NEW.guidExpiration
  , NEW.passwordExpired
  , NEW.confirmEmailGuid );
END;
$$


CREATE TRIGGER TrAU_appuser_FER AFTER UPDATE ON appuser FOR EACH ROW
BEGIN
  INSERT INTO appuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAppUser
  , lastName
  , firstName
  , uNID
  , email
  , phone
  , department
  , institute
  , jobTitle
  , isActive
  , codeUserPermissionKind
  , userNameExternal
  , passwordExternal
  , ucscUrl
  , salt
  , guid
  , guidExpiration
  , passwordExpired
  , confirmEmailGuid )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAppUser
  , NEW.lastName
  , NEW.firstName
  , NEW.uNID
  , NEW.email
  , NEW.phone
  , NEW.department
  , NEW.institute
  , NEW.jobTitle
  , NEW.isActive
  , NEW.codeUserPermissionKind
  , NEW.userNameExternal
  , NEW.passwordExternal
  , NEW.ucscUrl
  , NEW.salt
  , NEW.guid
  , NEW.guidExpiration
  , NEW.passwordExpired
  , NEW.confirmEmailGuid );
END;
$$


CREATE TRIGGER TrAD_appuser_FER AFTER DELETE ON appuser FOR EACH ROW
BEGIN
  INSERT INTO appuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAppUser
  , lastName
  , firstName
  , uNID
  , email
  , phone
  , department
  , institute
  , jobTitle
  , isActive
  , codeUserPermissionKind
  , userNameExternal
  , passwordExternal
  , ucscUrl
  , salt
  , guid
  , guidExpiration
  , passwordExpired
  , confirmEmailGuid )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAppUser
  , OLD.lastName
  , OLD.firstName
  , OLD.uNID
  , OLD.email
  , OLD.phone
  , OLD.department
  , OLD.institute
  , OLD.jobTitle
  , OLD.isActive
  , OLD.codeUserPermissionKind
  , OLD.userNameExternal
  , OLD.passwordExternal
  , OLD.ucscUrl
  , OLD.salt
  , OLD.guid
  , OLD.guidExpiration
  , OLD.passwordExpired
  , OLD.confirmEmailGuid );
END;
$$


--
-- Audit Table For arraycoordinate 
--

CREATE TABLE IF NOT EXISTS `arraycoordinate_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idArrayCoordinate`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(50)  NULL DEFAULT NULL
 ,`x`  int(10)  NULL DEFAULT NULL
 ,`y`  int(10)  NULL DEFAULT NULL
 ,`idSlideDesign`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for arraycoordinate 
--

INSERT INTO arraycoordinate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayCoordinate
  , name
  , x
  , y
  , idSlideDesign )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idArrayCoordinate
  , name
  , x
  , y
  , idSlideDesign
  FROM arraycoordinate
  WHERE NOT EXISTS(SELECT * FROM arraycoordinate_Audit)
$$

--
-- Audit Triggers For arraycoordinate 
--


CREATE TRIGGER TrAI_arraycoordinate_FER AFTER INSERT ON arraycoordinate FOR EACH ROW
BEGIN
  INSERT INTO arraycoordinate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayCoordinate
  , name
  , x
  , y
  , idSlideDesign )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idArrayCoordinate
  , NEW.name
  , NEW.x
  , NEW.y
  , NEW.idSlideDesign );
END;
$$


CREATE TRIGGER TrAU_arraycoordinate_FER AFTER UPDATE ON arraycoordinate FOR EACH ROW
BEGIN
  INSERT INTO arraycoordinate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayCoordinate
  , name
  , x
  , y
  , idSlideDesign )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idArrayCoordinate
  , NEW.name
  , NEW.x
  , NEW.y
  , NEW.idSlideDesign );
END;
$$


CREATE TRIGGER TrAD_arraycoordinate_FER AFTER DELETE ON arraycoordinate FOR EACH ROW
BEGIN
  INSERT INTO arraycoordinate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayCoordinate
  , name
  , x
  , y
  , idSlideDesign )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idArrayCoordinate
  , OLD.name
  , OLD.x
  , OLD.y
  , OLD.idSlideDesign );
END;
$$


--
-- Audit Table For arraydesign 
--

CREATE TABLE IF NOT EXISTS `arraydesign_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idArrayDesign`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`accessionNumberUArrayExpress`  varchar(100)  NULL DEFAULT NULL
 ,`idArrayCoordinate`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for arraydesign 
--

INSERT INTO arraydesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayDesign
  , name
  , accessionNumberUArrayExpress
  , idArrayCoordinate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idArrayDesign
  , name
  , accessionNumberUArrayExpress
  , idArrayCoordinate
  FROM arraydesign
  WHERE NOT EXISTS(SELECT * FROM arraydesign_Audit)
$$

--
-- Audit Triggers For arraydesign 
--


CREATE TRIGGER TrAI_arraydesign_FER AFTER INSERT ON arraydesign FOR EACH ROW
BEGIN
  INSERT INTO arraydesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayDesign
  , name
  , accessionNumberUArrayExpress
  , idArrayCoordinate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idArrayDesign
  , NEW.name
  , NEW.accessionNumberUArrayExpress
  , NEW.idArrayCoordinate );
END;
$$


CREATE TRIGGER TrAU_arraydesign_FER AFTER UPDATE ON arraydesign FOR EACH ROW
BEGIN
  INSERT INTO arraydesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayDesign
  , name
  , accessionNumberUArrayExpress
  , idArrayCoordinate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idArrayDesign
  , NEW.name
  , NEW.accessionNumberUArrayExpress
  , NEW.idArrayCoordinate );
END;
$$


CREATE TRIGGER TrAD_arraydesign_FER AFTER DELETE ON arraydesign FOR EACH ROW
BEGIN
  INSERT INTO arraydesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idArrayDesign
  , name
  , accessionNumberUArrayExpress
  , idArrayCoordinate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idArrayDesign
  , OLD.name
  , OLD.accessionNumberUArrayExpress
  , OLD.idArrayCoordinate );
END;
$$


--
-- Audit Table For assay 
--

CREATE TABLE IF NOT EXISTS `assay_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idAssay`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(50)  NULL DEFAULT NULL
 ,`description`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for assay 
--

INSERT INTO assay_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAssay
  , name
  , description
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idAssay
  , name
  , description
  , isActive
  FROM assay
  WHERE NOT EXISTS(SELECT * FROM assay_Audit)
$$

--
-- Audit Triggers For assay 
--


CREATE TRIGGER TrAI_assay_FER AFTER INSERT ON assay FOR EACH ROW
BEGIN
  INSERT INTO assay_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAssay
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idAssay
  , NEW.name
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_assay_FER AFTER UPDATE ON assay FOR EACH ROW
BEGIN
  INSERT INTO assay_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAssay
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idAssay
  , NEW.name
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_assay_FER AFTER DELETE ON assay FOR EACH ROW
BEGIN
  INSERT INTO assay_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idAssay
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idAssay
  , OLD.name
  , OLD.description
  , OLD.isActive );
END;
$$


--
-- Audit Table For billingaccountuser 
--

CREATE TABLE IF NOT EXISTS `billingaccountuser_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingaccountuser 
--

INSERT INTO billingaccountuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingAccount
  , idAppUser
  FROM billingaccountuser
  WHERE NOT EXISTS(SELECT * FROM billingaccountuser_Audit)
$$

--
-- Audit Triggers For billingaccountuser 
--


CREATE TRIGGER TrAI_billingaccountuser_FER AFTER INSERT ON billingaccountuser FOR EACH ROW
BEGIN
  INSERT INTO billingaccountuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingAccount
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_billingaccountuser_FER AFTER UPDATE ON billingaccountuser FOR EACH ROW
BEGIN
  INSERT INTO billingaccountuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingAccount
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_billingaccountuser_FER AFTER DELETE ON billingaccountuser FOR EACH ROW
BEGIN
  INSERT INTO billingaccountuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingAccount
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For billingaccount 
--

CREATE TABLE IF NOT EXISTS `billingaccount_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`accountName`  varchar(200)  NULL DEFAULT NULL
 ,`accountNumber`  varchar(100)  NULL DEFAULT NULL
 ,`expirationDate`  datetime  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`accountNumberBus`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberOrg`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberFund`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberActivity`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberProject`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberAccount`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberAu`  varchar(10)  NULL DEFAULT NULL
 ,`accountNumberYear`  varchar(10)  NULL DEFAULT NULL
 ,`idFundingAgency`  int(10)  NULL DEFAULT NULL
 ,`idCreditCardCompany`  int(10)  NULL DEFAULT NULL
 ,`isPO`  char(1)  NULL DEFAULT NULL
 ,`isCreditCard`  char(1)  NULL DEFAULT NULL
 ,`zipCode`  varchar(20)  NULL DEFAULT NULL
 ,`isApproved`  char(1)  NULL DEFAULT NULL
 ,`approvedDate`  datetime  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`submitterEmail`  varchar(200)  NULL DEFAULT NULL
 ,`submitterUID`  varchar(50)  NULL DEFAULT NULL
 ,`totalDollarAmount`  decimal(12,2)  NULL DEFAULT NULL
 ,`purchaseOrderForm`  longblob  NULL DEFAULT NULL
 ,`orderFormFileType`  varchar(10)  NULL DEFAULT NULL
 ,`orderFormFileSize`  bigint(20)  NULL DEFAULT NULL
 ,`shortAcct`  varchar(10)  NULL DEFAULT NULL
 ,`startDate`  datetime  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`custom1`  varchar(50)  NULL DEFAULT NULL
 ,`custom2`  varchar(50)  NULL DEFAULT NULL
 ,`custom3`  varchar(50)  NULL DEFAULT NULL
 ,`approverEmail`  varchar(200)  NULL DEFAULT NULL
 ,`idApprover`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingaccount 
--

INSERT INTO billingaccount_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , accountName
  , accountNumber
  , expirationDate
  , idLab
  , accountNumberBus
  , accountNumberOrg
  , accountNumberFund
  , accountNumberActivity
  , accountNumberProject
  , accountNumberAccount
  , accountNumberAu
  , accountNumberYear
  , idFundingAgency
  , idCreditCardCompany
  , isPO
  , isCreditCard
  , zipCode
  , isApproved
  , approvedDate
  , createDate
  , submitterEmail
  , submitterUID
  , totalDollarAmount
  , purchaseOrderForm
  , orderFormFileType
  , orderFormFileSize
  , shortAcct
  , startDate
  , idCoreFacility
  , custom1
  , custom2
  , custom3
  , approverEmail
  , idApprover )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingAccount
  , accountName
  , accountNumber
  , expirationDate
  , idLab
  , accountNumberBus
  , accountNumberOrg
  , accountNumberFund
  , accountNumberActivity
  , accountNumberProject
  , accountNumberAccount
  , accountNumberAu
  , accountNumberYear
  , idFundingAgency
  , idCreditCardCompany
  , isPO
  , isCreditCard
  , zipCode
  , isApproved
  , approvedDate
  , createDate
  , submitterEmail
  , submitterUID
  , totalDollarAmount
  , purchaseOrderForm
  , orderFormFileType
  , orderFormFileSize
  , shortAcct
  , startDate
  , idCoreFacility
  , custom1
  , custom2
  , custom3
  , approverEmail
  , idApprover
  FROM billingaccount
  WHERE NOT EXISTS(SELECT * FROM billingaccount_Audit)
$$

--
-- Audit Triggers For billingaccount 
--


CREATE TRIGGER TrAI_billingaccount_FER AFTER INSERT ON billingaccount FOR EACH ROW
BEGIN
  INSERT INTO billingaccount_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , accountName
  , accountNumber
  , expirationDate
  , idLab
  , accountNumberBus
  , accountNumberOrg
  , accountNumberFund
  , accountNumberActivity
  , accountNumberProject
  , accountNumberAccount
  , accountNumberAu
  , accountNumberYear
  , idFundingAgency
  , idCreditCardCompany
  , isPO
  , isCreditCard
  , zipCode
  , isApproved
  , approvedDate
  , createDate
  , submitterEmail
  , submitterUID
  , totalDollarAmount
  , purchaseOrderForm
  , orderFormFileType
  , orderFormFileSize
  , shortAcct
  , startDate
  , idCoreFacility
  , custom1
  , custom2
  , custom3
  , approverEmail
  , idApprover )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingAccount
  , NEW.accountName
  , NEW.accountNumber
  , NEW.expirationDate
  , NEW.idLab
  , NEW.accountNumberBus
  , NEW.accountNumberOrg
  , NEW.accountNumberFund
  , NEW.accountNumberActivity
  , NEW.accountNumberProject
  , NEW.accountNumberAccount
  , NEW.accountNumberAu
  , NEW.accountNumberYear
  , NEW.idFundingAgency
  , NEW.idCreditCardCompany
  , NEW.isPO
  , NEW.isCreditCard
  , NEW.zipCode
  , NEW.isApproved
  , NEW.approvedDate
  , NEW.createDate
  , NEW.submitterEmail
  , NEW.submitterUID
  , NEW.totalDollarAmount
  , NEW.purchaseOrderForm
  , NEW.orderFormFileType
  , NEW.orderFormFileSize
  , NEW.shortAcct
  , NEW.startDate
  , NEW.idCoreFacility
  , NEW.custom1
  , NEW.custom2
  , NEW.custom3
  , NEW.approverEmail
  , NEW.idApprover );
END;
$$


CREATE TRIGGER TrAU_billingaccount_FER AFTER UPDATE ON billingaccount FOR EACH ROW
BEGIN
  INSERT INTO billingaccount_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , accountName
  , accountNumber
  , expirationDate
  , idLab
  , accountNumberBus
  , accountNumberOrg
  , accountNumberFund
  , accountNumberActivity
  , accountNumberProject
  , accountNumberAccount
  , accountNumberAu
  , accountNumberYear
  , idFundingAgency
  , idCreditCardCompany
  , isPO
  , isCreditCard
  , zipCode
  , isApproved
  , approvedDate
  , createDate
  , submitterEmail
  , submitterUID
  , totalDollarAmount
  , purchaseOrderForm
  , orderFormFileType
  , orderFormFileSize
  , shortAcct
  , startDate
  , idCoreFacility
  , custom1
  , custom2
  , custom3
  , approverEmail
  , idApprover )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingAccount
  , NEW.accountName
  , NEW.accountNumber
  , NEW.expirationDate
  , NEW.idLab
  , NEW.accountNumberBus
  , NEW.accountNumberOrg
  , NEW.accountNumberFund
  , NEW.accountNumberActivity
  , NEW.accountNumberProject
  , NEW.accountNumberAccount
  , NEW.accountNumberAu
  , NEW.accountNumberYear
  , NEW.idFundingAgency
  , NEW.idCreditCardCompany
  , NEW.isPO
  , NEW.isCreditCard
  , NEW.zipCode
  , NEW.isApproved
  , NEW.approvedDate
  , NEW.createDate
  , NEW.submitterEmail
  , NEW.submitterUID
  , NEW.totalDollarAmount
  , NEW.purchaseOrderForm
  , NEW.orderFormFileType
  , NEW.orderFormFileSize
  , NEW.shortAcct
  , NEW.startDate
  , NEW.idCoreFacility
  , NEW.custom1
  , NEW.custom2
  , NEW.custom3
  , NEW.approverEmail
  , NEW.idApprover );
END;
$$


CREATE TRIGGER TrAD_billingaccount_FER AFTER DELETE ON billingaccount FOR EACH ROW
BEGIN
  INSERT INTO billingaccount_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingAccount
  , accountName
  , accountNumber
  , expirationDate
  , idLab
  , accountNumberBus
  , accountNumberOrg
  , accountNumberFund
  , accountNumberActivity
  , accountNumberProject
  , accountNumberAccount
  , accountNumberAu
  , accountNumberYear
  , idFundingAgency
  , idCreditCardCompany
  , isPO
  , isCreditCard
  , zipCode
  , isApproved
  , approvedDate
  , createDate
  , submitterEmail
  , submitterUID
  , totalDollarAmount
  , purchaseOrderForm
  , orderFormFileType
  , orderFormFileSize
  , shortAcct
  , startDate
  , idCoreFacility
  , custom1
  , custom2
  , custom3
  , approverEmail
  , idApprover )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingAccount
  , OLD.accountName
  , OLD.accountNumber
  , OLD.expirationDate
  , OLD.idLab
  , OLD.accountNumberBus
  , OLD.accountNumberOrg
  , OLD.accountNumberFund
  , OLD.accountNumberActivity
  , OLD.accountNumberProject
  , OLD.accountNumberAccount
  , OLD.accountNumberAu
  , OLD.accountNumberYear
  , OLD.idFundingAgency
  , OLD.idCreditCardCompany
  , OLD.isPO
  , OLD.isCreditCard
  , OLD.zipCode
  , OLD.isApproved
  , OLD.approvedDate
  , OLD.createDate
  , OLD.submitterEmail
  , OLD.submitterUID
  , OLD.totalDollarAmount
  , OLD.purchaseOrderForm
  , OLD.orderFormFileType
  , OLD.orderFormFileSize
  , OLD.shortAcct
  , OLD.startDate
  , OLD.idCoreFacility
  , OLD.custom1
  , OLD.custom2
  , OLD.custom3
  , OLD.approverEmail
  , OLD.idApprover );
END;
$$


--
-- Audit Table For billingchargekind 
--

CREATE TABLE IF NOT EXISTS `billingchargekind_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeBillingChargeKind`  varchar(10)  NULL DEFAULT NULL
 ,`billingChargeKind`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingchargekind 
--

INSERT INTO billingchargekind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingChargeKind
  , billingChargeKind
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeBillingChargeKind
  , billingChargeKind
  , isActive
  FROM billingchargekind
  WHERE NOT EXISTS(SELECT * FROM billingchargekind_Audit)
$$

--
-- Audit Triggers For billingchargekind 
--


CREATE TRIGGER TrAI_billingchargekind_FER AFTER INSERT ON billingchargekind FOR EACH ROW
BEGIN
  INSERT INTO billingchargekind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingChargeKind
  , billingChargeKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeBillingChargeKind
  , NEW.billingChargeKind
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_billingchargekind_FER AFTER UPDATE ON billingchargekind FOR EACH ROW
BEGIN
  INSERT INTO billingchargekind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingChargeKind
  , billingChargeKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeBillingChargeKind
  , NEW.billingChargeKind
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_billingchargekind_FER AFTER DELETE ON billingchargekind FOR EACH ROW
BEGIN
  INSERT INTO billingchargekind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingChargeKind
  , billingChargeKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeBillingChargeKind
  , OLD.billingChargeKind
  , OLD.isActive );
END;
$$


--
-- Audit Table For billingitem 
--

CREATE TABLE IF NOT EXISTS `billingitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingItem`  int(10)  NULL DEFAULT NULL
 ,`codeBillingChargeKind`  varchar(10)  NULL DEFAULT NULL
 ,`category`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(500)  NULL DEFAULT NULL
 ,`qty`  int(10)  NULL DEFAULT NULL
 ,`unitPrice`  decimal(7,2)  NULL DEFAULT NULL
 ,`invoicePrice`  decimal(9,2)  NULL DEFAULT NULL
 ,`idBillingPeriod`  int(10)  NULL DEFAULT NULL
 ,`codeBillingStatus`  varchar(10)  NULL DEFAULT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
 ,`idPrice`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`percentagePrice`  decimal(4,3)  NULL DEFAULT NULL
 ,`notes`  varchar(500)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`completeDate`  datetime  NULL DEFAULT NULL
 ,`splitType`  char(1)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idInvoice`  int(10)  NULL DEFAULT NULL
 ,`idDiskUsageByMonth`  int(10)  NULL DEFAULT NULL
 ,`idProductLineItem`  int(10)  NULL DEFAULT NULL
 ,`tag`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingitem 
--

INSERT INTO billingitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingItem
  , codeBillingChargeKind
  , category
  , description
  , qty
  , unitPrice
  , invoicePrice
  , idBillingPeriod
  , codeBillingStatus
  , idPriceCategory
  , idPrice
  , idRequest
  , idBillingAccount
  , percentagePrice
  , notes
  , idLab
  , completeDate
  , splitType
  , idCoreFacility
  , idInvoice
  , idDiskUsageByMonth
  , idProductLineItem
  , tag )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingItem
  , codeBillingChargeKind
  , category
  , description
  , qty
  , unitPrice
  , invoicePrice
  , idBillingPeriod
  , codeBillingStatus
  , idPriceCategory
  , idPrice
  , idRequest
  , idBillingAccount
  , percentagePrice
  , notes
  , idLab
  , completeDate
  , splitType
  , idCoreFacility
  , idInvoice
  , idDiskUsageByMonth
  , idProductLineItem
  , tag
  FROM billingitem
  WHERE NOT EXISTS(SELECT * FROM billingitem_Audit)
$$

--
-- Audit Triggers For billingitem 
--


CREATE TRIGGER TrAI_billingitem_FER AFTER INSERT ON billingitem FOR EACH ROW
BEGIN
  INSERT INTO billingitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingItem
  , codeBillingChargeKind
  , category
  , description
  , qty
  , unitPrice
  , invoicePrice
  , idBillingPeriod
  , codeBillingStatus
  , idPriceCategory
  , idPrice
  , idRequest
  , idBillingAccount
  , percentagePrice
  , notes
  , idLab
  , completeDate
  , splitType
  , idCoreFacility
  , idInvoice
  , idDiskUsageByMonth
  , idProductLineItem
  , tag )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingItem
  , NEW.codeBillingChargeKind
  , NEW.category
  , NEW.description
  , NEW.qty
  , NEW.unitPrice
  , NEW.invoicePrice
  , NEW.idBillingPeriod
  , NEW.codeBillingStatus
  , NEW.idPriceCategory
  , NEW.idPrice
  , NEW.idRequest
  , NEW.idBillingAccount
  , NEW.percentagePrice
  , NEW.notes
  , NEW.idLab
  , NEW.completeDate
  , NEW.splitType
  , NEW.idCoreFacility
  , NEW.idInvoice
  , NEW.idDiskUsageByMonth
  , NEW.idProductLineItem
  , NEW.tag );
END;
$$


CREATE TRIGGER TrAU_billingitem_FER AFTER UPDATE ON billingitem FOR EACH ROW
BEGIN
  INSERT INTO billingitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingItem
  , codeBillingChargeKind
  , category
  , description
  , qty
  , unitPrice
  , invoicePrice
  , idBillingPeriod
  , codeBillingStatus
  , idPriceCategory
  , idPrice
  , idRequest
  , idBillingAccount
  , percentagePrice
  , notes
  , idLab
  , completeDate
  , splitType
  , idCoreFacility
  , idInvoice
  , idDiskUsageByMonth
  , idProductLineItem
  , tag )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingItem
  , NEW.codeBillingChargeKind
  , NEW.category
  , NEW.description
  , NEW.qty
  , NEW.unitPrice
  , NEW.invoicePrice
  , NEW.idBillingPeriod
  , NEW.codeBillingStatus
  , NEW.idPriceCategory
  , NEW.idPrice
  , NEW.idRequest
  , NEW.idBillingAccount
  , NEW.percentagePrice
  , NEW.notes
  , NEW.idLab
  , NEW.completeDate
  , NEW.splitType
  , NEW.idCoreFacility
  , NEW.idInvoice
  , NEW.idDiskUsageByMonth
  , NEW.idProductLineItem
  , NEW.tag );
END;
$$


CREATE TRIGGER TrAD_billingitem_FER AFTER DELETE ON billingitem FOR EACH ROW
BEGIN
  INSERT INTO billingitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingItem
  , codeBillingChargeKind
  , category
  , description
  , qty
  , unitPrice
  , invoicePrice
  , idBillingPeriod
  , codeBillingStatus
  , idPriceCategory
  , idPrice
  , idRequest
  , idBillingAccount
  , percentagePrice
  , notes
  , idLab
  , completeDate
  , splitType
  , idCoreFacility
  , idInvoice
  , idDiskUsageByMonth
  , idProductLineItem
  , tag )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingItem
  , OLD.codeBillingChargeKind
  , OLD.category
  , OLD.description
  , OLD.qty
  , OLD.unitPrice
  , OLD.invoicePrice
  , OLD.idBillingPeriod
  , OLD.codeBillingStatus
  , OLD.idPriceCategory
  , OLD.idPrice
  , OLD.idRequest
  , OLD.idBillingAccount
  , OLD.percentagePrice
  , OLD.notes
  , OLD.idLab
  , OLD.completeDate
  , OLD.splitType
  , OLD.idCoreFacility
  , OLD.idInvoice
  , OLD.idDiskUsageByMonth
  , OLD.idProductLineItem
  , OLD.tag );
END;
$$


--
-- Audit Table For billingperiod 
--

CREATE TABLE IF NOT EXISTS `billingperiod_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingPeriod`  int(10)  NULL DEFAULT NULL
 ,`billingPeriod`  varchar(50)  NULL DEFAULT NULL
 ,`startDate`  datetime  NULL DEFAULT NULL
 ,`endDate`  datetime  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingperiod 
--

INSERT INTO billingperiod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingPeriod
  , billingPeriod
  , startDate
  , endDate
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingPeriod
  , billingPeriod
  , startDate
  , endDate
  , isActive
  FROM billingperiod
  WHERE NOT EXISTS(SELECT * FROM billingperiod_Audit)
$$

--
-- Audit Triggers For billingperiod 
--


CREATE TRIGGER TrAI_billingperiod_FER AFTER INSERT ON billingperiod FOR EACH ROW
BEGIN
  INSERT INTO billingperiod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingPeriod
  , billingPeriod
  , startDate
  , endDate
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingPeriod
  , NEW.billingPeriod
  , NEW.startDate
  , NEW.endDate
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_billingperiod_FER AFTER UPDATE ON billingperiod FOR EACH ROW
BEGIN
  INSERT INTO billingperiod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingPeriod
  , billingPeriod
  , startDate
  , endDate
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingPeriod
  , NEW.billingPeriod
  , NEW.startDate
  , NEW.endDate
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_billingperiod_FER AFTER DELETE ON billingperiod FOR EACH ROW
BEGIN
  INSERT INTO billingperiod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingPeriod
  , billingPeriod
  , startDate
  , endDate
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingPeriod
  , OLD.billingPeriod
  , OLD.startDate
  , OLD.endDate
  , OLD.isActive );
END;
$$


--
-- Audit Table For billingslideproductclass 
--

CREATE TABLE IF NOT EXISTS `billingslideproductclass_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingSlideProductClass`  int(10)  NULL DEFAULT NULL
 ,`billingSlideProductClass`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingslideproductclass 
--

INSERT INTO billingslideproductclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideProductClass
  , billingSlideProductClass
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingSlideProductClass
  , billingSlideProductClass
  , isActive
  FROM billingslideproductclass
  WHERE NOT EXISTS(SELECT * FROM billingslideproductclass_Audit)
$$

--
-- Audit Triggers For billingslideproductclass 
--


CREATE TRIGGER TrAI_billingslideproductclass_FER AFTER INSERT ON billingslideproductclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideproductclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideProductClass
  , billingSlideProductClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingSlideProductClass
  , NEW.billingSlideProductClass
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_billingslideproductclass_FER AFTER UPDATE ON billingslideproductclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideproductclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideProductClass
  , billingSlideProductClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingSlideProductClass
  , NEW.billingSlideProductClass
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_billingslideproductclass_FER AFTER DELETE ON billingslideproductclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideproductclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideProductClass
  , billingSlideProductClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingSlideProductClass
  , OLD.billingSlideProductClass
  , OLD.isActive );
END;
$$


--
-- Audit Table For billingslideserviceclass 
--

CREATE TABLE IF NOT EXISTS `billingslideserviceclass_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idBillingSlideServiceClass`  int(10)  NULL DEFAULT NULL
 ,`billingSlideServiceClass`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingslideserviceclass 
--

INSERT INTO billingslideserviceclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideServiceClass
  , billingSlideServiceClass
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idBillingSlideServiceClass
  , billingSlideServiceClass
  , isActive
  FROM billingslideserviceclass
  WHERE NOT EXISTS(SELECT * FROM billingslideserviceclass_Audit)
$$

--
-- Audit Triggers For billingslideserviceclass 
--


CREATE TRIGGER TrAI_billingslideserviceclass_FER AFTER INSERT ON billingslideserviceclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideserviceclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideServiceClass
  , billingSlideServiceClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idBillingSlideServiceClass
  , NEW.billingSlideServiceClass
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_billingslideserviceclass_FER AFTER UPDATE ON billingslideserviceclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideserviceclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideServiceClass
  , billingSlideServiceClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idBillingSlideServiceClass
  , NEW.billingSlideServiceClass
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_billingslideserviceclass_FER AFTER DELETE ON billingslideserviceclass FOR EACH ROW
BEGIN
  INSERT INTO billingslideserviceclass_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idBillingSlideServiceClass
  , billingSlideServiceClass
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idBillingSlideServiceClass
  , OLD.billingSlideServiceClass
  , OLD.isActive );
END;
$$


--
-- Audit Table For billingstatus 
--

CREATE TABLE IF NOT EXISTS `billingstatus_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeBillingStatus`  varchar(10)  NULL DEFAULT NULL
 ,`billingStatus`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for billingstatus 
--

INSERT INTO billingstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingStatus
  , billingStatus
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeBillingStatus
  , billingStatus
  , isActive
  FROM billingstatus
  WHERE NOT EXISTS(SELECT * FROM billingstatus_Audit)
$$

--
-- Audit Triggers For billingstatus 
--


CREATE TRIGGER TrAI_billingstatus_FER AFTER INSERT ON billingstatus FOR EACH ROW
BEGIN
  INSERT INTO billingstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingStatus
  , billingStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeBillingStatus
  , NEW.billingStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_billingstatus_FER AFTER UPDATE ON billingstatus FOR EACH ROW
BEGIN
  INSERT INTO billingstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingStatus
  , billingStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeBillingStatus
  , NEW.billingStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_billingstatus_FER AFTER DELETE ON billingstatus FOR EACH ROW
BEGIN
  INSERT INTO billingstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBillingStatus
  , billingStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeBillingStatus
  , OLD.billingStatus
  , OLD.isActive );
END;
$$


--
-- Audit Table For bioanalyzerchiptype 
--

CREATE TABLE IF NOT EXISTS `bioanalyzerchiptype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeBioanalyzerChipType`  varchar(10)  NULL DEFAULT NULL
 ,`bioanalyzerChipType`  varchar(50)  NULL DEFAULT NULL
 ,`concentrationRange`  varchar(50)  NULL DEFAULT NULL
 ,`maxSampleBufferStrength`  varchar(50)  NULL DEFAULT NULL
 ,`costPerSample`  decimal(5,2)  NULL DEFAULT NULL
 ,`sampleWellsPerChip`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`codeConcentrationUnit`  varchar(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`protocolDescription`  longtext  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for bioanalyzerchiptype 
--

INSERT INTO bioanalyzerchiptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBioanalyzerChipType
  , bioanalyzerChipType
  , concentrationRange
  , maxSampleBufferStrength
  , costPerSample
  , sampleWellsPerChip
  , isActive
  , codeConcentrationUnit
  , codeApplication
  , protocolDescription )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeBioanalyzerChipType
  , bioanalyzerChipType
  , concentrationRange
  , maxSampleBufferStrength
  , costPerSample
  , sampleWellsPerChip
  , isActive
  , codeConcentrationUnit
  , codeApplication
  , protocolDescription
  FROM bioanalyzerchiptype
  WHERE NOT EXISTS(SELECT * FROM bioanalyzerchiptype_Audit)
$$

--
-- Audit Triggers For bioanalyzerchiptype 
--


CREATE TRIGGER TrAI_bioanalyzerchiptype_FER AFTER INSERT ON bioanalyzerchiptype FOR EACH ROW
BEGIN
  INSERT INTO bioanalyzerchiptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBioanalyzerChipType
  , bioanalyzerChipType
  , concentrationRange
  , maxSampleBufferStrength
  , costPerSample
  , sampleWellsPerChip
  , isActive
  , codeConcentrationUnit
  , codeApplication
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeBioanalyzerChipType
  , NEW.bioanalyzerChipType
  , NEW.concentrationRange
  , NEW.maxSampleBufferStrength
  , NEW.costPerSample
  , NEW.sampleWellsPerChip
  , NEW.isActive
  , NEW.codeConcentrationUnit
  , NEW.codeApplication
  , NEW.protocolDescription );
END;
$$


CREATE TRIGGER TrAU_bioanalyzerchiptype_FER AFTER UPDATE ON bioanalyzerchiptype FOR EACH ROW
BEGIN
  INSERT INTO bioanalyzerchiptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBioanalyzerChipType
  , bioanalyzerChipType
  , concentrationRange
  , maxSampleBufferStrength
  , costPerSample
  , sampleWellsPerChip
  , isActive
  , codeConcentrationUnit
  , codeApplication
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeBioanalyzerChipType
  , NEW.bioanalyzerChipType
  , NEW.concentrationRange
  , NEW.maxSampleBufferStrength
  , NEW.costPerSample
  , NEW.sampleWellsPerChip
  , NEW.isActive
  , NEW.codeConcentrationUnit
  , NEW.codeApplication
  , NEW.protocolDescription );
END;
$$


CREATE TRIGGER TrAD_bioanalyzerchiptype_FER AFTER DELETE ON bioanalyzerchiptype FOR EACH ROW
BEGIN
  INSERT INTO bioanalyzerchiptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeBioanalyzerChipType
  , bioanalyzerChipType
  , concentrationRange
  , maxSampleBufferStrength
  , costPerSample
  , sampleWellsPerChip
  , isActive
  , codeConcentrationUnit
  , codeApplication
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeBioanalyzerChipType
  , OLD.bioanalyzerChipType
  , OLD.concentrationRange
  , OLD.maxSampleBufferStrength
  , OLD.costPerSample
  , OLD.sampleWellsPerChip
  , OLD.isActive
  , OLD.codeConcentrationUnit
  , OLD.codeApplication
  , OLD.protocolDescription );
END;
$$


--
-- Audit Table For chromatogram 
--

CREATE TABLE IF NOT EXISTS `chromatogram_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idChromatogram`  int(10)  NULL DEFAULT NULL
 ,`idPlateWell`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`displayName`  varchar(200)  NULL DEFAULT NULL
 ,`readLength`  int(10)  NULL DEFAULT NULL
 ,`trimmedLength`  int(11)  NULL DEFAULT NULL
 ,`q20`  int(10)  NULL DEFAULT NULL
 ,`q40`  int(10)  NULL DEFAULT NULL
 ,`aSignalStrength`  int(10)  NULL DEFAULT NULL
 ,`cSignalStrength`  int(10)  NULL DEFAULT NULL
 ,`gSignalStrength`  int(10)  NULL DEFAULT NULL
 ,`tSignalStrength`  int(10)  NULL DEFAULT NULL
 ,`releaseDate`  datetime  NULL DEFAULT NULL
 ,`qualifiedFilePath`  varchar(500)  NULL DEFAULT NULL
 ,`idReleaser`  int(10)  NULL DEFAULT NULL
 ,`lane`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for chromatogram 
--

INSERT INTO chromatogram_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idChromatogram
  , idPlateWell
  , idRequest
  , displayName
  , readLength
  , trimmedLength
  , q20
  , q40
  , aSignalStrength
  , cSignalStrength
  , gSignalStrength
  , tSignalStrength
  , releaseDate
  , qualifiedFilePath
  , idReleaser
  , lane )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idChromatogram
  , idPlateWell
  , idRequest
  , displayName
  , readLength
  , trimmedLength
  , q20
  , q40
  , aSignalStrength
  , cSignalStrength
  , gSignalStrength
  , tSignalStrength
  , releaseDate
  , qualifiedFilePath
  , idReleaser
  , lane
  FROM chromatogram
  WHERE NOT EXISTS(SELECT * FROM chromatogram_Audit)
$$

--
-- Audit Triggers For chromatogram 
--


CREATE TRIGGER TrAI_chromatogram_FER AFTER INSERT ON chromatogram FOR EACH ROW
BEGIN
  INSERT INTO chromatogram_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idChromatogram
  , idPlateWell
  , idRequest
  , displayName
  , readLength
  , trimmedLength
  , q20
  , q40
  , aSignalStrength
  , cSignalStrength
  , gSignalStrength
  , tSignalStrength
  , releaseDate
  , qualifiedFilePath
  , idReleaser
  , lane )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idChromatogram
  , NEW.idPlateWell
  , NEW.idRequest
  , NEW.displayName
  , NEW.readLength
  , NEW.trimmedLength
  , NEW.q20
  , NEW.q40
  , NEW.aSignalStrength
  , NEW.cSignalStrength
  , NEW.gSignalStrength
  , NEW.tSignalStrength
  , NEW.releaseDate
  , NEW.qualifiedFilePath
  , NEW.idReleaser
  , NEW.lane );
END;
$$


CREATE TRIGGER TrAU_chromatogram_FER AFTER UPDATE ON chromatogram FOR EACH ROW
BEGIN
  INSERT INTO chromatogram_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idChromatogram
  , idPlateWell
  , idRequest
  , displayName
  , readLength
  , trimmedLength
  , q20
  , q40
  , aSignalStrength
  , cSignalStrength
  , gSignalStrength
  , tSignalStrength
  , releaseDate
  , qualifiedFilePath
  , idReleaser
  , lane )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idChromatogram
  , NEW.idPlateWell
  , NEW.idRequest
  , NEW.displayName
  , NEW.readLength
  , NEW.trimmedLength
  , NEW.q20
  , NEW.q40
  , NEW.aSignalStrength
  , NEW.cSignalStrength
  , NEW.gSignalStrength
  , NEW.tSignalStrength
  , NEW.releaseDate
  , NEW.qualifiedFilePath
  , NEW.idReleaser
  , NEW.lane );
END;
$$


CREATE TRIGGER TrAD_chromatogram_FER AFTER DELETE ON chromatogram FOR EACH ROW
BEGIN
  INSERT INTO chromatogram_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idChromatogram
  , idPlateWell
  , idRequest
  , displayName
  , readLength
  , trimmedLength
  , q20
  , q40
  , aSignalStrength
  , cSignalStrength
  , gSignalStrength
  , tSignalStrength
  , releaseDate
  , qualifiedFilePath
  , idReleaser
  , lane )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idChromatogram
  , OLD.idPlateWell
  , OLD.idRequest
  , OLD.displayName
  , OLD.readLength
  , OLD.trimmedLength
  , OLD.q20
  , OLD.q40
  , OLD.aSignalStrength
  , OLD.cSignalStrength
  , OLD.gSignalStrength
  , OLD.tSignalStrength
  , OLD.releaseDate
  , OLD.qualifiedFilePath
  , OLD.idReleaser
  , OLD.lane );
END;
$$


--
-- Audit Table For concentrationunit 
--

CREATE TABLE IF NOT EXISTS `concentrationunit_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeConcentrationUnit`  varchar(10)  NULL DEFAULT NULL
 ,`concentrationUnit`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for concentrationunit 
--

INSERT INTO concentrationunit_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeConcentrationUnit
  , concentrationUnit
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeConcentrationUnit
  , concentrationUnit
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  FROM concentrationunit
  WHERE NOT EXISTS(SELECT * FROM concentrationunit_Audit)
$$

--
-- Audit Triggers For concentrationunit 
--


CREATE TRIGGER TrAI_concentrationunit_FER AFTER INSERT ON concentrationunit FOR EACH ROW
BEGIN
  INSERT INTO concentrationunit_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeConcentrationUnit
  , concentrationUnit
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeConcentrationUnit
  , NEW.concentrationUnit
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_concentrationunit_FER AFTER UPDATE ON concentrationunit FOR EACH ROW
BEGIN
  INSERT INTO concentrationunit_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeConcentrationUnit
  , concentrationUnit
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeConcentrationUnit
  , NEW.concentrationUnit
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_concentrationunit_FER AFTER DELETE ON concentrationunit FOR EACH ROW
BEGIN
  INSERT INTO concentrationunit_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeConcentrationUnit
  , concentrationUnit
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeConcentrationUnit
  , OLD.concentrationUnit
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive );
END;
$$


--
-- Audit Table For contextsensitivehelp 
--

CREATE TABLE IF NOT EXISTS `contextsensitivehelp_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idContextSensitiveHelp`  int(10)  NULL DEFAULT NULL
 ,`context1`  varchar(100)  NULL DEFAULT NULL
 ,`context2`  varchar(100)  NULL DEFAULT NULL
 ,`context3`  varchar(100)  NULL DEFAULT NULL
 ,`helpText`  varchar(10000)  NULL DEFAULT NULL
 ,`toolTipText`  varchar(10000)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for contextsensitivehelp 
--

INSERT INTO contextsensitivehelp_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idContextSensitiveHelp
  , context1
  , context2
  , context3
  , helpText
  , toolTipText )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idContextSensitiveHelp
  , context1
  , context2
  , context3
  , helpText
  , toolTipText
  FROM contextsensitivehelp
  WHERE NOT EXISTS(SELECT * FROM contextsensitivehelp_Audit)
$$

--
-- Audit Triggers For contextsensitivehelp 
--


CREATE TRIGGER TrAI_contextsensitivehelp_FER AFTER INSERT ON contextsensitivehelp FOR EACH ROW
BEGIN
  INSERT INTO contextsensitivehelp_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idContextSensitiveHelp
  , context1
  , context2
  , context3
  , helpText
  , toolTipText )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idContextSensitiveHelp
  , NEW.context1
  , NEW.context2
  , NEW.context3
  , NEW.helpText
  , NEW.toolTipText );
END;
$$


CREATE TRIGGER TrAU_contextsensitivehelp_FER AFTER UPDATE ON contextsensitivehelp FOR EACH ROW
BEGIN
  INSERT INTO contextsensitivehelp_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idContextSensitiveHelp
  , context1
  , context2
  , context3
  , helpText
  , toolTipText )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idContextSensitiveHelp
  , NEW.context1
  , NEW.context2
  , NEW.context3
  , NEW.helpText
  , NEW.toolTipText );
END;
$$


CREATE TRIGGER TrAD_contextsensitivehelp_FER AFTER DELETE ON contextsensitivehelp FOR EACH ROW
BEGIN
  INSERT INTO contextsensitivehelp_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idContextSensitiveHelp
  , context1
  , context2
  , context3
  , helpText
  , toolTipText )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idContextSensitiveHelp
  , OLD.context1
  , OLD.context2
  , OLD.context3
  , OLD.helpText
  , OLD.toolTipText );
END;
$$


--
-- Audit Table For corefacilitylab 
--

CREATE TABLE IF NOT EXISTS `corefacilitylab_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for corefacilitylab 
--

INSERT INTO corefacilitylab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idLab )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idCoreFacility
  , idLab
  FROM corefacilitylab
  WHERE NOT EXISTS(SELECT * FROM corefacilitylab_Audit)
$$

--
-- Audit Triggers For corefacilitylab 
--


CREATE TRIGGER TrAI_corefacilitylab_FER AFTER INSERT ON corefacilitylab FOR EACH ROW
BEGIN
  INSERT INTO corefacilitylab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idLab );
END;
$$


CREATE TRIGGER TrAU_corefacilitylab_FER AFTER UPDATE ON corefacilitylab FOR EACH ROW
BEGIN
  INSERT INTO corefacilitylab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idLab );
END;
$$


CREATE TRIGGER TrAD_corefacilitylab_FER AFTER DELETE ON corefacilitylab FOR EACH ROW
BEGIN
  INSERT INTO corefacilitylab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idCoreFacility
  , OLD.idLab );
END;
$$


--
-- Audit Table For corefacilitymanager 
--

CREATE TABLE IF NOT EXISTS `corefacilitymanager_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for corefacilitymanager 
--

INSERT INTO corefacilitymanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idCoreFacility
  , idAppUser
  FROM corefacilitymanager
  WHERE NOT EXISTS(SELECT * FROM corefacilitymanager_Audit)
$$

--
-- Audit Triggers For corefacilitymanager 
--


CREATE TRIGGER TrAI_corefacilitymanager_FER AFTER INSERT ON corefacilitymanager FOR EACH ROW
BEGIN
  INSERT INTO corefacilitymanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_corefacilitymanager_FER AFTER UPDATE ON corefacilitymanager FOR EACH ROW
BEGIN
  INSERT INTO corefacilitymanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_corefacilitymanager_FER AFTER DELETE ON corefacilitymanager FOR EACH ROW
BEGIN
  INSERT INTO corefacilitymanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idCoreFacility
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For corefacilitysubmitter 
--

CREATE TABLE IF NOT EXISTS `corefacilitysubmitter_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for corefacilitysubmitter 
--

INSERT INTO corefacilitysubmitter_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idCoreFacility
  , idAppUser
  FROM corefacilitysubmitter
  WHERE NOT EXISTS(SELECT * FROM corefacilitysubmitter_Audit)
$$

--
-- Audit Triggers For corefacilitysubmitter 
--


CREATE TRIGGER TrAI_corefacilitysubmitter_FER AFTER INSERT ON corefacilitysubmitter FOR EACH ROW
BEGIN
  INSERT INTO corefacilitysubmitter_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_corefacilitysubmitter_FER AFTER UPDATE ON corefacilitysubmitter FOR EACH ROW
BEGIN
  INSERT INTO corefacilitysubmitter_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_corefacilitysubmitter_FER AFTER DELETE ON corefacilitysubmitter FOR EACH ROW
BEGIN
  INSERT INTO corefacilitysubmitter_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idCoreFacility
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For corefacility 
--

CREATE TABLE IF NOT EXISTS `corefacility_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`facilityName`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`showProjectAnnotations`  char(1)  NULL DEFAULT NULL
 ,`description`  varchar(10000)  NULL DEFAULT NULL
 ,`acceptOnlineWorkAuth`  char(1)  NULL DEFAULT NULL
 ,`shortDescription`  varchar(1000)  NULL DEFAULT NULL
 ,`contactName`  varchar(200)  NULL DEFAULT NULL
 ,`contactEmail`  varchar(200)  NULL DEFAULT NULL
 ,`contactPhone`  varchar(200)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`contactImage`  varchar(200)  NULL DEFAULT NULL
 ,`labPhone`  varchar(200)  NULL DEFAULT NULL
 ,`contactRoom`  varchar(200)  NULL DEFAULT NULL
 ,`labRoom`  varchar(200)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for corefacility 
--

INSERT INTO corefacility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , facilityName
  , isActive
  , showProjectAnnotations
  , description
  , acceptOnlineWorkAuth
  , shortDescription
  , contactName
  , contactEmail
  , contactPhone
  , sortOrder
  , contactImage
  , labPhone
  , contactRoom
  , labRoom )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idCoreFacility
  , facilityName
  , isActive
  , showProjectAnnotations
  , description
  , acceptOnlineWorkAuth
  , shortDescription
  , contactName
  , contactEmail
  , contactPhone
  , sortOrder
  , contactImage
  , labPhone
  , contactRoom
  , labRoom
  FROM corefacility
  WHERE NOT EXISTS(SELECT * FROM corefacility_Audit)
$$

--
-- Audit Triggers For corefacility 
--


CREATE TRIGGER TrAI_corefacility_FER AFTER INSERT ON corefacility FOR EACH ROW
BEGIN
  INSERT INTO corefacility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , facilityName
  , isActive
  , showProjectAnnotations
  , description
  , acceptOnlineWorkAuth
  , shortDescription
  , contactName
  , contactEmail
  , contactPhone
  , sortOrder
  , contactImage
  , labPhone
  , contactRoom
  , labRoom )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.facilityName
  , NEW.isActive
  , NEW.showProjectAnnotations
  , NEW.description
  , NEW.acceptOnlineWorkAuth
  , NEW.shortDescription
  , NEW.contactName
  , NEW.contactEmail
  , NEW.contactPhone
  , NEW.sortOrder
  , NEW.contactImage
  , NEW.labPhone
  , NEW.contactRoom
  , NEW.labRoom );
END;
$$


CREATE TRIGGER TrAU_corefacility_FER AFTER UPDATE ON corefacility FOR EACH ROW
BEGIN
  INSERT INTO corefacility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , facilityName
  , isActive
  , showProjectAnnotations
  , description
  , acceptOnlineWorkAuth
  , shortDescription
  , contactName
  , contactEmail
  , contactPhone
  , sortOrder
  , contactImage
  , labPhone
  , contactRoom
  , labRoom )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idCoreFacility
  , NEW.facilityName
  , NEW.isActive
  , NEW.showProjectAnnotations
  , NEW.description
  , NEW.acceptOnlineWorkAuth
  , NEW.shortDescription
  , NEW.contactName
  , NEW.contactEmail
  , NEW.contactPhone
  , NEW.sortOrder
  , NEW.contactImage
  , NEW.labPhone
  , NEW.contactRoom
  , NEW.labRoom );
END;
$$


CREATE TRIGGER TrAD_corefacility_FER AFTER DELETE ON corefacility FOR EACH ROW
BEGIN
  INSERT INTO corefacility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCoreFacility
  , facilityName
  , isActive
  , showProjectAnnotations
  , description
  , acceptOnlineWorkAuth
  , shortDescription
  , contactName
  , contactEmail
  , contactPhone
  , sortOrder
  , contactImage
  , labPhone
  , contactRoom
  , labRoom )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idCoreFacility
  , OLD.facilityName
  , OLD.isActive
  , OLD.showProjectAnnotations
  , OLD.description
  , OLD.acceptOnlineWorkAuth
  , OLD.shortDescription
  , OLD.contactName
  , OLD.contactEmail
  , OLD.contactPhone
  , OLD.sortOrder
  , OLD.contactImage
  , OLD.labPhone
  , OLD.contactRoom
  , OLD.labRoom );
END;
$$


--
-- Audit Table For creditcardcompany 
--

CREATE TABLE IF NOT EXISTS `creditcardcompany_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idCreditCardCompany`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  varchar(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for creditcardcompany 
--

INSERT INTO creditcardcompany_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCreditCardCompany
  , name
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idCreditCardCompany
  , name
  , isActive
  , sortOrder
  FROM creditcardcompany
  WHERE NOT EXISTS(SELECT * FROM creditcardcompany_Audit)
$$

--
-- Audit Triggers For creditcardcompany 
--


CREATE TRIGGER TrAI_creditcardcompany_FER AFTER INSERT ON creditcardcompany FOR EACH ROW
BEGIN
  INSERT INTO creditcardcompany_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCreditCardCompany
  , name
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idCreditCardCompany
  , NEW.name
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_creditcardcompany_FER AFTER UPDATE ON creditcardcompany FOR EACH ROW
BEGIN
  INSERT INTO creditcardcompany_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCreditCardCompany
  , name
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idCreditCardCompany
  , NEW.name
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_creditcardcompany_FER AFTER DELETE ON creditcardcompany FOR EACH ROW
BEGIN
  INSERT INTO creditcardcompany_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idCreditCardCompany
  , name
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idCreditCardCompany
  , OLD.name
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For datatrackcollaborator 
--

CREATE TABLE IF NOT EXISTS `datatrackcollaborator_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatrackcollaborator 
--

INSERT INTO datatrackcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDataTrack
  , idAppUser
  FROM datatrackcollaborator
  WHERE NOT EXISTS(SELECT * FROM datatrackcollaborator_Audit)
$$

--
-- Audit Triggers For datatrackcollaborator 
--


CREATE TRIGGER TrAI_datatrackcollaborator_FER AFTER INSERT ON datatrackcollaborator FOR EACH ROW
BEGIN
  INSERT INTO datatrackcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_datatrackcollaborator_FER AFTER UPDATE ON datatrackcollaborator FOR EACH ROW
BEGIN
  INSERT INTO datatrackcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_datatrackcollaborator_FER AFTER DELETE ON datatrackcollaborator FOR EACH ROW
BEGIN
  INSERT INTO datatrackcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDataTrack
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For datatrackfile 
--

CREATE TABLE IF NOT EXISTS `datatrackfile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDataTrackFile`  int(10)  NULL DEFAULT NULL
 ,`idAnalysisFile`  int(10)  NULL DEFAULT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatrackfile 
--

INSERT INTO datatrackfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFile
  , idAnalysisFile
  , idDataTrack )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDataTrackFile
  , idAnalysisFile
  , idDataTrack
  FROM datatrackfile
  WHERE NOT EXISTS(SELECT * FROM datatrackfile_Audit)
$$

--
-- Audit Triggers For datatrackfile 
--


CREATE TRIGGER TrAI_datatrackfile_FER AFTER INSERT ON datatrackfile FOR EACH ROW
BEGIN
  INSERT INTO datatrackfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFile
  , idAnalysisFile
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDataTrackFile
  , NEW.idAnalysisFile
  , NEW.idDataTrack );
END;
$$


CREATE TRIGGER TrAU_datatrackfile_FER AFTER UPDATE ON datatrackfile FOR EACH ROW
BEGIN
  INSERT INTO datatrackfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFile
  , idAnalysisFile
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDataTrackFile
  , NEW.idAnalysisFile
  , NEW.idDataTrack );
END;
$$


CREATE TRIGGER TrAD_datatrackfile_FER AFTER DELETE ON datatrackfile FOR EACH ROW
BEGIN
  INSERT INTO datatrackfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFile
  , idAnalysisFile
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDataTrackFile
  , OLD.idAnalysisFile
  , OLD.idDataTrack );
END;
$$


--
-- Audit Table For datatrackfolder 
--

CREATE TABLE IF NOT EXISTS `datatrackfolder_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDataTrackFolder`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(2000)  NULL DEFAULT NULL
 ,`description`  varchar(10000)  NULL DEFAULT NULL
 ,`idParentDataTrackFolder`  int(10)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`createdBy`  varchar(200)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatrackfolder 
--

INSERT INTO datatrackfolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFolder
  , name
  , description
  , idParentDataTrackFolder
  , idGenomeBuild
  , idLab
  , createdBy
  , createDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDataTrackFolder
  , name
  , description
  , idParentDataTrackFolder
  , idGenomeBuild
  , idLab
  , createdBy
  , createDate
  FROM datatrackfolder
  WHERE NOT EXISTS(SELECT * FROM datatrackfolder_Audit)
$$

--
-- Audit Triggers For datatrackfolder 
--


CREATE TRIGGER TrAI_datatrackfolder_FER AFTER INSERT ON datatrackfolder FOR EACH ROW
BEGIN
  INSERT INTO datatrackfolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFolder
  , name
  , description
  , idParentDataTrackFolder
  , idGenomeBuild
  , idLab
  , createdBy
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDataTrackFolder
  , NEW.name
  , NEW.description
  , NEW.idParentDataTrackFolder
  , NEW.idGenomeBuild
  , NEW.idLab
  , NEW.createdBy
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAU_datatrackfolder_FER AFTER UPDATE ON datatrackfolder FOR EACH ROW
BEGIN
  INSERT INTO datatrackfolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFolder
  , name
  , description
  , idParentDataTrackFolder
  , idGenomeBuild
  , idLab
  , createdBy
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDataTrackFolder
  , NEW.name
  , NEW.description
  , NEW.idParentDataTrackFolder
  , NEW.idGenomeBuild
  , NEW.idLab
  , NEW.createdBy
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAD_datatrackfolder_FER AFTER DELETE ON datatrackfolder FOR EACH ROW
BEGIN
  INSERT INTO datatrackfolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrackFolder
  , name
  , description
  , idParentDataTrackFolder
  , idGenomeBuild
  , idLab
  , createdBy
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDataTrackFolder
  , OLD.name
  , OLD.description
  , OLD.idParentDataTrackFolder
  , OLD.idGenomeBuild
  , OLD.idLab
  , OLD.createdBy
  , OLD.createDate );
END;
$$


--
-- Audit Table For datatracktofolder 
--

CREATE TABLE IF NOT EXISTS `datatracktofolder_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
 ,`idDataTrackFolder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatracktofolder 
--

INSERT INTO datatracktofolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idDataTrackFolder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDataTrack
  , idDataTrackFolder
  FROM datatracktofolder
  WHERE NOT EXISTS(SELECT * FROM datatracktofolder_Audit)
$$

--
-- Audit Triggers For datatracktofolder 
--


CREATE TRIGGER TrAI_datatracktofolder_FER AFTER INSERT ON datatracktofolder FOR EACH ROW
BEGIN
  INSERT INTO datatracktofolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idDataTrackFolder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.idDataTrackFolder );
END;
$$


CREATE TRIGGER TrAU_datatracktofolder_FER AFTER UPDATE ON datatracktofolder FOR EACH ROW
BEGIN
  INSERT INTO datatracktofolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idDataTrackFolder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.idDataTrackFolder );
END;
$$


CREATE TRIGGER TrAD_datatracktofolder_FER AFTER DELETE ON datatracktofolder FOR EACH ROW
BEGIN
  INSERT INTO datatracktofolder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , idDataTrackFolder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDataTrack
  , OLD.idDataTrackFolder );
END;
$$


--
-- Audit Table For datatracktotopic 
--

CREATE TABLE IF NOT EXISTS `datatracktotopic_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idTopic`  int(10)  NULL DEFAULT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatracktotopic 
--

INSERT INTO datatracktotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idDataTrack )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idTopic
  , idDataTrack
  FROM datatracktotopic
  WHERE NOT EXISTS(SELECT * FROM datatracktotopic_Audit)
$$

--
-- Audit Triggers For datatracktotopic 
--


CREATE TRIGGER TrAI_datatracktotopic_FER AFTER INSERT ON datatracktotopic FOR EACH ROW
BEGIN
  INSERT INTO datatracktotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idDataTrack );
END;
$$


CREATE TRIGGER TrAU_datatracktotopic_FER AFTER UPDATE ON datatracktotopic FOR EACH ROW
BEGIN
  INSERT INTO datatracktotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idDataTrack );
END;
$$


CREATE TRIGGER TrAD_datatracktotopic_FER AFTER DELETE ON datatracktotopic FOR EACH ROW
BEGIN
  INSERT INTO datatracktotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idDataTrack )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idTopic
  , OLD.idDataTrack );
END;
$$


--
-- Audit Table For datatrack 
--

CREATE TABLE IF NOT EXISTS `datatrack_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(2000)  NULL DEFAULT NULL
 ,`description`  varchar(10000)  NULL DEFAULT NULL
 ,`fileName`  varchar(2000)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`summary`  varchar(5000)  NULL DEFAULT NULL
 ,`createdBy`  varchar(200)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`isLoaded`  char(1)  NULL DEFAULT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
 ,`dataPath`  varchar(500)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for datatrack 
--

INSERT INTO datatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , name
  , description
  , fileName
  , idGenomeBuild
  , codeVisibility
  , idAppUser
  , idLab
  , summary
  , createdBy
  , createDate
  , isLoaded
  , idInstitution
  , dataPath )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDataTrack
  , name
  , description
  , fileName
  , idGenomeBuild
  , codeVisibility
  , idAppUser
  , idLab
  , summary
  , createdBy
  , createDate
  , isLoaded
  , idInstitution
  , dataPath
  FROM datatrack
  WHERE NOT EXISTS(SELECT * FROM datatrack_Audit)
$$

--
-- Audit Triggers For datatrack 
--


CREATE TRIGGER TrAI_datatrack_FER AFTER INSERT ON datatrack FOR EACH ROW
BEGIN
  INSERT INTO datatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , name
  , description
  , fileName
  , idGenomeBuild
  , codeVisibility
  , idAppUser
  , idLab
  , summary
  , createdBy
  , createDate
  , isLoaded
  , idInstitution
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.name
  , NEW.description
  , NEW.fileName
  , NEW.idGenomeBuild
  , NEW.codeVisibility
  , NEW.idAppUser
  , NEW.idLab
  , NEW.summary
  , NEW.createdBy
  , NEW.createDate
  , NEW.isLoaded
  , NEW.idInstitution
  , NEW.dataPath );
END;
$$


CREATE TRIGGER TrAU_datatrack_FER AFTER UPDATE ON datatrack FOR EACH ROW
BEGIN
  INSERT INTO datatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , name
  , description
  , fileName
  , idGenomeBuild
  , codeVisibility
  , idAppUser
  , idLab
  , summary
  , createdBy
  , createDate
  , isLoaded
  , idInstitution
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDataTrack
  , NEW.name
  , NEW.description
  , NEW.fileName
  , NEW.idGenomeBuild
  , NEW.codeVisibility
  , NEW.idAppUser
  , NEW.idLab
  , NEW.summary
  , NEW.createdBy
  , NEW.createDate
  , NEW.isLoaded
  , NEW.idInstitution
  , NEW.dataPath );
END;
$$


CREATE TRIGGER TrAD_datatrack_FER AFTER DELETE ON datatrack FOR EACH ROW
BEGIN
  INSERT INTO datatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDataTrack
  , name
  , description
  , fileName
  , idGenomeBuild
  , codeVisibility
  , idAppUser
  , idLab
  , summary
  , createdBy
  , createDate
  , isLoaded
  , idInstitution
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDataTrack
  , OLD.name
  , OLD.description
  , OLD.fileName
  , OLD.idGenomeBuild
  , OLD.codeVisibility
  , OLD.idAppUser
  , OLD.idLab
  , OLD.summary
  , OLD.createdBy
  , OLD.createDate
  , OLD.isLoaded
  , OLD.idInstitution
  , OLD.dataPath );
END;
$$


--
-- Audit Table For diskusagebymonth 
--

CREATE TABLE IF NOT EXISTS `diskusagebymonth_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idDiskUsageByMonth`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`asOfDate`  datetime  NULL DEFAULT NULL
 ,`lastCalcDate`  datetime  NULL DEFAULT NULL
 ,`totalAnalysisDiskSpace`  decimal(16,0)  NULL DEFAULT NULL
 ,`assessedAnalysisDiskSpace`  decimal(16,0)  NULL DEFAULT NULL
 ,`totalExperimentDiskSpace`  decimal(16,0)  NULL DEFAULT NULL
 ,`assessedExperimentDiskSpace`  decimal(16,0)  NULL DEFAULT NULL
 ,`idBillingPeriod`  int(10)  NULL DEFAULT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for diskusagebymonth 
--

INSERT INTO diskusagebymonth_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDiskUsageByMonth
  , idLab
  , asOfDate
  , lastCalcDate
  , totalAnalysisDiskSpace
  , assessedAnalysisDiskSpace
  , totalExperimentDiskSpace
  , assessedExperimentDiskSpace
  , idBillingPeriod
  , idBillingAccount
  , idCoreFacility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idDiskUsageByMonth
  , idLab
  , asOfDate
  , lastCalcDate
  , totalAnalysisDiskSpace
  , assessedAnalysisDiskSpace
  , totalExperimentDiskSpace
  , assessedExperimentDiskSpace
  , idBillingPeriod
  , idBillingAccount
  , idCoreFacility
  FROM diskusagebymonth
  WHERE NOT EXISTS(SELECT * FROM diskusagebymonth_Audit)
$$

--
-- Audit Triggers For diskusagebymonth 
--


CREATE TRIGGER TrAI_diskusagebymonth_FER AFTER INSERT ON diskusagebymonth FOR EACH ROW
BEGIN
  INSERT INTO diskusagebymonth_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDiskUsageByMonth
  , idLab
  , asOfDate
  , lastCalcDate
  , totalAnalysisDiskSpace
  , assessedAnalysisDiskSpace
  , totalExperimentDiskSpace
  , assessedExperimentDiskSpace
  , idBillingPeriod
  , idBillingAccount
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idDiskUsageByMonth
  , NEW.idLab
  , NEW.asOfDate
  , NEW.lastCalcDate
  , NEW.totalAnalysisDiskSpace
  , NEW.assessedAnalysisDiskSpace
  , NEW.totalExperimentDiskSpace
  , NEW.assessedExperimentDiskSpace
  , NEW.idBillingPeriod
  , NEW.idBillingAccount
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAU_diskusagebymonth_FER AFTER UPDATE ON diskusagebymonth FOR EACH ROW
BEGIN
  INSERT INTO diskusagebymonth_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDiskUsageByMonth
  , idLab
  , asOfDate
  , lastCalcDate
  , totalAnalysisDiskSpace
  , assessedAnalysisDiskSpace
  , totalExperimentDiskSpace
  , assessedExperimentDiskSpace
  , idBillingPeriod
  , idBillingAccount
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idDiskUsageByMonth
  , NEW.idLab
  , NEW.asOfDate
  , NEW.lastCalcDate
  , NEW.totalAnalysisDiskSpace
  , NEW.assessedAnalysisDiskSpace
  , NEW.totalExperimentDiskSpace
  , NEW.assessedExperimentDiskSpace
  , NEW.idBillingPeriod
  , NEW.idBillingAccount
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAD_diskusagebymonth_FER AFTER DELETE ON diskusagebymonth FOR EACH ROW
BEGIN
  INSERT INTO diskusagebymonth_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idDiskUsageByMonth
  , idLab
  , asOfDate
  , lastCalcDate
  , totalAnalysisDiskSpace
  , assessedAnalysisDiskSpace
  , totalExperimentDiskSpace
  , assessedExperimentDiskSpace
  , idBillingPeriod
  , idBillingAccount
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idDiskUsageByMonth
  , OLD.idLab
  , OLD.asOfDate
  , OLD.lastCalcDate
  , OLD.totalAnalysisDiskSpace
  , OLD.assessedAnalysisDiskSpace
  , OLD.totalExperimentDiskSpace
  , OLD.assessedExperimentDiskSpace
  , OLD.idBillingPeriod
  , OLD.idBillingAccount
  , OLD.idCoreFacility );
END;
$$


--
-- Audit Table For experimentdesignentry 
--

CREATE TABLE IF NOT EXISTS `experimentdesignentry_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idExperimentDesignEntry`  int(10)  NULL DEFAULT NULL
 ,`codeExperimentDesign`  varchar(10)  NULL DEFAULT NULL
 ,`idProject`  int(10)  NULL DEFAULT NULL
 ,`valueString`  varchar(100)  NULL DEFAULT NULL
 ,`otherLabel`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for experimentdesignentry 
--

INSERT INTO experimentdesignentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentDesignEntry
  , codeExperimentDesign
  , idProject
  , valueString
  , otherLabel )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idExperimentDesignEntry
  , codeExperimentDesign
  , idProject
  , valueString
  , otherLabel
  FROM experimentdesignentry
  WHERE NOT EXISTS(SELECT * FROM experimentdesignentry_Audit)
$$

--
-- Audit Triggers For experimentdesignentry 
--


CREATE TRIGGER TrAI_experimentdesignentry_FER AFTER INSERT ON experimentdesignentry FOR EACH ROW
BEGIN
  INSERT INTO experimentdesignentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentDesignEntry
  , codeExperimentDesign
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idExperimentDesignEntry
  , NEW.codeExperimentDesign
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAU_experimentdesignentry_FER AFTER UPDATE ON experimentdesignentry FOR EACH ROW
BEGIN
  INSERT INTO experimentdesignentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentDesignEntry
  , codeExperimentDesign
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idExperimentDesignEntry
  , NEW.codeExperimentDesign
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAD_experimentdesignentry_FER AFTER DELETE ON experimentdesignentry FOR EACH ROW
BEGIN
  INSERT INTO experimentdesignentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentDesignEntry
  , codeExperimentDesign
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idExperimentDesignEntry
  , OLD.codeExperimentDesign
  , OLD.idProject
  , OLD.valueString
  , OLD.otherLabel );
END;
$$


--
-- Audit Table For experimentdesign 
--

CREATE TABLE IF NOT EXISTS `experimentdesign_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeExperimentDesign`  varchar(10)  NULL DEFAULT NULL
 ,`experimentDesign`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for experimentdesign 
--

INSERT INTO experimentdesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentDesign
  , experimentDesign
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeExperimentDesign
  , experimentDesign
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  FROM experimentdesign
  WHERE NOT EXISTS(SELECT * FROM experimentdesign_Audit)
$$

--
-- Audit Triggers For experimentdesign 
--


CREATE TRIGGER TrAI_experimentdesign_FER AFTER INSERT ON experimentdesign FOR EACH ROW
BEGIN
  INSERT INTO experimentdesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentDesign
  , experimentDesign
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeExperimentDesign
  , NEW.experimentDesign
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_experimentdesign_FER AFTER UPDATE ON experimentdesign FOR EACH ROW
BEGIN
  INSERT INTO experimentdesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentDesign
  , experimentDesign
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeExperimentDesign
  , NEW.experimentDesign
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_experimentdesign_FER AFTER DELETE ON experimentdesign FOR EACH ROW
BEGIN
  INSERT INTO experimentdesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentDesign
  , experimentDesign
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeExperimentDesign
  , OLD.experimentDesign
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For experimentfactorentry 
--

CREATE TABLE IF NOT EXISTS `experimentfactorentry_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idExperimentFactorEntry`  int(10)  NULL DEFAULT NULL
 ,`codeExperimentFactor`  varchar(10)  NULL DEFAULT NULL
 ,`idProject`  int(10)  NULL DEFAULT NULL
 ,`valueString`  varchar(100)  NULL DEFAULT NULL
 ,`otherLabel`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for experimentfactorentry 
--

INSERT INTO experimentfactorentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFactorEntry
  , codeExperimentFactor
  , idProject
  , valueString
  , otherLabel )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idExperimentFactorEntry
  , codeExperimentFactor
  , idProject
  , valueString
  , otherLabel
  FROM experimentfactorentry
  WHERE NOT EXISTS(SELECT * FROM experimentfactorentry_Audit)
$$

--
-- Audit Triggers For experimentfactorentry 
--


CREATE TRIGGER TrAI_experimentfactorentry_FER AFTER INSERT ON experimentfactorentry FOR EACH ROW
BEGIN
  INSERT INTO experimentfactorentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFactorEntry
  , codeExperimentFactor
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idExperimentFactorEntry
  , NEW.codeExperimentFactor
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAU_experimentfactorentry_FER AFTER UPDATE ON experimentfactorentry FOR EACH ROW
BEGIN
  INSERT INTO experimentfactorentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFactorEntry
  , codeExperimentFactor
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idExperimentFactorEntry
  , NEW.codeExperimentFactor
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAD_experimentfactorentry_FER AFTER DELETE ON experimentfactorentry FOR EACH ROW
BEGIN
  INSERT INTO experimentfactorentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFactorEntry
  , codeExperimentFactor
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idExperimentFactorEntry
  , OLD.codeExperimentFactor
  , OLD.idProject
  , OLD.valueString
  , OLD.otherLabel );
END;
$$


--
-- Audit Table For experimentfactor 
--

CREATE TABLE IF NOT EXISTS `experimentfactor_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeExperimentFactor`  varchar(10)  NULL DEFAULT NULL
 ,`experimentFactor`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for experimentfactor 
--

INSERT INTO experimentfactor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentFactor
  , experimentFactor
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeExperimentFactor
  , experimentFactor
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  FROM experimentfactor
  WHERE NOT EXISTS(SELECT * FROM experimentfactor_Audit)
$$

--
-- Audit Triggers For experimentfactor 
--


CREATE TRIGGER TrAI_experimentfactor_FER AFTER INSERT ON experimentfactor FOR EACH ROW
BEGIN
  INSERT INTO experimentfactor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentFactor
  , experimentFactor
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeExperimentFactor
  , NEW.experimentFactor
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_experimentfactor_FER AFTER UPDATE ON experimentfactor FOR EACH ROW
BEGIN
  INSERT INTO experimentfactor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentFactor
  , experimentFactor
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeExperimentFactor
  , NEW.experimentFactor
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_experimentfactor_FER AFTER DELETE ON experimentfactor FOR EACH ROW
BEGIN
  INSERT INTO experimentfactor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeExperimentFactor
  , experimentFactor
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeExperimentFactor
  , OLD.experimentFactor
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For experimentfile 
--

CREATE TABLE IF NOT EXISTS `experimentfile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idExperimentFile`  int(10)  NULL DEFAULT NULL
 ,`fileName`  varchar(2000)  NULL DEFAULT NULL
 ,`fileSize`  decimal(14,0)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`createDate`  date  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for experimentfile 
--

INSERT INTO experimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFile
  , fileName
  , fileSize
  , idRequest
  , createDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idExperimentFile
  , fileName
  , fileSize
  , idRequest
  , createDate
  FROM experimentfile
  WHERE NOT EXISTS(SELECT * FROM experimentfile_Audit)
$$

--
-- Audit Triggers For experimentfile 
--


CREATE TRIGGER TrAI_experimentfile_FER AFTER INSERT ON experimentfile FOR EACH ROW
BEGIN
  INSERT INTO experimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFile
  , fileName
  , fileSize
  , idRequest
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idExperimentFile
  , NEW.fileName
  , NEW.fileSize
  , NEW.idRequest
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAU_experimentfile_FER AFTER UPDATE ON experimentfile FOR EACH ROW
BEGIN
  INSERT INTO experimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFile
  , fileName
  , fileSize
  , idRequest
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idExperimentFile
  , NEW.fileName
  , NEW.fileSize
  , NEW.idRequest
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAD_experimentfile_FER AFTER DELETE ON experimentfile FOR EACH ROW
BEGIN
  INSERT INTO experimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idExperimentFile
  , fileName
  , fileSize
  , idRequest
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idExperimentFile
  , OLD.fileName
  , OLD.fileSize
  , OLD.idRequest
  , OLD.createDate );
END;
$$


--
-- Audit Table For faq 
--

CREATE TABLE IF NOT EXISTS `faq_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idFAQ`  int(10)  NULL DEFAULT NULL
 ,`title`  varchar(300)  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for faq 
--

INSERT INTO faq_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFAQ
  , title
  , url
  , idCoreFacility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idFAQ
  , title
  , url
  , idCoreFacility
  FROM faq
  WHERE NOT EXISTS(SELECT * FROM faq_Audit)
$$

--
-- Audit Triggers For faq 
--


CREATE TRIGGER TrAI_faq_FER AFTER INSERT ON faq FOR EACH ROW
BEGIN
  INSERT INTO faq_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFAQ
  , title
  , url
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idFAQ
  , NEW.title
  , NEW.url
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAU_faq_FER AFTER UPDATE ON faq FOR EACH ROW
BEGIN
  INSERT INTO faq_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFAQ
  , title
  , url
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idFAQ
  , NEW.title
  , NEW.url
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAD_faq_FER AFTER DELETE ON faq FOR EACH ROW
BEGIN
  INSERT INTO faq_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFAQ
  , title
  , url
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idFAQ
  , OLD.title
  , OLD.url
  , OLD.idCoreFacility );
END;
$$


--
-- Audit Table For featureextractionprotocol 
--

CREATE TABLE IF NOT EXISTS `featureextractionprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idFeatureExtractionProtocol`  int(10)  NULL DEFAULT NULL
 ,`featureExtractionProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for featureextractionprotocol 
--

INSERT INTO featureextractionprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFeatureExtractionProtocol
  , featureExtractionProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idFeatureExtractionProtocol
  , featureExtractionProtocol
  , codeRequestCategory
  , description
  , url
  , isActive
  FROM featureextractionprotocol
  WHERE NOT EXISTS(SELECT * FROM featureextractionprotocol_Audit)
$$

--
-- Audit Triggers For featureextractionprotocol 
--


CREATE TRIGGER TrAI_featureextractionprotocol_FER AFTER INSERT ON featureextractionprotocol FOR EACH ROW
BEGIN
  INSERT INTO featureextractionprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFeatureExtractionProtocol
  , featureExtractionProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idFeatureExtractionProtocol
  , NEW.featureExtractionProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_featureextractionprotocol_FER AFTER UPDATE ON featureextractionprotocol FOR EACH ROW
BEGIN
  INSERT INTO featureextractionprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFeatureExtractionProtocol
  , featureExtractionProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idFeatureExtractionProtocol
  , NEW.featureExtractionProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_featureextractionprotocol_FER AFTER DELETE ON featureextractionprotocol FOR EACH ROW
BEGIN
  INSERT INTO featureextractionprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFeatureExtractionProtocol
  , featureExtractionProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idFeatureExtractionProtocol
  , OLD.featureExtractionProtocol
  , OLD.codeRequestCategory
  , OLD.description
  , OLD.url
  , OLD.isActive );
END;
$$


--
-- Audit Table For flowcellchannel 
--

CREATE TABLE IF NOT EXISTS `flowcellchannel_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idFlowCellChannel`  int(10)  NULL DEFAULT NULL
 ,`idFlowCell`  int(10)  NULL DEFAULT NULL
 ,`number`  int(10)  NULL DEFAULT NULL
 ,`idSequenceLane`  int(10)  NULL DEFAULT NULL
 ,`idSequencingControl`  int(10)  NULL DEFAULT NULL
 ,`numberSequencingCyclesActual`  int(10)  NULL DEFAULT NULL
 ,`clustersPerTile`  int(10)  NULL DEFAULT NULL
 ,`fileName`  varchar(500)  NULL DEFAULT NULL
 ,`startDate`  datetime  NULL DEFAULT NULL
 ,`firstCycleDate`  datetime  NULL DEFAULT NULL
 ,`firstCycleCompleted`  char(1)  NULL DEFAULT NULL
 ,`firstCycleFailed`  char(1)  NULL DEFAULT NULL
 ,`lastCycleDate`  datetime  NULL DEFAULT NULL
 ,`lastCycleCompleted`  char(1)  NULL DEFAULT NULL
 ,`lastCycleFailed`  char(1)  NULL DEFAULT NULL
 ,`sampleConcentrationpM`  decimal(8,2)  NULL DEFAULT NULL
 ,`pipelineDate`  datetime  NULL DEFAULT NULL
 ,`pipelineFailed`  char(1)  NULL DEFAULT NULL
 ,`isControl`  char(1)  NULL DEFAULT NULL
 ,`phiXErrorRate`  decimal(4,4)  NULL DEFAULT NULL
 ,`read1ClustersPassedFilterM`  decimal(6,2)  NULL DEFAULT NULL
 ,`read2ClustersPassedFilterM`  int(10)  NULL DEFAULT NULL
 ,`q30Gb`  decimal(4,1)  NULL DEFAULT NULL
 ,`q30Percent`  decimal(4,3)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for flowcellchannel 
--

INSERT INTO flowcellchannel_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCellChannel
  , idFlowCell
  , number
  , idSequenceLane
  , idSequencingControl
  , numberSequencingCyclesActual
  , clustersPerTile
  , fileName
  , startDate
  , firstCycleDate
  , firstCycleCompleted
  , firstCycleFailed
  , lastCycleDate
  , lastCycleCompleted
  , lastCycleFailed
  , sampleConcentrationpM
  , pipelineDate
  , pipelineFailed
  , isControl
  , phiXErrorRate
  , read1ClustersPassedFilterM
  , read2ClustersPassedFilterM
  , q30Gb
  , q30Percent )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idFlowCellChannel
  , idFlowCell
  , number
  , idSequenceLane
  , idSequencingControl
  , numberSequencingCyclesActual
  , clustersPerTile
  , fileName
  , startDate
  , firstCycleDate
  , firstCycleCompleted
  , firstCycleFailed
  , lastCycleDate
  , lastCycleCompleted
  , lastCycleFailed
  , sampleConcentrationpM
  , pipelineDate
  , pipelineFailed
  , isControl
  , phiXErrorRate
  , read1ClustersPassedFilterM
  , read2ClustersPassedFilterM
  , q30Gb
  , q30Percent
  FROM flowcellchannel
  WHERE NOT EXISTS(SELECT * FROM flowcellchannel_Audit)
$$

--
-- Audit Triggers For flowcellchannel 
--


CREATE TRIGGER TrAI_flowcellchannel_FER AFTER INSERT ON flowcellchannel FOR EACH ROW
BEGIN
  INSERT INTO flowcellchannel_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCellChannel
  , idFlowCell
  , number
  , idSequenceLane
  , idSequencingControl
  , numberSequencingCyclesActual
  , clustersPerTile
  , fileName
  , startDate
  , firstCycleDate
  , firstCycleCompleted
  , firstCycleFailed
  , lastCycleDate
  , lastCycleCompleted
  , lastCycleFailed
  , sampleConcentrationpM
  , pipelineDate
  , pipelineFailed
  , isControl
  , phiXErrorRate
  , read1ClustersPassedFilterM
  , read2ClustersPassedFilterM
  , q30Gb
  , q30Percent )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idFlowCellChannel
  , NEW.idFlowCell
  , NEW.number
  , NEW.idSequenceLane
  , NEW.idSequencingControl
  , NEW.numberSequencingCyclesActual
  , NEW.clustersPerTile
  , NEW.fileName
  , NEW.startDate
  , NEW.firstCycleDate
  , NEW.firstCycleCompleted
  , NEW.firstCycleFailed
  , NEW.lastCycleDate
  , NEW.lastCycleCompleted
  , NEW.lastCycleFailed
  , NEW.sampleConcentrationpM
  , NEW.pipelineDate
  , NEW.pipelineFailed
  , NEW.isControl
  , NEW.phiXErrorRate
  , NEW.read1ClustersPassedFilterM
  , NEW.read2ClustersPassedFilterM
  , NEW.q30Gb
  , NEW.q30Percent );
END;
$$


CREATE TRIGGER TrAU_flowcellchannel_FER AFTER UPDATE ON flowcellchannel FOR EACH ROW
BEGIN
  INSERT INTO flowcellchannel_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCellChannel
  , idFlowCell
  , number
  , idSequenceLane
  , idSequencingControl
  , numberSequencingCyclesActual
  , clustersPerTile
  , fileName
  , startDate
  , firstCycleDate
  , firstCycleCompleted
  , firstCycleFailed
  , lastCycleDate
  , lastCycleCompleted
  , lastCycleFailed
  , sampleConcentrationpM
  , pipelineDate
  , pipelineFailed
  , isControl
  , phiXErrorRate
  , read1ClustersPassedFilterM
  , read2ClustersPassedFilterM
  , q30Gb
  , q30Percent )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idFlowCellChannel
  , NEW.idFlowCell
  , NEW.number
  , NEW.idSequenceLane
  , NEW.idSequencingControl
  , NEW.numberSequencingCyclesActual
  , NEW.clustersPerTile
  , NEW.fileName
  , NEW.startDate
  , NEW.firstCycleDate
  , NEW.firstCycleCompleted
  , NEW.firstCycleFailed
  , NEW.lastCycleDate
  , NEW.lastCycleCompleted
  , NEW.lastCycleFailed
  , NEW.sampleConcentrationpM
  , NEW.pipelineDate
  , NEW.pipelineFailed
  , NEW.isControl
  , NEW.phiXErrorRate
  , NEW.read1ClustersPassedFilterM
  , NEW.read2ClustersPassedFilterM
  , NEW.q30Gb
  , NEW.q30Percent );
END;
$$


CREATE TRIGGER TrAD_flowcellchannel_FER AFTER DELETE ON flowcellchannel FOR EACH ROW
BEGIN
  INSERT INTO flowcellchannel_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCellChannel
  , idFlowCell
  , number
  , idSequenceLane
  , idSequencingControl
  , numberSequencingCyclesActual
  , clustersPerTile
  , fileName
  , startDate
  , firstCycleDate
  , firstCycleCompleted
  , firstCycleFailed
  , lastCycleDate
  , lastCycleCompleted
  , lastCycleFailed
  , sampleConcentrationpM
  , pipelineDate
  , pipelineFailed
  , isControl
  , phiXErrorRate
  , read1ClustersPassedFilterM
  , read2ClustersPassedFilterM
  , q30Gb
  , q30Percent )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idFlowCellChannel
  , OLD.idFlowCell
  , OLD.number
  , OLD.idSequenceLane
  , OLD.idSequencingControl
  , OLD.numberSequencingCyclesActual
  , OLD.clustersPerTile
  , OLD.fileName
  , OLD.startDate
  , OLD.firstCycleDate
  , OLD.firstCycleCompleted
  , OLD.firstCycleFailed
  , OLD.lastCycleDate
  , OLD.lastCycleCompleted
  , OLD.lastCycleFailed
  , OLD.sampleConcentrationpM
  , OLD.pipelineDate
  , OLD.pipelineFailed
  , OLD.isControl
  , OLD.phiXErrorRate
  , OLD.read1ClustersPassedFilterM
  , OLD.read2ClustersPassedFilterM
  , OLD.q30Gb
  , OLD.q30Percent );
END;
$$


--
-- Audit Table For flowcell 
--

CREATE TABLE IF NOT EXISTS `flowcell_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idFlowCell`  int(10)  NULL DEFAULT NULL
 ,`idNumberSequencingCycles`  int(10)  NULL DEFAULT NULL
 ,`idSeqRunType`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(10)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`notes`  varchar(200)  NULL DEFAULT NULL
 ,`barcode`  varchar(100)  NULL DEFAULT NULL
 ,`codeSequencingPlatform`  varchar(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idNumberSequencingCyclesAllowed`  int(10)  NULL DEFAULT NULL
 ,`runNumber`  int(10)  NULL DEFAULT NULL
 ,`idInstrument`  int(10)  NULL DEFAULT NULL
 ,`side`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for flowcell 
--

INSERT INTO flowcell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCell
  , idNumberSequencingCycles
  , idSeqRunType
  , number
  , createDate
  , notes
  , barcode
  , codeSequencingPlatform
  , idCoreFacility
  , idNumberSequencingCyclesAllowed
  , runNumber
  , idInstrument
  , side )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idFlowCell
  , idNumberSequencingCycles
  , idSeqRunType
  , number
  , createDate
  , notes
  , barcode
  , codeSequencingPlatform
  , idCoreFacility
  , idNumberSequencingCyclesAllowed
  , runNumber
  , idInstrument
  , side
  FROM flowcell
  WHERE NOT EXISTS(SELECT * FROM flowcell_Audit)
$$

--
-- Audit Triggers For flowcell 
--


CREATE TRIGGER TrAI_flowcell_FER AFTER INSERT ON flowcell FOR EACH ROW
BEGIN
  INSERT INTO flowcell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCell
  , idNumberSequencingCycles
  , idSeqRunType
  , number
  , createDate
  , notes
  , barcode
  , codeSequencingPlatform
  , idCoreFacility
  , idNumberSequencingCyclesAllowed
  , runNumber
  , idInstrument
  , side )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idFlowCell
  , NEW.idNumberSequencingCycles
  , NEW.idSeqRunType
  , NEW.number
  , NEW.createDate
  , NEW.notes
  , NEW.barcode
  , NEW.codeSequencingPlatform
  , NEW.idCoreFacility
  , NEW.idNumberSequencingCyclesAllowed
  , NEW.runNumber
  , NEW.idInstrument
  , NEW.side );
END;
$$


CREATE TRIGGER TrAU_flowcell_FER AFTER UPDATE ON flowcell FOR EACH ROW
BEGIN
  INSERT INTO flowcell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCell
  , idNumberSequencingCycles
  , idSeqRunType
  , number
  , createDate
  , notes
  , barcode
  , codeSequencingPlatform
  , idCoreFacility
  , idNumberSequencingCyclesAllowed
  , runNumber
  , idInstrument
  , side )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idFlowCell
  , NEW.idNumberSequencingCycles
  , NEW.idSeqRunType
  , NEW.number
  , NEW.createDate
  , NEW.notes
  , NEW.barcode
  , NEW.codeSequencingPlatform
  , NEW.idCoreFacility
  , NEW.idNumberSequencingCyclesAllowed
  , NEW.runNumber
  , NEW.idInstrument
  , NEW.side );
END;
$$


CREATE TRIGGER TrAD_flowcell_FER AFTER DELETE ON flowcell FOR EACH ROW
BEGIN
  INSERT INTO flowcell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFlowCell
  , idNumberSequencingCycles
  , idSeqRunType
  , number
  , createDate
  , notes
  , barcode
  , codeSequencingPlatform
  , idCoreFacility
  , idNumberSequencingCyclesAllowed
  , runNumber
  , idInstrument
  , side )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idFlowCell
  , OLD.idNumberSequencingCycles
  , OLD.idSeqRunType
  , OLD.number
  , OLD.createDate
  , OLD.notes
  , OLD.barcode
  , OLD.codeSequencingPlatform
  , OLD.idCoreFacility
  , OLD.idNumberSequencingCyclesAllowed
  , OLD.runNumber
  , OLD.idInstrument
  , OLD.side );
END;
$$


--
-- Audit Table For fundingagency 
--

CREATE TABLE IF NOT EXISTS `fundingagency_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idFundingAgency`  int(10)  NULL DEFAULT NULL
 ,`fundingAgency`  varchar(200)  NULL DEFAULT NULL
 ,`isPeerReviewedFunding`  char(1)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for fundingagency 
--

INSERT INTO fundingagency_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFundingAgency
  , fundingAgency
  , isPeerReviewedFunding
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idFundingAgency
  , fundingAgency
  , isPeerReviewedFunding
  , isActive
  FROM fundingagency
  WHERE NOT EXISTS(SELECT * FROM fundingagency_Audit)
$$

--
-- Audit Triggers For fundingagency 
--


CREATE TRIGGER TrAI_fundingagency_FER AFTER INSERT ON fundingagency FOR EACH ROW
BEGIN
  INSERT INTO fundingagency_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFundingAgency
  , fundingAgency
  , isPeerReviewedFunding
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idFundingAgency
  , NEW.fundingAgency
  , NEW.isPeerReviewedFunding
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_fundingagency_FER AFTER UPDATE ON fundingagency FOR EACH ROW
BEGIN
  INSERT INTO fundingagency_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFundingAgency
  , fundingAgency
  , isPeerReviewedFunding
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idFundingAgency
  , NEW.fundingAgency
  , NEW.isPeerReviewedFunding
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_fundingagency_FER AFTER DELETE ON fundingagency FOR EACH ROW
BEGIN
  INSERT INTO fundingagency_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idFundingAgency
  , fundingAgency
  , isPeerReviewedFunding
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idFundingAgency
  , OLD.fundingAgency
  , OLD.isPeerReviewedFunding
  , OLD.isActive );
END;
$$


--
-- Audit Table For genomebuildalias 
--

CREATE TABLE IF NOT EXISTS `genomebuildalias_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idGenomeBuildAlias`  int(10)  NULL DEFAULT NULL
 ,`alias`  varchar(100)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for genomebuildalias 
--

INSERT INTO genomebuildalias_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuildAlias
  , alias
  , idGenomeBuild )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idGenomeBuildAlias
  , alias
  , idGenomeBuild
  FROM genomebuildalias
  WHERE NOT EXISTS(SELECT * FROM genomebuildalias_Audit)
$$

--
-- Audit Triggers For genomebuildalias 
--


CREATE TRIGGER TrAI_genomebuildalias_FER AFTER INSERT ON genomebuildalias FOR EACH ROW
BEGIN
  INSERT INTO genomebuildalias_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuildAlias
  , alias
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idGenomeBuildAlias
  , NEW.alias
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAU_genomebuildalias_FER AFTER UPDATE ON genomebuildalias FOR EACH ROW
BEGIN
  INSERT INTO genomebuildalias_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuildAlias
  , alias
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idGenomeBuildAlias
  , NEW.alias
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAD_genomebuildalias_FER AFTER DELETE ON genomebuildalias FOR EACH ROW
BEGIN
  INSERT INTO genomebuildalias_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuildAlias
  , alias
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idGenomeBuildAlias
  , OLD.alias
  , OLD.idGenomeBuild );
END;
$$


--
-- Audit Table For genomebuild 
--

CREATE TABLE IF NOT EXISTS `genomebuild_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
 ,`genomeBuildName`  varchar(500)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`isLatestBuild`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`das2Name`  varchar(200)  NULL DEFAULT NULL
 ,`buildDate`  datetime  NULL DEFAULT NULL
 ,`coordURI`  varchar(2000)  NULL DEFAULT NULL
 ,`coordVersion`  varchar(50)  NULL DEFAULT NULL
 ,`coordSource`  varchar(50)  NULL DEFAULT NULL
 ,`coordTestRange`  varchar(100)  NULL DEFAULT NULL
 ,`coordAuthority`  varchar(50)  NULL DEFAULT NULL
 ,`ucscName`  varchar(100)  NULL DEFAULT NULL
 ,`igvName`  varchar(50)  NULL DEFAULT NULL
 ,`dataPath`  varchar(500)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for genomebuild 
--

INSERT INTO genomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuild
  , genomeBuildName
  , idOrganism
  , isActive
  , isLatestBuild
  , idAppUser
  , das2Name
  , buildDate
  , coordURI
  , coordVersion
  , coordSource
  , coordTestRange
  , coordAuthority
  , ucscName
  , igvName
  , dataPath )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idGenomeBuild
  , genomeBuildName
  , idOrganism
  , isActive
  , isLatestBuild
  , idAppUser
  , das2Name
  , buildDate
  , coordURI
  , coordVersion
  , coordSource
  , coordTestRange
  , coordAuthority
  , ucscName
  , igvName
  , dataPath
  FROM genomebuild
  WHERE NOT EXISTS(SELECT * FROM genomebuild_Audit)
$$

--
-- Audit Triggers For genomebuild 
--


CREATE TRIGGER TrAI_genomebuild_FER AFTER INSERT ON genomebuild FOR EACH ROW
BEGIN
  INSERT INTO genomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuild
  , genomeBuildName
  , idOrganism
  , isActive
  , isLatestBuild
  , idAppUser
  , das2Name
  , buildDate
  , coordURI
  , coordVersion
  , coordSource
  , coordTestRange
  , coordAuthority
  , ucscName
  , igvName
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idGenomeBuild
  , NEW.genomeBuildName
  , NEW.idOrganism
  , NEW.isActive
  , NEW.isLatestBuild
  , NEW.idAppUser
  , NEW.das2Name
  , NEW.buildDate
  , NEW.coordURI
  , NEW.coordVersion
  , NEW.coordSource
  , NEW.coordTestRange
  , NEW.coordAuthority
  , NEW.ucscName
  , NEW.igvName
  , NEW.dataPath );
END;
$$


CREATE TRIGGER TrAU_genomebuild_FER AFTER UPDATE ON genomebuild FOR EACH ROW
BEGIN
  INSERT INTO genomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuild
  , genomeBuildName
  , idOrganism
  , isActive
  , isLatestBuild
  , idAppUser
  , das2Name
  , buildDate
  , coordURI
  , coordVersion
  , coordSource
  , coordTestRange
  , coordAuthority
  , ucscName
  , igvName
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idGenomeBuild
  , NEW.genomeBuildName
  , NEW.idOrganism
  , NEW.isActive
  , NEW.isLatestBuild
  , NEW.idAppUser
  , NEW.das2Name
  , NEW.buildDate
  , NEW.coordURI
  , NEW.coordVersion
  , NEW.coordSource
  , NEW.coordTestRange
  , NEW.coordAuthority
  , NEW.ucscName
  , NEW.igvName
  , NEW.dataPath );
END;
$$


CREATE TRIGGER TrAD_genomebuild_FER AFTER DELETE ON genomebuild FOR EACH ROW
BEGIN
  INSERT INTO genomebuild_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeBuild
  , genomeBuildName
  , idOrganism
  , isActive
  , isLatestBuild
  , idAppUser
  , das2Name
  , buildDate
  , coordURI
  , coordVersion
  , coordSource
  , coordTestRange
  , coordAuthority
  , ucscName
  , igvName
  , dataPath )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idGenomeBuild
  , OLD.genomeBuildName
  , OLD.idOrganism
  , OLD.isActive
  , OLD.isLatestBuild
  , OLD.idAppUser
  , OLD.das2Name
  , OLD.buildDate
  , OLD.coordURI
  , OLD.coordVersion
  , OLD.coordSource
  , OLD.coordTestRange
  , OLD.coordAuthority
  , OLD.ucscName
  , OLD.igvName
  , OLD.dataPath );
END;
$$


--
-- Audit Table For genomeindex 
--

CREATE TABLE IF NOT EXISTS `genomeindex_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idGenomeIndex`  int(10)  NULL DEFAULT NULL
 ,`genomeIndexName`  varchar(120)  NULL DEFAULT NULL
 ,`webServiceName`  varchar(120)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for genomeindex 
--

INSERT INTO genomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeIndex
  , genomeIndexName
  , webServiceName
  , isActive
  , idOrganism )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idGenomeIndex
  , genomeIndexName
  , webServiceName
  , isActive
  , idOrganism
  FROM genomeindex
  WHERE NOT EXISTS(SELECT * FROM genomeindex_Audit)
$$

--
-- Audit Triggers For genomeindex 
--


CREATE TRIGGER TrAI_genomeindex_FER AFTER INSERT ON genomeindex FOR EACH ROW
BEGIN
  INSERT INTO genomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeIndex
  , genomeIndexName
  , webServiceName
  , isActive
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idGenomeIndex
  , NEW.genomeIndexName
  , NEW.webServiceName
  , NEW.isActive
  , NEW.idOrganism );
END;
$$


CREATE TRIGGER TrAU_genomeindex_FER AFTER UPDATE ON genomeindex FOR EACH ROW
BEGIN
  INSERT INTO genomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeIndex
  , genomeIndexName
  , webServiceName
  , isActive
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idGenomeIndex
  , NEW.genomeIndexName
  , NEW.webServiceName
  , NEW.isActive
  , NEW.idOrganism );
END;
$$


CREATE TRIGGER TrAD_genomeindex_FER AFTER DELETE ON genomeindex FOR EACH ROW
BEGIN
  INSERT INTO genomeindex_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idGenomeIndex
  , genomeIndexName
  , webServiceName
  , isActive
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idGenomeIndex
  , OLD.genomeIndexName
  , OLD.webServiceName
  , OLD.isActive
  , OLD.idOrganism );
END;
$$


--
-- Audit Table For hybprotocol 
--

CREATE TABLE IF NOT EXISTS `hybprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idHybProtocol`  int(10)  NULL DEFAULT NULL
 ,`hybProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for hybprotocol 
--

INSERT INTO hybprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybProtocol
  , hybProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idHybProtocol
  , hybProtocol
  , codeRequestCategory
  , description
  , url
  , isActive
  FROM hybprotocol
  WHERE NOT EXISTS(SELECT * FROM hybprotocol_Audit)
$$

--
-- Audit Triggers For hybprotocol 
--


CREATE TRIGGER TrAI_hybprotocol_FER AFTER INSERT ON hybprotocol FOR EACH ROW
BEGIN
  INSERT INTO hybprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybProtocol
  , hybProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idHybProtocol
  , NEW.hybProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_hybprotocol_FER AFTER UPDATE ON hybprotocol FOR EACH ROW
BEGIN
  INSERT INTO hybprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybProtocol
  , hybProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idHybProtocol
  , NEW.hybProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_hybprotocol_FER AFTER DELETE ON hybprotocol FOR EACH ROW
BEGIN
  INSERT INTO hybprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybProtocol
  , hybProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idHybProtocol
  , OLD.hybProtocol
  , OLD.codeRequestCategory
  , OLD.description
  , OLD.url
  , OLD.isActive );
END;
$$


--
-- Audit Table For hybridization 
--

CREATE TABLE IF NOT EXISTS `hybridization_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idHybridization`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(100)  NULL DEFAULT NULL
 ,`notes`  varchar(2000)  NULL DEFAULT NULL
 ,`codeSlideSource`  varchar(10)  NULL DEFAULT NULL
 ,`idSlideDesign`  int(10)  NULL DEFAULT NULL
 ,`idHybProtocol`  int(10)  NULL DEFAULT NULL
 ,`idHybBuffer`  int(10)  NULL DEFAULT NULL
 ,`idLabeledSampleChannel1`  int(10)  NULL DEFAULT NULL
 ,`idLabeledSampleChannel2`  int(10)  NULL DEFAULT NULL
 ,`idSlide`  int(10)  NULL DEFAULT NULL
 ,`idArrayCoordinate`  int(10)  NULL DEFAULT NULL
 ,`idScanProtocol`  int(10)  NULL DEFAULT NULL
 ,`idFeatureExtractionProtocol`  int(10)  NULL DEFAULT NULL
 ,`hybDate`  datetime  NULL DEFAULT NULL
 ,`hybFailed`  char(1)  NULL DEFAULT NULL
 ,`hybBypassed`  char(1)  NULL DEFAULT NULL
 ,`extractionDate`  datetime  NULL DEFAULT NULL
 ,`extractionFailed`  char(1)  NULL DEFAULT NULL
 ,`extractionBypassed`  char(1)  NULL DEFAULT NULL
 ,`hasResults`  char(1)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for hybridization 
--

INSERT INTO hybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybridization
  , number
  , notes
  , codeSlideSource
  , idSlideDesign
  , idHybProtocol
  , idHybBuffer
  , idLabeledSampleChannel1
  , idLabeledSampleChannel2
  , idSlide
  , idArrayCoordinate
  , idScanProtocol
  , idFeatureExtractionProtocol
  , hybDate
  , hybFailed
  , hybBypassed
  , extractionDate
  , extractionFailed
  , extractionBypassed
  , hasResults
  , createDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idHybridization
  , number
  , notes
  , codeSlideSource
  , idSlideDesign
  , idHybProtocol
  , idHybBuffer
  , idLabeledSampleChannel1
  , idLabeledSampleChannel2
  , idSlide
  , idArrayCoordinate
  , idScanProtocol
  , idFeatureExtractionProtocol
  , hybDate
  , hybFailed
  , hybBypassed
  , extractionDate
  , extractionFailed
  , extractionBypassed
  , hasResults
  , createDate
  FROM hybridization
  WHERE NOT EXISTS(SELECT * FROM hybridization_Audit)
$$

--
-- Audit Triggers For hybridization 
--


CREATE TRIGGER TrAI_hybridization_FER AFTER INSERT ON hybridization FOR EACH ROW
BEGIN
  INSERT INTO hybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybridization
  , number
  , notes
  , codeSlideSource
  , idSlideDesign
  , idHybProtocol
  , idHybBuffer
  , idLabeledSampleChannel1
  , idLabeledSampleChannel2
  , idSlide
  , idArrayCoordinate
  , idScanProtocol
  , idFeatureExtractionProtocol
  , hybDate
  , hybFailed
  , hybBypassed
  , extractionDate
  , extractionFailed
  , extractionBypassed
  , hasResults
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idHybridization
  , NEW.number
  , NEW.notes
  , NEW.codeSlideSource
  , NEW.idSlideDesign
  , NEW.idHybProtocol
  , NEW.idHybBuffer
  , NEW.idLabeledSampleChannel1
  , NEW.idLabeledSampleChannel2
  , NEW.idSlide
  , NEW.idArrayCoordinate
  , NEW.idScanProtocol
  , NEW.idFeatureExtractionProtocol
  , NEW.hybDate
  , NEW.hybFailed
  , NEW.hybBypassed
  , NEW.extractionDate
  , NEW.extractionFailed
  , NEW.extractionBypassed
  , NEW.hasResults
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAU_hybridization_FER AFTER UPDATE ON hybridization FOR EACH ROW
BEGIN
  INSERT INTO hybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybridization
  , number
  , notes
  , codeSlideSource
  , idSlideDesign
  , idHybProtocol
  , idHybBuffer
  , idLabeledSampleChannel1
  , idLabeledSampleChannel2
  , idSlide
  , idArrayCoordinate
  , idScanProtocol
  , idFeatureExtractionProtocol
  , hybDate
  , hybFailed
  , hybBypassed
  , extractionDate
  , extractionFailed
  , extractionBypassed
  , hasResults
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idHybridization
  , NEW.number
  , NEW.notes
  , NEW.codeSlideSource
  , NEW.idSlideDesign
  , NEW.idHybProtocol
  , NEW.idHybBuffer
  , NEW.idLabeledSampleChannel1
  , NEW.idLabeledSampleChannel2
  , NEW.idSlide
  , NEW.idArrayCoordinate
  , NEW.idScanProtocol
  , NEW.idFeatureExtractionProtocol
  , NEW.hybDate
  , NEW.hybFailed
  , NEW.hybBypassed
  , NEW.extractionDate
  , NEW.extractionFailed
  , NEW.extractionBypassed
  , NEW.hasResults
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAD_hybridization_FER AFTER DELETE ON hybridization FOR EACH ROW
BEGIN
  INSERT INTO hybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idHybridization
  , number
  , notes
  , codeSlideSource
  , idSlideDesign
  , idHybProtocol
  , idHybBuffer
  , idLabeledSampleChannel1
  , idLabeledSampleChannel2
  , idSlide
  , idArrayCoordinate
  , idScanProtocol
  , idFeatureExtractionProtocol
  , hybDate
  , hybFailed
  , hybBypassed
  , extractionDate
  , extractionFailed
  , extractionBypassed
  , hasResults
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idHybridization
  , OLD.number
  , OLD.notes
  , OLD.codeSlideSource
  , OLD.idSlideDesign
  , OLD.idHybProtocol
  , OLD.idHybBuffer
  , OLD.idLabeledSampleChannel1
  , OLD.idLabeledSampleChannel2
  , OLD.idSlide
  , OLD.idArrayCoordinate
  , OLD.idScanProtocol
  , OLD.idFeatureExtractionProtocol
  , OLD.hybDate
  , OLD.hybFailed
  , OLD.hybBypassed
  , OLD.extractionDate
  , OLD.extractionFailed
  , OLD.extractionBypassed
  , OLD.hasResults
  , OLD.createDate );
END;
$$


--
-- Audit Table For institutionlab 
--

CREATE TABLE IF NOT EXISTS `institutionlab_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for institutionlab 
--

INSERT INTO institutionlab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , idLab )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInstitution
  , idLab
  FROM institutionlab
  WHERE NOT EXISTS(SELECT * FROM institutionlab_Audit)
$$

--
-- Audit Triggers For institutionlab 
--


CREATE TRIGGER TrAI_institutionlab_FER AFTER INSERT ON institutionlab FOR EACH ROW
BEGIN
  INSERT INTO institutionlab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInstitution
  , NEW.idLab );
END;
$$


CREATE TRIGGER TrAU_institutionlab_FER AFTER UPDATE ON institutionlab FOR EACH ROW
BEGIN
  INSERT INTO institutionlab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInstitution
  , NEW.idLab );
END;
$$


CREATE TRIGGER TrAD_institutionlab_FER AFTER DELETE ON institutionlab FOR EACH ROW
BEGIN
  INSERT INTO institutionlab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , idLab )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInstitution
  , OLD.idLab );
END;
$$


--
-- Audit Table For institution 
--

CREATE TABLE IF NOT EXISTS `institution_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
 ,`institution`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`isDefault`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for institution 
--

INSERT INTO institution_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , institution
  , description
  , isActive
  , isDefault )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInstitution
  , institution
  , description
  , isActive
  , isDefault
  FROM institution
  WHERE NOT EXISTS(SELECT * FROM institution_Audit)
$$

--
-- Audit Triggers For institution 
--


CREATE TRIGGER TrAI_institution_FER AFTER INSERT ON institution FOR EACH ROW
BEGIN
  INSERT INTO institution_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , institution
  , description
  , isActive
  , isDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInstitution
  , NEW.institution
  , NEW.description
  , NEW.isActive
  , NEW.isDefault );
END;
$$


CREATE TRIGGER TrAU_institution_FER AFTER UPDATE ON institution FOR EACH ROW
BEGIN
  INSERT INTO institution_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , institution
  , description
  , isActive
  , isDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInstitution
  , NEW.institution
  , NEW.description
  , NEW.isActive
  , NEW.isDefault );
END;
$$


CREATE TRIGGER TrAD_institution_FER AFTER DELETE ON institution FOR EACH ROW
BEGIN
  INSERT INTO institution_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstitution
  , institution
  , description
  , isActive
  , isDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInstitution
  , OLD.institution
  , OLD.description
  , OLD.isActive
  , OLD.isDefault );
END;
$$


--
-- Audit Table For instrumentrunstatus 
--

CREATE TABLE IF NOT EXISTS `instrumentrunstatus_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeInstrumentRunStatus`  varchar(10)  NULL DEFAULT NULL
 ,`instrumentRunStatus`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for instrumentrunstatus 
--

INSERT INTO instrumentrunstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeInstrumentRunStatus
  , instrumentRunStatus
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeInstrumentRunStatus
  , instrumentRunStatus
  , isActive
  FROM instrumentrunstatus
  WHERE NOT EXISTS(SELECT * FROM instrumentrunstatus_Audit)
$$

--
-- Audit Triggers For instrumentrunstatus 
--


CREATE TRIGGER TrAI_instrumentrunstatus_FER AFTER INSERT ON instrumentrunstatus FOR EACH ROW
BEGIN
  INSERT INTO instrumentrunstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeInstrumentRunStatus
  , instrumentRunStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeInstrumentRunStatus
  , NEW.instrumentRunStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_instrumentrunstatus_FER AFTER UPDATE ON instrumentrunstatus FOR EACH ROW
BEGIN
  INSERT INTO instrumentrunstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeInstrumentRunStatus
  , instrumentRunStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeInstrumentRunStatus
  , NEW.instrumentRunStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_instrumentrunstatus_FER AFTER DELETE ON instrumentrunstatus FOR EACH ROW
BEGIN
  INSERT INTO instrumentrunstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeInstrumentRunStatus
  , instrumentRunStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeInstrumentRunStatus
  , OLD.instrumentRunStatus
  , OLD.isActive );
END;
$$


--
-- Audit Table For instrumentrun 
--

CREATE TABLE IF NOT EXISTS `instrumentrun_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInstrumentRun`  int(10)  NULL DEFAULT NULL
 ,`runDate`  datetime  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`codeInstrumentRunStatus`  varchar(10)  NULL DEFAULT NULL
 ,`comments`  varchar(200)  NULL DEFAULT NULL
 ,`label`  varchar(100)  NULL DEFAULT NULL
 ,`codeReactionType`  varchar(10)  NULL DEFAULT NULL
 ,`creator`  varchar(50)  NULL DEFAULT NULL
 ,`codeSealType`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for instrumentrun 
--

INSERT INTO instrumentrun_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrumentRun
  , runDate
  , createDate
  , codeInstrumentRunStatus
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInstrumentRun
  , runDate
  , createDate
  , codeInstrumentRunStatus
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType
  FROM instrumentrun
  WHERE NOT EXISTS(SELECT * FROM instrumentrun_Audit)
$$

--
-- Audit Triggers For instrumentrun 
--


CREATE TRIGGER TrAI_instrumentrun_FER AFTER INSERT ON instrumentrun FOR EACH ROW
BEGIN
  INSERT INTO instrumentrun_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrumentRun
  , runDate
  , createDate
  , codeInstrumentRunStatus
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInstrumentRun
  , NEW.runDate
  , NEW.createDate
  , NEW.codeInstrumentRunStatus
  , NEW.comments
  , NEW.label
  , NEW.codeReactionType
  , NEW.creator
  , NEW.codeSealType );
END;
$$


CREATE TRIGGER TrAU_instrumentrun_FER AFTER UPDATE ON instrumentrun FOR EACH ROW
BEGIN
  INSERT INTO instrumentrun_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrumentRun
  , runDate
  , createDate
  , codeInstrumentRunStatus
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInstrumentRun
  , NEW.runDate
  , NEW.createDate
  , NEW.codeInstrumentRunStatus
  , NEW.comments
  , NEW.label
  , NEW.codeReactionType
  , NEW.creator
  , NEW.codeSealType );
END;
$$


CREATE TRIGGER TrAD_instrumentrun_FER AFTER DELETE ON instrumentrun FOR EACH ROW
BEGIN
  INSERT INTO instrumentrun_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrumentRun
  , runDate
  , createDate
  , codeInstrumentRunStatus
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInstrumentRun
  , OLD.runDate
  , OLD.createDate
  , OLD.codeInstrumentRunStatus
  , OLD.comments
  , OLD.label
  , OLD.codeReactionType
  , OLD.creator
  , OLD.codeSealType );
END;
$$


--
-- Audit Table For instrument 
--

CREATE TABLE IF NOT EXISTS `instrument_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInstrument`  int(10)  NULL DEFAULT NULL
 ,`instrument`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for instrument 
--

INSERT INTO instrument_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrument
  , instrument
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInstrument
  , instrument
  , isActive
  FROM instrument
  WHERE NOT EXISTS(SELECT * FROM instrument_Audit)
$$

--
-- Audit Triggers For instrument 
--


CREATE TRIGGER TrAI_instrument_FER AFTER INSERT ON instrument FOR EACH ROW
BEGIN
  INSERT INTO instrument_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrument
  , instrument
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInstrument
  , NEW.instrument
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_instrument_FER AFTER UPDATE ON instrument FOR EACH ROW
BEGIN
  INSERT INTO instrument_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrument
  , instrument
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInstrument
  , NEW.instrument
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_instrument_FER AFTER DELETE ON instrument FOR EACH ROW
BEGIN
  INSERT INTO instrument_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInstrument
  , instrument
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInstrument
  , OLD.instrument
  , OLD.isActive );
END;
$$


--
-- Audit Table For internalaccountfieldsconfiguration 
--

CREATE TABLE IF NOT EXISTS `internalaccountfieldsconfiguration_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInternalAccountFieldsConfiguration`  int(10)  NULL DEFAULT NULL
 ,`fieldName`  varchar(50)  NULL DEFAULT NULL
 ,`include`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`displayName`  varchar(50)  NULL DEFAULT NULL
 ,`isRequired`  char(1)  NULL DEFAULT NULL
 ,`isNumber`  char(1)  NULL DEFAULT NULL
 ,`minLength`  int(10)  NULL DEFAULT NULL
 ,`maxLength`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for internalaccountfieldsconfiguration 
--

INSERT INTO internalaccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInternalAccountFieldsConfiguration
  , fieldName
  , include
  , sortOrder
  , displayName
  , isRequired
  , isNumber
  , minLength
  , maxLength )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInternalAccountFieldsConfiguration
  , fieldName
  , include
  , sortOrder
  , displayName
  , isRequired
  , isNumber
  , minLength
  , maxLength
  FROM internalaccountfieldsconfiguration
  WHERE NOT EXISTS(SELECT * FROM internalaccountfieldsconfiguration_Audit)
$$

--
-- Audit Triggers For internalaccountfieldsconfiguration 
--


CREATE TRIGGER TrAI_internalaccountfieldsconfiguration_FER AFTER INSERT ON internalaccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO internalaccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInternalAccountFieldsConfiguration
  , fieldName
  , include
  , sortOrder
  , displayName
  , isRequired
  , isNumber
  , minLength
  , maxLength )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInternalAccountFieldsConfiguration
  , NEW.fieldName
  , NEW.include
  , NEW.sortOrder
  , NEW.displayName
  , NEW.isRequired
  , NEW.isNumber
  , NEW.minLength
  , NEW.maxLength );
END;
$$


CREATE TRIGGER TrAU_internalaccountfieldsconfiguration_FER AFTER UPDATE ON internalaccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO internalaccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInternalAccountFieldsConfiguration
  , fieldName
  , include
  , sortOrder
  , displayName
  , isRequired
  , isNumber
  , minLength
  , maxLength )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInternalAccountFieldsConfiguration
  , NEW.fieldName
  , NEW.include
  , NEW.sortOrder
  , NEW.displayName
  , NEW.isRequired
  , NEW.isNumber
  , NEW.minLength
  , NEW.maxLength );
END;
$$


CREATE TRIGGER TrAD_internalaccountfieldsconfiguration_FER AFTER DELETE ON internalaccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO internalaccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInternalAccountFieldsConfiguration
  , fieldName
  , include
  , sortOrder
  , displayName
  , isRequired
  , isNumber
  , minLength
  , maxLength )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInternalAccountFieldsConfiguration
  , OLD.fieldName
  , OLD.include
  , OLD.sortOrder
  , OLD.displayName
  , OLD.isRequired
  , OLD.isNumber
  , OLD.minLength
  , OLD.maxLength );
END;
$$


--
-- Audit Table For invoice 
--

CREATE TABLE IF NOT EXISTS `invoice_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idInvoice`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idBillingPeriod`  int(10)  NULL DEFAULT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`invoiceNumber`  varchar(50)  NULL DEFAULT NULL
 ,`lastEmailDate`  datetime  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for invoice 
--

INSERT INTO invoice_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInvoice
  , idCoreFacility
  , idBillingPeriod
  , idBillingAccount
  , invoiceNumber
  , lastEmailDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idInvoice
  , idCoreFacility
  , idBillingPeriod
  , idBillingAccount
  , invoiceNumber
  , lastEmailDate
  FROM invoice
  WHERE NOT EXISTS(SELECT * FROM invoice_Audit)
$$

--
-- Audit Triggers For invoice 
--


CREATE TRIGGER TrAI_invoice_FER AFTER INSERT ON invoice FOR EACH ROW
BEGIN
  INSERT INTO invoice_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInvoice
  , idCoreFacility
  , idBillingPeriod
  , idBillingAccount
  , invoiceNumber
  , lastEmailDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idInvoice
  , NEW.idCoreFacility
  , NEW.idBillingPeriod
  , NEW.idBillingAccount
  , NEW.invoiceNumber
  , NEW.lastEmailDate );
END;
$$


CREATE TRIGGER TrAU_invoice_FER AFTER UPDATE ON invoice FOR EACH ROW
BEGIN
  INSERT INTO invoice_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInvoice
  , idCoreFacility
  , idBillingPeriod
  , idBillingAccount
  , invoiceNumber
  , lastEmailDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idInvoice
  , NEW.idCoreFacility
  , NEW.idBillingPeriod
  , NEW.idBillingAccount
  , NEW.invoiceNumber
  , NEW.lastEmailDate );
END;
$$


CREATE TRIGGER TrAD_invoice_FER AFTER DELETE ON invoice FOR EACH ROW
BEGIN
  INSERT INTO invoice_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idInvoice
  , idCoreFacility
  , idBillingPeriod
  , idBillingAccount
  , invoiceNumber
  , lastEmailDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idInvoice
  , OLD.idCoreFacility
  , OLD.idBillingPeriod
  , OLD.idBillingAccount
  , OLD.invoiceNumber
  , OLD.lastEmailDate );
END;
$$


--
-- Audit Table For iscanchip 
--

CREATE TABLE IF NOT EXISTS `iscanchip_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idIScanChip`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(500)  NULL DEFAULT NULL
 ,`costPerSample`  decimal(5,2)  NULL DEFAULT NULL
 ,`samplesPerChip`  int(10)  NULL DEFAULT NULL
 ,`chipsPerKit`  int(10)  NULL DEFAULT NULL
 ,`markersPerSample`  varchar(100)  NULL DEFAULT NULL
 ,`catalogNumber`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for iscanchip 
--

INSERT INTO iscanchip_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idIScanChip
  , name
  , costPerSample
  , samplesPerChip
  , chipsPerKit
  , markersPerSample
  , catalogNumber
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idIScanChip
  , name
  , costPerSample
  , samplesPerChip
  , chipsPerKit
  , markersPerSample
  , catalogNumber
  , isActive
  FROM iscanchip
  WHERE NOT EXISTS(SELECT * FROM iscanchip_Audit)
$$

--
-- Audit Triggers For iscanchip 
--


CREATE TRIGGER TrAI_iscanchip_FER AFTER INSERT ON iscanchip FOR EACH ROW
BEGIN
  INSERT INTO iscanchip_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idIScanChip
  , name
  , costPerSample
  , samplesPerChip
  , chipsPerKit
  , markersPerSample
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idIScanChip
  , NEW.name
  , NEW.costPerSample
  , NEW.samplesPerChip
  , NEW.chipsPerKit
  , NEW.markersPerSample
  , NEW.catalogNumber
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_iscanchip_FER AFTER UPDATE ON iscanchip FOR EACH ROW
BEGIN
  INSERT INTO iscanchip_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idIScanChip
  , name
  , costPerSample
  , samplesPerChip
  , chipsPerKit
  , markersPerSample
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idIScanChip
  , NEW.name
  , NEW.costPerSample
  , NEW.samplesPerChip
  , NEW.chipsPerKit
  , NEW.markersPerSample
  , NEW.catalogNumber
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_iscanchip_FER AFTER DELETE ON iscanchip FOR EACH ROW
BEGIN
  INSERT INTO iscanchip_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idIScanChip
  , name
  , costPerSample
  , samplesPerChip
  , chipsPerKit
  , markersPerSample
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idIScanChip
  , OLD.name
  , OLD.costPerSample
  , OLD.samplesPerChip
  , OLD.chipsPerKit
  , OLD.markersPerSample
  , OLD.catalogNumber
  , OLD.isActive );
END;
$$


--
-- Audit Table For isolationpreptype 
--

CREATE TABLE IF NOT EXISTS `isolationpreptype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeIsolationPrepType`  varchar(15)  NULL DEFAULT NULL
 ,`isolationPrepType`  varchar(100)  NULL DEFAULT NULL
 ,`type`  varchar(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(50)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for isolationpreptype 
--

INSERT INTO isolationpreptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeIsolationPrepType
  , isolationPrepType
  , type
  , isActive
  , codeRequestCategory )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeIsolationPrepType
  , isolationPrepType
  , type
  , isActive
  , codeRequestCategory
  FROM isolationpreptype
  WHERE NOT EXISTS(SELECT * FROM isolationpreptype_Audit)
$$

--
-- Audit Triggers For isolationpreptype 
--


CREATE TRIGGER TrAI_isolationpreptype_FER AFTER INSERT ON isolationpreptype FOR EACH ROW
BEGIN
  INSERT INTO isolationpreptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeIsolationPrepType
  , isolationPrepType
  , type
  , isActive
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeIsolationPrepType
  , NEW.isolationPrepType
  , NEW.type
  , NEW.isActive
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAU_isolationpreptype_FER AFTER UPDATE ON isolationpreptype FOR EACH ROW
BEGIN
  INSERT INTO isolationpreptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeIsolationPrepType
  , isolationPrepType
  , type
  , isActive
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeIsolationPrepType
  , NEW.isolationPrepType
  , NEW.type
  , NEW.isActive
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAD_isolationpreptype_FER AFTER DELETE ON isolationpreptype FOR EACH ROW
BEGIN
  INSERT INTO isolationpreptype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeIsolationPrepType
  , isolationPrepType
  , type
  , isActive
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeIsolationPrepType
  , OLD.isolationPrepType
  , OLD.type
  , OLD.isActive
  , OLD.codeRequestCategory );
END;
$$


--
-- Audit Table For labcollaborator 
--

CREATE TABLE IF NOT EXISTS `labcollaborator_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`sendUploadAlert`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labcollaborator 
--

INSERT INTO labcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLab
  , idAppUser
  , sendUploadAlert
  FROM labcollaborator
  WHERE NOT EXISTS(SELECT * FROM labcollaborator_Audit)
$$

--
-- Audit Triggers For labcollaborator 
--


CREATE TRIGGER TrAI_labcollaborator_FER AFTER INSERT ON labcollaborator FOR EACH ROW
BEGIN
  INSERT INTO labcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAU_labcollaborator_FER AFTER UPDATE ON labcollaborator FOR EACH ROW
BEGIN
  INSERT INTO labcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAD_labcollaborator_FER AFTER DELETE ON labcollaborator FOR EACH ROW
BEGIN
  INSERT INTO labcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLab
  , OLD.idAppUser
  , OLD.sendUploadAlert );
END;
$$


--
-- Audit Table For labeledsample 
--

CREATE TABLE IF NOT EXISTS `labeledsample_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLabeledSample`  int(10)  NULL DEFAULT NULL
 ,`labelingYield`  decimal(8,2)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`idLabel`  int(10)  NULL DEFAULT NULL
 ,`idLabelingProtocol`  int(10)  NULL DEFAULT NULL
 ,`codeLabelingReactionSize`  varchar(20)  NULL DEFAULT NULL
 ,`numberOfReactions`  int(10)  NULL DEFAULT NULL
 ,`labelingDate`  datetime  NULL DEFAULT NULL
 ,`labelingFailed`  char(1)  NULL DEFAULT NULL
 ,`labelingBypassed`  char(1)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labeledsample 
--

INSERT INTO labeledsample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabeledSample
  , labelingYield
  , idSample
  , idLabel
  , idLabelingProtocol
  , codeLabelingReactionSize
  , numberOfReactions
  , labelingDate
  , labelingFailed
  , labelingBypassed
  , idRequest )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLabeledSample
  , labelingYield
  , idSample
  , idLabel
  , idLabelingProtocol
  , codeLabelingReactionSize
  , numberOfReactions
  , labelingDate
  , labelingFailed
  , labelingBypassed
  , idRequest
  FROM labeledsample
  WHERE NOT EXISTS(SELECT * FROM labeledsample_Audit)
$$

--
-- Audit Triggers For labeledsample 
--


CREATE TRIGGER TrAI_labeledsample_FER AFTER INSERT ON labeledsample FOR EACH ROW
BEGIN
  INSERT INTO labeledsample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabeledSample
  , labelingYield
  , idSample
  , idLabel
  , idLabelingProtocol
  , codeLabelingReactionSize
  , numberOfReactions
  , labelingDate
  , labelingFailed
  , labelingBypassed
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLabeledSample
  , NEW.labelingYield
  , NEW.idSample
  , NEW.idLabel
  , NEW.idLabelingProtocol
  , NEW.codeLabelingReactionSize
  , NEW.numberOfReactions
  , NEW.labelingDate
  , NEW.labelingFailed
  , NEW.labelingBypassed
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAU_labeledsample_FER AFTER UPDATE ON labeledsample FOR EACH ROW
BEGIN
  INSERT INTO labeledsample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabeledSample
  , labelingYield
  , idSample
  , idLabel
  , idLabelingProtocol
  , codeLabelingReactionSize
  , numberOfReactions
  , labelingDate
  , labelingFailed
  , labelingBypassed
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLabeledSample
  , NEW.labelingYield
  , NEW.idSample
  , NEW.idLabel
  , NEW.idLabelingProtocol
  , NEW.codeLabelingReactionSize
  , NEW.numberOfReactions
  , NEW.labelingDate
  , NEW.labelingFailed
  , NEW.labelingBypassed
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAD_labeledsample_FER AFTER DELETE ON labeledsample FOR EACH ROW
BEGIN
  INSERT INTO labeledsample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabeledSample
  , labelingYield
  , idSample
  , idLabel
  , idLabelingProtocol
  , codeLabelingReactionSize
  , numberOfReactions
  , labelingDate
  , labelingFailed
  , labelingBypassed
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLabeledSample
  , OLD.labelingYield
  , OLD.idSample
  , OLD.idLabel
  , OLD.idLabelingProtocol
  , OLD.codeLabelingReactionSize
  , OLD.numberOfReactions
  , OLD.labelingDate
  , OLD.labelingFailed
  , OLD.labelingBypassed
  , OLD.idRequest );
END;
$$


--
-- Audit Table For labelingprotocol 
--

CREATE TABLE IF NOT EXISTS `labelingprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLabelingProtocol`  int(10)  NULL DEFAULT NULL
 ,`labelingProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labelingprotocol 
--

INSERT INTO labelingprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabelingProtocol
  , labelingProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLabelingProtocol
  , labelingProtocol
  , codeRequestCategory
  , description
  , url
  , isActive
  FROM labelingprotocol
  WHERE NOT EXISTS(SELECT * FROM labelingprotocol_Audit)
$$

--
-- Audit Triggers For labelingprotocol 
--


CREATE TRIGGER TrAI_labelingprotocol_FER AFTER INSERT ON labelingprotocol FOR EACH ROW
BEGIN
  INSERT INTO labelingprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabelingProtocol
  , labelingProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLabelingProtocol
  , NEW.labelingProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_labelingprotocol_FER AFTER UPDATE ON labelingprotocol FOR EACH ROW
BEGIN
  INSERT INTO labelingprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabelingProtocol
  , labelingProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLabelingProtocol
  , NEW.labelingProtocol
  , NEW.codeRequestCategory
  , NEW.description
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_labelingprotocol_FER AFTER DELETE ON labelingprotocol FOR EACH ROW
BEGIN
  INSERT INTO labelingprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabelingProtocol
  , labelingProtocol
  , codeRequestCategory
  , description
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLabelingProtocol
  , OLD.labelingProtocol
  , OLD.codeRequestCategory
  , OLD.description
  , OLD.url
  , OLD.isActive );
END;
$$


--
-- Audit Table For labelingreactionsize 
--

CREATE TABLE IF NOT EXISTS `labelingreactionsize_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeLabelingReactionSize`  varchar(20)  NULL DEFAULT NULL
 ,`labelingReactionSize`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labelingreactionsize 
--

INSERT INTO labelingreactionsize_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeLabelingReactionSize
  , labelingReactionSize
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeLabelingReactionSize
  , labelingReactionSize
  , isActive
  , sortOrder
  FROM labelingreactionsize
  WHERE NOT EXISTS(SELECT * FROM labelingreactionsize_Audit)
$$

--
-- Audit Triggers For labelingreactionsize 
--


CREATE TRIGGER TrAI_labelingreactionsize_FER AFTER INSERT ON labelingreactionsize FOR EACH ROW
BEGIN
  INSERT INTO labelingreactionsize_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeLabelingReactionSize
  , labelingReactionSize
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeLabelingReactionSize
  , NEW.labelingReactionSize
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_labelingreactionsize_FER AFTER UPDATE ON labelingreactionsize FOR EACH ROW
BEGIN
  INSERT INTO labelingreactionsize_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeLabelingReactionSize
  , labelingReactionSize
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeLabelingReactionSize
  , NEW.labelingReactionSize
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_labelingreactionsize_FER AFTER DELETE ON labelingreactionsize FOR EACH ROW
BEGIN
  INSERT INTO labelingreactionsize_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeLabelingReactionSize
  , labelingReactionSize
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeLabelingReactionSize
  , OLD.labelingReactionSize
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For label 
--

CREATE TABLE IF NOT EXISTS `label_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLabel`  int(10)  NULL DEFAULT NULL
 ,`label`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for label 
--

INSERT INTO label_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabel
  , label
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLabel
  , label
  , isActive
  FROM label
  WHERE NOT EXISTS(SELECT * FROM label_Audit)
$$

--
-- Audit Triggers For label 
--


CREATE TRIGGER TrAI_label_FER AFTER INSERT ON label FOR EACH ROW
BEGIN
  INSERT INTO label_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabel
  , label
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLabel
  , NEW.label
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_label_FER AFTER UPDATE ON label FOR EACH ROW
BEGIN
  INSERT INTO label_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabel
  , label
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLabel
  , NEW.label
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_label_FER AFTER DELETE ON label FOR EACH ROW
BEGIN
  INSERT INTO label_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLabel
  , label
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLabel
  , OLD.label
  , OLD.isActive );
END;
$$


--
-- Audit Table For labmanager 
--

CREATE TABLE IF NOT EXISTS `labmanager_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`sendUploadAlert`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labmanager 
--

INSERT INTO labmanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLab
  , idAppUser
  , sendUploadAlert
  FROM labmanager
  WHERE NOT EXISTS(SELECT * FROM labmanager_Audit)
$$

--
-- Audit Triggers For labmanager 
--


CREATE TRIGGER TrAI_labmanager_FER AFTER INSERT ON labmanager FOR EACH ROW
BEGIN
  INSERT INTO labmanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAU_labmanager_FER AFTER UPDATE ON labmanager FOR EACH ROW
BEGIN
  INSERT INTO labmanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAD_labmanager_FER AFTER DELETE ON labmanager FOR EACH ROW
BEGIN
  INSERT INTO labmanager_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLab
  , OLD.idAppUser
  , OLD.sendUploadAlert );
END;
$$


--
-- Audit Table For labuser 
--

CREATE TABLE IF NOT EXISTS `labuser_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sendUploadAlert`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for labuser 
--

INSERT INTO labuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sortOrder
  , isActive
  , sendUploadAlert )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLab
  , idAppUser
  , sortOrder
  , isActive
  , sendUploadAlert
  FROM labuser
  WHERE NOT EXISTS(SELECT * FROM labuser_Audit)
$$

--
-- Audit Triggers For labuser 
--


CREATE TRIGGER TrAI_labuser_FER AFTER INSERT ON labuser FOR EACH ROW
BEGIN
  INSERT INTO labuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sortOrder
  , isActive
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sortOrder
  , NEW.isActive
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAU_labuser_FER AFTER UPDATE ON labuser FOR EACH ROW
BEGIN
  INSERT INTO labuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sortOrder
  , isActive
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.idAppUser
  , NEW.sortOrder
  , NEW.isActive
  , NEW.sendUploadAlert );
END;
$$


CREATE TRIGGER TrAD_labuser_FER AFTER DELETE ON labuser FOR EACH ROW
BEGIN
  INSERT INTO labuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , idAppUser
  , sortOrder
  , isActive
  , sendUploadAlert )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLab
  , OLD.idAppUser
  , OLD.sortOrder
  , OLD.isActive
  , OLD.sendUploadAlert );
END;
$$


--
-- Audit Table For lab 
--

CREATE TABLE IF NOT EXISTS `lab_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`department`  varchar(200)  NULL DEFAULT NULL
 ,`notes`  varchar(500)  NULL DEFAULT NULL
 ,`contactName`  varchar(200)  NULL DEFAULT NULL
 ,`contactAddress`  varchar(200)  NULL DEFAULT NULL
 ,`contactCodeState`  varchar(10)  NULL DEFAULT NULL
 ,`contactZip`  varchar(50)  NULL DEFAULT NULL
 ,`contactCity`  varchar(200)  NULL DEFAULT NULL
 ,`contactPhone`  varchar(50)  NULL DEFAULT NULL
 ,`contactEmail`  varchar(200)  NULL DEFAULT NULL
 ,`isCCSGMember`  char(1)  NULL DEFAULT NULL
 ,`firstName`  varchar(200)  NULL DEFAULT NULL
 ,`lastName`  varchar(200)  NULL DEFAULT NULL
 ,`isExternalPricing`  varchar(1)  NULL DEFAULT NULL
 ,`isExternalPricingCommercial`  char(1)  NULL DEFAULT NULL
 ,`isActive`  varchar(1)  NULL DEFAULT NULL
 ,`excludeUsage`  char(1)  NULL DEFAULT NULL
 ,`billingContactEmail`  varchar(200)  NULL DEFAULT NULL
 ,`version`  bigint(20)  NULL DEFAULT NULL
 ,`contactAddress2`  varchar(200)  NULL DEFAULT NULL
 ,`contactCountry`  varchar(200)  NULL DEFAULT NULL
 ,`billingContactPhone`  varchar(50)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for lab 
--

INSERT INTO lab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , name
  , department
  , notes
  , contactName
  , contactAddress
  , contactCodeState
  , contactZip
  , contactCity
  , contactPhone
  , contactEmail
  , isCCSGMember
  , firstName
  , lastName
  , isExternalPricing
  , isExternalPricingCommercial
  , isActive
  , excludeUsage
  , billingContactEmail
  , version
  , contactAddress2
  , contactCountry
  , billingContactPhone )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idLab
  , name
  , department
  , notes
  , contactName
  , contactAddress
  , contactCodeState
  , contactZip
  , contactCity
  , contactPhone
  , contactEmail
  , isCCSGMember
  , firstName
  , lastName
  , isExternalPricing
  , isExternalPricingCommercial
  , isActive
  , excludeUsage
  , billingContactEmail
  , version
  , contactAddress2
  , contactCountry
  , billingContactPhone
  FROM lab
  WHERE NOT EXISTS(SELECT * FROM lab_Audit)
$$

--
-- Audit Triggers For lab 
--


CREATE TRIGGER TrAI_lab_FER AFTER INSERT ON lab FOR EACH ROW
BEGIN
  INSERT INTO lab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , name
  , department
  , notes
  , contactName
  , contactAddress
  , contactCodeState
  , contactZip
  , contactCity
  , contactPhone
  , contactEmail
  , isCCSGMember
  , firstName
  , lastName
  , isExternalPricing
  , isExternalPricingCommercial
  , isActive
  , excludeUsage
  , billingContactEmail
  , version
  , contactAddress2
  , contactCountry
  , billingContactPhone )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.name
  , NEW.department
  , NEW.notes
  , NEW.contactName
  , NEW.contactAddress
  , NEW.contactCodeState
  , NEW.contactZip
  , NEW.contactCity
  , NEW.contactPhone
  , NEW.contactEmail
  , NEW.isCCSGMember
  , NEW.firstName
  , NEW.lastName
  , NEW.isExternalPricing
  , NEW.isExternalPricingCommercial
  , NEW.isActive
  , NEW.excludeUsage
  , NEW.billingContactEmail
  , NEW.version
  , NEW.contactAddress2
  , NEW.contactCountry
  , NEW.billingContactPhone );
END;
$$


CREATE TRIGGER TrAU_lab_FER AFTER UPDATE ON lab FOR EACH ROW
BEGIN
  INSERT INTO lab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , name
  , department
  , notes
  , contactName
  , contactAddress
  , contactCodeState
  , contactZip
  , contactCity
  , contactPhone
  , contactEmail
  , isCCSGMember
  , firstName
  , lastName
  , isExternalPricing
  , isExternalPricingCommercial
  , isActive
  , excludeUsage
  , billingContactEmail
  , version
  , contactAddress2
  , contactCountry
  , billingContactPhone )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idLab
  , NEW.name
  , NEW.department
  , NEW.notes
  , NEW.contactName
  , NEW.contactAddress
  , NEW.contactCodeState
  , NEW.contactZip
  , NEW.contactCity
  , NEW.contactPhone
  , NEW.contactEmail
  , NEW.isCCSGMember
  , NEW.firstName
  , NEW.lastName
  , NEW.isExternalPricing
  , NEW.isExternalPricingCommercial
  , NEW.isActive
  , NEW.excludeUsage
  , NEW.billingContactEmail
  , NEW.version
  , NEW.contactAddress2
  , NEW.contactCountry
  , NEW.billingContactPhone );
END;
$$


CREATE TRIGGER TrAD_lab_FER AFTER DELETE ON lab FOR EACH ROW
BEGIN
  INSERT INTO lab_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idLab
  , name
  , department
  , notes
  , contactName
  , contactAddress
  , contactCodeState
  , contactZip
  , contactCity
  , contactPhone
  , contactEmail
  , isCCSGMember
  , firstName
  , lastName
  , isExternalPricing
  , isExternalPricingCommercial
  , isActive
  , excludeUsage
  , billingContactEmail
  , version
  , contactAddress2
  , contactCountry
  , billingContactPhone )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idLab
  , OLD.name
  , OLD.department
  , OLD.notes
  , OLD.contactName
  , OLD.contactAddress
  , OLD.contactCodeState
  , OLD.contactZip
  , OLD.contactCity
  , OLD.contactPhone
  , OLD.contactEmail
  , OLD.isCCSGMember
  , OLD.firstName
  , OLD.lastName
  , OLD.isExternalPricing
  , OLD.isExternalPricingCommercial
  , OLD.isActive
  , OLD.excludeUsage
  , OLD.billingContactEmail
  , OLD.version
  , OLD.contactAddress2
  , OLD.contactCountry
  , OLD.billingContactPhone );
END;
$$


--
-- Audit Table For metrixobject 
--

CREATE TABLE IF NOT EXISTS `metrixobject_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`id`  int(10)  NULL DEFAULT NULL
 ,`run_id`  varchar(512)  NULL DEFAULT NULL
 ,`object_value`  varbinary(8000)  NULL DEFAULT NULL
 ,`state`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for metrixobject 
--

INSERT INTO metrixobject_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , id
  , run_id
  , object_value
  , state )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , id
  , run_id
  , object_value
  , state
  FROM metrixobject
  WHERE NOT EXISTS(SELECT * FROM metrixobject_Audit)
$$

--
-- Audit Triggers For metrixobject 
--


CREATE TRIGGER TrAI_metrixobject_FER AFTER INSERT ON metrixobject FOR EACH ROW
BEGIN
  INSERT INTO metrixobject_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , id
  , run_id
  , object_value
  , state )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.id
  , NEW.run_id
  , NEW.object_value
  , NEW.state );
END;
$$


CREATE TRIGGER TrAU_metrixobject_FER AFTER UPDATE ON metrixobject FOR EACH ROW
BEGIN
  INSERT INTO metrixobject_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , id
  , run_id
  , object_value
  , state )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.id
  , NEW.run_id
  , NEW.object_value
  , NEW.state );
END;
$$


CREATE TRIGGER TrAD_metrixobject_FER AFTER DELETE ON metrixobject FOR EACH ROW
BEGIN
  INSERT INTO metrixobject_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , id
  , run_id
  , object_value
  , state )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.id
  , OLD.run_id
  , OLD.object_value
  , OLD.state );
END;
$$


--
-- Audit Table For newsitem 
--

CREATE TABLE IF NOT EXISTS `newsitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idNewsItem`  int(10)  NULL DEFAULT NULL
 ,`idSubmitter`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`title`  varchar(200)  NULL DEFAULT NULL
 ,`message`  varchar(4000)  NULL DEFAULT NULL
 ,`date`  datetime  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for newsitem 
--

INSERT INTO newsitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNewsItem
  , idSubmitter
  , idCoreFacility
  , title
  , message
  , date )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idNewsItem
  , idSubmitter
  , idCoreFacility
  , title
  , message
  , date
  FROM newsitem
  WHERE NOT EXISTS(SELECT * FROM newsitem_Audit)
$$

--
-- Audit Triggers For newsitem 
--


CREATE TRIGGER TrAI_newsitem_FER AFTER INSERT ON newsitem FOR EACH ROW
BEGIN
  INSERT INTO newsitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNewsItem
  , idSubmitter
  , idCoreFacility
  , title
  , message
  , date )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idNewsItem
  , NEW.idSubmitter
  , NEW.idCoreFacility
  , NEW.title
  , NEW.message
  , NEW.date );
END;
$$


CREATE TRIGGER TrAU_newsitem_FER AFTER UPDATE ON newsitem FOR EACH ROW
BEGIN
  INSERT INTO newsitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNewsItem
  , idSubmitter
  , idCoreFacility
  , title
  , message
  , date )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idNewsItem
  , NEW.idSubmitter
  , NEW.idCoreFacility
  , NEW.title
  , NEW.message
  , NEW.date );
END;
$$


CREATE TRIGGER TrAD_newsitem_FER AFTER DELETE ON newsitem FOR EACH ROW
BEGIN
  INSERT INTO newsitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNewsItem
  , idSubmitter
  , idCoreFacility
  , title
  , message
  , date )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idNewsItem
  , OLD.idSubmitter
  , OLD.idCoreFacility
  , OLD.title
  , OLD.message
  , OLD.date );
END;
$$


--
-- Audit Table For notification 
--

CREATE TABLE IF NOT EXISTS `notification_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idNotification`  int(10)  NULL DEFAULT NULL
 ,`idUserTarget`  int(10)  NULL DEFAULT NULL
 ,`idLabTarget`  int(10)  NULL DEFAULT NULL
 ,`sourceType`  varchar(20)  NULL DEFAULT NULL
 ,`message`  varchar(250)  NULL DEFAULT NULL
 ,`date`  datetime  NULL DEFAULT NULL
 ,`expID`  varchar(25)  NULL DEFAULT NULL
 ,`type`  varchar(25)  NULL DEFAULT NULL
 ,`fullNameUser`  varchar(100)  NULL DEFAULT NULL
 ,`imageSource`  varchar(50)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for notification 
--

INSERT INTO notification_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNotification
  , idUserTarget
  , idLabTarget
  , sourceType
  , message
  , date
  , expID
  , type
  , fullNameUser
  , imageSource
  , idCoreFacility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idNotification
  , idUserTarget
  , idLabTarget
  , sourceType
  , message
  , date
  , expID
  , type
  , fullNameUser
  , imageSource
  , idCoreFacility
  FROM notification
  WHERE NOT EXISTS(SELECT * FROM notification_Audit)
$$

--
-- Audit Triggers For notification 
--


CREATE TRIGGER TrAI_notification_FER AFTER INSERT ON notification FOR EACH ROW
BEGIN
  INSERT INTO notification_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNotification
  , idUserTarget
  , idLabTarget
  , sourceType
  , message
  , date
  , expID
  , type
  , fullNameUser
  , imageSource
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idNotification
  , NEW.idUserTarget
  , NEW.idLabTarget
  , NEW.sourceType
  , NEW.message
  , NEW.date
  , NEW.expID
  , NEW.type
  , NEW.fullNameUser
  , NEW.imageSource
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAU_notification_FER AFTER UPDATE ON notification FOR EACH ROW
BEGIN
  INSERT INTO notification_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNotification
  , idUserTarget
  , idLabTarget
  , sourceType
  , message
  , date
  , expID
  , type
  , fullNameUser
  , imageSource
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idNotification
  , NEW.idUserTarget
  , NEW.idLabTarget
  , NEW.sourceType
  , NEW.message
  , NEW.date
  , NEW.expID
  , NEW.type
  , NEW.fullNameUser
  , NEW.imageSource
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAD_notification_FER AFTER DELETE ON notification FOR EACH ROW
BEGIN
  INSERT INTO notification_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNotification
  , idUserTarget
  , idLabTarget
  , sourceType
  , message
  , date
  , expID
  , type
  , fullNameUser
  , imageSource
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idNotification
  , OLD.idUserTarget
  , OLD.idLabTarget
  , OLD.sourceType
  , OLD.message
  , OLD.date
  , OLD.expID
  , OLD.type
  , OLD.fullNameUser
  , OLD.imageSource
  , OLD.idCoreFacility );
END;
$$


--
-- Audit Table For nucleotidetype 
--

CREATE TABLE IF NOT EXISTS `nucleotidetype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeNucleotideType`  varchar(50)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for nucleotidetype 
--

INSERT INTO nucleotidetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeNucleotideType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeNucleotideType
  FROM nucleotidetype
  WHERE NOT EXISTS(SELECT * FROM nucleotidetype_Audit)
$$

--
-- Audit Triggers For nucleotidetype 
--


CREATE TRIGGER TrAI_nucleotidetype_FER AFTER INSERT ON nucleotidetype FOR EACH ROW
BEGIN
  INSERT INTO nucleotidetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeNucleotideType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeNucleotideType );
END;
$$


CREATE TRIGGER TrAU_nucleotidetype_FER AFTER UPDATE ON nucleotidetype FOR EACH ROW
BEGIN
  INSERT INTO nucleotidetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeNucleotideType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeNucleotideType );
END;
$$


CREATE TRIGGER TrAD_nucleotidetype_FER AFTER DELETE ON nucleotidetype FOR EACH ROW
BEGIN
  INSERT INTO nucleotidetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeNucleotideType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeNucleotideType );
END;
$$


--
-- Audit Table For numbersequencingcyclesallowed 
--

CREATE TABLE IF NOT EXISTS `numbersequencingcyclesallowed_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idNumberSequencingCyclesAllowed`  int(10)  NULL DEFAULT NULL
 ,`idNumberSequencingCycles`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`idSeqRunType`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(100)  NULL DEFAULT NULL
 ,`isCustom`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`protocolDescription`  longtext  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for numbersequencingcyclesallowed 
--

INSERT INTO numbersequencingcyclesallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCyclesAllowed
  , idNumberSequencingCycles
  , codeRequestCategory
  , idSeqRunType
  , name
  , isCustom
  , sortOrder
  , isActive
  , protocolDescription )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idNumberSequencingCyclesAllowed
  , idNumberSequencingCycles
  , codeRequestCategory
  , idSeqRunType
  , name
  , isCustom
  , sortOrder
  , isActive
  , protocolDescription
  FROM numbersequencingcyclesallowed
  WHERE NOT EXISTS(SELECT * FROM numbersequencingcyclesallowed_Audit)
$$

--
-- Audit Triggers For numbersequencingcyclesallowed 
--


CREATE TRIGGER TrAI_numbersequencingcyclesallowed_FER AFTER INSERT ON numbersequencingcyclesallowed FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcyclesallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCyclesAllowed
  , idNumberSequencingCycles
  , codeRequestCategory
  , idSeqRunType
  , name
  , isCustom
  , sortOrder
  , isActive
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idNumberSequencingCyclesAllowed
  , NEW.idNumberSequencingCycles
  , NEW.codeRequestCategory
  , NEW.idSeqRunType
  , NEW.name
  , NEW.isCustom
  , NEW.sortOrder
  , NEW.isActive
  , NEW.protocolDescription );
END;
$$


CREATE TRIGGER TrAU_numbersequencingcyclesallowed_FER AFTER UPDATE ON numbersequencingcyclesallowed FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcyclesallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCyclesAllowed
  , idNumberSequencingCycles
  , codeRequestCategory
  , idSeqRunType
  , name
  , isCustom
  , sortOrder
  , isActive
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idNumberSequencingCyclesAllowed
  , NEW.idNumberSequencingCycles
  , NEW.codeRequestCategory
  , NEW.idSeqRunType
  , NEW.name
  , NEW.isCustom
  , NEW.sortOrder
  , NEW.isActive
  , NEW.protocolDescription );
END;
$$


CREATE TRIGGER TrAD_numbersequencingcyclesallowed_FER AFTER DELETE ON numbersequencingcyclesallowed FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcyclesallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCyclesAllowed
  , idNumberSequencingCycles
  , codeRequestCategory
  , idSeqRunType
  , name
  , isCustom
  , sortOrder
  , isActive
  , protocolDescription )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idNumberSequencingCyclesAllowed
  , OLD.idNumberSequencingCycles
  , OLD.codeRequestCategory
  , OLD.idSeqRunType
  , OLD.name
  , OLD.isCustom
  , OLD.sortOrder
  , OLD.isActive
  , OLD.protocolDescription );
END;
$$


--
-- Audit Table For numbersequencingcycles 
--

CREATE TABLE IF NOT EXISTS `numbersequencingcycles_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idNumberSequencingCycles`  int(10)  NULL DEFAULT NULL
 ,`numberSequencingCycles`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`notes`  varchar(500)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for numbersequencingcycles 
--

INSERT INTO numbersequencingcycles_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCycles
  , numberSequencingCycles
  , isActive
  , sortOrder
  , notes )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idNumberSequencingCycles
  , numberSequencingCycles
  , isActive
  , sortOrder
  , notes
  FROM numbersequencingcycles
  WHERE NOT EXISTS(SELECT * FROM numbersequencingcycles_Audit)
$$

--
-- Audit Triggers For numbersequencingcycles 
--


CREATE TRIGGER TrAI_numbersequencingcycles_FER AFTER INSERT ON numbersequencingcycles FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcycles_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCycles
  , numberSequencingCycles
  , isActive
  , sortOrder
  , notes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idNumberSequencingCycles
  , NEW.numberSequencingCycles
  , NEW.isActive
  , NEW.sortOrder
  , NEW.notes );
END;
$$


CREATE TRIGGER TrAU_numbersequencingcycles_FER AFTER UPDATE ON numbersequencingcycles FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcycles_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCycles
  , numberSequencingCycles
  , isActive
  , sortOrder
  , notes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idNumberSequencingCycles
  , NEW.numberSequencingCycles
  , NEW.isActive
  , NEW.sortOrder
  , NEW.notes );
END;
$$


CREATE TRIGGER TrAD_numbersequencingcycles_FER AFTER DELETE ON numbersequencingcycles FOR EACH ROW
BEGIN
  INSERT INTO numbersequencingcycles_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idNumberSequencingCycles
  , numberSequencingCycles
  , isActive
  , sortOrder
  , notes )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idNumberSequencingCycles
  , OLD.numberSequencingCycles
  , OLD.isActive
  , OLD.sortOrder
  , OLD.notes );
END;
$$


--
-- Audit Table For oligobarcodeschemeallowed 
--

CREATE TABLE IF NOT EXISTS `oligobarcodeschemeallowed_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idOligoBarcodeSchemeAllowed`  int(10)  NULL DEFAULT NULL
 ,`idOligoBarcodeScheme`  int(10)  NULL DEFAULT NULL
 ,`idSeqLibProtocol`  int(10)  NULL DEFAULT NULL
 ,`isIndexGroupB`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for oligobarcodeschemeallowed 
--

INSERT INTO oligobarcodeschemeallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeSchemeAllowed
  , idOligoBarcodeScheme
  , idSeqLibProtocol
  , isIndexGroupB )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idOligoBarcodeSchemeAllowed
  , idOligoBarcodeScheme
  , idSeqLibProtocol
  , isIndexGroupB
  FROM oligobarcodeschemeallowed
  WHERE NOT EXISTS(SELECT * FROM oligobarcodeschemeallowed_Audit)
$$

--
-- Audit Triggers For oligobarcodeschemeallowed 
--


CREATE TRIGGER TrAI_oligobarcodeschemeallowed_FER AFTER INSERT ON oligobarcodeschemeallowed FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodeschemeallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeSchemeAllowed
  , idOligoBarcodeScheme
  , idSeqLibProtocol
  , isIndexGroupB )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idOligoBarcodeSchemeAllowed
  , NEW.idOligoBarcodeScheme
  , NEW.idSeqLibProtocol
  , NEW.isIndexGroupB );
END;
$$


CREATE TRIGGER TrAU_oligobarcodeschemeallowed_FER AFTER UPDATE ON oligobarcodeschemeallowed FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodeschemeallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeSchemeAllowed
  , idOligoBarcodeScheme
  , idSeqLibProtocol
  , isIndexGroupB )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idOligoBarcodeSchemeAllowed
  , NEW.idOligoBarcodeScheme
  , NEW.idSeqLibProtocol
  , NEW.isIndexGroupB );
END;
$$


CREATE TRIGGER TrAD_oligobarcodeschemeallowed_FER AFTER DELETE ON oligobarcodeschemeallowed FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodeschemeallowed_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeSchemeAllowed
  , idOligoBarcodeScheme
  , idSeqLibProtocol
  , isIndexGroupB )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idOligoBarcodeSchemeAllowed
  , OLD.idOligoBarcodeScheme
  , OLD.idSeqLibProtocol
  , OLD.isIndexGroupB );
END;
$$


--
-- Audit Table For oligobarcodescheme 
--

CREATE TABLE IF NOT EXISTS `oligobarcodescheme_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idOligoBarcodeScheme`  int(10)  NULL DEFAULT NULL
 ,`oligoBarcodeScheme`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(2000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for oligobarcodescheme 
--

INSERT INTO oligobarcodescheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeScheme
  , oligoBarcodeScheme
  , description
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idOligoBarcodeScheme
  , oligoBarcodeScheme
  , description
  , isActive
  FROM oligobarcodescheme
  WHERE NOT EXISTS(SELECT * FROM oligobarcodescheme_Audit)
$$

--
-- Audit Triggers For oligobarcodescheme 
--


CREATE TRIGGER TrAI_oligobarcodescheme_FER AFTER INSERT ON oligobarcodescheme FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodescheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeScheme
  , oligoBarcodeScheme
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idOligoBarcodeScheme
  , NEW.oligoBarcodeScheme
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_oligobarcodescheme_FER AFTER UPDATE ON oligobarcodescheme FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodescheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeScheme
  , oligoBarcodeScheme
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idOligoBarcodeScheme
  , NEW.oligoBarcodeScheme
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_oligobarcodescheme_FER AFTER DELETE ON oligobarcodescheme FOR EACH ROW
BEGIN
  INSERT INTO oligobarcodescheme_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcodeScheme
  , oligoBarcodeScheme
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idOligoBarcodeScheme
  , OLD.oligoBarcodeScheme
  , OLD.description
  , OLD.isActive );
END;
$$


--
-- Audit Table For oligobarcode 
--

CREATE TABLE IF NOT EXISTS `oligobarcode_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idOligoBarcode`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(50)  NULL DEFAULT NULL
 ,`barcodeSequence`  varchar(20)  NULL DEFAULT NULL
 ,`idOligoBarcodeScheme`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for oligobarcode 
--

INSERT INTO oligobarcode_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcode
  , name
  , barcodeSequence
  , idOligoBarcodeScheme
  , sortOrder
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idOligoBarcode
  , name
  , barcodeSequence
  , idOligoBarcodeScheme
  , sortOrder
  , isActive
  FROM oligobarcode
  WHERE NOT EXISTS(SELECT * FROM oligobarcode_Audit)
$$

--
-- Audit Triggers For oligobarcode 
--


CREATE TRIGGER TrAI_oligobarcode_FER AFTER INSERT ON oligobarcode FOR EACH ROW
BEGIN
  INSERT INTO oligobarcode_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcode
  , name
  , barcodeSequence
  , idOligoBarcodeScheme
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idOligoBarcode
  , NEW.name
  , NEW.barcodeSequence
  , NEW.idOligoBarcodeScheme
  , NEW.sortOrder
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_oligobarcode_FER AFTER UPDATE ON oligobarcode FOR EACH ROW
BEGIN
  INSERT INTO oligobarcode_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcode
  , name
  , barcodeSequence
  , idOligoBarcodeScheme
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idOligoBarcode
  , NEW.name
  , NEW.barcodeSequence
  , NEW.idOligoBarcodeScheme
  , NEW.sortOrder
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_oligobarcode_FER AFTER DELETE ON oligobarcode FOR EACH ROW
BEGIN
  INSERT INTO oligobarcode_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOligoBarcode
  , name
  , barcodeSequence
  , idOligoBarcodeScheme
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idOligoBarcode
  , OLD.name
  , OLD.barcodeSequence
  , OLD.idOligoBarcodeScheme
  , OLD.sortOrder
  , OLD.isActive );
END;
$$


--
-- Audit Table For organism 
--

CREATE TABLE IF NOT EXISTS `organism_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`organism`  varchar(50)  NULL DEFAULT NULL
 ,`abbreviation`  varchar(10)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`das2Name`  varchar(200)  NULL DEFAULT NULL
 ,`sortOrder`  int(10) unsigned  NULL DEFAULT NULL
 ,`binomialName`  varchar(200)  NULL DEFAULT NULL
 ,`NCBITaxID`  varchar(45)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for organism 
--

INSERT INTO organism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOrganism
  , organism
  , abbreviation
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , das2Name
  , sortOrder
  , binomialName
  , NCBITaxID )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idOrganism
  , organism
  , abbreviation
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , das2Name
  , sortOrder
  , binomialName
  , NCBITaxID
  FROM organism
  WHERE NOT EXISTS(SELECT * FROM organism_Audit)
$$

--
-- Audit Triggers For organism 
--


CREATE TRIGGER TrAI_organism_FER AFTER INSERT ON organism FOR EACH ROW
BEGIN
  INSERT INTO organism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOrganism
  , organism
  , abbreviation
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , das2Name
  , sortOrder
  , binomialName
  , NCBITaxID )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idOrganism
  , NEW.organism
  , NEW.abbreviation
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser
  , NEW.das2Name
  , NEW.sortOrder
  , NEW.binomialName
  , NEW.NCBITaxID );
END;
$$


CREATE TRIGGER TrAU_organism_FER AFTER UPDATE ON organism FOR EACH ROW
BEGIN
  INSERT INTO organism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOrganism
  , organism
  , abbreviation
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , das2Name
  , sortOrder
  , binomialName
  , NCBITaxID )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idOrganism
  , NEW.organism
  , NEW.abbreviation
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser
  , NEW.das2Name
  , NEW.sortOrder
  , NEW.binomialName
  , NEW.NCBITaxID );
END;
$$


CREATE TRIGGER TrAD_organism_FER AFTER DELETE ON organism FOR EACH ROW
BEGIN
  INSERT INTO organism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOrganism
  , organism
  , abbreviation
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , das2Name
  , sortOrder
  , binomialName
  , NCBITaxID )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idOrganism
  , OLD.organism
  , OLD.abbreviation
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive
  , OLD.idAppUser
  , OLD.das2Name
  , OLD.sortOrder
  , OLD.binomialName
  , OLD.NCBITaxID );
END;
$$


--
-- Audit Table For otheraccountfieldsconfiguration 
--

CREATE TABLE IF NOT EXISTS `otheraccountfieldsconfiguration_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idOtherAccountFieldsConfiguration`  int(10)  NULL DEFAULT NULL
 ,`fieldName`  varchar(50)  NULL DEFAULT NULL
 ,`include`  char(1)  NULL DEFAULT NULL
 ,`isRequired`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for otheraccountfieldsconfiguration 
--

INSERT INTO otheraccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOtherAccountFieldsConfiguration
  , fieldName
  , include
  , isRequired )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idOtherAccountFieldsConfiguration
  , fieldName
  , include
  , isRequired
  FROM otheraccountfieldsconfiguration
  WHERE NOT EXISTS(SELECT * FROM otheraccountfieldsconfiguration_Audit)
$$

--
-- Audit Triggers For otheraccountfieldsconfiguration 
--


CREATE TRIGGER TrAI_otheraccountfieldsconfiguration_FER AFTER INSERT ON otheraccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO otheraccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOtherAccountFieldsConfiguration
  , fieldName
  , include
  , isRequired )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idOtherAccountFieldsConfiguration
  , NEW.fieldName
  , NEW.include
  , NEW.isRequired );
END;
$$


CREATE TRIGGER TrAU_otheraccountfieldsconfiguration_FER AFTER UPDATE ON otheraccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO otheraccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOtherAccountFieldsConfiguration
  , fieldName
  , include
  , isRequired )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idOtherAccountFieldsConfiguration
  , NEW.fieldName
  , NEW.include
  , NEW.isRequired );
END;
$$


CREATE TRIGGER TrAD_otheraccountfieldsconfiguration_FER AFTER DELETE ON otheraccountfieldsconfiguration FOR EACH ROW
BEGIN
  INSERT INTO otheraccountfieldsconfiguration_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idOtherAccountFieldsConfiguration
  , fieldName
  , include
  , isRequired )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idOtherAccountFieldsConfiguration
  , OLD.fieldName
  , OLD.include
  , OLD.isRequired );
END;
$$


--
-- Audit Table For platetype 
--

CREATE TABLE IF NOT EXISTS `platetype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codePlateType`  varchar(10)  NULL DEFAULT NULL
 ,`plateTypeDescription`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for platetype 
--

INSERT INTO platetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePlateType
  , plateTypeDescription
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codePlateType
  , plateTypeDescription
  , isActive
  FROM platetype
  WHERE NOT EXISTS(SELECT * FROM platetype_Audit)
$$

--
-- Audit Triggers For platetype 
--


CREATE TRIGGER TrAI_platetype_FER AFTER INSERT ON platetype FOR EACH ROW
BEGIN
  INSERT INTO platetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePlateType
  , plateTypeDescription
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codePlateType
  , NEW.plateTypeDescription
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_platetype_FER AFTER UPDATE ON platetype FOR EACH ROW
BEGIN
  INSERT INTO platetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePlateType
  , plateTypeDescription
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codePlateType
  , NEW.plateTypeDescription
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_platetype_FER AFTER DELETE ON platetype FOR EACH ROW
BEGIN
  INSERT INTO platetype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePlateType
  , plateTypeDescription
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codePlateType
  , OLD.plateTypeDescription
  , OLD.isActive );
END;
$$


--
-- Audit Table For platewell 
--

CREATE TABLE IF NOT EXISTS `platewell_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPlateWell`  int(10)  NULL DEFAULT NULL
 ,`row`  varchar(50)  NULL DEFAULT NULL
 ,`col`  int(10)  NULL DEFAULT NULL
 ,`ind`  int(10)  NULL DEFAULT NULL
 ,`idPlate`  int(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`codeReactionType`  varchar(10)  NULL DEFAULT NULL
 ,`redoFlag`  char(1)  NULL DEFAULT NULL
 ,`isControl`  char(1)  NULL DEFAULT NULL
 ,`idAssay`  int(10)  NULL DEFAULT NULL
 ,`idPrimer`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for platewell 
--

INSERT INTO platewell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlateWell
  , row
  , col
  , ind
  , idPlate
  , idSample
  , idRequest
  , createDate
  , codeReactionType
  , redoFlag
  , isControl
  , idAssay
  , idPrimer )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPlateWell
  , row
  , col
  , ind
  , idPlate
  , idSample
  , idRequest
  , createDate
  , codeReactionType
  , redoFlag
  , isControl
  , idAssay
  , idPrimer
  FROM platewell
  WHERE NOT EXISTS(SELECT * FROM platewell_Audit)
$$

--
-- Audit Triggers For platewell 
--


CREATE TRIGGER TrAI_platewell_FER AFTER INSERT ON platewell FOR EACH ROW
BEGIN
  INSERT INTO platewell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlateWell
  , row
  , col
  , ind
  , idPlate
  , idSample
  , idRequest
  , createDate
  , codeReactionType
  , redoFlag
  , isControl
  , idAssay
  , idPrimer )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPlateWell
  , NEW.row
  , NEW.col
  , NEW.ind
  , NEW.idPlate
  , NEW.idSample
  , NEW.idRequest
  , NEW.createDate
  , NEW.codeReactionType
  , NEW.redoFlag
  , NEW.isControl
  , NEW.idAssay
  , NEW.idPrimer );
END;
$$


CREATE TRIGGER TrAU_platewell_FER AFTER UPDATE ON platewell FOR EACH ROW
BEGIN
  INSERT INTO platewell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlateWell
  , row
  , col
  , ind
  , idPlate
  , idSample
  , idRequest
  , createDate
  , codeReactionType
  , redoFlag
  , isControl
  , idAssay
  , idPrimer )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPlateWell
  , NEW.row
  , NEW.col
  , NEW.ind
  , NEW.idPlate
  , NEW.idSample
  , NEW.idRequest
  , NEW.createDate
  , NEW.codeReactionType
  , NEW.redoFlag
  , NEW.isControl
  , NEW.idAssay
  , NEW.idPrimer );
END;
$$


CREATE TRIGGER TrAD_platewell_FER AFTER DELETE ON platewell FOR EACH ROW
BEGIN
  INSERT INTO platewell_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlateWell
  , row
  , col
  , ind
  , idPlate
  , idSample
  , idRequest
  , createDate
  , codeReactionType
  , redoFlag
  , isControl
  , idAssay
  , idPrimer )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPlateWell
  , OLD.row
  , OLD.col
  , OLD.ind
  , OLD.idPlate
  , OLD.idSample
  , OLD.idRequest
  , OLD.createDate
  , OLD.codeReactionType
  , OLD.redoFlag
  , OLD.isControl
  , OLD.idAssay
  , OLD.idPrimer );
END;
$$


--
-- Audit Table For plate 
--

CREATE TABLE IF NOT EXISTS `plate_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPlate`  int(10)  NULL DEFAULT NULL
 ,`idInstrumentRun`  int(10)  NULL DEFAULT NULL
 ,`codePlateType`  varchar(10)  NULL DEFAULT NULL
 ,`quadrant`  int(10)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`comments`  varchar(200)  NULL DEFAULT NULL
 ,`label`  varchar(50)  NULL DEFAULT NULL
 ,`codeReactionType`  varchar(10)  NULL DEFAULT NULL
 ,`creator`  varchar(50)  NULL DEFAULT NULL
 ,`codeSealType`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for plate 
--

INSERT INTO plate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlate
  , idInstrumentRun
  , codePlateType
  , quadrant
  , createDate
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPlate
  , idInstrumentRun
  , codePlateType
  , quadrant
  , createDate
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType
  FROM plate
  WHERE NOT EXISTS(SELECT * FROM plate_Audit)
$$

--
-- Audit Triggers For plate 
--


CREATE TRIGGER TrAI_plate_FER AFTER INSERT ON plate FOR EACH ROW
BEGIN
  INSERT INTO plate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlate
  , idInstrumentRun
  , codePlateType
  , quadrant
  , createDate
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPlate
  , NEW.idInstrumentRun
  , NEW.codePlateType
  , NEW.quadrant
  , NEW.createDate
  , NEW.comments
  , NEW.label
  , NEW.codeReactionType
  , NEW.creator
  , NEW.codeSealType );
END;
$$


CREATE TRIGGER TrAU_plate_FER AFTER UPDATE ON plate FOR EACH ROW
BEGIN
  INSERT INTO plate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlate
  , idInstrumentRun
  , codePlateType
  , quadrant
  , createDate
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPlate
  , NEW.idInstrumentRun
  , NEW.codePlateType
  , NEW.quadrant
  , NEW.createDate
  , NEW.comments
  , NEW.label
  , NEW.codeReactionType
  , NEW.creator
  , NEW.codeSealType );
END;
$$


CREATE TRIGGER TrAD_plate_FER AFTER DELETE ON plate FOR EACH ROW
BEGIN
  INSERT INTO plate_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlate
  , idInstrumentRun
  , codePlateType
  , quadrant
  , createDate
  , comments
  , label
  , codeReactionType
  , creator
  , codeSealType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPlate
  , OLD.idInstrumentRun
  , OLD.codePlateType
  , OLD.quadrant
  , OLD.createDate
  , OLD.comments
  , OLD.label
  , OLD.codeReactionType
  , OLD.creator
  , OLD.codeSealType );
END;
$$


--
-- Audit Table For pricecategorystep 
--

CREATE TABLE IF NOT EXISTS `pricecategorystep_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
 ,`codeStep`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricecategorystep 
--

INSERT INTO pricecategorystep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , codeStep )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceCategory
  , codeStep
  FROM pricecategorystep
  WHERE NOT EXISTS(SELECT * FROM pricecategorystep_Audit)
$$

--
-- Audit Triggers For pricecategorystep 
--


CREATE TRIGGER TrAI_pricecategorystep_FER AFTER INSERT ON pricecategorystep FOR EACH ROW
BEGIN
  INSERT INTO pricecategorystep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , codeStep )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceCategory
  , NEW.codeStep );
END;
$$


CREATE TRIGGER TrAU_pricecategorystep_FER AFTER UPDATE ON pricecategorystep FOR EACH ROW
BEGIN
  INSERT INTO pricecategorystep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , codeStep )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceCategory
  , NEW.codeStep );
END;
$$


CREATE TRIGGER TrAD_pricecategorystep_FER AFTER DELETE ON pricecategorystep FOR EACH ROW
BEGIN
  INSERT INTO pricecategorystep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , codeStep )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceCategory
  , OLD.codeStep );
END;
$$


--
-- Audit Table For pricecategory 
--

CREATE TABLE IF NOT EXISTS `pricecategory_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(5000)  NULL DEFAULT NULL
 ,`codeBillingChargeKind`  varchar(10)  NULL DEFAULT NULL
 ,`pluginClassName`  varchar(500)  NULL DEFAULT NULL
 ,`dictionaryClassNameFilter1`  varchar(500)  NULL DEFAULT NULL
 ,`dictionaryClassNameFilter2`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricecategory 
--

INSERT INTO pricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , name
  , description
  , codeBillingChargeKind
  , pluginClassName
  , dictionaryClassNameFilter1
  , dictionaryClassNameFilter2
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceCategory
  , name
  , description
  , codeBillingChargeKind
  , pluginClassName
  , dictionaryClassNameFilter1
  , dictionaryClassNameFilter2
  , isActive
  FROM pricecategory
  WHERE NOT EXISTS(SELECT * FROM pricecategory_Audit)
$$

--
-- Audit Triggers For pricecategory 
--


CREATE TRIGGER TrAI_pricecategory_FER AFTER INSERT ON pricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , name
  , description
  , codeBillingChargeKind
  , pluginClassName
  , dictionaryClassNameFilter1
  , dictionaryClassNameFilter2
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceCategory
  , NEW.name
  , NEW.description
  , NEW.codeBillingChargeKind
  , NEW.pluginClassName
  , NEW.dictionaryClassNameFilter1
  , NEW.dictionaryClassNameFilter2
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_pricecategory_FER AFTER UPDATE ON pricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , name
  , description
  , codeBillingChargeKind
  , pluginClassName
  , dictionaryClassNameFilter1
  , dictionaryClassNameFilter2
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceCategory
  , NEW.name
  , NEW.description
  , NEW.codeBillingChargeKind
  , NEW.pluginClassName
  , NEW.dictionaryClassNameFilter1
  , NEW.dictionaryClassNameFilter2
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_pricecategory_FER AFTER DELETE ON pricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCategory
  , name
  , description
  , codeBillingChargeKind
  , pluginClassName
  , dictionaryClassNameFilter1
  , dictionaryClassNameFilter2
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceCategory
  , OLD.name
  , OLD.description
  , OLD.codeBillingChargeKind
  , OLD.pluginClassName
  , OLD.dictionaryClassNameFilter1
  , OLD.dictionaryClassNameFilter2
  , OLD.isActive );
END;
$$


--
-- Audit Table For pricecriteria 
--

CREATE TABLE IF NOT EXISTS `pricecriteria_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceCriteria`  int(10)  NULL DEFAULT NULL
 ,`filter1`  varchar(10)  NULL DEFAULT NULL
 ,`filter2`  varchar(10)  NULL DEFAULT NULL
 ,`idPrice`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricecriteria 
--

INSERT INTO pricecriteria_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCriteria
  , filter1
  , filter2
  , idPrice )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceCriteria
  , filter1
  , filter2
  , idPrice
  FROM pricecriteria
  WHERE NOT EXISTS(SELECT * FROM pricecriteria_Audit)
$$

--
-- Audit Triggers For pricecriteria 
--


CREATE TRIGGER TrAI_pricecriteria_FER AFTER INSERT ON pricecriteria FOR EACH ROW
BEGIN
  INSERT INTO pricecriteria_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCriteria
  , filter1
  , filter2
  , idPrice )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceCriteria
  , NEW.filter1
  , NEW.filter2
  , NEW.idPrice );
END;
$$


CREATE TRIGGER TrAU_pricecriteria_FER AFTER UPDATE ON pricecriteria FOR EACH ROW
BEGIN
  INSERT INTO pricecriteria_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCriteria
  , filter1
  , filter2
  , idPrice )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceCriteria
  , NEW.filter1
  , NEW.filter2
  , NEW.idPrice );
END;
$$


CREATE TRIGGER TrAD_pricecriteria_FER AFTER DELETE ON pricecriteria FOR EACH ROW
BEGIN
  INSERT INTO pricecriteria_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceCriteria
  , filter1
  , filter2
  , idPrice )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceCriteria
  , OLD.filter1
  , OLD.filter2
  , OLD.idPrice );
END;
$$


--
-- Audit Table For pricesheetpricecategory 
--

CREATE TABLE IF NOT EXISTS `pricesheetpricecategory_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceSheet`  int(10)  NULL DEFAULT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricesheetpricecategory 
--

INSERT INTO pricesheetpricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , idPriceCategory
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceSheet
  , idPriceCategory
  , sortOrder
  FROM pricesheetpricecategory
  WHERE NOT EXISTS(SELECT * FROM pricesheetpricecategory_Audit)
$$

--
-- Audit Triggers For pricesheetpricecategory 
--


CREATE TRIGGER TrAI_pricesheetpricecategory_FER AFTER INSERT ON pricesheetpricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetpricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , idPriceCategory
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.idPriceCategory
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_pricesheetpricecategory_FER AFTER UPDATE ON pricesheetpricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetpricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , idPriceCategory
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.idPriceCategory
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_pricesheetpricecategory_FER AFTER DELETE ON pricesheetpricecategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetpricecategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , idPriceCategory
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceSheet
  , OLD.idPriceCategory
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For pricesheetrequestcategory 
--

CREATE TABLE IF NOT EXISTS `pricesheetrequestcategory_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceSheet`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricesheetrequestcategory 
--

INSERT INTO pricesheetrequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , codeRequestCategory )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceSheet
  , codeRequestCategory
  FROM pricesheetrequestcategory
  WHERE NOT EXISTS(SELECT * FROM pricesheetrequestcategory_Audit)
$$

--
-- Audit Triggers For pricesheetrequestcategory 
--


CREATE TRIGGER TrAI_pricesheetrequestcategory_FER AFTER INSERT ON pricesheetrequestcategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetrequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAU_pricesheetrequestcategory_FER AFTER UPDATE ON pricesheetrequestcategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetrequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAD_pricesheetrequestcategory_FER AFTER DELETE ON pricesheetrequestcategory FOR EACH ROW
BEGIN
  INSERT INTO pricesheetrequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceSheet
  , OLD.codeRequestCategory );
END;
$$


--
-- Audit Table For pricesheet 
--

CREATE TABLE IF NOT EXISTS `pricesheet_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPriceSheet`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for pricesheet 
--

INSERT INTO pricesheet_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , name
  , description
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPriceSheet
  , name
  , description
  , isActive
  FROM pricesheet
  WHERE NOT EXISTS(SELECT * FROM pricesheet_Audit)
$$

--
-- Audit Triggers For pricesheet 
--


CREATE TRIGGER TrAI_pricesheet_FER AFTER INSERT ON pricesheet FOR EACH ROW
BEGIN
  INSERT INTO pricesheet_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.name
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_pricesheet_FER AFTER UPDATE ON pricesheet FOR EACH ROW
BEGIN
  INSERT INTO pricesheet_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPriceSheet
  , NEW.name
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_pricesheet_FER AFTER DELETE ON pricesheet FOR EACH ROW
BEGIN
  INSERT INTO pricesheet_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPriceSheet
  , name
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPriceSheet
  , OLD.name
  , OLD.description
  , OLD.isActive );
END;
$$


--
-- Audit Table For price 
--

CREATE TABLE IF NOT EXISTS `price_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPrice`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(500)  NULL DEFAULT NULL
 ,`unitPrice`  decimal(7,2)  NULL DEFAULT NULL
 ,`unitPriceExternalAcademic`  decimal(7,2)  NULL DEFAULT NULL
 ,`unitPriceExternalCommercial`  decimal(7,2)  NULL DEFAULT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for price 
--

INSERT INTO price_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrice
  , name
  , description
  , unitPrice
  , unitPriceExternalAcademic
  , unitPriceExternalCommercial
  , idPriceCategory
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPrice
  , name
  , description
  , unitPrice
  , unitPriceExternalAcademic
  , unitPriceExternalCommercial
  , idPriceCategory
  , isActive
  FROM price
  WHERE NOT EXISTS(SELECT * FROM price_Audit)
$$

--
-- Audit Triggers For price 
--


CREATE TRIGGER TrAI_price_FER AFTER INSERT ON price FOR EACH ROW
BEGIN
  INSERT INTO price_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrice
  , name
  , description
  , unitPrice
  , unitPriceExternalAcademic
  , unitPriceExternalCommercial
  , idPriceCategory
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPrice
  , NEW.name
  , NEW.description
  , NEW.unitPrice
  , NEW.unitPriceExternalAcademic
  , NEW.unitPriceExternalCommercial
  , NEW.idPriceCategory
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_price_FER AFTER UPDATE ON price FOR EACH ROW
BEGIN
  INSERT INTO price_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrice
  , name
  , description
  , unitPrice
  , unitPriceExternalAcademic
  , unitPriceExternalCommercial
  , idPriceCategory
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPrice
  , NEW.name
  , NEW.description
  , NEW.unitPrice
  , NEW.unitPriceExternalAcademic
  , NEW.unitPriceExternalCommercial
  , NEW.idPriceCategory
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_price_FER AFTER DELETE ON price FOR EACH ROW
BEGIN
  INSERT INTO price_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrice
  , name
  , description
  , unitPrice
  , unitPriceExternalAcademic
  , unitPriceExternalCommercial
  , idPriceCategory
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPrice
  , OLD.name
  , OLD.description
  , OLD.unitPrice
  , OLD.unitPriceExternalAcademic
  , OLD.unitPriceExternalCommercial
  , OLD.idPriceCategory
  , OLD.isActive );
END;
$$


--
-- Audit Table For primer 
--

CREATE TABLE IF NOT EXISTS `primer_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPrimer`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(50)  NULL DEFAULT NULL
 ,`description`  varchar(200)  NULL DEFAULT NULL
 ,`sequence`  varchar(2000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for primer 
--

INSERT INTO primer_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrimer
  , name
  , description
  , sequence
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPrimer
  , name
  , description
  , sequence
  , isActive
  FROM primer
  WHERE NOT EXISTS(SELECT * FROM primer_Audit)
$$

--
-- Audit Triggers For primer 
--


CREATE TRIGGER TrAI_primer_FER AFTER INSERT ON primer FOR EACH ROW
BEGIN
  INSERT INTO primer_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrimer
  , name
  , description
  , sequence
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPrimer
  , NEW.name
  , NEW.description
  , NEW.sequence
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_primer_FER AFTER UPDATE ON primer FOR EACH ROW
BEGIN
  INSERT INTO primer_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrimer
  , name
  , description
  , sequence
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPrimer
  , NEW.name
  , NEW.description
  , NEW.sequence
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_primer_FER AFTER DELETE ON primer FOR EACH ROW
BEGIN
  INSERT INTO primer_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPrimer
  , name
  , description
  , sequence
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPrimer
  , OLD.name
  , OLD.description
  , OLD.sequence
  , OLD.isActive );
END;
$$


--
-- Audit Table For productledger 
--

CREATE TABLE IF NOT EXISTS `productledger_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProductLedger`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idProduct`  int(10)  NULL DEFAULT NULL
 ,`qty`  int(10)  NULL DEFAULT NULL
 ,`comment`  varchar(5000)  NULL DEFAULT NULL
 ,`timeStame`  datetime  NULL DEFAULT NULL
 ,`idProductOrder`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for productledger 
--

INSERT INTO productledger_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLedger
  , idLab
  , idProduct
  , qty
  , comment
  , timeStame
  , idProductOrder
  , idRequest )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProductLedger
  , idLab
  , idProduct
  , qty
  , comment
  , timeStame
  , idProductOrder
  , idRequest
  FROM productledger
  WHERE NOT EXISTS(SELECT * FROM productledger_Audit)
$$

--
-- Audit Triggers For productledger 
--


CREATE TRIGGER TrAI_productledger_FER AFTER INSERT ON productledger FOR EACH ROW
BEGIN
  INSERT INTO productledger_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLedger
  , idLab
  , idProduct
  , qty
  , comment
  , timeStame
  , idProductOrder
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProductLedger
  , NEW.idLab
  , NEW.idProduct
  , NEW.qty
  , NEW.comment
  , NEW.timeStame
  , NEW.idProductOrder
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAU_productledger_FER AFTER UPDATE ON productledger FOR EACH ROW
BEGIN
  INSERT INTO productledger_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLedger
  , idLab
  , idProduct
  , qty
  , comment
  , timeStame
  , idProductOrder
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProductLedger
  , NEW.idLab
  , NEW.idProduct
  , NEW.qty
  , NEW.comment
  , NEW.timeStame
  , NEW.idProductOrder
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAD_productledger_FER AFTER DELETE ON productledger FOR EACH ROW
BEGIN
  INSERT INTO productledger_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLedger
  , idLab
  , idProduct
  , qty
  , comment
  , timeStame
  , idProductOrder
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProductLedger
  , OLD.idLab
  , OLD.idProduct
  , OLD.qty
  , OLD.comment
  , OLD.timeStame
  , OLD.idProductOrder
  , OLD.idRequest );
END;
$$


--
-- Audit Table For productlineitem 
--

CREATE TABLE IF NOT EXISTS `productlineitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProductLineItem`  int(10)  NULL DEFAULT NULL
 ,`idProductOrder`  int(10)  NULL DEFAULT NULL
 ,`idProduct`  int(10)  NULL DEFAULT NULL
 ,`qty`  int(10)  NULL DEFAULT NULL
 ,`unitPrice`  decimal(7,2)  NULL DEFAULT NULL
 ,`codeProductOrderStatus`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for productlineitem 
--

INSERT INTO productlineitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLineItem
  , idProductOrder
  , idProduct
  , qty
  , unitPrice
  , codeProductOrderStatus )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProductLineItem
  , idProductOrder
  , idProduct
  , qty
  , unitPrice
  , codeProductOrderStatus
  FROM productlineitem
  WHERE NOT EXISTS(SELECT * FROM productlineitem_Audit)
$$

--
-- Audit Triggers For productlineitem 
--


CREATE TRIGGER TrAI_productlineitem_FER AFTER INSERT ON productlineitem FOR EACH ROW
BEGIN
  INSERT INTO productlineitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLineItem
  , idProductOrder
  , idProduct
  , qty
  , unitPrice
  , codeProductOrderStatus )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProductLineItem
  , NEW.idProductOrder
  , NEW.idProduct
  , NEW.qty
  , NEW.unitPrice
  , NEW.codeProductOrderStatus );
END;
$$


CREATE TRIGGER TrAU_productlineitem_FER AFTER UPDATE ON productlineitem FOR EACH ROW
BEGIN
  INSERT INTO productlineitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLineItem
  , idProductOrder
  , idProduct
  , qty
  , unitPrice
  , codeProductOrderStatus )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProductLineItem
  , NEW.idProductOrder
  , NEW.idProduct
  , NEW.qty
  , NEW.unitPrice
  , NEW.codeProductOrderStatus );
END;
$$


CREATE TRIGGER TrAD_productlineitem_FER AFTER DELETE ON productlineitem FOR EACH ROW
BEGIN
  INSERT INTO productlineitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductLineItem
  , idProductOrder
  , idProduct
  , qty
  , unitPrice
  , codeProductOrderStatus )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProductLineItem
  , OLD.idProductOrder
  , OLD.idProduct
  , OLD.qty
  , OLD.unitPrice
  , OLD.codeProductOrderStatus );
END;
$$


--
-- Audit Table For productorderfile 
--

CREATE TABLE IF NOT EXISTS `productorderfile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProductOrderFile`  int(10)  NULL DEFAULT NULL
 ,`idProductOrder`  int(10)  NULL DEFAULT NULL
 ,`fileName`  varchar(2000)  NULL DEFAULT NULL
 ,`fileSize`  decimal(14,0)  NULL DEFAULT NULL
 ,`createDate`  date  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for productorderfile 
--

INSERT INTO productorderfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrderFile
  , idProductOrder
  , fileName
  , fileSize
  , createDate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProductOrderFile
  , idProductOrder
  , fileName
  , fileSize
  , createDate
  FROM productorderfile
  WHERE NOT EXISTS(SELECT * FROM productorderfile_Audit)
$$

--
-- Audit Triggers For productorderfile 
--


CREATE TRIGGER TrAI_productorderfile_FER AFTER INSERT ON productorderfile FOR EACH ROW
BEGIN
  INSERT INTO productorderfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrderFile
  , idProductOrder
  , fileName
  , fileSize
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProductOrderFile
  , NEW.idProductOrder
  , NEW.fileName
  , NEW.fileSize
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAU_productorderfile_FER AFTER UPDATE ON productorderfile FOR EACH ROW
BEGIN
  INSERT INTO productorderfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrderFile
  , idProductOrder
  , fileName
  , fileSize
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProductOrderFile
  , NEW.idProductOrder
  , NEW.fileName
  , NEW.fileSize
  , NEW.createDate );
END;
$$


CREATE TRIGGER TrAD_productorderfile_FER AFTER DELETE ON productorderfile FOR EACH ROW
BEGIN
  INSERT INTO productorderfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrderFile
  , idProductOrder
  , fileName
  , fileSize
  , createDate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProductOrderFile
  , OLD.idProductOrder
  , OLD.fileName
  , OLD.fileSize
  , OLD.createDate );
END;
$$


--
-- Audit Table For productorderstatus 
--

CREATE TABLE IF NOT EXISTS `productorderstatus_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeProductOrderStatus`  varchar(10)  NULL DEFAULT NULL
 ,`productOrderStatus`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for productorderstatus 
--

INSERT INTO productorderstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductOrderStatus
  , productOrderStatus
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeProductOrderStatus
  , productOrderStatus
  , isActive
  FROM productorderstatus
  WHERE NOT EXISTS(SELECT * FROM productorderstatus_Audit)
$$

--
-- Audit Triggers For productorderstatus 
--


CREATE TRIGGER TrAI_productorderstatus_FER AFTER INSERT ON productorderstatus FOR EACH ROW
BEGIN
  INSERT INTO productorderstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductOrderStatus
  , productOrderStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeProductOrderStatus
  , NEW.productOrderStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_productorderstatus_FER AFTER UPDATE ON productorderstatus FOR EACH ROW
BEGIN
  INSERT INTO productorderstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductOrderStatus
  , productOrderStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeProductOrderStatus
  , NEW.productOrderStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_productorderstatus_FER AFTER DELETE ON productorderstatus FOR EACH ROW
BEGIN
  INSERT INTO productorderstatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductOrderStatus
  , productOrderStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeProductOrderStatus
  , OLD.productOrderStatus
  , OLD.isActive );
END;
$$


--
-- Audit Table For productorder 
--

CREATE TABLE IF NOT EXISTS `productorder_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProductOrder`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`submitDate`  datetime  NULL DEFAULT NULL
 ,`codeProductType`  varchar(10)  NULL DEFAULT NULL
 ,`quoteNumber`  varchar(50)  NULL DEFAULT NULL
 ,`quoteReceivedDate`  datetime  NULL DEFAULT NULL
 ,`uuid`  varchar(36)  NULL DEFAULT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`productOrderNumber`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for productorder 
--

INSERT INTO productorder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrder
  , idAppUser
  , idLab
  , idCoreFacility
  , submitDate
  , codeProductType
  , quoteNumber
  , quoteReceivedDate
  , uuid
  , idBillingAccount
  , productOrderNumber )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProductOrder
  , idAppUser
  , idLab
  , idCoreFacility
  , submitDate
  , codeProductType
  , quoteNumber
  , quoteReceivedDate
  , uuid
  , idBillingAccount
  , productOrderNumber
  FROM productorder
  WHERE NOT EXISTS(SELECT * FROM productorder_Audit)
$$

--
-- Audit Triggers For productorder 
--


CREATE TRIGGER TrAI_productorder_FER AFTER INSERT ON productorder FOR EACH ROW
BEGIN
  INSERT INTO productorder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrder
  , idAppUser
  , idLab
  , idCoreFacility
  , submitDate
  , codeProductType
  , quoteNumber
  , quoteReceivedDate
  , uuid
  , idBillingAccount
  , productOrderNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProductOrder
  , NEW.idAppUser
  , NEW.idLab
  , NEW.idCoreFacility
  , NEW.submitDate
  , NEW.codeProductType
  , NEW.quoteNumber
  , NEW.quoteReceivedDate
  , NEW.uuid
  , NEW.idBillingAccount
  , NEW.productOrderNumber );
END;
$$


CREATE TRIGGER TrAU_productorder_FER AFTER UPDATE ON productorder FOR EACH ROW
BEGIN
  INSERT INTO productorder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrder
  , idAppUser
  , idLab
  , idCoreFacility
  , submitDate
  , codeProductType
  , quoteNumber
  , quoteReceivedDate
  , uuid
  , idBillingAccount
  , productOrderNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProductOrder
  , NEW.idAppUser
  , NEW.idLab
  , NEW.idCoreFacility
  , NEW.submitDate
  , NEW.codeProductType
  , NEW.quoteNumber
  , NEW.quoteReceivedDate
  , NEW.uuid
  , NEW.idBillingAccount
  , NEW.productOrderNumber );
END;
$$


CREATE TRIGGER TrAD_productorder_FER AFTER DELETE ON productorder FOR EACH ROW
BEGIN
  INSERT INTO productorder_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProductOrder
  , idAppUser
  , idLab
  , idCoreFacility
  , submitDate
  , codeProductType
  , quoteNumber
  , quoteReceivedDate
  , uuid
  , idBillingAccount
  , productOrderNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProductOrder
  , OLD.idAppUser
  , OLD.idLab
  , OLD.idCoreFacility
  , OLD.submitDate
  , OLD.codeProductType
  , OLD.quoteNumber
  , OLD.quoteReceivedDate
  , OLD.uuid
  , OLD.idBillingAccount
  , OLD.productOrderNumber );
END;
$$


--
-- Audit Table For producttype 
--

CREATE TABLE IF NOT EXISTS `producttype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeProductType`  varchar(10)  NULL DEFAULT NULL
 ,`description`  varchar(5000)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`idVendor`  int(10)  NULL DEFAULT NULL
 ,`idPriceCategory`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for producttype 
--

INSERT INTO producttype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductType
  , description
  , idCoreFacility
  , idVendor
  , idPriceCategory )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeProductType
  , description
  , idCoreFacility
  , idVendor
  , idPriceCategory
  FROM producttype
  WHERE NOT EXISTS(SELECT * FROM producttype_Audit)
$$

--
-- Audit Triggers For producttype 
--


CREATE TRIGGER TrAI_producttype_FER AFTER INSERT ON producttype FOR EACH ROW
BEGIN
  INSERT INTO producttype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductType
  , description
  , idCoreFacility
  , idVendor
  , idPriceCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeProductType
  , NEW.description
  , NEW.idCoreFacility
  , NEW.idVendor
  , NEW.idPriceCategory );
END;
$$


CREATE TRIGGER TrAU_producttype_FER AFTER UPDATE ON producttype FOR EACH ROW
BEGIN
  INSERT INTO producttype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductType
  , description
  , idCoreFacility
  , idVendor
  , idPriceCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeProductType
  , NEW.description
  , NEW.idCoreFacility
  , NEW.idVendor
  , NEW.idPriceCategory );
END;
$$


CREATE TRIGGER TrAD_producttype_FER AFTER DELETE ON producttype FOR EACH ROW
BEGIN
  INSERT INTO producttype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProductType
  , description
  , idCoreFacility
  , idVendor
  , idPriceCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeProductType
  , OLD.description
  , OLD.idCoreFacility
  , OLD.idVendor
  , OLD.idPriceCategory );
END;
$$


--
-- Audit Table For product 
--

CREATE TABLE IF NOT EXISTS `product_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProduct`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`codeProductType`  varchar(10)  NULL DEFAULT NULL
 ,`idPrice`  int(10)  NULL DEFAULT NULL
 ,`orderQty`  int(10)  NULL DEFAULT NULL
 ,`useQty`  int(10)  NULL DEFAULT NULL
 ,`catalogNumber`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for product 
--

INSERT INTO product_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProduct
  , name
  , codeProductType
  , idPrice
  , orderQty
  , useQty
  , catalogNumber
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProduct
  , name
  , codeProductType
  , idPrice
  , orderQty
  , useQty
  , catalogNumber
  , isActive
  FROM product
  WHERE NOT EXISTS(SELECT * FROM product_Audit)
$$

--
-- Audit Triggers For product 
--


CREATE TRIGGER TrAI_product_FER AFTER INSERT ON product FOR EACH ROW
BEGIN
  INSERT INTO product_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProduct
  , name
  , codeProductType
  , idPrice
  , orderQty
  , useQty
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProduct
  , NEW.name
  , NEW.codeProductType
  , NEW.idPrice
  , NEW.orderQty
  , NEW.useQty
  , NEW.catalogNumber
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_product_FER AFTER UPDATE ON product FOR EACH ROW
BEGIN
  INSERT INTO product_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProduct
  , name
  , codeProductType
  , idPrice
  , orderQty
  , useQty
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProduct
  , NEW.name
  , NEW.codeProductType
  , NEW.idPrice
  , NEW.orderQty
  , NEW.useQty
  , NEW.catalogNumber
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_product_FER AFTER DELETE ON product FOR EACH ROW
BEGIN
  INSERT INTO product_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProduct
  , name
  , codeProductType
  , idPrice
  , orderQty
  , useQty
  , catalogNumber
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProduct
  , OLD.name
  , OLD.codeProductType
  , OLD.idPrice
  , OLD.orderQty
  , OLD.useQty
  , OLD.catalogNumber
  , OLD.isActive );
END;
$$


--
-- Audit Table For project 
--

CREATE TABLE IF NOT EXISTS `project_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProject`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(4000)  NULL DEFAULT NULL
 ,`publicDateForAppUsers`  datetime  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for project 
--

INSERT INTO project_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProject
  , name
  , description
  , publicDateForAppUsers
  , idLab
  , idAppUser
  , codeVisibility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProject
  , name
  , description
  , publicDateForAppUsers
  , idLab
  , idAppUser
  , codeVisibility
  FROM project
  WHERE NOT EXISTS(SELECT * FROM project_Audit)
$$

--
-- Audit Triggers For project 
--


CREATE TRIGGER TrAI_project_FER AFTER INSERT ON project FOR EACH ROW
BEGIN
  INSERT INTO project_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProject
  , name
  , description
  , publicDateForAppUsers
  , idLab
  , idAppUser
  , codeVisibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProject
  , NEW.name
  , NEW.description
  , NEW.publicDateForAppUsers
  , NEW.idLab
  , NEW.idAppUser
  , NEW.codeVisibility );
END;
$$


CREATE TRIGGER TrAU_project_FER AFTER UPDATE ON project FOR EACH ROW
BEGIN
  INSERT INTO project_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProject
  , name
  , description
  , publicDateForAppUsers
  , idLab
  , idAppUser
  , codeVisibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProject
  , NEW.name
  , NEW.description
  , NEW.publicDateForAppUsers
  , NEW.idLab
  , NEW.idAppUser
  , NEW.codeVisibility );
END;
$$


CREATE TRIGGER TrAD_project_FER AFTER DELETE ON project FOR EACH ROW
BEGIN
  INSERT INTO project_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProject
  , name
  , description
  , publicDateForAppUsers
  , idLab
  , idAppUser
  , codeVisibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProject
  , OLD.name
  , OLD.description
  , OLD.publicDateForAppUsers
  , OLD.idLab
  , OLD.idAppUser
  , OLD.codeVisibility );
END;
$$


--
-- Audit Table For propertyanalysistype 
--

CREATE TABLE IF NOT EXISTS `propertyanalysistype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`idAnalysisType`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyanalysistype 
--

INSERT INTO propertyanalysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAnalysisType )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProperty
  , idAnalysisType
  FROM propertyanalysistype
  WHERE NOT EXISTS(SELECT * FROM propertyanalysistype_Audit)
$$

--
-- Audit Triggers For propertyanalysistype 
--


CREATE TRIGGER TrAI_propertyanalysistype_FER AFTER INSERT ON propertyanalysistype FOR EACH ROW
BEGIN
  INSERT INTO propertyanalysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAnalysisType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idAnalysisType );
END;
$$


CREATE TRIGGER TrAU_propertyanalysistype_FER AFTER UPDATE ON propertyanalysistype FOR EACH ROW
BEGIN
  INSERT INTO propertyanalysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAnalysisType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idAnalysisType );
END;
$$


CREATE TRIGGER TrAD_propertyanalysistype_FER AFTER DELETE ON propertyanalysistype FOR EACH ROW
BEGIN
  INSERT INTO propertyanalysistype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAnalysisType )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProperty
  , OLD.idAnalysisType );
END;
$$


--
-- Audit Table For propertyappuser 
--

CREATE TABLE IF NOT EXISTS `propertyappuser_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyappuser 
--

INSERT INTO propertyappuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProperty
  , idAppUser
  FROM propertyappuser
  WHERE NOT EXISTS(SELECT * FROM propertyappuser_Audit)
$$

--
-- Audit Triggers For propertyappuser 
--


CREATE TRIGGER TrAI_propertyappuser_FER AFTER INSERT ON propertyappuser FOR EACH ROW
BEGIN
  INSERT INTO propertyappuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_propertyappuser_FER AFTER UPDATE ON propertyappuser FOR EACH ROW
BEGIN
  INSERT INTO propertyappuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_propertyappuser_FER AFTER DELETE ON propertyappuser FOR EACH ROW
BEGIN
  INSERT INTO propertyappuser_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProperty
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For propertydictionary 
--

CREATE TABLE IF NOT EXISTS `propertydictionary_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPropertyDictionary`  int(10)  NULL DEFAULT NULL
 ,`propertyName`  varchar(200)  NULL DEFAULT NULL
 ,`propertyValue`  varchar(2000)  NULL DEFAULT NULL
 ,`propertyDescription`  varchar(2000)  NULL DEFAULT NULL
 ,`forServerOnly`  char(1)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertydictionary 
--

INSERT INTO propertydictionary_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyDictionary
  , propertyName
  , propertyValue
  , propertyDescription
  , forServerOnly
  , idCoreFacility
  , codeRequestCategory )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPropertyDictionary
  , propertyName
  , propertyValue
  , propertyDescription
  , forServerOnly
  , idCoreFacility
  , codeRequestCategory
  FROM propertydictionary
  WHERE NOT EXISTS(SELECT * FROM propertydictionary_Audit)
$$

--
-- Audit Triggers For propertydictionary 
--


CREATE TRIGGER TrAI_propertydictionary_FER AFTER INSERT ON propertydictionary FOR EACH ROW
BEGIN
  INSERT INTO propertydictionary_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyDictionary
  , propertyName
  , propertyValue
  , propertyDescription
  , forServerOnly
  , idCoreFacility
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPropertyDictionary
  , NEW.propertyName
  , NEW.propertyValue
  , NEW.propertyDescription
  , NEW.forServerOnly
  , NEW.idCoreFacility
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAU_propertydictionary_FER AFTER UPDATE ON propertydictionary FOR EACH ROW
BEGIN
  INSERT INTO propertydictionary_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyDictionary
  , propertyName
  , propertyValue
  , propertyDescription
  , forServerOnly
  , idCoreFacility
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPropertyDictionary
  , NEW.propertyName
  , NEW.propertyValue
  , NEW.propertyDescription
  , NEW.forServerOnly
  , NEW.idCoreFacility
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAD_propertydictionary_FER AFTER DELETE ON propertydictionary FOR EACH ROW
BEGIN
  INSERT INTO propertydictionary_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyDictionary
  , propertyName
  , propertyValue
  , propertyDescription
  , forServerOnly
  , idCoreFacility
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPropertyDictionary
  , OLD.propertyName
  , OLD.propertyValue
  , OLD.propertyDescription
  , OLD.forServerOnly
  , OLD.idCoreFacility
  , OLD.codeRequestCategory );
END;
$$


--
-- Audit Table For propertyentryoption 
--

CREATE TABLE IF NOT EXISTS `propertyentryoption_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPropertyEntry`  int(10)  NULL DEFAULT NULL
 ,`idPropertyOption`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyentryoption 
--

INSERT INTO propertyentryoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idPropertyOption )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPropertyEntry
  , idPropertyOption
  FROM propertyentryoption
  WHERE NOT EXISTS(SELECT * FROM propertyentryoption_Audit)
$$

--
-- Audit Triggers For propertyentryoption 
--


CREATE TRIGGER TrAI_propertyentryoption_FER AFTER INSERT ON propertyentryoption FOR EACH ROW
BEGIN
  INSERT INTO propertyentryoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idPropertyOption )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPropertyEntry
  , NEW.idPropertyOption );
END;
$$


CREATE TRIGGER TrAU_propertyentryoption_FER AFTER UPDATE ON propertyentryoption FOR EACH ROW
BEGIN
  INSERT INTO propertyentryoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idPropertyOption )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPropertyEntry
  , NEW.idPropertyOption );
END;
$$


CREATE TRIGGER TrAD_propertyentryoption_FER AFTER DELETE ON propertyentryoption FOR EACH ROW
BEGIN
  INSERT INTO propertyentryoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idPropertyOption )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPropertyEntry
  , OLD.idPropertyOption );
END;
$$


--
-- Audit Table For propertyentryvalue 
--

CREATE TABLE IF NOT EXISTS `propertyentryvalue_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPropertyEntryValue`  int(10) unsigned  NULL DEFAULT NULL
 ,`value`  varchar(200)  NULL DEFAULT NULL
 ,`idPropertyEntry`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyentryvalue 
--

INSERT INTO propertyentryvalue_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntryValue
  , value
  , idPropertyEntry )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPropertyEntryValue
  , value
  , idPropertyEntry
  FROM propertyentryvalue
  WHERE NOT EXISTS(SELECT * FROM propertyentryvalue_Audit)
$$

--
-- Audit Triggers For propertyentryvalue 
--


CREATE TRIGGER TrAI_propertyentryvalue_FER AFTER INSERT ON propertyentryvalue FOR EACH ROW
BEGIN
  INSERT INTO propertyentryvalue_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntryValue
  , value
  , idPropertyEntry )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPropertyEntryValue
  , NEW.value
  , NEW.idPropertyEntry );
END;
$$


CREATE TRIGGER TrAU_propertyentryvalue_FER AFTER UPDATE ON propertyentryvalue FOR EACH ROW
BEGIN
  INSERT INTO propertyentryvalue_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntryValue
  , value
  , idPropertyEntry )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPropertyEntryValue
  , NEW.value
  , NEW.idPropertyEntry );
END;
$$


CREATE TRIGGER TrAD_propertyentryvalue_FER AFTER DELETE ON propertyentryvalue FOR EACH ROW
BEGIN
  INSERT INTO propertyentryvalue_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntryValue
  , value
  , idPropertyEntry )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPropertyEntryValue
  , OLD.value
  , OLD.idPropertyEntry );
END;
$$


--
-- Audit Table For propertyentry 
--

CREATE TABLE IF NOT EXISTS `propertyentry_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPropertyEntry`  int(10)  NULL DEFAULT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`valueString`  varchar(200)  NULL DEFAULT NULL
 ,`otherLabel`  varchar(100)  NULL DEFAULT NULL
 ,`idDataTrack`  int(10)  NULL DEFAULT NULL
 ,`idAnalysis`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyentry 
--

INSERT INTO propertyentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idProperty
  , idSample
  , valueString
  , otherLabel
  , idDataTrack
  , idAnalysis
  , idRequest )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPropertyEntry
  , idProperty
  , idSample
  , valueString
  , otherLabel
  , idDataTrack
  , idAnalysis
  , idRequest
  FROM propertyentry
  WHERE NOT EXISTS(SELECT * FROM propertyentry_Audit)
$$

--
-- Audit Triggers For propertyentry 
--


CREATE TRIGGER TrAI_propertyentry_FER AFTER INSERT ON propertyentry FOR EACH ROW
BEGIN
  INSERT INTO propertyentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idProperty
  , idSample
  , valueString
  , otherLabel
  , idDataTrack
  , idAnalysis
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPropertyEntry
  , NEW.idProperty
  , NEW.idSample
  , NEW.valueString
  , NEW.otherLabel
  , NEW.idDataTrack
  , NEW.idAnalysis
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAU_propertyentry_FER AFTER UPDATE ON propertyentry FOR EACH ROW
BEGIN
  INSERT INTO propertyentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idProperty
  , idSample
  , valueString
  , otherLabel
  , idDataTrack
  , idAnalysis
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPropertyEntry
  , NEW.idProperty
  , NEW.idSample
  , NEW.valueString
  , NEW.otherLabel
  , NEW.idDataTrack
  , NEW.idAnalysis
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAD_propertyentry_FER AFTER DELETE ON propertyentry FOR EACH ROW
BEGIN
  INSERT INTO propertyentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyEntry
  , idProperty
  , idSample
  , valueString
  , otherLabel
  , idDataTrack
  , idAnalysis
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPropertyEntry
  , OLD.idProperty
  , OLD.idSample
  , OLD.valueString
  , OLD.otherLabel
  , OLD.idDataTrack
  , OLD.idAnalysis
  , OLD.idRequest );
END;
$$


--
-- Audit Table For propertyoption 
--

CREATE TABLE IF NOT EXISTS `propertyoption_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPropertyOption`  int(10)  NULL DEFAULT NULL
 ,`value`  varchar(200)  NULL DEFAULT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyoption 
--

INSERT INTO propertyoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyOption
  , value
  , idProperty
  , sortOrder
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPropertyOption
  , value
  , idProperty
  , sortOrder
  , isActive
  FROM propertyoption
  WHERE NOT EXISTS(SELECT * FROM propertyoption_Audit)
$$

--
-- Audit Triggers For propertyoption 
--


CREATE TRIGGER TrAI_propertyoption_FER AFTER INSERT ON propertyoption FOR EACH ROW
BEGIN
  INSERT INTO propertyoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyOption
  , value
  , idProperty
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPropertyOption
  , NEW.value
  , NEW.idProperty
  , NEW.sortOrder
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_propertyoption_FER AFTER UPDATE ON propertyoption FOR EACH ROW
BEGIN
  INSERT INTO propertyoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyOption
  , value
  , idProperty
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPropertyOption
  , NEW.value
  , NEW.idProperty
  , NEW.sortOrder
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_propertyoption_FER AFTER DELETE ON propertyoption FOR EACH ROW
BEGIN
  INSERT INTO propertyoption_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPropertyOption
  , value
  , idProperty
  , sortOrder
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPropertyOption
  , OLD.value
  , OLD.idProperty
  , OLD.sortOrder
  , OLD.isActive );
END;
$$


--
-- Audit Table For propertyorganism 
--

CREATE TABLE IF NOT EXISTS `propertyorganism_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyorganism 
--

INSERT INTO propertyorganism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idOrganism )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProperty
  , idOrganism
  FROM propertyorganism
  WHERE NOT EXISTS(SELECT * FROM propertyorganism_Audit)
$$

--
-- Audit Triggers For propertyorganism 
--


CREATE TRIGGER TrAI_propertyorganism_FER AFTER INSERT ON propertyorganism FOR EACH ROW
BEGIN
  INSERT INTO propertyorganism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idOrganism );
END;
$$


CREATE TRIGGER TrAU_propertyorganism_FER AFTER UPDATE ON propertyorganism FOR EACH ROW
BEGIN
  INSERT INTO propertyorganism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.idOrganism );
END;
$$


CREATE TRIGGER TrAD_propertyorganism_FER AFTER DELETE ON propertyorganism FOR EACH ROW
BEGIN
  INSERT INTO propertyorganism_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , idOrganism )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProperty
  , OLD.idOrganism );
END;
$$


--
-- Audit Table For propertyplatformapplication 
--

CREATE TABLE IF NOT EXISTS `propertyplatformapplication_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idPlatformApplication`  int(10)  NULL DEFAULT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertyplatformapplication 
--

INSERT INTO propertyplatformapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlatformApplication
  , idProperty
  , codeRequestCategory
  , codeApplication )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idPlatformApplication
  , idProperty
  , codeRequestCategory
  , codeApplication
  FROM propertyplatformapplication
  WHERE NOT EXISTS(SELECT * FROM propertyplatformapplication_Audit)
$$

--
-- Audit Triggers For propertyplatformapplication 
--


CREATE TRIGGER TrAI_propertyplatformapplication_FER AFTER INSERT ON propertyplatformapplication FOR EACH ROW
BEGIN
  INSERT INTO propertyplatformapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlatformApplication
  , idProperty
  , codeRequestCategory
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idPlatformApplication
  , NEW.idProperty
  , NEW.codeRequestCategory
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAU_propertyplatformapplication_FER AFTER UPDATE ON propertyplatformapplication FOR EACH ROW
BEGIN
  INSERT INTO propertyplatformapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlatformApplication
  , idProperty
  , codeRequestCategory
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idPlatformApplication
  , NEW.idProperty
  , NEW.codeRequestCategory
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAD_propertyplatformapplication_FER AFTER DELETE ON propertyplatformapplication FOR EACH ROW
BEGIN
  INSERT INTO propertyplatformapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idPlatformApplication
  , idProperty
  , codeRequestCategory
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idPlatformApplication
  , OLD.idProperty
  , OLD.codeRequestCategory
  , OLD.codeApplication );
END;
$$


--
-- Audit Table For propertytype 
--

CREATE TABLE IF NOT EXISTS `propertytype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codePropertyType`  varchar(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for propertytype 
--

INSERT INTO propertytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePropertyType
  , name
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codePropertyType
  , name
  , isActive
  FROM propertytype
  WHERE NOT EXISTS(SELECT * FROM propertytype_Audit)
$$

--
-- Audit Triggers For propertytype 
--


CREATE TRIGGER TrAI_propertytype_FER AFTER INSERT ON propertytype FOR EACH ROW
BEGIN
  INSERT INTO propertytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePropertyType
  , name
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codePropertyType
  , NEW.name
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_propertytype_FER AFTER UPDATE ON propertytype FOR EACH ROW
BEGIN
  INSERT INTO propertytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePropertyType
  , name
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codePropertyType
  , NEW.name
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_propertytype_FER AFTER DELETE ON propertytype FOR EACH ROW
BEGIN
  INSERT INTO propertytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codePropertyType
  , name
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codePropertyType
  , OLD.name
  , OLD.isActive );
END;
$$


--
-- Audit Table For property 
--

CREATE TABLE IF NOT EXISTS `property_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idProperty`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(50)  NULL DEFAULT NULL
 ,`description`  varchar(2000)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`isRequired`  char(1)  NULL DEFAULT NULL
 ,`forSample`  char(1)  NULL DEFAULT NULL
 ,`forAnalysis`  char(1)  NULL DEFAULT NULL
 ,`forDataTrack`  char(1)  NULL DEFAULT NULL
 ,`codePropertyType`  varchar(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`forRequest`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for property 
--

INSERT INTO property_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , name
  , description
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , isRequired
  , forSample
  , forAnalysis
  , forDataTrack
  , codePropertyType
  , sortOrder
  , idCoreFacility
  , forRequest )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idProperty
  , name
  , description
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , isRequired
  , forSample
  , forAnalysis
  , forDataTrack
  , codePropertyType
  , sortOrder
  , idCoreFacility
  , forRequest
  FROM property
  WHERE NOT EXISTS(SELECT * FROM property_Audit)
$$

--
-- Audit Triggers For property 
--


CREATE TRIGGER TrAI_property_FER AFTER INSERT ON property FOR EACH ROW
BEGIN
  INSERT INTO property_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , name
  , description
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , isRequired
  , forSample
  , forAnalysis
  , forDataTrack
  , codePropertyType
  , sortOrder
  , idCoreFacility
  , forRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.name
  , NEW.description
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser
  , NEW.isRequired
  , NEW.forSample
  , NEW.forAnalysis
  , NEW.forDataTrack
  , NEW.codePropertyType
  , NEW.sortOrder
  , NEW.idCoreFacility
  , NEW.forRequest );
END;
$$


CREATE TRIGGER TrAU_property_FER AFTER UPDATE ON property FOR EACH ROW
BEGIN
  INSERT INTO property_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , name
  , description
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , isRequired
  , forSample
  , forAnalysis
  , forDataTrack
  , codePropertyType
  , sortOrder
  , idCoreFacility
  , forRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idProperty
  , NEW.name
  , NEW.description
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive
  , NEW.idAppUser
  , NEW.isRequired
  , NEW.forSample
  , NEW.forAnalysis
  , NEW.forDataTrack
  , NEW.codePropertyType
  , NEW.sortOrder
  , NEW.idCoreFacility
  , NEW.forRequest );
END;
$$


CREATE TRIGGER TrAD_property_FER AFTER DELETE ON property FOR EACH ROW
BEGIN
  INSERT INTO property_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idProperty
  , name
  , description
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  , idAppUser
  , isRequired
  , forSample
  , forAnalysis
  , forDataTrack
  , codePropertyType
  , sortOrder
  , idCoreFacility
  , forRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idProperty
  , OLD.name
  , OLD.description
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive
  , OLD.idAppUser
  , OLD.isRequired
  , OLD.forSample
  , OLD.forAnalysis
  , OLD.forDataTrack
  , OLD.codePropertyType
  , OLD.sortOrder
  , OLD.idCoreFacility
  , OLD.forRequest );
END;
$$


--
-- Audit Table For protocoltype 
--

CREATE TABLE IF NOT EXISTS `protocoltype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeProtocolType`  varchar(10)  NULL DEFAULT NULL
 ,`protocolType`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for protocoltype 
--

INSERT INTO protocoltype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProtocolType
  , protocolType
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeProtocolType
  , protocolType
  , isActive
  FROM protocoltype
  WHERE NOT EXISTS(SELECT * FROM protocoltype_Audit)
$$

--
-- Audit Triggers For protocoltype 
--


CREATE TRIGGER TrAI_protocoltype_FER AFTER INSERT ON protocoltype FOR EACH ROW
BEGIN
  INSERT INTO protocoltype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProtocolType
  , protocolType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeProtocolType
  , NEW.protocolType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_protocoltype_FER AFTER UPDATE ON protocoltype FOR EACH ROW
BEGIN
  INSERT INTO protocoltype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProtocolType
  , protocolType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeProtocolType
  , NEW.protocolType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_protocoltype_FER AFTER DELETE ON protocoltype FOR EACH ROW
BEGIN
  INSERT INTO protocoltype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeProtocolType
  , protocolType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeProtocolType
  , OLD.protocolType
  , OLD.isActive );
END;
$$


--
-- Audit Table For qualitycontrolstepentry 
--

CREATE TABLE IF NOT EXISTS `qualitycontrolstepentry_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idQualityControlStepEntry`  int(10)  NULL DEFAULT NULL
 ,`codeQualityControlStep`  varchar(10)  NULL DEFAULT NULL
 ,`idProject`  int(10)  NULL DEFAULT NULL
 ,`valueString`  varchar(100)  NULL DEFAULT NULL
 ,`otherLabel`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for qualitycontrolstepentry 
--

INSERT INTO qualitycontrolstepentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idQualityControlStepEntry
  , codeQualityControlStep
  , idProject
  , valueString
  , otherLabel )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idQualityControlStepEntry
  , codeQualityControlStep
  , idProject
  , valueString
  , otherLabel
  FROM qualitycontrolstepentry
  WHERE NOT EXISTS(SELECT * FROM qualitycontrolstepentry_Audit)
$$

--
-- Audit Triggers For qualitycontrolstepentry 
--


CREATE TRIGGER TrAI_qualitycontrolstepentry_FER AFTER INSERT ON qualitycontrolstepentry FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstepentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idQualityControlStepEntry
  , codeQualityControlStep
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idQualityControlStepEntry
  , NEW.codeQualityControlStep
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAU_qualitycontrolstepentry_FER AFTER UPDATE ON qualitycontrolstepentry FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstepentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idQualityControlStepEntry
  , codeQualityControlStep
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idQualityControlStepEntry
  , NEW.codeQualityControlStep
  , NEW.idProject
  , NEW.valueString
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAD_qualitycontrolstepentry_FER AFTER DELETE ON qualitycontrolstepentry FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstepentry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idQualityControlStepEntry
  , codeQualityControlStep
  , idProject
  , valueString
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idQualityControlStepEntry
  , OLD.codeQualityControlStep
  , OLD.idProject
  , OLD.valueString
  , OLD.otherLabel );
END;
$$


--
-- Audit Table For qualitycontrolstep 
--

CREATE TABLE IF NOT EXISTS `qualitycontrolstep_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeQualityControlStep`  varchar(10)  NULL DEFAULT NULL
 ,`qualityControlStep`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyCode`  varchar(50)  NULL DEFAULT NULL
 ,`mageOntologyDefinition`  varchar(5000)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for qualitycontrolstep 
--

INSERT INTO qualitycontrolstep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeQualityControlStep
  , qualityControlStep
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeQualityControlStep
  , qualityControlStep
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive
  FROM qualitycontrolstep
  WHERE NOT EXISTS(SELECT * FROM qualitycontrolstep_Audit)
$$

--
-- Audit Triggers For qualitycontrolstep 
--


CREATE TRIGGER TrAI_qualitycontrolstep_FER AFTER INSERT ON qualitycontrolstep FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeQualityControlStep
  , qualityControlStep
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeQualityControlStep
  , NEW.qualityControlStep
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_qualitycontrolstep_FER AFTER UPDATE ON qualitycontrolstep FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeQualityControlStep
  , qualityControlStep
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeQualityControlStep
  , NEW.qualityControlStep
  , NEW.mageOntologyCode
  , NEW.mageOntologyDefinition
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_qualitycontrolstep_FER AFTER DELETE ON qualitycontrolstep FOR EACH ROW
BEGIN
  INSERT INTO qualitycontrolstep_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeQualityControlStep
  , qualityControlStep
  , mageOntologyCode
  , mageOntologyDefinition
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeQualityControlStep
  , OLD.qualityControlStep
  , OLD.mageOntologyCode
  , OLD.mageOntologyDefinition
  , OLD.isActive );
END;
$$


--
-- Audit Table For reactiontype 
--

CREATE TABLE IF NOT EXISTS `reactiontype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeReactionType`  varchar(10)  NULL DEFAULT NULL
 ,`reactionType`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for reactiontype 
--

INSERT INTO reactiontype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeReactionType
  , reactionType
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeReactionType
  , reactionType
  , isActive
  FROM reactiontype
  WHERE NOT EXISTS(SELECT * FROM reactiontype_Audit)
$$

--
-- Audit Triggers For reactiontype 
--


CREATE TRIGGER TrAI_reactiontype_FER AFTER INSERT ON reactiontype FOR EACH ROW
BEGIN
  INSERT INTO reactiontype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeReactionType
  , reactionType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeReactionType
  , NEW.reactionType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_reactiontype_FER AFTER UPDATE ON reactiontype FOR EACH ROW
BEGIN
  INSERT INTO reactiontype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeReactionType
  , reactionType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeReactionType
  , NEW.reactionType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_reactiontype_FER AFTER DELETE ON reactiontype FOR EACH ROW
BEGIN
  INSERT INTO reactiontype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeReactionType
  , reactionType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeReactionType
  , OLD.reactionType
  , OLD.isActive );
END;
$$


--
-- Audit Table For requestcategoryapplication 
--

CREATE TABLE IF NOT EXISTS `requestcategoryapplication_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`idLabelingProtocolDefault`  int(10)  NULL DEFAULT NULL
 ,`idHybProtocolDefault`  int(10)  NULL DEFAULT NULL
 ,`idScanProtocolDefault`  int(10)  NULL DEFAULT NULL
 ,`idFeatureExtractionProtocolDefault`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requestcategoryapplication 
--

INSERT INTO requestcategoryapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , codeApplication
  , idLabelingProtocolDefault
  , idHybProtocolDefault
  , idScanProtocolDefault
  , idFeatureExtractionProtocolDefault )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeRequestCategory
  , codeApplication
  , idLabelingProtocolDefault
  , idHybProtocolDefault
  , idScanProtocolDefault
  , idFeatureExtractionProtocolDefault
  FROM requestcategoryapplication
  WHERE NOT EXISTS(SELECT * FROM requestcategoryapplication_Audit)
$$

--
-- Audit Triggers For requestcategoryapplication 
--


CREATE TRIGGER TrAI_requestcategoryapplication_FER AFTER INSERT ON requestcategoryapplication FOR EACH ROW
BEGIN
  INSERT INTO requestcategoryapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , codeApplication
  , idLabelingProtocolDefault
  , idHybProtocolDefault
  , idScanProtocolDefault
  , idFeatureExtractionProtocolDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.idLabelingProtocolDefault
  , NEW.idHybProtocolDefault
  , NEW.idScanProtocolDefault
  , NEW.idFeatureExtractionProtocolDefault );
END;
$$


CREATE TRIGGER TrAU_requestcategoryapplication_FER AFTER UPDATE ON requestcategoryapplication FOR EACH ROW
BEGIN
  INSERT INTO requestcategoryapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , codeApplication
  , idLabelingProtocolDefault
  , idHybProtocolDefault
  , idScanProtocolDefault
  , idFeatureExtractionProtocolDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.idLabelingProtocolDefault
  , NEW.idHybProtocolDefault
  , NEW.idScanProtocolDefault
  , NEW.idFeatureExtractionProtocolDefault );
END;
$$


CREATE TRIGGER TrAD_requestcategoryapplication_FER AFTER DELETE ON requestcategoryapplication FOR EACH ROW
BEGIN
  INSERT INTO requestcategoryapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , codeApplication
  , idLabelingProtocolDefault
  , idHybProtocolDefault
  , idScanProtocolDefault
  , idFeatureExtractionProtocolDefault )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeRequestCategory
  , OLD.codeApplication
  , OLD.idLabelingProtocolDefault
  , OLD.idHybProtocolDefault
  , OLD.idScanProtocolDefault
  , OLD.idFeatureExtractionProtocolDefault );
END;
$$


--
-- Audit Table For requestcategorytype 
--

CREATE TABLE IF NOT EXISTS `requestcategorytype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeRequestCategoryType`  varchar(10)  NULL DEFAULT NULL
 ,`description`  varchar(50)  NULL DEFAULT NULL
 ,`defaultIcon`  varchar(100)  NULL DEFAULT NULL
 ,`isIllumina`  char(1)  NULL DEFAULT NULL
 ,`hasChannels`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requestcategorytype 
--

INSERT INTO requestcategorytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategoryType
  , description
  , defaultIcon
  , isIllumina
  , hasChannels )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeRequestCategoryType
  , description
  , defaultIcon
  , isIllumina
  , hasChannels
  FROM requestcategorytype
  WHERE NOT EXISTS(SELECT * FROM requestcategorytype_Audit)
$$

--
-- Audit Triggers For requestcategorytype 
--


CREATE TRIGGER TrAI_requestcategorytype_FER AFTER INSERT ON requestcategorytype FOR EACH ROW
BEGIN
  INSERT INTO requestcategorytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategoryType
  , description
  , defaultIcon
  , isIllumina
  , hasChannels )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeRequestCategoryType
  , NEW.description
  , NEW.defaultIcon
  , NEW.isIllumina
  , NEW.hasChannels );
END;
$$


CREATE TRIGGER TrAU_requestcategorytype_FER AFTER UPDATE ON requestcategorytype FOR EACH ROW
BEGIN
  INSERT INTO requestcategorytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategoryType
  , description
  , defaultIcon
  , isIllumina
  , hasChannels )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeRequestCategoryType
  , NEW.description
  , NEW.defaultIcon
  , NEW.isIllumina
  , NEW.hasChannels );
END;
$$


CREATE TRIGGER TrAD_requestcategorytype_FER AFTER DELETE ON requestcategorytype FOR EACH ROW
BEGIN
  INSERT INTO requestcategorytype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategoryType
  , description
  , defaultIcon
  , isIllumina
  , hasChannels )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeRequestCategoryType
  , OLD.description
  , OLD.defaultIcon
  , OLD.isIllumina
  , OLD.hasChannels );
END;
$$


--
-- Audit Table For requestcategory 
--

CREATE TABLE IF NOT EXISTS `requestcategory_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`requestCategory`  varchar(50)  NULL DEFAULT NULL
 ,`idVendor`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`numberOfChannels`  int(10)  NULL DEFAULT NULL
 ,`notes`  varchar(500)  NULL DEFAULT NULL
 ,`icon`  varchar(200)  NULL DEFAULT NULL
 ,`type`  varchar(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`isInternal`  char(1)  NULL DEFAULT NULL
 ,`isExternal`  char(1)  NULL DEFAULT NULL
 ,`refrainFromAutoDelete`  char(1)  NULL DEFAULT NULL
 ,`isClinicalResearch`  char(1)  NULL DEFAULT NULL
 ,`isOwnerOnly`  char(1)  NULL DEFAULT NULL
 ,`sampleBatchSize`  int(10)  NULL DEFAULT NULL
 ,`codeProductType`  varchar(10)  NULL DEFAULT NULL
 ,`associatedWithAnalysis`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requestcategory 
--

INSERT INTO requestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , requestCategory
  , idVendor
  , isActive
  , numberOfChannels
  , notes
  , icon
  , type
  , sortOrder
  , idOrganism
  , idCoreFacility
  , isInternal
  , isExternal
  , refrainFromAutoDelete
  , isClinicalResearch
  , isOwnerOnly
  , sampleBatchSize
  , codeProductType
  , associatedWithAnalysis )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeRequestCategory
  , requestCategory
  , idVendor
  , isActive
  , numberOfChannels
  , notes
  , icon
  , type
  , sortOrder
  , idOrganism
  , idCoreFacility
  , isInternal
  , isExternal
  , refrainFromAutoDelete
  , isClinicalResearch
  , isOwnerOnly
  , sampleBatchSize
  , codeProductType
  , associatedWithAnalysis
  FROM requestcategory
  WHERE NOT EXISTS(SELECT * FROM requestcategory_Audit)
$$

--
-- Audit Triggers For requestcategory 
--


CREATE TRIGGER TrAI_requestcategory_FER AFTER INSERT ON requestcategory FOR EACH ROW
BEGIN
  INSERT INTO requestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , requestCategory
  , idVendor
  , isActive
  , numberOfChannels
  , notes
  , icon
  , type
  , sortOrder
  , idOrganism
  , idCoreFacility
  , isInternal
  , isExternal
  , refrainFromAutoDelete
  , isClinicalResearch
  , isOwnerOnly
  , sampleBatchSize
  , codeProductType
  , associatedWithAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeRequestCategory
  , NEW.requestCategory
  , NEW.idVendor
  , NEW.isActive
  , NEW.numberOfChannels
  , NEW.notes
  , NEW.icon
  , NEW.type
  , NEW.sortOrder
  , NEW.idOrganism
  , NEW.idCoreFacility
  , NEW.isInternal
  , NEW.isExternal
  , NEW.refrainFromAutoDelete
  , NEW.isClinicalResearch
  , NEW.isOwnerOnly
  , NEW.sampleBatchSize
  , NEW.codeProductType
  , NEW.associatedWithAnalysis );
END;
$$


CREATE TRIGGER TrAU_requestcategory_FER AFTER UPDATE ON requestcategory FOR EACH ROW
BEGIN
  INSERT INTO requestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , requestCategory
  , idVendor
  , isActive
  , numberOfChannels
  , notes
  , icon
  , type
  , sortOrder
  , idOrganism
  , idCoreFacility
  , isInternal
  , isExternal
  , refrainFromAutoDelete
  , isClinicalResearch
  , isOwnerOnly
  , sampleBatchSize
  , codeProductType
  , associatedWithAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeRequestCategory
  , NEW.requestCategory
  , NEW.idVendor
  , NEW.isActive
  , NEW.numberOfChannels
  , NEW.notes
  , NEW.icon
  , NEW.type
  , NEW.sortOrder
  , NEW.idOrganism
  , NEW.idCoreFacility
  , NEW.isInternal
  , NEW.isExternal
  , NEW.refrainFromAutoDelete
  , NEW.isClinicalResearch
  , NEW.isOwnerOnly
  , NEW.sampleBatchSize
  , NEW.codeProductType
  , NEW.associatedWithAnalysis );
END;
$$


CREATE TRIGGER TrAD_requestcategory_FER AFTER DELETE ON requestcategory FOR EACH ROW
BEGIN
  INSERT INTO requestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestCategory
  , requestCategory
  , idVendor
  , isActive
  , numberOfChannels
  , notes
  , icon
  , type
  , sortOrder
  , idOrganism
  , idCoreFacility
  , isInternal
  , isExternal
  , refrainFromAutoDelete
  , isClinicalResearch
  , isOwnerOnly
  , sampleBatchSize
  , codeProductType
  , associatedWithAnalysis )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeRequestCategory
  , OLD.requestCategory
  , OLD.idVendor
  , OLD.isActive
  , OLD.numberOfChannels
  , OLD.notes
  , OLD.icon
  , OLD.type
  , OLD.sortOrder
  , OLD.idOrganism
  , OLD.idCoreFacility
  , OLD.isInternal
  , OLD.isExternal
  , OLD.refrainFromAutoDelete
  , OLD.isClinicalResearch
  , OLD.isOwnerOnly
  , OLD.sampleBatchSize
  , OLD.codeProductType
  , OLD.associatedWithAnalysis );
END;
$$


--
-- Audit Table For requestcollaborator 
--

CREATE TABLE IF NOT EXISTS `requestcollaborator_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`canUploadData`  char(1)  NULL DEFAULT NULL
 ,`canUpdate`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requestcollaborator 
--

INSERT INTO requestcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idAppUser
  , canUploadData
  , canUpdate )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idRequest
  , idAppUser
  , canUploadData
  , canUpdate
  FROM requestcollaborator
  WHERE NOT EXISTS(SELECT * FROM requestcollaborator_Audit)
$$

--
-- Audit Triggers For requestcollaborator 
--


CREATE TRIGGER TrAI_requestcollaborator_FER AFTER INSERT ON requestcollaborator FOR EACH ROW
BEGIN
  INSERT INTO requestcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idAppUser
  , NEW.canUploadData
  , NEW.canUpdate );
END;
$$


CREATE TRIGGER TrAU_requestcollaborator_FER AFTER UPDATE ON requestcollaborator FOR EACH ROW
BEGIN
  INSERT INTO requestcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idAppUser
  , NEW.canUploadData
  , NEW.canUpdate );
END;
$$


CREATE TRIGGER TrAD_requestcollaborator_FER AFTER DELETE ON requestcollaborator FOR EACH ROW
BEGIN
  INSERT INTO requestcollaborator_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idAppUser
  , canUploadData
  , canUpdate )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idRequest
  , OLD.idAppUser
  , OLD.canUploadData
  , OLD.canUpdate );
END;
$$


--
-- Audit Table For requesthybridization 
--

CREATE TABLE IF NOT EXISTS `requesthybridization_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idHybridization`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requesthybridization 
--

INSERT INTO requesthybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idHybridization )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idRequest
  , idHybridization
  FROM requesthybridization
  WHERE NOT EXISTS(SELECT * FROM requesthybridization_Audit)
$$

--
-- Audit Triggers For requesthybridization 
--


CREATE TRIGGER TrAI_requesthybridization_FER AFTER INSERT ON requesthybridization FOR EACH ROW
BEGIN
  INSERT INTO requesthybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idHybridization )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idHybridization );
END;
$$


CREATE TRIGGER TrAU_requesthybridization_FER AFTER UPDATE ON requesthybridization FOR EACH ROW
BEGIN
  INSERT INTO requesthybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idHybridization )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idHybridization );
END;
$$


CREATE TRIGGER TrAD_requesthybridization_FER AFTER DELETE ON requesthybridization FOR EACH ROW
BEGIN
  INSERT INTO requesthybridization_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idHybridization )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idRequest
  , OLD.idHybridization );
END;
$$


--
-- Audit Table For requestseqlibtreatment 
--

CREATE TABLE IF NOT EXISTS `requestseqlibtreatment_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idSeqLibTreatment`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requestseqlibtreatment 
--

INSERT INTO requestseqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idSeqLibTreatment )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idRequest
  , idSeqLibTreatment
  FROM requestseqlibtreatment
  WHERE NOT EXISTS(SELECT * FROM requestseqlibtreatment_Audit)
$$

--
-- Audit Triggers For requestseqlibtreatment 
--


CREATE TRIGGER TrAI_requestseqlibtreatment_FER AFTER INSERT ON requestseqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO requestseqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idSeqLibTreatment )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idSeqLibTreatment );
END;
$$


CREATE TRIGGER TrAU_requestseqlibtreatment_FER AFTER UPDATE ON requestseqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO requestseqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idSeqLibTreatment )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.idSeqLibTreatment );
END;
$$


CREATE TRIGGER TrAD_requestseqlibtreatment_FER AFTER DELETE ON requestseqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO requestseqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , idSeqLibTreatment )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idRequest
  , OLD.idSeqLibTreatment );
END;
$$


--
-- Audit Table For requeststatus 
--

CREATE TABLE IF NOT EXISTS `requeststatus_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeRequestStatus`  varchar(10)  NULL DEFAULT NULL
 ,`requestStatus`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requeststatus 
--

INSERT INTO requeststatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestStatus
  , requestStatus
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeRequestStatus
  , requestStatus
  , isActive
  FROM requeststatus
  WHERE NOT EXISTS(SELECT * FROM requeststatus_Audit)
$$

--
-- Audit Triggers For requeststatus 
--


CREATE TRIGGER TrAI_requeststatus_FER AFTER INSERT ON requeststatus FOR EACH ROW
BEGIN
  INSERT INTO requeststatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestStatus
  , requestStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeRequestStatus
  , NEW.requestStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_requeststatus_FER AFTER UPDATE ON requeststatus FOR EACH ROW
BEGIN
  INSERT INTO requeststatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestStatus
  , requestStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeRequestStatus
  , NEW.requestStatus
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_requeststatus_FER AFTER DELETE ON requeststatus FOR EACH ROW
BEGIN
  INSERT INTO requeststatus_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeRequestStatus
  , requestStatus
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeRequestStatus
  , OLD.requestStatus
  , OLD.isActive );
END;
$$


--
-- Audit Table For requesttotopic 
--

CREATE TABLE IF NOT EXISTS `requesttotopic_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idTopic`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for requesttotopic 
--

INSERT INTO requesttotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idRequest )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idTopic
  , idRequest
  FROM requesttotopic
  WHERE NOT EXISTS(SELECT * FROM requesttotopic_Audit)
$$

--
-- Audit Triggers For requesttotopic 
--


CREATE TRIGGER TrAI_requesttotopic_FER AFTER INSERT ON requesttotopic FOR EACH ROW
BEGIN
  INSERT INTO requesttotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAU_requesttotopic_FER AFTER UPDATE ON requesttotopic FOR EACH ROW
BEGIN
  INSERT INTO requesttotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.idRequest );
END;
$$


CREATE TRIGGER TrAD_requesttotopic_FER AFTER DELETE ON requesttotopic FOR EACH ROW
BEGIN
  INSERT INTO requesttotopic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , idRequest )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idTopic
  , OLD.idRequest );
END;
$$


--
-- Audit Table For request 
--

CREATE TABLE IF NOT EXISTS `request_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(50)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`codeProtocolType`  varchar(10)  NULL DEFAULT NULL
 ,`protocolNumber`  varchar(100)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`idBillingAccount`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`idProject`  int(10)  NULL DEFAULT NULL
 ,`idSlideProduct`  int(10)  NULL DEFAULT NULL
 ,`idSampleTypeDefault`  int(10)  NULL DEFAULT NULL
 ,`idOrganismSampleDefault`  int(10)  NULL DEFAULT NULL
 ,`idSampleSourceDefault`  int(10)  NULL DEFAULT NULL
 ,`idSamplePrepMethodDefault`  int(10)  NULL DEFAULT NULL
 ,`codeBioanalyzerChipType`  varchar(10)  NULL DEFAULT NULL
 ,`notes`  varchar(2000)  NULL DEFAULT NULL
 ,`completedDate`  datetime  NULL DEFAULT NULL
 ,`isArrayINFORequest`  char(1)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`lastModifyDate`  datetime  NULL DEFAULT NULL
 ,`isExternal`  char(1)  NULL DEFAULT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`privacyExpirationDate`  datetime  NULL DEFAULT NULL
 ,`description`  varchar(5000)  NULL DEFAULT NULL
 ,`corePrepInstructions`  varchar(5000)  NULL DEFAULT NULL
 ,`analysisInstructions`  varchar(5000)  NULL DEFAULT NULL
 ,`captureLibDesignId`  varchar(200)  NULL DEFAULT NULL
 ,`avgInsertSizeFrom`  int(10)  NULL DEFAULT NULL
 ,`avgInsertSizeTo`  int(10)  NULL DEFAULT NULL
 ,`idSampleDropOffLocation`  int(10)  NULL DEFAULT NULL
 ,`codeRequestStatus`  varchar(10)  NULL DEFAULT NULL
 ,`idSubmitter`  int(10)  NULL DEFAULT NULL
 ,`numberIScanChips`  int(10)  NULL DEFAULT NULL
 ,`idIScanChip`  int(10)  NULL DEFAULT NULL
 ,`coreToExtractDNA`  char(1)  NULL DEFAULT NULL
 ,`applicationNotes`  varchar(5000)  NULL DEFAULT NULL
 ,`processingDate`  datetime  NULL DEFAULT NULL
 ,`codeIsolationPrepType`  varchar(15)  NULL DEFAULT NULL
 ,`bioinformaticsAssist`  char(1)  NULL DEFAULT NULL
 ,`hasPrePooledLibraries`  char(1)  NULL DEFAULT NULL
 ,`numPrePooledTubes`  int(10)  NULL DEFAULT NULL
 ,`includeBisulfideConversion`  char(1)  NULL DEFAULT NULL
 ,`includeQubitConcentration`  char(1)  NULL DEFAULT NULL
 ,`alignToGenomeBuild`  char(1)  NULL DEFAULT NULL
 ,`adminNotes`  varchar(5000)  NULL DEFAULT NULL
 ,`idProduct`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for request 
--

INSERT INTO request_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , number
  , createDate
  , codeProtocolType
  , protocolNumber
  , idLab
  , idAppUser
  , idBillingAccount
  , codeRequestCategory
  , codeApplication
  , idProject
  , idSlideProduct
  , idSampleTypeDefault
  , idOrganismSampleDefault
  , idSampleSourceDefault
  , idSamplePrepMethodDefault
  , codeBioanalyzerChipType
  , notes
  , completedDate
  , isArrayINFORequest
  , codeVisibility
  , lastModifyDate
  , isExternal
  , idInstitution
  , idCoreFacility
  , name
  , privacyExpirationDate
  , description
  , corePrepInstructions
  , analysisInstructions
  , captureLibDesignId
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , idSampleDropOffLocation
  , codeRequestStatus
  , idSubmitter
  , numberIScanChips
  , idIScanChip
  , coreToExtractDNA
  , applicationNotes
  , processingDate
  , codeIsolationPrepType
  , bioinformaticsAssist
  , hasPrePooledLibraries
  , numPrePooledTubes
  , includeBisulfideConversion
  , includeQubitConcentration
  , alignToGenomeBuild
  , adminNotes
  , idProduct )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idRequest
  , number
  , createDate
  , codeProtocolType
  , protocolNumber
  , idLab
  , idAppUser
  , idBillingAccount
  , codeRequestCategory
  , codeApplication
  , idProject
  , idSlideProduct
  , idSampleTypeDefault
  , idOrganismSampleDefault
  , idSampleSourceDefault
  , idSamplePrepMethodDefault
  , codeBioanalyzerChipType
  , notes
  , completedDate
  , isArrayINFORequest
  , codeVisibility
  , lastModifyDate
  , isExternal
  , idInstitution
  , idCoreFacility
  , name
  , privacyExpirationDate
  , description
  , corePrepInstructions
  , analysisInstructions
  , captureLibDesignId
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , idSampleDropOffLocation
  , codeRequestStatus
  , idSubmitter
  , numberIScanChips
  , idIScanChip
  , coreToExtractDNA
  , applicationNotes
  , processingDate
  , codeIsolationPrepType
  , bioinformaticsAssist
  , hasPrePooledLibraries
  , numPrePooledTubes
  , includeBisulfideConversion
  , includeQubitConcentration
  , alignToGenomeBuild
  , adminNotes
  , idProduct
  FROM request
  WHERE NOT EXISTS(SELECT * FROM request_Audit)
$$

--
-- Audit Triggers For request 
--


CREATE TRIGGER TrAI_request_FER AFTER INSERT ON request FOR EACH ROW
BEGIN
  INSERT INTO request_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , number
  , createDate
  , codeProtocolType
  , protocolNumber
  , idLab
  , idAppUser
  , idBillingAccount
  , codeRequestCategory
  , codeApplication
  , idProject
  , idSlideProduct
  , idSampleTypeDefault
  , idOrganismSampleDefault
  , idSampleSourceDefault
  , idSamplePrepMethodDefault
  , codeBioanalyzerChipType
  , notes
  , completedDate
  , isArrayINFORequest
  , codeVisibility
  , lastModifyDate
  , isExternal
  , idInstitution
  , idCoreFacility
  , name
  , privacyExpirationDate
  , description
  , corePrepInstructions
  , analysisInstructions
  , captureLibDesignId
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , idSampleDropOffLocation
  , codeRequestStatus
  , idSubmitter
  , numberIScanChips
  , idIScanChip
  , coreToExtractDNA
  , applicationNotes
  , processingDate
  , codeIsolationPrepType
  , bioinformaticsAssist
  , hasPrePooledLibraries
  , numPrePooledTubes
  , includeBisulfideConversion
  , includeQubitConcentration
  , alignToGenomeBuild
  , adminNotes
  , idProduct )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.number
  , NEW.createDate
  , NEW.codeProtocolType
  , NEW.protocolNumber
  , NEW.idLab
  , NEW.idAppUser
  , NEW.idBillingAccount
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.idProject
  , NEW.idSlideProduct
  , NEW.idSampleTypeDefault
  , NEW.idOrganismSampleDefault
  , NEW.idSampleSourceDefault
  , NEW.idSamplePrepMethodDefault
  , NEW.codeBioanalyzerChipType
  , NEW.notes
  , NEW.completedDate
  , NEW.isArrayINFORequest
  , NEW.codeVisibility
  , NEW.lastModifyDate
  , NEW.isExternal
  , NEW.idInstitution
  , NEW.idCoreFacility
  , NEW.name
  , NEW.privacyExpirationDate
  , NEW.description
  , NEW.corePrepInstructions
  , NEW.analysisInstructions
  , NEW.captureLibDesignId
  , NEW.avgInsertSizeFrom
  , NEW.avgInsertSizeTo
  , NEW.idSampleDropOffLocation
  , NEW.codeRequestStatus
  , NEW.idSubmitter
  , NEW.numberIScanChips
  , NEW.idIScanChip
  , NEW.coreToExtractDNA
  , NEW.applicationNotes
  , NEW.processingDate
  , NEW.codeIsolationPrepType
  , NEW.bioinformaticsAssist
  , NEW.hasPrePooledLibraries
  , NEW.numPrePooledTubes
  , NEW.includeBisulfideConversion
  , NEW.includeQubitConcentration
  , NEW.alignToGenomeBuild
  , NEW.adminNotes
  , NEW.idProduct );
END;
$$


CREATE TRIGGER TrAU_request_FER AFTER UPDATE ON request FOR EACH ROW
BEGIN
  INSERT INTO request_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , number
  , createDate
  , codeProtocolType
  , protocolNumber
  , idLab
  , idAppUser
  , idBillingAccount
  , codeRequestCategory
  , codeApplication
  , idProject
  , idSlideProduct
  , idSampleTypeDefault
  , idOrganismSampleDefault
  , idSampleSourceDefault
  , idSamplePrepMethodDefault
  , codeBioanalyzerChipType
  , notes
  , completedDate
  , isArrayINFORequest
  , codeVisibility
  , lastModifyDate
  , isExternal
  , idInstitution
  , idCoreFacility
  , name
  , privacyExpirationDate
  , description
  , corePrepInstructions
  , analysisInstructions
  , captureLibDesignId
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , idSampleDropOffLocation
  , codeRequestStatus
  , idSubmitter
  , numberIScanChips
  , idIScanChip
  , coreToExtractDNA
  , applicationNotes
  , processingDate
  , codeIsolationPrepType
  , bioinformaticsAssist
  , hasPrePooledLibraries
  , numPrePooledTubes
  , includeBisulfideConversion
  , includeQubitConcentration
  , alignToGenomeBuild
  , adminNotes
  , idProduct )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idRequest
  , NEW.number
  , NEW.createDate
  , NEW.codeProtocolType
  , NEW.protocolNumber
  , NEW.idLab
  , NEW.idAppUser
  , NEW.idBillingAccount
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.idProject
  , NEW.idSlideProduct
  , NEW.idSampleTypeDefault
  , NEW.idOrganismSampleDefault
  , NEW.idSampleSourceDefault
  , NEW.idSamplePrepMethodDefault
  , NEW.codeBioanalyzerChipType
  , NEW.notes
  , NEW.completedDate
  , NEW.isArrayINFORequest
  , NEW.codeVisibility
  , NEW.lastModifyDate
  , NEW.isExternal
  , NEW.idInstitution
  , NEW.idCoreFacility
  , NEW.name
  , NEW.privacyExpirationDate
  , NEW.description
  , NEW.corePrepInstructions
  , NEW.analysisInstructions
  , NEW.captureLibDesignId
  , NEW.avgInsertSizeFrom
  , NEW.avgInsertSizeTo
  , NEW.idSampleDropOffLocation
  , NEW.codeRequestStatus
  , NEW.idSubmitter
  , NEW.numberIScanChips
  , NEW.idIScanChip
  , NEW.coreToExtractDNA
  , NEW.applicationNotes
  , NEW.processingDate
  , NEW.codeIsolationPrepType
  , NEW.bioinformaticsAssist
  , NEW.hasPrePooledLibraries
  , NEW.numPrePooledTubes
  , NEW.includeBisulfideConversion
  , NEW.includeQubitConcentration
  , NEW.alignToGenomeBuild
  , NEW.adminNotes
  , NEW.idProduct );
END;
$$


CREATE TRIGGER TrAD_request_FER AFTER DELETE ON request FOR EACH ROW
BEGIN
  INSERT INTO request_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idRequest
  , number
  , createDate
  , codeProtocolType
  , protocolNumber
  , idLab
  , idAppUser
  , idBillingAccount
  , codeRequestCategory
  , codeApplication
  , idProject
  , idSlideProduct
  , idSampleTypeDefault
  , idOrganismSampleDefault
  , idSampleSourceDefault
  , idSamplePrepMethodDefault
  , codeBioanalyzerChipType
  , notes
  , completedDate
  , isArrayINFORequest
  , codeVisibility
  , lastModifyDate
  , isExternal
  , idInstitution
  , idCoreFacility
  , name
  , privacyExpirationDate
  , description
  , corePrepInstructions
  , analysisInstructions
  , captureLibDesignId
  , avgInsertSizeFrom
  , avgInsertSizeTo
  , idSampleDropOffLocation
  , codeRequestStatus
  , idSubmitter
  , numberIScanChips
  , idIScanChip
  , coreToExtractDNA
  , applicationNotes
  , processingDate
  , codeIsolationPrepType
  , bioinformaticsAssist
  , hasPrePooledLibraries
  , numPrePooledTubes
  , includeBisulfideConversion
  , includeQubitConcentration
  , alignToGenomeBuild
  , adminNotes
  , idProduct )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idRequest
  , OLD.number
  , OLD.createDate
  , OLD.codeProtocolType
  , OLD.protocolNumber
  , OLD.idLab
  , OLD.idAppUser
  , OLD.idBillingAccount
  , OLD.codeRequestCategory
  , OLD.codeApplication
  , OLD.idProject
  , OLD.idSlideProduct
  , OLD.idSampleTypeDefault
  , OLD.idOrganismSampleDefault
  , OLD.idSampleSourceDefault
  , OLD.idSamplePrepMethodDefault
  , OLD.codeBioanalyzerChipType
  , OLD.notes
  , OLD.completedDate
  , OLD.isArrayINFORequest
  , OLD.codeVisibility
  , OLD.lastModifyDate
  , OLD.isExternal
  , OLD.idInstitution
  , OLD.idCoreFacility
  , OLD.name
  , OLD.privacyExpirationDate
  , OLD.description
  , OLD.corePrepInstructions
  , OLD.analysisInstructions
  , OLD.captureLibDesignId
  , OLD.avgInsertSizeFrom
  , OLD.avgInsertSizeTo
  , OLD.idSampleDropOffLocation
  , OLD.codeRequestStatus
  , OLD.idSubmitter
  , OLD.numberIScanChips
  , OLD.idIScanChip
  , OLD.coreToExtractDNA
  , OLD.applicationNotes
  , OLD.processingDate
  , OLD.codeIsolationPrepType
  , OLD.bioinformaticsAssist
  , OLD.hasPrePooledLibraries
  , OLD.numPrePooledTubes
  , OLD.includeBisulfideConversion
  , OLD.includeQubitConcentration
  , OLD.alignToGenomeBuild
  , OLD.adminNotes
  , OLD.idProduct );
END;
$$


--
-- Audit Table For sampledropofflocation 
--

CREATE TABLE IF NOT EXISTS `sampledropofflocation_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSampleDropOffLocation`  int(10)  NULL DEFAULT NULL
 ,`sampleDropOffLocation`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sampledropofflocation 
--

INSERT INTO sampledropofflocation_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleDropOffLocation
  , sampleDropOffLocation
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSampleDropOffLocation
  , sampleDropOffLocation
  , isActive
  FROM sampledropofflocation
  WHERE NOT EXISTS(SELECT * FROM sampledropofflocation_Audit)
$$

--
-- Audit Triggers For sampledropofflocation 
--


CREATE TRIGGER TrAI_sampledropofflocation_FER AFTER INSERT ON sampledropofflocation FOR EACH ROW
BEGIN
  INSERT INTO sampledropofflocation_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleDropOffLocation
  , sampleDropOffLocation
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSampleDropOffLocation
  , NEW.sampleDropOffLocation
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_sampledropofflocation_FER AFTER UPDATE ON sampledropofflocation FOR EACH ROW
BEGIN
  INSERT INTO sampledropofflocation_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleDropOffLocation
  , sampleDropOffLocation
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSampleDropOffLocation
  , NEW.sampleDropOffLocation
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_sampledropofflocation_FER AFTER DELETE ON sampledropofflocation FOR EACH ROW
BEGIN
  INSERT INTO sampledropofflocation_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleDropOffLocation
  , sampleDropOffLocation
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSampleDropOffLocation
  , OLD.sampleDropOffLocation
  , OLD.isActive );
END;
$$


--
-- Audit Table For sampleexperimentfile 
--

CREATE TABLE IF NOT EXISTS `sampleexperimentfile_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSampleExperimentFile`  int(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`idExpFileRead1`  int(10)  NULL DEFAULT NULL
 ,`idExpFileRead2`  int(10)  NULL DEFAULT NULL
 ,`seqRunNumber`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sampleexperimentfile 
--

INSERT INTO sampleexperimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleExperimentFile
  , idSample
  , idExpFileRead1
  , idExpFileRead2
  , seqRunNumber )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSampleExperimentFile
  , idSample
  , idExpFileRead1
  , idExpFileRead2
  , seqRunNumber
  FROM sampleexperimentfile
  WHERE NOT EXISTS(SELECT * FROM sampleexperimentfile_Audit)
$$

--
-- Audit Triggers For sampleexperimentfile 
--


CREATE TRIGGER TrAI_sampleexperimentfile_FER AFTER INSERT ON sampleexperimentfile FOR EACH ROW
BEGIN
  INSERT INTO sampleexperimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleExperimentFile
  , idSample
  , idExpFileRead1
  , idExpFileRead2
  , seqRunNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSampleExperimentFile
  , NEW.idSample
  , NEW.idExpFileRead1
  , NEW.idExpFileRead2
  , NEW.seqRunNumber );
END;
$$


CREATE TRIGGER TrAU_sampleexperimentfile_FER AFTER UPDATE ON sampleexperimentfile FOR EACH ROW
BEGIN
  INSERT INTO sampleexperimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleExperimentFile
  , idSample
  , idExpFileRead1
  , idExpFileRead2
  , seqRunNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSampleExperimentFile
  , NEW.idSample
  , NEW.idExpFileRead1
  , NEW.idExpFileRead2
  , NEW.seqRunNumber );
END;
$$


CREATE TRIGGER TrAD_sampleexperimentfile_FER AFTER DELETE ON sampleexperimentfile FOR EACH ROW
BEGIN
  INSERT INTO sampleexperimentfile_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleExperimentFile
  , idSample
  , idExpFileRead1
  , idExpFileRead2
  , seqRunNumber )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSampleExperimentFile
  , OLD.idSample
  , OLD.idExpFileRead1
  , OLD.idExpFileRead2
  , OLD.seqRunNumber );
END;
$$


--
-- Audit Table For samplefiletype 
--

CREATE TABLE IF NOT EXISTS `samplefiletype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeSampleFileType`  varchar(10)  NULL DEFAULT NULL
 ,`description`  varchar(200)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for samplefiletype 
--

INSERT INTO samplefiletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSampleFileType
  , description )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeSampleFileType
  , description
  FROM samplefiletype
  WHERE NOT EXISTS(SELECT * FROM samplefiletype_Audit)
$$

--
-- Audit Triggers For samplefiletype 
--


CREATE TRIGGER TrAI_samplefiletype_FER AFTER INSERT ON samplefiletype FOR EACH ROW
BEGIN
  INSERT INTO samplefiletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSampleFileType
  , description )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeSampleFileType
  , NEW.description );
END;
$$


CREATE TRIGGER TrAU_samplefiletype_FER AFTER UPDATE ON samplefiletype FOR EACH ROW
BEGIN
  INSERT INTO samplefiletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSampleFileType
  , description )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeSampleFileType
  , NEW.description );
END;
$$


CREATE TRIGGER TrAD_samplefiletype_FER AFTER DELETE ON samplefiletype FOR EACH ROW
BEGIN
  INSERT INTO samplefiletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSampleFileType
  , description )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeSampleFileType
  , OLD.description );
END;
$$


--
-- Audit Table For sampleprepmethod 
--

CREATE TABLE IF NOT EXISTS `sampleprepmethod_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSamplePrepMethod`  int(10)  NULL DEFAULT NULL
 ,`samplePrepMethod`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sampleprepmethod 
--

INSERT INTO sampleprepmethod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSamplePrepMethod
  , samplePrepMethod
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSamplePrepMethod
  , samplePrepMethod
  , isActive
  FROM sampleprepmethod
  WHERE NOT EXISTS(SELECT * FROM sampleprepmethod_Audit)
$$

--
-- Audit Triggers For sampleprepmethod 
--


CREATE TRIGGER TrAI_sampleprepmethod_FER AFTER INSERT ON sampleprepmethod FOR EACH ROW
BEGIN
  INSERT INTO sampleprepmethod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSamplePrepMethod
  , samplePrepMethod
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSamplePrepMethod
  , NEW.samplePrepMethod
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_sampleprepmethod_FER AFTER UPDATE ON sampleprepmethod FOR EACH ROW
BEGIN
  INSERT INTO sampleprepmethod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSamplePrepMethod
  , samplePrepMethod
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSamplePrepMethod
  , NEW.samplePrepMethod
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_sampleprepmethod_FER AFTER DELETE ON sampleprepmethod FOR EACH ROW
BEGIN
  INSERT INTO sampleprepmethod_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSamplePrepMethod
  , samplePrepMethod
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSamplePrepMethod
  , OLD.samplePrepMethod
  , OLD.isActive );
END;
$$


--
-- Audit Table For samplesource 
--

CREATE TABLE IF NOT EXISTS `samplesource_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSampleSource`  int(10)  NULL DEFAULT NULL
 ,`sampleSource`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for samplesource 
--

INSERT INTO samplesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleSource
  , sampleSource
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSampleSource
  , sampleSource
  , isActive
  FROM samplesource
  WHERE NOT EXISTS(SELECT * FROM samplesource_Audit)
$$

--
-- Audit Triggers For samplesource 
--


CREATE TRIGGER TrAI_samplesource_FER AFTER INSERT ON samplesource FOR EACH ROW
BEGIN
  INSERT INTO samplesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleSource
  , sampleSource
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSampleSource
  , NEW.sampleSource
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_samplesource_FER AFTER UPDATE ON samplesource FOR EACH ROW
BEGIN
  INSERT INTO samplesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleSource
  , sampleSource
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSampleSource
  , NEW.sampleSource
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_samplesource_FER AFTER DELETE ON samplesource FOR EACH ROW
BEGIN
  INSERT INTO samplesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleSource
  , sampleSource
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSampleSource
  , OLD.sampleSource
  , OLD.isActive );
END;
$$


--
-- Audit Table For sampletyperequestcategory 
--

CREATE TABLE IF NOT EXISTS `sampletyperequestcategory_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSampleTypeRequestCategory`  int(10)  NULL DEFAULT NULL
 ,`idSampleType`  int(10)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sampletyperequestcategory 
--

INSERT INTO sampletyperequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleTypeRequestCategory
  , idSampleType
  , codeRequestCategory )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSampleTypeRequestCategory
  , idSampleType
  , codeRequestCategory
  FROM sampletyperequestcategory
  WHERE NOT EXISTS(SELECT * FROM sampletyperequestcategory_Audit)
$$

--
-- Audit Triggers For sampletyperequestcategory 
--


CREATE TRIGGER TrAI_sampletyperequestcategory_FER AFTER INSERT ON sampletyperequestcategory FOR EACH ROW
BEGIN
  INSERT INTO sampletyperequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleTypeRequestCategory
  , idSampleType
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSampleTypeRequestCategory
  , NEW.idSampleType
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAU_sampletyperequestcategory_FER AFTER UPDATE ON sampletyperequestcategory FOR EACH ROW
BEGIN
  INSERT INTO sampletyperequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleTypeRequestCategory
  , idSampleType
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSampleTypeRequestCategory
  , NEW.idSampleType
  , NEW.codeRequestCategory );
END;
$$


CREATE TRIGGER TrAD_sampletyperequestcategory_FER AFTER DELETE ON sampletyperequestcategory FOR EACH ROW
BEGIN
  INSERT INTO sampletyperequestcategory_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleTypeRequestCategory
  , idSampleType
  , codeRequestCategory )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSampleTypeRequestCategory
  , OLD.idSampleType
  , OLD.codeRequestCategory );
END;
$$


--
-- Audit Table For sampletype 
--

CREATE TABLE IF NOT EXISTS `sampletype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSampleType`  int(10)  NULL DEFAULT NULL
 ,`sampleType`  varchar(50)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`codeNucleotideType`  varchar(50)  NULL DEFAULT NULL
 ,`notes`  varchar(5000)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sampletype 
--

INSERT INTO sampletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleType
  , sampleType
  , sortOrder
  , isActive
  , codeNucleotideType
  , notes
  , idCoreFacility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSampleType
  , sampleType
  , sortOrder
  , isActive
  , codeNucleotideType
  , notes
  , idCoreFacility
  FROM sampletype
  WHERE NOT EXISTS(SELECT * FROM sampletype_Audit)
$$

--
-- Audit Triggers For sampletype 
--


CREATE TRIGGER TrAI_sampletype_FER AFTER INSERT ON sampletype FOR EACH ROW
BEGIN
  INSERT INTO sampletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleType
  , sampleType
  , sortOrder
  , isActive
  , codeNucleotideType
  , notes
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSampleType
  , NEW.sampleType
  , NEW.sortOrder
  , NEW.isActive
  , NEW.codeNucleotideType
  , NEW.notes
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAU_sampletype_FER AFTER UPDATE ON sampletype FOR EACH ROW
BEGIN
  INSERT INTO sampletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleType
  , sampleType
  , sortOrder
  , isActive
  , codeNucleotideType
  , notes
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSampleType
  , NEW.sampleType
  , NEW.sortOrder
  , NEW.isActive
  , NEW.codeNucleotideType
  , NEW.notes
  , NEW.idCoreFacility );
END;
$$


CREATE TRIGGER TrAD_sampletype_FER AFTER DELETE ON sampletype FOR EACH ROW
BEGIN
  INSERT INTO sampletype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSampleType
  , sampleType
  , sortOrder
  , isActive
  , codeNucleotideType
  , notes
  , idCoreFacility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSampleType
  , OLD.sampleType
  , OLD.sortOrder
  , OLD.isActive
  , OLD.codeNucleotideType
  , OLD.notes
  , OLD.idCoreFacility );
END;
$$


--
-- Audit Table For sample 
--

CREATE TABLE IF NOT EXISTS `sample_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(100)  NULL DEFAULT NULL
 ,`name`  varchar(200)  NULL DEFAULT NULL
 ,`description`  varchar(2000)  NULL DEFAULT NULL
 ,`concentration`  decimal(8,3)  NULL DEFAULT NULL
 ,`codeConcentrationUnit`  varchar(10)  NULL DEFAULT NULL
 ,`idSampleType`  int(10)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`otherOrganism`  varchar(100)  NULL DEFAULT NULL
 ,`idSampleSource`  int(10)  NULL DEFAULT NULL
 ,`idSamplePrepMethod`  int(10)  NULL DEFAULT NULL
 ,`otherSamplePrepMethod`  varchar(300)  NULL DEFAULT NULL
 ,`idSeqLibProtocol`  int(10)  NULL DEFAULT NULL
 ,`codeBioanalyzerChipType`  varchar(10)  NULL DEFAULT NULL
 ,`idOligoBarcode`  int(10)  NULL DEFAULT NULL
 ,`qualDate`  datetime  NULL DEFAULT NULL
 ,`qualFailed`  char(1)  NULL DEFAULT NULL
 ,`qualBypassed`  char(1)  NULL DEFAULT NULL
 ,`qual260nmTo280nmRatio`  decimal(3,2)  NULL DEFAULT NULL
 ,`qual260nmTo230nmRatio`  decimal(3,2)  NULL DEFAULT NULL
 ,`qualCalcConcentration`  decimal(8,2)  NULL DEFAULT NULL
 ,`qual28sTo18sRibosomalRatio`  decimal(2,1)  NULL DEFAULT NULL
 ,`qualRINNumber`  varchar(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`fragmentSizeFrom`  int(10)  NULL DEFAULT NULL
 ,`fragmentSizeTo`  int(10)  NULL DEFAULT NULL
 ,`seqPrepByCore`  char(1)  NULL DEFAULT NULL
 ,`seqPrepDate`  datetime  NULL DEFAULT NULL
 ,`seqPrepFailed`  char(1)  NULL DEFAULT NULL
 ,`seqPrepBypassed`  char(1)  NULL DEFAULT NULL
 ,`qualFragmentSizeFrom`  int(10)  NULL DEFAULT NULL
 ,`qualFragmentSizeTo`  int(10)  NULL DEFAULT NULL
 ,`seqPrepLibConcentration`  decimal(8,1)  NULL DEFAULT NULL
 ,`seqPrepQualCodeBioanalyzerChipType`  varchar(10)  NULL DEFAULT NULL
 ,`seqPrepGelFragmentSizeFrom`  int(10)  NULL DEFAULT NULL
 ,`seqPrepGelFragmentSizeTo`  int(10)  NULL DEFAULT NULL
 ,`seqPrepStockLibVol`  decimal(8,1)  NULL DEFAULT NULL
 ,`seqPrepStockEBVol`  decimal(8,1)  NULL DEFAULT NULL
 ,`seqPrepStockDate`  datetime  NULL DEFAULT NULL
 ,`seqPrepStockFailed`  char(1)  NULL DEFAULT NULL
 ,`seqPrepStockBypassed`  char(1)  NULL DEFAULT NULL
 ,`prepInstructions`  varchar(2000)  NULL DEFAULT NULL
 ,`ccNumber`  varchar(20)  NULL DEFAULT NULL
 ,`multiplexGroupNumber`  int(10)  NULL DEFAULT NULL
 ,`barcodeSequence`  varchar(20)  NULL DEFAULT NULL
 ,`meanLibSizeActual`  int(10)  NULL DEFAULT NULL
 ,`idOligoBarcodeB`  int(10)  NULL DEFAULT NULL
 ,`barcodeSequenceB`  varchar(20)  NULL DEFAULT NULL
 ,`qubitConcentration`  decimal(8,3)  NULL DEFAULT NULL
 ,`groupName`  varchar(200)  NULL DEFAULT NULL
 ,`qcCodeApplication`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sample 
--

INSERT INTO sample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSample
  , number
  , name
  , description
  , concentration
  , codeConcentrationUnit
  , idSampleType
  , idOrganism
  , otherOrganism
  , idSampleSource
  , idSamplePrepMethod
  , otherSamplePrepMethod
  , idSeqLibProtocol
  , codeBioanalyzerChipType
  , idOligoBarcode
  , qualDate
  , qualFailed
  , qualBypassed
  , qual260nmTo280nmRatio
  , qual260nmTo230nmRatio
  , qualCalcConcentration
  , qual28sTo18sRibosomalRatio
  , qualRINNumber
  , idRequest
  , fragmentSizeFrom
  , fragmentSizeTo
  , seqPrepByCore
  , seqPrepDate
  , seqPrepFailed
  , seqPrepBypassed
  , qualFragmentSizeFrom
  , qualFragmentSizeTo
  , seqPrepLibConcentration
  , seqPrepQualCodeBioanalyzerChipType
  , seqPrepGelFragmentSizeFrom
  , seqPrepGelFragmentSizeTo
  , seqPrepStockLibVol
  , seqPrepStockEBVol
  , seqPrepStockDate
  , seqPrepStockFailed
  , seqPrepStockBypassed
  , prepInstructions
  , ccNumber
  , multiplexGroupNumber
  , barcodeSequence
  , meanLibSizeActual
  , idOligoBarcodeB
  , barcodeSequenceB
  , qubitConcentration
  , groupName
  , qcCodeApplication )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSample
  , number
  , name
  , description
  , concentration
  , codeConcentrationUnit
  , idSampleType
  , idOrganism
  , otherOrganism
  , idSampleSource
  , idSamplePrepMethod
  , otherSamplePrepMethod
  , idSeqLibProtocol
  , codeBioanalyzerChipType
  , idOligoBarcode
  , qualDate
  , qualFailed
  , qualBypassed
  , qual260nmTo280nmRatio
  , qual260nmTo230nmRatio
  , qualCalcConcentration
  , qual28sTo18sRibosomalRatio
  , qualRINNumber
  , idRequest
  , fragmentSizeFrom
  , fragmentSizeTo
  , seqPrepByCore
  , seqPrepDate
  , seqPrepFailed
  , seqPrepBypassed
  , qualFragmentSizeFrom
  , qualFragmentSizeTo
  , seqPrepLibConcentration
  , seqPrepQualCodeBioanalyzerChipType
  , seqPrepGelFragmentSizeFrom
  , seqPrepGelFragmentSizeTo
  , seqPrepStockLibVol
  , seqPrepStockEBVol
  , seqPrepStockDate
  , seqPrepStockFailed
  , seqPrepStockBypassed
  , prepInstructions
  , ccNumber
  , multiplexGroupNumber
  , barcodeSequence
  , meanLibSizeActual
  , idOligoBarcodeB
  , barcodeSequenceB
  , qubitConcentration
  , groupName
  , qcCodeApplication
  FROM sample
  WHERE NOT EXISTS(SELECT * FROM sample_Audit)
$$

--
-- Audit Triggers For sample 
--


CREATE TRIGGER TrAI_sample_FER AFTER INSERT ON sample FOR EACH ROW
BEGIN
  INSERT INTO sample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSample
  , number
  , name
  , description
  , concentration
  , codeConcentrationUnit
  , idSampleType
  , idOrganism
  , otherOrganism
  , idSampleSource
  , idSamplePrepMethod
  , otherSamplePrepMethod
  , idSeqLibProtocol
  , codeBioanalyzerChipType
  , idOligoBarcode
  , qualDate
  , qualFailed
  , qualBypassed
  , qual260nmTo280nmRatio
  , qual260nmTo230nmRatio
  , qualCalcConcentration
  , qual28sTo18sRibosomalRatio
  , qualRINNumber
  , idRequest
  , fragmentSizeFrom
  , fragmentSizeTo
  , seqPrepByCore
  , seqPrepDate
  , seqPrepFailed
  , seqPrepBypassed
  , qualFragmentSizeFrom
  , qualFragmentSizeTo
  , seqPrepLibConcentration
  , seqPrepQualCodeBioanalyzerChipType
  , seqPrepGelFragmentSizeFrom
  , seqPrepGelFragmentSizeTo
  , seqPrepStockLibVol
  , seqPrepStockEBVol
  , seqPrepStockDate
  , seqPrepStockFailed
  , seqPrepStockBypassed
  , prepInstructions
  , ccNumber
  , multiplexGroupNumber
  , barcodeSequence
  , meanLibSizeActual
  , idOligoBarcodeB
  , barcodeSequenceB
  , qubitConcentration
  , groupName
  , qcCodeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSample
  , NEW.number
  , NEW.name
  , NEW.description
  , NEW.concentration
  , NEW.codeConcentrationUnit
  , NEW.idSampleType
  , NEW.idOrganism
  , NEW.otherOrganism
  , NEW.idSampleSource
  , NEW.idSamplePrepMethod
  , NEW.otherSamplePrepMethod
  , NEW.idSeqLibProtocol
  , NEW.codeBioanalyzerChipType
  , NEW.idOligoBarcode
  , NEW.qualDate
  , NEW.qualFailed
  , NEW.qualBypassed
  , NEW.qual260nmTo280nmRatio
  , NEW.qual260nmTo230nmRatio
  , NEW.qualCalcConcentration
  , NEW.qual28sTo18sRibosomalRatio
  , NEW.qualRINNumber
  , NEW.idRequest
  , NEW.fragmentSizeFrom
  , NEW.fragmentSizeTo
  , NEW.seqPrepByCore
  , NEW.seqPrepDate
  , NEW.seqPrepFailed
  , NEW.seqPrepBypassed
  , NEW.qualFragmentSizeFrom
  , NEW.qualFragmentSizeTo
  , NEW.seqPrepLibConcentration
  , NEW.seqPrepQualCodeBioanalyzerChipType
  , NEW.seqPrepGelFragmentSizeFrom
  , NEW.seqPrepGelFragmentSizeTo
  , NEW.seqPrepStockLibVol
  , NEW.seqPrepStockEBVol
  , NEW.seqPrepStockDate
  , NEW.seqPrepStockFailed
  , NEW.seqPrepStockBypassed
  , NEW.prepInstructions
  , NEW.ccNumber
  , NEW.multiplexGroupNumber
  , NEW.barcodeSequence
  , NEW.meanLibSizeActual
  , NEW.idOligoBarcodeB
  , NEW.barcodeSequenceB
  , NEW.qubitConcentration
  , NEW.groupName
  , NEW.qcCodeApplication );
END;
$$


CREATE TRIGGER TrAU_sample_FER AFTER UPDATE ON sample FOR EACH ROW
BEGIN
  INSERT INTO sample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSample
  , number
  , name
  , description
  , concentration
  , codeConcentrationUnit
  , idSampleType
  , idOrganism
  , otherOrganism
  , idSampleSource
  , idSamplePrepMethod
  , otherSamplePrepMethod
  , idSeqLibProtocol
  , codeBioanalyzerChipType
  , idOligoBarcode
  , qualDate
  , qualFailed
  , qualBypassed
  , qual260nmTo280nmRatio
  , qual260nmTo230nmRatio
  , qualCalcConcentration
  , qual28sTo18sRibosomalRatio
  , qualRINNumber
  , idRequest
  , fragmentSizeFrom
  , fragmentSizeTo
  , seqPrepByCore
  , seqPrepDate
  , seqPrepFailed
  , seqPrepBypassed
  , qualFragmentSizeFrom
  , qualFragmentSizeTo
  , seqPrepLibConcentration
  , seqPrepQualCodeBioanalyzerChipType
  , seqPrepGelFragmentSizeFrom
  , seqPrepGelFragmentSizeTo
  , seqPrepStockLibVol
  , seqPrepStockEBVol
  , seqPrepStockDate
  , seqPrepStockFailed
  , seqPrepStockBypassed
  , prepInstructions
  , ccNumber
  , multiplexGroupNumber
  , barcodeSequence
  , meanLibSizeActual
  , idOligoBarcodeB
  , barcodeSequenceB
  , qubitConcentration
  , groupName
  , qcCodeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSample
  , NEW.number
  , NEW.name
  , NEW.description
  , NEW.concentration
  , NEW.codeConcentrationUnit
  , NEW.idSampleType
  , NEW.idOrganism
  , NEW.otherOrganism
  , NEW.idSampleSource
  , NEW.idSamplePrepMethod
  , NEW.otherSamplePrepMethod
  , NEW.idSeqLibProtocol
  , NEW.codeBioanalyzerChipType
  , NEW.idOligoBarcode
  , NEW.qualDate
  , NEW.qualFailed
  , NEW.qualBypassed
  , NEW.qual260nmTo280nmRatio
  , NEW.qual260nmTo230nmRatio
  , NEW.qualCalcConcentration
  , NEW.qual28sTo18sRibosomalRatio
  , NEW.qualRINNumber
  , NEW.idRequest
  , NEW.fragmentSizeFrom
  , NEW.fragmentSizeTo
  , NEW.seqPrepByCore
  , NEW.seqPrepDate
  , NEW.seqPrepFailed
  , NEW.seqPrepBypassed
  , NEW.qualFragmentSizeFrom
  , NEW.qualFragmentSizeTo
  , NEW.seqPrepLibConcentration
  , NEW.seqPrepQualCodeBioanalyzerChipType
  , NEW.seqPrepGelFragmentSizeFrom
  , NEW.seqPrepGelFragmentSizeTo
  , NEW.seqPrepStockLibVol
  , NEW.seqPrepStockEBVol
  , NEW.seqPrepStockDate
  , NEW.seqPrepStockFailed
  , NEW.seqPrepStockBypassed
  , NEW.prepInstructions
  , NEW.ccNumber
  , NEW.multiplexGroupNumber
  , NEW.barcodeSequence
  , NEW.meanLibSizeActual
  , NEW.idOligoBarcodeB
  , NEW.barcodeSequenceB
  , NEW.qubitConcentration
  , NEW.groupName
  , NEW.qcCodeApplication );
END;
$$


CREATE TRIGGER TrAD_sample_FER AFTER DELETE ON sample FOR EACH ROW
BEGIN
  INSERT INTO sample_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSample
  , number
  , name
  , description
  , concentration
  , codeConcentrationUnit
  , idSampleType
  , idOrganism
  , otherOrganism
  , idSampleSource
  , idSamplePrepMethod
  , otherSamplePrepMethod
  , idSeqLibProtocol
  , codeBioanalyzerChipType
  , idOligoBarcode
  , qualDate
  , qualFailed
  , qualBypassed
  , qual260nmTo280nmRatio
  , qual260nmTo230nmRatio
  , qualCalcConcentration
  , qual28sTo18sRibosomalRatio
  , qualRINNumber
  , idRequest
  , fragmentSizeFrom
  , fragmentSizeTo
  , seqPrepByCore
  , seqPrepDate
  , seqPrepFailed
  , seqPrepBypassed
  , qualFragmentSizeFrom
  , qualFragmentSizeTo
  , seqPrepLibConcentration
  , seqPrepQualCodeBioanalyzerChipType
  , seqPrepGelFragmentSizeFrom
  , seqPrepGelFragmentSizeTo
  , seqPrepStockLibVol
  , seqPrepStockEBVol
  , seqPrepStockDate
  , seqPrepStockFailed
  , seqPrepStockBypassed
  , prepInstructions
  , ccNumber
  , multiplexGroupNumber
  , barcodeSequence
  , meanLibSizeActual
  , idOligoBarcodeB
  , barcodeSequenceB
  , qubitConcentration
  , groupName
  , qcCodeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSample
  , OLD.number
  , OLD.name
  , OLD.description
  , OLD.concentration
  , OLD.codeConcentrationUnit
  , OLD.idSampleType
  , OLD.idOrganism
  , OLD.otherOrganism
  , OLD.idSampleSource
  , OLD.idSamplePrepMethod
  , OLD.otherSamplePrepMethod
  , OLD.idSeqLibProtocol
  , OLD.codeBioanalyzerChipType
  , OLD.idOligoBarcode
  , OLD.qualDate
  , OLD.qualFailed
  , OLD.qualBypassed
  , OLD.qual260nmTo280nmRatio
  , OLD.qual260nmTo230nmRatio
  , OLD.qualCalcConcentration
  , OLD.qual28sTo18sRibosomalRatio
  , OLD.qualRINNumber
  , OLD.idRequest
  , OLD.fragmentSizeFrom
  , OLD.fragmentSizeTo
  , OLD.seqPrepByCore
  , OLD.seqPrepDate
  , OLD.seqPrepFailed
  , OLD.seqPrepBypassed
  , OLD.qualFragmentSizeFrom
  , OLD.qualFragmentSizeTo
  , OLD.seqPrepLibConcentration
  , OLD.seqPrepQualCodeBioanalyzerChipType
  , OLD.seqPrepGelFragmentSizeFrom
  , OLD.seqPrepGelFragmentSizeTo
  , OLD.seqPrepStockLibVol
  , OLD.seqPrepStockEBVol
  , OLD.seqPrepStockDate
  , OLD.seqPrepStockFailed
  , OLD.seqPrepStockBypassed
  , OLD.prepInstructions
  , OLD.ccNumber
  , OLD.multiplexGroupNumber
  , OLD.barcodeSequence
  , OLD.meanLibSizeActual
  , OLD.idOligoBarcodeB
  , OLD.barcodeSequenceB
  , OLD.qubitConcentration
  , OLD.groupName
  , OLD.qcCodeApplication );
END;
$$


--
-- Audit Table For scanprotocol 
--

CREATE TABLE IF NOT EXISTS `scanprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idScanProtocol`  int(10)  NULL DEFAULT NULL
 ,`scanProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for scanprotocol 
--

INSERT INTO scanprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idScanProtocol
  , scanProtocol
  , description
  , codeRequestCategory
  , url
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idScanProtocol
  , scanProtocol
  , description
  , codeRequestCategory
  , url
  , isActive
  FROM scanprotocol
  WHERE NOT EXISTS(SELECT * FROM scanprotocol_Audit)
$$

--
-- Audit Triggers For scanprotocol 
--


CREATE TRIGGER TrAI_scanprotocol_FER AFTER INSERT ON scanprotocol FOR EACH ROW
BEGIN
  INSERT INTO scanprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idScanProtocol
  , scanProtocol
  , description
  , codeRequestCategory
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idScanProtocol
  , NEW.scanProtocol
  , NEW.description
  , NEW.codeRequestCategory
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_scanprotocol_FER AFTER UPDATE ON scanprotocol FOR EACH ROW
BEGIN
  INSERT INTO scanprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idScanProtocol
  , scanProtocol
  , description
  , codeRequestCategory
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idScanProtocol
  , NEW.scanProtocol
  , NEW.description
  , NEW.codeRequestCategory
  , NEW.url
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_scanprotocol_FER AFTER DELETE ON scanprotocol FOR EACH ROW
BEGIN
  INSERT INTO scanprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idScanProtocol
  , scanProtocol
  , description
  , codeRequestCategory
  , url
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idScanProtocol
  , OLD.scanProtocol
  , OLD.description
  , OLD.codeRequestCategory
  , OLD.url
  , OLD.isActive );
END;
$$


--
-- Audit Table For sealtype 
--

CREATE TABLE IF NOT EXISTS `sealtype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeSealType`  varchar(10)  NULL DEFAULT NULL
 ,`sealType`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sealtype 
--

INSERT INTO sealtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSealType
  , sealType
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeSealType
  , sealType
  , isActive
  FROM sealtype
  WHERE NOT EXISTS(SELECT * FROM sealtype_Audit)
$$

--
-- Audit Triggers For sealtype 
--


CREATE TRIGGER TrAI_sealtype_FER AFTER INSERT ON sealtype FOR EACH ROW
BEGIN
  INSERT INTO sealtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSealType
  , sealType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeSealType
  , NEW.sealType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_sealtype_FER AFTER UPDATE ON sealtype FOR EACH ROW
BEGIN
  INSERT INTO sealtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSealType
  , sealType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeSealType
  , NEW.sealType
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_sealtype_FER AFTER DELETE ON sealtype FOR EACH ROW
BEGIN
  INSERT INTO sealtype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSealType
  , sealType
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeSealType
  , OLD.sealType
  , OLD.isActive );
END;
$$


--
-- Audit Table For segment 
--

CREATE TABLE IF NOT EXISTS `segment_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSegment`  int(10)  NULL DEFAULT NULL
 ,`length`  int(10) unsigned  NULL DEFAULT NULL
 ,`name`  varchar(100)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
 ,`sortOrder`  int(10) unsigned  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for segment 
--

INSERT INTO segment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSegment
  , length
  , name
  , idGenomeBuild
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSegment
  , length
  , name
  , idGenomeBuild
  , sortOrder
  FROM segment
  WHERE NOT EXISTS(SELECT * FROM segment_Audit)
$$

--
-- Audit Triggers For segment 
--


CREATE TRIGGER TrAI_segment_FER AFTER INSERT ON segment FOR EACH ROW
BEGIN
  INSERT INTO segment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSegment
  , length
  , name
  , idGenomeBuild
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSegment
  , NEW.length
  , NEW.name
  , NEW.idGenomeBuild
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_segment_FER AFTER UPDATE ON segment FOR EACH ROW
BEGIN
  INSERT INTO segment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSegment
  , length
  , name
  , idGenomeBuild
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSegment
  , NEW.length
  , NEW.name
  , NEW.idGenomeBuild
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_segment_FER AFTER DELETE ON segment FOR EACH ROW
BEGIN
  INSERT INTO segment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSegment
  , length
  , name
  , idGenomeBuild
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSegment
  , OLD.length
  , OLD.name
  , OLD.idGenomeBuild
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For seqlibprotocolapplication 
--

CREATE TABLE IF NOT EXISTS `seqlibprotocolapplication_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSeqLibProtocol`  int(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for seqlibprotocolapplication 
--

INSERT INTO seqlibprotocolapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , codeApplication )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSeqLibProtocol
  , codeApplication
  FROM seqlibprotocolapplication
  WHERE NOT EXISTS(SELECT * FROM seqlibprotocolapplication_Audit)
$$

--
-- Audit Triggers For seqlibprotocolapplication 
--


CREATE TRIGGER TrAI_seqlibprotocolapplication_FER AFTER INSERT ON seqlibprotocolapplication FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocolapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSeqLibProtocol
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAU_seqlibprotocolapplication_FER AFTER UPDATE ON seqlibprotocolapplication FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocolapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSeqLibProtocol
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAD_seqlibprotocolapplication_FER AFTER DELETE ON seqlibprotocolapplication FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocolapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSeqLibProtocol
  , OLD.codeApplication );
END;
$$


--
-- Audit Table For seqlibprotocol 
--

CREATE TABLE IF NOT EXISTS `seqlibprotocol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSeqLibProtocol`  int(10)  NULL DEFAULT NULL
 ,`seqLibProtocol`  varchar(200)  NULL DEFAULT NULL
 ,`description`  longtext  NULL DEFAULT NULL
 ,`url`  varchar(500)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`adapterSequenceRead1`  varchar(500)  NULL DEFAULT NULL
 ,`adapterSequenceRead2`  varchar(500)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for seqlibprotocol 
--

INSERT INTO seqlibprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , seqLibProtocol
  , description
  , url
  , isActive
  , adapterSequenceRead1
  , adapterSequenceRead2 )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSeqLibProtocol
  , seqLibProtocol
  , description
  , url
  , isActive
  , adapterSequenceRead1
  , adapterSequenceRead2
  FROM seqlibprotocol
  WHERE NOT EXISTS(SELECT * FROM seqlibprotocol_Audit)
$$

--
-- Audit Triggers For seqlibprotocol 
--


CREATE TRIGGER TrAI_seqlibprotocol_FER AFTER INSERT ON seqlibprotocol FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , seqLibProtocol
  , description
  , url
  , isActive
  , adapterSequenceRead1
  , adapterSequenceRead2 )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSeqLibProtocol
  , NEW.seqLibProtocol
  , NEW.description
  , NEW.url
  , NEW.isActive
  , NEW.adapterSequenceRead1
  , NEW.adapterSequenceRead2 );
END;
$$


CREATE TRIGGER TrAU_seqlibprotocol_FER AFTER UPDATE ON seqlibprotocol FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , seqLibProtocol
  , description
  , url
  , isActive
  , adapterSequenceRead1
  , adapterSequenceRead2 )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSeqLibProtocol
  , NEW.seqLibProtocol
  , NEW.description
  , NEW.url
  , NEW.isActive
  , NEW.adapterSequenceRead1
  , NEW.adapterSequenceRead2 );
END;
$$


CREATE TRIGGER TrAD_seqlibprotocol_FER AFTER DELETE ON seqlibprotocol FOR EACH ROW
BEGIN
  INSERT INTO seqlibprotocol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibProtocol
  , seqLibProtocol
  , description
  , url
  , isActive
  , adapterSequenceRead1
  , adapterSequenceRead2 )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSeqLibProtocol
  , OLD.seqLibProtocol
  , OLD.description
  , OLD.url
  , OLD.isActive
  , OLD.adapterSequenceRead1
  , OLD.adapterSequenceRead2 );
END;
$$


--
-- Audit Table For seqlibtreatment 
--

CREATE TABLE IF NOT EXISTS `seqlibtreatment_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSeqLibTreatment`  int(10)  NULL DEFAULT NULL
 ,`seqLibTreatment`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for seqlibtreatment 
--

INSERT INTO seqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibTreatment
  , seqLibTreatment
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSeqLibTreatment
  , seqLibTreatment
  , isActive
  FROM seqlibtreatment
  WHERE NOT EXISTS(SELECT * FROM seqlibtreatment_Audit)
$$

--
-- Audit Triggers For seqlibtreatment 
--


CREATE TRIGGER TrAI_seqlibtreatment_FER AFTER INSERT ON seqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO seqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibTreatment
  , seqLibTreatment
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSeqLibTreatment
  , NEW.seqLibTreatment
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_seqlibtreatment_FER AFTER UPDATE ON seqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO seqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibTreatment
  , seqLibTreatment
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSeqLibTreatment
  , NEW.seqLibTreatment
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_seqlibtreatment_FER AFTER DELETE ON seqlibtreatment FOR EACH ROW
BEGIN
  INSERT INTO seqlibtreatment_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqLibTreatment
  , seqLibTreatment
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSeqLibTreatment
  , OLD.seqLibTreatment
  , OLD.isActive );
END;
$$


--
-- Audit Table For seqruntype 
--

CREATE TABLE IF NOT EXISTS `seqruntype_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSeqRunType`  int(10)  NULL DEFAULT NULL
 ,`seqRunType`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for seqruntype 
--

INSERT INTO seqruntype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqRunType
  , seqRunType
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSeqRunType
  , seqRunType
  , isActive
  , sortOrder
  FROM seqruntype
  WHERE NOT EXISTS(SELECT * FROM seqruntype_Audit)
$$

--
-- Audit Triggers For seqruntype 
--


CREATE TRIGGER TrAI_seqruntype_FER AFTER INSERT ON seqruntype FOR EACH ROW
BEGIN
  INSERT INTO seqruntype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqRunType
  , seqRunType
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSeqRunType
  , NEW.seqRunType
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_seqruntype_FER AFTER UPDATE ON seqruntype FOR EACH ROW
BEGIN
  INSERT INTO seqruntype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqRunType
  , seqRunType
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSeqRunType
  , NEW.seqRunType
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_seqruntype_FER AFTER DELETE ON seqruntype FOR EACH ROW
BEGIN
  INSERT INTO seqruntype_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSeqRunType
  , seqRunType
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSeqRunType
  , OLD.seqRunType
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For sequencelane 
--

CREATE TABLE IF NOT EXISTS `sequencelane_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSequenceLane`  int(10)  NULL DEFAULT NULL
 ,`number`  varchar(100)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`idSeqRunType`  int(10)  NULL DEFAULT NULL
 ,`idNumberSequencingCycles`  int(10)  NULL DEFAULT NULL
 ,`analysisInstructions`  varchar(2000)  NULL DEFAULT NULL
 ,`idGenomeBuildAlignTo`  int(10)  NULL DEFAULT NULL
 ,`idFlowCellChannel`  int(10)  NULL DEFAULT NULL
 ,`readCount`  int(10)  NULL DEFAULT NULL
 ,`pipelineVersion`  varchar(10)  NULL DEFAULT NULL
 ,`idNumberSequencingCyclesAllowed`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sequencelane 
--

INSERT INTO sequencelane_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequenceLane
  , number
  , createDate
  , idRequest
  , idSample
  , idSeqRunType
  , idNumberSequencingCycles
  , analysisInstructions
  , idGenomeBuildAlignTo
  , idFlowCellChannel
  , readCount
  , pipelineVersion
  , idNumberSequencingCyclesAllowed )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSequenceLane
  , number
  , createDate
  , idRequest
  , idSample
  , idSeqRunType
  , idNumberSequencingCycles
  , analysisInstructions
  , idGenomeBuildAlignTo
  , idFlowCellChannel
  , readCount
  , pipelineVersion
  , idNumberSequencingCyclesAllowed
  FROM sequencelane
  WHERE NOT EXISTS(SELECT * FROM sequencelane_Audit)
$$

--
-- Audit Triggers For sequencelane 
--


CREATE TRIGGER TrAI_sequencelane_FER AFTER INSERT ON sequencelane FOR EACH ROW
BEGIN
  INSERT INTO sequencelane_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequenceLane
  , number
  , createDate
  , idRequest
  , idSample
  , idSeqRunType
  , idNumberSequencingCycles
  , analysisInstructions
  , idGenomeBuildAlignTo
  , idFlowCellChannel
  , readCount
  , pipelineVersion
  , idNumberSequencingCyclesAllowed )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSequenceLane
  , NEW.number
  , NEW.createDate
  , NEW.idRequest
  , NEW.idSample
  , NEW.idSeqRunType
  , NEW.idNumberSequencingCycles
  , NEW.analysisInstructions
  , NEW.idGenomeBuildAlignTo
  , NEW.idFlowCellChannel
  , NEW.readCount
  , NEW.pipelineVersion
  , NEW.idNumberSequencingCyclesAllowed );
END;
$$


CREATE TRIGGER TrAU_sequencelane_FER AFTER UPDATE ON sequencelane FOR EACH ROW
BEGIN
  INSERT INTO sequencelane_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequenceLane
  , number
  , createDate
  , idRequest
  , idSample
  , idSeqRunType
  , idNumberSequencingCycles
  , analysisInstructions
  , idGenomeBuildAlignTo
  , idFlowCellChannel
  , readCount
  , pipelineVersion
  , idNumberSequencingCyclesAllowed )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSequenceLane
  , NEW.number
  , NEW.createDate
  , NEW.idRequest
  , NEW.idSample
  , NEW.idSeqRunType
  , NEW.idNumberSequencingCycles
  , NEW.analysisInstructions
  , NEW.idGenomeBuildAlignTo
  , NEW.idFlowCellChannel
  , NEW.readCount
  , NEW.pipelineVersion
  , NEW.idNumberSequencingCyclesAllowed );
END;
$$


CREATE TRIGGER TrAD_sequencelane_FER AFTER DELETE ON sequencelane FOR EACH ROW
BEGIN
  INSERT INTO sequencelane_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequenceLane
  , number
  , createDate
  , idRequest
  , idSample
  , idSeqRunType
  , idNumberSequencingCycles
  , analysisInstructions
  , idGenomeBuildAlignTo
  , idFlowCellChannel
  , readCount
  , pipelineVersion
  , idNumberSequencingCyclesAllowed )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSequenceLane
  , OLD.number
  , OLD.createDate
  , OLD.idRequest
  , OLD.idSample
  , OLD.idSeqRunType
  , OLD.idNumberSequencingCycles
  , OLD.analysisInstructions
  , OLD.idGenomeBuildAlignTo
  , OLD.idFlowCellChannel
  , OLD.readCount
  , OLD.pipelineVersion
  , OLD.idNumberSequencingCyclesAllowed );
END;
$$


--
-- Audit Table For sequencingcontrol 
--

CREATE TABLE IF NOT EXISTS `sequencingcontrol_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSequencingControl`  int(10)  NULL DEFAULT NULL
 ,`sequencingControl`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sequencingcontrol 
--

INSERT INTO sequencingcontrol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequencingControl
  , sequencingControl
  , isActive
  , idAppUser )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSequencingControl
  , sequencingControl
  , isActive
  , idAppUser
  FROM sequencingcontrol
  WHERE NOT EXISTS(SELECT * FROM sequencingcontrol_Audit)
$$

--
-- Audit Triggers For sequencingcontrol 
--


CREATE TRIGGER TrAI_sequencingcontrol_FER AFTER INSERT ON sequencingcontrol FOR EACH ROW
BEGIN
  INSERT INTO sequencingcontrol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequencingControl
  , sequencingControl
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSequencingControl
  , NEW.sequencingControl
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAU_sequencingcontrol_FER AFTER UPDATE ON sequencingcontrol FOR EACH ROW
BEGIN
  INSERT INTO sequencingcontrol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequencingControl
  , sequencingControl
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSequencingControl
  , NEW.sequencingControl
  , NEW.isActive
  , NEW.idAppUser );
END;
$$


CREATE TRIGGER TrAD_sequencingcontrol_FER AFTER DELETE ON sequencingcontrol FOR EACH ROW
BEGIN
  INSERT INTO sequencingcontrol_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSequencingControl
  , sequencingControl
  , isActive
  , idAppUser )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSequencingControl
  , OLD.sequencingControl
  , OLD.isActive
  , OLD.idAppUser );
END;
$$


--
-- Audit Table For sequencingplatform 
--

CREATE TABLE IF NOT EXISTS `sequencingplatform_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeSequencingPlatform`  varchar(10)  NULL DEFAULT NULL
 ,`sequencingPlatform`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for sequencingplatform 
--

INSERT INTO sequencingplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSequencingPlatform
  , sequencingPlatform
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeSequencingPlatform
  , sequencingPlatform
  , isActive
  FROM sequencingplatform
  WHERE NOT EXISTS(SELECT * FROM sequencingplatform_Audit)
$$

--
-- Audit Triggers For sequencingplatform 
--


CREATE TRIGGER TrAI_sequencingplatform_FER AFTER INSERT ON sequencingplatform FOR EACH ROW
BEGIN
  INSERT INTO sequencingplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSequencingPlatform
  , sequencingPlatform
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeSequencingPlatform
  , NEW.sequencingPlatform
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_sequencingplatform_FER AFTER UPDATE ON sequencingplatform FOR EACH ROW
BEGIN
  INSERT INTO sequencingplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSequencingPlatform
  , sequencingPlatform
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeSequencingPlatform
  , NEW.sequencingPlatform
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_sequencingplatform_FER AFTER DELETE ON sequencingplatform FOR EACH ROW
BEGIN
  INSERT INTO sequencingplatform_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSequencingPlatform
  , sequencingPlatform
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeSequencingPlatform
  , OLD.sequencingPlatform
  , OLD.isActive );
END;
$$


--
-- Audit Table For slidedesign 
--

CREATE TABLE IF NOT EXISTS `slidedesign_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSlideDesign`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(500)  NULL DEFAULT NULL
 ,`slideDesignProtocolName`  varchar(100)  NULL DEFAULT NULL
 ,`idSlideProduct`  int(10)  NULL DEFAULT NULL
 ,`accessionNumberArrayExpress`  varchar(200)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for slidedesign 
--

INSERT INTO slidedesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideDesign
  , name
  , slideDesignProtocolName
  , idSlideProduct
  , accessionNumberArrayExpress
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSlideDesign
  , name
  , slideDesignProtocolName
  , idSlideProduct
  , accessionNumberArrayExpress
  , isActive
  FROM slidedesign
  WHERE NOT EXISTS(SELECT * FROM slidedesign_Audit)
$$

--
-- Audit Triggers For slidedesign 
--


CREATE TRIGGER TrAI_slidedesign_FER AFTER INSERT ON slidedesign FOR EACH ROW
BEGIN
  INSERT INTO slidedesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideDesign
  , name
  , slideDesignProtocolName
  , idSlideProduct
  , accessionNumberArrayExpress
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSlideDesign
  , NEW.name
  , NEW.slideDesignProtocolName
  , NEW.idSlideProduct
  , NEW.accessionNumberArrayExpress
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_slidedesign_FER AFTER UPDATE ON slidedesign FOR EACH ROW
BEGIN
  INSERT INTO slidedesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideDesign
  , name
  , slideDesignProtocolName
  , idSlideProduct
  , accessionNumberArrayExpress
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSlideDesign
  , NEW.name
  , NEW.slideDesignProtocolName
  , NEW.idSlideProduct
  , NEW.accessionNumberArrayExpress
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_slidedesign_FER AFTER DELETE ON slidedesign FOR EACH ROW
BEGIN
  INSERT INTO slidedesign_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideDesign
  , name
  , slideDesignProtocolName
  , idSlideProduct
  , accessionNumberArrayExpress
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSlideDesign
  , OLD.name
  , OLD.slideDesignProtocolName
  , OLD.idSlideProduct
  , OLD.accessionNumberArrayExpress
  , OLD.isActive );
END;
$$


--
-- Audit Table For slideproductapplication 
--

CREATE TABLE IF NOT EXISTS `slideproductapplication_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSlideProduct`  int(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for slideproductapplication 
--

INSERT INTO slideproductapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , codeApplication )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSlideProduct
  , codeApplication
  FROM slideproductapplication
  WHERE NOT EXISTS(SELECT * FROM slideproductapplication_Audit)
$$

--
-- Audit Triggers For slideproductapplication 
--


CREATE TRIGGER TrAI_slideproductapplication_FER AFTER INSERT ON slideproductapplication FOR EACH ROW
BEGIN
  INSERT INTO slideproductapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSlideProduct
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAU_slideproductapplication_FER AFTER UPDATE ON slideproductapplication FOR EACH ROW
BEGIN
  INSERT INTO slideproductapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSlideProduct
  , NEW.codeApplication );
END;
$$


CREATE TRIGGER TrAD_slideproductapplication_FER AFTER DELETE ON slideproductapplication FOR EACH ROW
BEGIN
  INSERT INTO slideproductapplication_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , codeApplication )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSlideProduct
  , OLD.codeApplication );
END;
$$


--
-- Audit Table For slideproduct 
--

CREATE TABLE IF NOT EXISTS `slideproduct_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSlideProduct`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(500)  NULL DEFAULT NULL
 ,`catalogNumber`  varchar(100)  NULL DEFAULT NULL
 ,`isCustom`  char(1)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`idVendor`  int(10)  NULL DEFAULT NULL
 ,`idOrganism`  int(10)  NULL DEFAULT NULL
 ,`arraysPerSlide`  int(10)  NULL DEFAULT NULL
 ,`slidesInSet`  int(10)  NULL DEFAULT NULL
 ,`isSlideSet`  char(1)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`idBillingSlideProductClass`  int(10)  NULL DEFAULT NULL
 ,`idBillingSlideServiceClass`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for slideproduct 
--

INSERT INTO slideproduct_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , name
  , catalogNumber
  , isCustom
  , idLab
  , codeApplication
  , idVendor
  , idOrganism
  , arraysPerSlide
  , slidesInSet
  , isSlideSet
  , isActive
  , idBillingSlideProductClass
  , idBillingSlideServiceClass )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSlideProduct
  , name
  , catalogNumber
  , isCustom
  , idLab
  , codeApplication
  , idVendor
  , idOrganism
  , arraysPerSlide
  , slidesInSet
  , isSlideSet
  , isActive
  , idBillingSlideProductClass
  , idBillingSlideServiceClass
  FROM slideproduct
  WHERE NOT EXISTS(SELECT * FROM slideproduct_Audit)
$$

--
-- Audit Triggers For slideproduct 
--


CREATE TRIGGER TrAI_slideproduct_FER AFTER INSERT ON slideproduct FOR EACH ROW
BEGIN
  INSERT INTO slideproduct_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , name
  , catalogNumber
  , isCustom
  , idLab
  , codeApplication
  , idVendor
  , idOrganism
  , arraysPerSlide
  , slidesInSet
  , isSlideSet
  , isActive
  , idBillingSlideProductClass
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSlideProduct
  , NEW.name
  , NEW.catalogNumber
  , NEW.isCustom
  , NEW.idLab
  , NEW.codeApplication
  , NEW.idVendor
  , NEW.idOrganism
  , NEW.arraysPerSlide
  , NEW.slidesInSet
  , NEW.isSlideSet
  , NEW.isActive
  , NEW.idBillingSlideProductClass
  , NEW.idBillingSlideServiceClass );
END;
$$


CREATE TRIGGER TrAU_slideproduct_FER AFTER UPDATE ON slideproduct FOR EACH ROW
BEGIN
  INSERT INTO slideproduct_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , name
  , catalogNumber
  , isCustom
  , idLab
  , codeApplication
  , idVendor
  , idOrganism
  , arraysPerSlide
  , slidesInSet
  , isSlideSet
  , isActive
  , idBillingSlideProductClass
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSlideProduct
  , NEW.name
  , NEW.catalogNumber
  , NEW.isCustom
  , NEW.idLab
  , NEW.codeApplication
  , NEW.idVendor
  , NEW.idOrganism
  , NEW.arraysPerSlide
  , NEW.slidesInSet
  , NEW.isSlideSet
  , NEW.isActive
  , NEW.idBillingSlideProductClass
  , NEW.idBillingSlideServiceClass );
END;
$$


CREATE TRIGGER TrAD_slideproduct_FER AFTER DELETE ON slideproduct FOR EACH ROW
BEGIN
  INSERT INTO slideproduct_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlideProduct
  , name
  , catalogNumber
  , isCustom
  , idLab
  , codeApplication
  , idVendor
  , idOrganism
  , arraysPerSlide
  , slidesInSet
  , isSlideSet
  , isActive
  , idBillingSlideProductClass
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSlideProduct
  , OLD.name
  , OLD.catalogNumber
  , OLD.isCustom
  , OLD.idLab
  , OLD.codeApplication
  , OLD.idVendor
  , OLD.idOrganism
  , OLD.arraysPerSlide
  , OLD.slidesInSet
  , OLD.isSlideSet
  , OLD.isActive
  , OLD.idBillingSlideProductClass
  , OLD.idBillingSlideServiceClass );
END;
$$


--
-- Audit Table For slidesource 
--

CREATE TABLE IF NOT EXISTS `slidesource_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeSlideSource`  varchar(10)  NULL DEFAULT NULL
 ,`slideSource`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for slidesource 
--

INSERT INTO slidesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSlideSource
  , slideSource
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeSlideSource
  , slideSource
  , isActive
  , sortOrder
  FROM slidesource
  WHERE NOT EXISTS(SELECT * FROM slidesource_Audit)
$$

--
-- Audit Triggers For slidesource 
--


CREATE TRIGGER TrAI_slidesource_FER AFTER INSERT ON slidesource FOR EACH ROW
BEGIN
  INSERT INTO slidesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSlideSource
  , slideSource
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeSlideSource
  , NEW.slideSource
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_slidesource_FER AFTER UPDATE ON slidesource FOR EACH ROW
BEGIN
  INSERT INTO slidesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSlideSource
  , slideSource
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeSlideSource
  , NEW.slideSource
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_slidesource_FER AFTER DELETE ON slidesource FOR EACH ROW
BEGIN
  INSERT INTO slidesource_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeSlideSource
  , slideSource
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeSlideSource
  , OLD.slideSource
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For slide 
--

CREATE TABLE IF NOT EXISTS `slide_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSlide`  int(10)  NULL DEFAULT NULL
 ,`barcode`  varchar(100)  NULL DEFAULT NULL
 ,`idSlideDesign`  int(10)  NULL DEFAULT NULL
 ,`slideName`  varchar(200)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for slide 
--

INSERT INTO slide_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlide
  , barcode
  , idSlideDesign
  , slideName )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSlide
  , barcode
  , idSlideDesign
  , slideName
  FROM slide
  WHERE NOT EXISTS(SELECT * FROM slide_Audit)
$$

--
-- Audit Triggers For slide 
--


CREATE TRIGGER TrAI_slide_FER AFTER INSERT ON slide FOR EACH ROW
BEGIN
  INSERT INTO slide_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlide
  , barcode
  , idSlideDesign
  , slideName )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSlide
  , NEW.barcode
  , NEW.idSlideDesign
  , NEW.slideName );
END;
$$


CREATE TRIGGER TrAU_slide_FER AFTER UPDATE ON slide FOR EACH ROW
BEGIN
  INSERT INTO slide_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlide
  , barcode
  , idSlideDesign
  , slideName )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSlide
  , NEW.barcode
  , NEW.idSlideDesign
  , NEW.slideName );
END;
$$


CREATE TRIGGER TrAD_slide_FER AFTER DELETE ON slide FOR EACH ROW
BEGIN
  INSERT INTO slide_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSlide
  , barcode
  , idSlideDesign
  , slideName )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSlide
  , OLD.barcode
  , OLD.idSlideDesign
  , OLD.slideName );
END;
$$


--
-- Audit Table For state 
--

CREATE TABLE IF NOT EXISTS `state_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeState`  varchar(10)  NULL DEFAULT NULL
 ,`state`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for state 
--

INSERT INTO state_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeState
  , state
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeState
  , state
  , isActive
  FROM state
  WHERE NOT EXISTS(SELECT * FROM state_Audit)
$$

--
-- Audit Triggers For state 
--


CREATE TRIGGER TrAI_state_FER AFTER INSERT ON state FOR EACH ROW
BEGIN
  INSERT INTO state_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeState
  , state
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeState
  , NEW.state
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_state_FER AFTER UPDATE ON state FOR EACH ROW
BEGIN
  INSERT INTO state_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeState
  , state
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeState
  , NEW.state
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_state_FER AFTER DELETE ON state FOR EACH ROW
BEGIN
  INSERT INTO state_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeState
  , state
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeState
  , OLD.state
  , OLD.isActive );
END;
$$


--
-- Audit Table For step 
--

CREATE TABLE IF NOT EXISTS `step_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeStep`  varchar(10)  NULL DEFAULT NULL
 ,`step`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
 ,`sortOrder`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for step 
--

INSERT INTO step_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeStep
  , step
  , isActive
  , sortOrder )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeStep
  , step
  , isActive
  , sortOrder
  FROM step
  WHERE NOT EXISTS(SELECT * FROM step_Audit)
$$

--
-- Audit Triggers For step 
--


CREATE TRIGGER TrAI_step_FER AFTER INSERT ON step FOR EACH ROW
BEGIN
  INSERT INTO step_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeStep
  , step
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeStep
  , NEW.step
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAU_step_FER AFTER UPDATE ON step FOR EACH ROW
BEGIN
  INSERT INTO step_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeStep
  , step
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeStep
  , NEW.step
  , NEW.isActive
  , NEW.sortOrder );
END;
$$


CREATE TRIGGER TrAD_step_FER AFTER DELETE ON step FOR EACH ROW
BEGIN
  INSERT INTO step_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeStep
  , step
  , isActive
  , sortOrder )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeStep
  , OLD.step
  , OLD.isActive
  , OLD.sortOrder );
END;
$$


--
-- Audit Table For submissioninstruction 
--

CREATE TABLE IF NOT EXISTS `submissioninstruction_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idSubmissionInstruction`  int(10)  NULL DEFAULT NULL
 ,`description`  varchar(200)  NULL DEFAULT NULL
 ,`url`  varchar(2000)  NULL DEFAULT NULL
 ,`codeRequestCategory`  varchar(10)  NULL DEFAULT NULL
 ,`codeApplication`  varchar(10)  NULL DEFAULT NULL
 ,`codeBioanalyzerChipType`  varchar(10)  NULL DEFAULT NULL
 ,`idBillingSlideServiceClass`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for submissioninstruction 
--

INSERT INTO submissioninstruction_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSubmissionInstruction
  , description
  , url
  , codeRequestCategory
  , codeApplication
  , codeBioanalyzerChipType
  , idBillingSlideServiceClass )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idSubmissionInstruction
  , description
  , url
  , codeRequestCategory
  , codeApplication
  , codeBioanalyzerChipType
  , idBillingSlideServiceClass
  FROM submissioninstruction
  WHERE NOT EXISTS(SELECT * FROM submissioninstruction_Audit)
$$

--
-- Audit Triggers For submissioninstruction 
--


CREATE TRIGGER TrAI_submissioninstruction_FER AFTER INSERT ON submissioninstruction FOR EACH ROW
BEGIN
  INSERT INTO submissioninstruction_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSubmissionInstruction
  , description
  , url
  , codeRequestCategory
  , codeApplication
  , codeBioanalyzerChipType
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idSubmissionInstruction
  , NEW.description
  , NEW.url
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.codeBioanalyzerChipType
  , NEW.idBillingSlideServiceClass );
END;
$$


CREATE TRIGGER TrAU_submissioninstruction_FER AFTER UPDATE ON submissioninstruction FOR EACH ROW
BEGIN
  INSERT INTO submissioninstruction_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSubmissionInstruction
  , description
  , url
  , codeRequestCategory
  , codeApplication
  , codeBioanalyzerChipType
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idSubmissionInstruction
  , NEW.description
  , NEW.url
  , NEW.codeRequestCategory
  , NEW.codeApplication
  , NEW.codeBioanalyzerChipType
  , NEW.idBillingSlideServiceClass );
END;
$$


CREATE TRIGGER TrAD_submissioninstruction_FER AFTER DELETE ON submissioninstruction FOR EACH ROW
BEGIN
  INSERT INTO submissioninstruction_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idSubmissionInstruction
  , description
  , url
  , codeRequestCategory
  , codeApplication
  , codeBioanalyzerChipType
  , idBillingSlideServiceClass )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idSubmissionInstruction
  , OLD.description
  , OLD.url
  , OLD.codeRequestCategory
  , OLD.codeApplication
  , OLD.codeBioanalyzerChipType
  , OLD.idBillingSlideServiceClass );
END;
$$


--
-- Audit Table For topic 
--

CREATE TABLE IF NOT EXISTS `topic_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idTopic`  int(10)  NULL DEFAULT NULL
 ,`name`  varchar(2000)  NULL DEFAULT NULL
 ,`description`  varchar(10000)  NULL DEFAULT NULL
 ,`idParentTopic`  int(10)  NULL DEFAULT NULL
 ,`idLab`  int(10)  NULL DEFAULT NULL
 ,`createdBy`  varchar(200)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`idInstitution`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for topic 
--

INSERT INTO topic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , name
  , description
  , idParentTopic
  , idLab
  , createdBy
  , createDate
  , idAppUser
  , codeVisibility
  , idInstitution )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idTopic
  , name
  , description
  , idParentTopic
  , idLab
  , createdBy
  , createDate
  , idAppUser
  , codeVisibility
  , idInstitution
  FROM topic
  WHERE NOT EXISTS(SELECT * FROM topic_Audit)
$$

--
-- Audit Triggers For topic 
--


CREATE TRIGGER TrAI_topic_FER AFTER INSERT ON topic FOR EACH ROW
BEGIN
  INSERT INTO topic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , name
  , description
  , idParentTopic
  , idLab
  , createdBy
  , createDate
  , idAppUser
  , codeVisibility
  , idInstitution )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.name
  , NEW.description
  , NEW.idParentTopic
  , NEW.idLab
  , NEW.createdBy
  , NEW.createDate
  , NEW.idAppUser
  , NEW.codeVisibility
  , NEW.idInstitution );
END;
$$


CREATE TRIGGER TrAU_topic_FER AFTER UPDATE ON topic FOR EACH ROW
BEGIN
  INSERT INTO topic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , name
  , description
  , idParentTopic
  , idLab
  , createdBy
  , createDate
  , idAppUser
  , codeVisibility
  , idInstitution )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idTopic
  , NEW.name
  , NEW.description
  , NEW.idParentTopic
  , NEW.idLab
  , NEW.createdBy
  , NEW.createDate
  , NEW.idAppUser
  , NEW.codeVisibility
  , NEW.idInstitution );
END;
$$


CREATE TRIGGER TrAD_topic_FER AFTER DELETE ON topic FOR EACH ROW
BEGIN
  INSERT INTO topic_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTopic
  , name
  , description
  , idParentTopic
  , idLab
  , createdBy
  , createDate
  , idAppUser
  , codeVisibility
  , idInstitution )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idTopic
  , OLD.name
  , OLD.description
  , OLD.idParentTopic
  , OLD.idLab
  , OLD.createdBy
  , OLD.createDate
  , OLD.idAppUser
  , OLD.codeVisibility
  , OLD.idInstitution );
END;
$$


--
-- Audit Table For treatmententry 
--

CREATE TABLE IF NOT EXISTS `treatmententry_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idTreatmentEntry`  int(10)  NULL DEFAULT NULL
 ,`treatment`  varchar(2000)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`otherLabel`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for treatmententry 
--

INSERT INTO treatmententry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTreatmentEntry
  , treatment
  , idSample
  , otherLabel )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idTreatmentEntry
  , treatment
  , idSample
  , otherLabel
  FROM treatmententry
  WHERE NOT EXISTS(SELECT * FROM treatmententry_Audit)
$$

--
-- Audit Triggers For treatmententry 
--


CREATE TRIGGER TrAI_treatmententry_FER AFTER INSERT ON treatmententry FOR EACH ROW
BEGIN
  INSERT INTO treatmententry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTreatmentEntry
  , treatment
  , idSample
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idTreatmentEntry
  , NEW.treatment
  , NEW.idSample
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAU_treatmententry_FER AFTER UPDATE ON treatmententry FOR EACH ROW
BEGIN
  INSERT INTO treatmententry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTreatmentEntry
  , treatment
  , idSample
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idTreatmentEntry
  , NEW.treatment
  , NEW.idSample
  , NEW.otherLabel );
END;
$$


CREATE TRIGGER TrAD_treatmententry_FER AFTER DELETE ON treatmententry FOR EACH ROW
BEGIN
  INSERT INTO treatmententry_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idTreatmentEntry
  , treatment
  , idSample
  , otherLabel )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idTreatmentEntry
  , OLD.treatment
  , OLD.idSample
  , OLD.otherLabel );
END;
$$


--
-- Audit Table For unloaddatatrack 
--

CREATE TABLE IF NOT EXISTS `unloaddatatrack_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idUnloadDataTrack`  int(10)  NULL DEFAULT NULL
 ,`typeName`  varchar(2000)  NULL DEFAULT NULL
 ,`idAppUser`  int(10)  NULL DEFAULT NULL
 ,`idGenomeBuild`  int(10)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for unloaddatatrack 
--

INSERT INTO unloaddatatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idUnloadDataTrack
  , typeName
  , idAppUser
  , idGenomeBuild )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idUnloadDataTrack
  , typeName
  , idAppUser
  , idGenomeBuild
  FROM unloaddatatrack
  WHERE NOT EXISTS(SELECT * FROM unloaddatatrack_Audit)
$$

--
-- Audit Triggers For unloaddatatrack 
--


CREATE TRIGGER TrAI_unloaddatatrack_FER AFTER INSERT ON unloaddatatrack FOR EACH ROW
BEGIN
  INSERT INTO unloaddatatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idUnloadDataTrack
  , typeName
  , idAppUser
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idUnloadDataTrack
  , NEW.typeName
  , NEW.idAppUser
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAU_unloaddatatrack_FER AFTER UPDATE ON unloaddatatrack FOR EACH ROW
BEGIN
  INSERT INTO unloaddatatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idUnloadDataTrack
  , typeName
  , idAppUser
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idUnloadDataTrack
  , NEW.typeName
  , NEW.idAppUser
  , NEW.idGenomeBuild );
END;
$$


CREATE TRIGGER TrAD_unloaddatatrack_FER AFTER DELETE ON unloaddatatrack FOR EACH ROW
BEGIN
  INSERT INTO unloaddatatrack_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idUnloadDataTrack
  , typeName
  , idAppUser
  , idGenomeBuild )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idUnloadDataTrack
  , OLD.typeName
  , OLD.idAppUser
  , OLD.idGenomeBuild );
END;
$$


--
-- Audit Table For userpermissionkind 
--

CREATE TABLE IF NOT EXISTS `userpermissionkind_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeUserPermissionKind`  varchar(10)  NULL DEFAULT NULL
 ,`userPermissionKind`  varchar(50)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for userpermissionkind 
--

INSERT INTO userpermissionkind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeUserPermissionKind
  , userPermissionKind
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeUserPermissionKind
  , userPermissionKind
  , isActive
  FROM userpermissionkind
  WHERE NOT EXISTS(SELECT * FROM userpermissionkind_Audit)
$$

--
-- Audit Triggers For userpermissionkind 
--


CREATE TRIGGER TrAI_userpermissionkind_FER AFTER INSERT ON userpermissionkind FOR EACH ROW
BEGIN
  INSERT INTO userpermissionkind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeUserPermissionKind
  , userPermissionKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeUserPermissionKind
  , NEW.userPermissionKind
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_userpermissionkind_FER AFTER UPDATE ON userpermissionkind FOR EACH ROW
BEGIN
  INSERT INTO userpermissionkind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeUserPermissionKind
  , userPermissionKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeUserPermissionKind
  , NEW.userPermissionKind
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_userpermissionkind_FER AFTER DELETE ON userpermissionkind FOR EACH ROW
BEGIN
  INSERT INTO userpermissionkind_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeUserPermissionKind
  , userPermissionKind
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeUserPermissionKind
  , OLD.userPermissionKind
  , OLD.isActive );
END;
$$


--
-- Audit Table For vendor 
--

CREATE TABLE IF NOT EXISTS `vendor_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idVendor`  int(10)  NULL DEFAULT NULL
 ,`vendorName`  varchar(100)  NULL DEFAULT NULL
 ,`description`  varchar(100)  NULL DEFAULT NULL
 ,`isActive`  char(1)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for vendor 
--

INSERT INTO vendor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idVendor
  , vendorName
  , description
  , isActive )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idVendor
  , vendorName
  , description
  , isActive
  FROM vendor
  WHERE NOT EXISTS(SELECT * FROM vendor_Audit)
$$

--
-- Audit Triggers For vendor 
--


CREATE TRIGGER TrAI_vendor_FER AFTER INSERT ON vendor FOR EACH ROW
BEGIN
  INSERT INTO vendor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idVendor
  , vendorName
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idVendor
  , NEW.vendorName
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAU_vendor_FER AFTER UPDATE ON vendor FOR EACH ROW
BEGIN
  INSERT INTO vendor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idVendor
  , vendorName
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idVendor
  , NEW.vendorName
  , NEW.description
  , NEW.isActive );
END;
$$


CREATE TRIGGER TrAD_vendor_FER AFTER DELETE ON vendor FOR EACH ROW
BEGIN
  INSERT INTO vendor_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idVendor
  , vendorName
  , description
  , isActive )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idVendor
  , OLD.vendorName
  , OLD.description
  , OLD.isActive );
END;
$$


--
-- Audit Table For visibility 
--

CREATE TABLE IF NOT EXISTS `visibility_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`codeVisibility`  varchar(10)  NULL DEFAULT NULL
 ,`visibility`  varchar(100)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for visibility 
--

INSERT INTO visibility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeVisibility
  , visibility )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , codeVisibility
  , visibility
  FROM visibility
  WHERE NOT EXISTS(SELECT * FROM visibility_Audit)
$$

--
-- Audit Triggers For visibility 
--


CREATE TRIGGER TrAI_visibility_FER AFTER INSERT ON visibility FOR EACH ROW
BEGIN
  INSERT INTO visibility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeVisibility
  , visibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.codeVisibility
  , NEW.visibility );
END;
$$


CREATE TRIGGER TrAU_visibility_FER AFTER UPDATE ON visibility FOR EACH ROW
BEGIN
  INSERT INTO visibility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeVisibility
  , visibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.codeVisibility
  , NEW.visibility );
END;
$$


CREATE TRIGGER TrAD_visibility_FER AFTER DELETE ON visibility FOR EACH ROW
BEGIN
  INSERT INTO visibility_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , codeVisibility
  , visibility )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.codeVisibility
  , OLD.visibility );
END;
$$


--
-- Audit Table For workitem 
--

CREATE TABLE IF NOT EXISTS `workitem_Audit` (
  `AuditAppuser`       varchar(128) NOT NULL
 ,`AuditOperation`     char(1)      NOT NULL
 ,`AuditSystemUser`    varchar(30)  NOT NULL
 ,`AuditOperationDate` datetime     NOT NULL
 ,`idWorkItem`  int(10)  NULL DEFAULT NULL
 ,`codeStepNext`  varchar(10)  NULL DEFAULT NULL
 ,`idSample`  int(10)  NULL DEFAULT NULL
 ,`idLabeledSample`  int(10)  NULL DEFAULT NULL
 ,`idHybridization`  int(10)  NULL DEFAULT NULL
 ,`idRequest`  int(10)  NULL DEFAULT NULL
 ,`createDate`  datetime  NULL DEFAULT NULL
 ,`idSequenceLane`  int(10)  NULL DEFAULT NULL
 ,`idFlowCellChannel`  int(10)  NULL DEFAULT NULL
 ,`idCoreFacility`  int(10)  NULL DEFAULT NULL
 ,`status`  varchar(50)  NULL DEFAULT NULL
) ENGINE=InnoDB
$$


--
-- Initial audit table rows for workitem 
--

INSERT INTO workitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idWorkItem
  , codeStepNext
  , idSample
  , idLabeledSample
  , idHybridization
  , idRequest
  , createDate
  , idSequenceLane
  , idFlowCellChannel
  , idCoreFacility
  , status )
  SELECT
  'No Context'
  , 'L'
  , USER()
  , NOW()
  , idWorkItem
  , codeStepNext
  , idSample
  , idLabeledSample
  , idHybridization
  , idRequest
  , createDate
  , idSequenceLane
  , idFlowCellChannel
  , idCoreFacility
  , status
  FROM workitem
  WHERE NOT EXISTS(SELECT * FROM workitem_Audit)
$$

--
-- Audit Triggers For workitem 
--


CREATE TRIGGER TrAI_workitem_FER AFTER INSERT ON workitem FOR EACH ROW
BEGIN
  INSERT INTO workitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idWorkItem
  , codeStepNext
  , idSample
  , idLabeledSample
  , idHybridization
  , idRequest
  , createDate
  , idSequenceLane
  , idFlowCellChannel
  , idCoreFacility
  , status )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'I'
  , USER()
  , NOW()
  , NEW.idWorkItem
  , NEW.codeStepNext
  , NEW.idSample
  , NEW.idLabeledSample
  , NEW.idHybridization
  , NEW.idRequest
  , NEW.createDate
  , NEW.idSequenceLane
  , NEW.idFlowCellChannel
  , NEW.idCoreFacility
  , NEW.status );
END;
$$


CREATE TRIGGER TrAU_workitem_FER AFTER UPDATE ON workitem FOR EACH ROW
BEGIN
  INSERT INTO workitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idWorkItem
  , codeStepNext
  , idSample
  , idLabeledSample
  , idHybridization
  , idRequest
  , createDate
  , idSequenceLane
  , idFlowCellChannel
  , idCoreFacility
  , status )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'U'
  , USER()
  , NOW()
  , NEW.idWorkItem
  , NEW.codeStepNext
  , NEW.idSample
  , NEW.idLabeledSample
  , NEW.idHybridization
  , NEW.idRequest
  , NEW.createDate
  , NEW.idSequenceLane
  , NEW.idFlowCellChannel
  , NEW.idCoreFacility
  , NEW.status );
END;
$$


CREATE TRIGGER TrAD_workitem_FER AFTER DELETE ON workitem FOR EACH ROW
BEGIN
  INSERT INTO workitem_Audit
  ( AuditAppuser
  , AuditOperation
  , AuditSystemUser
  , AuditOperationDate
  , idWorkItem
  , codeStepNext
  , idSample
  , idLabeledSample
  , idHybridization
  , idRequest
  , createDate
  , idSequenceLane
  , idFlowCellChannel
  , idCoreFacility
  , status )
  VALUES
  ( CASE WHEN @userName IS NULL THEN 'No Context' else @userName end
  , 'D'
  , USER()
  , NOW()
  , OLD.idWorkItem
  , OLD.codeStepNext
  , OLD.idSample
  , OLD.idLabeledSample
  , OLD.idHybridization
  , OLD.idRequest
  , OLD.createDate
  , OLD.idSequenceLane
  , OLD.idFlowCellChannel
  , OLD.idCoreFacility
  , OLD.status );
END;
$$
