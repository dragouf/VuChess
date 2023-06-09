function getDocumentPosition(oElement: HTMLElement): any {
  let posX: number = 0, posY: number = 0;
  if(oElement.offsetParent) {
    for(;oElement; oElement = <HTMLElement>oElement.offsetParent) {
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
    return {x: posX, y: posY};
  } else {
    return {x: oElement['x'], y: oElement['y']};
  }
}

function getMousePositionInElement(evt: MouseEvent, element: HTMLElement) {
  evt = evt || <MouseEvent>window.event;

  let posX: number = 0, posY: number = 0;
  let elPos: any = getDocumentPosition(element);

  if (evt.pageX || evt.pageY) {
    posX = evt.pageX;
    posY = evt.pageY;
  } else if (evt.clientX || evt.clientY) {
    posX = evt.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    posY = evt.clientY +
      document.body.scrollTop +
      document.documentElement.scrollTop;
  }
  return {
    x: posX - elPos.x,
    y: posY - elPos.y
  }
}

export class NguiOverlay {
  static TOP=11;  static MIDDLE=12; static BOTTOM=13;
  static LEFT=21; static CENTER=22; static RIGHT=23;
  static CURSOR=31;

  id: string;
  element: HTMLElement;
  windowOverlay: boolean;
  opened: boolean;
  type: string;  //tooltip, menu, popup
  position: any; //vertical, horizontal, inside
  constructor(el, options?: any) {
    options = options || {};
    this.id = options.id;
    this.type = options.type;
    if (!this.id) { throw "Invalid overlay id"}
    this.element = el;  // overlay wrapper element with table dsplay
    this.windowOverlay = options.windowOverlay;
    this.position = this.getPositionProperty(options.position || 'center center');
  }

  positionIt(event?: Event) {
    if (this.position.inside) {
      this.positionItInside(this.position);
    } else {
      this.positionItOutside(this.position, event);
    }
  }

  private getPositionProperty(positionStr: string): any {
    let position: any = {}, inside: boolean;
    let [vertical, horizontal, insideStr] = positionStr.split(' ');

    horizontal = horizontal || 'center';
    vertical = vertical || 'center';
    inside = (insideStr !== 'outside' || this.windowOverlay);

    position.horizontal = NguiOverlay[horizontal.toUpperCase()];
    position.vertical = NguiOverlay[vertical.toUpperCase()];
    position.inside  = inside;

    return position;
  }

  private positionItInside(position) {

    this.element.style.display = 'flex';

    //top / left positioning
    if (this.windowOverlay) {
      this.element.style.position = 'fixed';
      //works as blocker
      Object.assign(this.element.style, {
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: '0', left: '0', bottom: '0', right: '0',
        width: '100%', height: '100%'
      });
    } else {  //adjust top/left to match to parentElement
      //adjust top/left to match to parentElement
      let parentEl = this.element.parentElement;

      //works as a blocker
      Object.assign(this.element.style, {
        position: 'absolute',
        // backgroundColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: (!parentEl.style.position) ? parentEl.offsetTop + 'px' : '0px',
        left: (!parentEl.style.position) ? parentEl.offsetLeft + 'px' : '0px',
        width: parentEl.offsetWidth + 'px',
        height: parentEl.offsetHeight + 'px'
      });

    };

    //horizontal position
    switch (position.horizontal) {
      case NguiOverlay.LEFT:
        this.element.style.justifyContent = 'flex-start'; break;
      case NguiOverlay.CENTER:
        this.element.style.justifyContent = 'center';  break;
      case NguiOverlay.RIGHT:
        this.element.style.justifyContent = 'flex-end'; break;
    }

    //vertical position
    switch (position.vertical) {
      case NguiOverlay.LEFT:
        this.element.style.alignItems = 'flex-start'; break;
      case NguiOverlay.CENTER:
      case NguiOverlay.MIDDLE:
        this.element.style.alignItems = 'center'; break;
      case NguiOverlay.RIGHT:
        this.element.style.alignItems = 'flex-end'; break;
    }

  }

  private positionItOutside(position: any, event?: Event) {
    //adjust top/left to match to parentElement
    let parentEl = this.element.parentElement;

    //works as guide line?
    Object.assign(this.element.style, {
      position: 'absolute',
      pointerEvents: 'none',
      top:    parentEl.offsetTop + 'px',   //relative position to closet container
      left:   parentEl.offsetLeft + 'px',  //relative position to closet container
      width:  parentEl.offsetWidth  + 'px',
      height: parentEl.offsetHeight + 'px'
    });

    this.element.style.display = 'block';

    let elToPosition: HTMLElement = <HTMLElement>(this.element.children[0]);
    elToPosition.style.position = 'absolute';
    elToPosition.style.pointerEvents = 'auto';

    switch (position.vertical) {
      case NguiOverlay.TOP:
        elToPosition.style.bottom = this.element.offsetHeight +'px'; break;
      case NguiOverlay.BOTTOM:
        elToPosition.style.top = this.element.offsetHeight + 'px'; break;
      case NguiOverlay.LEFT:
        elToPosition.style.right = this.element.offsetWidth + 'px'; break;
      case NguiOverlay.RIGHT:
        elToPosition.style.left = this.element.offsetWidth + 'px'; break;
    }

    switch (position.horizontal) {
      case NguiOverlay.CENTER:
        elToPosition.style.left =  (this.element.offsetWidth - elToPosition.offsetWidth) / 2 + 'px';
        break;
      case NguiOverlay.LEFT:  elToPosition.style.left =  '0'; break;
      case NguiOverlay.RIGHT: elToPosition.style.right = '0'; break;
      case NguiOverlay.TOP: elToPosition.style.top = '0'; break;
      case NguiOverlay.BOTTOM: elToPosition.style.bottom = '0'; break;
      case NguiOverlay.CURSOR:
        let mousePos = getMousePositionInElement(<MouseEvent>event, this.element);
        if ( (mousePos.x + elToPosition.offsetWidth) > this.element.offsetWidth) {
          elToPosition.style.left = (this.element.offsetWidth - elToPosition.offsetWidth-5) + 'px';
        } else if (mousePos.x < elToPosition.offsetWidth/2) {
          elToPosition.style.left = '0px';
        } else {
          elToPosition.style.left = mousePos.x - elToPosition.offsetWidth/2 + 'px';
        }
        break;
    }
  }

}
