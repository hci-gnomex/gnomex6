import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {
    AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, Output, ViewChild,
} from "@angular/core";
import { HttpParams } from "@angular/common/http";
import {AnalysisService} from "../services/analysis.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ConstantsService} from "../services/constants.service";
import {first} from "rxjs/operators";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: "create-analysis-group-dialog",
    templateUrl: "create-analysis-group-dialog.html",
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }
        div.inlineDiv {
            display: inline-block;
            margin: 0.3rem 0.8rem 0.3rem 0.8rem;
        }
        .full-width {
            width: 100%;
        }

    `]
})

export class CreateAnalysisGroupComponent implements OnInit, AfterViewInit {
    @ViewChild("labComboBox") labComboBox;

    public createAnalysisGroupForm: FormGroup;
    public labList: any[];
    public showSpinner: boolean = false;
    public newAnalysisGroupId: string = "";
    private readonly selectedLad: any;
    private idLabString: string;



    constructor(private dialogRef: MatDialogRef<CreateAnalysisGroupComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private analysisService: AnalysisService,
                private formBuilder: FormBuilder,
                public constantsService: ConstantsService,
                private dialogsService: DialogsService,
                private changeDetectorRef: ChangeDetectorRef,
                public prefService: UserPreferencesService) {

        this.labList = data.labList;
        this.selectedLad = data.selectedLad;
    }

    ngOnInit() {
        this.createAnalysisGroupForm = this.formBuilder.group({
            selectedLab: ["", [Validators.required]],
            analysisGroupName: ["", [Validators.required,
                                     Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
            description: ["", [Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
        });

    }

    ngAfterViewInit() {
        if(this.selectedLad) {
            this.labComboBox.selectItem(this.selectedLad);
        }

        this.changeDetectorRef.detectChanges();

    }

    onLabSelect(event: any) {
        if (event.args.item) {
            this.idLabString = event.args.item.value;
        }
    }

    onLabUnselect(event: any) {
    }

    /**
     * Save a new analysis group.
     */
    createAnalysisGroupSaveButtonClicked() {
        let analysisGroupName = this.createAnalysisGroupForm.get("analysisGroupName").value.trim();
        if(!analysisGroupName) {
            this.dialogsService.alert("Please enter a valid name", "Invalid");
            this.createAnalysisGroupForm.get("analysisGroupName").setErrors(Validators.required);
            this.changeDetectorRef.detectChanges();
            return;
        }

        this.showSpinner = true;

        let idAnalysisGroup: any = 0;
        let analysisGroupDescription = this.createAnalysisGroupForm.get("description").value;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.idLabString)
            .set("idAnalysisGroup", idAnalysisGroup)
            .set("name", analysisGroupName)
            .set("description", analysisGroupDescription);

        this.analysisService.saveAnalysisGroup(params).pipe(first()).subscribe(response => {
            if(response && response.idAnalysisGroup) {
                this.newAnalysisGroupId = response.idAnalysisGroup;
                setTimeout(() => {
                    this.analysisService.refreshAnalysisGroupList_fromBackend();
                });
            }
        }, (error) => {
            this.dialogsService.alert(error.message, "Error");
            this.dialogsService.stopAllSpinnerDialogs();
            this.showSpinner = false;
        });

    }
}

