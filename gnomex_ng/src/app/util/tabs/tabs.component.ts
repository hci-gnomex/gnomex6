import {
    Component, EventEmitter, Output, Input, ViewChild, ViewContainerRef, ComponentFactory, ComponentRef,
    ComponentFactoryResolver, Type
} from '@angular/core';
import { Tab } from './tab.component';
import { TabChangeEvent } from './tab-change-event'
import { TabContainer } from './tab-container.component'
import {PrimaryTab} from "./primary-tab.component";
import {Form, FormGroup} from "@angular/forms";

@Component({
    selector: 'tabs',

    template: `        
            <ul #container class="tabs-nav">
                <li class="tab-item"  [ngClass]="{  'disable-tab':!tab.enable, 'active-tab':tab.active, 'error':!tab.valid}"
                    *ngFor="let tab of tabs" (click)="selectTab(tab)" >
                    <a class="tab-link" >
                        {{tab.title}}</a>
                </li>
            </ul>
            <ng-content></ng-content>
  `,
    styles: [require("./tabs.component.less").toString()]

})
export class Tabs {
    tabs: Tab[];
    activeTabId: number;
    state:string;
    @ViewChild('container', {read: ViewContainerRef}) tabsContainer:ViewContainerRef;

    @Output() tabChange = new EventEmitter<TabChangeEvent>();

    constructor(private compFR:ComponentFactoryResolver, private vcRef:ViewContainerRef){

    }

    initContent(tabs: Tab[]) {
        this.tabs = tabs;
        // get all active tabs
        let activeTabs = this.tabs.filter((tab) => tab.active);
        if(this.state === TabContainer.NEW){
            for(let i = 0; i < tabs.length; i++ ){
                if(i === 0){
                    tabs[i].enable = true;
                }
                else{
                    tabs[i].enable = false;
                }

            }
        }

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs[0]);
        }

    }
    removeTab(index?:number){
        if(index){
            this.tabsContainer.remove(index);
            this.tabs.splice(index,1);
        }else{
            this.tabsContainer.remove();
            this.tabs.splice(this.tabs.length  - 1, 1);
        }
    }

    clearTabs(){
        // this is a like a stack (LIFO)
        let contLength = this.tabsContainer.length - 1; // minus 2, because the last 2 will be the first tab and it's nested component

        for(let i = 0; i < contLength; i++) {

            this.tabsContainer.remove();

        }

        this.tabs.splice(1,this.tabs.length  - 1)

    }

    externalInsertTab(component: Type<PrimaryTab>,parentForm:FormGroup,index?:number ){
        this.insertTab(component,parentForm,this.state,index)
    }

    insertTab(component: Type<PrimaryTab>,parentForm:FormGroup,state:string,index:number = null){

        let compFactory =this.compFR.resolveComponentFactory(component);
        let compRef = this.vcRef.createComponent(compFactory);
        compRef.instance.theForm = parentForm;
        compRef.instance.setState(state);

        // creating the Tab with the component nested inside
        let tabFactory = this.compFR.resolveComponentFactory(Tab);
        let tabRef = this.tabsContainer.createComponent(tabFactory,index,undefined,[[compRef.location.nativeElement]]);
        tabRef.instance.title = compRef.instance.name;
        tabRef.instance.initComp(compRef);
        if(index){
            this.tabs.splice(index, 0, tabRef.instance);
        }else{
            this.tabs.push(tabRef.instance);
        }

        tabRef.changeDetectorRef.detectChanges();
    }


    selectTabById(id: number) {
        // need try catch here
        if (id < this.tabs.length && id > -1) {
            this.selectTab(this.tabs[id]);
        }

    }
    selectTab(tab: Tab) {
        // deactivate all tabs
        let selectedTabIndex: number = -1;

        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].active = false;
            this.tabs[i].getComp().tabIsActive = false;
            if (tab == this.tabs[i]) {
                selectedTabIndex = i;
            }
        }


        if (selectedTabIndex != -1 && this.tabs[selectedTabIndex].enable &&
            this.activeTabId != selectedTabIndex) {

            let defaultPrevented = false;

            this.tabChange.emit(
                { activeTabId: this.activeTabId, nextId: selectedTabIndex, preventDefault: () => { defaultPrevented = true; } });

            if (!defaultPrevented) {
                this.activeTabId = selectedTabIndex;
                tab.active = true;
                tab.getComp().tabIsActive= true;
                setTimeout(() => {
                    tab.getComp().setState(this.state);// need to run state actions like disable components when tab becomes active
                });

            }

        }
        else{ // tab did not change
            this.tabs[this.activeTabId].active = true;
            this.tabs[this.activeTabId].getComp().tabIsActive= true;

        }

        // activate the tab the user has clicked on.

    }
    isActive(tab:Tab):boolean{
        if(tab.active){
            return true
        }
        else{
            return false;
        }
    }

}
