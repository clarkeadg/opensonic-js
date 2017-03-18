
import { clip } from "./../../core/util"
import { logfile_message } from "./../../core/logfile"

const EDITORGRP_MAX_GROUPS    = 501;

let group = [];
let group_count; 
    
export const editorgrp_init = () => {
  let i;

  group_count = 0;
  for(i=0; i<EDITORGRP_MAX_GROUPS; i++)
    group[i] = null;
}

export const editorgrp_release = () => {
  let i;

  for(i=0; i<group_count; i++)
    group[i] = delete_list(group[i]);
    group_count = 0;
}

export const editorgrp_load_from_file = (filename) => {
  let abs_path;
  let prog;

  //resource_filepath(abs_path, filename, sizeof(abs_path), RESFP_READ);
  //logfile_message("editorgrp_load_from_file('%s')", filename);

  //prog = nanoparser_construct_tree(abs_path);
  //nanoparser_traverse_program(prog, traverse);
  //prog = nanoparser_deconstruct_tree(prog);

  logfile_message("editorgrp_load_from_file() loaded %d group(s)", group_count);
}

export const editorgrp_group_count = () => {
  return group_count;
}

export const editorgrp_get_group = (id) => {
  if(group_count > 0) {
    id = clip(id, 0, group_count-1);
    return group[id];
  }
  else
    return null;
}

const delete_list = (list) => {
  if(list != null) {
    list.next = delete_list(list.next);
    list = null;
    list = null;
  }
  return list;
}

const add_to_list = (list, entity) => {
  let p = {};
  p.entity = entity;
  p.next = list;
  return p;
}

/* traverses a .grp file */
const traverse = (stmt) => {
  /*const char *id;
  const parsetree_parameter_t *param_list;
  const parsetree_parameter_t *group_block;

  id = nanoparser_get_identifier(stmt);
  param_list = nanoparser_get_parameter_list(stmt);

  if(str_icmp(id, "group") == 0) {
      group_block = nanoparser_get_nth_parameter(param_list, 1);
      nanoparser_expect_program(group_block, "A block is expected after the 'group' keyword");
      if(group_count < EDITORGRP_MAX_GROUPS) {
          editorgrp_entity_list_t *list = NULL;
          nanoparser_traverse_program_ex(nanoparser_get_program(group_block), (void*)(&list), traverse_group);
          group[ group_count++ ] = list;
      }
      else
          fatal_error("You can't have more than %d groups per level (group_count=%d)", EDITORGRP_MAX_GROUPS-1, group_count);
  }
  else
      fatal_error("Unexpected identifier: '%s' at the group file. Expected: 'group'", id);

  return 0;*/
}

/* traverses a group block */
const traverse_group = (stmt, entity_list) => {
  /*const char *identifier;
  const parsetree_parameter_t *param_list;
  const parsetree_parameter_t *p1, *p2, *p3;
  editorgrp_entity_list_t **list = (editorgrp_entity_list_t**)entity_list;
  editorgrp_entity_t e;

  identifier = nanoparser_get_identifier(stmt);
  param_list = nanoparser_get_parameter_list(stmt);

  if(str_icmp(identifier, "brick") == 0) {
      int id;
      int x, y;

      p1 = nanoparser_get_nth_parameter(param_list, 1);
      p2 = nanoparser_get_nth_parameter(param_list, 2);
      p3 = nanoparser_get_nth_parameter(param_list, 3);

      nanoparser_expect_string(p1, "Brick id must be given");
      nanoparser_expect_string(p2, "Brick xpos must be given");
      nanoparser_expect_string(p3, "Brick ypos must be given");

      id = atoi(nanoparser_get_string(p1));
      x = atoi(nanoparser_get_string(p2));
      y = atoi(nanoparser_get_string(p3));

      e.type = EDITORGRP_ENTITY_BRICK;
      e.id = clip(id, 0, brickdata_size()-1);
      e.position = v2d_new(x,y);
      if(NULL != brickdata_get(e.id)) // valid brick? 
          *list = add_to_list(*list, e);
  }
  else if(str_icmp(identifier, "item") == 0) {
      int id;
      int x, y;

      p1 = nanoparser_get_nth_parameter(param_list, 1);
      p2 = nanoparser_get_nth_parameter(param_list, 2);
      p3 = nanoparser_get_nth_parameter(param_list, 3);

      nanoparser_expect_string(p1, "Item id must be given");
      nanoparser_expect_string(p2, "Item xpos must be given");
      nanoparser_expect_string(p3, "Item ypos must be given");

      id = atoi(nanoparser_get_string(p1));
      x = atoi(nanoparser_get_string(p2));
      y = atoi(nanoparser_get_string(p3));

      e.type = EDITORGRP_ENTITY_ITEM;
      e.id = clip(id, 0, ITEMDATA_MAX-1);
      e.position = v2d_new(x,y);
      if(editor_is_valid_item(e.id)) // valid item? 
          *list = add_to_list(*list, e);
  }
  else if(str_icmp(identifier, "enemy") == 0) {
      const char *name;
      int x, y;

      p1 = nanoparser_get_nth_parameter(param_list, 1);
      p2 = nanoparser_get_nth_parameter(param_list, 2);
      p3 = nanoparser_get_nth_parameter(param_list, 3);

      nanoparser_expect_string(p1, "Enemy name must be given");
      nanoparser_expect_string(p2, "Enemy xpos must be given");
      nanoparser_expect_string(p3, "Enemy ypos must be given");

      name = nanoparser_get_string(p1);
      x = atoi(nanoparser_get_string(p2));
      y = atoi(nanoparser_get_string(p3));

      e.type = EDITORGRP_ENTITY_ENEMY;
      e.id = editor_enemy_name2key(name);
      e.position = v2d_new(x,y);
      *list = add_to_list(*list, e);
  }
  else
      fatal_error("Unexpected identifier '%s' at group definition. Valid keywords are: 'brick', 'item', 'enemy'", identifier);

  return 0;*/
}
