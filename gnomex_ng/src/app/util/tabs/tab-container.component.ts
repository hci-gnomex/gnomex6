import {
    OnInit,
    Directive,
    ChangeDetectorRef,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentRef,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    Type
} from '@angular/core'
import {FormGroup, FormBuilder, Validators, AbstractControl, FormArray} from '@angular/forms';
import { ActivatedRoute } from '@angular/router'
import { Tabs } from "./tabs.component"
import { Tab } from "./tab.component"
import { PrimaryTab } from './primary-tab.component'
import { TabChangeEvent } from './tab-change-event'
import { TabsStatusEvent } from './tab-status-event'
import {ComponentCommunicatorEvent} from './component-status-event'

@Directive({
    selector: 'tab-container, [tab-container]'
})
export class TabContainer implements OnInit, OnDestroy{

    static readonly NEW: string = "new";
    static readonly VIEW: string = "view";
    static readonly EDIT: string = "edit";


    @Output() tabChanging: EventEmitter<TabChangeEvent> = new EventEmitter();
    @Output() tabChanged:EventEmitter<any> = new EventEmitter();
    @Output() tabStatusChanged: EventEmitter<TabsStatusEvent> = new EventEmitter();
    private tabsRef: ComponentRef<Tabs>;
    private intialized: boolean = false;
    private theForm:FormGroup;

    private _compName: Array<string>;
    @Input() set componentNames(value: Array<string>) {
        this._compName = value;
    }
    get componentNames() {
        return this._compName
    }
    @Input() set state(value: string){
        this._state = value;
        if(this.intialized){
            this.tabsRef.instance.state = this._state;
            this.tabsRef.instance.tabs.forEach(tab =>{
                tab.getComp().setState(this._state);
                }
            )
        }
    }
    get state():string{
        return this._state;
    }
    private _state:string;

    isInitalize():boolean{
        return this.intialized
    }



    constructor(private cdr: ChangeDetectorRef,
                private compFR: ComponentFactoryResolver,
                private viewContainer: ViewContainerRef,
                private route: ActivatedRoute,
                private fb: FormBuilder) {

    }
    
    private validIndexes(start: number, end: number, tabLength: number): boolean {
        if (start < 0) {
            return false;
        }
        if (end > tabLength) {
            return false;
        }
        return true;
    }

    private communicate(event: ComponentCommunicatorEvent, tabs: Tab[]): void {

        let tabId = event.index;
        let status:boolean = event.status === "VALID"? true : false;

        // this is a callback function
        const changeStatusByIndex = (stat = true, start?: number, end?: number): void => {


            if (start != undefined && end != undefined) { // if they provide 0 or 1 for indexes 'if' sees that as true or false
                if (this.validIndexes(start, end, tabs.length)) {
                    for (let i = start; i < end; i++) {
                        if (stat) {
                            tabs[i].enable = true;
                        }
                        else {
                            tabs[i].enable = false;
                        }

                    }
                }
            }
            else if (status) { // no range provided, just enable next tab if form is valid
                let nextId = this.activeId + 1 < tabs.length ? this.activeId + 1 : -1;
                if (!(nextId === -1) && this.activeId === tabId) {
                    tabs[nextId].enable = stat;
                }
            }


        };

        changeStatusByIndex();// no range provided, just enable next tab if form is valid

        // Will default to enabling tabs, but handler that executes from the tab-container externally has last say
        this.tabStatusChanged.emit({currentStatus:status, statusOfTabs: changeStatusByIndex, tabId: tabId, tabLength: tabs.length});
        this.childFormStatusChanges(event.status,event.form,event.index);

    }
    private initNew(tabList:Array<string>){
        let childForms:FormArray = (<FormArray>this.theForm.controls["childForms"]);
        if(this.tabsRef.instance.tabs.length > 1 ){
           this.tabsRef.instance.clearTabs();
           let startLength =  childForms.length;
            for (let i=1; i < startLength; i++) {
                childForms.removeAt(childForms.length -1 ); // leaving SetupTab
            }
        }

        /* the code below is forcing 'theForm'(main parent form) to be invalid. So when it's children Forms are added to 'theForm'
           if at least one of children forms are invalid, then there will be no change in parent form's status since it is currently invalid.
           This will make angular's change detection not throw expressionChangedAfterBeingCheckError

           We do not need to change theForm's  status back to valid(remove required error) after since it will automatically override it as the user
           fills out the forms on later tabs.
         */

        this.componentNames = tabList;
        this.initTabs();
        this.tabCommunication(this.tabsRef.instance.tabs);

        let firstForm:FormGroup = <FormGroup>childForms.at(0);

        if(firstForm.valid){ // could
            this.tabsRef.instance.tabs[0].getComp().changeStatus.emit({status:firstForm.status,form:firstForm,index:0})
        }

    }


    private tabCommunication(tabs: Tab[]): void {
        tabs.map(tab => {
            tab.getComp().changeStatus.subscribe(event => this.communicate(event,tabs)); // for when form become valid
        });
        this.tabsRef.instance.tabChanging.subscribe(event => {
            this.tabChanging.emit(event);
        });
        this.tabsRef.instance.tabChanged.subscribe(event => {
            this.tabChanged.emit(event);
        });

    }

    private initTabs(): void {

        let tabs: Tab[] = this.tabsRef.instance.tabs;

        let factories = <Array<Function>>Array.from(this.compFR['_factories'].keys()); //Getting a factories made from EntryComponent
        let compFactoryArray: Array<Type<PrimaryTab>> = [];

        for (let i = 0; i < this.componentNames.length; i++) {
            compFactoryArray.push(<Type<PrimaryTab>>factories.find((x: any) => x.name === this.componentNames[i]))
        }

        compFactoryArray.forEach((tabComponent) => {
            this.tabsRef.instance.insertTab(tabComponent,this.theForm,this.state);
        });

        this.tabsRef.instance.state = this.state;
        this.tabsRef.instance.initContent(tabs);

    }
    private createTab():void{
        let tabsInstance = this.tabsRef.instance;
        //tabsInstance.insertTab(PrepTab,this.theForm,this.state);
        tabsInstance.initContent(tabsInstance.tabs);

        //let prepTab =<PrepTab>tabsInstance.tabs[0].getComp();
        //prepTab.initNewExperiment.subscribe(initEvent => this.initNew(initEvent)); // when new experiment selected

    }

    get activeId():number{
        return this.tabsRef.instance.activeTabId;
    }
    set activeId(activeId:number){
        this.tabsRef.instance.activeTabId = activeId;
    }
    public select(id:number){
        this.tabsRef.instance.selectTabById(id);
    }


    childFormStatusChanges(status:string,form:FormGroup,index:number):void{
        if( form.invalid && (form.touched || form.dirty)){
            this.tabsRef.instance.tabs[index].valid = false;
        }
        else if(form.valid){
            this.tabsRef.instance.tabs[index].valid = true;
        }
    }


    ngOnInit() {
        this.theForm = this.fb.group({
            childForms: this.fb.array([])
        });

        let tabsFactory = this.compFR.resolveComponentFactory(Tabs);
        this.tabsRef = this.viewContainer.createComponent(tabsFactory);
        this.tabsRef.instance.tabs = [];

        if(this.state == TabContainer.NEW){
            this.createTab();
        }else{
            this.initTabs();
            this.tabCommunication(this.tabsRef.instance.tabs);
        }


        this.intialized = true;

    }
    ngAfterViewInit(){
    }




    removeTab(index?:number){
        this.tabsRef.instance.removeTab(index);
    }
    addTab(tabName:string,index?:number){
        let factories = <Array<Function>>Array.from(this.compFR['_factories'].keys()); //Getting a factories made from EntryComponent
        let compFactory: Type<PrimaryTab>= null;

       compFactory= <Type<PrimaryTab>>factories.find((x: any) => x.name === tabName);
       this.tabsRef.instance.externalInsertTab(compFactory,this.theForm,index);
    }
    /*If tab is found it will return its index, if not -1*/
    containsTab(tabName:string):number{
        let tabs:Array<Tab> =this.tabsRef.instance.tabs;
        let pos = -1;
        for(let i = 0; i < tabs.length; i++){
            if(tabs[i].getComp().constructor.name === tabName){
                pos = i;
                break;
            }
        }
        return pos;
    }
    ngOnDestroy() {
        this.tabsRef.destroy();
        this.tabsRef = null;
        this.tabChanged.unsubscribe();
        this.tabStatusChanged.unsubscribe();
        this.tabChanging.unsubscribe();
    }


}