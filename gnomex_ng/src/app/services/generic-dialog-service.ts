import { Injectable } from '@angular/core';
import {FormGroup} from "@angular/forms";


@Injectable()
export class GenericDialogService {

    private form
    private dirty;
    private disable;


    constructor() {
    }

    addForm(form:{[key: string]: FormGroup|any} ){

    }

}