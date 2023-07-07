
import { get_object_instance } from "./base/objectdecorator"
import { v2d_new, v2d_add } from "./../../core/v2d"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { player_bounce, player_attacking } from "./../player"
import { actor_pixelperfect_collision } from "./../actor"
import { IT_EXPLOSION } from "./../item"
import { ES_DEAD } from "./../enemy"
import { level_add_to_score, level_create_animal, level_create_item } from "./../../scenes/level"

export const enemy_new = (decorated_machine, score) => {
  let me = {};

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;

  me.score = score;

  return me;
}

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  if (decorated_machine)
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
  let i;

  /* player x object collision */
  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(actor_pixelperfect_collision(object.actor, player.actor)) {
        if(player_attacking(player) || player.invincible) {
          // I've been defeated 
          if(player.actor.is_jumping)
              player_bounce(player);
          level_add_to_score(me.score);
          level_create_item(IT_EXPLOSION, v2d_add(object.actor.position, v2d_new(0,-15)));
          level_create_animal(object.actor.position);
          sound_play( soundfactory_get("destroy") );
          object.state = ES_DEAD;
        }
        else {
          // The player has been hit by me
          player.hit(player);
        }
      }
    }
  }

  if (decorated_machine)
    decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}
