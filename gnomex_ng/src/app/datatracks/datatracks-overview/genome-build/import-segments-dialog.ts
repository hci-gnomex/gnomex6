import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../../services/data-track.service";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../../util/interfaces/gnomex-error.response.model";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../../../util/popup/base-generic-container-dialog";
import {GDAction} from "../../../util/interfaces/generic-dialog-action.model";

@Component({
    template: `
        <form [formGroup]="importSegDialogForm" class="full-width full-height double-padded">
            <textarea class="simple-textarea" formControlName="segTextArea">
            </textarea>
            <p style="text-align: right">
                Example format:
                <br>
                chr1  123415
                <br>chr2  214
            </p>
        </form>
    `,
    styles: [`
        .simple-textarea {
            overflow-y: scroll;
            height: 18em;
            width: 30em;
            resize: none;
            background-color: #e4e0e0;
        }
    `]

})

export class ImportSegmentsDialog extends BaseGenericContainerDialog implements OnInit {
    public primaryDisable: (action?: GDAction) => boolean;
    public importSegDialogForm: FormGroup;
    private readonly parseImport: any;
    private idGenomeBuild: string;

    constructor(private dialogRef: MatDialogRef<ImportSegmentsDialog>,
                @Inject(MAT_DIALOG_DATA) private data: any, private fb: FormBuilder,
                private datatrackService: DataTrackService) {
        super();
        if(this.data) {
            this.parseImport = data.importFn;
            this.idGenomeBuild = data.idGenomeBuild;
        }
    }

    ngOnInit() {
        this.importSegDialogForm = this.fb.group({
            segTextArea: ["", Validators.required ]
        });

        this.primaryDisable = (action) => {
            return this.importSegDialogForm.invalid;
        };

    }


    /**
     * Import segments
     */

    save() {
        this.showSpinner = true;
        let valueStr: string = this.importSegDialogForm.get("segTextArea").value;
        let splitValue: Array<string> = valueStr.split("\n");
        let formattedValue:string = splitValue.join(" ");
        let params: HttpParams = new HttpParams()
            .set("idGenomeBuild", this.idGenomeBuild)
            .set("chromosomeInfo", valueStr );

        this.datatrackService.getImportSegments(params).pipe(first()).subscribe(resp => {
            let genomeParams: HttpParams = new HttpParams()
                .set("idGenomeBuild", resp.idGenomeBuild);
            this.datatrackService.getGenomeBuild(genomeParams).pipe(first()).subscribe( resp => {
                let segs: Array<any> = <Array<any>>resp.Segments;
                this.parseImport(segs);
                this.showSpinner = false;
                this.dialogRef.close();
            });
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });

    }

}
