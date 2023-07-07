
import { get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"

export const setplayerxspeed_new = (decorated_machine, speed) => {
  return make_decorator(decorated_machine, speed, set_xspeed);
};

export const setplayeryspeed_new = (decorated_machine, speed) => {
  return make_decorator(decorated_machine, speed, set_yspeed);
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

  let player = enemy_get_observed_player(obj.get_object_instance(obj));

  me.strategy(player, me.speed);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const make_decorator = (decorated_machine, speed, strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.speed = speed;
  me.strategy = strategy;

  return obj;
}

const set_xspeed = (player, speed) => {
  player.actor.speed.x = speed;
}

const set_yspeed = (player, speed) => {
  player.actor.speed.y = speed;
}
