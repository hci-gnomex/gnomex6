import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AppUserListService} from "./app-user-list.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {GetLabService} from "./get-lab.service";
import {LabListService} from "./lab-list.service";
import {AnalysisService} from "./analysis.service";
import {DictionaryService} from "./dictionary.service";
import {DataTrackService} from "./data-track.service";
import {ExperimentViewService} from "./experiment-view.service";
import {BillingService} from "./billing.service";
import {ExperimentResolverService,ProjectResolverService} from "./resolvers/index";
import {LaunchPropertiesService} from "./launch-properites.service";
import {ConstantsService} from "./constants.service";
import {ProjectService} from "./project.service";
import {OrganismService} from "./organism.service";
@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [],
    providers: [
        AppUserListService,
        CreateSecurityAdvisorService,
        GetLabService,
        LabListService,
        AnalysisService,
        DictionaryService,
        DataTrackService,
        ExperimentViewService,
        BillingService,
        ExperimentResolverService,
        ProjectResolverService,
        LaunchPropertiesService,
        ProjectService,
        OrganismService
    ]})
export class ServicesModule {
}
