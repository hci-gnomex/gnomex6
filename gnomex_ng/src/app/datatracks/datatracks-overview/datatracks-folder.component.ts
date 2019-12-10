import {Component, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {GnomexService} from "../../services/gnomex.service";
import {Subscription} from "rxjs";


@Component({
    templateUrl: "./datatracks-folder.component.html",
    styles:[`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})
export class DatatracksFolderComponent implements OnInit, OnDestroy {
    //Override

    public canWrite: boolean = false;
    public showSpinner: boolean = false;
    public editorConfig: AngularEditorConfig;
    private folderFormGroup: FormGroup;
    private labList: Array<string> = [];
    private datatracksTreeNodeSubscription : Subscription;
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    // todo need a toggle for editable for datatracks overview detail
    @Input() editable;

    constructor(protected fb: FormBuilder,
                public dtService: DataTrackService,
                private route: ActivatedRoute,
                private gnomexService : GnomexService,
                public secAdvisor: CreateSecurityAdvisorService,
                public prefService: UserPreferencesService) {
    }


    ngOnInit(): void { // Note this hook runs once if route changes to another folder you don't recreate component
        this.labList = this.gnomexService.labList.sort(this.prefService.createLabDisplaySortFunction());
        this.editorConfig = {
            spellcheck: true,
            height: "25em",
            enableToolbar: true,
            placeholder: "Enter a description"
        };


        this.editorConfig.editable = !this.secAdvisor.isGuest;
        this.descEditor.editorToolbar.showToolbar = !this.secAdvisor.isGuest;


        this.folderFormGroup =  this.fb.group({
            folderName: [{value: ""  , disabled: this.secAdvisor.isGuest}, [ Validators.required, Validators.maxLength(100)]],
            lab: [{value: "", disabled: this.secAdvisor.isGuest}, []],
            description:[{value:"", disabled: this.secAdvisor.isGuest}]
        });

        this.datatracksTreeNodeSubscription =  this.dtService.datatrackListTreeNodeSubject.subscribe((data)=>{
            if(data){
                let folderName = data.name;
                this.canWrite = data.canWrite === "Y";
                this.folderFormGroup.get("folderName").setValue(folderName);
                this.folderFormGroup.get("description").setValue(data.description);
                this.folderFormGroup.get("lab").setValue(data.idLab);
                this.folderFormGroup.markAsPristine();
            }
        });
    }


    save(): void {
        this.showSpinner = true;

        let idDataTrackFolder = this.dtService.datatrackListTreeNode.idDataTrackFolder;
        let name = this.folderFormGroup.get("folderName").value;
        let description = this.folderFormGroup.get("description").value;

        let params:HttpParams = new HttpParams()
            .set('idDataTrackFolder', idDataTrackFolder)
            .set('description', description)
            .set('name', name)
            .set('idLab', this.folderFormGroup.get("lab").value ? this.folderFormGroup.get("lab").value : "");

        this.dtService.saveFolder(params).subscribe(resp =>{
            this.folderFormGroup.markAsPristine();
            this.showSpinner = false;
            this.dtService.activeNodeToSelect = {
                attribute: "idDataTrackFolder",
                value: resp.idDataTrackFolder
            };
            this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
        },(err:IGnomexErrorResponse) =>{
            this.showSpinner = false;
        });
    }

    ngOnDestroy(): void {
        this.datatracksTreeNodeSubscription.unsubscribe();
    }

}




