
import { PI, GAME_TITLE, GAME_WEBSITE } from "./../core/global"
import { v2d_new } from "./../core/v2d"
import { video_fadefx_in, video_fadefx_out, video_fadefx_over, video_clearDisplay, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_rgb } from "./../core/image"
import { sprite_get_animation } from "./../core/sprite"
import { lang_get } from "./../core/lang"
import { timer_get_ticks } from "./../core/timer"
import { scenestack_pop, scenestack_push } from "./../core/scene"
import { storyboard_get_scene, SCENE_QUESTOVER } from "./../core/storyboard"
import { font_create, font_render, font_destroy, font_set_text, font_get_text, font_get_charsize } from "./../entities/font"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../entities/actor"

const SCENE_TIMEOUT = 3;
const RING_MAX = 10;

let starttime = 0;
let fnt:any = null;
let title:any = null
let ring:any[] = [];

/**
 * endofdemo_init()
 * Initializes the scene
 */
export const endofdemo_init = () => {
  let i;

  starttime = timer_get_ticks();

  fnt = font_create(8);
  fnt.position = v2d_new(5, 35);

  title = font_create(4);
  font_set_text(title, lang_get("ENDOFDEMO_TITLE"));
  title.position = v2d_new( (VIDEO_SCREEN_W - font_get_charsize(title).x*font_get_text(title).length)/2 , 5 );

  for(i=0; i<RING_MAX; i++) {
      ring[i] = actor_create();
      ring[i].spawn_point = ring[i].position = v2d_new( VIDEO_SCREEN_W*i/RING_MAX+15 , 215);
      actor_change_animation(ring[i], sprite_get_animation(i%2==1 ? "SD_BLUERING" : "SD_RING", 0));
  }

  video_fadefx_in(image_rgb(0,0,0), 2.0);
}

/**
 * endofdemo_update()
 * Updates the scene
 */
export const endofdemo_update = () => {
  const now = timer_get_ticks();
  let i, sec = Math.max(0, (SCENE_TIMEOUT - (now-starttime)) / 1000);

  font_set_text(fnt, lang_get("ENDOFDEMO_TEXT"), GAME_TITLE, GAME_WEBSITE, sec);

  if(now >= starttime + SCENE_TIMEOUT) {
    if(video_fadefx_over()) {
      scenestack_pop();
      scenestack_push(storyboard_get_scene(SCENE_QUESTOVER));
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 2.0);
  }

  for(i=0; i<RING_MAX; i++)
    ring[i].position.y = ring[i].spawn_point.y + 10*Math.sin(PI * (now*0.001) + (2*PI/RING_MAX)*i);
}

/**
 * endofdemo_render()
 * Renders the scene
 */
export const endofdemo_render = () => {
  let i;
  let cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  //image_clear(video_get_backbuffer(), image_rgb(0,0,0));
  video_clearDisplay(); 

  for(i=0; i<RING_MAX; i++)
    actor_render(ring[i], cam);

  font_render(title, cam);
  font_render(fnt, cam);
}

/**
 * endofdemo_release()
 * Releases the scene
 */
export const endofdemo_release = () => {
  let i;

  for(i=0; i<RING_MAX; i++)
    actor_destroy(ring[i]);

  font_destroy(title);
  font_destroy(fnt);
}
