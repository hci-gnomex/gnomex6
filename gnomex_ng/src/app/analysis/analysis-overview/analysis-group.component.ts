import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {AnalysisService} from "../../services/analysis.service";
import {Subscription} from "rxjs";
import {distinctUntilChanged, first} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";


@Component({

    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "analysis-group-tab",
    templateUrl: "./analysis-group.component.html",
    styles: [`
        .error-message{
            color: red;
        }

    `]
})
export class AnalysisGroupComponent implements OnInit, OnDestroy {
    project: any;
    formInit: boolean = false;
    public readonly name = "group";
    @Output() saveSuccess: EventEmitter<boolean> = new EventEmitter();
    public projectBrowseForm: FormGroup;
    private saveManagerSubscription: Subscription;


    constructor(protected fb: FormBuilder,
                private analysisService: AnalysisService,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.projectBrowseForm = this.fb.group({
            name: ["", [Validators.required, Validators.maxLength(500)]],
            description: ["", Validators.maxLength(500)]
        });

        this.projectBrowseForm.valueChanges.subscribe(val => {
            if(this.formInit) {
                this.analysisService.dirty = true;
            }
        });

        this.route.data.forEach((data: any) => {  // need to update data when url changes
            this.formInit = false;
            if(data.analysisGroup) { // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let ag = data["analysisGroup"];
                this.project = ag["AnalysisGroup"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("name").setValue(this.project["name"]);
                this.formInit = true;
            }
        });
        // when save is selected in parent
        this.saveManagerSubscription = this.analysisService.getSaveMangerObservable()
            .subscribe(saveType => {
                if(this.name === saveType) {
                    this.save();
                }});
        this.projectBrowseForm.statusChanges.pipe(distinctUntilChanged())
            .subscribe(status => {
                if(status === "VALID") {
                    this.analysisService.invalid = false;
                } else {
                    this.analysisService.invalid = true;
                }
            });


    }

    save() {

        let saveParams: HttpParams = new HttpParams();
        let getParams: HttpParams = new HttpParams();

        let idLab = this.route.snapshot.paramMap.get("idLab");
        let idAnalysisGroup = this.route.snapshot.paramMap.get("idAnalysisGroup");
        getParams = getParams.set("idLab", idLab);
        getParams = getParams.set("idAnalysisGroup", idAnalysisGroup);


        this.project.name = this.projectBrowseForm.controls["name"].value;
        this.project.description = this.projectBrowseForm.controls["description"].value;

        saveParams = saveParams.set("idLab", idLab);
        saveParams = saveParams.set("idAnalysisGroup", idAnalysisGroup);
        saveParams = saveParams.set("name", this.project.name);
        saveParams = saveParams.set("description", this.project.description);


        this.analysisService.saveAnalysisGroup(saveParams).pipe(first()).subscribe(response => {
            this.saveSuccess.emit(true);
            this.formInit = false;
            this.analysisService.setActiveNodeId = "p" + idAnalysisGroup;
            this.analysisService.getAnalysisGroupList_fromBackend(this.analysisService.analysisPanelParams, true);
        }, (err: IGnomexErrorResponse) => {
            this.saveSuccess.emit(false);
        });

    }

    ngOnDestroy() {
        this.saveManagerSubscription.unsubscribe();
    }

}
