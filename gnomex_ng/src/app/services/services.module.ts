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
        AnalysisResolverService,GenomeBuildResolverService,AnalysisGroupListResolverService,
        ProjectListResolverService,DatatrackListResolverService,DatatrackResolverService,
        LabResolverService} from "./resolvers/index";
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
import {ReportIssueService} from "./report-issue.service";
import {GenomeBuildValidateService} from "./genome-build-validate.service"
import {PasswordUtilService} from "./password-util.service";
import {AppUserPublicService} from "./app-user-public.service";
import {LabMembershipRequestService} from "./lab-membership-request.service";
import {UserService} from "./user.service";
import {ConfigurationService} from "./configuration.service";
import {SubRouteGuardService} from "./route-guards/sub-route-guard.service";
import {AuthRouteGuardService} from "./route-guards/auth-route-guard.service";
import {AccountFieldsConfigurationService} from "./account-fields-configuration.service";
import {NewBillingAccountService} from "./new-billing-account.service";
import {WorkflowService} from "./workflow.service";
import {GridColumnValidateService} from "./grid-column-validate.service";
import {BillingPOFormService} from "./billingPOForm.service";
import {BillingPOFormService} from "./billingPOForm.service";
import {BillingPOFormService} from "./billingPOForm.service";

@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [],
    providers: [
        AccountFieldsConfigurationService,
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
        AnalysisGroupListResolverService,
        AnalysisGroupResolverService,
        AnalysisResolverService,
        GnomexService,
        TopicService,
        BroadcastEmailService,
        CookieUtilService,
        ReportIssueService,
        GenomeBuildResolverService,
        GenomeBuildValidateService,
        PasswordUtilService,
        AppUserPublicService,
	    UserService,
        LabMembershipRequestService,
        ConfigurationService,
        SubRouteGuardService,
        WorkflowService,
        GridColumnValidateService,
        NewBillingAccountService,
        AuthRouteGuardService,
        ProjectListResolverService,
        DatatrackListResolverService,
        DatatrackResolverService,
        LabResolverService,
        BillingPOFormService
    ]})
export class ServicesModule {
}
