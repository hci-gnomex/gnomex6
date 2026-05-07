import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {AnalysisService} from "../../services/analysis.service";

@Component({
  selector: "analysis-description-tab",
  template: `
    <div class="full-height" role="region" aria-label="Analysis description">
      <form [formGroup]="this.form" class="full-height overflow-auto" aria-label="Description form">
        <angular-editor #descEditorRef id="descEditor" formControlName="description" [config]="this.editorConfig"
                        aria-label="Analysis description editor">
        </angular-editor>
      </form>
    </div>
  `,
})
export class AnalysisDescriptionTabComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() public isEditMode: boolean = false;
  @ViewChild("descEditorRef", {static: true}) descEditor: AngularEditorComponent;

  public form: FormGroup;
  public editorConfig: AngularEditorConfig;

  private canUpdate: boolean = false;
  private description: string = "";
  private viewReady = false;

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
  ngAfterViewInit() {
    this.viewReady = true;
    this.setEditorState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setEditorState();
  }
  private setEditorState(): void {
    if (!this.editorConfig) { return; }

    const isEditable = !!(this.isEditMode && this.canUpdate);

    // config/form updates are safe anytime
    this.editorConfig.editable = isEditable;
    this.editorConfig.enableToolbar = isEditable;

    const ctrl = this.form ? this.form.get("description") : null;
    if (ctrl) {
      if (isEditable) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.setValue(this.description, { emitEvent: false });
        ctrl.disable({ emitEvent: false });
      }
    }

    // ViewChild updates only when view is ready
    if (this.viewReady && this.descEditor && this.descEditor.editorToolbar) {
      this.descEditor.editorToolbar.showToolbar = isEditable;
    }
  }

  ngOnDestroy() {
    this.analysisService.modeChangedAnalysis = undefined;
    this.analysisService.setEditMode(false);
  }



}
