
import { level_setfile } from "./level"

import { scenestack_pop, scenestack_push } from "./../core/scene"
import { storyboard_get_scene, SCENE_LEVEL } from "./../core/storyboard"
import { v2d_new } from "./../core/v2d"
import { PI, INFINITY } from "./../core/global"
import { logfile_message } from "./../core/logfile"
import { video_fadefx_over, video_fadefx_in, video_fadefx_out, video_fadefx_is_fading, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_rgb } from "./../core/image"
import { sound_play, music_stop, music_load, music_play, music_is_playing } from "./../core/audio"
import { lang_get } from "./../core/lang"
import { input_create_user, input_destroy, input_button_pressed, IB_DOWN, IB_UP, IB_FIRE1, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { sprite_get_animation } from "./../core/sprite"
import { resourcemanager_getJsonFiles } from "./../core/resourcemanager"
import { timer_get_delta } from "./../core/timer"
import { soundfactory_get } from "./../core/soundfactory"

import { font_set_text, font_get_text, font_render, font_destroy, font_create, font_get_charsize } from "./../entities/font"
import { actor_render, actor_destroy, actor_create, actor_change_animation } from "./../entities/actor"
import { player_set_lives, player_set_score, PLAYER_INITIAL_LIVES } from "./../entities/player"
import { background_render_bg, background_render_fg, background_unload, background_load, background_update } from "./../entities/background"

const stageFiles = [
  'data/levels/blue_ocean_1.json',
  'data/levels/blue_ocean_2.json',
  'data/levels/blue_ocean_3.json',
  'data/levels/desert1.json',
  'data/levels/exotic_1.json',
  'data/levels/exotic_2.json',
  'data/levels/exotic_3.json',
  'data/levels/exotichell_1.json',
  'data/levels/prototype.json',
  'data/levels/superboss_1.json',
  'data/levels/superboss_2.json',
  'data/levels/template.json',
  'data/levels/tutorial_1.json',
  'data/levels/tutorial_2.json',
  'data/levels/test.json'
];

const OPTIONS_MUSICFILE       = "data/music/options.mp4";

const STAGE_BGFILE            = "data/themes/levelselect.bg.json";
const STAGE_MAXPERPAGE        = 8;

let pagenum, maxpages       = 1;
let title;
let msg;
let page;
let icon;
let input;
let scene_time;
let bgtheme;

let state;
let stage_data = [];
let stage_count = 0;
let option = 0;
let stage_label = [];

const STAGESTATE_NORMAL     = 0;
const STAGESTATE_QUIT       = 1;
const STAGESTATE_PLAY       = 2;
const STAGESTATE_FADEIN     = 3;

export const stageselect_init = () => {

  option = 0;
  scene_time = 0;
  state = STAGESTATE_NORMAL;
  input = input_create_user();

  title = font_create(4);
  font_set_text(title, lang_get("STAGESELECT_TITLE"));
  title.position.x = (VIDEO_SCREEN_W - font_get_text(title).length*font_get_charsize(title).x)/2 - 150;
  title.position.y = 10;

  msg = font_create(8);
  font_set_text(msg, lang_get("STAGESELECT_MSG"));
  msg.position.x = 10;
  msg.position.y = VIDEO_SCREEN_H-font_get_charsize(msg).y*1.5;

  page = font_create(8);
  font_set_text(page, lang_get("STAGESELECT_PAGE"), 0, 0);
  page.position.x = VIDEO_SCREEN_W - font_get_text(page).length*font_get_charsize(page).x - 10;
  page.position.y = 40;

  background_load(STAGE_BGFILE)
  .then(function(data){
    bgtheme = data;
  })

  icon = actor_create();
  actor_change_animation(icon, sprite_get_animation("SD_TITLEFOOT", 0));

  load_stage_list();
  video_fadefx_in(image_rgb(0,0,0), 1.0);
}

export const stageselect_update = () => {
  const dt = timer_get_delta();
  scene_time += dt;

  background_update(bgtheme);

  if (!stage_label.length) return;

  /* menu option */
  icon.position = v2d_new(stage_label[option].position.x, stage_label[option].position.y);
  icon.position.x += -20 + 3*Math.cos(2*PI * scene_time);

  /* page number */
  pagenum = Math.floor(option/STAGE_MAXPERPAGE + 1);
  maxpages = Math.floor(stage_count/STAGE_MAXPERPAGE + ((stage_count%STAGE_MAXPERPAGE == 0) ? 0 : 1));
  font_set_text(page, lang_get("STAGESELECT_PAGE"), pagenum, maxpages);
  page.position.x = VIDEO_SCREEN_W - font_get_text(page).length*font_get_charsize(page).x - 10;

  /* music */
  if(state == STAGESTATE_PLAY) {
    if(!video_fadefx_is_fading()) {
      music_stop();
      //audio_music_unref(OPTIONS_MUSICFILE);
    }
  }
  else if(!music_is_playing()) {
    const m = music_load(OPTIONS_MUSICFILE);
    music_play(m, INFINITY);
  }

   /* finite state machine */
  switch(state) {
    /* normal mode (menu) */
    case STAGESTATE_NORMAL: {
      if(!video_fadefx_is_fading()) {
          if(input_button_pressed(input, IB_DOWN)) {
              option = (option+1) % stage_count;
              sound_play( soundfactory_get("choose") );
          }
          if(input_button_pressed(input, IB_UP)) {
              option = (((option-1) % stage_count) + stage_count) % stage_count;
              sound_play( soundfactory_get("choose") );
          }
          if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
              logfile_message("Loading level \"%s\", \"%s\"", stage_data[option].name, stage_data[option].filepath);
              level_setfile(stage_data[option].filepath);
              sound_play( soundfactory_get("select") );
              state = STAGESTATE_PLAY;
          }
          if(input_button_pressed(input, IB_FIRE4)) {
              sound_play( soundfactory_get("return") );
              state = STAGESTATE_QUIT;
          }
      }
      break;
    }

    /* fade-out effect (quit this screen) */
    case STAGESTATE_QUIT: {
        if(video_fadefx_over()) {
            scenestack_pop();
            return;
        }
        video_fadefx_out(image_rgb(0,0,0), 1.0);
        break;
    }

    /* fade-out effect (play a level) */
    case STAGESTATE_PLAY: {
        if(video_fadefx_over()) {
            player_set_lives(PLAYER_INITIAL_LIVES);
            player_set_score(0);
            scenestack_push(storyboard_get_scene(SCENE_LEVEL));
            state = STAGESTATE_FADEIN;
            return;
        }
        video_fadefx_out(image_rgb(0,0,0), 1.0);
        break;
    }

    /* fade-in effect (after playing a level) */
    case STAGESTATE_FADEIN: {
        video_fadefx_in(image_rgb(0,0,0), 1.0);
        state = STAGESTATE_NORMAL;
        break;
    }
  }
}

export const stageselect_render = () => {
  let i;
  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  background_render_bg(bgtheme, cam);
  background_render_fg(bgtheme, cam);

  font_render(title, cam);
  font_render(msg, cam);

  if (maxpages > 1) {
    font_render(page, cam);
  }

  for(i=(pagenum-1)*STAGE_MAXPERPAGE; i<pagenum*STAGE_MAXPERPAGE; i++) {
    if (stage_data[i]) {
      font_set_text(stage_label[i], (option==i) ? "<color=ffff00>%s - %s %s</color>" : "%s - %s %s", stage_data[i].name, lang_get("STAGESELECT_ACT"), stage_data[i].act);
      font_render(stage_label[i], cam);
    }
  }

  actor_render(icon, cam);
}

export const stageselect_release = () => {
  unload_stage_list();
  bgtheme = background_unload(bgtheme);

  actor_destroy(icon);
  font_destroy(title);
  font_destroy(msg);
  font_destroy(page);
  input_destroy(input);
}

const load_stage_list = () => {

  logfile_message("load_stage_list()");

  resourcemanager_getJsonFiles(stageFiles)
  .then(function(data){
    stage_data = data;
    stage_count = stage_data.length;
    for(var i = 0; i< stage_count;i++) {
      stage_label[i] = font_create(8);
      stage_label[i].position = v2d_new(25, 60 + 20 * (i % STAGE_MAXPERPAGE));
      stage_data[i].filepath = stageFiles[i];
    }
    //console.log(stage_label,stage_data)
  });
}

const unload_stage_list = () => {}
