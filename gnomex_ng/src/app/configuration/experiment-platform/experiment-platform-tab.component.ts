import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs/Subscription";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ConstantsService} from "../../services/constants.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GnomexService} from "../../services/gnomex.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ImportSegmentsDialog} from "../../datatracks/datatracks-overview/genome-build/import-segments-dialog";
import {SortOrderDialogComponent} from "./sort-order-dialog.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {numberRange} from "../../util/validators/number-range-validator";
import {PropertyService} from "../../services/property.service";
//assets/page_add.png

@Component({
    selector: 'experiment-platform-tab',
    templateUrl: './experiment-platform-tab.component.html',
    styles:[`
        mat-form-field.medium-form-input{
            width: 30em;
        }
        .padded-checkbox{
            padding: 1em;
        }
        .partial-padded-checkbox{
            padding-top:1em;
            padding-bottom:1em;
            padding-right:1em;
        }

        .margin-right-field{
            margin-right: 2em;
        }
    `]
})

export class ExperimentPlatformTabComponent implements OnInit, OnDestroy{
    public formGroup: FormGroup;
    private expPlatformSubscription: Subscription;
    private expPlatformNode:any;
    private name:string;
    public state:any;
    public typeList: any[] = [];
    public iconList: any[] = [];
    public coreFacilityList: any[]= [];
    public vendorList:any[] = [];
    public showNote:boolean = false;
    public showOrganism:boolean = false;
    public showVendor:boolean = false;
    public showChannels:boolean = false;
    public showProductDetails:boolean = false;
    private createSortOrderDialog: MatDialogRef<SortOrderDialogComponent>;
    public channelLabel:string;
    public channelMax:number = 1;
    public productTypeList: any[] = [];
    public productStatusList:any[] = [];
    public organismList:any[]=[];
    public securityLabel:string;
    public isMinorSecurity:boolean;



    constructor(private fb:FormBuilder, private expPlatformService:ExperimentPlatformService,
                private dictionaryService:DictionaryService, private constService:ConstantsService,
                private secAdvisor:CreateSecurityAdvisorService, private gnomexService:GnomexService,
                private dialog: MatDialog, private dialogService: DialogsService){

    }

    ngOnInit(){

        this.name = this.constructor.name;
        this.formGroup = this.fb.group({
            name:['',Validators.required ],
            type:'',
            active: false,
            associateAnalysis:'',
            requireNameDescipt:'',
            code: [{value:'', disabled:true }],
            icon: '',
            coreFacility: '',
            notes:'',
            vendor:'',
            organisms:'',
            sortOrder: ['',numberRange(0,99)],
            isInternal: '',
            isExternal: '',
            numberOfChannels:'',
            sampleBatchSize:['',numberRange(0,100000)],
            customWarningMessage:'',
            organism:'',
            useProduct: false,
            productType: '',
            noProductsMessage:'',
            productStatus: '',
            saveAndSubmit: ''

        });

        this.typeList =  this.dictionaryService.getEntries(DictionaryService.REQUEST_CATEGORY_TYPE);
        this.vendorList = this.dictionaryService.getEntries(DictionaryService.VENDOR);
        this.organismList = this.dictionaryService.getEntries(DictionaryService.ORGANISM);

        this.iconList = this.constService.EXP_ICON_LIST;
        this.coreFacilityList = this.secAdvisor.coreFacilitiesICanManage;
        this.productStatusList = this.dictionaryService.getEntries(DictionaryService.REQUEST_STATUS);

        console.log("name: " + this.name);
        this.expPlatformSubscription = this.expPlatformService.getExperimentPlatformObservable()
            .subscribe(data =>{


                this.expPlatformNode = data;
                let sampleBatchWarningMessage = this.gnomexService
                    .getRequestCategoryProperty(data.idCoreFacility,data.codeRequestCategory, PropertyService.PROPERTY_SAMPLE_BATCH_WARNING);
                let requireNameStr:string = this.gnomexService
                    .getRequestCategoryProperty(data.idCoreFacility,data.codeRequestCategory, PropertyService.PROPERTY_DESCRIPTION_NAME_MANDATORY_FOR_INTERNAL_EXPERIMENTS);

                //this.state = this.expPlatformService.getState(data.value, this.name );
                this.formGroup.get('name').setValue(data.requestCategory);
                this.formGroup.get('type').setValue(data.type);
                this.formGroup.get('active').setValue(data && data.isActive === 'Y');
                this.formGroup.get('associateAnalysis').setValue(data && data.associatedWithAnalysis === 'Y');
                this.formGroup.get('requireNameDescipt').setValue(requireNameStr && requireNameStr === 'Y');
                this.formGroup.get('code').setValue(data.codeRequestCategory);
                this.formGroup.get('icon').setValue(data.icon);
                this.formGroup.get('coreFacility').setValue(data.idCoreFacility);
                this.formGroup.get('notes').setValue(data.notes);
                this.formGroup.get('isInternal').setValue(data && data.isInternal === 'Y');
                this.formGroup.get('isExternal').setValue(data && data.isExternal === 'Y');
                this.formGroup.get('sortOrder').setValue(data.sortOrder);
                this.formGroup.get('numberOfChannels').setValue(data.numberOfChannels);
                this.formGroup.get('sampleBatchSize').setValue(data.sampleBatchSize);
                this.formGroup.get('customWarningMessage').setValue(sampleBatchWarningMessage);
                this.formGroup.get('organism').setValue(data.idOrganism);
                this.formGroup.get('useProduct').setValue(data.idProductType != '');
                this.formGroup.get('productType').setValue(data.idProductType);
                this.formGroup.get('noProductsMessage').setValue(data.noProductsMessage);


                this.setSecurityLabel();
                this.setChannelLabel();
                this.showExpPlatformFields();
                this.filterProjectTypeList();
                this.updateProductStatus();
                this.setSaveAndSubmit();

                this.formGroup.markAsPristine();
                this.formGroup.markAsUntouched();
            });


    }


    showExpPlatformFields(){
        this.showNote =  this.showFieldByProperty(this.constService.PROPERTY_EXPERIMENT_PLATFORM_HIDE_NOTES);
        this.showOrganism =  this.showFieldByProperty(this.constService.PROPERTY_EXPERIMENT_PLATFORM_HIDE_ORGANISM);
        this.showVendor = this.showFieldByProperty(this.constService.PROPERTY_EXPERIMENT_PLATFORM_HIDE_VENDOR);
        this.showProductDetails = this.formGroup.get('useProduct').value;
    }
    showFieldByProperty(propertyName:string): boolean {
        let val:String = 'N';
        if (this.formGroup.get("coreFacility").value) {
            val = this.gnomexService.getCoreFacilityProperty(this.formGroup.get("coreFacility").value, propertyName);
        }
        if (val == 'Y') {
            return false;
        } else {
            return true;
        }

    }
    editSortOrder(){
        if(this.formGroup.dirty){
            this.dialogService.alert("Please save changes before editing sort order across platforms.")
        }else{
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.data = {
                idCoreFacility: this.expPlatformNode.idCoreFacility
            };

            this.createSortOrderDialog = this.dialog.open(SortOrderDialogComponent, configuration);

        }

    }



    compareByID(reqCatOne, reqCatTwo) { // reqCatTwo is the str don't have object
        return reqCatOne && reqCatTwo &&  reqCatOne.value === reqCatTwo;
    }

    private  setSecurityLabel():void {
        let prepSecurityLabel = "";
        this.isMinorSecurity = false;
        if (this.expPlatformNode.isClinicalResearch == 'Y') {
            this.isMinorSecurity = false;
            prepSecurityLabel = "Clinical Security enforced by cc number";
        }
        if (this.expPlatformNode.isOwnerOnly == 'Y') {
            if (prepSecurityLabel) {
                prepSecurityLabel += ", ";
            }
            prepSecurityLabel = "Owner only visibility enforced for this category";
        }
        if (prepSecurityLabel === "") {
            this.isMinorSecurity = true;
            prepSecurityLabel = "Standard Research and Development Security";
        }
        this.securityLabel = "Security Note: " + prepSecurityLabel;
    }


    setChannelLabel(){
        let selectedType = this.formGroup.get("type").value;
        this.channelLabel = this.expPlatformService.isIllumina ? " Number of Lanes on Flowcell " : "Number of channels";
        if(this.expPlatformService.isIllumina){
            this.channelLabel = "Number of Lanes on Flowcell";
            this.channelMax = 8;
        }else{
            this.channelLabel = "Number of channels";
            this.channelMax = 2;
        }

        if(selectedType.hasChannels){
            this.showChannels = selectedType.hasChannels  === 'Y';
        }else{
            let typeObj = null;
            for(let i = 0; i< this.typeList.length; i++){
                if(this.typeList[i].value === selectedType){
                    typeObj = this.typeList[i];
                    break;
                }
            }
            this.showChannels = typeObj ? typeObj.hasChannels === 'Y' : false;
        }

    }


    filterProjectTypeList(){
        let filterProductList:any[] = this.dictionaryService.getEntries(DictionaryService.PRODUCT_TYPE);
        let idCoreFacility = this.formGroup.get("coreFacility").value;
        filterProductList = filterProductList.filter(p => p.idCoreFacility === idCoreFacility);
        this.productTypeList = filterProductList;
    }


    onTypeChanged(event:any):void{
        let selectedType:any = this.formGroup.get('type').value;
        if(selectedType){
            this.formGroup.get('icon').setValue(selectedType.defaultIcon);
            this.expPlatformService.selectedType = selectedType;
        }

        this.setChannelLabel();
        this.expPlatformService.emitExperimentPlatformTypeChange(selectedType);

    }
    onUseProducts(){
        if(this.formGroup.get("useProduct").value) {
            this.updateProductType();
            this.updateProductStatus();
        }
    }
    setSaveAndSubmit(){
        let isSaveAndSubmitStr = this.gnomexService
            .getRequestCategoryProperty(this.expPlatformNode.idCoreFacility,this.expPlatformNode.codeRequestCategory,PropertyService.PROPERTY_NEW_REQUEST_SAVE_BEFORE_SUBMIT);
        this.formGroup.get('saveAndSubmit').setValue(isSaveAndSubmitStr && isSaveAndSubmitStr === 'Y');
    }


    updateProductType(){

        let idCoreFacility = this.formGroup.get("coreFacility").value;
        let codeReqCategory = this.formGroup.get("code").value;
        let noProductsMessage = this.gnomexService.getRequestCategoryProperty(idCoreFacility, codeReqCategory,PropertyService.PROPERTY_NO_PRODUCTS_MESSAGE);
        this.formGroup.get("noProductsMessage").setValue(noProductsMessage);


    }


    updateProductStatus(){
        let found:boolean = false;
        let codeRequestStatus = this.gnomexService
            .getRequestCategoryProperty(this.expPlatformNode.idCoreFacility, this.expPlatformNode.codeRequestCategory, PropertyService.PROPERTY_STATUS_TO_USE_PRODUCTS);
        if(codeRequestStatus){
            for(let i = 0; i < this.productStatusList.length; i++){
                if(this.productStatusList[i].codeRequestStatus === codeRequestStatus){
                    found = true;
                    break;
                }
            }
        }

        if(found){
            this.formGroup.get('productStatus').setValue(codeRequestStatus);
        }else{
            this.formGroup.get('productStatus').setValue("SUBMITTED");
        }

    }



    onCoreChanged(event:any):void{
        this.showExpPlatformFields();
        this.filterProjectTypeList();
        this.updateProductType();
        this.updateProductStatus();
        this.setSaveAndSubmit();

    }


    ngOnDestroy(){
        console.log("The component is being destroyed: " + this.name);
        this.expPlatformSubscription.unsubscribe();
    }




}
