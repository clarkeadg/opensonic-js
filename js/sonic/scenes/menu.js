
import { quest_run } from "./quest"
import { quest_load } from "./../core/quest"
import { scenestack_pop, scenestack_push } from "./../core/scene"
import { storyboard_get_scene, SCENE_OPTIONS, SCENE_QUEST } from "./../core/storyboard"
import { GAME_WEBSITE, GAME_VERSION, GAME_SUB_VERSION, GAME_WIP_VERSION, PI } from "./../core/global"
import { v2d_new } from "./../core/v2d"
import { input_create_user, input_destroy, input_ignore, input_restore, input_button_pressed, IB_UP, IB_DOWN, IB_FIRE1, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { video_clearDisplay, video_get_backbuffer, video_fadefx_in, video_fadefx_out, video_fadefx_over, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_rgb, image_blit } from "./../core/image"
import { sound_play, music_load, music_play } from "./../core/audio"
import { timer_get_ticks } from "./../core/timer"
import { lang_get, lang_getstring } from "./../core/lang"
import { soundfactory_get } from "./../core/soundfactory"
import { sprite_get_animation } from "./../core/sprite"

import { actor_image, actor_animation_finished, actor_change_animation, actor_render, actor_destroy, actor_create } from "./../entities/actor"
import { font_set_text, font_create, font_render, font_destroy } from "./../entities/font"
import { background_update, background_render_bg, background_render_fg, background_load } from "./../entities/background"

/* private data */
const MENU_MUSICFILE        = "data/music/title.mp4";
const MENU_BGFILE           = "data/themes/menu.bg.json";

const questFiles = [
  "data/quests/default.json",
  "data/quests/extra.json",
  "data/quests/superbosses.json",
  "data/quests/tutorial.json"
];

/* menu screens */
const MENU_MAIN = 0;
const MENU_QUEST = 1;
let menu_screen;
let input;
let jump_to;
let bgtheme;

/* main menu */
//let MENU_MAXOPTIONS = 4;
let MENU_MAXOPTIONS = 3;
let start_time;
let control_restored;
let menu;
let menuopt;
let menufnt ;
let menufoot;
let surge_entering;
let surge, surgebg, gametitle;
let credit, version;
let quit;

/* quest menu */
const MENU_QUESTSPERPAGE = 14;

let pagenum, maxpages       = 1;
let qstselect = [];
let qstdetail;
let qstmenuopt;
let qstcount;
let qstfnt = [];
let qstdata;
let music;

export const menu_init = () => {
  let i, j;

  /* initializing... */
  quit = false;
  menu_screen = MENU_MAIN;
  start_time = timer_get_ticks()*0.001;
  control_restored = false;
  jump_to = null;
  input = input_create_user();
  input_ignore(input);
  load_quest_list();
  //console.log(qstdata);

  music = music_load(MENU_MUSICFILE);
  music_play(music, true);
  //music.play( music.load(MENU_MUSICFILE) , INFINITY);


  /* background init */
  bgtheme = background_load(MENU_BGFILE)
  .then(function(bgdata){
    bgtheme = bgdata;
    //console.log(bgtheme);
    video_fadefx_in(image_rgb(0,0,0), 1.0);
  });


  /* main actors */
  surge_entering = true;

  surge = actor_create();
  surge = actor_change_animation(surge, sprite_get_animation("SD_TITLESURGE", 0));
  surge.position.x = (VIDEO_SCREEN_W-actor_image(surge).width)/2 + 5;
  surge.position.y = -15;

  surgebg = actor_create();
  surgebg = actor_change_animation(surgebg, sprite_get_animation("SD_TITLEBG", 0));
  surgebg.position.x = (VIDEO_SCREEN_W-actor_image(surgebg).width)/2;
  surgebg.position.y = surge.position.y+25;

  gametitle = actor_create();
  gametitle = actor_change_animation(gametitle, sprite_get_animation("SD_TITLEGAMENAME", 0));
  gametitle.position.x = (VIDEO_SCREEN_W-actor_image(gametitle).width)/2;
  gametitle.position.y = surge.position.y+actor_image(surge).height-9;

  credit = font_create(8);
  credit.position = v2d_new(3, VIDEO_SCREEN_H-12);
  //console.log('************',GAME_WEBSITE);
  font_set_text(credit, "%s", GAME_WEBSITE);
  version = font_create(0);
  version.position = v2d_new(VIDEO_SCREEN_W-75, 3);
  font_set_text(version, "V%d.%d.%d", GAME_VERSION, GAME_SUB_VERSION, GAME_WIP_VERSION);

  /* main menu */
  menuopt = 0;
  menufoot = actor_create();
  menufoot = actor_change_animation(menufoot, sprite_get_animation("SD_TITLEFOOT", 0));

  menu = [];

  menu[0] = lang_getstring("MENU_1PGAME");
  menu[1] = lang_getstring("MENU_TUTORIAL");
  menu[2] = lang_getstring("MENU_CUSTOMQUESTS");
  menu[3] = lang_getstring("MENU_OPTIONS");
  //menu[4] = lang_getstring("MENU_EXIT");

  MENU_MAXOPTIONS = menu.length;

  menufnt = [];
  for(i=0; i<2; i++) {
    for(j=0; j<MENU_MAXOPTIONS; j++) {
      if (!menufnt[j]) menufnt[j] = [];
      menufnt[j][i] = font_create(i);
      menufnt[j][i].position = v2d_new((VIDEO_SCREEN_W/2) - (actor_image(surgebg).width/5), gametitle.position.y+65+10*j);
      font_set_text(menufnt[j][i], menu[j]);
    }
  }

  /* quest menu */
  qstselect[0] = font_create(8);
  qstselect[0].position = v2d_new(5, 3);

  qstselect[1] = font_create(8);
  qstselect[1].position = v2d_new(5, VIDEO_SCREEN_H-13);

  qstdetail = font_create(8);
  qstdetail.position = v2d_new(5, 170);


  /* fade in */
  video_fadefx_in(image_rgb(0,0,0), 1.5);
}

export const menu_update = () => {
  let i;
  const t = timer_get_ticks() * 0.001;

  /* game start */
  if(jump_to != null && video_fadefx_over()) {
      scenestack_pop();
      scenestack_push(jump_to);
      return;
  }

  /* quit game */
  /*if(quit && video_fadefx_over()) {
      game_quit();
      return;
  }*/

  /* ignore/restore control */
  if(t <= start_time + 2.0)
      input_ignore(input);
  else if(!control_restored) {
      input_restore(input);
      control_restored = true;
  }

  /* background movement */
  background_update(bgtheme);


  /* menu programming */
  //if(jump_to || quit)
  //    return;

  switch(menu_screen) {

      /* ------ main menu ------ */
      case MENU_MAIN:
      {
          /* surge & stuff */
          if(surge_entering && actor_animation_finished(surge)) {
              surge_entering = false;
              surge = actor_change_animation(surge, sprite_get_animation("SD_TITLESURGE", 1));
              input_restore(input);
          }
          gametitle.visible = !surge_entering;

          /* current option */
          menufoot.position.x = menufnt[menuopt][0].position.x - 20 + 3*Math.cos(2*PI * t);
          menufoot.position.y = menufnt[menuopt][0].position.y;

          if(input_button_pressed(input, IB_UP)) {
              sound_play( soundfactory_get("choose") );
              menuopt--;
          }
          if(input_button_pressed(input, IB_DOWN)) {
              sound_play( soundfactory_get("choose") );
              menuopt++;
          }
          menuopt = (menuopt%MENU_MAXOPTIONS + MENU_MAXOPTIONS) % MENU_MAXOPTIONS;

          if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
              sound_play( soundfactory_get("select") );
              select_option(menuopt);
          }

          break;
      }

      /* ------ quest menu ----- */
      case MENU_QUEST:
      {
          // go back to the main menu
          if(input_button_pressed(input, IB_FIRE4)) {
              sound_play( soundfactory_get("return") );
              menu_screen = MENU_MAIN;
          }

          // font position
          for(i=0; i<qstcount; i++) {
              qstfnt[i].position = v2d_new(30, 20 + 10*(i%MENU_QUESTSPERPAGE));
              qstfnt[i].visible = (qstmenuopt_getpage(i) == qstmenuopt_getpage(qstmenuopt));
          }

          // selected option?
          menufoot.position.x = 10;
          menufoot.position.y = qstfnt[qstmenuopt].position.y;

          if(input_button_pressed(input, IB_UP)) {
              sound_play( soundfactory_get("choose") );
              qstmenuopt--;
          }
          if(input_button_pressed(input, IB_DOWN)) {
              sound_play( soundfactory_get("choose") );
              qstmenuopt++;
          }
          qstmenuopt = (qstmenuopt%qstcount + qstcount) % qstcount;

          // quest details
          font_set_text(qstselect[0], lang_get("MENU_CQ_SELECT"), qstmenuopt_getpage(qstmenuopt), qstmenuopt_getmaxpages());
          font_set_text(qstselect[1], lang_get("MENU_CQ_BACK"));
          font_set_text(qstdetail, lang_get("MENU_CQ_INFO"), qstdata[qstmenuopt].version, qstdata[qstmenuopt].name, qstdata[qstmenuopt].author, qstdata[qstmenuopt].description);

          // game start!
          if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
              //var clone = load_quest(qstdata[qstmenuopt].file);
              sound_play( soundfactory_get("select") );
              game_start(qstdata[qstmenuopt]);
              return;
          }

          break;
      }
  }
}

export const menu_render = () => {
  let i;
  const camera = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  video_clearDisplay();

  /* don't draw anything. We're leaving... */
  if(quit && video_fadefx_over())
      return;

  /* background */
  background_render_bg(bgtheme, camera);
  background_render_fg(bgtheme, camera);

  /* rendering menus... :) */
  switch(menu_screen) {
      /* ----- main menu ----- */
      case MENU_MAIN:
      {
          /* menu */
          for(i=0; i<MENU_MAXOPTIONS; i++)
            font_render(menufnt[i][i == menuopt ? 1 : 0], camera);
          actor_render(menufoot, camera);

          /* surge & stuff */
          font_render(credit, camera);
          font_render(version, camera);
          actor_render(surgebg, camera);
          if(surge_entering) {
            video_clearDisplay();
            //image_clear(video_get_backbuffer(), image_rgb(0,0,0));
          }
          actor_render(surge, camera);
          actor_render(gametitle, camera);
          break;
      }

      /* ----- quest menu ----- */
      case MENU_QUEST:
      {
          // quest details
          let thumb = qstdata[qstmenuopt].image;
          //console.log(qstdata)
          font_render(qstdetail, camera);

          // draw quest thumbnail
          image_blit(
            thumb,
            video_get_backbuffer(),
            0,
            0,
            VIDEO_SCREEN_W - thumb.width - 25,
            parseInt(qstfnt[0].position.y,10),
            thumb.width,
            thumb.height
          );

          // texts
          font_render(qstselect[0], camera);
          font_render(qstselect[1], camera);
          for(i=0; i<qstcount; i++)
            font_render(qstfnt[i], camera);
          actor_render(menufoot, camera);
          break;
      }
  }
}

export const menu_release = () => {
  let i, j;

  /* no more music... */
  music.pause();
  //music.unref(MENU_MUSICFILE);

  /* main menu stuff */
  font_destroy(credit);
  font_destroy(version);
  for(i=0; i<2; i++) {
    for(j=0; j<MENU_MAXOPTIONS; j++)
      font_destroy(menufnt[j][i]);
  }
  actor_destroy(surgebg);
  actor_destroy(gametitle);
  actor_destroy(surge);

  /* quest menu */
  //font_destroy(qstselect[0]);
  //font_destroy(qstselect[1]);
  //font_destroy(qstdetail);

  /* background */
  //bgtheme = background_unload(bgtheme);

  /* misc */
  actor_destroy(menufoot);
  input_destroy(input);
  //release_quest_list();
}

/* private functions */
const select_option = (opt) => {
  let abs_path = questFiles[0];

  switch(opt) {
    // 1P GAME
    case 0:
        //resource_filepath(abs_path, "data/quests/default.qst", sizeof(abs_path), RESFP_READ);
        //game_start();
        quest_load(abs_path)
        .then(function(q){
          game_start(q)
        })
        return;

    // TUTORIAL
    case 1:
        //resource_filepath(abs_path, "data/quests/tutorial.qst", sizeof(abs_path), RESFP_READ);
        //game_start( load_quest(abs_path) );
        quest_load("data/quests/tutorial.json")
        .then(function(q){
          game_start(q)
        })
        return;

    // CUSTOM QUESTS
    case 2:
        menu_screen = MENU_QUEST;
        qstmenuopt = 0;
        break;

    // OPTIONS
    case 3:
        jump_to = storyboard_get_scene(SCENE_OPTIONS);
        video_fadefx_out(image_rgb(0,0,0), 0.5);
        return;

    // EXIT
    /*case 4:
        quit = true;
        video_fadefx_out(image_rgb(0,0,0), 0.5);
        return;*/
  }
}

const load_quest_list = () => {
  var i;

  qstcount = questFiles.length;

  qstdata = [];
  for(i=0; i<qstcount; i++) {
    (function(n){
      quest_load(questFiles[i])
        .then(function(q){
          qstfnt[n] = font_create(8);
          qstdata[n] = q;
          font_set_text(qstfnt[n], q.name);
          //font_set_text(qstfnt[n], "%2d %s", i+1, q.name);
        })
    })(i)
  }
}

const qstmenuopt_getpage = (val) => {
  pagenum = Math.floor(val/MENU_QUESTSPERPAGE + 1)
  return pagenum;
}

const qstmenuopt_getmaxpages = () => {
  maxpages = Math.floor(qstcount/MENU_QUESTSPERPAGE + ((qstcount%MENU_QUESTSPERPAGE == 0) ? 0 : 1));
  return maxpages;
}

const game_start = (q) => {
  quest_run(q, false);
  jump_to = storyboard_get_scene(SCENE_QUEST);
  //jump_to = storyboard_get_scene(SCENE_LEVEL);
  input_ignore(input);
  video_fadefx_out(image_rgb(0,0,0), 0.5);
}
