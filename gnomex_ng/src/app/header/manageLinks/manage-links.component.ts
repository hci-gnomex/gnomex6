
import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output} from "@angular/core";
import {FormBuilder } from "@angular/forms"
import {Subscription} from "rxjs";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {GridOptions, RowDataChangedEvent} from "ag-grid-community/main";
import {URLSearchParams} from "@angular/http"
import {LaunchPropertiesService} from "../../services/launch-properites.service";
import {MatDialogRef} from "@angular/material";

@Component({
    templateUrl: "./manage-links.component.html",
})
export class ManageLinksComponent implements OnInit{
    private getFAQSubscription: Subscription;
    private saveFAQSubscription: Subscription;
    private coreList:Array<any>;
    public dirty: boolean = false;
    private gridOptions:GridOptions = {};
    private rowSelection;
    private columnDefs;
    private  displayModelFormatter = (params)=>  {
        if(params.value){
            let display =  (<string>params.value).split(',');
            return display[0];
        }
        return '';
    };

    private valueChanging = (params):boolean => {
        let rowData = params.   data;
        let field = params.colDef.field;


        if(params.newValue !== params.oldValue){
            rowData.isDirty='Y';
            this.dirty = true;
            if (field === 'coreString') {
                rowData['idCoreFacility'] = params.newValue.substring(params.newValue.indexOf(',')+1, params.newValue.length);
            }
            rowData[field] = params.newValue;

            return true;
        }
        return false;
    };


    rowData:Array<any> =[];

    constructor(public dialogRef: MatDialogRef<ManageLinksComponent>,
                protected fb: FormBuilder,
                private secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService,
                private launchPropertiesService: LaunchPropertiesService) {
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
        let params: URLSearchParams = new URLSearchParams();
        this.coreList = this.secAdvisor.myCoreFacilities;

        this.getFAQSubscription = this.launchPropertiesService.getFAQ().subscribe((response: any[]) => {
            console.log("subscribe createSecurityAdvisor");

            response.forEach(faq => {
                this.setCoreFacility(faq);
            })
            this.rowData = response;
        });

    }

    setCoreFacility(reqObj: any): void{
        let coreObj = this.coreList.find(core => core.value === reqObj.idCoreFacility);
        reqObj["coreString"] = coreObj.display;
    }

    dataChanged(): void {
    }

    onGridReady(params) {
        this.gridOptions.api.sizeColumnsToFit();

    }

    save():void{
        let faqCollection: 'FAQ';
        for (let faq of this.rowData) {
            if (faq.title === '' || faq.url === '') {
                this.dialogService.confirm("Please enter both title and URL for each item before proceeding.", null);
                return;
            }
        }
        let params: URLSearchParams = new URLSearchParams();
        let stringifiedFaqCollection = JSON.stringify(this.rowData);


        params.set("faqXMLString", stringifiedFaqCollection);
        this.saveFAQSubscription = this.launchPropertiesService.saveFAQ(params).subscribe((response: Response) => {
            setTimeout(() =>this.dialogRef.close());
        });
    }

    new() {
        let newRecord = {idFAQ: 0, coreString: '', title: 'Insert title', url: 'http://', idCoreFacility: 0};
        this.rowData.push(newRecord);

        this.gridOptions.api.setRowData(this.rowData);
        this.dirty = true;

    }

    delete() {
        let selected = this.gridOptions.api.getFocusedCell();
        this.rowData.splice(selected.rowIndex, 1);
        this.gridOptions.api.setRowData(this.rowData);
        this.dirty = true;
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




