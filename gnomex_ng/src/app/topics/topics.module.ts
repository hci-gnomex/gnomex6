import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {TreeModule} from "angular-tree-component";
import {EmailRelatedUsersPopupModule} from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {ServicesModule} from "../services/services.module";
import {AngularSplitModule} from 'angular-split';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {UtilModule} from "../util/util.module";
import {TOPICS_ROUTING} from "./topics.routes";
import {BrowseTopicsComponent} from "./browse-topics.component";
import {MoveTopicComponent} from "./move-topic.component";
import {DeleteTopicComponent} from "./delete-topic.component";
import {TopicDetailComponent} from "./topics-detail.component";
import {TopicsPanelComponent} from "./topics-panel.component"
import {BasicEmailDialogComponent} from "../util/basic-email-dialog.component";
import {ShareLinkDialogComponent} from "../util/share-link-dialog.component";
import {AngularEditorModule} from "@kolkov/angular-editor";

@NgModule({
    imports: [
        AngularMaterialModule,
        DialogsModule,
        BrowserAnimationsModule,
        TOPICS_ROUTING,
        CommonModule,
        EmailRelatedUsersPopupModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        UtilModule,
        ReactiveFormsModule,
        AngularSplitModule,
        AngularEditorModule,
    ],
    declarations: [
        BrowseTopicsComponent,
        MoveTopicComponent,
        DeleteTopicComponent,
        TopicDetailComponent,
        TopicsPanelComponent,
        BasicEmailDialogComponent,
        ShareLinkDialogComponent
    ],
    entryComponents: [
        MoveTopicComponent,
        DeleteTopicComponent,
        BasicEmailDialogComponent,
        ShareLinkDialogComponent
    ],
    exports: [
        MoveTopicComponent,
        DeleteTopicComponent
    ]
})
export class TopicsModule {
}
