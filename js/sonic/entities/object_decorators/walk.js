
import { get_object_instance } from "./base/objectdecorator"
import { timer_get_delta } from "./../../core/timer"
import { actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { brick_image } from "./../brick"

export const walk_new = (decorated_machine, speed) => {
  let me = {};
  let dec = me;
  let obj = dec;

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.speed = speed;
  me.direction = -1.0;

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
  let sqrsize = 2, diff = -2;

  /* move! */
  act.position.x += (me.direction * me.speed) * dt;

  /* sensors */
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

  // swap direction when a wall is touched 
  if(right != null) {
    if(me.direction > 0.0) {
      act.position.x = act.hot_spot.x - actor_image(act).width + right.x;
      me.direction = -1.0;
    }
  }

  if(left != null) {
    if(me.direction < 0.0) {
      act.position.x = act.hot_spot.x + left.x + brick_image(left).width;
      me.direction = 1.0;
    }
  }

  // I don't want to fall from the platforms! 
  if(down != null) {
    if(downright == null && downleft != null)
      me.direction = -1.0;
    else if(downleft == null && downright != null)
      me.direction = 1.0;
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}
