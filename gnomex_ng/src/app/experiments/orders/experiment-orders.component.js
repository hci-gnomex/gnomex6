var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, ViewChild } from "@angular/core";
import { ExperimentsService } from "../experiments.service";
import { URLSearchParams } from "@angular/http";
import { BrowseFilterComponent } from "../../util/browse-filter.component";
import { jqxGridComponent } from "../../../assets/jqwidgets-ts/angular_jqxgrid";
import { jqxComboBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcombobox";
/**
 *
 * @author u0556399
 * @since 7/20/2017.
 */
var ExperimentOrdersComponent = (function () {
    function ExperimentOrdersComponent(experimentsService) {
        this.experimentsService = experimentsService;
        this.savedHeight = 0;
        this.artificialGridBoundingStretch = true;
        this.actionCellsRenderer = function (row, column, value) {
            return "<div style=\"display:inline-block; width: 80%; padding-left: 10%; padding-right:10%; text-align: center; font-size: x-small\">\n\t\t\t\t\t\t\t<div style=\"display:inline-block; width: 35%; text-align: center;\">\n\t\t\t\t\t\t\t\t<a>View</a>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style=\"display:inline-block; width: 35%; padding-left:10%; text-align: center;\">\n\t\t\t\t\t\t\t\t<a>Edit</a>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>";
        };
        this.textCellsRenderer = function (row, column, value) {
            return "<div style=\"display: block; text-align: left; padding: 0.3rem 0.5rem; font-size: x-small;\">" + value + "</div>";
        };
        this.numberCellsRenderer = function (row, column, value) {
            return "<div style=\"display: block; text-align: right; padding: 0.3rem 0.5rem; font-size: x-small;\">" + value + "</div>";
        };
        this.dropdownChoices = [
            { value: "", label: "" },
            { value: "COMPLETE", label: "COMPLETE" },
            { value: "FAILED", label: "FAILED" },
            { value: "NEW", label: "NEW" },
            { value: "PROCESSING", label: "PROCESSING" },
            { value: "SUBMITTED", label: "SUBMITTED" }
        ];
        this.columns = [
            { text: "# ", datafield: "requestNumber", width: "4%", cellsrenderer: this.textCellsRenderer },
            { text: "Name", datafield: "name", width: "6%", cellsrenderer: this.textCellsRenderer },
            { text: "Action", width: "5%", cellsrenderer: this.actionCellsRenderer },
            { text: "Samples", datafield: "numberOfSamples", width: "4%", cellsrenderer: this.numberCellsRenderer },
            { text: "Status", datafield: "requestStatus", width: "4%", cellsrenderer: this.textCellsRenderer },
            { text: "Type", width: "7%", cellsrenderer: this.textCellsRenderer },
            { text: "Submitted on", datafield: "createDate", width: "7%", cellsrenderer: this.textCellsRenderer },
            { text: "Container", datafield: "container", width: "4%", cellsrenderer: this.textCellsRenderer },
            { text: "Submitter", datafield: "ownerName", width: "6%", cellsrenderer: this.textCellsRenderer },
            { text: "Lab", datafield: "labName", width: "8%", cellsrenderer: this.textCellsRenderer },
            { text: "Notes for core", datafield: "corePrepInstructions", cellsrenderer: this.textCellsRenderer }
        ];
        this.source = {
            datatype: "json",
            localdata: [
                { name: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: "" },
                { name: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: "" },
                { name: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: "" },
                { name: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: "" },
                { name: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: "" }
            ],
            datafields: [
                { name: "name", type: "string" },
                { name: "requestNumber", type: "string" },
                { name: "requestStatus", type: "string" },
                { name: "container", type: "string" },
                { name: "ownerName", type: "string" },
                { name: "labName", type: "string" },
                { name: "createDate", type: "string" },
                { name: "numberOfSamples", type: "string" },
                { name: "corePrepInstructions", type: "string" }
            ]
        };
        this.dataAdapter = new jqx.dataAdapter(this.source);
        this.radioString_workflowState = 'submitted';
        this.redosEnabled = false;
        this.numberSelected = 0;
    }
    ExperimentOrdersComponent.prototype.goButtonClicked = function () {
        if (this.statusCombobox.getSelectedItem().value === "") {
            return;
        }
        // console.log("You clicked \"Go\"!");
        var gridSelectedIndexes = this.myGrid.getselectedrowindexes();
        var statusSelectedIndex = this.statusCombobox.getSelectedIndex();
        this.selectedRequestNumbers = [];
        this.changeStatusResponsesRecieved = 0;
        for (var i = 0; i < gridSelectedIndexes.length; i++) {
            //	console.log("Changing Experiment numbers: " + this.myGrid.getcell(gridSelectedIndexes[i].valueOf(), "requestNumber").value + " status to " + this.statusCombobox.getSelectedItem().value);
            var idRequest = "" + this.myGrid.getcell(gridSelectedIndexes[i].valueOf(), "requestNumber").value;
            var cleanedIdRequest = idRequest.slice(0, idRequest.indexOf("R") >= 0 ? idRequest.indexOf("R") : idRequest.length);
            this.selectedRequestNumbers.push(cleanedIdRequest);
            this.experimentsService.changeExperimentStatus(cleanedIdRequest, this.statusCombobox.getSelectedItem().value);
        }
    };
    ExperimentOrdersComponent.prototype.deleteButtonClicked = function () {
        console.log("You clicked \"Delete\"!");
    };
    ExperimentOrdersComponent.prototype.emailButtonClicked = function () {
        console.log("You clicked \"Email\"!");
    };
    ExperimentOrdersComponent.prototype.updateGridData = function (data) {
        this.source.localdata = Array.isArray(data) ? data : [data];
        this.dataAdapter = new jqx.dataAdapter(this.source);
        this.myGrid.selectedrowindexes([]);
    };
    ExperimentOrdersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.experimentsSubscription = this.experimentsService.getExperimentsObservable()
            .subscribe(function (response) {
            _this.orders = response;
            _this.savedHeight = _this.artificialGridBounding.nativeElement.offsetHeight;
            _this.artificialGridBoundingStretch = false;
            console.log("grid containment solidifying");
            _this.updateGridData(response);
        });
        this.statusChangeSubscription = this.experimentsService.getChangeExperimentStatusObservable().subscribe(function (response) {
            for (var i = 0; i < _this.selectedRequestNumbers.length; i++) {
                // console.log("SelectedGridValues: " + this.selectedRequestNumbers[i] + "    idRequest: " + response.idRequest);
                if (_this.selectedRequestNumbers[i] === response.idRequest) {
                    _this.changeStatusResponsesRecieved++;
                    if (_this.changeStatusResponsesRecieved === _this.selectedRequestNumbers.length) {
                        _this.experimentsService.repeatGetExperiments_fromBackend();
                    }
                    break;
                }
            }
        });
        var params = new URLSearchParams();
        params.append("status", "SUBMITTED");
        this.experimentsService.getExperiments_fromBackend(params);
    };
    ExperimentOrdersComponent.prototype.ngOnDestroy = function () {
        this.experimentsSubscription.unsubscribe();
        this.statusChangeSubscription.unsubscribe();
    };
    return ExperimentOrdersComponent;
}());
__decorate([
    ViewChild('myGrid'),
    __metadata("design:type", jqxGridComponent)
], ExperimentOrdersComponent.prototype, "myGrid", void 0);
__decorate([
    ViewChild('statusComboBox'),
    __metadata("design:type", jqxComboBoxComponent)
], ExperimentOrdersComponent.prototype, "statusCombobox", void 0);
__decorate([
    ViewChild('artificialGridBounding'),
    __metadata("design:type", ElementRef)
], ExperimentOrdersComponent.prototype, "artificialGridBounding", void 0);
__decorate([
    ViewChild(BrowseFilterComponent),
    __metadata("design:type", BrowseFilterComponent)
], ExperimentOrdersComponent.prototype, "_browseFilterComponent", void 0);
ExperimentOrdersComponent = __decorate([
    Component({
        selector: "ExperimentOrders",
        template: "\n\t\t<div class=\"background\">\n\t\t\t<div class=\"t\" style=\"height: 100%; width: 100%;\">\n\t\t\t\t<div class=\"tr\" style=\"width: 100%;\">\n\t\t\t\t\t<div class=\"td\" style=\"width: 100%;\">\n\t\t\t\t\t\t<browse-filter [label]=\"'Orders'\" [iconSource]=\"'assets/review.png'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [mode]=\"'orderBrowse'\"></browse-filter>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"tr\" style=\"height:0.3em; width:0;\">\n\t\t\t\t</div>\n\t\t\t\t<div class=\"tr\" style=\"width: 100%;\">\n\t\t\t\t\t<div class=\"td\" style=\"width: 100%; height: 100%\">\n\t\t\t\t\t\t<div class=\"lower-panel\">\n\t\t\t\t\t\t\t<div class=\"t\" style=\"height: 100%; width: 100%;\">\n\t\t\t\t\t\t\t\t<div class=\"tr\" style=\"width: 100%;\">\n\t\t\t\t\t\t\t\t\t<div class=\"td\" style=\"width: 100%; height: 100%;\">\n\t\t\t\t\t\t\t\t\t\t<div #artificialGridBounding \n\t\t\t\t\t\t\t\t\t\t\t\t style=\"display: block; width: 100%; border: solid 1px darkgrey; border-radius:4px\" \n\t\t\t\t\t\t\t\t\t\t\t\t [style.height]=\"artificialGridBoundingStretch ? '100%' : '' + savedHeight + 'px'\">\n\t\t\t\t\t\t\t\t\t\t\t<div style=\"position:relative; display:block; height:100%; width:100%; max-height:100%; overflow: auto\">\n\t\t\t\t\t\t\t\t\t\t\t\t<jqxGrid #myGrid\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [width]=\"'calc(100% - 2px)'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [height]=\"600\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [source]=\"dataAdapter\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [pageable]=\"false\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [autoheight]=\"true\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [autorowheight]=\"true\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [editable]=\"false\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [sortable]=\"true\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [columns]=\"columns\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [altrows]=\"true\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [columnsresize]=\"true\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [selectionmode]=\"'checkbox'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t #gridReference>\n\t\t\t\t\t\t\t\t\t\t\t\t</jqxGrid>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"tr\" style=\"width:100%\">\n\t\t\t\t\t\t\t\t\t<div class=\"td\" style=\"width: 100%\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"grid-footer\">\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"t\" style=\"width: 100%\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"tr\" style=\"width:100%\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"t\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"tr\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"title\">{{myGrid.getselectedrowindexes().length}} selected</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<jqxComboBox #statusComboBox\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [source]=\"dropdownChoices\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [placeHolder]=\"'- Change Status -'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [dropDownVerticalAlignment]=\"'top'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t [autoDropDownHeight]=\"true\"></jqxComboBox>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td button-container\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<jqxButton\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[disabled]=\"myGrid.getselectedrowindexes().length === 0 || (this.statusCombobox.getSelectedItem() === null || this.statusCombobox.getSelectedItem().value === '')\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[template]=\"'link'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(onClick)=\"goButtonClicked()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t*ngIf=\"myGrid.getselectedrowindexes().length  != 0 && (this.statusCombobox.getSelectedItem()  != null && this.statusCombobox.getSelectedItem().value  != '')\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tsrc=\"assets/bullet_go.png\" alt=\"\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tstyle=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t*ngIf=\"myGrid.getselectedrowindexes().length === 0 || (this.statusCombobox.getSelectedItem() === null || this.statusCombobox.getSelectedItem().value === '')\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tsrc=\"assets/bullet_go_disable.png\" alt=\"\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tstyle=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tGo\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</jqxButton>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td button-container\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<jqxButton\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[disabled]=\"myGrid.getselectedrowindexes().length === 0\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[template]=\"'link'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(onClick)=\"deleteButtonClicked()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img *ngIf=\"myGrid.getselectedrowindexes().length != 0\" src=\"assets/delete.png\" alt=\"\" style=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img *ngIf=\"myGrid.getselectedrowindexes().length === 0\" src=\"assets/delete_disable.png\" alt=\"\" style=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tDelete\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</jqxButton>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"td button-container\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<jqxButton\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[disabled]=\"myGrid.getselectedrowindexes().length === 0\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[template]=\"'link'\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(onClick)=\"emailButtonClicked()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img *ngIf=\"myGrid.getselectedrowindexes().length != 0\" src=\"assets/email_go.png\" alt=\"\" style=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img *ngIf=\"myGrid.getselectedrowindexes().length === 0\" src=\"assets/email_go_disable.png\" alt=\"\" style=\"margin-right:0.2em;\"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tEmail\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</jqxButton>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td style=\"text-align: right\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>({{(source.localdata.length === null) ? 0 : source.localdata.length + (source.localdata.length != 1 ? \" orders\" : \" order\")}})\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t",
        styles: ["\n      div.t {\n          display: table;\n      }\n\n      div.tr {\n          display: table-row;\n          vertical-align: middle;\n      }\n\n      div.td {\n          display: table-cell;\n          vertical-align: middle;\n      }\n\n      div.background {\n          width: 100%;\n          height: 100%;\n          background-color: #EEEEEE;\n          padding: 0.3em;\n          border-radius: 0.3em;\n          border: 1px solid darkgrey;\n          position: relative;\n          display: flex;\n          flex-direction: column;\n      }\n\n      .title {\n          text-align: left;\n          font-size: medium;\n          width: 12em;\n      }\n\n      div.filter-bar label {\n          margin-bottom: 0;\n      }\n\n      div.radioGroup input {\n          margin-left: 0.7rem;\n      }\n\n      div.lower-panel {\n          height: 100%;\n          width: 100%;\n          border: 1px solid darkgrey;\n          background-color: white;\n          padding: 0.3em;\n          display: block;\n      }\n\n      div.grid-footer {\n          display: block;\n          width: 100%;\n          margin-top: 0.3em;\n          padding: 0em 0.8em;\n      }\n\n      div.button-container {\n          padding: 0.2em 0em 0.2em 0.6em;\n      }\n\t"]
    }),
    __metadata("design:paramtypes", [ExperimentsService])
], ExperimentOrdersComponent);
export { ExperimentOrdersComponent };
//# sourceMappingURL=experiment-orders.component.js.map