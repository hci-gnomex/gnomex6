import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appReadonly]'
})
export class ReadonlyDirective implements AfterViewInit, OnChanges {
  @Input() appReadonly: boolean = true;
  @Input() appReadonlyType: 'checkbox' | 'radio' = 'checkbox';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit() {
    this.applyReadonly();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appReadonly']) {
      this.applyReadonly();
    }
  }

  private applyReadonly() {
    if (this.appReadonly) {
      this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
    }
  }
}
