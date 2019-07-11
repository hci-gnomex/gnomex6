import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {GnomexService} from "../../services/gnomex.service";
import {HttpParams} from "@angular/common/http";
import {AnalysisService} from "../../services/analysis.service";
import {GridApi} from "ag-grid-community";
import {ConstantsService} from "../../services/constants.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {GDAction} from "../../util/interfaces/generic-dialog-action.model";


@Component({
    templateUrl:'./link-to-experiment-dialog.component.html',
    styles:[`
        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;
            
        }


    `]

})

export class LinkToExperimentDialogComponent extends BaseGenericContainerDialog implements OnInit{
    public gridApi:GridApi;
    private idAnalysis:string;
    private idLab:string;
    private labList:Array<any> = [];
    public selectedAnalysisToLink:any[] =[];
    public showSpinner:boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;

    public labControl: FormControl;
    public numberControl:FormControl;

    public columnDefs = [
        {
            headerName: "Experiment",
            field: "name",
            width: 350

        },
        {
            headerName: "Number",
            field: "requestNumber",
            width: 200
        },
        {
            headerName: "Create Date",
            field: "createDate",
            width: 300
        },
        {
            headerName: "Owner",
            field: "ownerName",
            width: 275
        },
        {
            headerName: "Lab",
            field: "labName",
            width: 275
        },
        {
            headerName: "# Samples",
            field: "numberOfSamples",
            width: 150
        }

    ];

    public rowData = [];


    constructor(private dialogRef: MatDialogRef<LinkToExperimentDialogComponent>,
                private router: Router,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constService: ConstantsService,
                private dialogService:DialogsService,
                private gnomexService:GnomexService,
                private analysisService: AnalysisService) {
        super();
        this.idAnalysis = this.data.idAnalysis;
        this.idLab = this.data.idLab;

    }

    ngOnInit() {
        this.labList = this.gnomexService.labList
            .filter(lab => lab.canGuestSubmit === 'Y' || lab.canSubmitRequests == 'Y');

        this.labControl = new FormControl();
        this.numberControl = new FormControl();
        let init = true;


        this.labControl.valueChanges.pipe(distinctUntilChanged()).subscribe(value =>{
            console.log("This is the a test: " + value);
            let params = new HttpParams();
            this.showSpinner = true;

            if(init){
                params = new HttpParams()
                    .set("includePlateInfo", "N")
                    .set("linkToAnalysisExpsOnly", "N")
                    .set("idLab", value)
                    .set("ignoreMaxRequestLimit","Y");
                init = false;
            }else{
                params = this.filterResults();
            }
            this.getRequestsForGrid(params);

        });


        this.numberControl.valueChanges.pipe(distinctUntilChanged()).pipe(debounceTime(3000)).subscribe(value => {
            this.showSpinner = true;
            let params = this.filterResults();
            this.getRequestsForGrid(params);

        });

        this.labControl.setValue(this.idLab);

        this.primaryDisable = (action) => {
            return this.selectedAnalysisToLink.length < 1;
        };

    }


    getRequestsForGrid(params:HttpParams){
        this.selectedAnalysisToLink = [];
        this.analysisService.getRequestList(params).pipe(first()).subscribe(resp =>{
            this.showSpinner = false;
            if(resp){
                if(+resp.requestCount === 0){
                    this.rowData = [];
                }else{
                    this.rowData = Array.isArray(resp.Request) ? resp.Request : [resp.Request];
                }
            }
        }, (err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    filterResults():HttpParams{
        let params:HttpParams = new HttpParams();
        if(this.labControl.value){
            params = params.set("idLab", this.labControl.value)
                .set("includePlateInfo", "N")
        }
        if(this.numberControl.value){
            params = params.set("number", this.numberControl.value);
        }
        params = params.set("linkToAnalysisExpsOnly", "Y");
        return params;

    }



    onGridReady(params){
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }
    gridSizeChanged(event:any){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }

    experimentRowSelected(event:any) {
        this.selectedAnalysisToLink = this.gridApi.getSelectedRows();
    }


    linkAnalysis(){
        if(this.idAnalysis && this.selectedAnalysisToLink.length > 0){
            let params:HttpParams =  new HttpParams().set("idAnalysis", this.idAnalysis,)
                .set("idRequest", this.selectedAnalysisToLink[0].idRequest);

            this.analysisService.linkExpToAnalysis(params).pipe(first())
                .subscribe(resp =>{
                    if(resp && resp.result){
                        this.dialogService.alert("Analysis was successfully linked", null, DialogType.SUCCESS);
                        this.dialogRef.close();
                        this.router.navigate(['/analysis',{outlets:{'analysisPanel':[this.idAnalysis]}}]);

                    }
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }

}
