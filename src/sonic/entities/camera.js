
import { INFINITY, EPSILON } from "./../core/global"
import { v2d_new, v2d_subtract, v2d_magnitude, v2d_normalize } from "./../core/v2d"
import { timer_get_delta } from "./../core/timer"
import { VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { level_size } from "./../scenes/level"
  
const camera = {
  is_locked: false,
  position: { x: 0, y: 0 },
  dest: { x: 0, y: 0 },
  speed: 0.0,
  region_topleft:  { x: 0, y: 0 },
  region_bottomright:  { x: 0, y: 0 },
  dest_region_topleft:  { x: 0, y: 0 },
  dest_region_bottomright:  { x: 0, y: 0 },
  region_topleft_speed:  0.0,
  region_bottomright_speed:  0.0
}
  
export const camera_init = () => {

  camera.is_locked = false;

  camera.speed = 0.0;
  camera.region_topleft_speed = 0.0;
  camera.region_bottomright_speed = 0.0;

  camera.position = camera.dest = v2d_new(0.0, 0.0);
  camera.region_topleft.x = camera.dest_region_topleft.x = VIDEO_SCREEN_W/2;
  camera.region_topleft.y = camera.dest_region_topleft.y = VIDEO_SCREEN_H/2;
  camera.region_bottomright.x = camera.dest_region_bottomright.x = level_size().x-VIDEO_SCREEN_W/2;
  camera.region_bottomright.y = camera.dest_region_bottomright.y = level_size().y-VIDEO_SCREEN_H/2;
}

export const camera_update = () => {
  
  const threshold = 10;
  const dt = timer_get_delta();
  let ds;

  /* the level size may have changed during the last frame */
  update_boundaries();

  /* updating the camera position */
  ds = v2d_subtract(camera.dest, camera.position);
  if(v2d_magnitude(ds) > threshold) {
      ds = v2d_normalize(ds);
      camera.position.x += ds.x * camera.speed * dt;
      camera.position.y += ds.y * camera.speed * dt;
  }

  /* updating the feasible region */
  ds = v2d_subtract(camera.dest_region_topleft, camera.region_topleft);
  if(v2d_magnitude(ds) > threshold) {
      ds = v2d_normalize(ds);
      camera.region_topleft.x += ds.x * camera.region_topleft_speed * dt;
      camera.region_topleft.y += ds.y * camera.region_topleft_speed * dt;
  }

  ds = v2d_subtract(camera.dest_region_bottomright, camera.region_bottomright);
  if(v2d_magnitude(ds) > threshold) {
      ds = v2d_normalize(ds);
      camera.region_bottomright.x += ds.x * camera.region_bottomright_speed * dt;
      camera.region_bottomright.y += ds.y * camera.region_bottomright_speed * dt;
  }

  /* clipping... */
  //camera.position.x = Math.min(camera.position.x, camera.region_topleft.x, camera.region_bottomright.x);
  //camera.position.y = Math.min(camera.position.y, camera.region_topleft.y, camera.region_bottomright.y);
}

export const camera_release = () => {}

export const camera_move_to = (position, seconds) => {

  /* clipping */
  if(position.x < camera.region_topleft.x) {
    position.x = camera.region_topleft.x;
  }
  if(position.y < camera.region_topleft.y) {
    position.y = camera.region_topleft.y;
  }
  if(position.x > camera.region_bottomright.x) {
    position.x = camera.region_bottomright.x;
  }
  if(position.y > camera.region_bottomright.y) {
    position.y = camera.region_bottomright.y;
  }

  /* updating the target position */
  camera.dest = position;

  /* hey, don't move too fast! */
  if(seconds > EPSILON) {
    camera.speed = v2d_magnitude(v2d_subtract(camera.position, camera.dest)) / seconds;
  } else {
    camera.position = camera.dest;
  }
  //camera.position.x-=1;
  camera.position.x = parseInt(position.x,10);
  camera.position.y = parseInt(position.y,10);
  //console.log(camera.position);
}

export const camera_lock = (x1, y1, x2, y2) => {
  camera.is_locked = true;
  define_boundaries(x1, y1, x2, y2);
}

export const camera_unlock = () => {
  camera.is_locked = false;
}

export const camera_get_position = () => {
  return v2d_new(camera.position.x, camera.position.y);
}

export const camera_set_position = (position) => {
  const pos = v2d_new(position.x,position.y);
  camera.dest = camera.position = pos;
}

const define_boundaries = (x1, y1, x2, y2) => {

  const seconds = 0.25;

  camera.dest_region_topleft.x = Math.max(Math.min(x1, x2), VIDEO_SCREEN_W/2);
  camera.dest_region_topleft.y = Math.max(Math.min(y1, y2), VIDEO_SCREEN_H/2);
  camera.dest_region_bottomright.x = Math.min(Math.max(x1, x2), level_size().x-VIDEO_SCREEN_W/2);
  camera.dest_region_bottomright.y = Math.min(Math.max(y1, y2), level_size().y-VIDEO_SCREEN_H/2);

  camera.region_topleft_speed = v2d_magnitude (
    v2d_subtract( camera.region_topleft, camera.dest_region_topleft )
  ) / seconds;

  camera.region_bottomright_speed = v2d_magnitude (
    v2d_subtract( camera.region_bottomright, camera.dest_region_bottomright )
  ) / seconds;
}

const update_boundaries = () => {
  if(!camera.is_locked)
    define_boundaries(-INFINITY, -INFINITY, INFINITY, INFINITY);
}
