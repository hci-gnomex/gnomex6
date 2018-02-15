/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {UsersGroupsTablistComponent} from "./users-groups-tablist.component";


const ROUTES: Routes = [
    { path: "UsersGroups", component: UsersGroupsTablistComponent
    }
];

export const USERS_GROUPS_ROUTING = RouterModule.forChild(ROUTES);
