/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject, OnInit} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";

@Component({
    templateUrl:'./import-segments-dialog.html',
    styles:[`
        
        .buttons-right {

            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            margin-bottom: 1em;
            padding-left: 1em;
        }

        .simple-textarea {
            overflow-y: scroll;
            height: 18em;
            width: 30em;
            resize: none;
            background-color: #e4e0e0;
        }
    `]

})

export class ImportSegmentsDialog implements OnInit {
    private parseImport: any;
    private idGenomeBuild:string;
    public showSpinner: boolean = false;
    private importSegDialogForm:FormGroup;

    constructor(private dialogRef: MatDialogRef<ImportSegmentsDialog>,
                @Inject(MAT_DIALOG_DATA) private data: any, private fb: FormBuilder,
                private datatrackService: DataTrackService,
                private dialogService: DialogsService) {
         this.parseImport = data.importFn;
         this.idGenomeBuild = data.idGenomeBuild;

    }

    ngOnInit(){
        this.importSegDialogForm= this.fb.group({
            segTextArea: ['',Validators.required ]
        })

    }


    /**
     * Import segments
     */

    save(value:any){

        let valueStr:string = value.segTextArea;
        let splitValue:Array<string> =  valueStr.split("\n");
        let formattedValue:string = splitValue.join(" ");
        let params: HttpParams = new HttpParams()
            .set("idGenomeBuild", this.idGenomeBuild)
            .set("chromosomeInfo", valueStr );


        this.datatrackService.getImportSegments(params).pipe(first()).subscribe(resp => {
            let genomeParams:HttpParams = new HttpParams()
                .set("idGenomeBuild", resp.idGenomeBuild);
            this.datatrackService.getGenomeBuild(genomeParams).pipe(first()).subscribe( resp =>{
                let segs:Array<any> = <Array<any>>resp.Segments;
                this.parseImport(segs);
            })
        },(err:IGnomexErrorResponse) => {
            this.dialogService.alert(err.gError.message);
        });



        if (this.dialogRef != undefined && this.dialogRef.componentInstance != undefined) {
            this.showSpinner = true;
        }
        this.dialogRef.close();
    }

}
