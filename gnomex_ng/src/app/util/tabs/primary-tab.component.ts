import {Component, EventEmitter, Output, Input, OnDestroy, OnInit} from '@angular/core'
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
    private static tabCount:number = 0;
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

    public tabVisibleHook():void{
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

    protected validateControl(value:any,dependentControlName:string,linkerControlName:string){

        const childForms = (<FormArray>this.theForm.root).controls["childForms"];
        let showProperty:any = this.rules[dependentControlName];
        let path:Array<string|number> = null;
        let control:AbstractControl = null;
        if(showProperty){
            path = showProperty.path;
            control= (<FormArray>this.theForm.controls["childForms"]).get(path);
        }

            if(control && (control.touched || control.dirty)){
                control.clearValidators();
                control.setValidators(dependentControl(linkerControlName,this.rules));
                control.setErrors({'dependentControl':null});
                control.updateValueAndValidity();
        }


    }
    protected controlsToLink(dependentControlName:string, control: AbstractControl):void{
        let controlName = null;
        let parent = control.parent;
        Object.keys(parent.controls).forEach((name) =>{
            if(control === parent.controls[name]){
                controlName = name;
    }
        });
        control.valueChanges.debounceTime(2000).subscribe(value => this.validateControl(value,dependentControlName,controlName))
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

    private recurseInitFormRules(fr: any,controlPath:Array<string|number>): void {
        Object.keys(fr).forEach((key: string) => {
            if (Object.keys(fr[key]).length > 0) { // more branches
                controlPath.push(key);
                this.recurseInitFormRules(fr[key],controlPath);
                controlPath.pop();
            }
            else{ //if (this.rules[key] !== undefined) {
                controlPath.push(key);
                this.rules[key] = {};
                this.rules[key]["visible"] = fr[key];
                this.rules[key]["path"]= controlPath.slice(0);
                controlPath.pop();
            }
        });
    }

    initFormRules() {
        let controlPath: Array<string | number> = [PrimaryTab.tabCount++];
        this.recurseInitFormRules(this._formRules, controlPath);
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


    protected registerControlChange():void{
        this.rules.getControlState().subscribe(change =>{
            let name:string = change.controlName;
            let paths:Array<any> = this.rules[name].path;
            let len:number = paths.length;
            this.rules[name].visible = !change.remove;

            let control:AbstractControl = (<FormArray>this.theForm.controls["childForms"]).get(paths);
            let pControl:AbstractControl = this.theForm.controls["childForms"].get(paths.slice(0,len - 1));


            if(control && change.remove){
                if(pControl instanceof FormArray){
                    pControl.removeAt(paths[len - 1]);
                }
                else if(pControl instanceof FormGroup){
                    pControl.removeControl(paths[len - 1])
                }
            }
            else if(!control && !change.remove) {
                let newControl:FormControl = new FormControl('',this.rules.getControlValidator(name));
                if(pControl instanceof FormArray){
                    pControl.insert(paths[len - 1],newControl);
                }
                else if(pControl instanceof FormGroup){
                    pControl.addControl(name,newControl);
                }
            }

        });
    }

    protected setupForm(categoryName:string,form:FormGroup):void{
        let tabName =  this.constructor.name;
        console.log(name);
        this.registerControlChange();
        this.addChildToForm(form);
        this.setformRules(tabName,categoryName);
        this.removeControls(form,this.getformRules());
        this.initFormRules();
    }


    ngOnDestroy(){
        this.changeStatus.unsubscribe();
        PrimaryTab.tabCount = 0;
    }

}

