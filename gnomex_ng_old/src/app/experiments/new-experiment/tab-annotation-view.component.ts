import {Component, ElementRef, Input, OnDestroy, ViewChild} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialogConfig} from "@angular/material";

import {GridApi} from "ag-grid-community";

import {first} from "rxjs/internal/operators";
import {Subscription} from "rxjs/index";

import {PropertyService} from "../../services/property.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {OrderType} from "../../util/annotation-tab.component";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {Experiment} from "../../util/models/experiment.model";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../../services/constants.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../../services/interceptors/http-uri-encoding-codec";


@Component({
    selector: "tab-annotation-view",
    templateUrl: "./tab-annotation-view.component.html",
    styles: [`
        
        .short-width {
            width: 10em;
            min-width: 10em;
        }
        .moderate-width {
            width: 40em;
            min-width: 20em;
        }
        .min-height {
            min-height: 20em;
        }
        .double-padded-top-bottom {
            padding: 0.6em 0 0.6em 0;
        }
        
    `]
})

export class TabAnnotationViewComponent implements OnDestroy {
    @ViewChild("customAnnotInput") customAnnotInput: ElementRef;

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;

        if (this._experiment && !this.experimentSubscription) {
            this.experimentSubscription = value.onChange_PropertyEntries.subscribe((value) =>{
                if (value && this.addAnnotationGridApi && this.removeAnnotationGridApi) {
                    // this.annotations = this._experiment.PropertyEntries;
                    let allPreviouslySelectedData: any[] = this.addAnnotationGridApi.getSelectedRows();

                    this.addAnnotationGridApi.setRowData(this._experiment.PropertyEntries);

                    this.removeAnnotationGridApi.setRowData([]);

                    for (let i = 0; i < this._experiment.PropertyEntries.length; i++) {
                        // "Required" annotations are selected by default. (? States?)
                        if ((this.addAnnotationGridApi.getRowNode('' + i).data.isSelected
                            && this.addAnnotationGridApi.getRowNode('' + i).data.isSelected === "true")) {

                            this.addAnnotationGridApi.getRowNode('' + i).setSelected(true);
                            this.addAnnotationGridApi.getRowNode('' + i).data.boldDisplay = 'Y';
                        }

                        for (let row of allPreviouslySelectedData) {
                            if (row.idProperty === this.addAnnotationGridApi.getRowNode('' + i).data.idProperty) {

                                this.addAnnotationGridApi.getRowNode('' + i).setSelected(true);
                            }
                        }

                        if(this.newCustomAnnot && this.addAnnotationGridApi.getRowNode('' + i).data.idProperty === this.newCustomAnnot) {
                            this.addAnnotationGridApi.getRowNode('' + i).setSelected(true);
                            this.addAnnotationGridApi.setFocusedCell(this.addAnnotationGridApi.getRowNode('' + i).rowIndex, "name");
                            this.newCustomAnnot = "";
                        }
                    }

                }

                this.dialogsService.stopAllSpinnerDialogs();
            });
        }

        if (this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
        }

        this.onChange_codeRequestCategorySubscription = this._experiment.onChange_codeRequestCategory.subscribe((value) => {
            this._experiment.refreshSampleAnnotationList();
        });
    }

    public _experiment: Experiment;

    private experimentSubscription: Subscription;
    private onChange_codeRequestCategorySubscription: Subscription;

    private newCustomAnnot: string = "";

    public addAnnotationGridApi: GridApi;
    public removeAnnotationGridApi: GridApi;
    public annotGridRowData: any[] = [];

    public customAnnotLabel: string = "Add Annotation";
    public editAnnotLabel: string = "Edit Annotations";
    public form: FormGroup;

    public currentUsers: any[] = [];

    private get addAnnotationColumnDefs(): any[] {
        return [
            {
                headerName: "Available Annotations",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "name",
                width: 500
            }
        ];
    }
    private get removeAnnotationColumnDefs(): any[] {
        return [
            {
                headerName: "Sample Annotations to use",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "name",
                width: 500
            }
        ];
    }

    constructor(private fb: FormBuilder,
                private propertyService: PropertyService,
                private dialogsService: DialogsService,
                private gnomexService: GnomexService,
                private constService: ConstantsService,
                public secAdvisor: CreateSecurityAdvisorService) {

        this.form = this.fb.group({
            customAnnot: [''],
        });
    }

    ngOnDestroy() {
        if (this.experimentSubscription) {
            this.experimentSubscription.unsubscribe();
        }
        if (this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
        }
    }

    public tabDisplayed() {
        this._experiment.refreshSampleAnnotationList();
    }

    public onGridSizeChanged(event: any) {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    public onAddAnnotationGridReady(params: any): void {
        this.addAnnotationGridApi = params.api;
        this.addAnnotationGridApi.setColumnDefs(this.addAnnotationColumnDefs);
        this.addAnnotationGridApi.sizeColumnsToFit();
        if (this._experiment && this.removeAnnotationGridApi) {
            this._experiment.refreshPropertyEntries();
        }
    }

    public onRemoveAnnotationGridReady(params: any): void {
        this.removeAnnotationGridApi = params.api;
        this.removeAnnotationGridApi.setColumnDefs(this.removeAnnotationColumnDefs);
        this.removeAnnotationGridApi.sizeColumnsToFit();
        if (this._experiment && this.addAnnotationGridApi) {
            this._experiment.refreshPropertyEntries();
        }
    }

    public onAddAnnotationGridRowSelected(event: any): void {
        let annot = Object(this.gnomexService.getSampleProperty(event.data.idProperty));
        if (event.node.selected) {
            // this.addColumnToSampleGrid(annot); // need to remove this
            event.node.data.isSelected = 'true';
        } else {
            // this.deleteColumnFromSampleGrid(annot); // need to remove this
            event.node.data.isSelected = 'false';
        }

        if (this.removeAnnotationGridApi
            && this.addAnnotationGridApi
            && event
            && event.data) {

            this.removeAnnotationGridApi.setRowData(this.addAnnotationGridApi.getSelectedRows());
        }
    }

    public onRemoveAnnotationGridRowSelected(event: any): void {
        if (event && event.node && event.node.data) {
            let selectedRows = this.addAnnotationGridApi.getSelectedNodes();

            if (selectedRows && selectedRows.length > 0) {
                let theNode = selectedRows.find((value) => {
                    return value && value.data.idProperty === event.node.data.idProperty;
                });

                if (!!theNode) {
                    this.addAnnotationGridApi.deselectNode(theNode);
                }
            }
        }
    }

    public editAnnotations(event?: any): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "82em";
        configuration.height = "60em";
        configuration.autoFocus = false;
        configuration.data = {
            isDialog: true,
            orderType: OrderType.SAMPLE
        };

        this.dialogsService.genericDialogContainer(ConfigureAnnotationsComponent, "Configure Annotations", null, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                ]}).subscribe(() => {
                    this.dialogsService.startDefaultSpinnerDialog();
                    this._experiment.refreshSampleAnnotationList();
        });

    }

    onCustomAnnot(event?: any) {
        // Check if the annotation is already used in the same name
        let found: boolean = false;
        let newAnnotationName: string = this.form.get("customAnnot").value;
        for(let i = 0; i < this.addAnnotationGridApi.getDisplayedRowCount(); i++ ) {
            if(this.addAnnotationGridApi.getRowNode("" + i).data.name.toLowerCase() === newAnnotationName.trim().toLowerCase()) {
                this.addAnnotationGridApi.setFocusedCell(this.addAnnotationGridApi.getRowNode("" + i).rowIndex, "name");
                found = true;
                break;
            }
        }
        if(found) {
            this.form.get("customAnnot").setErrors({"notUnique": true});
            setTimeout(() => {
                this.customAnnotInput.nativeElement.focus();
            });
            return;
        }

        this.dialogsService.startDefaultSpinnerDialog();
        this.currentUsers = [];
        let userObj = {idAppUser: this._experiment.idAppUser};
        this.currentUsers.push(userObj);
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("idProperty", "")
            .set("name", this.form.get("customAnnot").value)
            .set("isActive", "Y")
            .set("isRequired", "N")
            .set("isSelected", "Y")
            .set("forSample", "Y")
            .set("forDataTrack", "N")
            .set("forAnalysis", "N")
            .set("forRequest", "N")
            .set("idCoreFacility", this._experiment.idCoreFacility)
            .set("idAppUser", this._experiment.idAppUser)
            .set("codePropertyType", "TEXT")
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("optionsJSONString", JSON.stringify([]))
            .set("organismsJSONString", JSON.stringify([]))
            .set("platformsJSONString", JSON.stringify([]))
            .set("analysisTypesJSONString", JSON.stringify([]))
            .set("appUsersJSONString", JSON.stringify(this.currentUsers));

        this.propertyService.savePropertyAnnotation(params).pipe(first()).subscribe((response: any) => {
            if (response && response.result === "SUCCESS") {
                if (response.inactivate === "true") {
                    this.dialogsService.alert("Certain options were inactivated instead of deleted because they are associated with existing samples", "Succeed With Warning", DialogType.SUCCESS);
                }

                this.newCustomAnnot = response.idProperty;

                this.propertyService.getPropertyList(false).pipe(first()).subscribe((response: any[]) => {
                    this._experiment.refreshSampleAnnotationList();
                    this.dialogsService.stopAllSpinnerDialogs();
                }, (err: IGnomexErrorResponse) => {
                    this.dialogsService.stopAllSpinnerDialogs();
                });
            } else {
                let message: string = response && response.message ? " " + response.message : "";
                this.dialogsService.error("An error occurred while saving the annotation." + message);
                this.dialogsService.stopAllSpinnerDialogs();
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }
}
