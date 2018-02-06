import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";

import {AnalysisService} from "./analysis.service";
import {AppUserListService} from "./app-user-list.service";
import {BillingService} from "./billing.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {DataTrackService} from "./data-track.service";
import {DictionaryService} from "./dictionary.service";
import {ExperimentViewService} from "./experiment-view.service";
import {ExperimentResolverService,ProjectResolverService,AnalysisGroupResolverService,
        AnalysisResolverService,GenomeBuildResolverService} from "./resolvers/index";
import {LaunchPropertiesService} from "./launch-properites.service";
import {ConstantsService} from "./constants.service";
import {ProjectService} from "./project.service";
import {OrganismService} from "./organism.service";
import {GetLabService} from "./get-lab.service";
import {HttpService} from "./http.service";
import {LabListService} from "./lab-list.service";
import {PropertyService} from "./property.service";
import {AnnotationService} from "./annotation.service";
import {UsageService} from "./usage.service";
import {GnomexStringUtilService} from "./gnomex-string-util.service"
import {GnomexService} from "./gnomex.service";
import {TopicService} from "./topic.service";
import {CookieUtilService} from "./cookie-util.service";
import {BroadcastEmailService} from "./broadcast-email.service";
import {GenomeBuildValidateService} from "./genome-build-validate.service"

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
        LaunchPropertiesService,
        ProjectService,
        OrganismService,
        ConstantsService,
        AnnotationService,
        UsageService,
        GnomexStringUtilService,
        AnalysisGroupResolverService,
        AnalysisResolverService,
        GnomexService,
        TopicService,
        BroadcastEmailService,
        CookieUtilService,
        GenomeBuildResolverService,
        GenomeBuildValidateService
    ]})
export class ServicesModule {
}
