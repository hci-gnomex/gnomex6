import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {AnalysisService} from "../../services/analysis.service";

@Component({
    selector: 'analysis-description-tab',
    template: `
        <div class="full-height">
            <form [formGroup]="this.form" class="full-height overflow-auto">
                <angular-editor [formControlName]="'description'" [config]="this.editorConfig"></angular-editor>
            </form>
        </div>
    `,
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
    `]
})
export class AnalysisDescriptionTabComponent implements OnInit, OnChanges {

    @Input() public isEditMode: boolean = false;

    private canUpdate: boolean = false;
    private form: FormGroup;
    private editorConfig: AngularEditorConfig;

    constructor(private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private analysisService: AnalysisService) {
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            description: '',
        });
        this.analysisService.addAnalysisOverviewFormMember(this.form, this.constructor.name);

        this.editorConfig = {
            spellcheck: true,
            height: '25em',
        };

        this.route.data.forEach((data: any) => {
            if (data && data.analysis && data.analysis.Analysis) {
                this.canUpdate = data.analysis.Analysis.canUpdate === 'Y';
                this.form.get('description').setValue(data.analysis.Analysis.description);
                this.form.markAsPristine();
                this.setEditorState();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setEditorState();
    }

    private setEditorState(): void {
        if (this.editorConfig) {
            let isEditable: boolean = this.isEditMode && this.canUpdate;
            this.editorConfig.editable = isEditable;
            this.editorConfig.enableToolbar = isEditable;
            this.editorConfig.showToolbar = isEditable;
        }
    }

}
