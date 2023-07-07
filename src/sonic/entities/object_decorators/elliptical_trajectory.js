
import { get_object_instance } from "./base/objectdecorator"
import { PI } from "./../../core/global"
import { timer_get_delta, timer_get_ticks } from "./../../core/timer"
import { actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { brick_image } from "./../brick"

export const ellipticaltrajectory_new = (decorated_machine, amplitude_x, amplitude_y, angularspeed_x, angularspeed_y, initialphase_x, initialphase_y) => {
  let me = {};
  let dec = me;
  let obj = dec;

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.amplitude_x = amplitude_x;
  me.amplitude_y = amplitude_y;
  me.angularspeed_x = angularspeed_x * (2.0 * PI);
  me.angularspeed_y = angularspeed_y * (2.0 * PI);
  me.initialphase_x = (initialphase_x * PI) / 180.0;
  me.initialphase_y = (initialphase_y * PI) / 180.0;

  return me;
}

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  let object = obj.get_object_instance(obj);
  let act = object.actor;
  let dt = timer_get_delta();
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

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  
