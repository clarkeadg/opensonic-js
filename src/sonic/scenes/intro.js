
import { v2d_new } from "./../core/v2d"
import { timer_get_delta } from "./../core/timer"
import { scenestack_pop, scenestack_push } from "./../core/scene"
import { storyboard_get_scene, SCENE_MENU } from "./../core/storyboard"
import { video_fadefx_in, video_fadefx_out, video_fadefx_over, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_rgb } from "./../core/image"
import { background_load, background_update, background_render_bg, background_render_fg } from "./../entities/background"

const INTRO_BGFILE        = "data/themes/intro.bg.json";
const INTRO_TIMEOUT       = 3;

let elapsed_time;
let bgtheme;

export const intro_init = () => {
  elapsed_time = 0.0;
  background_load(INTRO_BGFILE)
  .then(function(bgdata){
    bgtheme = bgdata;
    video_fadefx_in(image_rgb(0,0,0), 1.0);
  });
}

export const intro_update = () => {
  if (!bgtheme) return;

  elapsed_time += timer_get_delta();
  background_update(bgtheme);

  if(elapsed_time >= INTRO_TIMEOUT) {
    if(video_fadefx_over()) {
      scenestack_pop();
      scenestack_push(storyboard_get_scene(SCENE_MENU));
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
  }
}

export const intro_render = () => {
  if (!bgtheme) return;

  const camera = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  background_render_bg(bgtheme, camera);
  background_render_fg(bgtheme, camera);
}

export const intro_release = () => {
  //bgtheme = background.unload(bgtheme);
  bgtheme = null;
}
