import {Component, EventEmitter, Output, Input, OnDestroy} from '@angular/core'
import {FormGroup, FormBuilder, FormArray, Validators, AbstractControl, FormControl, Form} from '@angular/forms'
import {ComponentCommunicatorEvent} from './component-status-event'
import {TabContainer} from "./tab-container.component";
import {ExperimentViewService} from '../../services/experiment-view.service'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/distinctUntilChanged'
import {dependentControl} from "../validators/dependent-control.validator";

@Component({

    selector: 'prep-tab',
    template: `
              <div> </div>
    `
})
export class PrimaryTab implements OnDestroy{
    name: string;
    @Output() changeStatus = new EventEmitter<ComponentCommunicatorEvent>();
    private _theForm: FormGroup;
    private _formRules: any;
    protected _state:string;
    protected edit:boolean;
    protected _tabVisible:boolean ;

    constructor(protected fb: FormBuilder, protected rules?: ExperimentViewService) {
        this.name = "A Nameless Tab";
    }

    //abstract needs to be overidden
    public compInit():void{
    }

    public set tabIsActive(visible:boolean){
        this._tabVisible = visible;
    }
    public get tabIsActive():boolean{
        return this._tabVisible;
    }

    public set theForm(value: FormGroup) {
        this._theForm = value;
    }
    public get theForm() {
        return this._theForm;
    }

    public setState(value: string) {
        this._state = value;
        if(this._state === TabContainer.NEW || this._state === TabContainer.EDIT) {
            this.edit = true;
        }
        else if(this._state === TabContainer.VIEW){
            this.edit = false
        }

    }
    public getState() {
        return this._state;
    }

    sendEventWhenFormChanges(status:string,form:FormGroup,index:number):void{
        this.changeStatus.emit({status:status,form:form,index:index})
    }

    public addChildToForm(childForm: FormGroup): void {

        setTimeout(() => {
            let childForms:FormArray= (<FormArray>this.theForm.controls["childForms"]);
            childForms.push(childForm);
            let index = childForms.length - 1;
            childForm.statusChanges.distinctUntilChanged()
                .debounceTime(100).subscribe(status => this.sendEventWhenFormChanges(status,childForm,index));
        });
    }

    protected validateControl(value:any,address:string,linkerControlName:string){

        const childForms = (<FormArray>this.theForm.root).controls["childForms"];
        let control: AbstractControl;

        for(let i = 0; i < childForms.length; i++){

            control= childForms.at(i).get(address);

            if(control && (control.touched || control.dirty)){
                control.clearValidators();
                control.setValidators(dependentControl(linkerControlName,this.rules));
                control.setErrors({'dependentControl':null});
                control.updateValueAndValidity();
                break;
            }
        }

    }
    protected controlsToLink(address:string, control: AbstractControl):void{
        let controlName = null;
        let parent = control.parent;
        Object.keys(parent.controls).forEach((name) =>{
            if(control === parent.controls[name]){
                controlName = name;
    }
        });
        control.valueChanges.debounceTime(2000).subscribe(value => this.validateControl(value,address,controlName))
    }
    protected setformRules(formName: string, categoryName: string) {
        this._formRules = this.rules.experimentViewRules[formName][categoryName];

    }
    protected getformRules() {
        return this._formRules;
    }

    private removedAllChildren(form:AbstractControl):boolean{

         if(form instanceof FormGroup){
             return Object.keys((<FormGroup>form)).length === 0;
         }
         else{
             return (<FormArray>form).length === 0;
         }
    }
    private recurseRemoveControls(form: AbstractControl, formRules: any) {
        Object.keys(formRules).forEach((key: string) => {
            if (Object.keys(formRules[key]).length > 0) {
                let subFormGroup: AbstractControl = form.get(key);
                this.recurseRemoveControls(subFormGroup, formRules[key]);
               /* if(this.removedAllChildren(form.get(key))){
                    if(form instanceof FormGroup){
                        form.removeControl(key);
                    }
                    else{
                       let fa = (<FormArray>form); // parent is fa need to remove its empty
                    }
                }*/
            }
            else if (!formRules[key]) {
                if (form instanceof FormGroup) {
                    form.clearValidators();
                    form.removeControl(key);

                }
                else {
                    let formArray = (<FormArray>form);
                    formArray.removeAt(+key);
                }

            }
        });

    }
    protected removeControls(rootForm: FormGroup, rootFormRules: any) {

        this.recurseRemoveControls(rootForm, rootFormRules);
    }

    private recurseInitFormRules(fr: any): void {
        Object.keys(fr).forEach((key: string) => {
            if (Object.keys(fr[key]).length > 0) {
                this.recurseInitFormRules(fr[key]);
            }
            else if (this.rules[key] !== undefined) {
                this.rules[key] = fr[key];
            }
        });
    }

    initFormRules() {
        this.recurseInitFormRules(this._formRules);
    }


    protected showControl(path: Array<string>): boolean {
        let showControl: any = null;
        showControl = Object.assign({}, showControl, this._formRules);
        for (let i = 0; i < path.length; i++) {
            let newPath = path[i];
            showControl = showControl[newPath];
        }
        return <boolean>showControl;
    }
    ngOnDestroy(){
        this.changeStatus.unsubscribe();
    }

}

