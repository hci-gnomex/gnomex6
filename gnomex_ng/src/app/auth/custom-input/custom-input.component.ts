import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input,
  ViewChild
} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

let nextId = 0;

@Component({
  selector: 'custom-input',
  templateUrl: "./custom-input.component.html",
  styles: [`

    .no-overflow {
      overflow: hidden;
    }

    .special-height {
      line-height: 1.5;
      max-height: calc(2.9em + 2px);
    }

    .invisible-background {
      background-color: rgba(255, 255, 255, 0);
    }

    .label {
      color: #495057;
      width: 100%;
      height: fit-content;
      padding: 0 0.7em 0 0.7em;
    }

    #myLabel {
      position: relative;
      padding-left: 1em;
      z-index: 500;
    }

    input {
      color: rgba(0,0,0,255);
      background-color: #FFFFFF;
      padding: 0.9em 0.7em 0.5em 1.4em;
      border: 1px solid #CCCCCC;
    }

    .roundTop {
      border-radius: 4px 4px 0 0;
    }

    .roundBottom {
      border-radius: 0 0 4px 4px;
    }

    .noTopBorder {
      border-top: 0 solid #CCCCCC;
    }

    .login-form {
      transition: all .3s;
    }

    input:focus {
      color: rgba(0,0,0,255);
      background-color: white;
      transition: all .3s;
    }

    input:focus+div {
      font-size: 8pt;
      z-index: 500;
      position: relative;
      background-color: white;
      transition: all .3s;
    }

    input:focus+div>div>label {
      border-bottom: 1px solid rgba(222, 222, 222, 255);
      color: #495057;
      transition: all .3s;
    }

    input:not:placeholder-shown+div {
      font-size: 8pt;
      top: -3.5em;
      left: 0.5em;
      z-index: 5;
      position: relative;
      transition: all .3s;
    }

    input:not:placeholder-shown+div {
      border-bottom: 1px solid rgba(222, 222, 222, 255);
      color: #495057;
      transition: all .3s;
    }

    input:valid {
      color: rgba(0,0,0,255);
      z-index:999;
      background-repeat:no-repeat;
      background-position:3px 19px;
      background-size:16px 16px;
      transition: all .3s;
    }

    input:valid+div {
      font-size: 8pt;
      top: -3.5em;
      left: 0.5em;
      z-index: 5;
      position: relative;
      align-items: flex-start;
      background-color: rgba(255, 255, 255, 0);

      transition: all .3s;
    }


    input:invalid:not:focus~div>div>label {
      color: #800;
      border-bottom: solid #800 1px;
      transition: all .3s;
    }

    input:invalid:focus ~ .tooltip {
      color: rgba(255,255,255,255);
      display: block;
      transition: all .3s;
    }

    input:placeholder-shown ~ .tooltip {
      color: rgba(255,255,255,255);
      display: none;
      transition: all .3s;
    }

    input~div {
      z-index: 5;
      position: relative;
      background-color: white;
      transition: all .3s;
    }

    input:focus~div {
      font-size: 8pt;
      position: relative;
      background-color: rgba(255,255,255,0);
      align-items: flex-start;
      transition: all .3s !important;
    }

    input:placeholder-shown~div {
      top: -2.5em;
      left: 1.0em;
      z-index: 5;
      position: relative;
      transition: all .3s;
    }

    .tooltip {
      z-index: 100;
      display: none;
      position: absolute;
      left: 20px;
      top: 60px;
      right: 20px;
      padding: 10px;
      font-size: 14px;
      background-color: black;
      color: white;
      box-shadow: 1px 1px 3px 1px black;
      transition: all .3s;
    }
    .tooltip:after {
      content: "";
      display: block;
      position: absolute;
      bottom: 100%;
      left:10px;
      border-bottom: 10px solid black;
      border-top: 0 solid transparent;
      border-right: 10px solid transparent;
      border-left: 10px solid transparent;
      transition: all .3s;
    }
    .tooltip > label {
      position: absolute;
      color: #888;
      font-size: 20px;
      padding: 0 20px;
      background-color: white;
      left: 6px;
      top: 20px;
      bottom: 1px;
      right: 6px;
      cursor:text;
      transition: all .3s;
    }

  `]
})
export class CustomInputComponent implements AfterViewInit {

  @ViewChild("myInput", {static: false})   myInput:   ElementRef;
  @ViewChild("myLabel", {static: false})   myLabel:   ElementRef;
  @ViewChild("myTooltip", {static: false}) myTooltip: ElementRef;

  /** Unique id so each instance gets its own <label for="..."> / input id pair. */
  public readonly inputId: string = `custom-input-${++nextId}`;

  @Input("type")        type: string = 'text';

  @Input("roundTop")    roundTop   : boolean = true;
  @Input("roundBottom") roundBottom: boolean = true;

  @Input("noTopBorder") noTopBorder: boolean = false;

  @Input("label")       label: string = 'label';
  @Input("tooltip")     tooltip: string = 'tooltip';


  @Input("placeholder") public set placeholder(value: string) {
    if (value) {
      this._placeholder = value;
    } else {
      this._placeholder = ' ';
    }
  };

  public get placeholder(): string {
    return this._placeholder;
  }

  private _placeholder: string = ' ';

  @Input("form") set formGroup(value: FormGroup) {
    if (value) {
      this.outerFormGroup = value;

      if (this._formControlName) {
        this.outerFormGroup.addControl(this._formControlName, this._form.get('inputControl'));
        this.changeDetectorRef.detectChanges();
      }
    } else {
      this.outerFormGroup = null;
    }
  };

  @Input("formControlNameToUse") set formControlNameToUse(value: string) {
    if (value) {
      this._formControlName = value;

      if (this.outerFormGroup) {
        this.outerFormGroup.addControl(this._formControlName, this._form.get('inputControl'));
        this.changeDetectorRef.detectChanges();
      }
    } else {
      this._formControlName = null;
    }
  };

  private outerFormGroup: FormGroup;
  private _formControlName: string;


  public get labelStyle(): any {
    let style: any = {
      'position'       : 'relative',
      'z-index'        : '500',
      'height'         : this.labelHeight,
      'width'          : this.labelWidth,
      'top'            : this.labelTop,
      'left'           : this.labelLeft,
      'pointer-events' : 'none',
      'transition'     : 'all 0.3s'
    };

    return style;
  }

  public divStyle: any  = { };

  public _form: FormGroup;

  public get isRequired(): boolean {
    const control = this._form ? this._form.get('inputControl') : null;
    if (!control || !control.validator) { return false; }
    const result = control.validator({ value: '' } as any);
    return !!(result && result['required']);
  }

  private labelHeight: string = 'fit-content';
  private labelWidth:  string = 'fit-content';
  private labelTop:    string = '0';
  private labelLeft:   string = '1px';

  public showLabel: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef) {
    this._form = this.formBuilder.group({ inputControl: [] });
  }

  ngAfterViewInit(): void {
    this.labelHeight = '' + (this.myInput.nativeElement.offsetHeight - 2) + 'px';
    this.labelWidth  = '' + (this.myInput.nativeElement.offsetWidth - 2)  + 'px';
    this.labelTop    = '' + (-this.myInput.nativeElement.offsetHeight + 1) + 'px';

    setTimeout(() => {
      this.showLabel = true;
    });
  }

  public onClick(event?: any): void {
    console.log('Clicked');
  }
}
