
import { quest_getname, quest_getvalue } from "./quest"
import { scenestack_push, scenestack_pop } from "./../core/scene"
import { storyboard_get_scene, SCENE_MENU } from "./../core/storyboard"
import { v2d_new } from "./../core/v2d"
import { GAME_TITLE, GAME_WEBSITE } from "./../core/global"
import { video_fadefx_in, video_fadefx_out, video_fadefx_over, video_clearDisplay, VIDEO_SCREEN_W, VIDEO_SCREEN_H} from "./../core/video"
import { image_rgb } from "./../core/image"
import { sprite_get_animation } from "./../core/sprite"
import { music_load, music_play } from "./../core/audio"
import { input_destroy, input_button_pressed, input_create_user, IB_FIRE1 } from "./../core/input"
import { lang_get } from "./../core/lang"
import { timer_get_ticks } from "./../core/timer"
import { actor_create, actor_render, actor_change_animation, actor_destroy } from "./../entities/actor"
import { font_get_charsize, font_set_text, font_get_text, font_create, font_destroy, font_render } from "./../entities/font"
import { player_get_score } from "./../entities/player"

const QUESTOVER_MUSICFILE = "data/music/invincible.mp4";
let starttime;
let fnt, title;
let sonic;
let input;
let quit;

export const questover_init = () => {
  starttime = timer_get_ticks();
  quit = false;

  fnt = font_create(8);
  fnt.position = v2d_new(5, 35);

  title = font_create(4);
  font_set_text(title,  lang_get("QUESTCLEARED_TITLE"));
  title.position = v2d_new( (VIDEO_SCREEN_W - parseInt(font_get_charsize(title).x*font_get_text(title)).length/2,10) , 5 );

  sonic = actor_create();
  actor_change_animation(sonic, sprite_get_animation("SD_SONIC", 24));
  sonic.position = v2d_new(20, 150);

  music_play( music_load(QUESTOVER_MUSICFILE) , 0);
  input = input_create_user();
  video_fadefx_in(image_rgb(0,0,0), 2.0);
}

export const questover_update = () => {
  const name = quest_getname();
  const score = player_get_score();
  const time_h = quest_getvalue('QUESTVALUE_TOTALTIME')/3600;
  const time_m = parseInt((quest_getvalue('QUESTVALUE_TOTALTIME')/60) % 60,10);
  const time_s = parseInt((quest_getvalue('QUESTVALUE_TOTALTIME')) % 60,10);
  const glasses = quest_getvalue('QUESTVALUE_GLASSES');
  const bigrings = quest_getvalue('QUESTVALUE_BIGRINGS');
  const now = timer_get_ticks();

  //console.log(name, score, time_h, time_m, time_s, glasses, bigrings, GAME_TITLE, GAME_WEBSITE)

  font_set_text(fnt, lang_get("QUESTCLEARED_TEXT"), name, score, time_h, time_m, time_s, glasses, bigrings, GAME_TITLE, GAME_WEBSITE);

  //if(Input.button_pressed(input, Input.IB_FIRE3) && now >= starttime + 3000) {
  if(input_button_pressed(input, IB_FIRE1) ) {
    //music_stop();
    //music_unref(QUESTOVER_MUSICFILE);
    quit = true;
  }

  if(quit) {
    if(video_fadefx_over()) {
      scenestack_pop();
      scenestack_push(storyboard_get_scene(SCENE_MENU));
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 2.0);
  }
}

export const questover_render = () => {
  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);
  //image_clear(video_get_backbuffer(), image_rgb(0,0,0));
  video_clearDisplay();
  font_render(title, cam);
  font_render(fnt, cam);
  actor_render(sonic, cam);
}

export const questover_release = () => {
  input_destroy(input);
  actor_destroy(sonic);
  font_destroy(title);
  font_destroy(fnt);
}
