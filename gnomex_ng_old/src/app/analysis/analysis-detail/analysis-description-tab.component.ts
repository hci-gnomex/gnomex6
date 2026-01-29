import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {AnalysisService} from "../../services/analysis.service";

@Component({
    selector: "analysis-description-tab",
    template: `
        <div class="full-height">
            <form [formGroup]="this.form" class="full-height overflow-auto">
                <angular-editor #descEditorRef id="descEditor" formControlName="description" [config]="this.editorConfig">
                </angular-editor>
            </form>
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
export class AnalysisDescriptionTabComponent implements OnInit, OnChanges {

    @Input() public isEditMode: boolean = false;
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;

    public form: FormGroup;
    public editorConfig: AngularEditorConfig;

    private canUpdate: boolean = false;
    private description: string = "";

    constructor(private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private analysisService: AnalysisService) {
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            description: [{value: "", disabled: true}],
        });
        this.analysisService.addAnalysisOverviewFormMember(this.form, this.constructor.name);

        this.editorConfig = {
            spellcheck: true,
            minHeight: "20em",
            height: "auto",
            maxHeight: "auto",
            enableToolbar: true,
        };

        this.route.data.forEach((data: any) => {
            if (data && data.analysis && data.analysis.Analysis) {
                this.canUpdate = data.analysis.Analysis.canUpdate === "Y";
                this.description = data.analysis.Analysis.description;
                this.form.get("description").setValue(data.analysis.Analysis.description);
                this.form.markAsPristine();
                this.setEditorState();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setEditorState();
    }

    ngOnDestroy() {
        this.analysisService.modeChangedAnalysis = undefined;
        this.analysisService.setEditMode(false);
    }

    private setEditorState(): void {
        if (this.editorConfig) {
            let isEditable: boolean = this.isEditMode && this.canUpdate;
            this.descEditor.editorToolbar.showToolbar = isEditable;
            this.editorConfig.editable = isEditable;
            this.editorConfig.enableToolbar = isEditable;

            if(isEditable) {
                this.form.get("description").enable();
            } else {
                this.form.get("description").setValue(this.description);
                this.form.get("description").disable();
            }
        }
    }

}
