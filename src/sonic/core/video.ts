
import { timer_get_delta, timer_get_fps } from "./timer"
import { clip } from "./util"
import { v2d_new } from "./v2d"

export const VIDEORESOLUTION_1X       = 0; /* original size */
export const VIDEORESOLUTION_2X       = 1; /* float size */
export const VIDEORESOLUTION_MAX      = 2; /* try to fill the screen */
export const VIDEORESOLUTION_EDT      = 3; /* level editor */

export const VIDEO_SCREEN_W           = 480;
export const VIDEO_SCREEN_H           = 271;

export interface video_canvas_t extends HTMLCanvasElement {}
export interface video_buffer_t extends CanvasRenderingContext2D {}

/* Private vars */
let canvas:video_canvas_t;
let video_buffer:video_buffer_t;
let video_resolution:number;
let video_smooth = false;
let video_fullscreen = false;
let video_showfps = false;

/* Fade-in & fade-out */
const FADEFX_NONE          =  0;
const FADEFX_IN            =  1;
const FADEFX_OUT           =  2;

let fadefx_type:number;
let fadefx_end:boolean;
let fadefx_color:string;
let fadefx_elapsed_time:number;
let fadefx_total_time:number;

let cameraX = 0;
let cameraY = 0;
let flipX = false;

export const VIDEO_SCALE = 1;
let CanvasScaleX = 1;
let CanvasScaleY = 1;

/**
 * video_init()
 * Initializes the video manager
 */
export const video_init = (window_title:string, resolution:number, smooth:boolean, fullscreen:boolean, color_depth: number, show_fps:boolean) => {

  video_changemode(resolution, smooth, fullscreen);

  video_show_fps(show_fps);

  let canvasElement = document.getElementById('canvas');

  if (canvasElement) {
    //console.log('111111111')
    canvas = <video_canvas_t>canvasElement;
    video_buffer = canvas.getContext("2d");
    CanvasScaleX = canvas.width / VIDEO_SCREEN_W;
    CanvasScaleY = canvas.height / VIDEO_SCREEN_H;
    video_buffer.scale( canvas.width / VIDEO_SCREEN_W, canvas.height / VIDEO_SCREEN_H);
  } else {
    //console.log('222222222')
    canvasElement = <video_canvas_t>document.createElement("canvas");
    canvas = <video_canvas_t>canvasElement;
    video_buffer = canvas.getContext("2d");
    canvas.width = VIDEO_SCREEN_W;
    canvas.height = VIDEO_SCREEN_H;
    document.body.appendChild(canvas);
  }

  CanvasScaleX = VIDEO_SCREEN_W / window.innerWidth;
  CanvasScaleY = CanvasScaleX;

  video_buffer.imageSmoothingEnabled = false;

  //console.log('PIXEL RATIO',window.devicePixelRatio)
  //console.log('VIDEO_SCREEN_W',VIDEO_SCREEN_W);
  //console.log('VIDEO_SCREEN_H',VIDEO_SCREEN_H);
  //console.log('CANVAS',canvas.width, canvas.height);
  //console.log('WINDOW',window.innerWidth);
  //console.log('SCALE',CanvasScaleX);

  video_clearDisplay();
}

export const video_getScale = () => {
  return v2d_new(CanvasScaleX, CanvasScaleY)
}

/**
 * video_render()
 * Updates the video manager and the screen
 */
export const video_render = () => {

  /* fade effect */
  fadefx_end = false;
  if(fadefx_type != FADEFX_NONE) {
    fadefx_elapsed_time += timer_get_delta();
    if(fadefx_elapsed_time < fadefx_total_time) {
        //if(video.get_color_depth() > 8) {
            // true-color fade effect
            let n;

            //n = parseInt(( 255 * (fadefx_elapsed_time*1.25 / fadefx_total_time) ),10);
            //n = clip(n, 0, 255);
            //n = (fadefx_type == FADEFX_IN) ? 255-n : n;

            n = ( 100 * (fadefx_elapsed_time*1.25 / fadefx_total_time) );
            n = clip(n, 0, 100);
            n = (fadefx_type == FADEFX_IN) ? 100-n : n;
            n = n/100;

            //console.log('true-color fade effect', "rgb(0, 0, 0, "+n+")")

            video_get_backbuffer().fillStyle = fadefx_color;
            video_get_backbuffer().globalAlpha = n;
            video_get_backbuffer().fillRect(0, 0, canvas.width, canvas.height);

            //drawing_mode(DRAW_MODE_TRANS, null, 0, 0);
            //set_trans_blender(0, 0, 0, n);
            //rectfill(video_get_backbuffer().data, 0, 0, VIDEO_SCREEN_W, VIDEO_SCREEN_H, fadefx_color);
            //solid_mode();
        //}
        /*else {
            // 256-color fade effect
            var i, j, x, y, r;
            var prob;

            prob = fadefx_elapsed_time / fadefx_total_time;
            prob = (fadefx_type == FADEFX_IN) ? 1.0 - prob : prob;

            for(i=0; i<=20; i++) {
                for(j=0; j<=10; j++) {
                    r = (int)( ((1.0-(float)i/20)/8 + 7*prob/8)*50.0 );
                    x = (int)((float)i/20 * video_get_backbuffer().width);
                    y = (int)((float)j/10 * video_get_backbuffer().height);
                    losangle(video_get_backbuffer(), x, y, r, fadefx_color);
                }
            }
        }*/
    }
    else {
        if(fadefx_type == FADEFX_OUT) {
          video_get_backbuffer().fillStyle = fadefx_color;
          video_get_backbuffer().fillRect(0, 0, canvas.width, canvas.height);
          //  rectfill(video_get_backbuffer().data, 0, 0, VIDEO_SCREEN_W, VIDEO_SCREEN_H, fadefx_color);
        }
        fadefx_type = FADEFX_NONE;
        fadefx_total_time = fadefx_elapsed_time = 0;
        fadefx_color = null;
        fadefx_end = true;
    }
  }

  video_get_backbuffer().globalAlpha = 1;

  /* fps counter */
  if(video_is_fps_visible()) {
    video_get_backbuffer().font = "14px Arial";
    video_get_backbuffer().fillStyle = "white";
    video_get_backbuffer().fillText(""+timer_get_fps(),VIDEO_SCREEN_W-30,20);
  }
}

/**
 * video_fadefx_in()
 * Fade-in effect
 */
export const video_fadefx_in = (color:string, seconds:number) => {
  if(fadefx_type == FADEFX_NONE) {
    fadefx_type = FADEFX_IN;
    fadefx_end = false;
    fadefx_color = color;
    fadefx_elapsed_time = 0;
    fadefx_total_time = seconds;
  }
}

/**
 * video_fadefx_out()
 * Fade-out effect
 */
export const video_fadefx_out = (color:string, seconds:number) => {
  if(fadefx_type == FADEFX_NONE) {
    fadefx_type = FADEFX_OUT;
    fadefx_end = false;
    fadefx_color = color;
    fadefx_elapsed_time = 0;
    fadefx_total_time = seconds;
  }
}

/**
 * video_fadefx_over()
 * Asks if the fade effect has ended
 * (only one action when this event loops)
 */
export const video_fadefx_over = () => {
  return fadefx_end;
}

/**
 * video_fadefx_is_fading()
 * Is the fade effect ocurring?
 */
export const video_fadefx_is_fading = () => {
  return (fadefx_type != FADEFX_NONE);
}

export const video_clearDisplay = (rgb?:string) => {
  video_buffer.fillStyle = rgb ? rgb : "rgb(0, 0, 0)";
  video_buffer.fillRect(0, 0, canvas.width, canvas.height);
}

export const video_renderLoading = (text:string, percent:number) => {
  video_clearDisplay();

  const ctx = video_get_backbuffer();

  // loading bar bg
  ctx.beginPath();
  ctx.rect(130, VIDEO_SCREEN_H/2-20, 210, 20);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // percent
  if (percent < 1) percent = 0;
  else if (percent > 202) percent = 202;
  else percent = 202/percent;

  ctx.beginPath();
  ctx.rect(134, VIDEO_SCREEN_H/2-17, percent, 14);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();

  // text
  ctx.font = "14px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(text, 130,VIDEO_SCREEN_H/2-30);
}

export const video_setCameraX = (x:number) => {
  return cameraX = x;
}

export const video_setFlipX = (x:boolean) => {
  return flipX = x;
}

export const video_setCameraY = (y:number) => {
  return cameraY = y;
}

export const video_getCameraX = () => {
  return cameraX;
}

export const video_getCameraY = () => {
  return cameraY;
}

export const video_get_canvas = () => {
  //if(video_buffer == null)
  //  fatal_error("FATAL ERROR: video_get_backbuffer() returned NULL!");

  return canvas;
}

/**
 * video_get_backbuffer()
 * Returns a pointer to the backbuffer
 */
export const video_get_backbuffer = () => {
  //if(video_buffer == null)
  //  fatal_error("FATAL ERROR: video_get_backbuffer() returned NULL!");

  return video_buffer;
}

/**
 * video_get_resolution()
 * Returns the current resolution value,
 * i.e., VIDEORESOLUTION_*
 */
export const video_get_resolution = () => {
  return video_resolution;
}

/**
 * video_is_smooth()
 * Smooth graphics?
 */
export const video_is_smooth = () => {
  return video_smooth;
}

/**
 * video_is_fullscreen()
 * Fullscreen mode?
 */
export const video_is_fullscreen = () => {
  return video_fullscreen;
}

/**
 * video_is_fps_visible()
 * Is the FPS counter visible?
 */
export const video_is_fps_visible = () => {
  return video_showfps;
}

/**
 * video_show_fps()
 * Shows/hides the FPS counter
 */
export const video_show_fps = (show:boolean) => {
  video_showfps = show;
}

/**
 * video_changemode()
 * Sets up the game window
 */
export const video_changemode = (resolution:number, smooth:boolean, fullscreen:boolean) => {

  /* resolution */
  video_resolution = resolution;

  /* fullscreen */
  video_fullscreen = fullscreen;

  /* smooth graphics? */
  video_smooth = smooth;

}

/**
 * video_get_window_size()
 * Returns the window size, based on
 * the current resolution
 */
export const video_get_window_size = () => {
  let width = VIDEO_SCREEN_W;
  let height = VIDEO_SCREEN_H;
  //var dw, dh; /* desktop resolution */

  switch(video_resolution) {
    case VIDEORESOLUTION_1X:
      width = VIDEO_SCREEN_W;
      height = VIDEO_SCREEN_H;
      break;

    case VIDEORESOLUTION_2X:
      width = 2*VIDEO_SCREEN_W;
      height = 2*VIDEO_SCREEN_H;
      break;

    case VIDEORESOLUTION_MAX:
      //if(get_desktop_resolution(dw, dh) == 0) {
      //    var scale = Math.min(parseInt(dw/VIDEO_SCREEN_W, 10), parseInt(dh/VIDEO_SCREEN_H, 10));
      //    width = scale*VIDEO_SCREEN_W;
      //    height = scale*VIDEO_SCREEN_H;
      //}
      //else {
          width = VIDEO_SCREEN_W;
          height = VIDEO_SCREEN_H;
      //}
      break;

    case VIDEORESOLUTION_EDT:
      width = VIDEO_SCREEN_W;
      height = VIDEO_SCREEN_H;
      break;

    default:
      //fatal_error("video_get_window_size(): unknown resolution!");
      break;
  }

  return v2d_new(width, height);
}

export const video_getMousePos = (canvas:video_canvas_t, evt:MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

const flipHorizontally = (context:video_buffer_t, around:number) => {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}
