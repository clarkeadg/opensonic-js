
import { INT_MAX, EPSILON, PI, IF_HFLIP } from "./../core/global"
import { v2d_new, v2d_add, v2d_subtract, v2d_rotate, v2d_multiply } from "./../core/v2d"
import { IB_FIRE1, IB_UP, IB_DOWN, IB_LEFT, IB_RIGHT, input_destroy, input_button_down } from "./../core/input"
import { image_rgb, image_rectfill, image_pixelperfect_collision } from "./../core/image"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H, VIDEO_SCALE } from "./../core/video"
import { timer_get_delta } from "./../core/timer"
import { sprite_get_image } from "./../core/sprite"
import { clip, bounding_box, swap, circular_collision } from "./../core/util"
import { BRK_NONE, BRK_OBSTACLE, BRK_CLOUD, BRICKBEHAVIOR_MAXARGS, BRB_DEFAULT, BRB_CIRCULAR, BRB_BREAKABLE, BRB_FALL, BRS_IDLE, BRS_DEAD, BRS_ACTIVE, BRICK_MAXVALUES, BRB_FALL_TIME } from "./brick"

const MAGIC_DIFF          = -2;
const SIDE_CORNERS_HEIGHT = 0.5;

/* private */
let floor_priority = true; /* default behavior: priority(floor) > priority(wall) */
let slope_priority = true; /* default behavior: priority(slope) > priority(floor) */
let is_leftwall_disabled = false;
let is_rightwall_disabled = false;
let is_floor_disabled = false;
let is_ceiling_disabled = false;

export const actor_create = () => {
  let act = {};

  act.spawn_point = v2d_new(0,0);
  act.position = v2d_new(act.spawn_point.x, act.spawn_point.y);
  act.angle = 0.0;
  act.speed = v2d_new(0,0);
  act.maxspeed = 0.0;
  act.acceleration = 0.0;
  act.jump_strength = 0.0;
  act.is_jumping = false;
  act.ignore_horizontal = false;
  act.input = null;

  act.animation = null;
  act.animation_frame = 0.0;
  act.animation_speed_factor = 1.0;
  act.mirror = false;
  act.visible = true;
  act.alpha = 1.0;
  act.hot_spot = v2d_new(0,0);

  act.carried_by = null;
  act.carry_offset = v2d_new(0,0);
  act.carrying = null;

  return act;
}

export const actor_destroy = (act) => {
  if(act.input)
    input_destroy(act.input);
  act = null;
}

export const actor_render = (act, camera_position) => {
  if (!camera_position || !act) return;

  let diff = MAGIC_DIFF;
  let img;
  let tmp;

  if(act.visible && act.animation) {

    /* update animation */
    act.animation_frame += (act.animation.fps * act.animation_speed_factor) * timer_get_delta();
    
    if (act.animation_frame > act.animation.frame_count-1) {
      if(act.animation.repeat) {
        act.animation_frame = 0;
      } else {
        act.animation_frame = act.animation.frame_count-1;
      }
    }

    /* render */
    tmp = act.position;
    img = actor_image(act);

    if (!img) return false;      

    if (act.mirror) {
      flipHorizontally(
        video_get_backbuffer(),
        parseInt((act.position.x-(camera_position.x-VIDEO_SCREEN_W/2)),10)
      );
    }

    let x = parseInt((act.position.x-(camera_position.x-VIDEO_SCREEN_W/2)),10);
    let y = parseInt((act.position.y-(camera_position.y-VIDEO_SCREEN_H/2)),10);
    let angle = act.mirror ? act.angle : -act.angle;
    
    if (act.angle) {
      video_get_backbuffer().translate(x, y);
      video_get_backbuffer().rotate(angle);
      video_get_backbuffer().translate(-x, -y);
    }

    video_get_backbuffer().drawImage(
      img.data,
      img.sx, // The x coordinate where to start clipping
      img.sy, //  The y coordinate where to start clipping
      img.swidth, // The width of the clipped image
      img.sheight, // The height of the clipped image
      parseInt((act.position.x-act.hot_spot.x-(camera_position.x-VIDEO_SCREEN_W/2)),10), // The x coordinate where to place the image on the canvas
      parseInt((act.position.y-act.hot_spot.y-(camera_position.y-VIDEO_SCREEN_H/2)),10), // The y coordinate where to place the image on the canvas
      img.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
      img.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
    );

    if (act.angle) {
      video_get_backbuffer().translate(x, y);
      video_get_backbuffer().rotate(-angle);
      video_get_backbuffer().translate(-x, -y);
    }         

    if (act.mirror) {
      flipHorizontally(
        video_get_backbuffer(),
        parseInt((act.position.x-(camera_position.x-VIDEO_SCREEN_W/2)),10)
      );
    }
  }
}

export const actor_render_repeat_xy = (act, camera_position, repeat_x, repeat_y) => {

  let i, j, w, h;
  let img;

  let final_pos = {};

  if(act.visible && act.animation) {
      
    /* update animation */
    if (isNaN(act.animation_frame)) {
      act.animation_frame = 0;
      act.animation.fps = 1;
    }
    
    act.animation_frame += (act.animation.fps * act.animation_speed_factor) * timer_get_delta();
    if(act.animation_frame > act.animation.frame_count-1) {
      if(act.animation.repeat)
        act.animation_frame = 0; //act.animation_frame % act.animation.frame_count;
      else
        act.animation_frame = act.animation.frame_count-1;
    }

    img = actor_image(act);
    if (!img) return false;

    final_pos.x = act.position.x%(repeat_x?img.width:INT_MAX) - act.hot_spot.x-(camera_position.x-VIDEO_SCREEN_W/2) - (repeat_x?img.width:0);
    final_pos.y = act.position.y%(repeat_y?img.height:INT_MAX) - act.hot_spot.y-(camera_position.y-VIDEO_SCREEN_H/2) - (repeat_y?img.height:0);

    /* render */
    w = repeat_x ? (VIDEO_SCREEN_W/img.width + 3) : 1;
    h = repeat_y ? (VIDEO_SCREEN_H/img.height + 3) : 1;
    for(i=0; i<w; i++) {
      for(j=0; j<h; j++) {
         video_get_backbuffer().drawImage(
          img.data,
          img.sx, // The x coordinate where to start clipping
          img.sy, //  The y coordinate where to start clipping
          img.swidth, // The width of the clipped image
          img.sheight, // The height of the clipped image
          final_pos.x + i*img.width, // The x coordinate where to place the image on the canvas
          final_pos.y + j*img.height, // The y coordinate where to place the image on the canvas
          img.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
          img.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
        );    
      }
    }      
  }
}

export const actor_move = (act, delta_space) => {
  if (!delta_space) delta_space = { x: 0, y: 0 };
  delta_space.x = delta_space.x || 0;
  delta_space.y = delta_space.y || 0;
  if(Math.abs(delta_space.x) < EPSILON) delta_space.x = 0;
  act.position.x += delta_space.x * Math.cos(act.angle) + delta_space.y * Math.sin(act.angle);
  act.position.y += delta_space.y * Math.cos(act.angle) - delta_space.x * Math.sin(act.angle);
}

/* animation */

export const actor_image = (act) => {
  return sprite_get_image(act.animation, parseInt(act.animation_frame,10));
}

export const actor_change_animation_frame = (act, frame) => {
  act.animation_frame = clip(frame, 0, act.animation.frame_count);
  return act;
}

export const actor_change_animation_speed_factor = (act, factor) => {
  act.animation_speed_factor = Math.max(0.0, factor);
  return act;
}

export const actor_change_animation = (act, anim) => {
  if (!act || !anim) return false;
  if(act.animation != anim) {
    act.animation = anim;
    act.hot_spot = anim.hot_spot;
    act.animation_frame = 0;
    act.animation_speed_factor = 1.0;
  }
  return act;
}

export const actor_animation_finished = (act) => {
  let frame = act.animation_frame + (act.animation.fps * act.animation_speed_factor) * timer_get_delta();
  return (!act.animation.repeat && frame > act.animation.frame_count-1);
}

/* collision detection */

export const actor_collision = (a, b) => {

  let j = 0;
  let right = 0;
  let corner = [];
  corner[0] = [];
  corner[1] = [];

  corner[0][0] = v2d_subtract(a.position, v2d_rotate(a.hot_spot, -a.angle)); // a's topleft 
  corner[0][1] = v2d_add( corner[0][0] , v2d_rotate(v2d_new(actor_image(a).width, 0), -a.angle) ); // a's topright 
  corner[0][2] = v2d_add( corner[0][0] , v2d_rotate(v2d_new(actor_image(a).width, actor_image(a).height), -a.angle) ); // a's bottomright 
  corner[0][3] = v2d_add( corner[0][0] , v2d_rotate(v2d_new(0, actor_image(a).height), -a.angle) ); // a's bottomleft 
  corner[1][0] = v2d_subtract(b.position, v2d_rotate(b.hot_spot, 0)); // b's topleft 
  corner[1][1] = v2d_add( corner[1][0] , v2d_rotate(v2d_new(actor_image(b).width, 0), 0) ); // b's topright 
  corner[1][2] = v2d_add( corner[1][0] , v2d_rotate(v2d_new(actor_image(b).width, actor_image(b).height), 0) ); // b's bottomright 
  corner[1][3] = v2d_add( corner[1][0] , v2d_rotate(v2d_new(0, actor_image(b).height), 0) ); // b's bottomleft 
  right += Math.abs(a.angle)<EPSILON||Math.abs(a.angle-PI/2)<EPSILON||Math.abs(a.angle-PI)<EPSILON||Math.abs(a.angle-3*PI/2)<EPSILON;
  right += Math.abs(0)<EPSILON||Math.abs(0-PI/2)<EPSILON||Math.abs(0-PI)<EPSILON||Math.abs(0-3*PI/2)<EPSILON;

  //console.log(right)

  if(right) {
    let r = [];
    let swaped = [];        
    for(j=0; j<2; j++) {
      r[j] = [];
      r[j][0] = Math.min(corner[j][0].x, corner[j][1].x);
      r[j][1] = Math.min(corner[j][0].y, corner[j][1].y);
      r[j][2] = Math.max(corner[j][2].x, corner[j][3].x);
      r[j][3] = Math.max(corner[j][2].y, corner[j][3].y);
      if(r[j][0] > r[j][2]) {
        swaped = swap(r[j][0], r[j][2]);
        r[j][0] = swaped[0];
        r[j][2] = swaped[1]
      }
      if(r[j][1] > r[j][3]) {
        swaped = swap(r[j][1], r[j][3]);
        r[j][1] = swaped[0];
        r[j][3] = swaped[1];
      }
    }
    return bounding_box(r[0],r[1]);
  }
  else {
    let center = [];
    let radius = [ Math.max(actor_image(a).width,actor_image(a).height) , Math.max(actor_image(b).width,actor_image(b).height) ];
    //console.log(radius)
    for(j=0; j<2; j++)
        center[j] = v2d_multiply(v2d_add(corner[j][0], corner[j][2]), 0.5);
    return circular_collision(center[0], radius[0], center[1], radius[1]);
  }
}

export const actor_orientedbox_collision = (a, b) => {
  let a_pos = {}, b_pos = {};
  let a_size = {}, b_size = {};
  let a_spot = [];
  let b_spot = []; // rotated spots

  a_spot = calculate_rotated_boundingbox(this, a, a_spot);
  b_spot = calculate_rotated_boundingbox(this, b, b_spot);

  a_pos.x = Math.min(a_spot[0].x, Math.min(a_spot[1].x, Math.min(a_spot[2].x, a_spot[3].x)));
  a_pos.y = Math.min(a_spot[0].y, Math.min(a_spot[1].y, Math.min(a_spot[2].y, a_spot[3].y)));
  b_pos.x = Math.min(b_spot[0].x, Math.min(b_spot[1].x, Math.min(b_spot[2].x, b_spot[3].x)));
  b_pos.y = Math.min(b_spot[0].y, Math.min(b_spot[1].y, Math.min(b_spot[2].y, b_spot[3].y)));

  a_size.x = Math.max(a_spot[0].x, Math.max(a_spot[1].x, Math.max(a_spot[2].x, a_spot[3].x))) - a_pos.x;
  a_size.y = Math.max(a_spot[0].y, Math.max(a_spot[1].y, Math.max(a_spot[2].y, a_spot[3].y))) - a_pos.y;
  b_size.x = Math.max(b_spot[0].x, Math.max(b_spot[1].x, Math.max(b_spot[2].x, b_spot[3].x))) - b_pos.x;
  b_size.y = Math.max(b_spot[0].y, Math.max(b_spot[1].y, Math.max(b_spot[2].y, b_spot[3].y))) - b_pos.y;

  if(a_pos.x + a_size.x >= b_pos.x && a_pos.x <= b_pos.x + b_size.x) {
    if(a_pos.y + a_size.y >= b_pos.y && a_pos.y <= b_pos.y + b_size.y)
      return true;
  }

  return false;
}

export const actor_pixelperfect_collision = (a, b) => {
  if(Math.abs(a.angle) < EPSILON && Math.abs(b.angle) < EPSILON) {
    if(actor_collision(a, b)) {
      let x1, y1, x2, y2;

      x1 = parseInt((a.position.x - a.hot_spot.x),10);
      y1 = parseInt((a.position.y - a.hot_spot.y),10);
      x2 = parseInt((b.position.x - b.hot_spot.x),10);
      y2 = parseInt((b.position.y - b.hot_spot.y),10);

      return image_pixelperfect_collision(actor_image(a), actor_image(b), x1, y1, x2, y2);
    }
    else
      return false;
  }
  else {
    if(actor_orientedbox_collision(a, b)) {
      /*var image_a;
      var image_b;
      var size_a, size_b, pos_a, pos_b;
      var a_spot = [];
      var b_spot = []; // rotated spots 
      var ac, bc; // rotation spot 
      var collided;

      a_spot = calculate_rotated_boundingbox(this, a, a_spot);
      b_spot = calculate_rotated_boundingbox(this, b, b_spot);

      pos_a.x = Math.min(a_spot[0].x, Math.min(a_spot[1].x, Math.min(a_spot[2].x, a_spot[3].x)));
      pos_a.y = Math.min(a_spot[0].y, Math.min(a_spot[1].y, Math.min(a_spot[2].y, a_spot[3].y)));
      pos_b.x = Math.min(b_spot[0].x, Math.min(b_spot[1].x, Math.min(b_spot[2].x, b_spot[3].x)));
      pos_b.y = Math.min(b_spot[0].y, Math.min(b_spot[1].y, Math.min(b_spot[2].y, b_spot[3].y)));

      size_a.x = Math.max(a_spot[0].x, Math.max(a_spot[1].x, Math.max(a_spot[2].x, a_spot[3].x))) - pos_a.x;
      size_a.y = Math.max(a_spot[0].y, Math.max(a_spot[1].y, Math.max(a_spot[2].y, a_spot[3].y))) - pos_a.y;
      size_b.x = Math.max(b_spot[0].x, Math.max(b_spot[1].x, Math.max(b_spot[2].x, b_spot[3].x))) - pos_b.x;
      size_b.y = Math.max(b_spot[0].y, Math.max(b_spot[1].y, Math.max(b_spot[2].y, b_spot[3].y))) - pos_b.y;

      ac = v2d_add(v2d_subtract(a_spot[0], pos_a), v2d_rotate(a.hot_spot, -a.angle));
      bc = v2d_add(v2d_subtract(b_spot[0], pos_b), v2d_rotate(b.hot_spot, -b.angle));

      image_a = image_create(size_a.x, size_a.y);
      image_b = image_create(size_b.x, size_b.y);
      image_clear(image_a, video_get_maskcolor());
      image_clear(image_b, video_get_maskcolor());

      image_draw_rotated(actor_image(a), image_a, ac.x, ac.y, parseInt(a.hot_spot.x,10), parseInt(a.hot_spot.y,10), a.angle, a.mirror);
      image_draw_rotated(actor_image(b), image_b, bc.x, bc.y, parseInt(b.hot_spot.x,10), parseInt(b.hot_spot.y,10), b.angle, b.mirror);

      collided = actor_image_pixelperfect_collision(image_a, image_b, pos_a.x, pos_a.y, pos_b.x, pos_b.y);

      image_destroy(image_a);
      image_destroy(image_b);
      return collided;*/
      return true;
    }
    else
      return false;
  }
}

export const actor_brick_collision = (act, brk) => {
  let topleft = v2d_subtract(act.position, v2d_rotate(act.hot_spot, act.angle));
  let bottomright = v2d_add( topleft, v2d_rotate(v2d_new(actor_image(act).w, actor_image(act).h), act.angle) );
  let a = [ topleft.x, topleft.y, bottomright.x, bottomright.y ];
  let b = [ brk.x, brk.y, (brk.x+brk.brick_ref.image.width), (brk.y+brk.brick_ref.image.height) ];

  return bounding_box(a,b);
}

/* sensors */

export const actor_render_corners = (act, sqrsize, diff, camera_position) => {
  let c = [];
  let offset = v2d_subtract(camera_position, v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2));
  let frame_width = actor_image(act).width;
  let frame_height = actor_image(act).height;

  let feet       = v2d_subtract(act.position, offset);
  let vup        = v2d_add ( feet , v2d_rotate( v2d_new(0, -frame_height+diff), -act.angle) );
  let vdown      = v2d_add ( feet , v2d_rotate( v2d_new(0, -diff), -act.angle) ); 
  let vleft      = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -frame_height*SIDE_CORNERS_HEIGHT), -act.angle) );
  let vright     = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -frame_height*SIDE_CORNERS_HEIGHT), -act.angle) );
  let vupleft    = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -frame_height+diff), -act.angle) );
  let vupright   = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -frame_height+diff), -act.angle) );
  let vdownleft  = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -diff), -act.angle) );
  let vdownright = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -diff), -act.angle) );

  let cd_up         = [ vup.x-sqrsize , vup.y-sqrsize , vup.x+sqrsize , vup.y+sqrsize ];
  let cd_down       = [ vdown.x-sqrsize , vdown.y-sqrsize , vdown.x+sqrsize , vdown.y+sqrsize ];
  let cd_left       = [ vleft.x-sqrsize , vleft.y-sqrsize , vleft.x+sqrsize , vleft.y+sqrsize ];
  let cd_right      = [ vright.x-sqrsize , vright.y-sqrsize , vright.x+sqrsize , vright.y+sqrsize ];
  let cd_upleft     = [ vupleft.x-sqrsize , vupleft.y-sqrsize , vupleft.x+sqrsize , vupleft.y+sqrsize ];
  let cd_upright    = [ vupright.x-sqrsize , vupright.y-sqrsize , vupright.x+sqrsize , vupright.y+sqrsize ];
  let cd_downleft   = [ vdownleft.x-sqrsize , vdownleft.y-sqrsize , vdownleft.x+sqrsize , vdownleft.y+sqrsize ];
  let cd_downright  = [ vdownright.x-sqrsize , vdownright.y-sqrsize , vdownright.x+sqrsize , vdownright.y+sqrsize ];

  c[0] = image_rgb(255,255,255);
  c[1] = image_rgb(0,128,255);

  image_rectfill(video_get_backbuffer(), cd_up[0], cd_up[1], cd_up[2], cd_up[3], c[0]);
  image_rectfill(video_get_backbuffer(), cd_down[0], cd_down[1], cd_down[2], cd_down[3], c[0]);
  image_rectfill(video_get_backbuffer(), cd_left[0], cd_left[1], cd_left[2], cd_left[3], c[0]);
  image_rectfill(video_get_backbuffer(), cd_right[0], cd_right[1], cd_right[2], cd_right[3], c[0]);
  image_rectfill(video_get_backbuffer(), cd_downleft[0], cd_downleft[1], cd_downleft[2], cd_downleft[3], image.rgb(0,255,0));
  image_rectfill(video_get_backbuffer(), cd_downright[0], cd_downright[1], cd_downright[2], cd_downright[3], image.rgb(255,0,0));
  image_rectfill(video_get_backbuffer(), cd_upright[0], cd_upright[1], cd_upright[2], cd_upright[3], c[1]);
  image_rectfill(video_get_backbuffer(), cd_upleft[0], cd_upleft[1], cd_upleft[2], cd_upleft[3], c[1]);
}

export const actor_corners = (act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft) => {
  let frame_width = actor_image(act).width;
  let frame_height = actor_image(act).height;

  let feet       = act.position;
  let vup        = v2d_add ( feet , v2d_rotate( v2d_new(0, -frame_height+diff), -act.angle) );
  let vdown      = v2d_add ( feet , v2d_rotate( v2d_new(0, -diff), -act.angle) ); 
  let vleft      = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -frame_height*SIDE_CORNERS_HEIGHT), -act.angle) );
  let vright     = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -frame_height*SIDE_CORNERS_HEIGHT), -act.angle) );
  let vupleft    = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -frame_height+diff), -act.angle) );
  let vupright   = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -frame_height+diff), -act.angle) );
  let vdownleft  = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width/2+diff, -diff), -act.angle) );
  let vdownright = v2d_add ( feet , v2d_rotate( v2d_new(frame_width/2-diff, -diff), -act.angle) );

  return actor_corners_ex(act, sqrsize, vup, vupright, vright, vdownright, vdown, vdownleft, vleft, vupleft, brick_list, up, upright, right, downright, down, downleft, left, upleft);
}

export const actor_corners_ex = (act, sqrsize, vup, vupright, vright, vdownright, vdown, vdownleft, vleft, vupleft, brick_list, up, upright, right, downright, down, downleft, left, upleft) => {
  let cd_up         = [ vup.x-sqrsize , vup.y-sqrsize , vup.x+sqrsize , vup.y+sqrsize ];
  let cd_down       = [ vdown.x-sqrsize , vdown.y-sqrsize , vdown.x+sqrsize , vdown.y+sqrsize ];
  let cd_left       = [ vleft.x-sqrsize , vleft.y-sqrsize , vleft.x+sqrsize , vleft.y+sqrsize ];
  let cd_right      = [ vright.x-sqrsize , vright.y-sqrsize , vright.x+sqrsize , vright.y+sqrsize ];
  let cd_upleft     = [ vupleft.x-sqrsize , vupleft.y-sqrsize , vupleft.x+sqrsize , vupleft.y+sqrsize ];
  let cd_upright    = [ vupright.x-sqrsize , vupright.y-sqrsize , vupright.x+sqrsize , vupright.y+sqrsize ];
  let cd_downleft   = [ vdownleft.x-sqrsize , vdownleft.y-sqrsize , vdownleft.x+sqrsize , vdownleft.y+sqrsize ];
  let cd_downright  = [ vdownright.x-sqrsize , vdownright.y-sqrsize , vdownright.x+sqrsize , vdownright.y+sqrsize ];

  if (brick_list) {

    if(vup) up = brick_at(brick_list, cd_up);
    if(vdown) down = brick_at(brick_list, cd_down);
    if(vleft) left = brick_at(brick_list, cd_left);
    if(vright) right = brick_at(brick_list, cd_right);
    if(vupleft) upleft = brick_at(brick_list, cd_upleft);
    if(vupright) upright = brick_at(brick_list, cd_upright);
    if(vdownleft) downleft = brick_at(brick_list, cd_downleft);
    if(vdownright) downright = brick_at(brick_list, cd_downright);
  }

  return {
    up: up,
    down: down,
    left: left,
    right: right,
    upleft: upleft,
    upright: upright,
    downleft: downleft,
    downright: downright
  };      
}

export const actor_corners_set_floor_priority = (floor) => {
  floor_priority = floor;
}

export const actor_corners_restore_floor_priority = () => {
  actor_corners_set_floor_priority(true);
}

export const actor_corners_set_slope_priority = (slope) => {
  slope_priority = slope;
}

export const actor_corners_restore_slope_priority = () => {
  actor_corners_set_slope_priority(true);
}

export const actor_corners_disable_detection = (disable_leftwall, disable_rightwall, disable_floor, disable_ceiling) => {
  is_leftwall_disabled = disable_leftwall;
  is_rightwall_disabled = disable_rightwall;
  is_floor_disabled = disable_floor;
  is_ceiling_disabled = disable_ceiling;
}

export const actor_get_collision_detectors = (act, diff, up, upright, right, downright, down, downleft, left, upleft) => {
  let frame_width = actor_image(act).width, frame_height = actor_image(act).height;
  let slope = !((Math.abs(act.angle)<EPSILON)||(Math.abs(act.angle-PI/2)<EPSILON)||(Math.abs(act.angle-PI)<EPSILON)||(Math.abs(act.angle-3*PI/2)<EPSILON));
  let feet = act.position;
  let top, middle, lateral;

  // slope hack 
  if(!slope) { top = 0.7; middle = 0.5; lateral = 0.25; }
  else       { top = 1.0; middle = 0.7; lateral = 0.25; }

  // calculating the collision detectors 
  up        = v2d_add ( feet , v2d_rotate( v2d_new(0, -frame_height*top+diff), -act.angle) );
  down      = v2d_add ( feet , v2d_rotate( v2d_new(0, -diff), -act.angle) ); 
  left      = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -frame_height*middle), -act.angle) );
  right     = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -frame_height*middle), -act.angle) );
  upleft    = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -frame_height*top+diff), -act.angle) );
  upright   = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -frame_height*top+diff), -act.angle) );
  downleft  = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -diff), -act.angle) );
  downright = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -diff), -act.angle) );
  return {
    up: up,
    down: down,
    left: left,
    right: right,
    upleft: upleft,
    upright: upright,
    downleft: downleft,
    downright: downright
  };
}

/* platform movement routines */

export const actor_handle_clouds = (act, diff, up, upright, right, downright, down, downleft, left, upleft) => {
  let i;
  let cloud_off = [ up, upright, right, left, upleft ];

  /* bricks: laterals and top */
  for(i=0; i<cloud_off.length; i++) {
    /* forget bricks */
    let brk = cloud_off[i];
    if(brk && brk.brick_ref && brk.brick_ref.property == BRK_CLOUD) {
      brk = null;
      cloud_off[i] = brk;
    }
  }

  /* bricks: down, downleft, downright */
  if(down && down.brick_ref && down.brick_ref.property == BRK_CLOUD) {
    let offset = Math.min(15, down.brick_ref.image.height/3);
    if(!(act.speed.y >= 0 && act.position.y < (down.y+diff+1)+offset)) {
      /* forget bricks */
      if(downleft && downleft == down)
        downleft = null;
      if(downright && downright == down)
        downright = null;
      down = null;
    }
  }

  return {
    up: cloud_off[0],
    upright: cloud_off[1],
    right: cloud_off[2],
    left: cloud_off[3],
    upleft: cloud_off[4],
    downright: downright,
    down: down,
    downleft: downleft
  };
}

export const actor_handle_collision_detectors = (act, brick_list, up, upright, right, downright, down, downleft, left, upleft, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft) => {
  let sqrsize = 2;
  return actor_corners_ex(act, sqrsize, up, upright, right, downright, down, downleft, left, upleft, brick_list, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft);
}

export const actor_handle_carrying = (act, brick_down) => {
  const dt = timer_get_delta();

  /* I'm being carried */
  if(act.carried_by != null) {
    let car = act.carried_by;

    /* what should I do? */
    if((brick_down && brick_down.brick_ref.angle == 0 && parseInt(car.speed.y,10) >= 5)) {
      /* put me down! */
      act.position = v2d_new(act.carried_by.position.x, act.carried_by.position.y);
      act.carried_by.carrying = null;
      act.carried_by = null;
    }
    else {
      /* carry me! */
      act.speed = v2d_new(0,0);
      act.mirror = car.mirror;
      act.angle = 0;
      act.position = v2d_subtract(v2d_add(car.position, v2d_multiply(car.speed,dt)), act.carry_offset);
    }
  }
}

export const actor_handle_wall_collision = (act, feet, left, right, brick_left, brick_right) => {
  /* right wall */
  if(brick_right) {
    if(brick_right.brick_ref.angle % 90 == 0 && (act.speed.x > EPSILON || right.x > brick_right.x)) {
      act.speed.x = 0;
      act.position.x = brick_right.x + (feet.x-right.x);
    }
  }

  /* left wall */
  if(brick_left) {
    if(brick_left.brick_ref.angle % 90 == 0 && (act.speed.x < -EPSILON || left.x < brick_left.x+brick_left.brick_ref.image.width)) {
      act.speed.x = 0;
      act.position.x = (brick_left.x+brick_left.brick_ref.image.width) + (feet.x-left.x);
    }
  }
}

export const actor_handle_ceil_collision = (act, feet, up, brick_up) => {
  if(brick_up && brick_up.brick_ref.angle % 90 == 0 && act.speed.y < -EPSILON) {
    act.position.y = (brick_up.y+brick_up.brick_ref.image.height) + (feet.y-up.y);
    act.speed.y = 10;
  }
}

export const actor_handle_floor_collision = (act, diff, natural_angle, ds, feet, friction, brick_downleft, brick_down, brick_downright) => {
  const dt = timer_get_delta();
  let ang;

  if(brick_down && !act.is_jumping) {
    ang = brick_down.brick_ref.angle;
    act.speed.y = ds.y = 0;
    act.angle = ang * PI / 180.0;

    // 0 floor 
    if(ang == 0) {
      //var mov = level.brick_move_actor(brick_down, act); // moveable platforms I 
      //feet.y = brick_down.y;
      //friction = 0;
      //if(mov.y > EPSILON) // if the moveable brick is going down... 
      //  ds.y += mov.y*dt;
      //else
        act.position.y = feet.y+diff;
    }

    // (0-90) slope 
    else if(ang > 0 && ang < 90) {
      feet.y = brick_down.y + brick_down.brick_ref.image.height - (act.position.x-brick_down.x)*Math.tan(act.angle);
      act.position.y = feet.y+diff;
      if(!(act.mirror & IF_HFLIP))
        friction = 0.2;
    }

    // 90 wall 
    else if(ang == 90) {
      if(Math.abs(act.speed.x) > 5) {
        let myang = brick_downright ? brick_downright.brick_ref.angle : -1;
        if(brick_downright && (myang >= ang && myang < ang+90)) {
          feet.y = brick_down.x;
          act.position.x = feet.y+diff;
        }
        else {
          act.angle = natural_angle;
          actor_move(act, v2d_new(6.5*diff, 0));
          act.is_jumping = true;
          act.speed = v2d_new(0, -0.7*Math.abs(act.speed.x));
        }
      }
      else {
        act.angle = natural_angle;
        actor_move(act, v2d_new(5*diff, 0));
        act.is_jumping = true;
        act.ignore_horizontal = false;
      }
      if(!(act.mirror & IF_HFLIP))
        friction = 1.5;
    }

    // (90-180) slope 
    else if(ang > 90 && ang < 180) {
      if(Math.abs(act.speed.x) > 5) {
        feet.y = brick_down.y - (act.position.x-brick_down.x)*Math.tan(act.angle);
        act.position.y = feet.y-diff;
      }
      else {
        act.angle = natural_angle;
        actor_move(act, v2d_new(0, -15*diff));
        act.is_jumping = true;
      }
      friction = 1.5;
    }

    // 180 ceil 
    else if(ang == 180) {
      if( (act.speed.x > 5 && !(act.mirror & IF_HFLIP)) || (act.speed.x < -5 && act.mirror & IF_HFLIP) ) {
        feet.y = brick_down.y + brick_down.brick_ref.image.height;
        act.position.y = feet.y-diff;
      }
      else {
        act.angle = natural_angle;
        actor_move(act, v2d_new(0, -20*diff));
        act.is_jumping = true;
        act.speed.x = 0;
      }
      friction = 1.2;
    }

    // (180-270) slope 
    else if(ang > 180 && ang < 270) {
      if(Math.abs(act.speed.x) > 5) {
        feet.y = brick_down.y + brick_down.brick_ref.image.height - (act.position.x-brick_down.x)*Math.tan(act.angle);
        act.position.y = feet.y-diff;
      }
      else {
        act.angle = natural_angle;
        actor_move(act, v2d_new(0, -15*diff));
        act.is_jumping = true;
      }
      friction = 1.5;
    }

    // 270 wall 
    else if(ang == 270) {
      if(Math.abs(act.speed.x) > 5) {
        let myang = brick_downleft ? brick_downleft.brick_ref.angle : -1;
        if(brick_downleft && (myang > ang-90 && myang <= ang)) {
          feet.y = brick_down.x + brick_down.brick_ref.image.width;
          act.position.x = feet.y-diff;
        }
        else {
          act.angle = natural_angle;
          actor_move(act, v2d_new(-6.5*diff, 0));
          act.is_jumping = true;
          act.speed = v2d_new(0, -0.7*Math.abs(act.speed.x));            
        }

      }
      else {
        act.angle = natural_angle;
        actor_move(act, v2d_new(-5*diff, 0));
        act.is_jumping = true;
        act.ignore_horizontal = false;
      }
      if(act.mirror & IF_HFLIP)
        friction = 1.5;
    }

    // (270-360) slope 
    else if(ang > 270 && ang < 360) {
      feet.y = brick_down.y - (act.position.x-brick_down.x)*Math.tan(act.angle);
      act.position.y = feet.y+diff;
      if(act.mirror & IF_HFLIP)
        friction = 0.2;
    }
  }
}

export const actor_handle_slopes = (act, brick_down) => {
  let ang = brick_down.brick_ref.angle;
  const dt = timer_get_delta();
  let mytan, factor;

  if(!act.is_jumping) {
    if(ang > 0 && ang < 90) {
      mytan = Math.min(1, Math.tan( ang*PI/180.0 ));
      if(Math.abs(act.speed.y) > EPSILON)
        act.speed.x = -3*mytan*act.speed.y;
      else {
        factor = (!(act.mirror & IF_HFLIP) ? 0.8 : 2.0) * mytan;
        act.speed.x = Math.max(act.speed.x - factor*act.acceleration*dt, -act.maxspeed);
      }
    }
    else if(ang > 270 && ang < 360) {
      mytan = Math.min(1, -Math.tan( ang*PI/180.0 ));
      if(Math.abs(act.speed.y) > EPSILON)
        act.speed.x = 3*mytan*act.speed.y;
      else {
        factor = ((act.mirror & IF_HFLIP) ? 0.8 : 2.0) * mytan;
        act.speed.x = Math.min(act.speed.x + factor*act.acceleration*dt, act.maxspeed);
      }
    }
  }
}

export const actor_handle_jumping = (act, diff, natural_angle, brick_down, brick_up) => {
  let ang = brick_down.brick_ref.angle;

  if(input_button_down(act.input, IB_FIRE1) && !input_button_down(act.input, IB_DOWN) && !brick_up) {
    act.angle = natural_angle;
    act.is_jumping = true;
    if(ang == 0) {
      act.speed.y = -act.jump_strength;
    }
    else if(ang > 0 && ang < 90) {
      act.speed.x = Math.min(act.speed.x, -0.7*act.jump_strength);
      act.speed.y = -0.7*act.jump_strength;
    }
    else if(ang == 90) {
      actor.move(act, v2d_new(20*diff, 0));
      act.speed.x = Math.min(act.speed.x, -act.jump_strength);
      act.speed.y = -act.jump_strength/2;
    }
    else if(ang > 90 && ang < 180) {
      actor.move(act, v2d_new(0, -20*diff));
      act.speed.x = Math.min(act.speed.x, -0.7*act.jump_strength);
      act.speed.y = act.jump_strength;
    }
    else if(ang == 180) {
      actor.move(act, v2d_new(0, -20*diff));
      act.speed.x *= -1;
      act.speed.y = act.jump_strength;
    }
    else if(ang > 180 && ang < 270) {
      actor.move(act, v2d_new(0, -20*diff));
      act.speed.x = Math.max(act.speed.x, 0.7*act.jump_strength);
      act.speed.y = act.jump_strength;
    }
    else if(ang == 270) {
      actor.move(act, v2d_new(-20*diff, 0));
      act.speed.x = Math.max(act.speed.x, act.jump_strength);
      act.speed.y = -act.jump_strength/2;
    }
    else if(ang > 270 && ang < 360) {
      act.speed.x = Math.max(act.speed.x, 0.7*act.jump_strength);
      act.speed.y = -0.7*act.jump_strength;
    }
  }
}

export const actor_handle_acceleration = (act, friction, brick_down) => {
  const dt = timer_get_delta();

  if(input_button_down(act.input, IB_LEFT) && !input_button_down(act.input, IB_RIGHT)) {
    if(!act.ignore_horizontal && !input_button_down(act.input, IB_DOWN)) {
      act.speed.x = Math.max(act.speed.x - (1.0-friction)*act.acceleration*dt, -act.maxspeed);
      act.mirror = IF_HFLIP;
    }
  }
  else if(input_button_down(act.input, IB_RIGHT) && !input_button_down(act.input, IB_LEFT)) {
    if(!act.ignore_horizontal && !input_button_down(act.input, IB_DOWN)) {
      act.speed.x = Math.min(act.speed.x + (1.0-friction)*act.acceleration*dt, act.maxspeed);
      act.mirror = IF_NONE;
    }
  }
  else if(brick_down){
    let signal = 0;
    let ang = brick_down.brick_ref.angle;
    let factor;
    
    /* deceleration factor */
    factor = 1.0;

    /* deceleration */
    if(ang % 90 == 0) {
      if( (ang==90 && (act.mirror&IF_HFLIP) && act.speed.x < 0) || ((ang==270) && !(act.mirror&IF_HFLIP) && act.speed.x > 0) ) {
        if(act.speed.x > EPSILON) signal = 1;
        else if(-act.speed.x > EPSILON) signal = -1;
        else signal = 0;
      }
      else {
        if(act.speed.x > EPSILON) signal = -1;
        else if(-act.speed.x > EPSILON) signal = 1;
        else signal = 0;
      }
    }
    else if((ang > 90 && ang < 180) || (ang > 180 && ang < 270)){
      if(act.speed.x > EPSILON) signal = -1;
      else if(-act.speed.x > EPSILON) signal = 1;
      else signal = 0;
    }

    act.speed.x += signal*factor*act.acceleration*dt;
  }
}

/* pre-defined movement routines */

export const actor_platform_movement = (act, brick_list, gravity) => {
  let ds = v2d_new(0,0); // return value 
  const dt = timer_get_delta(); // delta_time 
  let natural_angle = 0; // default angle (gravity) 
  let max_y_speed = 480, friction = 0, gravity_factor = 1.0; // generic modifiers 
  let diff = MAGIC_DIFF; // magic hack 
  let feet = act.position; // actor's feet 
  let up, upright, right, downright, down, downleft, left, upleft; // collision detectors (CDs) 
  let brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft; // bricks detected by the CDs 

  // actor's collision detectors 
  let corners = actor_get_collision_detectors(act, diff, up, upright, right, downright, down, downleft, left, upleft);
  //console.log(corners)
  up = corners.up;
  upright = corners.upright;
  right = corners.right;
  downright = corners.downright;
  down = corners.down;
  downleft = corners.downleft;
  left = corners.left;
  upleft = corners.upleft;

  corners = actor_handle_collision_detectors(act, brick_list, up, upright, right, downright, down, downleft, left, upleft, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft);
  //console.log(corners)
  brick_up = corners.up;
  brick_upright = corners.upright;
  brick_right = corners.right;
  brick_downright = corners.downright;
  brick_down = corners.down;
  brick_downleft = corners.downleft;
  brick_left = corners.left;
  brick_upleft = corners.upleft;

  // clouds 
  let cloudBricks = actor_handle_clouds(act, diff, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft);
  brick_up = cloudBricks.up;
  brick_upright = cloudBricks.upright;
  brick_right = cloudBricks.right;
  brick_left = cloudBricks.left;
  brick_upleft = cloudBricks.upleft;
  brick_down = cloudBricks.down;
  brick_downleft = cloudBricks.downleft;
  brick_downright = cloudBricks.downright;

  // carrying characters 
  actor_handle_carrying(act, brick_down);
  if(act.carried_by != null)
      return v2d_new(0,0);

  // wall collisions 
  actor_handle_wall_collision(act, feet, left, right, brick_left, brick_right);

  // y-axis logic 
  if(brick_down) {
    act.is_jumping = false;
    act.ignore_horizontal = false;
    actor_handle_jumping(act, diff, natural_angle, brick_down, brick_up);
    //actor_handle_slopes(act, brick_down);
  }
  else
    act.angle = natural_angle;

  // y-axis movement 
  ds.y = (Math.abs(act.speed.y) > EPSILON) ? act.speed.y*dt + 0.5*(gravity*gravity_factor)*(dt*dt) : 0;
  act.speed.y = Math.min(act.speed.y + (gravity*gravity_factor)*dt, max_y_speed);

  // ceiling collision 
  // do not change this! it broke sonic's collision when blink so he flew through walls!
  // also stops animals from moving if ds = actor_handle_ceil_collison
  actor_handle_ceil_collision(act, feet, up, brick_up);

  // floor collision 
  actor_handle_floor_collision(act, diff, natural_angle, ds, feet, friction, brick_downleft, brick_down, brick_downright);

  // x-axis movement 
  ds.x = (Math.abs(act.speed.x) > EPSILON) ? act.speed.x*dt + 0.5*((1.0-friction)*act.acceleration)*(dt*dt) : 0;
  actor_handle_acceleration(act, friction, brick_down);

  // final adjustments... 
  if(Math.abs(act.speed.x) < EPSILON) act.speed.x = ds.x = 0;
  //ds.x += level.brick_move_actor(brick_down,act).x*dt;
  return ds;
}

export const actor_particle_movement = (act, gravity) => {
  const dt = timer_get_delta();
  let ds = v2d_new(0,0);

  /* x-axis */
  ds.x = act.speed.x*dt;

  /* y-axis */
  ds.y = act.speed.y*dt + 0.5*gravity*dt*dt;
  act.speed.y += gravity*dt;

  /* done! */
  return ds;
}

export const actor_eightdirections_movement = (act) => {
  const dt = timer_get_delta();
  let ds = v2d_new(0,0);

  // input device 
  if(act.input) {
    // x-speed 
    if(input_button_down(act.input, IB_RIGHT) && !input_button_down(act.input, IB_LEFT))
      act.speed.x = Math.min(act.speed.x + act.acceleration*dt, act.maxspeed);
    if(input_button_down(act.input, IB_LEFT) && !input_button_down(act.input, IB_RIGHT))
      act.speed.x = Math.max(act.speed.x - act.acceleration*dt, -act.maxspeed);
    if(!input_button_down(act.input, IB_LEFT) && !input_button_down(act.input, IB_RIGHT) && Math.abs(act.speed.x) > EPSILON) {
      if(act.speed.x > 0)
        act.speed.x = Math.max(act.speed.x - act.acceleration*dt, 0);
      else
        act.speed.x = Math.min(act.speed.x + act.acceleration*dt, 0);
    }

    // y-speed 
    if(input_button_down(act.input, IB_DOWN) && !input_button_down(act.input, IB_UP))
      act.speed.y = Math.min(act.speed.y + act.acceleration*dt, act.maxspeed);
    if(input_button_down(act.input, IB_UP) && !input_button_down(act.input, IB_DOWN))
      act.speed.y = Math.max(act.speed.y - act.acceleration*dt, -act.maxspeed);
    if(!input_button_down(act.input, IB_UP) && !input_button_down(act.input, IB_DOWN) && Math.abs(act.speed.y) > EPSILON) {
      if(act.speed.y > 0)
        act.speed.y = Math.max(act.speed.y - act.acceleration*dt, 0);
      else
        act.speed.y = Math.min(act.speed.y + act.acceleration*dt, 0);
    }
  }
  else
    act.speed = v2d_new(0,0);

  // done! 
  ds.x = Math.abs(act.speed.x) > EPSILON ? act.speed.x*dt + 0.5*act.acceleration*dt*dt : 0;
  //ds.y = Math.abs(act.speed.y) > EPSILON ? act.speed.y*dt + 0.5*act.acceleration*dt*dt : 0;
  ds.y = 0;
  act.speed.x = ds.x;
  act.speed.y = ds.y;
  return ds;
}

export const actor_bullet_movement = (act) => {
  const dt = timer_get_delta();
  let ds = v2d_new(0,0);

  /* x-axis */
  ds.x = act.speed.x*dt;

  /* y-axis */
  ds.y = 0.0;
  
  /* done! */
  return ds;
}

const brick_at = (list, rect) => {

  let ret = null;
  let p;
  let deg, inside_region, end = false;
  let x, y, mytan, line;
  let br;

  /* main algorithm */
  for(p=list; p && !end; p=p.next) {

    if (p.data) {

      /* I don't care about passable/disabled bricks. */
      if(p.data.brick_ref.property == BRK_NONE || !p.data.enabled)
        continue;

      /* I don't like clouds. */
      if(p.data.brick_ref.property == BRK_CLOUD && (ret && ret.brick_ref.property == BRK_OBSTACLE))
        continue;

      /* I don't like moving platforms */
      if(p.data.brick_ref.behavior == BRB_CIRCULAR && (ret && ret.brick_ref.behavior != BRB_CIRCULAR) && p.data.y >= ret.y)
        continue;

      /* I don't want a floor! */
      if(is_floor_disabled && p.data.brick_ref.angle == 0)
        continue;

      /* I don't want a ceiling! */
      if(is_ceiling_disabled && p.data.brick_ref.angle == 180)
        continue;

      /* I don't want a right wall */
      if(is_rightwall_disabled && p.data.brick_ref.angle > 0 && p.data.brick_ref.angle < 180)
        continue;

      /* I don't want a left wall */
      if(is_leftwall_disabled && p.data.brick_ref.angle > 180 && p.data.brick_ref.angle < 360)
        continue;

      /* here's something I like... */
      const br = [ 
        p.data.x,
        p.data.y,
        (p.data.x + p.data.brick_ref.image.width),
        (p.data.y + p.data.brick_ref.image.height)
      ];

      if(bounding_box(rect, br)) {
        if(p.data.brick_ref.behavior != BRB_CIRCULAR && (ret && ret.brick_ref.behavior == BRB_CIRCULAR) && p.data.y <= ret.y) {
          ret = p.data; // I don't like moving platforms. Let's grab a regular platform instead. 
        }
        else if(p.data.brick_ref.property == BRK_OBSTACLE && (ret && ret.brick_ref.property == BRK_CLOUD)) {
          ret = p.data; // I don't like clouds. Let's grab an obstacle instead. 
        }
        else if(p.data.brick_ref.property == BRK_CLOUD && (ret && ret.brick_ref.property == BRK_CLOUD)) {
          // oh no, two conflicting clouds! 
          if(p.data.y > ret.y)
            ret = p.data;
        }
        else if(p.data.brick_ref.angle % 90 == 0) { // if not slope 

          if(slope_priority) {
            if(!ret) // this code priorizes the slopes 
              ret = p.data;
          else {
            if(floor_priority) {
              if(ret.brick_ref.angle % 180 != 0) // priorizes the floor/ceil 
                ret = p.data;
            }
            else {
              if(ret.brick_ref.angle % 180 == 0) // priorizes the walls (not floor/ceil) 
                ret = p.data;
            }
          }
        }
        else
          ret = p.data; // priorizes the floors & walls 
        }
        else if(slope_priority) { // if slope 
          
          deg = p.data.brick_ref.angle;
          mytan = Math.tan(deg * PI/180.0);
          for(x=rect[0]; x<=rect[2] && !end; x++) {
            for(y=rect[1]; y<=rect[3] && !end; y++) {
              inside_region = false;

              switch( parseInt((deg/90),10) % 4 ) {
                case 0: // 1st quadrant 
                  line = br[3] + mytan*(br[0]-x);
                  inside_region = (br[0] <= x && x <= br[2] && line <= y && y <= br[3]);
                  break;
                case 1: // 2nd quadrant 
                  line = br[3] - mytan*(br[2]-x);
                  inside_region = (br[0] <= x && x <= br[2] && br[1] <= y && y <= line);
                  break;
                case 2: // 3rd quadrant 
                  line = br[3] - mytan*(br[0]-x);
                  inside_region = (br[0] <= x && x <= br[2] && br[1] <= y && y <= line);
                  break;
                case 3: // 4th quadrant 
                  line = br[3] + mytan*(br[2]-x);
                  inside_region = (br[0] <= x && x <= br[2] && line <= y && y <= br[3]);
                  break;
              }

              if(inside_region) {
                ret = p.data;
                end = true;
              }
            }
          }
        }
      }
    }
  }

  return ret;
}

const calculate_rotated_boundingbox = (z, act, spot) => {
  let w, h, angle;
  let a, b, c, d, hs;
  let pos;

  angle = -act.angle;
  w = actor_image(act).width;
  h = actor_image(act).height;
  hs = act.hot_spot;
  pos = act.position;

  a = v2d_subtract(v2d_new(0, 0), hs);
  b = v2d_subtract(v2d_new(w, 0), hs);
  c = v2d_subtract(v2d_new(w, h), hs);
  d = v2d_subtract(v2d_new(0, h), hs);

  spot[0] = v2d_add(pos, v2d_rotate(a, angle));
  spot[1] = v2d_add(pos, v2d_rotate(b, angle));
  spot[2] = v2d_add(pos, v2d_rotate(c, angle));
  spot[3] = v2d_add(pos, v2d_rotate(d, angle));

  return spot;
}

/* custom */
const flipHorizontally = (context, around) => {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
  return context;
}

const rotateContext = (context, x, y, ang) => {
  context.translate(x, y);
  context.rotate(ang);
  context.translate(-x, -y);
  return context;
}

