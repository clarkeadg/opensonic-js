
import { get_object_instance } from "./base/objectdecorator"
import { random } from "./../../core/util"
import { timer_get_delta } from "./../../core/timer"

export const ontimeout_new = (decorated_machine, timeout, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, ontimeout_new(timeout))

export const oncollision_new = (decorated_machine, target_name, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, oncollision_new(target_name))

export const onanimationfinished_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onanimationfinished_new())

export const onrandomevent_new = (decorated_machine, probability, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onrandomevent_new(probability))

/* player events */

export const onplayercollision_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayercollision_new())

export const onplayerattack_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayerattack_new())

export const onplayerrectcollision_new = (decorated_machine, x1, y1, x2, y2, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayerrectcollision_new(x1,y1,x2,y2))

export const onnoshield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_NONE))

export const onshield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_SHIELD))

export const onfireshield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_FIRESHIELD))

export const onthundershield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_THUNDERSHIELD))

export const onwatershield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_WATERSHIELD))

export const onacidshield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_ACIDSHIELD))

export const onwindshield_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onplayershield_new(SH_WINDSHIELD))

/* brick events */

export const onbrickcollision_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onbrickcollision_new())

export const onfloorcollision_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onfloorcollision_new())

export const onceilingcollision_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onceilingcollision_new())

export const onleftwallcollision_new = (decorated_machine, new_state_name) =>
  make_decorator(decorated_machine, new_state_name, onleftwallcollision_new())

export const onrightwallcollision_new = (decorated_machine, new_state_names) =>
  make_decorator(decorated_machine, new_state_name, onrightwallcollision_new())

const make_decorator = (decorated_machine, new_state_name, strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.new_state_name = new_state_name;
  me.strategy = strategy;

  return obj;
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

  if(me.strategy.should_trigger_event(me.strategy, object, team, team_size, brick_list, item_list, object_list))
    objectvm_set_current_state(object.vm, me.new_state_name);
  else
    decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}

/* ontimeout_t strategy */
const ontimeout_new = (timeout) => {
  let x = {};
  let e = x;

  e.init = ontimeout_init;
  e.release = ontimeout_release;
  e.should_trigger_event = ontimeout_should_trigger_event;

  x.timeout = timeout;
  x.timer = 0.0f;

  return e;
}

const ontimeout_init = (event) => {
  ; /* empty */
}

const ontimeout_release = (event) => {
  ; /* empty */
}

const ontimeout_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let x = event;

  x.timer += timer_get_delta();
  if(x.timer >= x.timeout) {
      x.timer = 0.0f;
      return true;
  }

  return false;
}

/* oncollision_t strategy */
const oncollision_new = (target_name) => {
  let x = {};
  let e = x;

  e.init = oncollision_init;
  e.release = oncollision_release;
  e.should_trigger_event = oncollision_should_trigger_event;
  //x.target_name = str_dup(target_name);
  x.target_name = target_name;

  return e;
}

const oncollision_init = (event) => {
  ; /* empty */
}

const oncollision_release = (event) => {
  var e = event;
  //free(e.target_name);
}

const oncollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let x = event;
  let it;

  for(it = object_list; it != null; it = it.next) {
      if(strcmp(it.data.name, x.target_name) == 0) {
          if(actor_pixelperfect_collision(it.data.actor, object.actor))
              return true;
      }
  }

  return false;
}

/* onanimationfinished_t strategy */
const onanimationfinished_new = () => {
  let x = {};
  let e = x;

  e.init = onanimationfinished_init;
  e.release = onanimationfinished_release;
  e.should_trigger_event = onanimationfinished_should_trigger_event;

  return e;
}

const onanimationfinished_init = (event) => {
  ; /* empty */
}

const onanimationfinished_release = (event) => {
  ; /* empty */
}

const onanimationfinished_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  return actor_animation_finished(object.actor);
}

/* onrandomevent_t strategy */
const onrandomevent_new = (probability) => {
  let x = {};
  let e = x;

  e.init = onrandomevent_init;
  e.release = onrandomevent_release;
  e.should_trigger_event = onrandomevent_should_trigger_event;

  x.probability = Math.min(probability, 0.0, 1.0);

  return e;
}

const onrandomevent_init = (event) => {
  ; /* empty */
}

const onrandomevent_release = (event) => {
  ; /* empty */
}

const onrandomevent_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  var r = 100000 * ((onrandomevent_t*)event).probability;
  return r > random(100000);
}


/* onplayercollision_t strategy */
const onplayercollision_new = () => {
  let x = {};
  let e = x;

  e.init = onplayercollision_init;
  e.release = onplayercollision_release;
  e.should_trigger_event = onplayercollision_should_trigger_event;

  return e;
}

const onplayercollision_init = (event) => {
  ; /* empty */
}

const onplayercollision_release = (event) => {
  ; /* empty */
}

const onplayercollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let player = enemy_get_observed_player(object);
  return actor_pixelperfect_collision(object.actor, player.actor);
}


/* onplayerattack_t strategy */
const onplayerattack_new = () => {
  let x = {};
  let e = x;

  e.init = onplayerattack_init;
  e.release = onplayerattack_release;
  e.should_trigger_event = onplayerattack_should_trigger_event;

  return e;
}

const onplayerattack_init = (event) => {
  ; /* empty */
}

const onplayerattack_release = (event) => {
  ; /* empty */
}

const onplayerattack_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let player = enemy_get_observed_player(object);
  return player_attacking(player) && actor_pixelperfect_collision(object.actor, player.actor);
}

/* onplayerrectcollision_t strategy */
const onplayerrectcollision_new = (x1, y1, x2, y2) => {
  let x = {};
  let e = x;

  e.init = onplayerrectcollision_init;
  e.release = onplayerrectcollision_release;
  e.should_trigger_event = onplayerrectcollision_should_trigger_event;

  x.x1 = Math.min(x1, x2);
  x.y1 = Math.min(y1, y2);
  x.x2 = Math.max(x1, x2);
  x.y2 = Math.max(y1, y2);

  return e;
}

const onplayerrectcollision_init = (event) => {
  ; /* empty */
}

const onplayerrectcollision_release = (event) => {
  ; /* empty */
}

const onplayerrectcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let me = event;
  let act = object.actor;
  let player = enemy_get_observed_player(object);
  let pa = player.actor;
  let pi = actor_image(pa);
  let a = [];
  let b = [];

  a[0] = act.position.x + me.x1;
  a[1] = act.position.y + me.y1;
  a[2] = act.position.x + me.x2;
  a[3] = act.position.y + me.y2;

  b[0] = pa.position.x - pa.hot_spot.x;
  b[1] = pa.position.y - pa.hot_spot.y;
  b[2] = pa.position.x - pa.hot_spot.x + pi.w;
  b[3] = pa.position.y - pa.hot_spot.y + pi.h;

  return !player.dying && util.bounding_box(a, b);
}

/* onplayershield_t strategy */
const onplayershield_new = (shield_type) => {
  let x = {};
  let e = x;

  e.init = onplayershield_init;
  e.release = onplayershield_release;
  e.should_trigger_event = onplayershield_should_trigger_event;
  x.shield_type = shield_type;

  return e;
}

const onplayershield_init = (event) => {
  ; /* empty */
}

const onplayershield_release = (event) => {
  ; /* empty */
}

const onplayershield_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let me = event;
  let player = enemy_get_observed_player(object);

  return player.shield_type == me.shield_type;
}


/* onbrickcollision_t strategy */
const onbrickcollision_new = () => {
  let x = {};
  let e = x;

  e.init = onbrickcollision_init;
  e.release = onbrickcollision_release;
  e.should_trigger_event = onbrickcollision_should_trigger_event;

  return e;
}

const onbrickcollision_init = (event) => {
  ; /* empty */
}

const onbrickcollision_release = (event) => {
  ; /* empty */
}

const onbrickcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let sqrsize=1, diff=0;
  let act = object.actor;
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
  let x = {};
  let e = x;

  e.init = onfloorcollision_init;
  e.release = onfloorcollision_release;
  e.should_trigger_event = onfloorcollision_should_trigger_event;

  return e;
}

const onfloorcollision_init = (event) => {
  ; /* empty */
}

const onfloorcollision_release = (event) => {
  ; /* empty */
}

const onfloorcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let sqrsize=1, diff=0;
  let act = object.actor;
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
  let x = {};
  let e = x;

  e.init = onceilingcollision_init;
  e.release = onceilingcollision_release;
  e.should_trigger_event = onceilingcollision_should_trigger_event;

  return e;
}

const onceilingcollision_init = (event) => {
  ; /* empty */
}

const onceilingcollision_release = (event) => {
  ; /* empty */
}

const onceilingcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let sqrsize=1, diff=0;
  let act = object.actor;
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
  let x = {};
  let e = x;

  e.init = onleftwallcollision_init;
  e.release = onleftwallcollision_release;
  e.should_trigger_event = onleftwallcollision_should_trigger_event;

  return e;
}

const onleftwallcollision_init = (event) => {
  ; /* empty */
}

const onleftwallcollision_release = (event) => {
  ; /* empty */
}

const onleftwallcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let sqrsize=1, diff=0;
  let act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (left != null && left.brick_ref.property == BRK_OBSTACLE) ||
      (upleft != null && upleft.brick_ref.property == BRK_OBSTACLE)
  ;
}

/* onrightwallcollision_t strategy */
const onrightwallcollision_new = () => {
  let x = {};
  let e = x;

  e.init = onrightwallcollision_init;
  e.release = onrightwallcollision_release;
  e.should_trigger_event = onrightwallcollision_should_trigger_event;

  return e;
}

const onrightwallcollision_init = (event) => {
  ; /* empty */
}

const onrightwallcollision_release = (event) => {
  ; /* empty */
}

const onrightwallcollision_should_trigger_event = (event, object, team, team_size, brick_list, item_list, object_list) => {
  let sqrsize=1, diff=0;
  let act = object.actor;
  let up, upright, right, downright, down, downleft, left, upleft;

  actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);

  return
      (right != null && right.brick_ref.property == BRK_OBSTACLE) ||
      (upright != null && upright.brick_ref.property == BRK_OBSTACLE)
  ;
}


