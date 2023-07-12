
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { PI } from "./../../core/global"
import { timer_get_delta, timer_get_ticks } from "./../../core/timer"
import { actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { brick_image } from "./../brick"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_ellipticaltrajectory_t extends objectdecorator_t {
  amplitude_x: number,
  amplitude_y: number,
  angularspeed_x: number,
  angularspeed_y: number,
  initialphase_x: number,
  initialphase_y: number,
}

export const objectdecorator_ellipticaltrajectory_new = (decorated_machine:objectmachine_t, amplitude_x:number, amplitude_y:number, angularspeed_x:number, angularspeed_y:number, initialphase_x:number, initialphase_y:number) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_ellipticaltrajectory_t = <objectdecorator_ellipticaltrajectory_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.amplitude_x = amplitude_x;
  me.amplitude_y = amplitude_y;
  me.angularspeed_x = angularspeed_x * (2.0 * PI);
  me.angularspeed_y = angularspeed_y * (2.0 * PI);
  me.initialphase_x = (initialphase_x * PI) / 180.0;
  me.initialphase_y = (initialphase_y * PI) / 180.0;

  return obj;
}

const init = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  
  decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:objectmachine_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_ellipticaltrajectory_t = <objectdecorator_ellipticaltrajectory_t>obj;

  const object = obj.get_object_instance(obj);
  const act = object.actor;
  const dt = timer_get_delta();

  let up = null, upright = null, right = null, downright = null;
  let down = null, downleft = null, left = null, upleft = null;
  let sqrsize = 0, diff = 0;
  let elapsed_time = timer_get_ticks() * 0.001;
  let old_position = act.position;

  act.position.x += (-me.amplitude_x * me.angularspeed_x * Math.sin( me.initialphase_x + me.angularspeed_x * elapsed_time)) * dt;
  act.position.y += ( me.amplitude_y * me.angularspeed_y * Math.cos( me.initialphase_y + me.angularspeed_y * elapsed_time)) * dt;

  // sensors 
  let corners = actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);
  up = corners.up;
  upright = corners.upright;
  right = corners.right;
  downright = corners.downright;
  down = corners.down; 
  downleft = corners.downleft;
  left = corners.left;
  upleft = corners.upleft;
  
  let corners2 = actor_handle_clouds(act, diff, up, upright, right, downright, down, downleft, left, upleft);
  up = corners2.up;
  upright = corners2.upright;
  right = corners2.right;
  downright = corners2.downright;
  down = corners2.down; 
  downleft = corners2.downleft;
  left = corners2.left;
  upleft = corners2.upleft;

  // I don't want to get stuck into walls 
  if(right != null) {
    if(act.position.x > old_position.x)
      act.position.x = act.hot_spot.x - actor_image(act).width + right.x;
  }

  if(left != null) {
    if(act.position.x < old_position.x)
      act.position.x = act.hot_spot.x + left.x + brick_image(left).width;
  }

  if(down != null) {
    if(act.position.y > old_position.y)
      act.position.y = act.hot_spot.y - actor_image(act).height + down.y;
  }

  if(up != null) {
    if(act.position.y < old_position.y)
      act.position.y = act.hot_spot.y + up.y + brick_image(up).height;
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 
