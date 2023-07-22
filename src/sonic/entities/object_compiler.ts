import { logfile_message, logfile_fatal_error } from "./../core/logfile"
import { data_objects_t, data_object_t } from "./../core/data"
import { enemy_t } from "./enemy"
import { object_vm_create_state, object_vm_set_current_state, object_vm_get_reference_to_current_state } from "./object_vm"
import { objectmachine_t } from "./object_decorators/base/objectmachine"
import { objectdecorator_addrings_new } from "./object_decorators/add_rings"
import { objectdecorator_addtoscore_new } from "./object_decorators/add_to_score"
import { objectdecorator_attachtoplayer_new } from "./object_decorators/attach_to_player"
import { objectdecorator_playsample_new, objectdecorator_playmusic_new, objectdecorator_playlevelmusic_new, objectdecorator_setmusicvolume_new } from "./object_decorators/audio"
import { objectdecorator_bounceplayer_new } from "./object_decorators/bounce_player"
import { objectdecorator_bullettrajectory_new } from "./object_decorators/bullet_trajectory"
import { objectdecorator_changeclosestobjectstate_new } from "./object_decorators/change_closest_object_state"
import { objectdecorator_createchild_new, objectdecorator_changechildstate_new, objectdecorator_changeparentstate_new } from "./object_decorators/children"
import { objectdecorator_clearlevel_new } from "./object_decorators/clear_level"
import { objectdecorator_createitem_new } from "./object_decorators/create_item"
import { objectdecorator_destroy_new } from "./object_decorators/destroy"
import { objectdecorator_showdialogbox_new, objectdecorator_hidedialogbox_new } from "./object_decorators/dialog_box"
import { objectdecorator_ellipticaltrajectory_new } from "./object_decorators/elliptical_trajectory"
import { objectdecorator_enemy_new } from "./object_decorators/enemy"
import { objectdecorator_gravity_new } from "./object_decorators/gravity"
import { objectdecorator_hitplayer_new, objectdecorator_burnplayer_new, objectdecorator_shockplayer_new, objectdecorator_acidplayer_new } from "./object_decorators/hit_player"
import { objectdecorator_jump_new } from "./object_decorators/jump"
import { objectdecorator_lockcamera_new } from "./object_decorators/lock_camera"
import { objectdecorator_lookleft_new, objectdecorator_lookright_new, objectdecorator_lookatplayer_new, objectdecorator_lookatwalkingdirection_new } from "./object_decorators/look"
import { objectdecorator_mosquitomovement_new } from "./object_decorators/mosquito_movement"
import { objectdecorator_moveplayer_new } from "./object_decorators/move_player"
import { objectdecorator_observeplayer_new, objectdecorator_observecurrentplayer_new, objectdecorator_observeactiveplayer_new, objectdecorator_observeallplayers_new } from "./object_decorators/observe_player"
import { objectdecorator_ontimeout_new, objectdecorator_oncollision_new, objectdecorator_onanimationfinished_new, objectdecorator_onrandomevent_new, objectdecorator_onplayercollision_new, objectdecorator_onplayerattack_new, objectdecorator_onplayerrectcollision_new, objectdecorator_onnoshield_new, objectdecorator_onshield_new, objectdecorator_onfireshield_new, objectdecorator_onthundershield_new, objectdecorator_onwatershield_new, objectdecorator_onacidshield_new, objectdecorator_onwindshield_new, objectdecorator_onbrickcollision_new, objectdecorator_onfloorcollision_new, objectdecorator_onceilingcollision_new, objectdecorator_onleftwallcollision_new, objectdecorator_onrightwallcollision_new  } from "./object_decorators/on_event"
import { objectdecorator_springfyplayer_new, objectdecorator_rollplayer_new } from "./object_decorators/player_action"
import { objectdecorator_enableplayermovement_new, objectdecorator_disableplayermovement_new } from "./object_decorators/player_movement"
import { objectdecorator_setalpha_new } from "./object_decorators/set_alpha"
import { objectdecorator_setanimation_new } from "./object_decorators/set_animation"
import { objectdecorator_setobstacle_new } from "./object_decorators/set_obstacle"
import { objectdecorator_setplayeranimation_new } from "./object_decorators/set_player_animation"
import { objectdecorator_setplayerposition_new } from "./object_decorators/set_player_position"
import { objectdecorator_setplayerxspeed_new, objectdecorator_setplayeryspeed_new } from "./object_decorators/set_player_speed"
import { objectdecorator_walk_new } from "./object_decorators/walk"

const DEFAULT_STATE                  = "main";
const STACKMAX                       =  1024;

let stacksize:number = 0;
let stack:any = {};
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

export const object_compiler_compile = (obj:any, script:any) => {
  obj = traverse_object(script, obj);
  return obj;
}  
  
function traverse_object(stmt:data_object_t, object:enemy_t) {
  let e = object;
  let id = stmt;
  let param_list = stmt;
  let machine_ref;
  let state;

  // state
  if (e.state === 0) {
    let state_name = stmt.state.name;
    let state_code = e.state;
    e.vm.state_list = object_vm_create_state(e.vm, stmt.state.list[0][0]);
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

function push_object_state(stmt:any, machine:any) {
  if(stacksize < STACKMAX) {
    stack[stacksize] = {};
    stack[stacksize].stmt = stmt;
    stack[stacksize].machine = machine;
    stacksize++;
  }
  else
    logfile_message(`Object script error: you may write ${STACKMAX} commands or less per state`);

  return 0;
}

// this is where the decorators get added!
function traverse_object_state(stmt:any, machine:any) {

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

function callAction(action:Function, machine_ref:objectmachine_t, n:number, param:string):objectmachine_t {
  return action(machine_ref, n, param);
}

function compile_command(machine_ref:objectmachine_t, command:string, n:number, param: string) {

  let i = 0;
  let e = command_table[i++];

  /* finds the corresponding command in the table */
  while(e.command != null && e.action != null) {
    if (e.command == command)
      machine_ref = callAction(e.action, machine_ref, n, param)
      //machine_ref = e.action(machine_ref, n, param);
    e = command_table[i++];
  }

  return machine_ref;
}

/* basic actions */
function set_animation(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_setanimation_new(m, p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - set_animation expects two parameters: sprite_name, animation_id");
  return m;
}

function set_obstacle(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_setobstacle_new(m, +p[0], 0);
  else if(n == 2)
    m = objectdecorator_setobstacle_new(m, +p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - set_obstacle expects at least one and at most two parameters: is_obstacle (TRUE or FALSE) [, angle]");
  return m;
}

function set_alpha(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_setalpha_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - set_alpha expects one parameter: alpha (0.0 (transparent) <= alpha <= 1.0 (opaque))");
  return m;
}

function hide(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_setalpha_new(m, 0.0);
  else
    logfile_fatal_error("Object script error - hide expects no parameters");
  return m;
}

function show(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_setalpha_new(m, 1.0);
  else
    logfile_fatal_error("Object script error - show expects no parameters");
  return m;
}

/* player interaction */
function lock_camera(m:objectmachine_t, n:number, p:string) {
  if(n == 4)
    m = objectdecorator_lockcamera_new(m, +p[0], +p[1], +p[2], +p[3]);
  else
    logfile_fatal_error("Object script error - lock_camera expects four parameters: x1, y1, x2, y2");
  return m;
}

function move_player(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_moveplayer_new(m, +p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - move_player expects two parameters: speed_x, speed_y");
  return m;
}

function hit_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_hitplayer_new(m);
  else
    logfile_fatal_error("Object script error - hit_player expects no parameters");
  return m;
}

function burn_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_burnplayer_new(m);
  else
    logfile_fatal_error("Object script error - burn_player expects no parameters");
  return m;
}

function shock_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_shockplayer_new(m);
  else
    logfile_fatal_error("Object script error - shock_player expects no parameters");
  return m;
}

function acid_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_acidplayer_new(m);
  else
    logfile_fatal_error("Object script error - acid_player expects no parameters");
  return m;
}

function add_rings(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_addrings_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - add_rings expects one parameter: number_of_rings");
  return m;
}

function add_to_score(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_addtoscore_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - add_to_score expects one parameter: score");
  return m;
}

function set_player_animation(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_setplayeranimation_new(m, p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - set_player_animation expects two parameters: sprite_name, animation_id");
  return m;
}

function enable_player_movement(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_enableplayermovement_new(m);
  else
    logfile_fatal_error("Object script error - enable_player_movement expects no parameters");
  return m;
}

function disable_player_movement(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_disableplayermovement_new(m);
  else
    logfile_fatal_error("Object script error - disable_player_movement expects no parameters");
}

function set_player_xspeed(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_setplayerxspeed_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - set_player_xspeed expects one parameter: speed");
  return m;
}

function set_player_yspeed(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_setplayeryspeed_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - set_player_yspeed expects one parameter: speed");
  return m;
}

function set_player_position(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_setplayerposition_new(m, +p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - set_player_position expects two parameters: xpos, ypos");
  return m;
}

function bounce_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_bounceplayer_new(m);
  else
    logfile_fatal_error("Object script error - bounce_player expects no parameters");
  return m;
}

function observe_player(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_observeplayer_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - observe_player expects one parameter: player_name");
  return m;
}

function observe_current_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_observecurrentplayer_new(m);
  else
    logfile_fatal_error("Object script error - observe_current_player expects no parameters");
  return m;
}

function observe_active_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_observeactiveplayer_new(m);
  else
    logfile_fatal_error("Object script error - observe_active_player expects no parameters");
  return m;
}

function observe_all_players(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_observeallplayers_new(m);
  else
    logfile_fatal_error("Object script error - observe_all_players expects no parameters");
  return m;
}

function attach_to_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_attachtoplayer_new(m, 0, 0);
  else if(n == 1)
    m = objectdecorator_attachtoplayer_new(m, +p[0], 0);
  else if(n == 2)
    m = objectdecorator_attachtoplayer_new(m, +p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - attach_to_player expects at most two parameters: [offset_x [, offset_y]]");
  return m;
}

function springfy_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_springfyplayer_new(m);
  else
    logfile_fatal_error("Object script error - springfy_player expects no parameters");
  return m;
}

function roll_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_rollplayer_new(m);
  else
    logfile_fatal_error("Object script error - roll_player expects no parameters");
  return m;
}

/* movement */
function enemy(m:objectmachine_t, n:number, p:string) {
  //console.log('7777',level)
  if(n == 1)
    m = objectdecorator_enemy_new(m, +p);
  else
    logfile_fatal_error("Object script error - enemy expects one parameter: score");
  return m;
}

function walk(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_walk_new(m, +p);
  else
    logfile_fatal_error("Object script error - walk expects one parameter: speed");
  return m;
}

function gravity(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_gravity_new(m);
  else
    logfile_fatal_error("Object script error - gravity expects no parameters");
  return m;
}

function jump(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_jump_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - jump expects one parameter: jump_strength");
  return m;
}

function bullet_trajectory(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_bullettrajectory_new(m, +p[0], +p[1]);
  else
    logfile_fatal_error("Object script error - bullet_trajectory expects two parameters: speed_x, speed_y");
  return m;
}

function elliptical_trajectory(m:objectmachine_t, n:number, p:string) {
  if(n >= 4 && n <= 6)
    m = objectdecorator_ellipticaltrajectory_new(m, +p[0], +p[1], +p[2], +p[3], +p[4], +p[5]);
  else
    logfile_fatal_error("Object script error - elliptical_trajectory expects at least four and at most six parameters: amplitude_x, amplitude_y, angularspeed_x, angularspeed_y [, initialphase_x [, initialphase_y]]");
  return m;
}

function mosquito_movement(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_mosquitomovement_new(m, +p);
  else
    logfile_fatal_error("Object script error - mosquito_movement expects one parameter: speed");
  return m;
}

function look_left(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_lookleft_new(m);
  else
    logfile_fatal_error("Object script error - look_left expects no parameters");
  return m;
}

function look_right(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_lookright_new(m);
  else
    logfile_fatal_error("Object script error - look_right expects no parameters");
  return m;
}

function look_at_player(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_lookatplayer_new(m);
  else
    logfile_fatal_error("Object script error - look_at_player expects no parameters");
  return m;
}

function look_at_walking_direction(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_lookatwalkingdirection_new(m);
  else
    logfile_fatal_error("Object script error - look_at_walking_direction expects no parameters");
  return m;
}

/* object management */
function create_item(m:objectmachine_t, n:number, p:string) {
  if(n == 3)
    m = objectdecorator_createitem_new(m, +p[0], +p[1], +p[2]);
  else
    logfile_fatal_error("Object script error - create_item expects three parameters: item_id, offset_x, offset_y");
  return m;
}

function change_closest_object_state(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_changeclosestobjectstate_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - change_closest_object_state expects two parameters: object_name, new_state_name");
  return m;
}

function create_child(m:objectmachine_t, n:number, p:string) {
  if(n == 3)
    m = objectdecorator_createchild_new(m, p[0], +p[1], +p[2], ""); /* dummy child name */
  else if(n == 4)
    m = objectdecorator_createchild_new(m, p[0], +p[1], +p[2], p[3]);
  else
    logfile_fatal_error("Object script error - create_child expects three or four parameters: object_name, offset_x, offset_y [, child_name]");
  return m;
}

function change_child_state(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_changechildstate_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - change_child_state expects two parameters: child_name, new_state_name");
  return m;
}

function change_parent_state(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_changeparentstate_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - change_parent_state expects one parameter: new_state_name");
  return m;
}

function destroy(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_destroy_new(m);
  else
    logfile_fatal_error("Object script error - destroy expects no parameters");
  return m;
}

/* events */
function change_state(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_ontimeout_new(m, 0.0, p[0]);
  else
    logfile_fatal_error("Object script error - change_state expects one parameter: new_state_name");
  return m;
}

function on_timeout(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_ontimeout_new(m, +p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_timeout expects two parameters: timeout (in seconds), new_state_name");
  return m;
}

function on_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_oncollision_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_collision expects two parameters: object_name, new_state_name");
  return m;
}

function on_animation_finished(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onanimationfinished_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_animation_finished expects one parameter: new_state_name");
  return m;
}

function on_random_event(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_onrandomevent_new(m, +p[0], p[1]);
  else
    logfile_fatal_error("Object script error - on_random_event expects two parameters: probability (0.0 <= probability <= 1.0), new_state_name");
  return m;
}

function on_player_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onplayercollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_player_collision expects one parameter: new_state_name");
  return m;
}

function on_player_attack(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onplayerattack_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_player_attack expects one parameter: new_state_name");
  return m;
}

function on_player_rect_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 5)
    m = objectdecorator_onplayerrectcollision_new(m, +p[0], +p[1], +p[2], +p[3], p[4]);
  else
    logfile_fatal_error("Object script error - on_player_rect_collision expects five parameters: offset_x1, offset_y1, offset_x2, offset_y2, new_state_name");
  return m;
}

function on_no_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onnoshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_no_shield expects one parameter: new_state_name");
  return m;
}

function on_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_shield expects one parameter: new_state_name");
  return m;
}

function on_fire_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onfireshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_fire_shield expects one parameter: new_state_name");
  return m;
}

function on_thunder_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onthundershield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_thunder_shield expects one parameter: new_state_name");
  return m;
}

function on_water_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onwatershield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_water_shield expects one parameter: new_state_name");
  return m;
}

function on_acid_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onacidshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_acid_shield expects one parameter: new_state_name");
  return m;
}

function on_wind_shield(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onwindshield_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_wind_shield expects one parameter: new_state_name");
  return m;
}

function on_brick_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onbrickcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_brick_collision expects one parameter: new_state_name");
  return m;
}

function on_floor_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onfloorcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_floor_collision expects one parameter: new_state_name");
  return m;
}

function on_ceiling_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onceilingcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_ceiling_collision expects one parameter: new_state_name");
  return m;
}

function on_left_wall_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onleftwallcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_left_wall_collision expects one parameter: new_state_name");
  return m;
}

function on_right_wall_collision(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_onrightwallcollision_new(m, p[0]);
  else
    logfile_fatal_error("Object script error - on_right_wall_collision expects one parameter: new_state_name");
  return m;
}

/* level */
function show_dialog_box(m:objectmachine_t, n:number, p:string) {
  if(n == 2)
    m = objectdecorator_showdialogbox_new(m, p[0], p[1]);
  else
    logfile_fatal_error("Object script error - show_dialog_box expects two parameters: title, message");
  return m;
}

function hide_dialog_box(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_hidedialogbox_new(m);
  else
    logfile_fatal_error("Object script error - hide_dialog_box expects no parameters");
  return m;
}

function clear_level(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_clearlevel_new(m);
  else
    logfile_fatal_error("Object script error - clear_level expects no parameters");
  return m;
}

/* audio commands */
function audio_play_sample(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_playsample_new(m, p[0], 1.0, 0.0, 1.0, false);
  else if(n == 2)
    m = objectdecorator_playsample_new(m, p[0], +p[1], 0.0, 1.0, false);
  else if(n == 3)
    m = objectdecorator_playsample_new(m, p[0], +p[1], +p[2], 1.0, false);
  else if(n == 4)
    m = objectdecorator_playsample_new(m, p[0], +p[1], +p[2], +p[3], false);
  else if(n == 5)
    m = objectdecorator_playsample_new(m, p[0], +p[1], +p[2], +p[3], false);
  else
    logfile_fatal_error("Object script error - play_sample expects at least one and at most five parameters: sound_name [, volume [, pan [, frequency [, loops]]]]");
  return m;
}

function audio_play_music(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_playmusic_new(m, p[0], false);
  else if(n == 2)
    m = objectdecorator_playmusic_new(m, p[0], false);
  else
    logfile_fatal_error("Object script error - play_music expects at least one and at most two parameters: music_name [, loops]");
  return m;
} 

function audio_play_level_music(m:objectmachine_t, n:number, p:string) {
  if(n == 0)
    m = objectdecorator_playlevelmusic_new(m);
  else
    logfile_fatal_error("Object script error - play_level_music expects no parameters");
  return m;
}

function audio_set_music_volume(m:objectmachine_t, n:number, p:string) {
  if(n == 1)
    m = objectdecorator_setmusicvolume_new(m, +p[0]);
  else
    logfile_fatal_error("Object script error - set_music_volume expects one parameter: volume");
  return m;
}
