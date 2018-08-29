import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { URLSearchParams } from "@angular/http";
import {ConstantsService} from "../../services/constants.service";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";



@Component({
    templateUrl: "sample-type-detail-dialog.component.html",
    styles: [`        

            .padded-outer{
                margin:0;
                padding:0;
            }
            .padded-inner{
                padding:0.3em;

            }
           



    `]
})
export class SampleTypeDetailDialogComponent implements OnInit, AfterViewInit {

    rowData:any;
    applyFn:any;
    notes: string;
    isDirty = false;

    @ViewChild('editorReference') myEditor: jqxEditorComponent;
    public readonly tbarSettings :string  ="bold italic underline | left center right |  format font size | color | ul ol | outdent indent";



    constructor(private dialogRef: MatDialogRef<SampleTypeDetailDialogComponent>,
                public constService:ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.notes = this.rowData.notes;



        }
    }

    ngOnInit(){

    }

    ngAfterViewInit(){
        this.myEditor.val(this.notes);
    }

    applyChanges(){
        let editorNotes:string = this.myEditor.val();
        if(editorNotes !== this.notes){
            this.rowData.notes = editorNotes;
            this.applyFn(true);
        }else{
            this.applyFn(false);
        }

        this.dialogRef.close();
    }
    onCancelClose(){
        this.dialogRef.close();
    }






}