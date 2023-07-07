
import { logfile_message, logfile_fatal_error } from "./../core/logfile"
import { object_vm_create_state, object_vm_set_current_state, object_vm_get_reference_to_current_state } from "./object_vm"
import { bullettrajectory_new } from "./object_decorators/bullet_trajectory"
import { enemy_new } from "./object_decorators/enemy"
import { ellipticaltrajectory_new } from "./object_decorators/elliptical_trajectory"
import { gravity_new } from "./object_decorators/gravity"
import { lookleft_new, lookright_new, lookatplayer_new, lookatwalkingdirection_new } from "./object_decorators/look"
import { mosquitomovement_new } from "./object_decorators/mosquito_movement"
import { setanimation_new } from "./object_decorators/set_animation"
import { walk_new } from "./object_decorators/walk"

const DEFAULT_STATE                  = "main";
const STACKMAX                       =  1024;

let stacksize;
let stack = {};
let command_table = [
  /* basic actions */
  { "command": "set_animation", "action": set_animation },
  { "command": "set_obstacle", "action": set_obstacle },
  { "command": "set_alpha", "action": set_alpha },
  { "command": "hide", "action": hide },
  { "command": "show", "action": show },
  { "command": "enemy", "action": enemy },

  /* player interaction */
  { "command": "lock_camera", "action": lock_camera },
  { "command": "move_player", "action": move_player },
  { "command": "hit_player", "action": hit_player },
  { "command": "burn_player", "action": burn_player },
  { "command": "shock_player", "action": shock_player },
  { "command": "acid_player", "action": acid_player },
  { "command": "add_rings", "action": add_rings },
  { "command": "add_to_score", "action": add_to_score },
  { "command": "set_player_animation", "action": set_player_animation },
  { "command": "enable_player_movement", "action": enable_player_movement },
  { "command": "disable_player_movement", "action": disable_player_movement },
  { "command": "set_player_xspeed", "action": set_player_xspeed },
  { "command": "set_player_yspeed", "action": set_player_yspeed },
  { "command": "set_player_position", "action": set_player_position },
  { "command": "bounce_player", "action": bounce_player },
  { "command": "observe_player", "action": observe_player },
  { "command": "observe_current_player", "action": observe_current_player },
  { "command": "observe_active_player", "action": observe_active_player },
  { "command": "observe_all_players", "action": observe_all_players },
  { "command": "observe_next_player", "action": observe_all_players },
  { "command": "attach_to_player", "action": attach_to_player },
  { "command": "springfy_player", "action": springfy_player },
  { "command": "roll_player", "action": roll_player },

  /* movement */
  { "command": "walk", "action": walk },
  { "command": "gravity", "action": gravity },
  { "command": "jump", "action": jump },
  { "command": "move", "action": bullet_trajectory },
  { "command": "bullet_trajectory", "action": bullet_trajectory },
  { "command": "elliptical_trajectory", "action": elliptical_trajectory },
  { "command": "mosquito_movement", "action": mosquito_movement },
  { "command": "look_left", "action": look_left },
  { "command": "look_right", "action": look_right },
  { "command": "look_at_player", "action": look_at_player },
  { "command": "look_at_walking_direction", "action": look_at_walking_direction },

  /* object management */
  { "command": "create_item", "action": create_item },
  { "command": "change_closest_object_state", "action": change_closest_object_state },
  { "command": "create_child", "action": create_child },
  { "command": "change_child_state", "action": change_child_state },
  { "command": "change_parent_state", "action": change_parent_state },
  { "command": "destroy", "action": destroy },

  /* events */
  { "command": "change_state", "action": change_state },
  { "command": "on_timeout", "action": on_timeout },
  { "command": "on_collision", "action": on_collision },
  { "command": "on_animation_finished", "action": on_animation_finished },
  { "command": "on_random_event", "action": on_random_event },
  { "command": "on_player_collision", "action": on_player_collision },
  { "command": "on_player_attack", "action": on_player_attack },
  { "command": "on_player_rect_collision", "action": on_player_rect_collision },
  { "command": "on_no_shield", "action": on_no_shield },
  { "command": "on_shield", "action": on_shield },
  { "command": "on_fire_shield", "action": on_fire_shield },
  { "command": "on_thunder_shield", "action": on_thunder_shield },
  { "command": "on_water_shield", "action": on_water_shield },
  { "command": "on_acid_shield", "action": on_acid_shield },
  { "command": "on_wind_shield", "action": on_wind_shield },
  { "command": "on_brick_collision", "action": on_brick_collision },
  { "command": "on_floor_collision", "action": on_floor_collision },
  { "command": "on_ceiling_collision", "action": on_ceiling_collision },
  { "command": "on_left_wall_collision", "action": on_left_wall_collision },
  { "command": "on_right_wall_collision", "action": on_right_wall_collision },

  /* level */
  { "command": "show_dialog_box", "action": show_dialog_box },
  { "command": "hide_dialog_box", "action": hide_dialog_box },
  { "command": "clear_level", "action": clear_level },

  /* audio commands */
  { "command": "play_sample", "action": audio_play_sample },
  { "command": "play_music", "action": audio_play_music },
  { "command": "play_level_music", "action": audio_play_level_music },
  { "command": "set_music_volume", "action": audio_set_music_volume },

  /* end of table */
  { "command": null, "action": null }
];

export const object_compiler_compile = (obj, script) => {
  obj = traverse_object(script, obj);
  return obj;
}  
  
function traverse_object(stmt, object) {
  let e = object;
  let id = stmt;
  let param_list = stmt;
  let machine_ref;
  let state;

  // state
  if (e.state === 0) {
    let state_name = stmt.state.name;
    let state_code = e.state;
    e.vm.state_list = object_vm_create_state(e.vm, stmt.state.list);
    e.vm = object_vm_set_current_state(e.vm, state_name);
    machine_ref = object_vm_get_reference_to_current_state(e.vm);

    stacksize = 0;
    //push_object_state(state_code, machine_ref);
    push_object_state(stmt.state.list, machine_ref);
    while(stacksize-- > 0) {// traverse in reverse order - note the order of the decorators
      machine_ref = traverse_object_state(stack[stacksize].stmt, stack[stacksize].machine);
    }

    if (machine_ref) {
      machine_ref.init(machine_ref);
    }
  }

  e.vm.reference_to_current_state = machine_ref;

  if (stmt.destroy_if_far_from_play_area)
    e.preserve = false;    

  if (stmt.always_active)
    e.always_active = true;    

  if (stmt.hide_unless_in_editor_mode)
    e.hide_unless_in_editor_mode = true;  

  return e;
} 

function push_object_state(stmt, machine) {
  if(stacksize < STACKMAX) {
    stack[stacksize] = {};
    stack[stacksize].stmt = stmt;
    stack[stacksize].machine = machine;
    stacksize++;
  }
  else
    logfile_message("Object script error: you may write %d commands or less per state", STACKMAX);

  return 0;
}

// this is where the decorators get added!
function traverse_object_state(stmt, machine) {

  let param_list = stmt;
  let i, n, p;
  let numParams;
 
  n = param_list.length;
  for(i=0; i<n; i++) {
    p = param_list[i];
    numParams = (p[1] && typeof p[1] != 'undefined' ) ? (p[1].length ? p[1].length : 1) : 0;
    machine = compile_command(machine, p[0], numParams, p[1]);
  } 

  return machine;
}

function compile_command(machine_ref, command, n, param) {

  let i = 0;
  let e = command_table[i++];

  /* finds the corresponding command in the table */
  while(e.command != null && e.action != null) {
    if (e.command == command)
      machine_ref = e.action(machine_ref, n, param);
    e = command_table[i++];
  }

  return machine_ref;
}

/* basic actions */
function set_animation(m, n, p) {
  if(n == 2)
    m = setanimation_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - set_animation expects two parameters: sprite_name, animation_id");
  return m;
}

function set_obstacle(m, n, p) {
  if(n == 1)
    m = objectdecorator_setobstacle_new(m, p[0], 0);
  else if(n == 2)
    m = objectdecorator_setobstacle_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - set_obstacle expects at least one and at most two parameters: is_obstacle (TRUE or FALSE) [, angle]");
}

function set_alpha(m, n, p) {
  if(n == 1)
    m = objectdecorator_setalpha_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - set_alpha expects one parameter: alpha (0.0 (transparent) <= alpha <= 1.0 (opaque))");
}

function hide(m, n, p) {
  if(n == 0)
    m = objectdecorator_setalpha_new(m, 0.0);
  else
    logfile_fatal_error("Object script error - hide expects no parameters");
}

function show(m, n, p) {
  if(n == 0)
    m = objectdecorator_setalpha_new(m, 1.0);
  else
    logfile_fatal_error("Object script error - show expects no parameters");
}

/* player interaction */
function lock_camera(m, n, p) {
  if(n == 4)
    m = objectdecorator_lockcamera_new(m, p[0], p[1], p[2], p[3]);
  else
    logfile_fatal_error("Object script error - lock_camera expects four parameters: x1, y1, x2, y2");
}

function move_player(m, n, p) {
  if(n == 2)
    m = objectdecorator_moveplayer_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - move_player expects two parameters: speed_x, speed_y");
}

function hit_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_hitplayer_new(m);
  else
    logfile_fatal_error("Object script error - hit_player expects no parameters");
}

function burn_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_burnplayer_new(m);
  else
    logfile_fatal_error("Object script error - burn_player expects no parameters");
}

function shock_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_shockplayer_new(m);
  else
    logfile_fatal_error("Object script error - shock_player expects no parameters");
}

function acid_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_acidplayer_new(m);
  else
    logfile_fatal_error("Object script error - acid_player expects no parameters");
}

function add_rings(m, n, p) {
  if(n == 1)
    m = objectdecorator_addrings_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - add_rings expects one parameter: number_of_rings");
}

function add_to_score(m, n, p) {
  if(n == 1)
    m = objectdecorator_addtoscore_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - add_to_score expects one parameter: score");
}

function set_player_animation(m, n, p) {
  if(n == 2)
    m = objectdecorator_setplayeranimation_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - set_player_animation expects two parameters: sprite_name, animation_id");
}

function enable_player_movement(m, n, p) {
  if(n == 0)
    m = objectdecorator_enableplayermovement_new(m);
  else
    logfile_fatal_error("Object script error - enable_player_movement expects no parameters");
}

function disable_player_movement(m, n, p) {
  if(n == 0)
    m = objectdecorator_disableplayermovement_new(m);
  else
    logfile_fatal_error("Object script error - disable_player_movement expects no parameters");
}

function set_player_xspeed(m, n, p) {
  if(n == 1)
    m = objectdecorator_setplayerxspeed_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - set_player_xspeed expects one parameter: speed");
}

function set_player_yspeed(m, n, p) {
  if(n == 1)
    m = objectdecorator_setplayeryspeed_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - set_player_yspeed expects one parameter: speed");
}

function set_player_position(m, n, p) {
  if(n == 2)
    m = objectdecorator_setplayerposition_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - set_player_position expects two parameters: xpos, ypos");
}

function bounce_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_bounceplayer_new(m);
  else
    logfile_fatal_error("Object script error - bounce_player expects no parameters");
}

function observe_player(m, n, p) {
  if(n == 1)
    m = objectdecorator_observeplayer_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - observe_player expects one parameter: player_name");
}

function observe_current_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_observecurrentplayer_new(m);
  else
    logfile_fatal_error("Object script error - observe_current_player expects no parameters");
}

function observe_active_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_observeactiveplayer_new(m);
  else
    logfile_fatal_error("Object script error - observe_active_player expects no parameters");
}

function observe_all_players(m, n, p) {
  if(n == 0)
    m = objectdecorator_observeallplayers_new(m);
  else
    logfile_fatal_error("Object script error - observe_all_players expects no parameters");
}

function attach_to_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_attachtoplayer_new(m, 0, 0);
  else if(n == 1)
    m = objectdecorator_attachtoplayer_new(m, p[0], 0);
  else if(n == 2)
    m = objectdecorator_attachtoplayer_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - attach_to_player expects at most two parameters: [offset_x [, offset_y]]");
}

function springfy_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_springfyplayer_new(m);
  else
    logfile_fatal_error("Object script error - springfy_player expects no parameters");
}

function roll_player(m, n, p) {
  if(n == 0)
    m = objectdecorator_rollplayer_new(m);
  else
    logfile_fatal_error("Object script error - roll_player expects no parameters");
}

/* movement */
function enemy(m, n, p) {
  //console.log('7777',level)
  if(n == 1)
    m = enemy_new(m, p);
  else
    logfile_fatal_error("Object script error - enemy expects one parameter: score");
  return m;
}

function walk(m, n, p) {
  if(n == 1)
    m = walk_new(m, p);
  else
    logfile_fatal_error("Object script error - walk expects one parameter: speed");
  return m;
}

function gravity(m, n, p) {
  if(n == 0)
    m = gravity_new(m);
  else
    logfile_fatal_error("Object script error - gravity expects no parameters");
  return m;
}

function jump(m, n, p) {
  if(n == 1)
    m = objectdecorator_jump_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - jump expects one parameter: jump_strength");
}

function bullet_trajectory(m, n, p) {
  if(n == 2)
    m = bullettrajectory_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - bullet_trajectory expects two parameters: speed_x, speed_y");
  return m;
}

function elliptical_trajectory(m, n, p) {
  if(n >= 4 && n <= 6)
    m = ellipticaltrajectory_new(m, p[0], p[1], p[2], p[3], p[4], p[5]);
  else
    logfile_fatal_error("Object script error - elliptical_trajectory expects at least four and at most six parameters: amplitude_x, amplitude_y, angularspeed_x, angularspeed_y [, initialphase_x [, initialphase_y]]");
  return m;
}

function mosquito_movement(m, n, p) {
  if(n == 1)
    m = mosquitomovement_new(m, p);
  else
    logfile_fatal_error("Object script error - mosquito_movement expects one parameter: speed");
  return m;
}

function look_left(m, n, p) {
  if(n == 0)
    m = lookleft_new(m);
  else
    logfile_fatal_error("Object script error - look_left expects no parameters");
}

function look_right(m, n, p) {
  if(n == 0)
    m = lookright_new(m);
  else
    logfile_fatal_error("Object script error - look_right expects no parameters");
}

function look_at_player(m, n, p) {
  if(n == 0)
    m = lookatplayer_new(m);
  else
    logfile_fatal_error("Object script error - look_at_player expects no parameters");
  return m;
}

function look_at_walking_direction(m, n, p) {
  if(n == 0)
    m = lookatwalkingdirection_new(m);
  else
    logfile_fatal_error("Object script error - look_at_walking_direction expects no parameters");
  return m;
}

/* object management */
function create_item(m, n, p) {
  if(n == 3)
    m = objectdecorator_createitem_new(m, p[0], p[1], p[2]);
  else
    logfile_fatal_error("Object script error - create_item expects three parameters: item_id, offset_x, offset_y");
}

function change_closest_object_state(m, n, p) {
  if(n == 2)
    m = objectdecorator_changeclosestobjectstate_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - change_closest_object_state expects two parameters: object_name, new_state_name");
}

function create_child(m, n, p) {
  if(n == 3)
    m = objectdecorator_createchild_new(m, p[0], p[1], p[2], ""); /* dummy child name */
  else if(n == 4)
    m = objectdecorator_createchild_new(m, p[0], p[1], p[2], p[3]);
  else
    logfile_fatal_error("Object script error - create_child expects three or four parameters: object_name, offset_x, offset_y [, child_name]");
}

function change_child_state(m, n, p) {
  if(n == 2)
    m = objectdecorator_changechildstate_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - change_child_state expects two parameters: child_name, new_state_name");
}

function change_parent_state(m, n, p) {
  if(n == 1)
    m = objectdecorator_changeparentstate_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - change_parent_state expects one parameter: new_state_name");
}

function destroy(m, n, p) {
  if(n == 0)
    m = objectdecorator_destroy_new(m);
  else
    logfile_fatal_error("Object script error - destroy expects no parameters");
}

/* events */
function change_state(m, n, p) {
  if(n == 1)
    m = objectdecorator_ontimeout_new(m, 0.0, p[0]);
  else
    logfile_fatal_error("Object script error - change_state expects one parameter: new_state_name");
}

function on_timeout(m, n, p) {
  if(n == 2)
    m = objectdecorator_ontimeout_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_timeout expects two parameters: timeout (in seconds), new_state_name");
}

function on_collision(m, n, p) {
  if(n == 2)
    m = objectdecorator_oncollision_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_collision expects two parameters: object_name, new_state_name");
}

function on_animation_finished(m, n, p) {
  if(n == 1)
    m = objectdecorator_onanimationfinished_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_animation_finished expects one parameter: new_state_name");
}

function on_random_event(m, n, p) {
  if(n == 2)
    m = objectdecorator_onrandomevent_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_random_event expects two parameters: probability (0.0 <= probability <= 1.0), new_state_name");
}

function on_player_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onplayercollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_player_collision expects one parameter: new_state_name");
}

function on_player_attack(m, n, p) {
  if(n == 1)
    m = objectdecorator_onplayerattack_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_player_attack expects one parameter: new_state_name");
}

function on_player_rect_collision(m, n, p) {
  if(n == 5)
    m = objectdecorator_onplayerrectcollision_new(m, p[0], p[1], p[2], p[3], p[4]);
  else
    logfile_fatal_error("Object script error - on_player_rect_collision expects five parameters: offset_x1, offset_y1, offset_x2, offset_y2, new_state_name");
}

function on_no_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onnoshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_no_shield expects one parameter: new_state_name");
}

function on_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_shield expects one parameter: new_state_name");
}

function on_fire_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onfireshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_fire_shield expects one parameter: new_state_name");
}

function on_thunder_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onthundershield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_thunder_shield expects one parameter: new_state_name");
}

function on_water_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onwatershield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_water_shield expects one parameter: new_state_name");
}

function on_acid_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onacidshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_acid_shield expects one parameter: new_state_name");
}

function on_wind_shield(m, n, p) {
  if(n == 1)
    m = objectdecorator_onwindshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_wind_shield expects one parameter: new_state_name");
}

function on_brick_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onbrickcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_brick_collision expects one parameter: new_state_name");
}

function on_floor_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onfloorcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_floor_collision expects one parameter: new_state_name");
}

function on_ceiling_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onceilingcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_ceiling_collision expects one parameter: new_state_name");
}

function on_left_wall_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onleftwallcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_left_wall_collision expects one parameter: new_state_name");
}

function on_right_wall_collision(m, n, p) {
  if(n == 1)
    m = objectdecorator_onrightwallcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_right_wall_collision expects one parameter: new_state_name");
}

/* level */
function show_dialog_box(m, n, p) {
  if(n == 2)
    m = objectdecorator_showdialogbox_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - show_dialog_box expects two parameters: title, message");
}

function hide_dialog_box(m, n, p) {
  if(n == 0)
    m = objectdecorator_hidedialogbox_new(m);
  else
    logfile_fatal_error("Object script error - hide_dialog_box expects no parameters");
}

function clear_level(m, n, p) {
  if(n == 0)
    m = objectdecorator_clearlevel_new(m);
  else
    logfile_fatal_error("Object script error - clear_level expects no parameters");
}

/* audio commands */
function audio_play_sample(m, n, p) {
  if(n == 1)
    m = objectdecorator_playsample_new(m, p[0], 1.0, 0.0, 1.0, 0);
  else if(n == 2)
    m = objectdecorator_playsample_new(m, p[0], p[1], 0.0, 1.0, 0);
  else if(n == 3)
    m = objectdecorator_playsample_new(m, p[0], p[1], p[2], 1.0, 0);
  else if(n == 4)
    m = objectdecorator_playsample_new(m, p[0], p[1], p[2], p[3], 0);
  else if(n == 5)
    m = objectdecorator_playsample_new(m, p[0], p[1], p[2], p[3], p[4]);
  else
    logfile_fatal_error("Object script error - play_sample expects at least one and at most five parameters: sound_name [, volume [, pan [, frequency [, loops]]]]");
}

function audio_play_music(m, n, p) {
  if(n == 1)
    m = objectdecorator_playmusic_new(m, p[0], 0);
  else if(n == 2)
    m = objectdecorator_playmusic_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - play_music expects at least one and at most two parameters: music_name [, loops]");
} 

function audio_play_level_music(m, n, p) {
  if(n == 0)
    m = objectdecorator_playlevelmusic_new(m);
  else
    logfile_fatal_error("Object script error - play_level_music expects no parameters");
}

function audio_set_music_volume(m, n, p) {
  if(n == 1)
    m = objectdecorator_setmusicvolume_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - set_music_volume expects one parameter: volume");
}
