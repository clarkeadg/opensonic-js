
import { confirmbox_alert, confirmbox_selected_option } from "./confirmbox"
import { quest_abort } from "./quest"
import { PI } from "./../core/global"
import { scenestack_push, scenestack_pop } from "./../core/scene"
import { storyboard_get_scene, SCENE_CONFIRMBOX } from "./../core/storyboard"
import { v2d_new } from "./../core/v2d"
import { video_fadefx_over, video_fadefx_out, VIDEO_SCREEN_W, VIDEO_SCREEN_H, video_get_backbuffer } from "./../core/video"
import { music_resume } from "./../core/audio"
import { image_t, image_create, image_destroy, image_blit, image_draw, image_draw_scaled, image_rgb, IF_NONE } from "./../core/image"
import { input_t, input_create_user, input_button_pressed, input_button_up, input_destroy, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { lang_getstring } from "./../core/lang"
import { sprite_get_image, sprite_get_animation } from "./../core/sprite"
import { timer_get_delta } from "./../core/timer"

/* private data */
let pause_buf:HTMLImageElement = null;
let pause_input:input_t = null;
let pause_ready = false;
let pause_quit = false
let pause_timer = 0.0;

/**
 * pause_init()
 * Initializes the pause screen
 */
export const pause_init = function() {
  pause_input = input_create_user();
  pause_buf = new Image();
  pause_buf.src = video_get_backbuffer().canvas.toDataURL();
  pause_ready = false;
  pause_quit = false;
  pause_timer = 0;
  //image_blit(pause_buf, video_get_backbuffer(), 0, 0, 0, 0, pause_buf.width, pause_buf.height);
}

/**
 * pause_update()
 * Updates the pause screen
 */
export const pause_update = function() {
  /* quit */
  if(input_button_pressed(pause_input, IB_FIRE4)) {

    lang_getstring("CBOX_QUIT_QUESTION");
    lang_getstring("CBOX_QUIT_OPTION1");
    lang_getstring("CBOX_QUIT_OPTION2");
    //confirmbox_alert(op[0], op[1], op[2]);

    scenestack_push(storyboard_get_scene(SCENE_CONFIRMBOX));
    return;
  }

  if(1 == confirmbox_selected_option())
    pause_quit = true;

  if(pause_quit) {
    if(video_fadefx_over()) {
      scenestack_pop();
      scenestack_pop();
      quest_abort();
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
    return;
  }

  /* unpause */
  if(pause_ready) {
    if(input_button_pressed(pause_input, IB_FIRE3)) {
      music_resume();
      scenestack_pop();
      return;
    }
  }
  else {
    if(input_button_up(pause_input, IB_FIRE3))
        pause_ready = true;
  }
}

/**
 * pause_render()
 * Renders the pause screen
 */
export const pause_render = function() {
  let p = sprite_get_image(sprite_get_animation("SD_PAUSE", 0), 0);
  let scale = 1+0.5*Math.abs(Math.cos(PI/2*pause_timer));
  let pos = v2d_new((VIDEO_SCREEN_W-p.width)/2 - (scale-1)*p.width/2, (VIDEO_SCREEN_H-p.height)/2 - (scale-1)*p.height/2);

  image_blit(pause_buf, video_get_backbuffer(), 0, 0, 0, 0, pause_buf.width, pause_buf.height);
  image_draw_scaled(p, video_get_backbuffer(), ~~pos.x, ~~pos.y, v2d_new(scale,scale), IF_NONE);

  if(!pause_quit)
    pause_timer += timer_get_delta();
}

/**
 * pause_release()
 * Releases the pause screen
 */
export const pause_release = function() {
  //image_destroy(pause_buf);
  input_destroy(pause_input);
}
