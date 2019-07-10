import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {AngularEditorConfig} from "@kolkov/angular-editor";


@Component({
    template: `
        <div class="flex-container-col full-width full-height padded">
            <angular-editor (ngModelChange)="editorChange($event)" #notesEditor [(ngModel)]="notes" [config]="this.editorConfig">
            </angular-editor>
        </div>
    `,
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})
export class SampleTypeDetailDialogComponent extends BaseGenericContainerDialog implements OnInit {

    rowData:any;
    applyFn:any;
    notes: string;
    isDirty = false;
    editorConfig:AngularEditorConfig;
    eChange: boolean = false;




    constructor(private dialogRef: MatDialogRef<SampleTypeDetailDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.notes = this.rowData.notes;
        }
    }

    ngOnInit(){
       this.innerTitle = this.rowData.display;
        this.editorConfig = {
            spellcheck: true,
            height: "25em",
            minHeight: "10em",
            enableToolbar: true,
            placeholder:"Notes",
            editable: true
        };

    }
    editorChange(event:any):void{
        console.log(event);
        this.eChange = true;

    }


    applyChanges(){
        if(this.eChange){
            this.rowData.notes = this.notes;
            this.applyFn(true);
        }else{
            this.applyFn(false);
        }

        this.dialogRef.close();
    }

}
