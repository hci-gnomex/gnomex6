import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {annotType, PropertyService} from "../../services/property.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Response, URLSearchParams} from "@angular/http";
import {DialogsService} from "../../util/popup/dialogs.service";
import {AppUserListService} from "../../services/app-user-list.service";
import {GnomexService} from "../../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {MultiSelectEditor} from "../../util/grid-editors/multi-select.editor";
import {MultiSelectRenderer} from "../../util/grid-renderers/multi-select.renderer";
import {UrlAnnotEditor} from "../../util/grid-editors/url-annot-editor";
import {UrlAnnotRenderer} from "../../util/grid-renderers/url-annot-renderer";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";

@Component({
    selector: "tabAnnotationView",
    templateUrl: "./tab-annotation-view.component.html",
    styles: [`
    `]
})

export class TabAnnotationViewComponent implements OnInit {
    @Output() navigate = new EventEmitter<string>();
    public annotGridColumnDefs: any[];
    public annotGridApi: any;
    public annotGridRowData: any[] = [];
    public gridOpt: GridOptions = {};

    public customAnnotLabel: string = "Add Annotation";
    public editAnnotLabel: string = "Edit Annotations";
    public form: FormGroup;
    public showSpinner: boolean = false;

    public currentUsers: any[] = [];

    private currentAnnotColumn: number = 5;

    constructor(private dictionaryService: DictionaryService,
                private fb: FormBuilder,
                private propertyService: PropertyService,
                private dialogsService: DialogsService,
                private gnomexService: GnomexService,
                private appUserListService: AppUserListService,
                private newExperimentService: NewExperimentService) {
        this.annotGridColumnDefs = [
            {headerName: "Annotation", field: "name", width: 500},
        ];
        this.form = this.fb.group({
            customAnnot: [''],
        });
    }

    ngOnInit() {
        this.newExperimentService.propEntriesChanged.subscribe((value) =>{
            if (value && this.annotGridApi) {
                this.annotGridApi.setRowData(this.newExperimentService.propertyEntriesForUser);
                if (this.newExperimentService.propEntriesChanged.value === true) {
                    this.newExperimentService.propEntriesChanged.next(false);
                }
                this.annotGridApi.forEachNode((node: any) => {
                    if (node.data.name === this.form.get("customAnnot").value) {
                        node.setSelected(true);
                    }
                })
            }
        });
    }

    public onAnnotGridReady(params: any): void {
        this.annotGridApi = params.api;
        this.annotGridApi.sizeColumnsToFit();
    }

    onAnnotGridRowDataChanged() {

    }

    public onAnnotGridRowSelected(event: any): void {
        let annot = Object(this.gnomexService.getSampleProperty(event.data.idProperty));
        if (event.node.selected) {
            this.addColumnToSampleGrid(annot);
        } else {
            this.deleteColumnFromSampleGrid(annot);
        }
    }

    deleteColumnFromSampleGrid(annot: any) {
        for (let i=0 ; i<this.newExperimentService.samplesGridColumnDefs.length ; i++) {
            if (this.newExperimentService.samplesGridColumnDefs[i].headerName === annot.name) {
                this.newExperimentService.samplesGridColumnDefs.splice(i, 1);
                this.currentAnnotColumn--;
            }
        }
        let propName = "a"+annot.idProperty;
        for (let i=0 ; i<this.newExperimentService.samplesGridRowData.length ; i++) {
            delete this.newExperimentService.samplesGridRowData[i][propName];
        }
    }

    addColumnToSampleGrid(annot: any) {
        let column: any;
        switch(annot.codePropertyType) {
            case annotType.CHECK :
                column = this.createCheckColumn(annot);
                break;
            case annotType.MOPTION :
                column = this.createMoptionColumn(annot);
                break;
            case annotType.OPTION :
                column = this.createOptionColumn(annot);
                break;
            case annotType.TEXT :
                column = this.createTextColumn(annot);
                break;
            case annotType.URL :
                column = this.createUrlColumn(annot);
                break;
        }
        annot.currentAnnotColumn = this.currentAnnotColumn;
        this.newExperimentService.samplesGridColumnDefs.splice(this.currentAnnotColumn, 0, column);
        this.newExperimentService.samplesGridApi.setColumnDefs(this.newExperimentService.samplesGridColumnDefs);
        this.currentAnnotColumn++;
    }

    createCheckColumn(annot: any) {
        let column =
            {
                headerName: annot.display,
                editable: false,
                checkboxEditable: true,
                width: 50,
                field: "a"+annot.idProperty,
                cellRendererFramework: CheckboxRenderer,
            };
        return column;

    }

    createTextColumn(annot: any): any {
        let column = {headerName: annot.display,
            field: "a"+annot.idProperty, width: 100, editable: true};
        return column;
    }

    createUrlColumn(annot: any): any {
        let column =
            {
                headerName: annot.display,
                editable: true,
                width: 150,
                field: "a"+annot.idProperty,
                cellEditorFramework: UrlAnnotEditor,
                cellRendererFramework: UrlAnnotRenderer,
                annotation: annot
            };
        return column;
    }

    createMoptionColumn(annot: any): any{
        let column =
            {
                headerName: annot.display,
                editable: true,
                width: 150,
                field: "a"+annot.idProperty,
                cellRendererFramework: MultiSelectRenderer,
                cellEditorFramework: MultiSelectEditor,
                selectOptions: annot.options,
                selectOptionsDisplayField: "option",
                selectOptionsValueField: "idPropertyOption",
                showFillButton: true,
                fillGroupAttribute: 'idProperty'
            };
        return column;

    }

    createOptionColumn(annot: any): any {
        let column =
                {
                    headerName: annot.display,
                    editable: true,
                    width: 150,
                    field: "a"+annot.idProperty,
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: annot.options,
                    selectOptionsDisplayField: "option",
                    selectOptionsValueField: "idPropertyOption",
                    showFillButton: true,
                    fillGroupAttribute: 'idProperty'
                }
        return column;
    }

    onCustomAnnot(event) {
        this.showSpinner = true;
        this.currentUsers = [];
        let userObj = {idAppUser: this.newExperimentService.idAppUser};
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
        params.set("idCoreFacility", this.newExperimentService.idCoreFacility);
        params.set("idAppUser", this.newExperimentService.idAppUser);
        params.set("codePropertyType", "TEXT");
        params.set("noJSONToXMLConversionNeeded", "Y");
        params.set("optionsJSONString", JSON.stringify([]));
        params.set("organismsJSONString", JSON.stringify([]));
        params.set("platformsJSONString", JSON.stringify([]));
        params.set("analysisTypesJSONString", JSON.stringify([]));
        params.set("appUsersJSONString", JSON.stringify(this.currentUsers));

        this.propertyService.savePropertyAnnotation(params).subscribe((response: Response) => {
            let error: boolean = false;
            if (response) {
                let responseJSON: any = response.json();
                if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                    if (responseJSON.inactivate === "true") {
                        this.dialogsService.confirm("Certan options were inactivated instead of deleted because they are associated with existing samples", null);
                    }
                } else {
                    error = true;
                }
            } else {
                error = true;
            }
            if (error) {
                this.dialogsService.confirm("An error occurred while saving the annotation", null);
            }
            this.propertyService.getPropertyList(false).subscribe((response: any[]) => {
                this.gnomexService.propertyList = response;
                this.newExperimentService.buildPropertiesByUser();
                this.showSpinner = false;
            });

        });

    }

    onCellClicked(event) {
    }
}