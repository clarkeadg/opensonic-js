import { v2d_new } from "./../core/v2d"
import { scenestack_pop } from "./../core/scene"
import { image_t, image_destroy, image_rgb } from "./../core/image"
import { video_fadefx_over, video_fadefx_out, video_clearDisplay, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { timer_get_delta } from "./../core/timer"
import { quest_abort } from "./quest"
import { font_t, font_create, font_set_text, font_render, font_destroy } from "./../entities/font"

/* private data */
let gameover_fnt:font_t[] = [];
let gameover_buf:image_t = null;
let gameover_timer = 0;

/**
 * gameover_init()
 * Initializes the game over screen
 */
export const gameover_init = () => {
  gameover_timer = 0;

  gameover_fnt[0] = font_create(7);
  gameover_fnt[0].position = v2d_new(-50, 112);
  font_set_text(gameover_fnt[0], "GAME");

  gameover_fnt[1] = font_create(7);
  gameover_fnt[1].position = v2d_new(298, 112);
  font_set_text(gameover_fnt[1], "OVER");

  //gameover_buf = image_create(video_get_backbuffer().width, video_get_backbuffer().height);
  //image_blit(video.get_backbuffer(), gameover_buf, 0, 0, 0, 0, gameover_buf.width, gameover_buf.height);
}

/**
 * gameover_update()
 * Updates the game over screen
 */
export const gameover_update = () => {
  const dt = timer_get_delta();

  /* timer */
  gameover_timer += dt;
  if(gameover_timer > 5) {
    if(video_fadefx_over()) {
      quest_abort();
      scenestack_pop();
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 2);
  }

  /* "game over" text */
  gameover_fnt[0].position.x += 200*dt;
  if(gameover_fnt[0].position.x > 80)
    gameover_fnt[0].position.x = 80;

  gameover_fnt[1].position.x -= 200*dt;
  if(gameover_fnt[1].position.x < 168)
    gameover_fnt[1].position.x = 168;
}

/**
 * gameover_render()
 * Renders the game over screen
 */
export const gameover_render = () => {
  video_clearDisplay();

  const v = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  //image_blit(gameover_buf, video_get_backbuffer(), 0, 0, 0, 0, gameover_buf.width, gameover_buf.height);
  font_render(gameover_fnt[0], v);
  font_render(gameover_fnt[1], v);
}

/**
 * gameover_release()
 * Releases the game over screen
 */
export const gameover_release = () => {
  image_destroy(gameover_buf);
  font_destroy(gameover_fnt[1]);
  font_destroy(gameover_fnt[0]);
  quest_abort();
}
