import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {UtilService} from "../../services/util.service";
import {Experiment} from "../../util/models/experiment.model";

@Component({
    selector: 'tab-external-description',
    template: `
        <div class="full-height full-width flex-container-col padded">
            <mat-form-field>
                <input matInput placeholder="Experiment name (required)" [formControl]="this.form.get('name')">
            </mat-form-field>
            <label>Experiment description (required)</label>
            <angular-editor [formControl]="this.form.get('description')" [config]="this.editorConfig"></angular-editor>
        </div>
    `,
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})

export class TabExternalDescriptionComponent implements OnInit, OnChanges, OnDestroy {

    @Input() experiment: Experiment;

    public editorConfig: AngularEditorConfig;
    public form: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            name: ["", [Validators.required]],
            description: ["", [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.editorConfig = {
            spellcheck: true,
            height: '35em',
            editable: true,
            enableToolbar: true,
            showToolbar: true,
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.experiment) {
            if (this.experiment.name) {
                this.form.get("name").setValue(this.experiment.name);
            }
            if (this.experiment.description) {
                this.form.get("description").setValue(this.experiment.description);
            }
            if (this.subscriptions.length === 0) {
                this.registerSubscriptions();
            }
        }
    }

    private registerSubscriptions(): void {
        this.subscriptions.push(this.form.get("name").valueChanges.subscribe(() => {
            this.experiment.name = this.form.get("name").value;
        }));

        this.subscriptions.push(this.form.get("description").valueChanges.subscribe(() => {
            this.experiment.description = this.form.get("description").value;
        }));
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            UtilService.safelyUnsubscribe(sub);
        }
    }

}
