/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject, OnInit} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";

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
                private datatrackService: DataTrackService
    ) {
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
        let params: URLSearchParams = new URLSearchParams();
        params.set("idGenomeBuild", this.idGenomeBuild);
        params.set("chromosomeInfo", valueStr );


        this.datatrackService.getImportSegments(params).first().subscribe(resp => {
            let params:URLSearchParams = new URLSearchParams();
            params.set("idGenomeBuild", resp.idGenomeBuild);
            this.datatrackService.getGenomeBuild(params).first().subscribe( resp =>{
                let segs:Array<any> = <Array<any>>resp.Segments;
                this.parseImport(segs);
            })
        });



        if (this.dialogRef != undefined && this.dialogRef.componentInstance != undefined) {
            this.showSpinner = true;
        }
        this.dialogRef.close();
        //idGenomeBuild:82
        //chromosomeInfo:dfasdf 3234
        //this.datatrackService.getGenomeBuild()
        // http post to ImportSegments.gx then subscribe
        //in subscribe call GetGenomeBuild.gx using the response of importSeg's idGenomeBuild
        // in the GetGB subscribe set response's Segements array to this.rowData

    }

}
