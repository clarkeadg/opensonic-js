
import { video_getScale } from "./video"

export default class VirtualJoystick {
  constructor(opts = {}) {
    this._container = opts.container || document.body;
    this._strokeStyle = opts.strokeStyle || 'cyan';
    this._mouseSupport = opts.mouseSupport !== undefined ? opts.mouseSupport : false;
    this._stationaryBase = opts.stationaryBase || false;
    this._baseX = this._stickX = opts.baseX || 0
    this._baseY = this._stickY = opts.baseY || 0
    this._limitStickTravel = opts.limitStickTravel || false
    this._stickRadius = opts.stickRadius !== undefined ? opts.stickRadius : 100

    this._pressed = false;
    this._touchIdx = null;

    const __bind = (fn, me) => function() {
      return fn.apply(me, arguments);
    };
    this._$onTouchStart = __bind(this._onTouchStart, this);
    this._$onTouchEnd = __bind(this._onTouchEnd, this);
    this._$onTouchMove = __bind(this._onTouchMove, this);
    this._container.addEventListener('touchstart', this._$onTouchStart, false);
    this._container.addEventListener('touchend', this._$onTouchEnd, false);
    this._container.addEventListener('touchmove', this._$onTouchMove, false);
    if (this._mouseSupport) {
      this._$onMouseDown = __bind(this._onMouseDown, this);
      this._$onMouseUp = __bind(this._onMouseUp, this);
      this._$onMouseMove = __bind(this._onMouseMove, this);
      this._container.addEventListener('mousedown', this._$onMouseDown, false);
      this._container.addEventListener('mouseup', this._$onMouseUp, false);
      this._container.addEventListener('mousemove', this._$onMouseMove, false);
    }
  }

  destroy() {

    //this._container.removeChild(this._baseEl);
    //this._container.removeChild(this._stickEl);

    this._container.removeEventListener('touchstart', this._$onTouchStart, false);
    this._container.removeEventListener('touchend', this._$onTouchEnd, false);
    this._container.removeEventListener('touchmove', this._$onTouchMove, false);
    if (this._mouseSupport) {
      this._container.removeEventListener('mouseup', this._$onMouseUp, false);
      this._container.removeEventListener('mousedown', this._$onMouseDown, false);
      this._container.removeEventListener('mousemove', this._$onMouseMove, false);
    }
  }

  /**
   * @returns {Boolean} true if touchscreen is currently available, false otherwise
   */
  static touchScreenAvailable() {
    return 'createTouch' in document ? true : false;
  }

  //////////////////////////////////////////////////////////////////////////////////
  //                    //
  //////////////////////////////////////////////////////////////////////////////////

  deltaX() {
    return this._stickX - this._baseX;
  }

  deltaY() {
    return this._stickY - this._baseY;
  }

  up() {
    if (this._pressed === false) return false;
    const deltaX = this.deltaX();
    const deltaY = this.deltaY();
    if (deltaY >= 0) return false;
    if (Math.abs(deltaX) > 2 * Math.abs(deltaY)) return false;
    return true;
  }

  down() {
    if (this._pressed === false) return false;
    const deltaX = this.deltaX();
    const deltaY = this.deltaY();
    if (deltaY <= 0) return false;
    if (Math.abs(deltaX) > 2 * Math.abs(deltaY)) return false;
    return true;
  }

  right() {
    if (this._pressed === false) return false;
    const deltaX = this.deltaX();
    const deltaY = this.deltaY();
    if (deltaX <= 0) return false;
    if (Math.abs(deltaY) > 2 * Math.abs(deltaX)) return false;
    return true;
  }

  left() {
    if (this._pressed === false) return false;
    const deltaX = this.deltaX();
    const deltaY = this.deltaY();
    if (deltaX >= 0) return false;
    if (Math.abs(deltaY) > 2 * Math.abs(deltaX)) return false;
    return true;
  }

  //////////////////////////////////////////////////////////////////////////////////
  //                    //
  //////////////////////////////////////////////////////////////////////////////////

  _onUp() {
    this._pressed = false;

    if (this._stationaryBase == false) {

      this._baseX = this._baseY = 0;
      this._stickX = this._stickY = 0;
    }
  }

  _onDown(x, y) {
    this._pressed = true;
    const videoScale = video_getScale();
    //console.log(videoScale)
    x = x * videoScale.x;
    y = y *videoScale.y;
    if (this._stationaryBase == false) {
      //this._baseX = x;
      //this._baseY = y;     
    }

    // relative position from base
    //this._stickX = x - this._baseX;
    //this._stickY = y - this._baseY;

    this._stickX = x;
    this._stickY = y;

    //console.log(this._baseX,this._baseY)
    //console.log(this._stickX,this._stickY,this._stickRadius)

    /*if (this._limitStickTravel === true) {
      const deltaX = this.deltaX();
      const deltaY = this.deltaY();
      //console.log(deltaX, deltaY)
      const stickDistance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
      if (stickDistance > this._stickRadius) {
        const stickNormalizedX = deltaX / stickDistance;
        const stickNormalizedY = deltaY / stickDistance;

        this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
        this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
      }
    }*/

  }

  _onMove(x, y) {
    const videoScale = video_getScale();
    x = x * videoScale.x;
    y = y * videoScale.y;
    if (this._pressed === true) {
      //this._stickX = x - this._baseX;
      //this._stickY = y - this._baseY;

      this._stickX = x;
      this._stickY = y;

      /*if (this._limitStickTravel === true) {
        const deltaX = this.deltaX();
        const deltaY = this.deltaY();
        const stickDistance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        if (stickDistance > this._stickRadius) {
          const stickNormalizedX = deltaX / stickDistance;
          const stickNormalizedY = deltaY / stickDistance;

          this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
          this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
        }
      }*/

      //this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));  
    }
  }

  /*VirtualJoystick.prototype._move = function(style, x, y) {
    if (this._transform) {
      if (this._has3d) {
        style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
      } else {
        style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
      }
    } else {
      style.left = x + 'px';
      style.top = y + 'px';
    }
  }*/


  //////////////////////////////////////////////////////////////////////////////////
  //    bind touch events (and mouse events for debug)      //
  //////////////////////////////////////////////////////////////////////////////////

  _onMouseUp(event) {
    return this._onUp();
  }

  _onMouseDown(event) {
    event.preventDefault();
    const x = event.clientX;
    const y = event.clientY;
    return this._onDown(x, y);
  }

  _onMouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    return this._onMove(x, y);
  }

  //////////////////////////////////////////////////////////////////////////////////
  //    comment               //
  //////////////////////////////////////////////////////////////////////////////////

  _onTouchStart(event) {
    // if there is already a touch inprogress do nothing
    if (this._touchIdx !== null) return;

    // notify event for validation
    const isValid = this.dispatchEvent('touchStartValidation', event);
    if (isValid === false) return;

    // dispatch touchStart
    this.dispatchEvent('touchStart', event);

    event.preventDefault();
    // get the first who changed
    const touch = event.changedTouches[0];
    //console.log(touch)
    // set the touchIdx of this joystick
    this._touchIdx = touch.identifier;

    // forward the action
    const x = touch.pageX;
    const y = touch.pageY;
    //console.log('TOUCH',x,y)
    return this._onDown(x, y)
  }

  _onTouchEnd(event) {
    // if there is no touch in progress, do nothing
    if (this._touchIdx === null) return;

    // dispatch touchEnd
    this.dispatchEvent('touchEnd', event);

    // try to find our touch event
    const touchList = event.changedTouches;
    for (var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
    // if touch event isnt found, 
    if (i === touchList.length) return;

    // reset touchIdx - mark it as no-touch-in-progress
    this._touchIdx = null;

    //??????
    // no preventDefault to get click event on ios
    event.preventDefault();

    return this._onUp()
  }

  _onTouchMove(event) {
    // if there is no touch in progress, do nothing
    if (this._touchIdx === null) return;

    // try to find our touch event
    const touchList = event.changedTouches;
    for (var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
    // if touch event with the proper identifier isnt found, do nothing
    if (i === touchList.length) return;
    const touch = touchList[i];

    event.preventDefault();

    const x = touch.pageX;
    const y = touch.pageY;
    return this._onMove(x, y)
  }

  //////////////////////////////////////////////////////////////////////////////////
  //    render
  //////////////////////////////////////////////////////////////////////////////////

  render(ctx) {

    //console.log('RENDER JOYSTICK',this._baseX,this._baseY)

    // render Joystick Base
    ctx.beginPath();
    ctx.strokeStyle = this._strokeStyle;
    ctx.lineWidth = 3;
    ctx.arc(this._baseX, this._baseY, 20, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this._strokeStyle;
    ctx.lineWidth = 1;
    ctx.arc(this._baseX, this._baseY, 30, 0, Math.PI * 2, true);
    ctx.stroke();

    // render stick
    if (this._pressed) {
      ctx.beginPath();
      ctx.strokeStyle = this._strokeStyle;
      ctx.lineWidth = 3;
      ctx.arc(this._stickX, this._stickY, 20, 0, Math.PI * 2, true);
      //ctx.arc( this._stickX - (this._stickRadius/2), this._stickY - (this._stickRadius/2), 20, 0, Math.PI*2, true); 
      ctx.stroke();
    }
  }
}

((destObj => {
  destObj.addEventListener = function(event, fct) {
    if (this._events === undefined) this._events = {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
    return fct;
  };
  destObj.removeEventListener = function(event, fct) {
    if (this._events === undefined) this._events = {};
    if (event in this._events === false) return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  };
  destObj.dispatchEvent = function(event /* , args... */ ) {
    if (this._events === undefined) this._events = {};
    if (this._events[event] === undefined) return;
    const tmpArray = this._events[event].slice();
    for (let i = 0; i < tmpArray.length; i++) {
      const result = tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1));
      if (result !== undefined) return result;
    }
    return undefined
  };
}))(VirtualJoystick.prototype);