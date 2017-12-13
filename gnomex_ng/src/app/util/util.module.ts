import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {DateRangePickerComponent} from "./date-range-picker.component";
import {BrowseFilterComponent} from "./browse-filter.component";
import {ComboBoxModule} from '../../modules/combobox.module';
import {CalendarModule} from "../../modules/calendar.module";
import {BillingPeriodPickerComponent} from "./billing-period-picker.component";
import {TabsModule} from "./tabs/tabs.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BillingUsageReportComponent} from "./billing-usage-report.component";
import {MenuHeaderBillingComponent} from "./menuHeaders/menu-header-billing.component";
import {MenuHeaderDataTracksComponent} from "./menuHeaders/menu-header-data-tracks.component";
import {NewGenomeBuildComponent} from "./new-genome-build.component";
import {NewOrganismComponent} from "./new-organism.component";
import {MenuHeaderTopicsComponent} from "./menuHeaders/menu-header-topics.component";
import {NewTopicComponent} from "./new-topic.component";
import {NewDataTrackFolderComponent} from "../datatracks/new-datatrackfolder.component";
import {DeleteDataTrackComponent} from "../datatracks/delete-datatrack.component";
import {NewDataTrackComponent} from "../datatracks/new-datatrack.component";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        CalendarModule,
        ComboBoxModule,
        FormsModule,
        AngularMaterialModule

    ],
    declarations: [DateRangePickerComponent, BrowseFilterComponent, BillingPeriodPickerComponent, MenuHeaderBillingComponent, BillingUsageReportComponent,
                    MenuHeaderDataTracksComponent, NewGenomeBuildComponent, NewOrganismComponent, MenuHeaderTopicsComponent, NewTopicComponent, NewDataTrackFolderComponent, DeleteDataTrackComponent, NewDataTrackComponent],
    entryComponents: [BillingUsageReportComponent, NewGenomeBuildComponent, NewOrganismComponent, NewTopicComponent, NewDataTrackFolderComponent, NewDataTrackComponent, DeleteDataTrackComponent],
    exports: [DateRangePickerComponent, BrowseFilterComponent, TabsModule, BillingPeriodPickerComponent, MenuHeaderBillingComponent, BillingUsageReportComponent,
                    MenuHeaderDataTracksComponent, NewGenomeBuildComponent, NewOrganismComponent, MenuHeaderTopicsComponent, NewTopicComponent, NewDataTrackFolderComponent, DeleteDataTrackComponent, NewDataTrackComponent]

})
export class UtilModule {
}