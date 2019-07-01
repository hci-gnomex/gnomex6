import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="flex-container-col full-width full-height padded">
            <label class="gx-label" style="margin-bottom:0.5em;" for="experimentDescriptionId" > Notes </label>
            <jqxEditor
                    #editorReference
                    id="experimentDescriptionId"
                    width="100%"
                    [height]="300"
                    [editable]="true"
                    [tools]="tbarSettings"
                    [toolbarPosition]="'bottom'">
            </jqxEditor>
        </div>
    `,
})
export class SampleTypeDetailDialogComponent extends BaseGenericContainerDialog implements OnInit, AfterViewInit {

    rowData:any;
    applyFn:any;
    notes: string;
    isDirty = false;

    @ViewChild('editorReference') myEditor: jqxEditorComponent;
    public readonly tbarSettings :string  ="bold italic underline | left center right |  format font size | color | ul ol | outdent indent";



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

}
