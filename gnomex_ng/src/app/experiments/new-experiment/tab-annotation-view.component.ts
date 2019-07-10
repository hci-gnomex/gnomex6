import {Component, Input, OnDestroy} from "@angular/core";
import {Response, URLSearchParams} from "@angular/http";
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


@Component({
    selector: "tabAnnotationView",
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
        
    `]
})

export class TabAnnotationViewComponent implements OnDestroy {

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

    private _experiment: Experiment;

    private experimentSubscription: Subscription;
    private onChange_codeRequestCategorySubscription: Subscription;

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
                private constService: ConstantsService) {

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
        configuration.width = "80em";
        configuration.height = "56em";
        configuration.autoFocus = false;
        configuration.data = {
            isDialog: true,
            orderType: OrderType.EXPERIMENT
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

    onCustomAnnot(event) {
        this.dialogsService.startDefaultSpinnerDialog();
        this.currentUsers = [];
        let userObj = {idAppUser: this._experiment.idAppUser};
        this.currentUsers.push(userObj);
        let params: URLSearchParams = new URLSearchParams();
        params.set("idProperty", "");
        params.set("name", this.form.get("customAnnot").value);
        params.set("isActive", "Y");
        params.set("isRequired", "N");
        params.set("forSample", "Y");
        params.set("forDataTrack", "N");
        params.set("forAnalysis", "N");
        params.set("forRequest", "N");
        params.set("idCoreFacility", this._experiment.idCoreFacility);
        params.set("idAppUser", this._experiment.idAppUser);
        params.set("codePropertyType", "TEXT");
        params.set("noJSONToXMLConversionNeeded", "Y");
        params.set("optionsJSONString", JSON.stringify([]));
        params.set("organismsJSONString", JSON.stringify([]));
        params.set("platformsJSONString", JSON.stringify([]));
        params.set("analysisTypesJSONString", JSON.stringify([]));
        params.set("appUsersJSONString", JSON.stringify(this.currentUsers));

        this.propertyService.savePropertyAnnotation(params).pipe(first()).subscribe((response: Response) => {
            let error: boolean = false;

            if (response) {
                let responseJSON: any = response.json();
                if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                    if (responseJSON.inactivate === "true") {
                        this.dialogsService.alert("Certain options were inactivated instead of deleted because they are associated with existing samples", "Succeed With Warning", DialogType.SUCCESS);
                    }
                } else {
                    error = true;
                }
            } else {
                error = true;
            }

            if (error) {
                this.dialogsService.error("An error occurred while saving the annotation");
            }

            this._experiment.refreshSampleAnnotationList();

            this.propertyService.getPropertyList(false).pipe(first()).subscribe((response: any[]) => {
                this.gnomexService.propertyList = response;
                this._experiment.refreshSampleAnnotationList();
                this.dialogsService.stopAllSpinnerDialogs();
            });
        });
    }
}
