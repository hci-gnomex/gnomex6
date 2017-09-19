/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import {EXPERIMENTS_ROUTING} from "./experiments.routes";

import { TreeModule } from "angular-tree-component";

import { ButtonModule } from "../../modules/button.module";
import { CheckBoxModule} from "../../modules/checkbox.module";
import { ComboBoxModule }     from "../../modules/combobox.module";
import { ExpanderModule }     from "../../modules/expander.module";
import { InputModule } from "../../modules/input.module";
import { JqxGridModule }      from "../../modules/jqxgrid.module";
import { LoaderModule }       from "../../modules/loader.module";
import { NotificationModule } from "../../modules/notification.module";
import { TextAreaModule }     from "../../modules/textarea.module";
import { ToggleButtonModule } from "../../modules/togglebutton.module";
import { WindowModule }       from "../../modules/window.module";
import {UtilModule} from "../util/util.module";
import {ServicesModule} from "../services/services.module";

import {BrowseExperimentsComponent} from "./browse-experiments.component";
import {ExperimentOrdersComponent} from "./orders/experiment-orders.component";
import {ViewExperimentComponent} from "./view-experiment.component";

import {TestComponent,DescriptionTab,PrepTab,ExperimentDetail,NewExperimentComponent} from './experiment-detail/index'
import {
    RichEditorModule,
    DropDownModule
} from '../../modules/index';


/**
 * @author mbyrne
 * @since 12/19/16
 */


export const componentFactories = [TestComponent,DescriptionTab,PrepTab]; // need add components that will be tabs here
                                                                          // could be put in gnomexFlex as w
@NgModule({
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
        ServicesModule,
        TextAreaModule,
        ToggleButtonModule,
        TreeModule,
        UtilModule,
        WindowModule,
        ReactiveFormsModule,
        RichEditorModule,
        DropDownModule
            ],
    declarations: [
                    BrowseExperimentsComponent,
                    ExperimentOrdersComponent,
                    ViewExperimentComponent,
                    TestComponent,
                    DescriptionTab,
                    ExperimentDetail,
                    PrepTab,
                    NewExperimentComponent ],
    entryComponents:[...componentFactories]
})
export class ExperimentsModule {
}
