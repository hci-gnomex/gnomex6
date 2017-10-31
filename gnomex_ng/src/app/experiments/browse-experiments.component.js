var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Component, ViewChild } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { ExperimentsService } from "./experiments.service";
import { jqxWindowComponent } from "jqwidgets-framework";
import { jqxButtonComponent } from "jqwidgets-framework";
import { jqxComboBoxComponent } from "jqwidgets-framework";
import { jqxNotificationComponent } from "jqwidgets-framework";
import { jqxCheckBoxComponent } from "jqwidgets-framework";
import { jqxLoaderComponent } from "jqwidgets-framework";
import { TreeComponent } from "angular-tree-component";
import * as _ from "lodash";
var BrowseExperimentsComponent = (function () {
    function BrowseExperimentsComponent(experimentsService) {
        var _this = this;
        this.experimentsService = experimentsService;
        /*
        angular2-tree options
         */
        this.options = {
            displayField: "label",
            childrenField: "items",
            useVirtualScroll: true,
            nodeHeight: 22,
            nodeClass: function (node) {
                return "icon-" + node.data.icon;
            },
            allowDrop: function (element, _a) {
                var parent = _a.parent, index = _a.index;
                _this.dragEndItems = _.cloneDeep(_this.items);
                if (parent.data.labName) {
                    return false;
                }
                else {
                    return true;
                }
            },
            allowDrag: function (node) { return node.isLeaf; },
        };
        this.isClose = true;
        this.responseMsg = "";
        this.projectDescription = "";
        this.projectName = "";
        this.selectedIndex = -1;
        this.selectedBillingIndex = -1;
        this.selectedProjectLabIndex = -1;
        this.idCoreFacility = "3";
        this.showBillingCombo = false;
        this.experimentService = experimentsService;
        this.experimentsService.getExperiments().subscribe(function (response) {
            _this.buildTree(response);
            //this.thisResponse = response;
        });
        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];
    }
    BrowseExperimentsComponent.prototype.ngOnInit = function () {
        this.treeModel = this.treeComponent.treeModel;
    };
    BrowseExperimentsComponent.prototype.go = function (event) {
        console.log("event " + event);
    };
    /*
    Build the tree data
    @param
        what
     */
    BrowseExperimentsComponent.prototype.buildTree = function (response) {
        this.experimentCount = 0;
        if (!this.isArray(response)) {
            this.items = [response];
        }
        else {
            this.items = response;
        }
        this.labs = this.labs.concat(this.items);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var l = _a[_i];
            if (!this.isArray(l.Project)) {
                l.items = [l.Project];
            }
            else {
                l.items = l.Project;
            }
            l.id = l.idLab;
            l.parentid = -1;
            l.icon = "assets/group.png";
            for (var _b = 0, _c = l.items; _b < _c.length; _b++) {
                var p = _c[_b];
                p.icon = "assets/folder.png";
                p.labId = l.labId;
                p.id = p.idProject;
                p.parentid = l.id;
                if (p.Request) {
                    if (!this.isArray(p.Request)) {
                        p.items = [p.Request];
                    }
                    else {
                        p.items = p.Request;
                    }
                    for (var _d = 0, _e = p.items; _d < _e.length; _d++) {
                        var r = _e[_d];
                        if (r) {
                            if (r.label) {
                                var shortLabel = r.label.substring(0, (r.label.lastIndexOf("-")));
                                var shorterLabel = shortLabel.substring(0, shortLabel.lastIndexOf("-"));
                                r.label = shorterLabel;
                                this.experimentCount++;
                                r.id = r.idRequest;
                                r.parentid = p.id;
                                if (this.experimentCount % 100 === 0) {
                                    console.log("experiment count " + this.experimentCount);
                                }
                            }
                            else {
                                console.log("label not defined");
                            }
                        }
                        else {
                            console.log("r is undefined");
                        }
                    }
                }
                else {
                    console.log("");
                }
            }
        }
        this.jqxLoader.close();
        this.jqxConstructorLoader.close();
    };
    ;
    /*

    Start of Ng2 tree
     */
    BrowseExperimentsComponent.prototype.onMoveNode = function ($event) {
        console.log("Moved", $event.node.name, "to", $event.to.parent.name, "at index", $event.to.index);
        this.currentItem = $event.node;
        this.targetItem = $event.to.parent;
        this.getLabUsers($event);
    };
    BrowseExperimentsComponent.prototype.onActiveChangedEvent = function ($event) {
        console.log("event is " + event);
    };
    BrowseExperimentsComponent.prototype.onDragEnd1 = function ($event) {
        console.log("event is " + event);
    };
    /*
        Determine if the object is an array
        @param what
     */
    BrowseExperimentsComponent.prototype.isArray = function (what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    };
    ;
    BrowseExperimentsComponent.prototype.detailFn = function () {
        return function (keywords) {
            window.location.href = "http://localhost/gnomex/experiments/" + keywords;
        };
    };
    BrowseExperimentsComponent.prototype.showReassignWindow = function () {
        this.reassignWindow.open();
    };
    /**
     * Get the target lab users. Set showBillingCombo.
     * @param event
     */
    BrowseExperimentsComponent.prototype.getLabUsers = function (event) {
        var _this = this;
        if (event.node.isExternal === "N" && event.node.idLab === event.to.parent.idLab) {
            this.showBillingCombo = false;
        }
        else {
            this.showBillingCombo = true;
        }
        var params = new URLSearchParams();
        params.set("idLab", event.to.parent.idLab);
        var lPromise = this.experimentService.getLab(params).toPromise();
        lPromise.then(function (response) {
            _this.buildLabMembers(response, event);
        });
    };
    /**
     * Build the users that are in the reassign Labs.
     * @param response
     * @param event
     */
    BrowseExperimentsComponent.prototype.buildLabMembers = function (response, event) {
        this.labMembers = [];
        this.billingAccounts = [];
        var i = 0;
        for (var _i = 0, _a = response.members; _i < _a.length; _i++) {
            var u = _a[_i];
            if (u.isActive === "Y") {
                this.labMembers[i] = u;
                u.label = u.firstLastDisplayName;
                i++;
            }
        }
        for (var _b = 0, _c = response.authorizedBillingAccounts; _b < _c.length; _b++) {
            var b = _c[_b];
            if (b.idCoreFacility === this.idCoreFacility &&
                b.isApproved === "Y" && b.isActive === "Y") {
                b.label = b.accountName;
                this.billingAccounts.push(b);
            }
        }
        for (var _d = 0, _e = response.managers; _d < _e.length; _d++) {
            var u = _e[_d];
            var found = false;
            for (var _f = 0, _g = this.labMembers; _f < _g.length; _f++) {
                var fl = _g[_f];
                if (u.firstLastDisplayName.indexOf(fl.firstLastDisplayName) > 0) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                if (u.isActive === "Y") {
                    u.label = u.firstLastDisplayName;
                    this.labMembers.push(u);
                }
            }
        }
        if (this.labMembers.length < 1) {
            this.resetTree();
            this.msgNoAuthUsersForLab.open();
        }
        else {
            this.showReassignWindow();
        }
    };
    /**
     * Reset the tree to the initial state.
     */
    BrowseExperimentsComponent.prototype.resetTree = function () {
        this.items = this.dragEndItems;
    };
    /**
     * Save the project request created in the reassign dialog
     * @param {URLSearchParams} params
     */
    BrowseExperimentsComponent.prototype.saveRequestProject = function (params) {
        var _this = this;
        var lPromise = this.experimentService.saveRequestProject(params).toPromise();
        lPromise.then(function (response) {
            // if (response.text().indexOf("billingAccountMessage") !== -1) {
            //     this.responseMsg = response.text().substring(response.text().indexOf("billingAccountMessage")+"billingAccountMessage".length+4, response.text().indexOf("}")-2);
            //     this.responseMsgWindow.show();
            // }
            console.log("saveprojectrequest " + response);
            _this.resetComboBoxes();
        });
    };
    /**
     * Yes button clicked on the reassign.
     */
    BrowseExperimentsComponent.prototype.yesButtonClicked = function () {
        if (this.selectedIndex === -1) {
            this.msgSelectOwner.open();
            this.reassignWindow.close();
        }
        else if (this.selectedBillingIndex === -1 && this.showBillingCombo) {
            this.msgSelectBilling.open();
            this.reassignWindow.close();
        }
        else {
            this.isClose = false;
            this.selectedIndex = -1;
            var params = new URLSearchParams();
            params.set("idRequest", this.currentItem.id);
            params.set("idProject", this.targetItem.id);
            var appUserId = this.getAppUserId(this.selectedItem);
            params.set("idAppUser", appUserId);
            var idBillingAccount = this.getBillingAccountId(this.selectedBillingItem);
            params.set("idBillingAccount", idBillingAccount);
            this.saveRequestProject(params);
        }
    };
    /**
     * Reset the data for the reassign window.
     */
    BrowseExperimentsComponent.prototype.resetComboBoxes = function () {
        this.labMembers = [];
        this.billingAccounts = [];
        //this.treeModel.update();
        //this.refreshProjectRequestList();
        this.reassignWindow.close();
    };
    /**
     * The no button was selected in the reassign dialog.
     */
    BrowseExperimentsComponent.prototype.noButtonClicked = function () {
        this.isClose = true;
        // this.resetTree();
        this.reassignWindow.close();
    };
    /**
     * Return the idAppUser
     * @param {string} userName
     * @returns {any}
     */
    BrowseExperimentsComponent.prototype.getAppUserId = function (userName) {
        for (var _i = 0, _a = this.labMembers; _i < _a.length; _i++) {
            var l = _a[_i];
            if (l.firstLastDisplayName === userName) {
                return l.idAppUser;
            }
            console.log("user " + l);
        }
        return null;
    };
    /**
     * Return the billing account id.
     * @param {string} accountName
     * @returns {any}
     */
    BrowseExperimentsComponent.prototype.getBillingAccountId = function (accountName) {
        for (var _i = 0, _a = this.billingAccounts; _i < _a.length; _i++) {
            var b = _a[_i];
            if (b.accountName === accountName) {
                return b.idBillingAccount;
            }
        }
        return null;
    };
    /**
     * On select of the owner combo box of the reassign window.
     * @param event
     */
    BrowseExperimentsComponent.prototype.onOwnerSelect = function (event) {
        var args = event.args;
        if (args !== undefined && event.args.item) {
            this.selectedItem = event.args.item.value;
            this.selectedIndex = event.args.index;
        }
    };
    /**
     * Reassign window close event. If the 'x' reset the tree.
     * @param event
     */
    BrowseExperimentsComponent.prototype.reassignWindowClose = function (event) {
        if (this.isClose) {
            this.resetTree();
        }
        this.isClose = true;
    };
    /**
     * Start over. Data is missing.
     * @param event
     */
    BrowseExperimentsComponent.prototype.resetReassign = function (event) {
        this.isClose = true;
        this.resetTree();
        this.reassignWindow.open();
    };
    /**
     * When the ShowEmptyFolders checkbox is selected.
     * @param event
     */
    BrowseExperimentsComponent.prototype.showEmptyFoldersChange = function (event) {
        var _this = this;
        this.jqxLoader.open();
        var checked = event.args.checked;
        var params = new URLSearchParams();
        //TODO
        // When merged with the filter this will change
        params.set("showCategory", "N");
        params.set("allExperiments", "Y");
        params.set("showSamples", "N");
        params.set("idCoreFacility", "3");
        if (checked) {
            params.set("showEmptyProjectFolders", "Y");
            var lPromise = this.experimentService.getProjectRequestList(params).toPromise();
            lPromise.then(function (response) {
                _this.buildTree(response);
            });
        }
        else {
            params.set("showEmptyProjectFolders", "N");
            var lPromise = this.experimentService.getProjectRequestList(params).toPromise();
            lPromise.then(function (response) {
                _this.buildTree(response);
            });
        }
        console.log("end");
    };
    /**
     * The new project link is selected.
     * @param event
     */
    BrowseExperimentsComponent.prototype.newProjectClicked = function (event) {
        this.setLabName(event);
        this.newProjectWindow.open();
    };
    /**
     * Select the lab in the new project window.
     * @param event
     */
    BrowseExperimentsComponent.prototype.setLabName = function (event) {
        // Lab
        if (this.selectedItem.level === 1) {
            this.labComboBox.selectItem(this.selectedItem.data.label);
        }
        else if (this.selectedItem.level === 2) {
            this.labComboBox.selectItem(this.selectedItem.parent.data.label);
        }
    };
    /**
     * The no button was select in the new project window.
     */
    BrowseExperimentsComponent.prototype.noProjectButtonClicked = function () {
        this.newProjectWindow.close();
    };
    /**
     * The delete project link was selected.
     * @param event
     */
    BrowseExperimentsComponent.prototype.deleteProjectClicked = function (event) {
        this.deleteProjectWindow.open();
    };
    /**
     * The no button was selected in the delete project window.
     */
    BrowseExperimentsComponent.prototype.deleteProjectNoButtonClicked = function () {
        this.deleteProjectWindow.close();
    };
    /**
     * The yes button was selected in the delete project window.
     */
    BrowseExperimentsComponent.prototype.deleteProjectYesButtonClicked = function () {
        var _this = this;
        var params = new URLSearchParams();
        params.set("idProject", this.selectedItem.id);
        var lPromise = this.experimentsService.deleteProject(params).toPromise();
        lPromise.then(function (response) {
            _this.deleteProjectWindow.close();
            _this.refreshProjectRequestList();
        });
    };
    /**
     * Refresh the tree.
     */
    BrowseExperimentsComponent.prototype.refreshProjectRequestList = function () {
        var _this = this;
        var lPromise = this.experimentsService.getExperiments().toPromise();
        this.showEmptyCheckBox.checked(false);
        lPromise.then(function (response) {
            _this.buildTree(response);
        });
    };
    /**
     * Save the new project.
     * @param project
     */
    BrowseExperimentsComponent.prototype.saveProject = function (project) {
        var _this = this;
        var params = new URLSearchParams();
        project.name = this.projectName;
        project.projectDescription = this.projectDescription;
        //TODO
        // Need to get idAppUser. Flex did this like: parentApplication.getIdAppUser();
        params.set("projectXMLString", project);
        params.set("parseEntries", "Y");
        if (!this.projectName) {
            this.msgEnterProjectName.open();
        }
        else {
            var lPromise = this.experimentService.saveProject(params).toPromise();
            lPromise.then(function (response) {
                _this.refreshProjectRequestList();
            });
        }
        this.newProjectWindow.close();
    };
    /**
     * Get the project.
     */
    BrowseExperimentsComponent.prototype.getProject = function () {
        var _this = this;
        var idProject = 0;
        var params = new URLSearchParams();
        if (!this.selectedProjectLabItem) {
            this.msgEnterLab.open();
        }
        else {
            //            let mylab = this.projectLabName;
            params.set("idLab", this.selectedProjectLabItem.idLab);
            params.set("idProject", idProject);
            var lPromise = this.experimentService.getProject(params).toPromise();
            lPromise.then(function (response) {
                _this.saveProject(response.Project);
            });
        }
    };
    /**
     * Initiate the save project from the selection of the save button selected
     * in the new project window.
     */
    BrowseExperimentsComponent.prototype.saveProjectButtonClicked = function () {
        this.getProject();
    };
    /**
     * On selection of the billing account combobox in the reassign window.
     * @param event
     */
    BrowseExperimentsComponent.prototype.onBillingSelect = function (event) {
        var args = event.args;
        if (args !== undefined && event.args.item) {
            this.selectedBillingItem = event.args.item.value;
            this.selectedBillingIndex = event.args.index;
        }
    };
    BrowseExperimentsComponent.prototype.onProjectLabSelect = function (event) {
        var args = event.args;
        if (args !== undefined) {
            this.selectedProjectLabItem = event.args.item.originalItem;
            this.selectedProjectLabIndex = event.args.index;
        }
    };
    /**
     * A node is selected in the tree.
     * @param event
     */
    BrowseExperimentsComponent.prototype.treeOnSelect = function (event) {
        console.log("event");
        //        let args = event.args;
        this.selectedItem = event.node;
        //Lab
        if (this.selectedItem.level === 1) {
            this.newProject.disabled(false);
            this.deleteProject.disabled(true);
        }
        else if (this.selectedItem.level === 2) {
            this.newProject.disabled(false);
            this.deleteProject.disabled(false);
        }
        else {
            this.newProject.disabled(true);
            this.deleteProject.disabled(true);
        }
    };
    /**
     * The expand collapse toggle is selected.
     */
    BrowseExperimentsComponent.prototype.expandCollapseClicked = function () {
        var _this = this;
        setTimeout(function (_) {
            var toggled = _this.toggleButton.toggled();
            if (!toggled) {
                _this.toggleButton.val("Expand Projects");
                _this.treeModel.collapseAll();
            }
            else {
                _this.toggleButton.val("Collapse Projects");
                _this.treeModel.expandAll();
            }
        });
    };
    ;
    /**
     * Show the drag-drop hint.
     */
    BrowseExperimentsComponent.prototype.dragDropHintClicked = function () {
        this.msgDragDropHint.open();
    };
    /**
     * Show the response from the back end.
     */
    BrowseExperimentsComponent.prototype.responseMsgNoButtonClicked = function () {
        this.responseMsg = "";
        this.responseMsgWindow.close();
    };
    return BrowseExperimentsComponent;
}());
__decorate([
    ViewChild("tree"),
    __metadata("design:type", TreeComponent)
], BrowseExperimentsComponent.prototype, "treeComponent", void 0);
__decorate([
    ViewChild("reassignWindow"),
    __metadata("design:type", typeof (_a = typeof jqxWindowComponent !== "undefined" && jqxWindowComponent) === "function" && _a || Object)
], BrowseExperimentsComponent.prototype, "reassignWindow", void 0);
__decorate([
    ViewChild("responseMsgWindow"),
    __metadata("design:type", typeof (_b = typeof jqxWindowComponent !== "undefined" && jqxWindowComponent) === "function" && _b || Object)
], BrowseExperimentsComponent.prototype, "responseMsgWindow", void 0);
__decorate([
    ViewChild("msgSelectOwner"),
    __metadata("design:type", typeof (_c = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _c || Object)
], BrowseExperimentsComponent.prototype, "msgSelectOwner", void 0);
__decorate([
    ViewChild("msgSelectBilling"),
    __metadata("design:type", typeof (_d = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _d || Object)
], BrowseExperimentsComponent.prototype, "msgSelectBilling", void 0);
__decorate([
    ViewChild("msgNoAuthUsersForLab"),
    __metadata("design:type", typeof (_e = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _e || Object)
], BrowseExperimentsComponent.prototype, "msgNoAuthUsersForLab", void 0);
__decorate([
    ViewChild("msgEnterProjectName"),
    __metadata("design:type", typeof (_f = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _f || Object)
], BrowseExperimentsComponent.prototype, "msgEnterProjectName", void 0);
__decorate([
    ViewChild("msgDragDropHint"),
    __metadata("design:type", typeof (_g = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _g || Object)
], BrowseExperimentsComponent.prototype, "msgDragDropHint", void 0);
__decorate([
    ViewChild("msgEnterLab"),
    __metadata("design:type", typeof (_h = typeof jqxNotificationComponent !== "undefined" && jqxNotificationComponent) === "function" && _h || Object)
], BrowseExperimentsComponent.prototype, "msgEnterLab", void 0);
__decorate([
    ViewChild("newProjectWindow"),
    __metadata("design:type", typeof (_j = typeof jqxWindowComponent !== "undefined" && jqxWindowComponent) === "function" && _j || Object)
], BrowseExperimentsComponent.prototype, "newProjectWindow", void 0);
__decorate([
    ViewChild("deleteProjectWindow"),
    __metadata("design:type", typeof (_k = typeof jqxWindowComponent !== "undefined" && jqxWindowComponent) === "function" && _k || Object)
], BrowseExperimentsComponent.prototype, "deleteProjectWindow", void 0);
__decorate([
    ViewChild("toggleButton"),
    __metadata("design:type", typeof (_l = typeof jqxButtonComponent !== "undefined" && jqxButtonComponent) === "function" && _l || Object)
], BrowseExperimentsComponent.prototype, "toggleButton", void 0);
__decorate([
    ViewChild("showEmptyCheckBox"),
    __metadata("design:type", typeof (_m = typeof jqxCheckBoxComponent !== "undefined" && jqxCheckBoxComponent) === "function" && _m || Object)
], BrowseExperimentsComponent.prototype, "showEmptyCheckBox", void 0);
__decorate([
    ViewChild("deleteProject"),
    __metadata("design:type", typeof (_o = typeof jqxButtonComponent !== "undefined" && jqxButtonComponent) === "function" && _o || Object)
], BrowseExperimentsComponent.prototype, "deleteProject", void 0);
__decorate([
    ViewChild("newProject"),
    __metadata("design:type", typeof (_p = typeof jqxButtonComponent !== "undefined" && jqxButtonComponent) === "function" && _p || Object)
], BrowseExperimentsComponent.prototype, "newProject", void 0);
__decorate([
    ViewChild("labComboBox"),
    __metadata("design:type", typeof (_q = typeof jqxComboBoxComponent !== "undefined" && jqxComboBoxComponent) === "function" && _q || Object)
], BrowseExperimentsComponent.prototype, "labComboBox", void 0);
__decorate([
    ViewChild("yesButtonDeleteProject"),
    __metadata("design:type", typeof (_r = typeof jqxButtonComponent !== "undefined" && jqxButtonComponent) === "function" && _r || Object)
], BrowseExperimentsComponent.prototype, "yesButtonDeleteProject", void 0);
__decorate([
    ViewChild("deleteProjectNoButtonClicked"),
    __metadata("design:type", typeof (_s = typeof jqxButtonComponent !== "undefined" && jqxButtonComponent) === "function" && _s || Object)
], BrowseExperimentsComponent.prototype, "deleteProjectNoButton", void 0);
__decorate([
    ViewChild("jqxLoader"),
    __metadata("design:type", typeof (_t = typeof jqxLoaderComponent !== "undefined" && jqxLoaderComponent) === "function" && _t || Object)
], BrowseExperimentsComponent.prototype, "jqxLoader", void 0);
__decorate([
    ViewChild("jqxConstructorLoader"),
    __metadata("design:type", typeof (_u = typeof jqxLoaderComponent !== "undefined" && jqxLoaderComponent) === "function" && _u || Object)
], BrowseExperimentsComponent.prototype, "jqxConstructorLoader", void 0);
BrowseExperimentsComponent = __decorate([
    Component({
        selector: "experiments",
        templateUrl: "./experiments.component.html",
        styles: ["\n        .inlineComboBox {\n            display: inline-block;\n        }\n\n        .hintLink\n        {\n            fontSize: 9;\n            paddingLeft: 1;\n            paddingRight: 1;\n            paddingBottom: 1;\n            paddingTop: 1;\n        }\n\n        .sidebar {\n            width: 25%;\n            position: relative;\n            left: 0;\n            background-color: #ccc;\n            transition: all .25s;\n        }\n\n        .container {\n            display: flex;\n            min-height:100px;\n        }\n\n        .t {\n            display: table;\n            width: 100%;\n        }\n\n        .tr {\n            display: table-row;\n            width: 100%;\n        }\n\n        .td {\n            display: table-cell;\n        }\n\n        .jqx-tree {\n            height: 100%;\n        }\n\n        .jqx-notification {\n            margin-top: 30em;\n            margin-left: 20em;\n        }\n\n        //.jqx-notification {\n          //  height: 10em;\n          //  position: relative }\n        //.jqx-notification p {\n          //  margin: 0;\n          //  background: yellow;\n          //  position: absolute;\n          //  top: 50%;\n          //  left: 50%;\n          //  margin-right: -50%;\n          //  transform: translate(-50%, -50%) }\n\n        div.background {\n            width: 100%;\n            height: 100%;\n            background-color: #EEEEEE;\n            padding: 0.3em;\n            border-radius: 0.3em;\n            border: 1px solid darkgrey;\n            display: block;\n            flex-direction: column;\n        }\n    "]
    }),
    __metadata("design:paramtypes", [ExperimentsService])
], BrowseExperimentsComponent);
export { BrowseExperimentsComponent };
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
//# sourceMappingURL=browse-experiments.component.js.map