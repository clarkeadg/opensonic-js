
import { get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { player_hit } from "./../player"
import { SH_WATERSHIELD, SH_THUNDERSHIELD, SH_FIRESHIELD, SH_ACIDSHIELD } from "./../item"

export const hitplayer_new = (decorated_machine) => make_decorator(decorated_machine, hit_strategy)
export const burnplayer_new = (decorated_machine) => make_decorator(decorated_machine, burn_strategy)
export const shockplayer_new = (decorated_machine) => make_decorator(decorated_machine, shock_strategy)
export const acidplayer_new = (decorated_machine) => make_decorator(decorated_machine, acid_strategy)

const make_decorator = (decorated_machine, strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.should_hit_the_player = strategy;

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

  var player = enemy_get_observed_player(obj.get_object_instance(obj));

  if(!player.invincible && me.should_hit_the_player(player))
    player_hit(player);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}

const hit_strategy = (p) => true

const burn_strategy = (p) => p.shield_type != SH_FIRESHIELD && p.shield_type != SH_WATERSHIELD

const shock_strategy = (p) => p.shield_type != SH_THUNDERSHIELD

const acid_strategy = (p) => p.shield_type != SH_ACIDSHIELD

