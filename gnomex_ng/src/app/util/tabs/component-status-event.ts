import {FormGroup} from "@angular/forms"

export interface ComponentCommunicatorEvent {
    status:string; // what invalid or valid form
    form:FormGroup; // current form
    index:number; // index for current tab that status has changed
}