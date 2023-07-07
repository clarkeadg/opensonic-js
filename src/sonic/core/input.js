
import { logfile_message } from "./logfile"
import { osspec_isTouch, osspec_canGamepad } from "./osspec"
import { timer_get_delta } from "./timer"
import { v2d_new } from "./v2d"
import { video_get_backbuffer, video_get_canvas, video_getMousePos } from "./video"
import VirtualJoystick from "./virtualjoystick"

const IT_USER     = 0;
const IT_KEYBOARD = 1;
const IT_COMPUTER = 2;
const IT_JOYSTICK = 3;
const IT_MOUSE    = 4;

const IB_MAX = 9;

export const KEY_UP           = 38;
export const KEY_DOWN         = 40;
export const KEY_RIGHT        = 39;
export const KEY_LEFT         = 37;
export const KEY_SPACE        = 32;
export const KEY_LCONTROL     = 17;
export const KEY_ENTER        = 13;
export const KEY_ESC          = 27;
export const KEY_TILDA        = 192;
export const KEY_F12          = 123;
export const KEY_N            = 78;
export const KEY_B            = 66;
export const KEY_W            = 87;
export const KEY_S            = 83;
export const KEY_D            = 68;
export const KEY_A            = 65;
export const KEY_Z            = 90;
export const KEY_Y            = 89;
export const KEY_G            = 71;
export const KEY_P            = 80;

export const IB_UP     = 1;
export const IB_DOWN   = 2;
export const IB_RIGHT  = 3;
export const IB_LEFT   = 4;
export const IB_FIRE1  = 5;
export const IB_FIRE2  = 6;
export const IB_FIRE3  = 7;
export const IB_FIRE4  = 8;
export const IB_FIRE5  = 9;

/* private */

let inlist = null;
let got_joystick;
let ignore_joystick;

/* custom */
let enableVirtualJoystick = false;

/* Custom */
const arrowCodes = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  17: "lcontrol",
  32: "space",
  13: "enter",
  27: "esc",
  192: "tilda"
};

let arrows;
let joystick;
let joystick2;
let joystick3;
let joystick4;

let canGamepad;
let gp;

let mousePos = { x: 0, y: 0 };
let mouseIsDown = { left: false, middle: false, right: false };

export const input_init = () => {
  logfile_message("input_init()");

  /* initializing */
  inlist = null;

  /* mouse */
  video_get_canvas().addEventListener('contextmenu', function(e) {
    if (e.button === 2) {
     e.preventDefault();
      return false;
    }
  }, false);

  video_get_canvas().addEventListener('mousemove', function(e) {
    mousePos = video_getMousePos(video_get_canvas(), e);
  }, false);

  video_get_canvas().addEventListener('mousedown', function(e) {
    //console.log('mousedown', e)
    switch(e.which) {
      case 1:
        mouseIsDown.left = true;
      break;
      case 2:
        mouseIsDown.middle = true;
      break;
      case 3:
        mouseIsDown.right = true;
      break;
    }
  }, false);

  video_get_canvas().addEventListener('mouseup', function(e) {
    //console.log('mouseup', e)
    switch(e.which) {
      case 1:
        mouseIsDown.left = false;
      break;
      case 2:
        mouseIsDown.middle = false;
      break;
      case 3:
        mouseIsDown.right = false;
      break;
    }
  }, false);

  /* joystick */
  got_joystick = false;
  ignore_joystick = false;

  canGamepad = osspec_canGamepad();
  console.log('canGamepad', canGamepad)

  enableVirtualJoystick = osspec_isTouch();

  if (enableVirtualJoystick) {

    console.log('21111',video_get_canvas())

    /* bottom left virtual joystick */
    joystick = new VirtualJoystick({
      container: video_get_canvas(),
      strokeStyle: '#eee',
      mouseSupport: true,
      stationaryBase: true,
      baseX: 70,
      baseY: 200,
      //baseX: 70,
      //baseY: video_get_canvas().height - 80,
      limitStickTravel: true,
      stickRadius: 50
    });
    joystick.addEventListener('touchStartValidation', function(event){
      const touch = event.changedTouches[0];
      //console.log(touch)
      //if( touch.pageX >= video.VIDEO_SCREEN_W/2 ) return false;
      if( touch.pageX >= window.innerWidth/2 ) return false;
      if( touch.pageY < window.innerHeight/2 ) return false;
      return true
    });

    /* bottom right virtual joystick */
    joystick2 = new VirtualJoystick({
      container: video_get_canvas(),
      strokeStyle: '#eee',
      mouseSupport: true,
      stationaryBase: true,
      //baseX: video_get_canvas().width - 70,
      //baseY: video_get_canvas().height - 80,
      baseX: 420,
      baseY: 200,
      limitStickTravel: true,
      stickRadius: 50
    });
    joystick2.addEventListener('touchStartValidation', function(event){
      const touch = event.changedTouches[0];
      //console.log(touch)
      if( touch.pageX < window.innerWidth/2 )  return false;
      if( touch.pageY < window.innerHeight/2 ) return false;
      return true
    });

    /* topleft virtual joystick */
    joystick3 = new VirtualJoystick({
      container: video_get_canvas(),
      strokeStyle: '#eee',
      mouseSupport: true,
      stationaryBase: true,
      baseX: 70,
      baseY: 50,
      limitStickTravel: true,
      stickRadius: 50
    });
    joystick3.addEventListener('touchStartValidation', function(event){
      const touch = event.changedTouches[0];
      //console.log(touch)
      if( touch.pageX > window.innerWidth/2 )  return false;
      if( touch.pageY > window.innerHeight/2 ) return false;
      return true
    });

    /* topright virtual joystick */
    joystick4 = new VirtualJoystick({
      container: video_get_canvas(),
      strokeStyle: '#eee',
      mouseSupport: true,
      stationaryBase: true,
      //baseX: video_get_canvas().width - 70,
      //baseY: 50,
      baseX: 420,
      baseY: 50,
      limitStickTravel: true,
      stickRadius: 50
    });
    joystick4.addEventListener('touchStartValidation', function(event){
      const touch = event.changedTouches[0];
      //console.log(touch)
      if( touch.pageX < window.innerWidth/2 )  return false;
      if( touch.pageY > window.innerHeight/2 ) return false;
      return true
    });
  }

  /* custom */
  arrows = trackKeys(arrowCodes);
}

export const input_update = () => {

  //console.log('INPUT UPDATE')

  let i;
  let lock_mouse = false;
  const dt = timer_get_delta();
  let old_f6 = 0;
  let it;

  /* updating input objects */
  for(it = inlist; it; it=it.next) {

    /* updating the old states */
    for(i=0; i<IB_MAX; i++)
      it.data.oldstate[i] = it.data.state[i];

    /* updating howlong[button] */
    for(i=0; i<IB_MAX; i++) {
      if(input_button_down(it.data, i))
        it.data.howlong[i] += dt;
      else
        it.data.howlong[i] = 0.0;
    }

    /* checking the appropriate input device */
    switch(it.data.type) {

      case IT_KEYBOARD:
        //for(i=0; i<IB_MAX; i++)
        //  it.data.state[i] = key[ it.data.keybmap[i] ];
        it.data.state[IB_UP]      = arrows.up;
        it.data.state[IB_DOWN]    = arrows.down;
        it.data.state[IB_LEFT]    = arrows.left;
        it.data.state[IB_RIGHT]   = arrows.right;
        it.data.state[IB_FIRE1]   = arrows.space;
        it.data.state[IB_FIRE2]   = arrows.lcontrol;
        it.data.state[IB_FIRE3]   = arrows.enter;
        it.data.state[IB_FIRE4]   = arrows.esc;
        it.data.state[IB_FIRE5]   = arrows.tilda;
      break;

      case IT_MOUSE:
        it.data.x = mousePos.x;
        it.data.y = mousePos.y;
        it.data.state[IB_FIRE1] = mouseIsDown.left;
        it.data.state[IB_FIRE3] = mouseIsDown.middle;
        it.data.state[IB_FIRE2] = mouseIsDown.right;
        /*get_mouse_mickeys_ex(it.data.dx, it.data.dy, it.data.dz);
        it.data.x = mouse_x;
        it.data.y = mouse_y;
        it.data.z = mouse_z;
        it.data.state[IB_UP] = (it.data.dz < 0);
        it.data.state[IB_DOWN] = (it.data.dz > 0);
        it.data.state[IB_LEFT] = false;
        it.data.state[IB_RIGHT] = false;
        it.data.state[IB_FIRE1] = (mouse_b & 1);
        it.data.state[IB_FIRE2] = (mouse_b & 2);
        it.data.state[IB_FIRE3] = (mouse_b & 4);
        it.data.state[IB_FIRE4] = false;*/
      break;

      case IT_COMPUTER:
        for(i=0; i<IB_MAX; i++)
          it.data.state[i] = false;
      break;

      case IT_JOYSTICK:
        if(input_joystick_available()) {
          it.data.state[IB_UP] = joy[0].stick[0].axis[1].d1;
          it.data.state[IB_DOWN] = joy[0].stick[0].axis[1].d2;
          it.data.state[IB_LEFT] = joy[0].stick[0].axis[0].d1;
          it.data.state[IB_RIGHT] = joy[0].stick[0].axis[0].d2;
          it.data.state[IB_FIRE1] = joy[0].button[0].b;
          it.data.state[IB_FIRE2] = joy[0].button[1].b;
          it.data.state[IB_FIRE3] = joy[0].button[2].b;
          it.data.state[IB_FIRE4] = joy[0].button[3].b;
        }
      break;

      case IT_USER:
        //for(i=0; i<IB_MAX; i++)
        //  it.data.state[i] = key[ it.data.keybmap[i] ];

        it.data.state[IB_UP]      = arrows.up;
        it.data.state[IB_DOWN]    = arrows.down;
        it.data.state[IB_LEFT]    = arrows.left;
        it.data.state[IB_RIGHT]   = arrows.right;
        it.data.state[IB_FIRE1]   = arrows.space;
        it.data.state[IB_FIRE2]   = arrows.lcontrol;
        it.data.state[IB_FIRE3]   = arrows.enter;
        it.data.state[IB_FIRE4]   = arrows.esc;


        //console.log(it.data.state)
        /*if(input_joystick_available()) {
          it.data.state[IB_UP] |= joy[0].stick[0].axis[1].d1;
          it.data.state[IB_DOWN] |= joy[0].stick[0].axis[1].d2;
          it.data.state[IB_LEFT] |= joy[0].stick[0].axis[0].d1;
          it.data.state[IB_RIGHT] |= joy[0].stick[0].axis[0].d2;
          it.data.state[IB_FIRE1] |= joy[0].button[0].b;
          it.data.state[IB_FIRE2] |= joy[0].button[1].b;
          it.data.state[IB_FIRE3] |= joy[0].button[2].b;
          it.data.state[IB_FIRE4] |= joy[0].button[3].b;
        }*/

        if (enableVirtualJoystick) {

          // top left
          it.data.state[IB_UP] = joystick.up();
          it.data.state[IB_DOWN] = joystick.down();
          it.data.state[IB_LEFT] = joystick.left();
          it.data.state[IB_RIGHT] = joystick.right();

          // bottom right
          it.data.state[IB_FIRE1] = joystick2._pressed;

          // top left
          it.data.state[IB_FIRE4] = joystick3._pressed;

          // top right
          it.data.state[IB_FIRE2] = joystick4._pressed;
        }

        if (canGamepad) {
          gp = getGamepad();
        }

        if (gp) {
          //console.log('11111111', gp.buttons[12])
          it.data.state[IB_UP]      = gp.buttons[12].pressed;
          it.data.state[IB_DOWN]    = gp.buttons[13].pressed;
          it.data.state[IB_LEFT]    = gp.buttons[14].pressed;
          it.data.state[IB_RIGHT]   = gp.buttons[15].pressed;
          it.data.state[IB_FIRE1]   = gp.buttons[0].pressed;
          it.data.state[IB_FIRE2]   = gp.buttons[1].pressed;
          it.data.state[IB_FIRE3]   = gp.buttons[2].pressed;
          it.data.state[IB_FIRE4]   = gp.buttons[3].pressed;
        }

      break;
    }

    //console.log(it.data)
  }

  /* lock mouse? */
  //if(lock_mouse && video.is_window_active())
  //  position_mouse(video.VIDEO_SCREEN_W/2, video.VIDEO_SCREEN_H/2);

  /* ignore/restore joystick */
  //if(!old_f6 && key[KEY_F6]) {
  //  input_ignore_joystick(!input_is_joystick_ignored());
  //  video_showmessage("%s joystick input", input_is_joystick_ignored() ? "Ignored" : "Restored");
  //}
  //old_f6 = key[KEY_F6];

  /* quit game */
  //if(key[KEY_ALT] && key[KEY_F4])
  //  game_quit();
}

export const input_render = () => {

  // render virtual joysticks
  if (joystick) joystick.render(video_get_backbuffer());
  if (joystick2) joystick2.render(video_get_backbuffer());
  if (joystick3) joystick3.render(video_get_backbuffer());
  if (joystick4) joystick4.render(video_get_backbuffer());
}

export const input_release = () => {};

export const input_joystick_available = () => {
  return got_joystick && !ignore_joystick;
}

export const input_ignore_joystick = (ignore) => {
  ignore_joystick = ignore;
}

export const input_is_joystick_ignored = () => {
  return ignore_joystick;
}

export const input_create_computer = () => {
  let inp = {};
  let i;

  inp.type = IT_COMPUTER;
  inp.enabled = true;
  inp.dx = inp.dy = inp.x = inp.y = 0;
  inp.state = [];
  inp.oldstate = [];
  inp.howlong = [];
  for(i=0; i<IB_MAX; i++) {
    inp.state[i] = inp.oldstate[i] = false;
    inp.howlong[i] = 0.0;
  }

  input_register(inp);
  return inp;
}

export const input_create_keyboard = (keybmap) => {
  let inp = {};
  let i;

  inp.type = IT_KEYBOARD;
  inp.enabled = true;
  inp.dx = inp.dy = inp.x = inp.y = 0;
  inp.state = [];
  inp.oldstate = [];
  inp.howlong = [];
  for(i=0; i<IB_MAX; i++) {
    inp.state[i] = inp.oldstate[i] = false;
    inp.howlong[i] = 0.0;
  }

  if(keybmap) {
      /* custom keyboard map */
      inp.keybmap = [];
      for(i=0; i<IB_MAX; i++)
        inp.keybmap[i] = keybmap[i];
  } else {
    /* default settings */
    inp.keybmap[IB_UP] = KEY_UP;
    inp.keybmap[IB_DOWN] = KEY_DOWN;
    inp.keybmap[IB_RIGHT] = KEY_RIGHT;
    inp.keybmap[IB_LEFT] = KEY_LEFT;
    inp.keybmap[IB_FIRE1] = KEY_SPACE;
    inp.keybmap[IB_FIRE2] = KEY_LCONTROL;
    inp.keybmap[IB_FIRE3] = KEY_ENTER;
    inp.keybmap[IB_FIRE4] = KEY_ESC;
    inp.keybmap[IB_FIRE5] = KEY_TILDA;
  }

  input_register(inp);
  return inp;
}

export const input_create_mouse = () => {
  let inp = {};
  let i;

  inp.type = IT_MOUSE;
  inp.enabled = true;
  inp.dx = inp.dy = inp.x = inp.y = 0;
  inp.state = [];
  inp.oldstate = [];
  inp.howlong = [];
  for(i=0; i<IB_MAX; i++) {
    inp.state[i] = inp.oldstate[i] = false;
    inp.howlong[i] = 0.0;
  }

  input_register(inp);
  return inp;
}

export const input_create_joystick = () => {

  if(!input_joystick_available()) {
      logfile_message("WARNING: called input_create_joystick(), but no joystick is available!");
      return null;
  }

  let i;
  let inp = {};
  inp.type = IT_JOYSTICK;
  inp.enabled = true;
  inp.dx = inp.dy = inp.x = inp.y = 0;
  inp.state = [];
  inp.oldstate = [];
  inp.howlong = [];
  for(i=0; i<IB_MAX; i++) {
      inp.state[i] = inp.oldstate[i] = false;
      inp.howlong[i] = 0.0;
  }

  input_register(inp);
  return inp;
}

export const input_create_user = () => {

  /* initializing */
  let input = {};
  input.type = IT_USER;
  input.enabled = true;
  input.dx = input.dy = input.x = input.y = 0;
  input.state = [];
  input.oldstate = [];
  input.howlong = [];
  for(let i=0; i<IB_MAX; i++) {
    input.state[i] = input.oldstate[i] = false;
    input.howlong[i] = 0.0;
  }

  /* default settings (keyboard) */
  input.keybmap = [];
  input.keybmap[IB_UP]    = KEY_UP;
  input.keybmap[IB_DOWN]  = KEY_DOWN;
  input.keybmap[IB_RIGHT] = KEY_RIGHT;
  input.keybmap[IB_LEFT]  = KEY_LEFT;
  input.keybmap[IB_FIRE1] = KEY_SPACE;
  input.keybmap[IB_FIRE2] = KEY_LCONTROL;
  input.keybmap[IB_FIRE3] = KEY_ENTER;
  input.keybmap[IB_FIRE4] = KEY_ESC;

  /* done! */
  input_register(input);
  return input;
}

export const input_destroy = (inp) => {
  input_unregister(inp);
  inp = null;
}

export const input_button_down = (inp, button) => {
  if (!button) return false;
  return inp.enabled ? inp.state[parseInt(button,10)] : false;
}

export const input_button_pressed = (inp, button) => {
  if (!button) return false;
  return inp.enabled ? (inp.state[parseInt(button,10)] && !inp.oldstate[parseInt(button,10)]) : false;
}

export const input_button_up = (inp, button) => {
  if (!button) return true;
  return inp.enabled ? (!inp.state[parseInt(button,10)] && inp.oldstate[parseInt(button,10)]) : false;
}

export const input_button_howlong = (inp, button) => {
  return inp.enabled ? inp.howlong[parseInt(button,10)] : 0.0;
}

export const input_simulate_button_down = (inp, button) => {
  inp.state[parseInt(button,10)] = true;
}

export const input_ignore = (inp) => {
  inp.enabled = false;
}

export const input_restore = (inp) => {
  inp.enabled = true;
}

export const input_is_ignored = (inp) => {
  return !inp.enabled;
}

export const input_clear = (inp) => {
  for(let i=0; i<IB_MAX; i++)
    inp.state[i] = inp.oldstate[i] = false;
}

export const input_get_xy = (inp) => {
  return v2d_new(inp.x, inp.y);
}

const input_register = (input) => {
  let node = {};
  node.data = input;
  node.next = inlist;
  inlist = node;
}

const input_unregister = (input) => {
  let node, next;

  if(inlist.data == input) {
    next = inlist.next;
    inlist = null;
    inlist = next;
  }
  else {
    node = inlist;
    while(node.next && node.next.data != input)
      node = node.next;
    if(node.next) {
      next = node.next.next;
      node.next = null;
      node.next = next;
    }
  }
}

const trackKeys = (codes) => {
  let pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      const down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

const getGamepad = () => {
  if (typeof(navigator) == "undefined") return false;
  return navigator.getGamepads()[0] || null;
}

