import { Directive, ViewContainerRef, Input, HostListener } from '@angular/core';
import { NguiOverlay } from './overlay';
import { NguiOverlayManager } from './overlay-manager';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
  @Input('tooltip') tooltip: string;

  el: HTMLElement;
  overlay: NguiOverlay;

  constructor(
    public viewContainerRef: ViewContainerRef,
    public overlayManager: NguiOverlayManager
  ) {
    this.el = this.viewContainerRef.element.nativeElement;
  }

  ngAfterViewInit(): void {
    this.overlay = this.getTooltipOverlay(this.el, this.tooltip);
  }

  @HostListener('mouseenter', ["$event"])
  showTooltip($event) {
    this.overlayManager.open(this.overlay, $event);
    $event.stopPropagation();
  }

  @HostListener('mouseleave', ["$event"])
  hideTooltip($event) {
    this.overlayManager.close(this.overlay);
    $event.stopPropagation();
  }

  getTooltipOverlay(el, tooltip) {
    let tooltipEl = document.createElement('tooltip');
    tooltipEl.style.display = 'none';
    let divEl = document.createElement('div');
    divEl.innerHTML = `
       <div class='tooltip-contents'>${tooltip}</div>
    `;
    tooltipEl.appendChild(divEl);

    //el.parentElement.insertBefore(tooltipEl, el.nextSibling);
    el.appendChild(tooltipEl);

    let overlay = new NguiOverlay(tooltipEl, {
      id: 'tooltip-' + (el.id || Math.floor(Math.random()*1000000)),
      position: 'top cursor outside'
    });
    this.overlayManager.register(overlay);
    return overlay;
  }
}
