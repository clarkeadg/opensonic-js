
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { timer_get_delta } from "./../../core/timer"
import { random } from "./../../core/util"
import { actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { brick_list_t, brick_image } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_walk_t extends objectdecorator_t {
  speed: number,
  direction: number
}

export const objectdecorator_walk_new = (decorated_machine:objectmachine_t, speed:number) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_walk_t = <objectdecorator_walk_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.speed = speed;

  return obj;
}

const init = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_walk_t = <objectdecorator_walk_t>obj;

  me.direction = (random(2) == 0) ? -1.0 : 1.0;

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
  const me:objectdecorator_walk_t = <objectdecorator_walk_t>obj;

  const object = obj.get_object_instance(obj);
  const act = object.actor;
  const dt = timer_get_delta();
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

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 