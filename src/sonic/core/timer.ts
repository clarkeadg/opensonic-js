
import { logfile_message } from "./logfile"

/* Constants */
const MIN_FRAME_INTERVAL = 10; /* (1/10) * 1000 = 100 fps max */
const MAX_FRAME_INTERVAL = 16; /* (1/16) * 1000 ~  62 fps min */

let partial_fps  = 0;
let fps_accum = 0;
let fps = 0;
let last_time = 0;
let delta = 0.0;
let start_time = 0;

/**
 * timer_init()
 * Initializes the Time Handler
 */
export const timer_init = ():void => {
  logfile_message("timer_init()");

  partial_fps = 0;
  fps_accum = 0;
  fps = 0;
  delta = 0.0;

  last_time = timer_get_ticks();
}

/**
 * timer_update()
 * Updates the Time Handler. This routine
 * must be called at every cycle of
 * the main loop
 */
export const timer_update = ():void => {

   /* both in milliseconds */
  let current_time = 0;
  let delta_time = 0;

  /* time control */
  for(delta_time = 0; delta_time < MIN_FRAME_INTERVAL; ) {
      current_time = timer_get_ticks();
      delta_time = (current_time > last_time) ? (current_time - last_time) : 0;
      last_time = (current_time >= last_time) ? last_time : current_time;
  }
  delta_time = Math.min(delta_time, MAX_FRAME_INTERVAL);
  delta = delta_time * 0.001;

  /* FPS (frames per second) */
  partial_fps++; /* 1 render per cycle */
  fps_accum += delta_time;
  if(fps_accum >= 1000) {
      fps = partial_fps;
      partial_fps = 0;
      fps_accum = 0;
  }

  /* done! */
  last_time = timer_get_ticks();
}

/**
 * timer_release()
 * Releases the Time Handler
 */
export const timer_release = ():void => {
  logfile_message("timer_release()");
}

/**
 * timer_get_delta()
 * Returns the time interval, in seconds,
 * between the last two cycles of the
 * main loop
 */
export const timer_get_delta = ():number => {
  return delta;
}

/**
 * timer_get_ticks()
 * Elapsed milliseconds since
 * the application has started
 */
export const timer_get_ticks = ():number => {
  const ticks:number = get_tick_count();
  if(ticks < start_time)
    start_time = ticks;
  return ticks - start_time;
}

/**
 * timer_get_fps()
 * Returns the FPS rate
 */
export const timer_get_fps = ():number => {
  return fps;
}

const get_tick_count = ():number => {
  return Math.floor(Date.now());
}
