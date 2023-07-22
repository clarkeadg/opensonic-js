
import { PI, INFINITY } from "./../core/global"
import { v2d_new } from "./../core/v2d"
import { scenestack_pop } from "./../core/scene"
import { preferences_set_language } from "./../core/preferences"
import { logfile_message } from "./../core/logfile"
import { video_clearDisplay, video_fadefx_over, video_fadefx_is_fading, video_fadefx_in, video_fadefx_out, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_rgb } from "./../core/image"
import { sprite_get_animation } from "./../core/sprite"
import { music_load, music_is_playing, music_play, sound_play } from "./../core/audio"
import { lang_get, lang_loadfile } from "./../core/lang"
import { input_t, IB_UP, IB_DOWN, IB_FIRE1, IB_FIRE3, IB_FIRE4, input_destroy, input_create_user, input_button_pressed } from "./../core/input"
import { timer_get_delta } from "./../core/timer"
import { resourcemanager_getJsonFiles } from "./../core/resourcemanager"
import { soundfactory_get } from "./../core/soundfactory"
import { font_t, font_create, font_get_charsize, font_get_text, font_set_text, font_render, font_destroy } from "./../entities/font"
import { actor_t, actor_create, actor_change_animation, actor_render, actor_destroy } from "./../entities/actor"
import { bgtheme_t, background_load, background_update, background_render_bg, background_render_fg, background_unload } from "./../entities/background"

const langFiles = [
  'data/languages/deutsch.json',
  'data/languages/dutch.json',
  'data/languages/english.json',
  'data/languages/francais.json',
  'data/languages/indonesian.json',
  'data/languages/italiano.json',
  'data/languages/polish.json',
  'data/languages/ptbr.json'
];

const DEFAULT_LANGUAGE_FILEPATH = "data/languages/english.json"

/* private data */
const LANG_BGFILE            = "data/themes/langselect.bg.json";
const OPTIONS_MUSICFILE      = "data/music/options.mp4";

let LANG_MAXPERPAGE        = 8;
let pagenum = 1;
let maxpages      = 1;

let quit = false
let lngcount = 0;
let title:font_t[]  = [];
let lngfnt:any  = [];
let page_label:any;
let lngdata:any;
let option = 0;
let icon:actor_t;
let input:input_t;
let scene_time = 0.0;
let bgtheme:bgtheme_t;

/**
 * langselect_init()
 * Initializes the scene
 */
export const langselect_init = () => {
  option = 0;
  quit = false;
  scene_time = 0;
  input = input_create_user();

  page_label = font_create(8);

  title[0] = font_create(4);
  font_set_text(title[0], "SELECT YOUR");
  title[0].position.x = (VIDEO_SCREEN_W - font_get_text(title[0]).length*font_get_charsize(title[0]).x)/2 - 140;
  title[0].position.y = 10;

  title[1] = font_create(4);
  font_set_text(title[1], "LANGUAGE");
  title[1].position.x = (VIDEO_SCREEN_W - font_get_text(title[1]).length*font_get_charsize(title[1]).x)/2 - 120;
  title[1].position.y = title[0].position.y + font_get_charsize(title[1]).y + 10 + 10;

  title[2] = font_create(8);
  font_set_text(title[2], lang_get("MENU_CQ_BACK"));
  title[2].position.x = 10;
  title[2].position.y = VIDEO_SCREEN_H-font_get_charsize(title[2]).y*1.5;

  /* background init */
  background_load(LANG_BGFILE)
  .then(function(bgdata:any){
    bgtheme = bgdata;
    video_fadefx_in(image_rgb(0,0,0), 1.0);
  });


  icon = actor_create();
  actor_change_animation(icon, sprite_get_animation("SD_TITLEFOOT", 0));

  load_lang_list();
  video_fadefx_in(image_rgb(0,0,0), 1.0);
}

/**
 * langselect_update()
 * Updates the scene
 */
export const langselect_update = () => {

  const dt = timer_get_delta();
  scene_time += dt;

  /* background movement */
  background_update(bgtheme);

  if (icon && lngfnt.length) {
    /* menu option */
    icon.position = v2d_new(lngfnt[0][option].position.x,lngfnt[0][option].position.y);
    icon.position.x -= 15;
    icon.position.x += 5*Math.cos(2*PI * scene_time);
  }

  if(!quit && !video_fadefx_is_fading()) {
    if(input_button_pressed(input, IB_DOWN)) {
      option = (option+1)%lngcount;
      sound_play( soundfactory_get("choose") );
    }
    if(input_button_pressed(input, IB_UP)) {
      option = (((option-1)%lngcount)+lngcount)%lngcount;
      sound_play( soundfactory_get("choose") );
    }
    if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
      if (!lngdata) return;
      let filepath = lngdata[option].filepath;
      logfile_message(`Loading language ${lngdata[option].title} ${filepath}`);
      lang_loadfile(DEFAULT_LANGUAGE_FILEPATH); /* just in case of missing strings... */
      lang_loadfile(filepath);
      save_preferences(filepath);
      sound_play( soundfactory_get("select") );
      //quit = true;
    }
    if(input_button_pressed(input, IB_FIRE4)) {
      sound_play( soundfactory_get("return") );
      quit = true;
    }
  }

  /* page label */
  pagenum = Math.floor(1+option/LANG_MAXPERPAGE);
  maxpages = Math.floor(1+Math.max(0,lngcount-1)/LANG_MAXPERPAGE);

  font_set_text(page_label, "page %d/%d", pagenum, maxpages);
  page_label.position.x = VIDEO_SCREEN_W - font_get_text(page_label).length*font_get_charsize(page_label).x - 10;
  page_label.position.y = VIDEO_SCREEN_H - font_get_charsize(page_label).y - 3;

  /* music */
  if(!music_is_playing()) {
    const m = music_load(OPTIONS_MUSICFILE);
    music_play(m, true);
  }

  /* quit */
  if(quit) {
    if(video_fadefx_over()) {
      scenestack_pop();
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
  }
}

/**
 * langselect_render()
 * Renders the scene
 */
export const langselect_render = () => {
  let i;
  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  video_clearDisplay();

  background_render_bg(bgtheme, cam);
  background_render_fg(bgtheme, cam);

  font_render(title[0], cam);
  font_render(title[1], cam);
  font_render(title[2], cam);

  if (maxpages > 1) {
    font_render(page_label, cam);
  }

  for(i=(pagenum-1)*LANG_MAXPERPAGE; i<pagenum*LANG_MAXPERPAGE; i++) {
    if (langFiles[i] && lngfnt.length > 1) {
      font_render(lngfnt[option==i ? 1 : 0][i], cam);
    }
  }

  actor_render(icon, cam);
}

/**
 * langselect_release()
 * Releases the scene
 */
export const langselect_release = () => {
  unload_lang_list();
  bgtheme = background_unload(bgtheme);

  actor_destroy(icon);
  font_destroy(title[0]);
  font_destroy(title[1]);
  font_destroy(page_label);
  input_destroy(input);
}

const save_preferences = (filepath:string) => {
  preferences_set_language(filepath);
}

const load_lang_list = () => {

  logfile_message("load_lang_list()");

  resourcemanager_getJsonFiles(langFiles)
  .then(function(data){
    lngdata = data;
    lngcount = lngdata.length;
    lngfnt[0] = [];
    lngfnt[1] = [];
    for(let i = 0; i< lngcount;i++) {
      lngdata[i].filepath = langFiles[i];
      lngfnt[0][i] = font_create(8);
      lngfnt[1][i] = font_create(8);
      //font_set_text(lngfnt[0][i], "%2d. %s", i+1, lngdata[i].title);
      //font_set_text(lngfnt[1][i], "<color=ffff00>% 2d. %s</color>", i+1, lngdata[i].title);
      font_set_text(lngfnt[0][i], lngdata[i].LANG_LANGUAGE);
      font_set_text(lngfnt[1][i], lngdata[i].LANG_LANGUAGE);
      lngfnt[0][i].position = v2d_new(25, 75 + 20*(i%LANG_MAXPERPAGE));
      lngfnt[1][i].position = v2d_new(25, 75 + 20*(i%LANG_MAXPERPAGE));
    }
  });
}

const unload_lang_list = () => {
  let i;

  logfile_message("unload_lang_list()");

  for(i=0; i<lngcount; i++) {
      font_destroy(lngfnt[0][i]);
      font_destroy(lngfnt[1][i]);
  }

  lngfnt[0] = null;
  lngfnt[1] = null;
  lngdata = null;
  lngcount = 0;
}
