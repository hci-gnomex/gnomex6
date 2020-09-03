import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators } from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {HttpParams} from "@angular/common/http";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ConfigurationService} from "../services/configuration.service";
import {GnomexStringUtilService} from "../services/gnomex-string-util.service";
import {Subscription} from "rxjs";
import {DictionaryService} from "../services/dictionary.service";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";


@Component({
    selector: "core-facility-edit",
    templateUrl: "./config-core-facility-edit.component.html",
    styles: [`
        .item{
            margin-right: 1em;
            flex: 1 1 0;
        }
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})
export class ConfigCoreFacilityEditComponent implements OnInit, OnDestroy {
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    @Output() refreshedCore = new EventEmitter<any>();

    public editorConfig: AngularEditorConfig;

    //Override
    public showSpinner: boolean = false;
    private coreFacilityForm: FormGroup;
    private idCoreFacility: string = "";
    private coreListSubscription: Subscription;
    private saveCoreFacilitySubscription : Subscription = new Subscription();


    constructor(protected fb: FormBuilder,
                private route: ActivatedRoute,
                private secAdvisor: CreateSecurityAdvisorService,
                private configService: ConfigurationService,
                private strUtilService: GnomexStringUtilService,
                private dictionaryService: DictionaryService) {
    }


    ngOnInit(): void { // Note this hook runs once if route changes to another folder you don't recreate component

        this.editorConfig = {
            spellcheck: true,
            height: "15em",
            minHeight: "10em",
            enableToolbar: true,
        };

        this.coreFacilityForm =  this.fb.group({
            contactName: ["", [ Validators.required, Validators.maxLength(100)]],
            contactEmail: ["", [ Validators.email, Validators.maxLength(100)]],
            contactPhone: ["", Validators.maxLength(20)],
            contactRoom: ["", Validators.maxLength(200)],
            facilityName: ["", Validators.maxLength(100)],
            labRoom: ["", Validators.maxLength(200)],
            labPhone: ["", Validators.maxLength(20)],
            contactImage: [{value: "", disabled: !this.secAdvisor.isSuperAdmin}],
            shortDescription: ["", Validators.maxLength(1000)],
            description: "",
            isActive: [false],
            acceptOnlineWorkAuth: [false],
            showProjectAnnotations: [false]
        });

        this.coreListSubscription = this.configService.getCoreListObservable().subscribe(core => {
            if(core.idCoreFacility ) { // existing
                this.idCoreFacility = core.idCoreFacility;
                this.coreFacilityForm.get("contactName").setValue(core.contactName);
                this.coreFacilityForm.get("contactEmail").setValue(core.contactEmail);
                this.coreFacilityForm.get("contactPhone").setValue(core.contactPhone);
                this.coreFacilityForm.get("contactRoom").setValue(core.contactRoom);
                this.coreFacilityForm.get("facilityName").setValue(core.facilityName);
                this.coreFacilityForm.get("labRoom").setValue(core.labRoom);
                this.coreFacilityForm.get("labPhone").setValue(core.labPhone);
                this.coreFacilityForm.get("contactImage").setValue(core.contactImage);
                this.coreFacilityForm.get("shortDescription").setValue(core.shortDescription);
                this.coreFacilityForm.get("description").setValue(core.description);
                this.coreFacilityForm.get("isActive").setValue(core.isActive  === "Y" ? true : false);
                this.coreFacilityForm.get("acceptOnlineWorkAuth").setValue(core.acceptOnlineWorkAuth === "Y" ? true : false);
                this.coreFacilityForm.get("showProjectAnnotations").setValue(core.showProjectAnnotations === "Y" ? true : false);
                this.coreFacilityForm.markAsPristine();
            } else {
                this.idCoreFacility = "";
                this.coreFacilityForm.reset();
                this.coreFacilityForm.markAsPristine();
            }

        });

        if(this.secAdvisor.isGuest) {
            this.descEditor.editorToolbar.showToolbar = false;
            this.editorConfig.editable = false;
        } else {
            this.descEditor.editorToolbar.showToolbar = true;
            this.editorConfig.editable = true;
        }
    }


    save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("idCoreFacility", this.idCoreFacility)
            .set("contactName", this.coreFacilityForm.get("contactName").value )
            .set("contactEmail", this.coreFacilityForm.get("contactEmail").value)
            .set("contactPhone", this.coreFacilityForm.get("contactPhone").value)
            .set("contactRoom", this.coreFacilityForm.get("contactRoom").value)
            .set("facilityName", this.coreFacilityForm.get("facilityName").value)
            .set("labRoom", this.coreFacilityForm.get("labRoom").value)
            .set("labPhone", this.coreFacilityForm.get("labPhone").value)
            .set("contactImage", this.coreFacilityForm.get("contactImage").value)
            .set("shortDescription", this.coreFacilityForm.get("shortDescription").value)
            .set("description", GnomexStringUtilService.cleanRichTextHTML(this.coreFacilityForm.get("description").value))
            .set("isActive", this.coreFacilityForm.get("isActive").value ? "Y" : "N")
            .set("acceptOnlineWorkAuth", this.coreFacilityForm.get("acceptOnlineWorkAuth").value ? "Y" : "N")
            .set("showProjectAnnotations", this.coreFacilityForm.get("showProjectAnnotations").value ? "Y" : "N");

        this.saveCoreFacilitySubscription = this.configService.saveCoreFacility(params).subscribe((resp: any) => {
            this.showSpinner = false;
            this.coreFacilityForm.markAsPristine();
            this.dictionaryService.reloadAndRefresh(() => {
                this.idCoreFacility = resp.idCoreFacility;
                this.refreshedCore.emit({
                    "facilityName": this.coreFacilityForm.get("facilityName").value,
                    "idCoreFacility": resp.idCoreFacility
               });
            });
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    ngOnDestroy() {
        this.coreListSubscription.unsubscribe();
        this.saveCoreFacilitySubscription.unsubscribe();
        this.refreshedCore.unsubscribe();
    }

}




