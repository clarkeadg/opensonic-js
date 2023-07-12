
import { v2d_t } from "../../core/v2d"
import { bounding_box } from "../../core/util"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { random } from "./../../core/util"
import { timer_get_delta } from "./../../core/timer"
import { brick_list_t, BRK_NONE, BRK_OBSTACLE } from "./../brick"
import { item_list_t } from "./../item"
import { actor_corners, actor_pixelperfect_collision, actor_image, actor_animation_finished } from "./../actor"
import { SH_NONE, SH_SHIELD, SH_FIRESHIELD, SH_THUNDERSHIELD, SH_WATERSHIELD, SH_ACIDSHIELD, SH_WINDSHIELD, player_attacking } from "./../player"
import { enemy_get_observed_player } from "./../enemy"
import { object_vm_set_current_state } from "./../object_vm"

export interface objectdecorator_onevent_t extends objectdecorator_t {
  new_state_name: string,
  strategy: eventstrategy_t
}

export interface eventstrategy_t {
  init: Function, 
  release: Function,
  should_trigger_event: Function
}

export interface ontimeout_t extends eventstrategy_t {
  timeout: number,
  timer: number
}

export interface oncollision_t extends eventstrategy_t {
  target_name: string
}

export interface onanimationfinished_t extends eventstrategy_t {}

export interface onrandomevent_t extends eventstrategy_t {
  probability: number
}

export interface onplayercollision_t extends eventstrategy_t {}

export interface onplayerattack_t extends eventstrategy_t {}

export interface onplayerrectcollision_t extends eventstrategy_t {
  x1: number,
  y1: number,
  x2: number,
  y2: number
}

export interface onplayershield_t extends eventstrategy_t {
  shield_type: number
}

export interface onbrickcollision_t extends eventstrategy_t {}

export interface onfloorcollision_t extends eventstrategy_t {}

export interface onceilingcollision_t extends eventstrategy_t {}

export interface onleftwallcollision_t extends eventstrategy_t {}

export interface onrightwallcollision_t extends eventstrategy_t {}

export const objectdecorator_ontimeout_new = (decorated_machine:objectmachine_t, timeout:number, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, ontimeout_new(timeout))

export const objectdecorator_oncollision_new = (decorated_machine:objectmachine_t, target_name:string, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, oncollision_new(target_name))

export const objectdecorator_onanimationfinished_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onanimationfinished_new())

export const objectdecorator_onrandomevent_new = (decorated_machine:objectmachine_t, probability:number, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onrandomevent_new(probability))

/* player events */

export const objectdecorator_onplayercollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayercollision_new())

export const objectdecorator_onplayerattack_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayerattack_new())

export const objectdecorator_onplayerrectcollision_new = (decorated_machine:objectmachine_t, x1:number, y1:number, x2:number, y2:number, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayerrectcollision_new(x1,y1,x2,y2))

export const objectdecorator_onnoshield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_NONE))

export const objectdecorator_onshield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_SHIELD))

export const objectdecorator_onfireshield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_FIRESHIELD))

export const objectdecorator_onthundershield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_THUNDERSHIELD))

export const objectdecorator_onwatershield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_WATERSHIELD))

export const objectdecorator_onacidshield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_ACIDSHIELD))

export const objectdecorator_onwindshield_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_WINDSHIELD))

/* brick events */

export const objectdecorator_onbrickcollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onbrickcollision_new())

export const objectdecorator_onfloorcollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onfloorcollision_new())

export const objectdecorator_onceilingcollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onceilingcollision_new())

export const objectdecorator_onleftwallcollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onleftwallcollision_new())

export const objectdecorator_onrightwallcollision_new = (decorated_machine:objectmachine_t, new_state_name:string) =>
  make_decorator(decorated_machine, new_state_name, onrightwallcollision_new())

const make_decorator = (decorated_machine:objectmachine_t, new_state_name:string, strategy:eventstrategy_t) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_onevent_t = <objectdecorator_onevent_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  me.new_state_name = new_state_name;
  me.strategy = strategy;

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
  const me:objectdecorator_onevent_t = <objectdecorator_onevent_t>obj;
  const object = obj.get_object_instance(obj);

  if(me.strategy.should_trigger_event(me.strategy, object, team, team_size, brick_list, item_list, object_list))
    object_vm_set_current_state(object.vm, me.new_state_name);
  else
    decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

/* ontimeout_t strategy */
const ontimeout_new = (timeout:number) => {

  const e:eventstrategy_t = {
    init: ontimeout_init,
    release: ontimeout_release,
    should_trigger_event: ontimeout_should_trigger_event
  }

  const x:ontimeout_t = <ontimeout_t>e;

  x.timeout = timeout;
  x.timer = 0.0;

  return e;
}

const ontimeout_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const ontimeout_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const ontimeout_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const x:ontimeout_t = <ontimeout_t>event;

  x.timer += timer_get_delta();
  if(x.timer >= x.timeout) {
      x.timer = 0.0;
      return true;
  }

  return false;
}

/* oncollision_t strategy */
const oncollision_new = (target_name:string) => {

  const e:eventstrategy_t = {
    init: oncollision_init,
    release: oncollision_release,
    should_trigger_event: oncollision_should_trigger_event
  }

  const x:oncollision_t = <oncollision_t>e;

  x.target_name = target_name;

  return e;
}

const oncollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const oncollision_release = (event:eventstrategy_t) => {
  var e = event;
  //free(e.target_name);
}

const oncollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const x:oncollision_t = <oncollision_t>event;

  for(let it = object_list; it != null; it = it.next) {
      if(it.data.name == x.target_name) {
          if(actor_pixelperfect_collision(it.data.actor, object.actor))
              return true;
      }
  }

  return false;
}

/* onanimationfinished_t strategy */
const onanimationfinished_new = () => {

  const e:eventstrategy_t = {
    init: onanimationfinished_init,
    release: onanimationfinished_release,
    should_trigger_event: onanimationfinished_should_trigger_event
  }

  const x:onanimationfinished_t = <onanimationfinished_t>e;

  return e;
}

const onanimationfinished_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onanimationfinished_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onanimationfinished_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  return actor_animation_finished(object.actor);
}

/* onrandomevent_t strategy */
const onrandomevent_new = (probability:number) => {

  const e:eventstrategy_t = {
    init: onrandomevent_init,
    release: onrandomevent_release,
    should_trigger_event: onrandomevent_should_trigger_event
  }

  const x:onrandomevent_t = <onrandomevent_t>e;

  x.probability = Math.min(probability, 0.0, 1.0);

  return e;
}

const onrandomevent_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onrandomevent_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onrandomevent_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  var r = 100000 * (<onrandomevent_t>event).probability;
  return r > random(100000);
}

/* onplayercollision_t strategy */
const onplayercollision_new = () => {

  const e:eventstrategy_t = {
    init: onplayercollision_init,
    release: onplayercollision_release,
    should_trigger_event: onplayercollision_should_trigger_event
  }

  const x:onplayercollision_t = <onplayercollision_t>e;

  return e;
}

const onplayercollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayercollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayercollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const player = enemy_get_observed_player(object);
  return actor_pixelperfect_collision(object.actor, player.actor);
}

/* onplayerattack_t strategy */
const onplayerattack_new = () => {

  const e:eventstrategy_t = {
    init: onplayerattack_init,
    release: onplayerattack_release,
    should_trigger_event: onplayerattack_should_trigger_event
  }

  const x:onplayerattack_t = <onplayerattack_t>e;

  return e;
}

const onplayerattack_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayerattack_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayerattack_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const player = enemy_get_observed_player(object);
  return player_attacking(player) && actor_pixelperfect_collision(object.actor, player.actor);
}

/* onplayerrectcollision_t strategy */
const onplayerrectcollision_new = (x1:number, y1:number, x2:number, y2:number) => {

  const e:eventstrategy_t = {
    init: onplayerrectcollision_init,
    release: onplayerrectcollision_release,
    should_trigger_event: onplayerrectcollision_should_trigger_event
  }

  const x:onplayerrectcollision_t = <onplayerrectcollision_t>e;

  x.x1 = Math.min(x1, x2);
  x.y1 = Math.min(y1, y2);
  x.x2 = Math.max(x1, x2);
  x.y2 = Math.max(y1, y2);

  return e;
}

const onplayerrectcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayerrectcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayerrectcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const me:onplayerrectcollision_t = <onplayerrectcollision_t>event;
  const act = object.actor;
  const player = enemy_get_observed_player(object);
  const pa = player.actor;
  const pi = actor_image(pa);
  const a = [];
  const b = [];

  a[0] = act.position.x + me.x1;
  a[1] = act.position.y + me.y1;
  a[2] = act.position.x + me.x2;
  a[3] = act.position.y + me.y2;

  b[0] = pa.position.x - pa.hot_spot.x;
  b[1] = pa.position.y - pa.hot_spot.y;
  b[2] = pa.position.x - pa.hot_spot.x + pi.w;
  b[3] = pa.position.y - pa.hot_spot.y + pi.h;

  return !player.dying && bounding_box(a, b);
}

/* onplayershield_t strategy */
const onplayershield_new = (shield_type:number) => {

  const e:eventstrategy_t = {
    init: onplayershield_init,
    release: onplayershield_release,
    should_trigger_event: onplayershield_should_trigger_event
  }

  const x:onplayershield_t = <onplayershield_t>e;

  x.shield_type = shield_type;

  return e;
}

const onplayershield_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayershield_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onplayershield_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const me:onplayershield_t = <onplayershield_t>event;
  const player = enemy_get_observed_player(object);

  return player.shield_type == me.shield_type;
}

/* onbrickcollision_t strategy */
const onbrickcollision_new = () => {

  const e:eventstrategy_t = {
    init: onbrickcollision_init,
    release: onbrickcollision_release,
    should_trigger_event: onbrickcollision_should_trigger_event
  }

  const x:onbrickcollision_t = <onbrickcollision_t>e;

  return e;
}

const onbrickcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onbrickcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onbrickcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let sqrsize = 1, diff = 0;
  const act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (up != null && up.brick_ref.property == BRK_OBSTACLE) ||
      (upright != null && upright.brick_ref.property == BRK_OBSTACLE) ||
      (right != null && right.brick_ref.property == BRK_OBSTACLE) ||
      (downright != null && downright.brick_ref.property != BRK_NONE) ||
      (down != null && down.brick_ref.property != BRK_NONE) ||
      (downleft != null && downleft.brick_ref.property != BRK_NONE) ||
      (left != null && left.brick_ref.property == BRK_OBSTACLE) ||
      (upleft != null && upleft.brick_ref.property == BRK_OBSTACLE)
  ;
}

/* onfloorcollision_t strategy */
const onfloorcollision_new = () => {

  const e:eventstrategy_t = {
    init: onfloorcollision_init,
    release: onfloorcollision_release,
    should_trigger_event: onfloorcollision_should_trigger_event
  }

  const x:onfloorcollision_t = <onfloorcollision_t>e;

  return e;
}

const onfloorcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onfloorcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onfloorcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let sqrsize = 1, diff = 0;
  const act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (downright != null && downright.brick_ref.property != BRK_NONE) ||
      (down != null && down.brick_ref.property != BRK_NONE) ||
      (downleft != null && downleft.brick_ref.property != BRK_NONE)
  ;
}

/* onceilingcollision_t strategy */
const onceilingcollision_new = () => {

  const e:eventstrategy_t = {
    init: onceilingcollision_init,
    release: onceilingcollision_release,
    should_trigger_event: onceilingcollision_should_trigger_event
  }

  const x:onceilingcollision_t = <onceilingcollision_t>e;

  return e;
}

const onceilingcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onceilingcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onceilingcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let sqrsize = 1, diff = 0;
  const act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (upleft != null && upleft.brick_ref.property == BRK_OBSTACLE) ||
      (up != null && up.brick_ref.property == BRK_OBSTACLE) ||
      (upright != null && upright.brick_ref.property == BRK_OBSTACLE)
  ;
}

/* onleftwallcollision_t strategy */
const onleftwallcollision_new = () => {

  const e:eventstrategy_t = {
    init: onleftwallcollision_init,
    release: onleftwallcollision_release,
    should_trigger_event: onleftwallcollision_should_trigger_event
  }

  const x:onleftwallcollision_t = <onleftwallcollision_t>e;

  return e;
}

const onleftwallcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onleftwallcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onleftwallcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let sqrsize = 1, diff = 0;
  const act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (left != null && left.brick_ref.property == BRK_OBSTACLE) ||
      (upleft != null && upleft.brick_ref.property == BRK_OBSTACLE)
  ;
}

/* onrightwallcollision_t strategy */
const onrightwallcollision_new = () => {

  const e:eventstrategy_t = {
    init: onrightwallcollision_init,
    release: onrightwallcollision_release,
    should_trigger_event: onrightwallcollision_should_trigger_event
  }

  const x:onrightwallcollision_t = <onrightwallcollision_t>e;

  return e;
}

const onrightwallcollision_init = (event:eventstrategy_t) => {
  ; /* empty */
}

const onrightwallcollision_release = (event:eventstrategy_t) => {
  ; /* empty */
}

const onrightwallcollision_should_trigger_event = (event:eventstrategy_t, object:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let sqrsize = 1, diff = 0;
  const act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (right != null && right.brick_ref.property == BRK_OBSTACLE) ||
      (upright != null && upright.brick_ref.property == BRK_OBSTACLE)
  ;
}


