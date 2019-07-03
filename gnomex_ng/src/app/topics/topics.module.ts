import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {TreeModule} from "angular-tree-component";

import {ButtonModule} from "../../modules/button.module";
import {CheckBoxModule} from "../../modules/checkbox.module";
import {ComboBoxModule} from "../../modules/combobox.module";
import {EmailRelatedUsersPopupModule} from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {ExpanderModule} from "../../modules/expander.module";
import {InputModule} from "../../modules/input.module";
import {LoaderModule} from "../../modules/loader.module";
import {PanelModule} from "../../modules/panel.module";
import {NotificationModule} from "../../modules/notification.module";
import {TextAreaModule} from "../../modules/textarea.module";
import {ToggleButtonModule} from "../../modules/togglebutton.module";
import {WindowModule} from "../../modules/window.module";
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
        ButtonModule,
        CheckBoxModule,
        ComboBoxModule,
        CommonModule,
        EmailRelatedUsersPopupModule,
        ExpanderModule,
        FormsModule,
        InputModule,
        LoaderModule,
        NotificationModule,
        PanelModule,
        ServicesModule,
        TextAreaModule,
        ToggleButtonModule,
        TreeModule.forRoot(),
        UtilModule,
        WindowModule,
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
