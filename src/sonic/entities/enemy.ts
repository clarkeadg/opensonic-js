import { logfile_message } from "./../core/logfile"
import { sprite_get_animation } from "./../core/sprite"
import { input_create_computer } from "./../core/input"
import { resourcemanager_getJsonFile } from "./../core/resourcemanager"
import { level_editmode, level_player } from "./../scenes/level"
import { actor_t, actor_create, actor_destroy, actor_change_animation } from "./actor"
import { IS_IDLE, IS_DEAD } from "./item"
import { objectvm_t, object_vm_create, object_vm_destroy, object_vm_get_reference_to_current_state } from "./object_vm"
import { object_compiler_compile } from "./object_compiler"
import { v2d_t } from "../core/v2d"
import { brick_list_t } from "./brick"
import { item_list_t } from "./item"
import { player_t } from "./player"

export enum enemystate_t {
  ES_IDLE = 0,
  ES_DEAD
}

export const { ES_IDLE, ES_DEAD } = enemystate_t;

export interface object_children_t {
  name: string,
  data: enemy_t,
  next: object_children_t
}

export interface enemy_t {
  name: string,
  actor: actor_t
  state: enemystate_t,
  created_from_editor: boolean,
  preserve: boolean,
  obstacle: boolean,
  obstacle_angle: number,
  always_active: boolean,
  hide_unless_in_editor_mode: boolean,
  vm: objectvm_t,
  parent: enemy_t,
  children: object_children_t,
  observed_player: player_t
}

export interface enemy_list_t {
  data: enemy_t,
  next: enemy_list_t
}

export interface object_name_data_t {
  name: string[],
  length: number
}

export interface in_out_t {
  in_object_name: string,
  out_object_block: any
}

const MAX_OBJECTS = 1024;
let objects:any = null;
let name_table:object_name_data_t = {
  name: [],
  length: 0
};

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

export const enemy_release = () => {
  objects = null
}

export const enemy_get_list_of_names = (n:number) => {
  n = name_table.length;
  return name_table.name;
}

export const enemy_create = (name:string) => {
  return create_from_script(name);
}

export const enemy_destroy = (enemy:enemy_t):enemy_t => {
  if (!enemy) return null;
  
  /* tell my children I died */
  for(let it=enemy.children; it; it=it.next)
      it.data.parent = null;

  /* destroy my children list */
  object_children_delete(enemy.children);

  /* tell my parent I died */
  if(enemy.parent != null)
    enemy_remove_child(enemy.parent, enemy);

  /* destroy my virtual machine */
  object_vm_destroy(enemy.vm);

  /* destroy me */
  actor_destroy(enemy.actor);
  //free(enemy.name);
  //free(enemy);

  /* success */
  return null;
};

export const enemy_update = (enemy:enemy_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:enemy_list_t) => {
  if (!enemy) return;
  const machine = object_vm_get_reference_to_current_state(enemy.vm);       
  machine.update(machine, team, team_size, brick_list, item_list, object_list);
}  

export const enemy_render = (enemy:enemy_t, camera_position:v2d_t) => {
  if (!enemy) return;
  const machine = object_vm_get_reference_to_current_state(enemy.vm);
  if(!enemy.hide_unless_in_editor_mode || (enemy.hide_unless_in_editor_mode && level_editmode()))
    machine.render(machine, camera_position);
}

export const enemy_get_parent = (enemy:enemy_t) => {
  return enemy.parent;
}

export const enemy_get_child = (enemy:enemy_t, child_name:string) => {
  return object_children_find(enemy.children, child_name);
}

export const enemy_add_child = (enemy:enemy_t, child_name:string, child:enemy_t) => {
  enemy.children = object_children_add(enemy.children, child_name, child);
  child.parent = enemy;
  child.created_from_editor = false;
}

export const enemy_remove_child = (enemy:enemy_t, child:enemy_t) => {
  enemy.children = object_children_remove(enemy.children, child);
}

export const enemy_get_observed_player = (enemy:enemy_t) => {
  return enemy.observed_player != null ? enemy.observed_player : level_player();
}

export const enemy_observe_player = (enemy:enemy_t, player:player_t) => {
  enemy.observed_player = player;
}

export const enemy_observe_current_player = (enemy:enemy_t) => {
  enemy.observed_player = level_player();
}

export const enemy_observe_active_player = (enemy:enemy_t) => {
  enemy.observed_player = null;
}

const create_from_script = (object_name:string) => {
  
  const param:in_out_t = {
    in_object_name: null,
    out_object_block: null
  };

  let e:enemy_t = {
    name: object_name,
    state: ES_IDLE,
    actor: actor_create(),
    preserve: true,
    obstacle: false,
    obstacle_angle: 0,
    always_active: false,
    hide_unless_in_editor_mode: false,
    vm: null,
    created_from_editor: true,
    parent: null,
    children: object_children_new(),
    observed_player: null
  };

  e.actor.input = input_create_computer();
  actor_change_animation(e.actor, sprite_get_animation("SD_QUESTIONMARK", 0));
  e.vm = object_vm_create(e);

  // finding the code of the object
  param.in_object_name = object_name;
  param.out_object_block = null;
  //nanoparser_traverse_program_ex(objects, (void*)(&param), find_object_block);
  param.out_object_block = find_object_block(objects, param);

  // the code of the object is located in param.out_object_block. Let's compile it. 
  if(param.out_object_block != null)
    e = object_compiler_compile(e, param.out_object_block);
  else
    logfile_message(`Object ${object_name} does not exist`);
    //fatal_error("Object '%s' does not exist", object_name);

  // success!
  return e;
}

const is_hidden_object = (name:string) => {
  return name[0] == '.';
}

const find_object_block = (stmt:any, in_out_param:any,) => { 
  
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
    logfile_message(`Object script error: unknown keyword ${id}`);

  return 0;
}

const fill_object_data = (stmt:any, object_name_data:any) => {
  return stmt;
}

const object_children_new = ():object_children_t => {
  return null;
}

const object_children_delete = (list:object_children_t):object_children_t => {
  if(list != null) {
    object_children_delete(list.next);
    list.name = null;
    list = null;
  }

  return null;
}

const object_children_add = (list:object_children_t, name:string, data:enemy_t) => {
  const x:object_children_t = {
    name: name,
    data: data,
    next: list,
  };  
  return x;
}

const object_children_remove = (list:object_children_t, data:enemy_t) => {
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

const object_children_find = (list:object_children_t, name:string) => {
  let it = list;

  while(it != null) {
    if(it.name == name)
      return it.data;
    else
      it = it.next;
  }

  return null;
}
