import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";

import {AnalysisService} from "./analysis.service";
import {AppUserListService} from "./app-user-list.service";
import {BillingService} from "./billing.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {DataTrackService} from "./data-track.service";
import {DictionaryService} from "./dictionary.service";
import {ExperimentViewService} from "./experiment-view.service";
import {GetLabService} from "./get-lab.service";
import {HttpService} from "./http.service";
import {LabListService} from "./lab-list.service";
import {PropertyService} from "./property.service";

import {ExperimentResolverService} from "./resolvers/index";
import {ProjectResolverService} from "./resolvers/index";

@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [],
    providers: [
        AnalysisService,
        AppUserListService,
        BillingService,
        CreateSecurityAdvisorService,
        DataTrackService,
        DictionaryService,
        ExperimentViewService,
        GetLabService,
        HttpService,
        LabListService,
        PropertyService,
        ExperimentResolverService,
        ProjectResolverService,
    ]})
export class ServicesModule {
}
