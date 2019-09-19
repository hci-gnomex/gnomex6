import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from "@angular/core";
import {ProtocolService} from "../services/protocol.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {Subscription} from "rxjs";
import {SpinnerDialogComponent} from "../util/popup/spinner-dialog.component";
import {MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {DictionaryService} from "../services/dictionary.service";
import {AppUserListService} from "../services/app-user-list.service";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: "edit-protocol",
    templateUrl: "edit-protocol.component.html",
    styles: [`
        .flex-grow { flex: 1; }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }

        .inline-block { display: inline-block; }

        .vertical-center { vertical-align: middle; }

        .padded { padding: 0.4em; }

        .padded-right { padding-right: 0.4em; }

        .padded-left-right {
            padding-left: 0.4em;
            padding-right: 0.4em;
        }
        .padded-top-bottom {
            padding-top: 0.4em;
            padding-bottom: 0.4em;
        }

        .border { border: 1px lightgray solid; }

        .no-overflow { overflow: hidden; }
        .right-align { text-align: right; }

        .checkbox-container {
            display: inline-block;
            vertical-align: middle;
            width: fit-content;
            padding: 0.2em 0.6em 0 0.6em;
        }

        .minimize {
            width: fit-content;
        }

        .special-checkbox-text-alignment-padding {
            padding: 1.6em 0.6em 0 0;
        }
        .special-button-text-alignment-padding {
            padding: 1.1em 0.6em 0 0.6em;
        }

        .warning-block {
            background: yellow;
            border: 1px lightgray solid;
            border-radius: 4px;
        }

        :host /deep/ angular-editor#descEditor #editor {
            resize: none;
        }

        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})
export class EditProtocolComponent implements OnInit, OnDestroy, OnChanges {

    @Output("protocolLoaded") protocolLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    @Input() public isDialog: boolean = false;
    @Input() private selectedItem: any = null;

    public form: FormGroup;

    protected selectedProtocol: any;
    protected protocolId: string;
    protected protocolClassName: string;
    protected analysisTypeList: any[];
    protected experimentPlatformList: any[];
    protected userList: any[];

    protected disableViewURLButton: boolean = true;

    editorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "23em",
        minHeight: "5em",
        maxHeight: "23em",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
    };

    private routeParameterSubscription: Subscription;
    private protocolSubscription: Subscription;
    private saveExistingProtocolSubscription: Subscription;
    private userListSubscription: Subscription;

    private spinnerRef: MatDialogRef<SpinnerDialogComponent>;

    constructor(private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                public protocolService: ProtocolService,
                private route: ActivatedRoute,
                private appUserListService: AppUserListService,
                public prefService: UserPreferencesService,
                private fb: FormBuilder) { }

    ngOnInit(): void {
        this.selectedProtocol = null;
        this.userList = [];
        this.analysisTypeList = [];
        this.experimentPlatformList = [];

        this.form = this.fb.group({
            accountName: [{value: "", disabled: true}, [Validators.required, Validators.maxLength(200)]],
            experimentPlatform: [{value: "", disabled: true}],
            analysisType: [{value: "", disabled: true}],
            owner: [{value: "", disabled: true}],
            isActive: [{value: "", disabled: true}],
            url: [{value: "", disabled: true}, Validators.maxLength(500)],
            description: [{value: "", disabled: true}],
        });

        if (!this.protocolSubscription) {
            this.protocolSubscription = this.protocolService.getProtocolObservable().subscribe((result) => {
                this.selectedProtocol = result;

                this.form.get("accountName").setValue(result.name ? result.name : "");
                this.form.get("experimentPlatform").setValue(result.codeRequestCategory ? result.codeRequestCategory : "");
                this.form.get("isActive").setValue(result.isActive === "Y" ? true : false);
                this.form.get("url").setValue(result.url ? result.url : "");
                this.form.get("description").setValue(result.description ? result.description : "");
                this.form.get("owner").setValue(result.idAppUser ? result.idAppUser : "");
                this.form.get("analysisType").setValue(result.idAnalysisType ? result.idAnalysisType : "");

                if (result.url) {
                    this.disableViewURLButton = Array.isArray(result.url) && result.url.length === 0 ? true : false;
                } else {
                    this.disableViewURLButton = true;
                }

                this.form.markAsPristine();
                this.protocolLoaded.emit(true);

                setTimeout(() => {
                    if (result.canUpdate === "Y") {
                        this.form.enable();
                        this.descEditor.editorToolbar.showToolbar = true;
                        this.editorConfig.editable = true;
                    } else {
                        this.form.disable();
                        this.descEditor.editorToolbar.showToolbar = false;
                        this.editorConfig.editable = false;
                    }
                });

                this.dialogService.stopAllSpinnerDialogs();
            });
        }

        if (!this.saveExistingProtocolSubscription) {
            this.saveExistingProtocolSubscription = this.protocolService.getSaveExistingProtocolObservable().subscribe((result) => {
                this.refresh();

                this.dialogService.stopAllSpinnerDialogs();
            });
        }

        this.analysisTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.experimentPlatformList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.userList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APP_USER);
        this.userList.forEach((user => {
            user[this.prefService.userDisplayField] = this.prefService.formatUserName(user.firstName, user.lastName);
        }));

        if (!this.isDialog && this.route && this.route.params && !this.routeParameterSubscription) {
            this.routeParameterSubscription = this.route.params.subscribe((params) => {

                setTimeout(() => {
                    this.protocolId = params["id"];
                    this.protocolClassName = params["modelName"];

                    this.dialogService.stopAllSpinnerDialogs();

                    if (this.protocolId && this.protocolClassName) {
                        this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();

                        this.protocolService.getProtocolByIdAndClass(this.protocolId, this.protocolClassName);
                    }
                });

            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(this.isDialog) {
            setTimeout(() => {
                if (this.selectedItem && this.selectedItem.id && this.selectedItem.protocolClassName) {
                    this.protocolId = this.selectedItem.id;
                    this.protocolClassName = this.selectedItem.protocolClassName;
                    this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
                    this.protocolService.getProtocolByIdAndClass(this.protocolId, this.protocolClassName);
                } else if(this.selectedItem && this.selectedItem.isProtocol === "N") {
                    this.selectedProtocol = null;
                    this.protocolId = "";
                    this.protocolClassName = this.selectedItem.protocolClassName;
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.protocolSubscription) {
            this.protocolSubscription.unsubscribe();
        }
        if (this.saveExistingProtocolSubscription) {
            this.saveExistingProtocolSubscription.unsubscribe();
        }
        if (this.routeParameterSubscription) {
            this.routeParameterSubscription.unsubscribe();
        }

        if(this.userListSubscription) {
            this.userListSubscription.unsubscribe();
        }
    }

    private refresh(): void {
        if (this.protocolId && this.protocolClassName) {
            this.protocolService.getProtocolByIdAndClass(this.protocolId, this.protocolClassName);
        }
        this.protocolService.getProtocolList(this.isDialog && this.protocolClassName ? new HttpParams().set("protocolClassName", this.protocolClassName) : null);
    }

    public checkToEnableViewURLButton(event: any): void {
        if (event && event.currentTarget && event.currentTarget.value && event.currentTarget.value !== "") {
            this.disableViewURLButton = false;
        } else {
            this.disableViewURLButton = true;
        }
    }

    public onViewURLButtonClicked(): void {
        window.open(this.form.get("url").value, "_blank");
    }

    public onSaveButtonClicked(): void {
        if (this.selectedProtocol) {
            this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();

            this.protocolService.saveExistingProtocol(
                this.form.get("accountName").value,
                this.form.get("description").value,
                this.form.get("analysisType").value,
                this.protocolClassName,
                this.form.get("experimentPlatform").value,
                this.form.get("owner").value,
                this.form.get("isActive").value ? "Y" : "N",
                this.protocolId,
                this.form.get("url").value
            );
        }
    }
}
