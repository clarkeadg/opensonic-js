import { sound_play } from "./../core/audio"
import { soundfactory_get } from "./../core/soundfactory"
import { EPSILON } from "./../core/global"
import { image_load, image_blit, image_create, image_rgb, image_clear, image_putpixel, image_destroy } from "./../core/image"
import { 
  input_t,
  input_create_keyboard,
  input_create_mouse, 
  input_destroy, 
  input_button_down, 
  input_button_pressed, 
  input_get_xy, 
  IB_UP, 
  IB_DOWN, 
  IB_LEFT, 
  IB_RIGHT, 
  IB_FIRE1, 
  IB_FIRE2, 
  IB_FIRE3, 
  IB_FIRE4, 
  IB_FIRE5,
  KEY_UP,
  KEY_DOWN,
  KEY_RIGHT,
  KEY_LEFT,
  KEY_SPACE,
  KEY_LCONTROL,
  KEY_ENTER,
  KEY_ESC,
  KEY_F12, // ~ tilda
  KEY_N,
  KEY_B,
  KEY_W,
  KEY_S,
  KEY_D,
  KEY_A,
  KEY_Z,
  KEY_Y,
  KEY_G,
  KEY_P
} from "./../core/input"
import { logfile_message } from "./../core/logfile"
import { sprite_get_image, sprite_get_animation } from "./../core/sprite"
import { timer_get_delta, timer_get_ticks } from "./../core/timer"
import { clip, bounding_box } from "./../core/util"
import { v2d_t, v2d_new, v2d_add, v2d_subtract, v2d_magnitude } from "./../core/v2d"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H, VIDEORESOLUTION_EDT, video_get_resolution, video_is_smooth, video_is_fullscreen, video_changemode } from "./../core/video"
import { actor_image } from "./../entities/actor"
import { 
  brick_list_t,
  brick_get,
  brick_get_property_name, 
  brick_get_behavior_name, 
  brick_size,
  BRB_CIRCULAR,
  BRK_NONE,
  BRK_OBSTACLE,
  BRK_CLOUD,
  BRS_IDLE,
  BRS_DEAD,
  BRS_ACTIVE
} from "./../entities/brick"
import { camera_get_position, camera_set_position } from "./../entities/camera"
import { enemy_list_t, ES_DEAD, enemy_get_list_of_names, enemy_create, enemy_destroy } from "./../entities/enemy"
import { font_create, font_destroy, font_get_charsize, font_set_text, font_get_text, font_render, font_t } from "./../entities/font"
import { 
  item_list_t,
  IS_DEAD,
  item_create,
  item_destroy,
  IT_RING,
  IT_LIFEBOX,
  IT_RINGBOX,
  IT_STARBOX,
  IT_SPEEDBOX,
  IT_GLASSESBOX,
  IT_SHIELDBOX,
  IT_TRAPBOX,
  IT_EMPTYBOX,
  IT_CRUSHEDBOX,
  IT_ICON,
  IT_FALGLASSES,
  IT_EXPLOSION,
  IT_FLYINGTEXT,
  IT_PIXEL,
  IT_ANIMAL,
  IT_LOOPRIGHT,
  IT_LOOPMIDDLE,
  IT_LOOPLEFT,
  IT_LOOPNONE,
  IT_YELLOWSPRING,
  IT_REDSPRING,
  IT_RREDSPRING,
  IT_LREDSPRING,
  IT_BLUERING,
  IT_SWITCH,
  IT_DOOR,
  IT_TELEPORTER,
  IT_BIGRING,
  IT_CHECKPOINT,
  IT_GOAL,
  IT_ENDSIGN,
  IT_ENDLEVEL,
  IT_LOOPFLOOR,
  IT_LOOPFLOORNONE,
  IT_LOOPFLOORTOP,
  IT_BUMPER,
  IT_DANGER,
  IT_SPIKES,
  IT_DNADOOR,
  IT_DANGPOWER,
  IT_FIREBALL,
  IT_FIRESHIELDBOX,
  IT_TRREDSPRING,
  IT_TLREDSPRING,
  IT_BRREDSPRING,
  IT_BLREDSPRING,
  IT_BREDSPRING,
  IT_RYELLOWSPRING,
  IT_LYELLOWSPRING,
  IT_TRYELLOWSPRING,
  IT_TLYELLOWSPRING,
  IT_BRYELLOWSPRING,
  IT_BLYELLOWSPRING,
  IT_BYELLOWSPRING,
  IT_BLUESPRING,
  IT_RBLUESPRING,
  IT_LBLUESPRING,
  IT_TRBLUESPRING,
  IT_TLBLUESPRING,
  IT_BRBLUESPRING,
  IT_BLBLUESPRING,
  IT_BBLUESPRING,
  IT_CEILSPIKES,
  IT_LWSPIKES,
  IT_RWSPIKES,
  IT_PERSPIKES,
  IT_PERCEILSPIKES,
  IT_PERLWSPIKES,
  IT_PERRWSPIKES,
  IT_DNADOORNEON,
  IT_DNADOORCHARGE,
  IT_HDNADOOR,
  IT_HDNADOORNEON,
  IT_HDNADOORCHARGE,
  IT_VDANGER,
  IT_FIREDANGER,
  IT_VFIREDANGER,
  IT_THUNDERSHIELDBOX,
  IT_WATERSHIELDBOX,
  IT_ACIDSHIELDBOX,
  IT_WINDSHIELDBOX
} from "./../entities/item"
import { EDITORGRP_ENTITY_BRICK, EDITORGRP_ENTITY_ITEM, EDITORGRP_ENTITY_ENEMY, editorgrp_get_group, editorgrp_init, editorgrp_release, editorgrp_group_count } from "./util/editorgrp"
import { level_get_brick_list, level_get_brick_id, level_render_entities, level_getfile, level_save, level_create_brick, level_create_item, level_create_enemy, level_set_spawn_point, level_spawn_players } from "./level"

export enum editor_object_type {
  EDT_BRICK = 1,
  EDT_ITEM,
  EDT_ENEMY,
  EDT_GROUP
}

export enum editor_action_type {
  EDA_NEWOBJECT = 1,
  EDA_DELETEOBJECT,
  EDA_CHANGESPAWN,
  EDA_RESTORESPAWN
}

export interface editor_action_t {
  type: editor_action_type,
  obj_type: editor_object_type,
  obj_id: number,
  obj_position: v2d_t,
  obj_old_position: v2d_t
}

export interface editor_action_list_t {
  action: editor_action_t,
  in_group: boolean,
  group_key: number,
  prev: editor_action_list_t,
  next: editor_action_list_t
}

const { EDT_BRICK, EDT_ITEM, EDT_ENEMY, EDT_GROUP } = editor_object_type;
const { EDA_NEWOBJECT, EDA_DELETEOBJECT, EDA_CHANGESPAWN, EDA_RESTORESPAWN } = editor_action_type;

const EDITOR_BGFILE      = "data/images/editorbg.png";

const EDITORGRP_ENTITY_TO_EDT = (t:number) => {
  if (t == EDITORGRP_ENTITY_BRICK) {
    return EDT_BRICK;
  }
  if (t == EDITORGRP_ENTITY_ITEM) {
    return EDT_ITEM;
  }
  return EDT_ENEMY;
}

let editor_enabled = false;

const editor_keybmap = [
  KEY_UP, KEY_DOWN, KEY_RIGHT, KEY_LEFT,  /* directional keys */
  KEY_N,                                  /* fire 1 */
  KEY_B,                                  /* fire 2 */
  KEY_LCONTROL,                           /* fire 3 */
  KEY_F12                                 /* fire 4 */
];

const editor_keybmap2 = [
  KEY_W, KEY_S, KEY_D, KEY_A,
  KEY_Z,
  KEY_Y,
  KEY_G,
  KEY_P
];

let editor_previous_video_resolution:number;
let editor_previous_video_smooth:boolean;
let editor_bgimage:HTMLImageElement;
let editor_mouse:input_t;
let editor_keyboard:input_t;
let editor_keyboard2:input_t;
let editor_camera:v2d_t;
let editor_cursor:v2d_t;
let editor_cursor_objtype:number;
let editor_cursor_objid = 0;
let editor_cursor_itemid = 0;
let editor_cursor_font:font_t;
let editor_properties_font:font_t;

let editor_item_list = [
  IT_RING, IT_LIFEBOX, IT_RINGBOX, IT_STARBOX, IT_SPEEDBOX, IT_GLASSESBOX, IT_TRAPBOX,
  IT_SHIELDBOX, IT_FIRESHIELDBOX, IT_THUNDERSHIELDBOX, IT_WATERSHIELDBOX,
  IT_ACIDSHIELDBOX, IT_WINDSHIELDBOX,
  IT_LOOPRIGHT, IT_LOOPMIDDLE, IT_LOOPLEFT, IT_LOOPNONE,
  IT_YELLOWSPRING, IT_BYELLOWSPRING, IT_RYELLOWSPRING, IT_LYELLOWSPRING,
  IT_TRYELLOWSPRING, IT_TLYELLOWSPRING, IT_BRYELLOWSPRING, IT_BLYELLOWSPRING,
  IT_REDSPRING, IT_BREDSPRING, IT_RREDSPRING, IT_LREDSPRING,
  IT_TRREDSPRING, IT_TLREDSPRING, IT_BRREDSPRING, IT_BLREDSPRING,
  IT_BLUESPRING, IT_BBLUESPRING, IT_RBLUESPRING, IT_LBLUESPRING,
  IT_TRBLUESPRING, IT_TLBLUESPRING, IT_BRBLUESPRING, IT_BLBLUESPRING,
  IT_BLUERING, IT_SWITCH, IT_DOOR, IT_TELEPORTER, IT_BIGRING, IT_CHECKPOINT, IT_GOAL,
  IT_ENDSIGN, IT_ENDLEVEL, IT_LOOPFLOOR, IT_LOOPFLOORNONE, IT_LOOPFLOORTOP, IT_BUMPER,
  IT_DANGER, IT_VDANGER, IT_FIREDANGER, IT_VFIREDANGER,
  IT_SPIKES, IT_CEILSPIKES, IT_LWSPIKES, IT_RWSPIKES, IT_PERSPIKES,
  IT_PERCEILSPIKES, IT_PERLWSPIKES, IT_PERRWSPIKES, IT_DNADOOR, IT_DNADOORNEON,
  IT_DNADOORCHARGE, IT_HDNADOOR, IT_HDNADOORNEON, IT_HDNADOORCHARGE,
  -1 /* -1 represents the end of this list */
];

let editor_item_list_size:number;
let editor_enemy_name:string[];
let editor_enemy_name_length:number;

let editor_action_buffer:editor_action_list_t;
let editor_action_buffer_head:editor_action_list_t;
let editor_action_buffer_cursor:editor_action_list_t;

/* grid */
const EDITOR_GRID_W = 1;
const EDITOR_GRID_H = 1;

let editor_grid_enabled = false;

let brick_list:brick_list_t;
let item_list:item_list_t;
let enemy_list:enemy_list_t;

let spawn_point = v2d_new(0,0);


export const editor_init = () => {
  logfile_message("editor_init()");

  brick_list = level_get_brick_list();

  /* intializing... */
  editor_enabled = false;
  editor_item_list_size = editor_item_list.length;
  //while(editor_item_list[++editor_item_list_size] >= 0) { }
  editor_cursor_objtype = EDT_BRICK; //EDT_BRICK EDT_ITEM EDT_ENEMY EDT_GROUP
  editor_cursor_objid = 0;
  editor_previous_video_resolution = video_get_resolution();
  editor_previous_video_smooth = video_is_smooth();
  editor_enemy_name = enemy_get_list_of_names(editor_enemy_name_length);

  /* creating objects */
  
  image_load(EDITOR_BGFILE)
  .then(function(img:HTMLImageElement){
    editor_bgimage = img
  })
  editor_keyboard = input_create_keyboard(editor_keybmap);
  editor_keyboard2 = input_create_keyboard(editor_keybmap2);
  editor_mouse = input_create_mouse();
  editor_cursor_font = font_create(8);
  editor_properties_font = font_create(8);

  /*Misc*/
  editor_camera = camera_get_position();

  /* groups */
  editorgrp_init();

  /* grid */
  editor_grid_init();

  /* done */
  logfile_message("editor_init() ok");
}

export const editor_release = () => {
  logfile_message("editor_release()");

  /* grid */
  editor_grid_release();

  /* groups */
  editorgrp_release();

  /* destroying objects */
  //image_unref(EDITOR_BGFILE);
  input_destroy(editor_keyboard2);
  input_destroy(editor_keyboard);
  input_destroy(editor_mouse);
  font_destroy(editor_properties_font);
  font_destroy(editor_cursor_font);

  /* releasing... */
  editor_enabled = false;
  editor_cursor_objtype = EDT_ITEM;
  editor_cursor_objid = 0;

  logfile_message("editor_release() ok");
}

export const editor_enable = () => {
  logfile_message("editor_enable()");

  /* activating the editor */
  editor_action_init();
  editor_enabled = true;
  editor_camera.x = ~~camera_get_position().x;
  editor_camera.y = ~~camera_get_position().y;
  editor_cursor = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);
  //video_showmessage("Welcome to the Level Editor! Read readme.html to know how to use it.");

  /* changing the video resolution */
  editor_previous_video_resolution = video_get_resolution();
  editor_previous_video_smooth = video_is_smooth();
  video_changemode(VIDEORESOLUTION_EDT, false, video_is_fullscreen());

  logfile_message("editor_enable() ok");
}

export const editor_disable = () => {
  logfile_message("editor_disable()");

  /* disabling the level editor */
  //update_level_size();
  editor_action_release();
  editor_enabled = false;

  /* restoring the video resolution */
  video_changemode(editor_previous_video_resolution, editor_previous_video_smooth, video_is_fullscreen());

  logfile_message("editor_disable() ok");
}

export const editor_update = () => {
  if (!brick_list)  brick_list = level_get_brick_list();

  let it, major_items;
  let major_bricks;
  let cursor_arrow = sprite_get_image(sprite_get_animation("SD_ARROW", 0), 0);
  let w = font_get_charsize(editor_cursor_font).x;
  let h = font_get_charsize(editor_cursor_font).y;
  let pick_object, delete_object = false;
  let topleft = v2d_subtract(editor_camera, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));

  /* update items */
  /*major_items = item_list_clip();
  major_bricks = brick_list_clip();
  for(it=major_items; it!=null; it=it.next)
    item_update(it.data, team, 3, major_bricks, item_list, enemy_list); // major_items bugs the switch/teleporter
  brick_list_unclip(major_bricks);
  item_list_unclip(major_items);*/

  /* save the level */
  if(input_button_down(editor_keyboard, IB_FIRE3)) {
    if(input_button_pressed(editor_keyboard, IB_FIRE4))
      editor_save();
  }

  /* disable the level editor */
  if(input_button_down(editor_keyboard, IB_FIRE4)) {
    editor_disable();
    return;
  }

  /* change category / object */
  if(input_button_down(editor_keyboard, IB_FIRE3)) {
    /* change category */
    if(input_button_pressed(editor_keyboard, IB_FIRE1) || input_button_pressed(editor_mouse, IB_DOWN))
      editor_next_category();

    if(input_button_pressed(editor_keyboard, IB_FIRE2) || input_button_pressed(editor_mouse, IB_UP))
      editor_previous_category();
  }
  else {
    /* change object */
    if(input_button_pressed(editor_keyboard, IB_FIRE1) || input_button_pressed(editor_mouse, IB_DOWN))
      editor_next_object();

    if(input_button_pressed(editor_keyboard, IB_FIRE2) || input_button_pressed(editor_mouse, IB_UP))
      editor_previous_object();
  }

  /* mouse cursor */
  editor_cursor.x = clip(input_get_xy(editor_mouse).x, 0, VIDEO_SCREEN_W-cursor_arrow.width);
  editor_cursor.y = clip(input_get_xy(editor_mouse).y, 0, VIDEO_SCREEN_H-cursor_arrow.height);

  /* new spawn point */
  if(input_button_pressed(editor_mouse, IB_FIRE1) && input_button_down(editor_keyboard, IB_FIRE3)) {
    let nsp = editor_grid_snap(editor_cursor);
    let eda = editor_action_spawnpoint_new(true, nsp, spawn_point);
    editor_action_commit(eda);
    editor_action_register(eda);
  }

  /* new object */
  if(input_button_pressed(editor_mouse, IB_FIRE1) && !input_button_down(editor_keyboard,  IB_FIRE3)) {
    let eda = editor_action_entity_new(true, editor_cursor_objtype, editor_cursor_objid, editor_grid_snap(editor_cursor));
    editor_action_commit(eda);
    editor_action_register(eda);
  }

  /* pick or delete object */
  //pick_object = input_button_pressed(editor_mouse, IB_FIRE3) || input_button_pressed(editor_keyboard2, IB_FIRE4);
  pick_object = input_button_pressed(editor_mouse, IB_FIRE3);
  delete_object = input_button_pressed(editor_mouse, IB_FIRE2);
  if(pick_object || delete_object) {
    let itb;
    let iti;
    let ite;

    //console.log(pick_object, delete_object, editor_cursor_objtype, EDT_BRICK)

    switch(editor_cursor_objtype) {
      /* brick */
      case EDT_BRICK:
        for(itb=brick_list;itb;itb=itb.next) {
          let a = [itb.data.x, itb.data.y, itb.data.x + itb.data.brick_ref.image.width, itb.data.y + itb.data.brick_ref.image.height];
          let b = [ editor_cursor.x+topleft.x , editor_cursor.y+topleft.y , editor_cursor.x+topleft.x+1 , editor_cursor.y+topleft.y+1 ];
          if(bounding_box(a,b)) {
            if(pick_object) {
              editor_cursor_objid = level_get_brick_id(itb.data);
            }
            else {
              let eda = editor_action_entity_new(false, EDT_BRICK, level_get_brick_id(itb.data), v2d_new(itb.data.x, itb.data.y));
              editor_action_commit(eda);
              editor_action_register(eda);
              break;
            }
          }
        }
        break;

      /* item */
      case EDT_ITEM:
        for(iti=item_list;iti;iti=iti.next) {
          let a = [ iti.data.actor.position.x-iti.data.actor.hot_spot.x, iti.data.actor.position.y-iti.data.actor.hot_spot.y, iti.data.actor.position.x-iti.data.actor.hot_spot.x + actor_image(iti.data.actor).width, iti.data.actor.position.y-iti.data.actor.hot_spot.y + actor_image(iti.data.actor).height];
          let b = [ editor_cursor.x+topleft.x , editor_cursor.y+topleft.y , editor_cursor.x+topleft.x+1 , editor_cursor.y+topleft.y+1 ];

          if(bounding_box(a,b)) {
            if(pick_object) {
              let index = editor_item_list_get_index(iti.data.type);
              if(index >= 0) {
                editor_cursor_itemid = index;
                editor_cursor_objid = editor_item_list[index];
              }
            }
            else {
              let eda = editor_action_entity_new(false, EDT_ITEM, iti.data.type, iti.data.actor.position);
              editor_action_commit(eda);
              editor_action_register(eda);
              break;
            }
          }
        }
        break;

      /* enemy */
      case EDT_ENEMY:
        for(ite=enemy_list;ite;ite=ite.next) {
          let a = [ ite.data.actor.position.x-ite.data.actor.hot_spot.x, ite.data.actor.position.y-ite.data.actor.hot_spot.y, ite.data.actor.position.x-ite.data.actor.hot_spot.x + actor_image(ite.data.actor).width, ite.data.actor.position.y-ite.data.actor.hot_spot.y + actor_image(ite.data.actor).height];
          let b = [ editor_cursor.x+topleft.x , editor_cursor.y+topleft.y , editor_cursor.x+topleft.x+1 , editor_cursor.y+topleft.y+1 ];
          let mykey = editor_enemy_name2key(ite.data.name);
          if(mykey >= 0 && bounding_box(a,b)) {
            if(pick_object) {
              editor_cursor_objid = mykey;
            }
            else {
              let eda = editor_action_entity_new(false, EDT_ENEMY, mykey, ite.data.actor.position);
              editor_action_commit(eda);
              editor_action_register(eda);
              break;
            }
          }
        }
        break;

      /* can't pick-up/delete a group */
      case EDT_GROUP:
        break;
    }
  }

  /* undo & redo */
  if(input_button_down(editor_keyboard, IB_FIRE3)) {
    if(input_button_pressed(editor_keyboard2, IB_FIRE1))
      editor_action_undo();
    else if(input_button_pressed(editor_keyboard2, IB_FIRE2))
      editor_action_redo();
  }

  /* grid */
  editor_grid_update();

  /* scrolling */
  editor_scroll();

  /* cursor coordinates */
  font_set_text(editor_cursor_font, "%d,%d", editor_grid_snap(editor_cursor).x, editor_grid_snap(editor_cursor).y);
  editor_cursor_font.position.x = clip(~~editor_cursor.x,10, VIDEO_SCREEN_W-w*font_get_text(editor_cursor_font).length-10);
  editor_cursor_font.position.y = clip(~~editor_cursor.y-3*h, 10, VIDEO_SCREEN_H-10);

  /* object properties */
  editor_properties_font.position = v2d_new(10, 10);

  if(editor_cursor_objtype != EDT_ENEMY) {
    font_set_text(
      editor_properties_font,
      "<color=ffff00>%s %d</color>\n%s",
      editor_object_category(editor_cursor_objtype),
      editor_cursor_objid,
      editor_object_info(editor_cursor_objtype, editor_cursor_objid)
    );
  }
  else {
    font_set_text(
      editor_properties_font,
      "<color=ffff00>%s \"%s\"</color>\n%s",
      editor_object_category(editor_cursor_objtype),
      editor_enemy_key2name(editor_cursor_objid),
      editor_object_info(editor_cursor_objtype, editor_cursor_objid)
    );
  }
}

export const editor_render = () => {
  let cursor_arrow;
  let topleft = v2d_subtract(editor_camera, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));

  /* background */
  editor_render_background();

  /* grid */
  editor_grid_render();

  /* entities */
  level_render_entities();

  /* drawing the object */
  editor_draw_object(editor_cursor_objtype, editor_cursor_objid, v2d_subtract(editor_grid_snap(editor_cursor), topleft));

  /* drawing the cursor arrow */
  cursor_arrow = sprite_get_image(sprite_get_animation("SD_ARROW", 0), 0);
  image_blit(
    cursor_arrow.data,
    video_get_backbuffer(),
    cursor_arrow.sx,
    cursor_arrow.sy,
    ~~editor_cursor.x,
    ~~editor_cursor.y,
    cursor_arrow.width,
    cursor_arrow.height
  );

  /* cursor coordinates */
  font_render(editor_cursor_font, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));

  /* object properties */
  font_render(editor_properties_font, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));
}

export const editor_is_enabled = () => {
  return editor_enabled;
}

export const editor_want_to_activate = () => {
  return input_button_pressed(editor_keyboard, IB_FIRE5);
}

const editor_save = () => {
  //console.log('SAVE')
  let file = level_getfile();
  level_save(file);
  sound_play( soundfactory_get("level saved") );
  //video_showmessage("Level saved.");
}

const editor_scroll = () => {
  let camera_speed;
  const dt = timer_get_delta();

  /* camera speed */
  if(input_button_down(editor_keyboard, IB_FIRE3))
    camera_speed = 5 * 750;
  else
    camera_speed = 750;

  /* scrolling... */
  if(input_button_down(editor_keyboard, IB_UP) || input_button_down(editor_keyboard2, IB_UP))
    editor_camera.y -= camera_speed*dt;

  if(input_button_down(editor_keyboard, IB_DOWN) || input_button_down(editor_keyboard2, IB_DOWN))
    editor_camera.y += camera_speed*dt;

  if(input_button_down(editor_keyboard, IB_LEFT) || input_button_down(editor_keyboard2, IB_LEFT))
    editor_camera.x-= camera_speed*dt;

  if(input_button_down(editor_keyboard, IB_RIGHT) || input_button_down(editor_keyboard2, IB_RIGHT))
    editor_camera.x += camera_speed*dt;

  /* make sure it doesn't go off the bounds */
  editor_camera.x = ~~Math.max(editor_camera.x, VIDEO_SCREEN_W/2);
  editor_camera.y = ~~Math.max(editor_camera.y, VIDEO_SCREEN_H/2);
  camera_set_position(editor_camera);
}

const editor_render_background = () => {
  let x = VIDEO_SCREEN_W/editor_bgimage.width;
  let y = VIDEO_SCREEN_H/editor_bgimage.height;
  //image_draw_scaled(editor_bgimage, video_get_backbuffer(), 0, 0, v2d_new(x,y), IF_NONE);
}

const editor_object_category = (objtype:editor_object_type) => {
  switch(objtype) {
    case EDT_BRICK:
      return "brick";

    case EDT_ITEM:
      return "built-in item";

    case EDT_ENEMY:
      return "object";

    case EDT_GROUP:
      return "group";
  }

  return "unknown";
}

const editor_object_info = (objtype:editor_object_type, objid:number) => {
  //static char buf[128];
  //strcpy(buf, "");
  let buf = "";
  let x;

  switch(objtype) {
    case EDT_BRICK: {
      x = brick_get(objid);
      /*if(x && x.image)
          //console.log(buf, "angle: %d\nsize: %dx%d\nproperty: %s\nbehavior: %s\nzindex: %.2lf", x.angle, x.image.width, x.image.height, brick_get_property_name(x.property), brick_get_behavior_name(x.behavior), x.zindex);
      else
          //console.log(buf, "WARNING: missing brick");*/
      break;
    }

    case EDT_ITEM: {
      x = item_create(objid);
      //console.log(buf, "obstacle: %s\nbring_to_back: %s", x.obstacle ? "TRUE" : "FALSE", x.bring_to_back ? "TRUE" : "FALSE");
      item_destroy(x);
      break;
    }

    case EDT_ENEMY: {
      break;
    }

    case EDT_GROUP: {
      break;
    }
  }

  return buf;
}

const editor_next_category = () => {
  editor_cursor_objtype =
  (editor_cursor_objtype == EDT_BRICK) ? EDT_ITEM :
  (editor_cursor_objtype == EDT_ITEM) ? EDT_ENEMY :
  (editor_cursor_objtype == EDT_ENEMY) ? EDT_GROUP :
  (editor_cursor_objtype == EDT_GROUP) ? EDT_BRICK :
  editor_cursor_objtype;

  editor_cursor_objid = 0;
  editor_cursor_itemid = 0;

  if(editor_cursor_objtype == EDT_GROUP && editorgrp_group_count() == 0)
    editor_next_category();

  if(editor_cursor_objtype == EDT_ENEMY && editor_enemy_name_length == 0)
    editor_next_category();
}

const editor_previous_category = () => {
  editor_cursor_objtype =
  (editor_cursor_objtype == EDT_ITEM) ? EDT_BRICK :
  (editor_cursor_objtype == EDT_ENEMY) ? EDT_ITEM :
  (editor_cursor_objtype == EDT_GROUP) ? EDT_ENEMY :
  (editor_cursor_objtype == EDT_BRICK) ? EDT_GROUP :
  editor_cursor_objtype;

  editor_cursor_objid = 0;
  editor_cursor_itemid = 0;

  if(editor_cursor_objtype == EDT_GROUP && editorgrp_group_count() == 0)
    editor_previous_category();

  if(editor_cursor_objtype == EDT_ENEMY && editor_enemy_name_length == 0)
    editor_previous_category();
}

const editor_next_object = () => {
  let size;

  switch(editor_cursor_objtype) {
    /* brick */
    case EDT_BRICK: {
      size = brick_size();
      editor_cursor_objid = (editor_cursor_objid + 1) % size;
      if(brick_get(editor_cursor_objid) == null)
        editor_next_object(); /* invalid brick? */
      break;
    }

    /* item */
    case EDT_ITEM: {
      size = editor_item_list_size;
      editor_cursor_itemid = (editor_cursor_itemid + 1) % size;
      //console.log(editor_item_list, editor_cursor_itemid, editor_item_list_size)
      editor_cursor_objid = editor_item_list[editor_cursor_itemid];
      break;
    }

    /* enemy */
    case EDT_ENEMY: {
      size = editor_enemy_name_length;
      editor_cursor_objid = (editor_cursor_objid + 1) % size;
      break;
    }

    /* group */
    case EDT_GROUP: {
      size = editorgrp_group_count();
      editor_cursor_objid = (editor_cursor_objid + 1) % size;
      break;
    }
  }
}

const editor_previous_object = () => {
  let size;

  switch(editor_cursor_objtype) {
    /* brick */
    case EDT_BRICK: {
      size = brick_size();
      editor_cursor_objid = ((editor_cursor_objid - 1) + size) % size;
      if(brick_get(editor_cursor_objid) == null)
        editor_previous_object(); /* invalid brick? */
      break;
    }

    /* item */
    case EDT_ITEM: {
      size = editor_item_list_size;
      editor_cursor_itemid = ((editor_cursor_itemid - 1) + size) % size;
      editor_cursor_objid = editor_item_list[editor_cursor_itemid];
      break;
    }

    /* enemy */
    case EDT_ENEMY: {
      size = editor_enemy_name_length;
      editor_cursor_objid = ((editor_cursor_objid - 1) + size) % size;
      break;
    }

    /* group */
    case EDT_GROUP: {
      size = editorgrp_group_count();
      editor_cursor_objid = ((editor_cursor_objid - 1) + size) % size;
      break;
    }
  }
}

const editor_item_list_get_index = (item_id:number) => {
  let i;

  for(i=0; i<editor_item_list_size; i++) {
    if(item_id == editor_item_list[i])
      return i;
  }

  return -1;
}

const editor_is_valid_item = (item_id:number) => {
  return (editor_item_list_get_index(item_id) != -1);
}

const editor_draw_object = (obj_type:editor_object_type, obj_id:number, position:v2d_t) => {
  let cursor = null;
  let offset = v2d_new(0, 0);

  /* getting the image of the current object */
  switch(obj_type) {
    case EDT_BRICK: {
      if(brick_get(obj_id) != null) {
        cursor = brick_get(obj_id).image;
      }
      break;
    }
    case EDT_ITEM: {
      let it = item_create(obj_id);
      if(it != null) {
        cursor = actor_image(it.actor);
        offset = it.actor.hot_spot;
        offset.y -= 2;
        item_destroy(it);
      }
      break;
    }
    case EDT_ENEMY: {
      let en = enemy_create(editor_enemy_key2name(obj_id));
      if(en != null) {
        cursor = actor_image(en.actor);
        offset = en.actor.hot_spot;
        offset.y -= 2;
        enemy_destroy(en);
      }
      break;
    }
    case EDT_GROUP: {
      let list, it;
      list = editorgrp_get_group(obj_id);
      for(it=list; it; it=it.next) {
        let my_type = EDITORGRP_ENTITY_TO_EDT(it.entity.type);
        editor_draw_object(my_type, it.entity.id, v2d_add(position, it.entity.position));
      }
      break;
    }
  }

  /* drawing the object */
  if(cursor != null) {
    //image_draw_trans(cursor, video_get_backbuffer(), parseInt(position.x-offset.x,10), parseInt(position.y-offset.y,10), image.rgb(255,255,255), 0.5, IF_NONE);
   //console.log(cursor)
    image_blit(
      cursor.data,
      video_get_backbuffer(),
      cursor.sx,
      cursor.sy,
      ~~position.x-offset.x,
      ~~position.y-offset.y,
      cursor.swidth,
      cursor.sheight
    );
  }
}

const editor_enemy_name2key = (name:string) => {
  let i;

  for(i=0; i<editor_enemy_name_length; i++) {
    //if(strcmp(name, editor_enemy_name[i]) == 0)
    if(name == editor_enemy_name[i])
      return i;
  }

  return -1; /* not found */
}

const editor_enemy_key2name = (key:number) => {
  key = clip(key, 0, editor_enemy_name_length-1);
  return editor_enemy_name[key];
}

const editor_grid_init = () => {
  editor_grid_enabled = false;
}

const editor_grid_release = () => {}

const editor_grid_update = () => {
  if(input_button_pressed(editor_keyboard2, IB_FIRE3))
    editor_grid_enabled = !editor_grid_enabled;
}

const editor_grid_render = () => {
  if(editor_grid_enabled) {
    let i, j;
    let grid;
    let color;
    let topleft = v2d_subtract(editor_camera, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));

    /* creating the grid image */
    grid = image_create(EDITOR_GRID_W, EDITOR_GRID_H);
    color = image_rgb(0,128,160);
    image_clear(grid, 0,0,0);
    //console.log(grid)
    for(i=0; i<grid.height; i++)
      image_putpixel(grid, video_get_backbuffer(), grid.width-1, i, color);
    for(i=0; i<grid.width; i++)
      image_putpixel(grid, video_get_backbuffer(), i, grid.height-1, color);

    /* drawing the grid... */
    for(i=0; i<=VIDEO_SCREEN_W/EDITOR_GRID_W; i++) {
      for(j=0; j<=VIDEO_SCREEN_H/EDITOR_GRID_H; j++) {
        let v = v2d_subtract(editor_grid_snap(v2d_new(i*grid.width, j*grid.height)), topleft);
        //image_draw(grid, video_get_backbuffer(), parseInt(v.x,10), parseInt(v.y,10), IF_NONE);
      }
    }

    /* done! */
    image_destroy(grid);
  }
}

const editor_grid_size = () => {
  if(!editor_grid_enabled)
    return v2d_new(1,1);
  else
    return v2d_new(8,8);
}

const editor_grid_snap = (position:v2d_t) => {
  let topleft = v2d_subtract(editor_camera, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));

  let w = EDITOR_GRID_W;
  let h = EDITOR_GRID_H;
  let cx = ~~(topleft.x % w);
  let cy = ~~(topleft.y % h);

  let xpos = -cx + ((position.x / w) * w);
  let ypos = -cy + ((position.y / h) * h);

  return v2d_add(topleft, v2d_new(xpos, ypos));
}

const editor_action_entity_new = (is_new_object:boolean, obj_type:editor_object_type, obj_id:number, obj_position:v2d_t) => {
  const o:editor_action_t = {
    type: is_new_object ? EDA_NEWOBJECT : EDA_DELETEOBJECT,
    obj_type: obj_type,
    obj_id: obj_id,
    obj_position: obj_position,
    obj_old_position: obj_position
  };  
  return o;
}

const editor_action_spawnpoint_new = (is_changing:boolean, obj_position:v2d_t, obj_old_position:v2d_t) => {
  const o:editor_action_t = {
    type: is_changing ? EDA_CHANGESPAWN : EDA_RESTORESPAWN,
    obj_type: null,
    obj_id: null,
    obj_position: obj_position,
    obj_old_position: obj_old_position
  }
  return o;
}

const editor_action_init = () => {
  /* linked list */
  editor_action_buffer_head = {
    action: null,
    in_group: false,
    group_key: null,
    prev: null,
    next: null
  };  
  editor_action_buffer = editor_action_buffer_head;
  editor_action_buffer_cursor = editor_action_buffer_head;
}

const editor_action_release = () => {
  /* linked list */
  editor_action_buffer_head = editor_action_delete_list(editor_action_buffer_head);
  editor_action_buffer = null;
  editor_action_buffer_cursor = null;
}

const editor_action_register = (action:editor_action_t) => {
  //console.log('REGISTER', action)

  /* ugly, but these fancy group stuff
  * shouldn't be availiable on the interface */
  let registering_group = false;
  let group_key;

  if(action.obj_type != EDT_GROUP) {
    let c, it;

    /* creating new node */
    let node:editor_action_list_t = {
      action: action,
      in_group: registering_group,
      group_key: null,
      prev: null,
      next: null
    };
    if(node.in_group)
      node.group_key = group_key;

    /* cursor */
    c = editor_action_buffer_cursor;
    if(c != null)
      c.next = editor_action_delete_list(c.next);

    /* inserting the node into the linked list */
    it = editor_action_buffer;
    while(it.next != null)
      it = it.next;
    it.next = node;
    node.prev = it;
    node.next = null;

    /* updating the cursor */
    editor_action_buffer_cursor = node;
  }
  else {
    let auto_increment = 0xbeef; /* dummy value */
    let list, it;

    /* registering a group of objects */
    registering_group = true;
    group_key = auto_increment++;
    list = editorgrp_get_group(action.obj_id);
    for(it=list; it; it=it.next) {
      let a;
      let e = it.entity;
      let my_type = EDITORGRP_ENTITY_TO_EDT(e.type);
      a = editor_action_entity_new(true, my_type, e.id, v2d_add(e.position, action.obj_position));
      editor_action_register(a);
    }
    registering_group = false;
  }
}

const editor_action_delete_list = (list:editor_action_list_t):editor_action_list_t => {
  let p, next;

  p = list;
  while(p != null) {
    next = p.next;
    p = null;
    p = next;
  }

  return null;
}

const editor_action_undo = () => {
  let p;
  let a;

  if(editor_action_buffer_cursor != editor_action_buffer_head) {
    /* moving the cursor */
    p = editor_action_buffer_cursor;
    editor_action_buffer_cursor = editor_action_buffer_cursor.prev;

    /* UNDOing a group? */
    if(p.in_group && p.prev && p.prev.in_group && p.group_key == p.prev.group_key)
        editor_action_undo();

    /* undo */
    a = p.action;
    a.type = /* reverse of a.type ??? */
    (a.type == EDA_NEWOBJECT) ? EDA_DELETEOBJECT :
    (a.type == EDA_DELETEOBJECT) ? EDA_NEWOBJECT :
    (a.type == EDA_CHANGESPAWN) ? EDA_RESTORESPAWN :
    (a.type == EDA_RESTORESPAWN) ? EDA_CHANGESPAWN :
    a.type;
    editor_action_commit(a);
  }
  //else
    //video_showmessage("Already at oldest change.");
}

const editor_action_redo = () => {
  let p;
  let a;

  if(editor_action_buffer_cursor.next != null) {
    /* moving the cursor */
    editor_action_buffer_cursor = editor_action_buffer_cursor.next;
    p = editor_action_buffer_cursor;

    /* REDOing a group? */
    if(p.in_group && p.next && p.next.in_group && p.group_key == p.next.group_key)
      editor_action_redo();

    /* redo */
    a = p.action;
    editor_action_commit(a);
  }
  //else
    //video_showmessage("Already at newest change.");
}

const editor_action_commit = (action:editor_action_t) => {
  //console.log('COMMIT', action)
  if(action.type == EDA_NEWOBJECT) {
    /* new object */
    switch(action.obj_type) {
      case EDT_BRICK: {
        /* new brick */
        level_create_brick(action.obj_id, action.obj_position);
        break;
      }

      case EDT_ITEM: {
        /* new item */
        level_create_item(action.obj_id, action.obj_position);
        break;
      }

      case EDT_ENEMY: {
        /* new enemy */
        level_create_enemy(editor_enemy_key2name(action.obj_id), action.obj_position);
        break;
      }

      case EDT_GROUP: {
        /* new group of objects */
        let list, it;
        list = editorgrp_get_group(action.obj_id);
        for(it=list; it; it=it.next) {
          let a;
          let e = it.entity;
          let my_type = EDITORGRP_ENTITY_TO_EDT(e.type);
          a = editor_action_entity_new(true, my_type, e.id, v2d_add(e.position, action.obj_position));
          editor_action_commit(a);
        }
        break;
      }
    }
  }
  else if(action.type == EDA_DELETEOBJECT) {
    /* delete object */
    switch(action.obj_type) {
      case EDT_BRICK: {
        /* delete brick */
        let it;
        let ref = brick_get(action.obj_id);
        for(it=brick_list; it; it=it.next) {
          if(it.data.brick_ref == ref) {
            let dist = v2d_magnitude(v2d_subtract(v2d_new(it.data.x, it.data.y), action.obj_position));
            if(dist < EPSILON)
              it.data.state = BRS_DEAD;
          }
        }
        break;
      }
      case EDT_ITEM: {
        /* delete item */
        let it;
        let id = action.obj_id;
        for(it=item_list; it; it=it.next) {
          if(it.data.type == id) {
            let dist = v2d_magnitude(v2d_subtract(it.data.actor.position, action.obj_position));
            if(dist < EPSILON)
              it.data.state = IS_DEAD;
          }
        }
        break;
      }
      case EDT_ENEMY: {
        /* delete enemy */
        let it;
        let id = action.obj_id;
        for(it=enemy_list; it; it=it.next) {
          if(editor_enemy_name2key(it.data.name) == id) {
            let dist = v2d_magnitude(v2d_subtract(it.data.actor.position, action.obj_position));
            if(dist < EPSILON)
              it.data.state = ES_DEAD;
          }
        }
        break;
      }
      case EDT_GROUP: {
        /* can't delete a group directly */
        break;
      }
    }
  }
  else if(action.type == EDA_CHANGESPAWN) {
    /* change spawn point */
    level_set_spawn_point(action.obj_position);
    level_spawn_players();
  }
  else if(action.type == EDA_RESTORESPAWN) {
    /* restore spawn point */
    level_set_spawn_point(action.obj_old_position);
    level_spawn_players();
  }
}
