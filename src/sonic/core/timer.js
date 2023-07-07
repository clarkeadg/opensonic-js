
import { logfile_message } from "./logfile"

/* Constants */
const MIN_FRAME_INTERVAL = 10; /* (1/10) * 1000 = 100 fps max */
const MAX_FRAME_INTERVAL = 16; /* (1/16) * 1000 ~  62 fps min */

let partial_fps, fps_accum, fps;
let last_time = 0;;
let delta = 0.0;
let start_time = 0;

export const timer_init = () => {
  logfile_message("timer_init()");

  partial_fps = 0;
  fps_accum = 0;
  fps = 0;
  delta = 0.0;

  last_time = timer_get_ticks();
}

export const timer_update = (step) => {

  let current_time, delta_time; /* both in milliseconds */

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
  fps_accum += parseInt(delta_time,10);
  if(fps_accum >= 1000) {
      fps = partial_fps;
      partial_fps = 0;
      fps_accum = 0;
  }

  /* done! */
  last_time = timer_get_ticks();
}

export const timer_release = () => {
  logfile_message("timer_release()");
}

/* main utilities */
export const timer_get_delta = () => {
  return delta;
}

export const timer_get_ticks = () => {
  const ticks = get_tick_count();
  if(ticks < start_time)
    start_time = ticks;
  return ticks - start_time;
}

export const timer_get_fps = () => {
  return fps;
}

const update_timer = () => {
  elapsed_time++;
}

const get_tick_count = () => {
  return Math.floor(Date.now());
}
