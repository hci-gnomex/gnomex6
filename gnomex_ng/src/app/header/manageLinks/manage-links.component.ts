import {Component, OnInit} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {Subscription} from "rxjs";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {GridOptions} from "ag-grid-community/main";
import {HttpParams} from "@angular/common/http";
import {LaunchPropertiesService} from "../../services/launch-properites.service";
import {MatDialogRef} from "@angular/material";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {ConstantsService} from "../../services/constants.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";

@Component({
    template: `
        <div class="flex-container-col full-height full-width padded">
            <div class="flex-container-row justify-flex-end padded-top-bottom">
                <button mat-button (click)="new()"><img class="icon" [src]="this.constService.ICON_GREEN_BULLET">New</button>
                <button mat-button [disabled]="selectedRow.length === 0" (click)="delete()"><img class="icon" [src]="this.constService.ICON_RED_BULLET">Delete</button>
            </div>
            <div class="full-width full-height">
                <ag-grid-angular style="width: 100%; height: 40em;" class="ag-theme-fresh"
                                 [gridOptions]="gridOptions"
                                 [rowData]="rowData"
                                 [columnDefs]="columnDefs"
                                 [rowSelection]="rowSelection"
                                 (rowSelected)="onRowSelected($event)"
                                 (gridReady)="onGridReady($event)"
                                 (rowDataChanged)="dataChanged()"
                                 [enableSorting]="true"
                                 [enableColResize]="true">
                </ag-grid-angular>
            </div>
        </div>
    `,
})
export class ManageLinksComponent extends BaseGenericContainerDialog implements OnInit{
    public gridOptions: GridOptions = {};
    public rowSelection;
    public selectedRow: any[] = [];
    public columnDefs;
    rowData: Array<any> = [];
    private getFAQSubscription: Subscription;
    private saveFAQSubscription: Subscription;
    private coreList: Array<any>;
    private  displayModelFormatter = (params) =>  {
        if(params.value) {
            let display =  (<string>params.value).split(",");
            return display[0];
        }
        return "";
    }

    private valueChanging = (params): boolean => {
        let rowData = params.   data;
        let field = params.colDef.field;


        if(params.newValue !== params.oldValue){
            rowData.isDirty = "Y";
            this.dirty = () => true;
            if (field === "coreString") {
                rowData["idCoreFacility"] = params.newValue.substring(params.newValue.indexOf(",") + 1, params.newValue.length);
            }
            rowData[field] = params.newValue;

            return true;
        }
        return false;
    }


    constructor(public dialogRef: MatDialogRef<ManageLinksComponent>,
                protected fb: FormBuilder,
                private secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService,
                private launchPropertiesService: LaunchPropertiesService,
                public constService: ConstantsService) {
        super();
        this.columnDefs = [
            {
                headerName: "Title",
                editable: true,
                field: "title",
                width: 280,
                valueSetter: this.valueChanging
            },
            {
                headerName: "URL",
                editable: true,
                field: "url",
                width: 300,
                valueSetter: this.valueChanging
            },
            {
                headerName:  "Core Facility",
                field: "coreString",
                editable: true,
                width: 290,
                cellEditor: 'select',
                cellEditorParams: {
                    values: this.buildCoreList()
                },
                valueFormatter: this.displayModelFormatter,
                valueSetter: this.valueChanging
            }

        ];

        this.rowSelection = "single";
    }

    ngOnInit(){
        if(!this.coreList) {
            this.coreList = this.secAdvisor.myCoreFacilities;
        }

        this.getFAQSubscription = this.launchPropertiesService.getFAQ().subscribe((response: any[]) => {
            console.log("subscribe createSecurityAdvisor");

            response.forEach(faq => {
                this.setCoreFacility(faq);
            });
            this.rowData = response;
        }, (err: IGnomexErrorResponse) => {
        });

    }

    setCoreFacility(reqObj: any): void{
        let coreObj = this.coreList.find(core => core.value === reqObj.idCoreFacility);
        reqObj["coreString"] = coreObj ? coreObj.display : "";
    }

    dataChanged(): void {
    }

    onGridReady(params) {
        this.gridOptions.api.sizeColumnsToFit();

    }
    onRowSelected(event: any) {
        this.selectedRow = this.gridOptions.api.getSelectedRows();
    }

    save():void{
        let faqCollection: 'FAQ';
        for (let faq of this.rowData) {
            if (faq.title === '' || faq.url === '') {
                this.dialogService.alert("Please enter both title and URL for each item before proceeding.", null, DialogType.VALIDATION);
                return;
            }
        }
        let params: HttpParams = new HttpParams();
        let stringifiedFaqCollection = JSON.stringify(this.rowData);


        params = params.set("faqXMLString", stringifiedFaqCollection);
        this.saveFAQSubscription = this.launchPropertiesService.saveFAQ(params).subscribe((response: any) => {
            setTimeout(() => this.dialogRef.close(this.dirty));
        }, (err: IGnomexErrorResponse) => {
        });
    }

    new() {
        let newRecord = {idFAQ: 0, coreString: '', title: 'Insert title', url: 'http://', idCoreFacility: 0};
        this.rowData.push(newRecord);

        this.gridOptions.api.setRowData(this.rowData);
        this.dirty = () => true;

    }

    delete() {
        let selected = this.gridOptions.api.getFocusedCell();
        this.rowData.splice(selected.rowIndex, 1);
        this.gridOptions.api.setRowData(this.rowData);
        this.dirty = () => true;
    }

    buildCoreList():Array<string>{

        if(!this.coreList){
            this.coreList= this.secAdvisor.myCoreFacilities;
        }
        let coreDisplays = [];
        if(this.coreList){
            let newRecord = {value: -1,display: 'All Facilities', idCoreFacility: -1, facilityName: 'All Facilities'};
            this.coreList.push(newRecord);
            for(let cObj of this.coreList){
                coreDisplays.push(cObj.display +  "," + cObj.value );
            }
            return coreDisplays;
        }
        return coreDisplays;

    }

    ngOnDestroy():void{
        this.getFAQSubscription.unsubscribe();
        if (this.saveFAQSubscription) {
            this.saveFAQSubscription.unsubscribe();
        }
    }

}




