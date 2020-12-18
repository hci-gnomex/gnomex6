import {Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PrimaryTab} from "../../util/tabs/primary-tab.component";
import {ExperimentsService} from "../experiments.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {distinctUntilChanged, first} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {ConstantsService} from "../../services/constants.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {HttpUriEncodingCodec} from "../../services/interceptors/http-uri-encoding-codec";


@Component({
    selector: "project-tab",
    templateUrl: "./project-browse.component.html",
    styles: [`
        :host /deep/ angular-editor#descEditor #editor {
            resize: none;
        }

        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#descEditor #strikeThrough-descEditor,
        :host /deep/ angular-editor#descEditor #subscript-descEditor,
        :host /deep/ angular-editor#descEditor #superscript-descEditor,
        :host /deep/ angular-editor#descEditor #link-descEditor,
        :host /deep/ angular-editor#descEditor #underline-descEditor,
        :host /deep/ angular-editor#descEditor #justifyLeft-descEditor,
        :host /deep/ angular-editor#descEditor #justifyCenter-descEditor,
        :host /deep/ angular-editor#descEditor #justifyRight-descEditor,
        :host /deep/ angular-editor#descEditor #justifyFull-descEditor,
        :host /deep/ angular-editor#descEditor #foregroundColorPicker-descEditor,
        :host /deep/ angular-editor#descEditor #backgroundColorPicker-descEditor,
        :host /deep/ angular-editor#descEditor #toggleEditorMode-descEditor,
        :host /deep/ angular-editor#descEditor #customClassSelector-descEditor {
            display: none;
        }
        
        .dirtyWithSave{
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            margin-bottom:1em;
            padding-left: 1em;
        }

        .error-message{
            color: red;
        }

        .project-field{
            margin: 1em 1em 1em 1em;
            width:100%;
            resize:none;
        }
    `]
})
export class ProjectBrowseTab extends PrimaryTab implements OnInit, OnDestroy {
    name = "project";
    @Output() saveSuccess: EventEmitter<boolean> = new EventEmitter();
    projectBrowseForm: FormGroup;
    project: any;
    formInit: boolean = false;
    private saveManagerSubscription: Subscription;

    descEditorConfig: AngularEditorConfig = {
        height: "20em",
        minHeight: "5em",
        maxHeight: "20em",
        width: "100%",
        minWidth: "5em",
        editable: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
    };

    constructor(protected fb: FormBuilder,
                private experimentsService: ExperimentsService,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService) {
        super(fb);
    }

    ngOnInit() {
        this.projectBrowseForm = this.fb.group({
            projectName: ["", [Validators.required, Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
            description: ["", Validators.maxLength(this.constantsService.MAX_LENGTH_4000)]
        });
        this.projectBrowseForm.valueChanges.pipe(distinctUntilChanged())
            .subscribe(value => {
                if(this.formInit) {
                    this.experimentsService.dirty = true;
                }
            });

        this.route.data.forEach((data) => {  // need to update data when url changes
            this.formInit = false;
            if(data.project) { // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let p = data["project"];
                this.project = p["Project"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("projectName").setValue(this.project["name"]);
                this.formInit = true;

                if(this.project.requests && !Array.isArray(this.project.requests)) {
                    this.project.requests = [this.project.requests];
                }
            }
        });
        // when save is selected in parent
        this.saveManagerSubscription = this.experimentsService.getSaveMangerObservable()
            .subscribe(saveType => {
                if(this.name === saveType) {
                    this.save();
                }});
        this.projectBrowseForm.statusChanges.pipe(distinctUntilChanged())
            .subscribe(status => {
                if(status === "VALID") {
                    this.experimentsService.invalid = false;
                } else {
                    this.experimentsService.invalid = true;
                }
            });


    }

    save() {
        this.dialogsService.startDefaultSpinnerDialog();

        this.project.name = this.projectBrowseForm.controls["projectName"].value;
        this.project.description = this.projectBrowseForm.controls["description"].value;
        let saveParams: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("projectJSONString", JSON.stringify(this.project))
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("parseEntries", "Y");

        this.experimentsService.saveProject(saveParams).pipe(first()).subscribe(response => {
            this.experimentsService.refreshProjectRequestList_fromBackend();
            this.saveSuccess.emit(true);
            this.formInit = false;
            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.saveSuccess.emit(false);
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    ngOnDestroy() {
        this.saveManagerSubscription.unsubscribe();
    }

}

