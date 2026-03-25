import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {TreeKeyboardMoveService} from '../util/accessibility/tree-keyboard-move.service';
import {AriaAnnouncerService} from '../util/accessibility/aria-announcer.service';

import {ExperimentsService} from './experiments.service';
import {
  ITreeOptions,
  ITreeState,
  KEYS,
  TREE_ACTIONS,
  TreeComponent,
  TreeModel,
  TreeNode
} from '@circlon/angular-tree-component';
import {BrowseFilterComponent} from '../util/browse-filter.component';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {ActivatedRoute, NavigationEnd, NavigationExtras, ParamMap, Router} from '@angular/router';
import {CreateSecurityAdvisorService} from '../services/create-security-advisor.service';
import {CreateProjectComponent} from './create-project.component';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MoveToDialogComponent, MoveToDialogResult, MoveToTarget} from '../util/move-to-dialog/move-to-dialog.component';
import {LabListService} from '../services/lab-list.service';
import {DialogsService, DialogType} from '../util/popup/dialogs.service';
import {DeleteProjectComponent} from './delete-project.component';
import {ReassignExperimentComponent} from './reassign-experiment.component';
import {DeleteExperimentComponent} from './delete-experiment.component';
import {DictionaryService} from '../services/dictionary.service';
import {PropertyService} from '../services/property.service';
import {GnomexService} from '../services/gnomex.service';
import {HttpParams} from '@angular/common/http';
import {UtilService} from '../services/util.service';
import {filter} from 'rxjs/operators';
import {ITreeNode} from "@circlon/angular-tree-component/lib/defs/api";
import {ActionType} from '../util/interfaces/generic-dialog-action.model';
import {ConstantsService} from '../services/constants.service';
import {NavigationService} from '../services/navigation.service';

const VIEW_LIMIT_EXPERIMENTS = 'view_limit_experiments';

@Component({
    selector: 'experiments',
    templateUrl: './browse-experiments.component.html',
    styles: [`


        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }

        .half-width { width: 50%; }

        .vertical-center { vertical-align: middle; }
        .horizontal-center { text-align: center; }

        .vertical-spacer {
            height: 0.3em;
            min-height: 0.3em;
        }


        .padding { padding: 0.3em; }

        .left-right-padding {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }

        .major-left-right-padding {
            padding-left:  1em;
            padding-right: 0.3em;
        }

        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }

        .border { border: #C8C8C8 solid thin; }
        .background-border {
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }

        .no-overflow  { overflow:    hidden; }
        .no-word-wrap { white-space: nowrap; }

        .allow-line-breaks {
            white-space: pre-line;
        }
        .background-lightyellow {
            background-color: lightyellow;
        }

    `]
})

export class BrowseExperimentsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('tree', {static: false}) treeComponent: TreeComponent;
    toggleButton = 'Expand Projects';

    /**
     angular2-tree options
     */
    public options: ITreeOptions;
    public state: ITreeState;
    public showEmptyFolders = false;
    public items: any;
    public responseMsg = '';
    public experimentCount = '0';
    public experimentCountMessage = '';
    public disableNewProject = true;
    public disableDeleteProject = true;
    public disableDeleteExperiment = true;
    public disableAll = false;
    public lookupLab = '';

    public readonly DRAG_DROP_HINT: string =
        'Drag and drop to move an experiment to another group. ' +
        'Keyboard alternative: navigate with arrow keys, press Space to grab an item, ' +
        'navigate to the destination folder, then press Enter to drop. Press Escape to cancel.';

    public readonly KB_MOVE_INSTRUCTIONS: string =
        'To move an experiment without dragging: navigate to it with arrow keys, ' +
        'press Space to grab, navigate to the destination folder, ' +
        'then press Enter to drop. Press Escape to cancel.';
    public showDragDropHint = false;
    private currentItem: any;
    private targetItem: any;
    private labs: any;
    private labMembers: any;
    private billingAccounts: any;
    private dragEndItems: any;
    private selectedItem: any;
    private showBillingCombo = false;
    private labList: any[] = [];
    private selectedExperiment: any;
    private projectRequestListSubscription: Subscription;
    private labListSubscription: Subscription;
    private navEndSubscription: Subscription;
    private parentProject: any;
    private setActiveNodeId: string;
    private canDeleteProjectSubscription: Subscription;
    private qParamMap: ParamMap;
    private paramMap: ParamMap;
    private _treeModel: TreeModel | null = null;

    public get treeModel(): TreeModel | null {
      if (!this._treeModel && this.treeComponent) {
        this._treeModel = this.treeComponent.treeModel;
      }
      return this._treeModel;
    }

    constructor(public experimentsService: ExperimentsService,
                private changeDetectorRef: ChangeDetectorRef,
                private utilService: UtilService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private labListService: LabListService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,
                private router: Router,
                private navService: NavigationService,
                public constantsService: ConstantsService,
                public treeKbMove: TreeKeyboardMoveService,
                private ariaAnnouncer: AriaAnnouncerService,
                private matDialog: MatDialog) {

    }


    ngOnInit() {
        this.experimentsService.currentTabIndex = 0;
        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];

        this.options = {
          displayField: 'label',
          childrenField: 'items',
          useVirtualScroll: true,
          nodeHeight: 22,
          actionMapping: {
            keys: {
              [KEYS.ENTER]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                if (this.treeKbMove.isGrabbing) {
                  this._kbDrop(node, $event.ctrlKey);
                } else {
                  TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
                }
              },
              [KEYS.SPACE]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                $event.preventDefault();
                if (this.treeKbMove.isGrabbing) {
                  // Second Space press: replace grab with the current node
                  this._kbGrab(node);
                } else {
                  this._kbGrab(node);
                }
              },
              // Escape (keyCode 27) is absent from the KEYS enum; use raw code
              [27]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                if (this.treeKbMove.isGrabbing) {
                  this.treeKbMove.cancel();
                }
              },
              [KEYS.RIGHT]: undefined,
              [KEYS.LEFT]: undefined,
            }
          },
          nodeClass: (node: TreeNode) => {
            let cls = 'icon-' + node.data.icon;
            if (this.treeKbMove.isGrabbedNode(node))    { cls += ' keyboard-grabbed'; }
            if (this.isKbDropTarget(node))              { cls += ' keyboard-drop-target'; }
            else if (this._isKbDropInvalid(node))       { cls += ' keyboard-drop-invalid'; }
            return cls;
          },
          allowDrop: (element, { parent, index }) => {
            this.dragEndItems = _.cloneDeep(this.items);
            if (parent.data.labName) {
              return false;
            } else {
              return true;
            }
          },

          allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && node.isLeaf && node.data.idRequest,
      };

        this.navService.navMode = this.navService.navMode !== NavigationService.USER ? NavigationService.URL : NavigationService.USER;


        this.experimentsService.startSearchSubject.subscribe((value) => {
            if (value) {
                this.dialogsService.startDefaultSpinnerDialog();
            }
        });


        this.projectRequestListSubscription = this.experimentsService.getProjectRequestListObservable().subscribe(response => {

            this.lookupLab = '';
            this.experimentCount = response.experimentCount ? response.experimentCount : '0';
            this.experimentCountMessage = response.message ? '(' + response.message + ')' : '';

            if (this.experimentCount === '0' && !response.Lab) {
                this.dialogsService.stopAllSpinnerDialogs();
                this.dialogsService.error('Insufficient permission to access this request or this lab.', 'INVALID');
                return;
            }

            this.buildTree(response.Lab);
            this.onShowEmptyFolders(this.showEmptyFolders);
          // tslint:disable-next-line:max-line-length
            setTimeout(() => {
              if (this.treeComponent && this.treeComponent.treeModel) {
                this.treeComponent.treeModel.update();
              }
            });


            if (this.experimentsService.getExperimentPanelParam('refreshParams')) {
                this.experimentsService.emitExperimentOverviewList(response.Lab);
                this.experimentsService.setExperimentPanelParam('refreshParams', false);

                if (this.treeModel && this.treeModel.getActiveNode()) {// Refresh to initial state when search button clicked
                    this.treeModel.getActiveNode().setIsActive(false);
                    this.treeModel.setFocusedNode(null);
                }
                this.disableNewProject = true;
                this.disableDeleteProject = true;
                this.disableDeleteExperiment = true;
            }


            setTimeout(() => {
                this.toggleButton = 'Collapse Projects';
                const model = this.treeComponent ? this.treeComponent.treeModel : null;
                if (!model) {
                  // view not ready yet; skip
                  this.dialogsService.stopAllSpinnerDialogs();
                  return;
                }

                model.expandAll();
                if (this.navService.navMode === NavigationService.URL) {
                    const activatedRoute = this.navService.getChildActivateRoute(this.route);
                    if (activatedRoute) {
                        this.paramMap =  activatedRoute.snapshot.paramMap;
                        this.qParamMap = activatedRoute.snapshot.queryParamMap;
                        // activatedRoute.queryParamMap.subscribe((qParam)=>{this.qParamMap = qParam });
                        // activatedRoute.paramMap.subscribe((param)=>{ this.paramMap = param });
                    }


                    let idName = '';
                    let idVal = '';
                    if (this.paramMap.get('idRequest') ) {
                       idName = 'idRequest';
                       idVal = this.paramMap.get('idRequest');
                   } else if (this.qParamMap.get('idProject')) {
                       idName = 'idProject';
                       idVal = this.qParamMap.get('idProject');
                   } else if (this.qParamMap.get('idLab')) {
                       idName = 'idLab';
                       idVal = this.qParamMap.get('idLab');
                   }

                    if (this.treeModel) {
                        const node = UtilService.findTreeNode(this.treeModel, idName, idVal);
                        if (node) {
                            node.setIsActive(true);
                            node.scrollIntoView();
                        }
                    }
                } else if (this.setActiveNodeId) {
                    let node: TreeNode;
                    node = this.findNodeById(this.setActiveNodeId);
                    this.setActiveNodeId = '';
                    if (node) {
                        node.setIsActive(true);
                        node.scrollIntoView();
                    }
                }
                this.dialogsService.stopAllSpinnerDialogs();
            });
        });


        this.utilService.registerChangeDetectorRef(this.changeDetectorRef);

        this.labListService.getLabList_FromBackEnd();
        this.labListSubscription =  this.labListService.getLabListSubject().subscribe((response: any[]) => {
            this.labList = response;
            this.experimentsService.labList = this.labList;
        });
        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }

        this.canDeleteProjectSubscription = this.experimentsService.canDeleteProjectSubject.subscribe((canDelete: boolean) => {
            setTimeout(() => {
                this.disableDeleteProject = !canDelete;
            });
        });

        // to avoid calling get request multiple times gets the request off of route after it has been resolved.
        this.navEndSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (this.route.snapshot.firstChild) {
                    const data = this.route.snapshot.firstChild.data;
                    if (data.experiment && data.experiment.Request) {
                        this.selectedExperiment = data.experiment.Request;
                        if (this.selectedExperiment.canDelete === 'Y') {
                            this.disableDeleteExperiment = false;
                        } else {
                            this.disableDeleteExperiment = true;
                        }
                    }
                }
            });

    }

    ngAfterViewInit() {
      if (this.treeComponent) {
        // Optional: trigger initial expand if desired
        this.treeComponent.treeModel.expandAll();

      }
      this.changeDetectorRef.detectChanges();
    }


    go(event: any) {
    }

    /**
     Build the tree data
     @param
     */
    buildTree(response: any[]) {
        this.labs = [];
        this.experimentsService.filteredLabs = [];


        if (response) {
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }
            (this.items as any[]).sort(UtilService.sortObjectAlphabetically('labName'));

            this.labs = this.labs.concat(this.items);
            this.experimentsService.filteredLabs = this.labs;
            for (const lab of this.items) {
                lab.id = 'l' + lab.idLab;
                lab.parentid = -1;

                lab.icon = 'assets/group.png';
                // If there is a lab with no Project skip
                if (lab.Project) {
                    if (!this.isArray(lab.Project)) {
                        lab.items = [lab.Project];
                    } else {
                        lab.items = lab.Project;
                    }

                    for (const project of lab.items) {
                        project.icon = 'assets/folder.png';
                        project.labId = lab.labId;
                        project.id = 'p' + project.idProject;
                        project.parentid = lab.id;
                        if (project.Request) {
                            project.isEmptyFolder = false;
                            if (!this.isArray(project.Request)) {
                                project.items = [project.Request];
                            } else {
                                project.items = project.Request;
                            }
                            (project.items as any[]).sort(UtilService.sortOrderIDNumerically('requestNumber'));

                            for (const request of project.items) {
                                if (request) {
                                    if (request.label) {
                                        if (request.name) {
                                            request.label = request.requestNumber + '-' + request.name;
                                        } else {
                                            request.label = request.requestNumber;
                                        }

                                        request.id = 'r' + request.idRequest;
                                        request.parentid = project.id;
                                    } else {
                                        console.log('label not defined');
                                    }
                                } else {
                                    console.log('r is undefined');
                                }
                            }
                        } else {
                            project.isEmptyFolder = true;
                        }
                    }
                }
            }
        } else {
            this.treeUpdateData({});
        }
    }


    treeUpdateData(event) {
        if (this.experimentsService.startSearchSubject.getValue() === true) {

            this.dialogsService.stopAllSpinnerDialogs();
            // this.showSpinner = false;
            this.experimentsService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }


    /**
     Start of Ng2 tree
     */
    onMoveNode($event) {
        console.log(
            'Moved',
            $event.node.name,
            'to',
            $event.to.parent.name,
            'at index',
            $event.to.index);
        this.currentItem = $event.node;
        this.targetItem = $event.to.parent;

        // WCAG 4.1.3: announce the drag-drop action to screen readers.
        // The reassignment dialog that opens next will further confirm the move.
        const expLabel  = $event.node.label  || $event.node.requestNumber || 'Experiment';
        const projLabel = $event.to.parent.label || $event.to.parent.name  || 'project';
        this.ariaAnnouncer.announce(
            `Moving ${expLabel} to ${projLabel}. A reassignment confirmation dialog has opened.`
        );

        this.getLabUsers($event);
    }

    /**
     Determine if the object is an array
     @param what
     */
    isArray(what) {
        return Object.prototype.toString.call(what) === '[object Array]';
    }

    detailFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = 'http://localhost/gnomex/experiments/' + keywords;
        };
    }

    showReassignWindow() {
        const configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '40em';
        configuration.autoFocus = false;
        configuration.data = {
            labMembers:         this.labMembers,
            billingAccounts:    this.billingAccounts,
            currentItem:        this.currentItem,
            targetItem:         this.targetItem,
            showBillingCombo:   this.showBillingCombo
        };

        this.dialogsService.genericDialogContainer(ReassignExperimentComponent,
            'Reassignment', this.constantsService.ICON_FOLDER_ADD, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: 'Yes', internalAction: 'reassignYesButtonClicked'},
                    {type: ActionType.SECONDARY, name: 'No', internalAction: 'onClose'}
                ]}).subscribe((result: any) => {
            if (!result) {
                this.resetTree();
            }
        });

    }


    /**
     * Get the target lab users. Set showBillingCombo.
     * @param event
     */
    getLabUsers(event: any) {
        if (event.node.isExternal === 'N' && event.node.idLab === event.to.parent.idLab) {
            this.showBillingCombo = false;
        } else {
            this.showBillingCombo = true;
        }
        const params: HttpParams = new HttpParams()
            .set('idLab', event.to.parent.idLab);

        const lPromise = this.experimentsService.getLab(params).toPromise();
        lPromise.then(response => {
            this.buildLabMembers(response, event);
        });

    }

    /**
     * Build the users that are in the reassign Labs.
     * @param response
     * @param event
     */
    buildLabMembers(response: any, event: any) {
        this.labMembers = [];
        this.billingAccounts = [];
        const requestCategoryCoreFacility: any =
            this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY, this.currentItem.codeRequestCategory).idCoreFacility;

        let i = 0;
        if (!this.createSecurityAdvisorService.isArray(response.possibleCollaborators)) {
            response.possibleCollaborators = [response.possibleCollaborators.AppUser];
        }
        for (const user of response.possibleCollaborators) {
            if (user.isActive === 'Y') {
                this.labMembers[i] = user;
                user.label = user.firstLastDisplayName;
                i++;
            }
        }

        for (const billingAccount of response.billingAccounts) {
            if (billingAccount.isApproved === 'Y' && billingAccount.isActive === 'Y' && billingAccount.idCoreFacility === requestCategoryCoreFacility) {
                billingAccount.label = billingAccount.accountName;
                this.billingAccounts.push(billingAccount);
            }
        }
        if (!this.createSecurityAdvisorService.isArray(response.managers)) {
            response.managers = [response.managers.AppUser];
        }

        for (const manager of response.managers) {
            let found = false;

            for (const firstLastName of this.labMembers) {
                if (manager.firstLastDisplayName.indexOf(firstLastName.firstLastDisplayName) > 0 ) {
                    found = true;
                    break;
                }

            }
            if (!found) {
                if (manager.isActive === 'Y') {
                    manager.label = manager.firstLastDisplayName;
                    this.labMembers.push(manager);
                }
            }
        }
        if (this.labMembers.length < 1) {
            this.dialogsService
                .alert('Sorry, in order to reassign this experiment you must change its owner to a member of the new lab group. However,' +
                    'you do not have permission to access the member list for this lab. Please contact an administrator.', null, DialogType.FAILED)
                .subscribe(
                    res => {
                        this.resetTree();
                    }
                );
        } else {
            this.showReassignWindow();
        }

    }

    /**
     * Reset the tree to the initial state.
     */
    resetTree() {
        this.items = this.dragEndItems;
    }

    /**
     * The new project link is selected.
     * @param event
     */
    newProjectClicked(event: any) {
        if (this.items.length > 0 ) {
            let useThisLabList: any[];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
            }

            let selectedLab = '';
            if (this.selectedItem.data.idLab) {
                selectedLab = this.selectedItem.data.idLab;
            } else if (this.selectedItem.parent.data.idLab) {
                selectedLab = this.selectedItem.parent.data.idLab;
            }

            const configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = '45em';
            configuration.autoFocus = false;
            configuration.data = {
                labList:            useThisLabList,
                items:              this.items,
                selectedLabItem:    selectedLab
            };

            this.dialogsService.genericDialogContainer(CreateProjectComponent, 'New Project', this.constantsService.ICON_FOLDER_ADD, configuration,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: 'Save', internalAction: 'save'},
                        {type: ActionType.SECONDARY, name: 'Cancel', internalAction: 'cancel'}
                    ]}).subscribe((result: any) => {
                if (result) {
                    this.setActiveNodeId = 'p' + result;
                }
            });
        }
    }

    /**
     * The delete project link was selected.
     * @param event
     */
    deleteProjectClicked(event: any) {
        if (!this.selectedItem.data.isEmptyFolder) {
            this.dialogsService.alert('Project cannot be deleted because it has experiments. <br>Please reassign experiments to another project before deleting.', '', DialogType.WARNING);
            return;
        }
        const configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '30em';
        configuration.height = '15em';
        configuration.disableClose = true;
        configuration.data = { selectedItem: this.selectedItem };

        this.dialogsService.genericDialogContainer(DeleteProjectComponent, 'Warning: Delete Project',
            this.constantsService.ICON_EXCLAMATION, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: 'Yes', internalAction: 'deleteProject'},
                    {type: ActionType.SECONDARY, name: 'No', internalAction: 'cancel'}
                ]}).subscribe((result: any) => {
            if (result && this.parentProject) {
                this.setActiveNodeId = this.parentProject.data.id;
            }
        });
    }

    deleteExperimentClicked() {
        const configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '30em';
        configuration.height = '15em';
        configuration.disableClose = true;
        configuration.data = { selectedExperiment: this.selectedExperiment };

        this.dialogsService.genericDialogContainer(DeleteExperimentComponent, 'Warning: Delete Experiment', this.constantsService.ICON_EXCLAMATION, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: 'Yes', internalAction: 'deleteExperiment'},
                    {type: ActionType.SECONDARY, name: 'No', internalAction: 'cancel'}
                ]}).subscribe((result: any) => {
            if (result && this.parentProject) {
                this.setActiveNodeId = this.parentProject.data.id;
            }
        });
    }
    /**
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
        const idLab = this.selectedItem.data.idLab;
        const idProject = this.selectedItem.data.idProject;
        const idRequest = this.selectedItem.data.idRequest;

        const projectRequestListNode: Array<any> = _.cloneDeep(this.selectedItem.data);
        this.experimentsService.emitExperimentOverviewList(projectRequestListNode);
        let navArray: Array<any> = [];
        let navExtras: NavigationExtras = {};
        this.disableDeleteProject = true;

        if (this.navService.navMode === NavigationService.USER) {

            // Lab
            if (this.selectedItem.level === 1) {

                this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
                this.disableDeleteExperiment = true;

                navArray = ['/experiments',  'overview'];
                navExtras = {queryParams: { idLab, idProject: null}};
                // Project
            } else if (this.selectedItem.level === 2) {
                this.parentProject = event.node.parent;
                this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
                this.disableDeleteExperiment = true;

                navArray = ['/experiments', 'overview']; // ["/experiments" , {outlets: {"browsePanel": ["overview", {"idLab": idLab, "idProject": idProject}]}}];
                navExtras = {queryParams: { idLab, idProject}};

                // Experiment
            } else {
                navArray = ['/experiments', 'detail' , idRequest]; // ["/experiments",  {outlets: {"browsePanel": [idRequest]}}];
                this.parentProject = event.node.parent;
                this.disableNewProject = true;
                navExtras = {queryParams: { idLab, idProject: this.parentProject.data.idProject}};

            }

            navExtras.relativeTo = this.route;
            navExtras.queryParamsHandling = 'merge';
            this.dialogsService.startDefaultSpinnerDialog();
            this.router.navigate(navArray, navExtras);

        } else {
            this.navService.emitResetNavModeSubject('detail');
            this.navService.emitResetNavModeSubject('overview');
            this.dialogsService.removeSpinnerWorkItem();
        }


    }

    /**
     * The expand collapse toggle is selected.
     */
    expandCollapseClicked(): void {
        if (this.toggleButton === 'Collapse Projects') {
            this.toggleButton = 'Expand Projects';
            this.treeModel.collapseAll();
        } else {
            this.toggleButton = 'Collapse Projects';
            this.treeModel.expandAll();
        }

    }

    onClickShowDragDropHint(): void {
        this.showDragDropHint = !this.showDragDropHint;
    }

    // ─── ARIA helpers for treeNodeTemplate (WCAG 4.1 + 4.5) ─────────────────

    /**
     * Returns a human-readable `aria-roledescription` for the tree node,
     * indicating its type and (where applicable) that it is draggable.
     * Returning `null` lets Angular omit the attribute so the default role
     * description ("treeitem") is preserved for non-special nodes.
     */
    public nodeRoleDesc(node: TreeNode): string | null {
        if (node.data.idRequest) {
            const draggable = !this.createSecurityAdvisorService.isGuest && node.isLeaf;
            return draggable ? 'draggable experiment' : 'experiment';
        }
        if (node.data.idProject) { return 'project folder'; }
        if (node.data.idLab)     { return 'lab group'; }
        return null;
    }

    /**
     * Returns true when a keyboard grab is active AND this node is the
     * currently focused node AND it is a valid drop target.
     * Used by the template for `aria-selected` and by `nodeClass` for CSS.
     */
    public isKbDropTarget(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
        const focused = this.treeModel.getFocusedNode() as TreeNode;
        if (!focused || focused !== node) { return false; }
        return !node.data.labName; // mirrors the allowDrop condition
    }

    /** Returns true when focused during a grab but NOT a valid drop target. */
    private _isKbDropInvalid(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
        const focused = this.treeModel.getFocusedNode() as TreeNode;
        if (!focused || focused !== node) { return false; }
        return !!node.data.labName; // opposite of allowDrop — only lab nodes are invalid
    }

    // ─── Keyboard drag-and-drop (WCAG 2.1.1) ────────────────────────────────

    /**
     * Initiates a keyboard grab on `node` if the node is draggable.
     * Called when the user presses Space on a tree node.
     */
    private _kbGrab(node: TreeNode): void {
        const canDrag = !this.createSecurityAdvisorService.isGuest
            && node.isLeaf
            && node.data.idRequest;
        if (!canDrag) { return; }
        this.treeKbMove.grab(node, this.treeModel);
    }

    /**
     * Attempts to drop the grabbed experiment onto `targetNode`.
     * Mirrors the business logic triggered by the native drag-drop `onMoveNode` handler.
     * Called when the user presses Enter while a grab is active.
     */
    private _kbDrop(targetNode: TreeNode, ctrlKey: boolean): void {
        const state = this.treeKbMove.state;
        if (!state) { return; }

        const allowDrop = (element: any, { parent }: { parent: TreeNode }) =>
            !parent.data.labName;

        const dropped = this.treeKbMove.tryDrop(targetNode, allowDrop, ctrlKey);
        if (dropped) {
            // Reuse the existing onMoveNode handler with a synthetic event object
            this.onMoveNode({
                node: state.node.data,
                to: { parent: targetNode.data, index: 0 }
            });
        }
    }

    // ─── Phase 3: Single-pointer "Move to…" alternative (WCAG 2.5.7) ──────────

    /**
     * Collects all project nodes that are valid drop targets for the given
     * experiment node (all projects in the tree, grouped under their lab).
     */
    private _collectExpMoveTargets(sourceNode: TreeNode): MoveToTarget[] {
        const targets: MoveToTarget[] = [];

        const walk = (nodes: TreeNode[], labLabel?: string) => {
            for (const n of nodes || []) {
                if (n.data.labName) {
                    walk(n.children || [], n.data.labName);
                } else if (n.data.idProject) {
                    targets.push({
                        label: n.data.label,
                        path: labLabel || undefined,
                        data: n.data,
                    });
                }
                // Skip experiment leaf nodes
            }
        };

        if (this.treeModel) { walk(this.treeModel.roots as TreeNode[], ''); }
        return targets;
    }

    /**
     * Opens the "Move to…" dialog for a draggable experiment node.
     * Satisfies WCAG 2.5.7 by providing a single-pointer alternative to drag.
     * On selection, delegates to the existing `onMoveNode` handler which opens
     * the reassignment confirmation dialog.
     */
    public openMoveDialog(node: TreeNode, $event: MouseEvent): void {
        $event.stopPropagation();
        if (!node.isLeaf || !node.data.idRequest) { return; }
        if (this.createSecurityAdvisorService.isGuest) { return; }

        const targets = this._collectExpMoveTargets(node);
        const config = new MatDialogConfig();
        config.width = '35em';
        config.data = { sourceLabel: node.data.label, targets, allowCopy: false };

        this.matDialog.open(MoveToDialogComponent, config)
            .afterClosed()
            .subscribe((result: MoveToDialogResult | null) => {
                if (!result) { return; }
                this.onMoveNode({
                    node: node.data,
                    to: { parent: result.target.data, index: 0 }
                });
            });
    }

    ngOnDestroy(): void {

        UtilService.safelyUnsubscribe(this.navEndSubscription);
        UtilService.safelyUnsubscribe(this.projectRequestListSubscription);
        UtilService.safelyUnsubscribe(this.labListSubscription);
        UtilService.safelyUnsubscribe(this.canDeleteProjectSubscription);
        this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
        this.experimentsService.filteredLabs = undefined;
        this.experimentsService.labList = [];

    }

    onShowEmptyFolders(event: any): void {
        const hiddenNodeIds = {};

        if (!this.showEmptyFolders) {
            this.items.forEach((data) => {
                if (data && data.items) {
                    data.items.forEach((node) => {
                        if (node.isEmptyFolder) {
                            hiddenNodeIds[node.id] = true;
                        }
                    });
                }
            });
        }

        this.state = {
            ...this.state,
            hiddenNodeIds
        };

        this.changeDetectorRef.detectChanges();
    }

    private findNodeById(id: string): TreeNode {
        if (this.treeModel && this.treeModel.roots) {
            for (const lab of this.treeModel.roots) {
                if (id.substr(0, 1) === 'l') {
                    if (lab.data.id === id) {
                        return lab;
                    }
                } else {
                    if (lab.hasChildren) {
                        for (const project of lab.children) {
                            if (id.substr(0, 1) === 'p') {
                                if (project.data.id === id) {
                                    return project;
                                }
                            } else if (id.substr(0, 1) === 'r') {
                                if (project.hasChildren) {
                                    for (const experiment of project.children) {
                                        if (experiment.data.id === id) {
                                            return experiment;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

  getChildrenField(): string {
    if (!this.options) return 'NO_OPTIONS';
    const cf = (this.options as any).childrenField;
    if (cf === undefined) return 'UNDEFINED';
    if (cf === null) return 'NULL';
    if (cf === '') return 'EMPTY_STRING';
    return String(cf);
  }

  getItemsLen(node: any): any {
    const items = node && node.data ? node.data.items : null;
    return Array.isArray(items) ? items.length : (items == null ? 'null' : `not-array(${typeof items})`);
  }

  getFieldLen(node: any): any {
    const field = this.getChildrenField();
    if (!node || !node.data) { return 'no-node'; }
    const val = (node.data as any)[field];
    return Array.isArray(val) ? val.length : (val == null ? 'null' : `not-array(${typeof val})`);
  }

}
