import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {DateRangePickerComponent} from "./date-range-picker.component";
import {BrowseFilterComponent} from "./browse-filter.component";
import {ComboBoxModule} from '../../modules/combobox.module';
import {CalendarModule} from "../../modules/calendar.module";
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
import {SaveFooterComponent} from "./save-footer.component";
import {DateParserComponent} from "./parsers/date-parser.component";
import {MonthPickerComponent} from "./pickers/month-picker.component";
import {DatePickerComponent} from "./date-picker.component";
import {DateRangeFilterComponent} from "./date-range-filter.component";
import {DateRangeFilterPopupComponent} from "./date-range-filter-popup.component";
import {AnnotationTabComponent} from "./annotation-tab.component";
import {BillingTemplateWindowComponent} from "./billing-template-window.component";
import {AgGridModule} from "ag-grid-angular";
import {CheckboxRenderer} from "./grid-renderers/checkbox.renderer";
import {UrlAnnotationComponent} from "./url-annotation.component";
import {BillingPeriodSelectorComponent} from "./billing-period-selector.component";
import {BillingPeriodSelectorPopupComponent} from "./billing-period-selector-popup.component";
import {VisibilityDetailTabComponent} from "./visibility-detail-tab.component";
import {ContextHelpComponent} from "./context-help.component";
import {ContextHelpPopupComponent} from "./context-help-popup.component";
import {RichEditorModule} from "../../modules/rich-editor.module";
import {DownloadPickerComponent} from "./download-picker.component";
import {DownloadProgressComponent} from "./download-progress.component";
import {DownloadFilesComponent} from "./download-files.component";
import {AngularSplitModule} from "angular-split";
import {TreeModule} from "angular-tree-component";
import {EditInstitutionsComponent} from "./edit-institutions.component";
import {CustomComboBoxComponent} from "./custom-combo-box.component";
import {GuestTermsDialogComponent} from "./guest-terms-dialog.component";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        CalendarModule,
        ComboBoxModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        AgGridModule.withComponents([
            CheckboxRenderer,
        ]),
        RichEditorModule,
        AngularSplitModule,
        TreeModule,
    ],
    declarations: [
        BillingUsageReportComponent,
        BrowseFilterComponent,
        DateParserComponent,
        DatePickerComponent,
        DateRangePickerComponent,
        DateRangeFilterComponent,
        DateRangeFilterPopupComponent,
        DeleteDataTrackComponent,
        MenuHeaderBillingComponent,
        MenuHeaderDataTracksComponent,
        MenuHeaderTopicsComponent,
        NewDataTrackComponent,
        NewDataTrackFolderComponent,
        NewGenomeBuildComponent,
        NewOrganismComponent,
        NewTopicComponent,
        SaveFooterComponent,
        MonthPickerComponent,
        BillingTemplateWindowComponent,
        AnnotationTabComponent,
        UrlAnnotationComponent,
        BillingPeriodSelectorComponent,
        BillingPeriodSelectorPopupComponent,
        VisibilityDetailTabComponent,
        ContextHelpComponent,
        ContextHelpPopupComponent,
        DownloadPickerComponent,
        DownloadProgressComponent,
        DownloadFilesComponent,
        EditInstitutionsComponent,
        CustomComboBoxComponent,
        GuestTermsDialogComponent,
    ],
    entryComponents: [
        BillingUsageReportComponent,
        DeleteDataTrackComponent,
        NewDataTrackComponent,
        NewDataTrackFolderComponent,
        NewGenomeBuildComponent,
        NewOrganismComponent,
        DateRangeFilterPopupComponent,
        BillingTemplateWindowComponent,
        NewTopicComponent,
        BillingPeriodSelectorPopupComponent,
        ContextHelpPopupComponent,
        DownloadPickerComponent,
        DownloadProgressComponent,
        DownloadFilesComponent,
        EditInstitutionsComponent,
        GuestTermsDialogComponent,
    ],
    exports: [
        BrowseFilterComponent,
        BillingUsageReportComponent,
        DateParserComponent,
        DatePickerComponent,
        DateRangePickerComponent,
        DateRangeFilterComponent,
        DeleteDataTrackComponent,
        MenuHeaderBillingComponent,
        MenuHeaderDataTracksComponent,
        MenuHeaderTopicsComponent,
        NewDataTrackComponent,
        NewDataTrackFolderComponent,
        NewGenomeBuildComponent,
        NewOrganismComponent,
        NewTopicComponent,
        SaveFooterComponent,
        TabsModule,
        MonthPickerComponent,
        BillingTemplateWindowComponent,
        AnnotationTabComponent,
        UrlAnnotationComponent,
        BillingPeriodSelectorComponent,
        VisibilityDetailTabComponent,
        ContextHelpComponent,
        ContextHelpPopupComponent,
        DownloadPickerComponent,
        DownloadProgressComponent,
        DownloadFilesComponent,
        EditInstitutionsComponent,
        CustomComboBoxComponent,
        GuestTermsDialogComponent,
    ]
})
export class UtilModule {
}