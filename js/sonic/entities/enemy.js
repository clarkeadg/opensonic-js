
import { logfile_message } from "./../core/logfile"
import { sprite_get_animation } from "./../core/sprite"
import { input_create_computer } from "./../core/input"
import { resourcemanager_getJsonFile } from "./../core/resourcemanager"
import { level_editmode, level_player } from "./../scenes/level"
import { actor_create, actor_change_animation } from "./actor"
import { IS_IDLE, IS_DEAD } from "./item"
import { object_vm_create, object_vm_get_reference_to_current_state } from "./object_vm"
import { object_compiler_compile } from "./object_compiler"

/* Constants */
const MAX_OBJECTS = 1024;

let objects;
let name_table = [];

export const enemy_objects_init = () => {

  const path = "data/objects/enemies.json";

  logfile_message("Loading objects scripts...");
  objects = null;

  resourcemanager_getJsonFile(path)
  .then(function(enemy_data){
    fill_object_data(objects, enemy_data);
    objects = enemy_data;
  });
}

export const enemy_release = () => {}

export const enemy_get_list_of_names = (n) => {
  n = name_table.length;
  return name_table.name;
}

export const enemy_create = (name) => {
  return create_from_script(name);
}

export const enemy_destroy = (enemy) => {};

export const enemy_update = (enemy, team, team_size, brick_list, item_list, object_list) => {
  if (!enemy) return;
  let machine = object_vm_get_reference_to_current_state(enemy.vm);       
  machine.update(machine, team, team_size, brick_list, item_list, object_list);
}  

export const enemy_render = (enemy, camera_position) => {
  if (!enemy) return;
  let machine = object_vm_get_reference_to_current_state(enemy.vm);
  if(!enemy.hide_unless_in_editor_mode || (enemy.hide_unless_in_editor_mode && level_editmode()))
    machine.render(machine, camera_position);
}

export const enemy_get_parent = (enemy) => {
  return enemy.parent;
}

export const enemy_get_child = (enemy, child_name) => {
  return object_children_find(enemy.children, child_name);
}

export const enemy_add_child = (enemy, child_name, child) => {
  enemy.children = object_children_add(enemy.children, child_name, child);
  child.parent = enemy;
  child.created_from_editor = false;
}

export const enemy_remove_child = (enemy, child) => {
  enemy.children = object_children_remove(enemy.children, child);
}

export const enemy_get_observed_player = (enemy) => {
  return enemy.observed_player != null ? enemy.observed_player : level_player();
}

export const enemy_observe_player = (enemy, player) => {
  enemy.observed_player = player;
}

export const enemy_observe_current_player = (enemy) => {
  enemy.observed_player = level_player();
}

export const enemy_observe_active_player = (enemy) => {
  enemy.observed_player = null;
}

const create_from_script = (object_name) => {
  let e = {};
  let param = {};

  /* setup the object */
  //e.name = str_dup(object_name);
  e.name = object_name;
  e.state = IS_IDLE;
  e.actor = actor_create();
  e.actor.input = input_create_computer();
  e.actor = actor_change_animation(e.actor, sprite_get_animation("SD_QUESTIONMARK", 0));
  e.preserve = true;
  e.obstacle = false;
  e.obstacle_angle = 0;
  e.always_active = false;
  e.hide_unless_in_editor_mode = false;
  e.vm = object_vm_create(e);
  e.created_from_editor = true;
  e.parent = null;
  e.children = object_children_new();
  e.observed_player = null;


  // finding the code of the object
  param.in_object_name = object_name;
  param.out_object_block = null;
  //nanoparser_traverse_program_ex(objects, (void*)(&param), find_object_block);

  param.out_object_block = find_object_block(objects, param);

  // the code of the object is located in param.out_object_block. Let's compile it. 
  if(param.out_object_block != null)
    e = object_compiler_compile(e, param.out_object_block);
  else
    logfile_message("Object '%s' does not exist", object_name);
    //fatal_error("Object '%s' does not exist", object_name);

  //var test = e.vm.reference_to_current_state.set_animation(e.vm.reference_to_current_state, 2, ["SD_FLYINGEYES", 0]);
  //console.log('CREATED ENEMY',e)
  //e.actor = actor.change_animation(e.actor, sprite_get_animation("SD_FLYINGEYES", 0));

  // success!
  return e;
}

const is_hidden_object = (name) => {
  return name[0] == '.';
}

const find_object_block = (stmt, in_out_param) => { 
  
  let param = in_out_param;
  //var id = nanoparser_get_identifier(stmt);
  let id = stmt[in_out_param.in_object_name];
  //console.log('FIND OBJECT BLOCK', stmt, id)
  //var param_list = nanoparser_get_parameter_list(stmt);
  let param_list = stmt;

  //if(str_icmp(id, "object") == 0) {
  if(id) {
    //var p1, p2;
    let name = in_out_param.in_object_name;
    //var block = in_out_param.out_object_block;
    let block = id;
    return block;

  }
  else
    logfile_message("Object script error: unknown keyword '%s'", id);

  return 0;
}

const fill_object_data = (stmt, object_name_data) => {
  return stmt;
}

const object_children_new = () => {
  return null;
}

const object_children_delete = (list) => {
  if(list != null) {
    object_children_delete(list.next);
    list.name = null;
    list = null;
  }

  return null;
}

const object_children_add = (list, name, data) => {
  let x = {};
  //x.name = str_dup(name);
  x.name = name;
  x.data = data;
  x.next = list;
  return x;
}

const object_children_remove = (list, data) => {
  let it, next;

  if(list != null) {
    if(list.data == data) {
      next = list.next;
      list.name = null;
      list = null;
      return next;
    }
    else {
      it = list;
      while(it.next != null && it.next.data != data)
        it = it.next;
      if(it.next != null) {
        next = it.next.next;
        it.next.name = null;
        it.next = null;
        it.next = next;
      }
      return list;
    }
  }
  else
    return null;
}

const object_children_find = (list, name) => {
  let it = list;

  while(it != null) {
    if(strcmp(it.name, name) == 0)
      return it.data;
    else
      it = it.next;
  }

  return null;
}
