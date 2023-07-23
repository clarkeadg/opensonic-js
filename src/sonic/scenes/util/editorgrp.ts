import { v2d_t } from "./../../core/v2d"
import { clip } from "./../../core/util"
import { logfile_message } from "./../../core/logfile"

export enum editorgrp_entity_type {
  EDITORGRP_ENTITY_BRICK = 0,
  EDITORGRP_ENTITY_ITEM,
  EDITORGRP_ENTITY_ENEMY
}

export const { EDITORGRP_ENTITY_BRICK, EDITORGRP_ENTITY_ITEM, EDITORGRP_ENTITY_ENEMY } = editorgrp_entity_type;

export interface editorgrp_entity_t {
  type: editorgrp_entity_type, 
  id: number,
  position: v2d_t
}

export interface editorgrp_entity_list_t {
  entity: editorgrp_entity_t
  next: editorgrp_entity_list_t
}

const EDITORGRP_MAX_GROUPS    = 501;

let group:editorgrp_entity_list_t[] = [];
let group_count = 0;
    
export const editorgrp_init = () => {
  group_count = 0;
  for(let i=0; i<EDITORGRP_MAX_GROUPS; i++)
    group[i] = null;
}

export const editorgrp_release = () => {
  for(let i=0; i<group_count; i++)
    group[i] = delete_list(group[i]);
    group_count = 0;
}

export const editorgrp_load_from_file = (filename:string) => {
  let abs_path;
  let prog;

  //resource_filepath(abs_path, filename, sizeof(abs_path), RESFP_READ);
  //logfile_message("editorgrp_load_from_file('%s')", filename);

  //prog = nanoparser_construct_tree(abs_path);
  //nanoparser_traverse_program(prog, traverse);
  //prog = nanoparser_deconstruct_tree(prog);

  logfile_message(`editorgrp_load_from_file() loaded ${group_count} group(s)`);
}

export const editorgrp_group_count = () => {
  return group_count;
}

export const editorgrp_get_group = (id:number) => {
  if(group_count > 0) {
    id = clip(id, 0, group_count-1);
    return group[id];
  }
  else
    return null;
}

const delete_list = (list:editorgrp_entity_list_t) => {
  if(list != null) {
    list.next = delete_list(list.next);
    list = null;
    list = null;
  }
  return list;
}

const add_to_list = (list:editorgrp_entity_list_t, entity:editorgrp_entity_t) => {
  const p:editorgrp_entity_list_t = {
    entity: entity,
    next: list
  };
  return p;
}

