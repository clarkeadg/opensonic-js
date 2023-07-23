import { group_t, grouptree_group_addchild, grouptree_group_create, grouptree_init_all, grouptree_update_all, grouptree_render_all, grouptree_group_label_init, grouptree_group_label_release, grouptree_group_label_update, grouptree_group_label_render } from "./util/grouptree"
import { INFINITY, PI } from "./../core/global"
import { scene_t, scenestack_pop, scenestack_push } from "./../core/scene"
import { storyboard_get_scene, SCENE_MENU, SCENE_LANGSELECT, SCENE_STAGESELECT, SCENE_CREDITS } from "./../core/storyboard"
import { preferences_set_video_resolution, preferences_set_fullscreen, preferences_set_smooth_graphics, preferences_set_show_fps } from "./../core/preferences"
import { v2d_t, v2d_new, v2d_add } from "./../core/v2d"
import { video_changemode, video_show_fps, video_get_resolution, video_is_fullscreen, video_is_smooth, video_is_fps_visible, video_fadefx_in, video_fadefx_out, video_fadefx_is_fading, video_fadefx_over, VIDEO_SCREEN_W, VIDEO_SCREEN_H, VIDEORESOLUTION_1X, VIDEORESOLUTION_2X, VIDEORESOLUTION_MAX } from "./../core/video"
import { image_rgb } from "./../core/image"
import { sound_play, music_load, music_stop, music_play, music_is_playing } from "./../core/audio"
import { soundfactory_get } from "./../core/soundfactory"
import { lang_get } from "./../core/lang"
import { input_t, input_create_user, input_destroy, input_button_pressed, IB_UP, IB_DOWN, IB_LEFT, IB_RIGHT, IB_FIRE1, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { sprite_get_animation } from "./../core/sprite"
import { timer_get_delta } from "./../core/timer"

import { font_t, font_create, font_render, font_destroy, font_set_text } from "./../entities/font"
import { actor_t, actor_create, actor_change_animation, actor_render, actor_destroy } from "./../entities/actor"
import { bgtheme_t, background_load, background_update, background_render_bg, background_render_fg } from "./../entities/background"

/* private data */
const OPTIONS_BGFILE       = "data/themes/options.bg.json";
const OPTIONS_MUSICFILE    = "data/music/options.mp4";

let quit:boolean;
let fadein:boolean;
let title:font_t;
let icon:actor_t;
let input:input_t;
let jump_to:scene_t;
let scene_time:number;
let bgtheme:bgtheme_t

/* group tree */
//const OPTIONS_MAX     = 8;
const OPTIONS_MAX     = 5;
let option:number;
let root:group_t;

export const options_init = async () => {
  option = 0;
  quit = false;
  scene_time = 0;
  input = input_create_user();
  jump_to = null;
  fadein = true;

  title = font_create(4);
  font_set_text(title, lang_get("OPTIONS_TITLE"));
  //title.position.x = (VIDEO_SCREEN_W - font_get_text(title).length*font_get_charsize(title).x)/2;
  title.position.x = (VIDEO_SCREEN_W/2) - 100;
  title.position.y = 10;

  /* background init */
  const bgdata = await background_load(OPTIONS_BGFILE);
  bgtheme = <bgtheme_t>bgdata;

  icon = actor_create();
  actor_change_animation(icon, sprite_get_animation("SD_TITLEFOOT", 0));
  icon.position = v2d_new(-50,-50);

  root = create_grouptree();
  grouptree_init_all(root);
}

export const options_update = () => {
  const dt = timer_get_delta();
  scene_time += dt;

  /* title */
  font_set_text(title, lang_get("OPTIONS_TITLE"));

  /* fade in */
  if(fadein) {
      video_fadefx_in(image_rgb(0,0,0), 1.0);
      fadein = false;
  }

  /* background movement */
  background_update(bgtheme);

  /* menu option */
  if(!quit && jump_to == null && !video_fadefx_is_fading()) {
      /* select next option */
      if(input_button_pressed(input, IB_DOWN)) {
          option = (option+1)%OPTIONS_MAX;
          sound_play( soundfactory_get("choose") );
      }

      /* select previous option */
      if(input_button_pressed(input, IB_UP)) {
          option = (((option-1)%OPTIONS_MAX)+OPTIONS_MAX)%OPTIONS_MAX;
          sound_play( soundfactory_get("choose") );
      }

      /* go back... */
      if(input_button_pressed(input, IB_FIRE4)) {
          sound_play( soundfactory_get("return") );
          quit = true;
      }
  }

  /* updating the group tree */
  grouptree_update_all(root);

  /* music */
  if(quit) {
    if(!video_fadefx_is_fading()) {
      music_stop();
      //music_unref(OPTIONS_MUSICFILE);
    }
  }
  else if(!music_is_playing() && scene_time >= 0.2) {
    const m = music_load(OPTIONS_MUSICFILE);
    music_play(m, true);
  }

  /* quit */
  if(quit) {
    if(video_fadefx_over()) {
      save_preferences();
      scenestack_pop();
      scenestack_push(storyboard_get_scene(SCENE_MENU));
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
  }

  /* pushing a scene into the stack */
  if(jump_to != null) {
    if(video_fadefx_over()) {
      save_preferences();
      scenestack_push(jump_to);
      jump_to = null;
      fadein = true;
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
  }
}

export const options_render = () => {
  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  background_render_bg(bgtheme, cam);
  background_render_fg(bgtheme, cam);

  font_render(title, cam);
  grouptree_render_all(root, cam);
  actor_render(icon, cam);
}

export const options_release = () => {
  //grouptree_release_all(root);
  //grouptree_destroy_all(root);

  //bgtheme = background_unload(bgtheme);

  actor_destroy(icon);
  font_destroy(title);
  input_destroy(input);
}

/* saves the user preferences */
const save_preferences = () => {
  //preferences_set_video_resolution( video_get_resolution() );
  preferences_set_fullscreen( video_is_fullscreen() );
  preferences_set_smooth_graphics( video_is_smooth() );
  preferences_set_show_fps( video_is_fps_visible() );
}

/* --------------------------------------- */
/* group tree programming: derived classes */
/* --------------------------------------- */

/* <<abstract>> Fixed label */
const group_fixedlabel_init = (g:group_t, lang_key:string) => {
  grouptree_group_label_init(g);
  //console.log('GROUP FIXED LABEL INIT',g)
  g.data = lang_key;
  font_set_text(g.font, lang_get(lang_key));
}

const group_fixedlabel_release = (g:group_t) => {
  g.data = null
  grouptree_group_label_release(g);
}

const group_fixedlabel_update = (g:group_t) => {
  grouptree_group_label_update(g);
  font_set_text(g.font, lang_get(g.data));
}

const group_fixedlabel_render = (g:group_t, camera_position:v2d_t) => {
  grouptree_group_label_render(g, camera_position);
}

/* <<abstract>> Highlightable label */
const group_highlightable_init = (g:group_t, lang_key:string, option_index:number) => {
  let data;

  grouptree_group_label_init(g);
  font_set_text(g.font, lang_get(lang_key));

  g.data = {};
  data = g.data;
  data.option_index = option_index;
  data.lang_key = lang_key;
}

const group_highlightable_release = (g:group_t) => {
  g.data = null;
  grouptree_group_label_release(g);
}

const group_highlightable_is_highlighted = (g:group_t) => {
  const data = g.data;
  return (option == data.option_index);
}

const group_highlightable_update = (g:group_t) => {
  const data = g.data;

  grouptree_group_label_update(g);
  font_set_text(g.font, lang_get(data.lang_key));
  if(group_highlightable_is_highlighted(g)) {
    font_set_text(g.font, "<color=ffff00>%s</color>", lang_get(data.lang_key));
    icon.position = v2d_add(g.font.position, v2d_new(-20+3*Math.cos(2*PI*scene_time),0));
  }
}

const group_highlightable_render = (g:group_t, camera_position:v2d_t) => {
  grouptree_group_label_render(g, camera_position);
}

/* -------------------------- */

/* Root node */
const group_root_init = (g:group_t) => {
  grouptree_group_label_init(g);
  font_set_text(g.font, "");
  g.font.position = v2d_new(0, 25);
}

const group_root_release = (g:group_t) => {
  grouptree_group_label_release(g);
}

const group_root_update = (g:group_t) => {
  grouptree_group_label_update(g);
}

const group_root_render = (g:group_t, camera_position:v2d_t) => {
  grouptree_group_label_render(g, camera_position);
}

const group_root_create = () => {
  return grouptree_group_create(group_root_init, group_root_release, group_root_update, group_root_render);
}

/* "Graphics" label */
const group_graphics_init = (g:group_t) => {
  group_fixedlabel_init(g, "OPTIONS_GRAPHICS");
}

const group_graphics_release = (g:group_t) => {
  group_fixedlabel_release(g);
}

const group_graphics_update = (g:group_t) => {
  group_fixedlabel_update(g);
}

const group_graphics_render = (g:group_t, camera_position:v2d_t) => {
  group_fixedlabel_render(g, camera_position);
}

const group_graphics_create = () => {
  return grouptree_group_create(group_graphics_init, group_graphics_release, group_graphics_update, group_graphics_render);
}

/* "Resolution" label */
const group_resolution_init = (g:group_t) => {
  group_highlightable_init(g, "OPTIONS_RESOLUTION", 0);
}

const group_resolution_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_resolution_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_resolution_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_resolution_is_highlighted(g)) {
      if(!video_fadefx_is_fading()) {
          if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
              switch(video_get_resolution()) {
                  case VIDEORESOLUTION_1X:
                      video_changemode(VIDEORESOLUTION_2X, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
                  case VIDEORESOLUTION_2X:
                      video_changemode(VIDEORESOLUTION_MAX, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
                  case VIDEORESOLUTION_MAX:
                      video_changemode(VIDEORESOLUTION_1X, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
              }
          }
          if(input_button_pressed(input, IB_RIGHT)) {
              switch(video_get_resolution()) {
                  case VIDEORESOLUTION_1X:
                      video_changemode(VIDEORESOLUTION_2X, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
                  case VIDEORESOLUTION_2X:
                      video_changemode(VIDEORESOLUTION_MAX, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
              }
          }
          if(input_button_pressed(input, IB_LEFT)) {
              switch(video_get_resolution()) {
                  case VIDEORESOLUTION_MAX:
                      video_changemode(VIDEORESOLUTION_2X, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
                  case VIDEORESOLUTION_2X:
                      video_changemode(VIDEORESOLUTION_1X, video_is_smooth(), video_is_fullscreen());
                      sound_play( soundfactory_get("select") );
                      break;
              }
          }
      }
  }
}

const group_resolution_render = (g:group_t, camera_position:v2d_t) => {
  let f;
  let v = [];

  /* base class */
  group_highlightable_render(g, camera_position);

  /* derived class */
  f = font_create(8);
  f.position = v2d_new(175, g.font.position.y);

  v[0] = lang_get("OPTIONS_RESOLUTION_OPT1");
  v[1] = lang_get("OPTIONS_RESOLUTION_OPT2");
  v[2] = lang_get("OPTIONS_RESOLUTION_OPT3");

  //console.log(video_get_resolution())

  switch(video_get_resolution()) {
    case VIDEORESOLUTION_1X:
      font_set_text(f, "<color=ffff00>%s</color> %s %s", v[0], v[1], v[2]);
      break;

    case VIDEORESOLUTION_2X:
      font_set_text(f, "%s <color=ffff00>%s</color> %s", v[0], v[1], v[2]);
      break;

    case VIDEORESOLUTION_MAX:
      font_set_text(f, "%s %s <color=ffff00>%s</color>", v[0], v[1], v[2]);
      break;
  }

  //font_set_text(f, "<color=ffff00>%s</color> %s %s", "test");

  font_render(f, camera_position);
  font_destroy(f);
}

const group_resolution_create = () => {
  return grouptree_group_create(group_resolution_init, group_resolution_release, group_resolution_update, group_resolution_render);
}

/* "Fullscreen" label */
const group_fullscreen_init = (g:group_t) => {
  group_highlightable_init(g, "OPTIONS_FULLSCREEN", 1);
}

const group_fullscreen_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_fullscreen_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_fullscreen_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_fullscreen_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        video_changemode(video_get_resolution(), video_is_smooth(), !video_is_fullscreen());
      }
      if(input_button_pressed(input, IB_RIGHT)) {
        if(video_is_fullscreen()) {
          sound_play( soundfactory_get("select") );
          video_changemode(video_get_resolution(), video_is_smooth(), false);
        }
      }
      if(input_button_pressed(input, IB_LEFT)) {
        if(!video_is_fullscreen()) {
          sound_play( soundfactory_get("select") );
          video_changemode(video_get_resolution(), video_is_smooth(), true);
        }
      }
    }
  }
}

const group_fullscreen_render = (g:group_t, camera_position:v2d_t) => {
  let f;
  let v = [];

  /* base class */
  group_highlightable_render(g, camera_position);

  /* derived class */
  f = font_create(8);
  f.position = v2d_new(175, g.font.position.y);

  v[0] = lang_get("OPTIONS_YES");
  v[1] = lang_get("OPTIONS_NO");

  if(video_is_fullscreen())
    font_set_text(f, "<color=ffff00>%s</color>  %s", v[0], v[1]);
  else
    font_set_text(f, "%s  <color=ffff00>%s</color>", v[0], v[1]);

  font_render(f, camera_position);
  font_destroy(f);
}

const group_fullscreen_create = () => {
  return grouptree_group_create(group_fullscreen_init, group_fullscreen_release, group_fullscreen_update, group_fullscreen_render);
}

/* "Smooth Graphics" label */
const group_smooth_init = (g:group_t) => {
  group_highlightable_init(g, "OPTIONS_SMOOTHGFX", 2);
}

const group_smooth_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_smooth_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_smooth_update = (g:group_t) => {
  var resolution = (video_get_resolution() == VIDEORESOLUTION_1X) ? VIDEORESOLUTION_2X : video_get_resolution();

  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_smooth_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        video_changemode(resolution, !video_is_smooth(), video_is_fullscreen());
      }
      if(input_button_pressed(input, IB_RIGHT)) {
        if(video_is_smooth()) {
          sound_play( soundfactory_get("select") );
          video_changemode(resolution, false, video_is_fullscreen());
        }
      }
      if(input_button_pressed(input, IB_LEFT)) {
        if(!video_is_smooth()) {
          sound_play( soundfactory_get("select") );
          video_changemode(resolution, true, video_is_fullscreen());
        }
      }
    }
  }
}

const group_smooth_render = (g:group_t, camera_position:v2d_t) => {
  let f;
  let v = [];

  /* base class */
  group_highlightable_render(g, camera_position);

  /* derived class */
  f = font_create(8);
  f.position = v2d_new(175, g.font.position.y);

  v[0] = lang_get("OPTIONS_YES");
  v[1] = lang_get("OPTIONS_NO");

  if(video_is_smooth())
      font_set_text(f, "<color=ffff00>%s</color>  %s", v[0], v[1]);
  else
      font_set_text(f, "%s  <color=ffff00>%s</color>", v[0], v[1]);

  font_render(f, camera_position);
  font_destroy(f);
}

const group_smooth_create = () => {
  return grouptree_group_create(group_smooth_init, group_smooth_release, group_smooth_update, group_smooth_render);
}

/* "Show FPS" label */
const group_fps_init = (g:group_t) => {
  //group_highlightable_init(g, "OPTIONS_FPS", 3);
  group_highlightable_init(g, "OPTIONS_FPS", 0);
}

const group_fps_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_fps_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_fps_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_fps_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        video_show_fps(!video_is_fps_visible());
      }
      if(input_button_pressed(input, IB_RIGHT)) {
        if(video_is_fps_visible()) {
          sound_play( soundfactory_get("select") );
          video_show_fps(false);
        }
      }
      if(input_button_pressed(input, IB_LEFT)) {
        if(!video_is_fps_visible()) {
          sound_play( soundfactory_get("select") );
          video_show_fps(true);
        }
      }
    }
  }
}

const group_fps_render = (g:group_t, camera_position:v2d_t) => {
  let f;
  let v = [];

  /* base class */
  group_highlightable_render(g, camera_position);

  /* derived class */
  f = font_create(8);
  f.position = v2d_new(175, g.font.position.y);

  v[0] = lang_get("OPTIONS_YES");
  v[1] = lang_get("OPTIONS_NO");

  if(video_is_fps_visible())
    font_set_text(f, "<color=ffff00>%s</color>  %s", v[0], v[1]);
  else
    font_set_text(f, "%s  <color=ffff00>%s</color>", v[0], v[1]);

  font_render(f, camera_position);
  font_destroy(f);
}

const group_fps_create = () => {
  return grouptree_group_create(group_fps_init, group_fps_release, group_fps_update, group_fps_render);
}

/* "Game" label */
const group_game_init = (g:group_t) => {
  group_fixedlabel_init(g, "OPTIONS_GAME");
}

const group_game_release = (g:group_t) => {
  group_fixedlabel_release(g);
}

const group_game_update = (g:group_t) => {
  group_fixedlabel_update(g);
}

const group_game_render = (g:group_t, camera_position:v2d_t) => {
  group_fixedlabel_render(g, camera_position);
}

const group_game_create = () => {
  return grouptree_group_create(group_game_init, group_game_release, group_game_update, group_game_render);
}

/* "Change Language" label */
const group_changelanguage_init = (g:group_t) => {
  //group_highlightable_init(g, "OPTIONS_LANGUAGE", 4);
  group_highlightable_init(g, "OPTIONS_LANGUAGE", 1);
}

const group_changelanguage_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_changelanguage_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_changelanguage_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_changelanguage_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        jump_to = storyboard_get_scene(SCENE_LANGSELECT);
      }
    }
  }
}

const group_changelanguage_render = (g:group_t, camera_position:v2d_t) => {
  group_highlightable_render(g, camera_position);
}

const group_changelanguage_create = () => {
  return grouptree_group_create(group_changelanguage_init, group_changelanguage_release, group_changelanguage_update, group_changelanguage_render);
}

/* "Stage Select" label */
const group_stageselect_init = (g:group_t) => {
  //group_highlightable_init(g, "OPTIONS_STAGESELECT", 5);
  group_highlightable_init(g, "OPTIONS_STAGESELECT", 2);
}

const group_stageselect_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_stageselect_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_stageselect_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_stageselect_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        jump_to = storyboard_get_scene(SCENE_STAGESELECT);
      }
    }
  }
}

const group_stageselect_render = (g:group_t, camera_position:v2d_t) => {
  group_highlightable_render(g, camera_position);
}

const group_stageselect_create = () => {
  return grouptree_group_create(group_stageselect_init, group_stageselect_release, group_stageselect_update, group_stageselect_render);
}

/* "Credits" label */
const group_credits_init = (g:group_t) => {
  //group_highlightable_init(g, "OPTIONS_CREDITS", 6);
  group_highlightable_init(g, "OPTIONS_CREDITS", 3);
}

const group_credits_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_credits_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_credits_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_credits_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        jump_to = storyboard_get_scene(SCENE_CREDITS);
      }
    }
  }
}

const group_credits_render = (g:group_t, camera_position:v2d_t) => {
  group_highlightable_render(g, camera_position);
}

const group_credits_create = () => {
  return grouptree_group_create(group_credits_init, group_credits_release, group_credits_update, group_credits_render);
}


/* "Back" label */
const group_back_init = (g:group_t) => {
  //group_highlightable_init(g, "OPTIONS_BACK", 7);
  group_highlightable_init(g, "OPTIONS_BACK", 4);
}

const group_back_release = (g:group_t) => {
  group_highlightable_release(g);
}

const group_back_is_highlighted = (g:group_t) => {
  return group_highlightable_is_highlighted(g);
}

const group_back_update = (g:group_t) => {
  /* base class */
  group_highlightable_update(g);

  /* derived class */
  if(group_back_is_highlighted(g)) {
    if(!video_fadefx_is_fading()) {
      if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
        sound_play( soundfactory_get("select") );
        quit = true;
      }
    }
  }
}

const group_back_render = (g:group_t, camera_position:v2d_t) => {
  group_highlightable_render(g, camera_position);
}

const group_back_create = () => {
  return grouptree_group_create(group_back_init, group_back_release, group_back_update, group_back_render);
}

/* ----------------------------------------- */
/* group tree programming: creating the tree */
/* ----------------------------------------- */

/* creates the group tree */
const create_grouptree = () => {
  let root;
  let graphics, fullscreen, resolution, smooth, fps;
  let game, changelanguage, credits, stageselect;
  let back;

  // section: graphics
  //resolution = group_resolution_create();
  //fullscreen = group_fullscreen_create();
  //smooth = group_smooth_create();
  fps = group_fps_create();
  graphics = group_graphics_create();
  //grouptree_group_addchild(graphics, resolution);
  //grouptree_group_addchild(graphics, fullscreen);
  //grouptree_group_addchild(graphics, smooth);
  grouptree_group_addchild(graphics, fps);

  // section: game
  changelanguage = group_changelanguage_create();
  credits = group_credits_create();
  stageselect = group_stageselect_create();
  game = group_game_create();
  grouptree_group_addchild(game, changelanguage);
  grouptree_group_addchild(game, stageselect);
  grouptree_group_addchild(game, credits);

  // back
  back = group_back_create();

  // section: root
  root = group_root_create();
  grouptree_group_addchild(root, graphics);
  grouptree_group_addchild(root, game);
  grouptree_group_addchild(root, back);

  /* done! */
  return root;
}

