import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input,
  ViewChild
} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

let nextId = 0;

@Component({
  selector: 'custom-input',
  templateUrl: "./custom-input.component.html",
  styleUrls: ['./custom-input.component.scss']
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
