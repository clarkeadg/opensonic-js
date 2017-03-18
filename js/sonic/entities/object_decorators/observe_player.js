
import { get_object_instance } from "./base/objectdecorator"
import { enemy_observe_player, enemy_get_observed_player } from "./../enemy"

export const observeplayer_new = (decorated_machine, player_name) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy(player_name, object, observe_player));
}

export const observecurrentplayer_new = (decorated_machine) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("foo", object, observe_current_player));
}

export const observeactiveplayer_new = (decorated_machine) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("bar", object, observe_active_player));
}

export const observeallplayers_new = (decorated_machine) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("boo", object, observe_all_players));
}

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
  me.strategy = strategy;

  return obj;
}

const make_strategy = (player_name, object) => {
  let x = {};

  //x.player_name = str_dup(player_name);
  x.player_name = player_name;
  x.object = object;
  x.run = run_func;

  return x;
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

  me.strategy.run(me.strategy, team, team_size);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const observe_player = (strategy, team, team_size) => {
  let i;
  let player = null;

  //for(i=0; i<team_size; i++) {
  //    if(str_icmp(team[i].name, strategy.player_name) == 0)
  //        player = team[i];
  //}

  //if(player == null)
  //  fatal_error("Can't observe player \"%s\": player does not exist!", strategy.player_name);

  enemy_observe_player(strategy.object, player);
}

const observe_current_player = (strategy, team, team_size) => {
  enemy_observe_current_player(strategy.object);
}

const observe_active_player = (strategy, team, team_size) => {
  enemy_observe_active_player(strategy.object);
}

const observe_all_players = (strategy, team, team_size) => {
  let observed_player = enemy_get_observed_player(strategy.object);
  let i;

  for(i=0; i<team_size; i++) {
    if(team[i] == observed_player) {
      enemy_observe_player(strategy.object, team[(i+1)%team_size]);
      break;
    }
  }
}


