
//import { IF_NONE } from "./../core/global"
import { v2d_t, v2d_new } from "./../core/v2d"
import { timer_get_delta } from "./../core/timer"
import { video_clearDisplay, video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { image_destroy } from "./../core/image"
import { sprite_get_image, sprite_get_animation } from "./../core/sprite"
import { input_destroy, input_create_user, input_button_pressed, IB_LEFT, IB_RIGHT, IB_FIRE1, IB_FIRE3 } from "./../core/input"
import { sound_play } from "./../core/audio"
import { scenestack_pop } from "./../core/scene"
import { soundfactory_get } from "./../core/soundfactory"
import { actor_destroy, actor_render, actor_create, actor_change_animation } from "./../entities/actor"
import { font_t, font_render, font_create, font_destroy, font_set_text, font_set_width } from "./../entities/font"

const MAX_OPTIONS =  5;
const NO_OPTION   = -1;

let box:any = null;
let background:any = null;
let boxpos:v2d_t = null
let textfnt:font_t = null;
let optionfnt:any[] = [];
let icon:any = null;
let text:string = null;
let option:any[] = [];
let option_count = 0;
let current_option = NO_OPTION;
let fxfade_in = false;
let fxfade_out= false;
let input:any = null;

/**
 * confirmbox_init()
 * Initializes this scene. Please remember to
 * call confirmbox_alert() before starting this
 * scene!
 */
export const confirmbox_init = () => {
  let i;

  //background = image_create(video_get_backbuffer().width, video_get_backbuffer().height);
  //image_blit(video_get_backbuffer(), background, 0, 0, 0, 0, video_get_backbuffer().width, video_get_backbuffer().height);

  box = sprite_get_image(sprite_get_animation("SD_CONFIRMBOX", 0), 0);
  boxpos = v2d_new( (VIDEO_SCREEN_W-box.width)/2 , VIDEO_SCREEN_H );

  input = input_create_user();
  icon = actor_create();
  icon = actor_change_animation(icon, sprite_get_animation("SD_TITLEFOOT", 0));

  textfnt = font_create(8);
  font_set_text(textfnt, text);
  font_set_width(textfnt, 164);

  for(i=0; i<option_count; i++) {
    optionfnt[i] = [];
    optionfnt[i][0] = font_create(8);
    optionfnt[i][1] = font_create(8);
    font_set_text(optionfnt[i][0], option[i]);
    font_set_text(optionfnt[i][1], "<color=ffff00>%s</color>", option[i]);
  }

  current_option = 0;
  fxfade_in = true;
  fxfade_out = false;
}

/**
 * confirmbox_update()
 * Updates the scene
 */
export const confirmbox_update = () => {
  let i;
  const dt = timer_get_delta(), speed = 5*VIDEO_SCREEN_H;

  /* fade-in */
  if(fxfade_in) {
    if( boxpos.y <= (VIDEO_SCREEN_H-box.height)/2 )
      fxfade_in = false;
    else
      boxpos.y -= speed*dt;
  }

  /* fade-out */
  if(fxfade_out) {
    if( boxpos.y >= VIDEO_SCREEN_H ) {
      fxfade_out = false;
      scenestack_pop();
      return;
    }
    else
      boxpos.y += speed*dt;
  }

  /* positioning stuff */
  icon.position = v2d_new(boxpos.x + current_option*box.width/option_count + 10, boxpos.y + box.height*0.75 - 1);
  textfnt.position = v2d_new(boxpos.x + 10 , boxpos.y + 10);
  for(i=0; i<option_count; i++) {
    optionfnt[i][0].position = v2d_new(boxpos.x + i*box.width/option_count + 25, boxpos.y + box.height*0.75);
    optionfnt[i][1].position = optionfnt[i][0].position;
  }

  /* input */
  if(!fxfade_in && !fxfade_out) {
    if(input_button_pressed(input, IB_LEFT)) {
      /* left */
      sound_play( soundfactory_get("choose") );
      current_option = ( ((current_option-1)%option_count) + option_count )%option_count;
    }
    else if(input_button_pressed(input, IB_RIGHT)) {
      /* right */
      sound_play( soundfactory_get("choose") );
      current_option = (current_option+1)%option_count;
    }
    else if(input_button_pressed(input, IB_FIRE1) || input_button_pressed(input, IB_FIRE3)) {
      /* confirm */
      sound_play( soundfactory_get("select") );
      fxfade_out = true;
    }
  }
}

/**
 * confirmbox_render()
 * Renders the scene
 */
export const confirmbox_render = () => {
  let i, k;
  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  video_clearDisplay();

  //image_blit(background, video_get_backbuffer(), 0, 0, 0, 0, background.width, background.height);
  //image_draw(box, video_get_backbuffer(), boxpos.x, boxpos.y, IF_NONE);
  
  video_get_backbuffer().drawImage(
    box.data,
    box.sx, // The x coordinate where to start clipping
    box.sy, //  The y coordinate where to start clipping
    box.swidth, // The width of the clipped image
    box.sheight, // The height of the clipped image
    boxpos.x, // The x coordinate where to place the image on the canvas
    boxpos.y, // The y coordinate where to place the image on the canvas
    box.swidth, // The width of the image to use (stretch or reduce the image)
    box.sheight // The height of the image to use (stretch or reduce the image)
  );

  font_render(textfnt, cam);

  for(i=0; i<option_count; i++) {
    k = (i==current_option) ? 1 : 0;
    font_render(optionfnt[i][k], cam);
  }

  actor_render(icon, cam);
}

/**
 * confirmbox_release()
 * Releases the scene
 */
export const confirmbox_release = () => {
  let i;

  /*for(i=0; i<option_count; i++) {
    font_destroy(optionfnt[i][0]);
    font_destroy(optionfnt[i][1]);
  }*/

  actor_destroy(icon);
  input_destroy(input);
  font_destroy(textfnt);
  image_destroy(background);
}

/**
 * confirmbox_alert()
 * Configures this scene (call me before initializing this scene!)
 * PS: option2 may be NULL
 */
export const confirmbox_alert = (ptext:string, option1:string, option2:string) => {
  current_option = -1;
  text = ptext;
  option[0] = option1;

  if(option2) {
    option[1] = option2;
    option_count = 2;
  }
  else
    option_count = 1;
}

/**
 * confirmbox_selected_option()
 * Returns the selected option (1, 2, ..., n), or
 * 0 if nothing has been selected.
 * This must be called AFTER this scene
 * gets released
 */
export const confirmbox_selected_option = () => {
  if(current_option != NO_OPTION) {
    let ret = current_option + 1;
    current_option = NO_OPTION;
    return ret;
  }
  else {
    return 0; /* nothing */
  };
}   
