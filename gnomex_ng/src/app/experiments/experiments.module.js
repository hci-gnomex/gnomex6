var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EXPERIMENTS_ROUTING } from "./experiments.routes";
import { TreeModule } from 'angular-tree-component';
import { ButtonModule } from "../../modules/button.module";
import { CheckBoxModule } from "../../modules/checkbox.module";
import { ComboBoxModule } from "../../modules/combobox.module";
import { ExpanderModule } from '../../modules/expander.module';
import { InputModule } from "../../modules/input.module";
import { JqxGridModule } from "../../modules/jqxgrid.module";
import { LoaderModule } from "../../modules/loader.module";
import { PanelModule } from "../../modules/panel.module";
import { NotificationModule } from "../../modules/notification.module";
import { TextAreaModule } from "../../modules/textarea.module";
import { ToggleButtonModule } from "../../modules/togglebutton.module";
import { WindowModule } from "../../modules/window.module";
import { ServicesModule } from "../services/services.module";
import { UtilModule } from "../util/util.module";
import { BrowseExperimentsComponent } from "./browse-experiments.component";
import { ExperimentOrdersComponent } from "./orders/experiment-orders.component";
import { ViewExperimentComponent } from "./view-experiment.component";
/**
 * @author mbyrne
 * @since 12/19/16
 */
var ExperimentsModule = (function () {
    function ExperimentsModule() {
    }
    return ExperimentsModule;
}());
ExperimentsModule = __decorate([
    NgModule({
        imports: [
            EXPERIMENTS_ROUTING,
            ButtonModule,
            CheckBoxModule,
            ComboBoxModule,
            CommonModule,
            ExpanderModule,
            FormsModule,
            InputModule,
            JqxGridModule,
            LoaderModule,
            NotificationModule,
            PanelModule,
            ServicesModule,
            TextAreaModule,
            ToggleButtonModule,
            TreeModule,
            UtilModule,
            WindowModule
        ],
        declarations: [
            BrowseExperimentsComponent,
            ExperimentOrdersComponent,
            ViewExperimentComponent
        ]
    })
], ExperimentsModule);
export { ExperimentsModule };
//# sourceMappingURL=experiments.module.js.map