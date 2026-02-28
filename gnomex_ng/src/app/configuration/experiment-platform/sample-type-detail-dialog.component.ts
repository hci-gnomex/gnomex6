import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConstantsService} from "../../services/constants.service";


@Component({
    template: `
        <div class="flex-container-col full-width full-height padded" [formGroup]="formGroup">
            <angular-editor (ngModelChange)="editorChange($event)" #notesEditor [(ngModel)]="notes"
                            [config]="this.editorConfig" formControlName="notes">
            </angular-editor>
            <mat-error *ngIf="this.formGroup.get('notes').hasError('maxlength')">
                Notes can be at most {{this.constantsService.MAX_LENGTH_5000}} characters
                including HTML code formatting and styles. Character count: {{this.formGroup.get('notes').value.toString().length}}
            </mat-error>
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

    public formGroup: FormGroup;
    rowData: any;
    applyFn: any;
    notes: string;
    isDirty = false;
    editorConfig: AngularEditorConfig;
    eChange: boolean = false;

    constructor(private dialogRef: MatDialogRef<SampleTypeDetailDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data,
                public constantsService: ConstantsService,
                private fb: FormBuilder) {
        super();
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.notes = this.rowData.notes;
        }
    }

    ngOnInit() {
       this.innerTitle = this.rowData.display;
        this.editorConfig = {
            spellcheck: true,
            height: "25em",
            minHeight: "10em",
            enableToolbar: true,
            placeholder: "Notes",
            editable: true
        };

        this.formGroup = this.fb.group({
            notes: [{value: ""}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)]
        });

        this.formGroup.get("notes").setValue(this.notes);
        this.formGroup.markAsPristine();

        this.primaryDisable = (action) => {return this.formGroup.invalid || !this.formGroup.dirty; };
        this.dirty = () => {return this.formGroup.dirty; };

    }
    editorChange(event: any): void {
        console.log(event);
        this.eChange = true;

    }


    applyChanges() {
        if(this.eChange) {
            this.rowData.notes = this.notes;
            this.applyFn(true);
        } else {
            this.applyFn(false);
        }

        this.dialogRef.close();
    }

}
