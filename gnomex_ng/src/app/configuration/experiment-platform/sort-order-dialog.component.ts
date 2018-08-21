/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {HttpParams} from "@angular/common/http";
import {GridApi} from "ag-grid";
import {DialogsService} from "../../util/popup/dialogs.service";

@Component({
    templateUrl:'./sort-order-dialog.component.html',
    styles:[`

    `]

})

export class SortOrderDialogComponent implements OnInit{
    private idCoreFacility: string;
    private gridApi:GridApi;
    private sortOrderList:any[] = [];
    public showSpinner:boolean = false;
    public isDirty:boolean = false;



    sortFn= (obj1:any , obj2:any) =>{
        if (!obj1 && !obj2 ) {
            return 0;
        } else if (!obj1) {
            return 1;
        } else if (!obj2) {
            return -1;
        } else {
            let s1:number = +obj1.sortOrder;
            let s2:number = +obj2.sortOrder;
            if (s1 < s2) {
                return -1;
            } else if (s1 > s2) {
                return 1;
            } else {
                let rc1:String = obj1.requestCategory;
                let rc2:String = obj2.requestCategory;
                if (rc1 < rc2) {
                    return -1;
                } else if (rc1 > rc2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }

    };

    private numberParser(params){
        if(Number.isNaN(params.newValue)){
            return '';
        }
        if(params.newValue >= 0 && params.newValue < 100 ){
            return params.newValue;
        }else{
            return '';
        }
    }



    public columnDefs = [
        {
            headerName: "Sort Order",
            field: "sortOrder",
            width: 150,
            editable: true,
            valueParser: this.numberParser


        },
        {
            headerName: "Experiment Type",
            field: "requestCategory",
            width: 400,
            editable: false
        }


    ];

    public rowData = [];


    constructor(private dialogRef: MatDialogRef<SortOrderDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private dialogService:DialogsService) {
        this.idCoreFacility = data.idCoreFacility;


    }

    ngOnInit(){
        this.expPlatformService.getExperimentPlatformSortOrderList(new HttpParams().set('idCoreFacility',this.idCoreFacility))
            .subscribe(resp => {
                if(resp && !resp.message ){
                    this.sortOrderList = Array.isArray(resp)? resp : [resp];
                    this.rowData = this.sortOrderList;
                    this.rowData.sort(this.sortFn);

                }else if(resp && resp.message) {
                    this.dialogService.alert(resp.message);
                }
            })



    }
    onGridReady(params){
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.gridApi.setRowData(this.rowData);
    }
    onGridSizeChanged(params){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }

    cellValueChanged($event){
        this.rowData.sort(this.sortFn);
        this.gridApi.setRowData(this.rowData);
        this.isDirty = true;
    }

    refresh(){
        this.dialogService.confirm("Discard changes",
            "Refreshing will discard your changes.  Do want to discard your changes?" )
            .subscribe((answer:boolean) =>{
                if(answer){
                    this.expPlatformService.getExperimentPlatformSortOrderList(new HttpParams().set('idCoreFacility',this.idCoreFacility)).
                        first().subscribe(resp => {
                            if(resp && !resp.message ){
                                this.sortOrderList = Array.isArray(resp)? resp : [resp];
                                this.rowData = this.sortOrderList;
                                this.rowData.sort(this.sortFn);
                                this.gridApi.setRowData(this.rowData);
                                this.isDirty = false;

                            }else if(resp && resp.message) {
                                this.dialogService.alert(resp.message);
                            }
                        });
                }
            });
    }



    save() {
        this.showSpinner = true;
        let reqCategoriesJSONStr:string = JSON.stringify( this.rowData);

        let params:HttpParams = new HttpParams()
            .set('requestCategoriesJSONString', reqCategoriesJSONStr)
            .set('noJSONToXMLConversionNeeded',"Y");
        this.expPlatformService.saveExperimentPlatformSortOrderList(params)
            .subscribe(resp =>{
                if(resp && resp.result && resp.result === "SUCCESS"){
                    this.showSpinner = false;
                    this.isDirty = false;
                    this.expPlatformService.getExperimentPlatformList_fromBackend();
                }else if(resp && resp.message){
                    this.dialogService.alert(resp.message);
                }
            })
    }

}
