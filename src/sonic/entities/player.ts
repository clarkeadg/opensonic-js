import { actor_t, actor_change_animation_frame, actor_corners, actor_corners_disable_detection, actor_corners_set_floor_priority, actor_corners_restore_floor_priority, actor_corners_ex, actor_create, actor_move, actor_render, actor_change_animation, actor_animation_finished, actor_image, actor_handle_clouds, actor_change_animation_speed_factor } from "./actor"
import { brick_t, brick_list_t, BRK_OBSTACLE, BRB_CIRCULAR, BRB_FALL, BRS_IDLE, BRS_ACTIVE } from "./brick"
import { IT_RING } from "./item"
import { ring_start_bouncing } from "./items/ring"
import { sound_play, sound_is_playing } from "./../core/audio"
import { soundfactory_get } from "./../core/soundfactory"
import { input_create_user, input_button_up, input_button_down, input_button_pressed, input_simulate_button_down, IB_UP, IB_DOWN, IB_LEFT, IB_RIGHT, IB_FIRE1 } from "./../core/input"
import { sprite_get_animation } from "./../core/sprite"
import { image_create, image_clear } from "./../core/image"
import { logfile_message } from "./../core/logfile"
import { timer_get_delta, timer_get_ticks } from "./../core/timer"
import { v2d_t, v2d_new, v2d_add, v2d_subtract, v2d_rotate, v2d_multiply, v2d_magnitude } from "./../core/v2d"
import { PI, IF_HFLIP, IF_NONE, EPSILON } from "./../core/global"
import { random, clip, bounding_box, old_school_angle } from "./../core/util"
import { level_editmode, level_brick_move_actor, level_override_music, level_gravity, level_size, level_create_particle, level_create_item } from "./../scenes/level"

/* Constants */
export const PLAYER_INITIAL_LIVES      =  5;
export const PLAYER_MAX_INVSTAR        =  5;
export const PLAYER_WALL_NONE          =  0;
export const PLAYER_WALL_TOP           =  1;
export const PLAYER_WALL_RIGHT         =  2;
export const PLAYER_WALL_BOTTOM        =  4;
export const PLAYER_WALL_LEFT          =  8;
export const PLAYER_MAX_BLINK          =  4.0; /* how many seconds does the player must blink if he/she gets hurt? */
export const PLAYER_MAX_INVINCIBILITY  =  23.0; /* invincibility timer */
export const PLAYER_MAX_SPEEDSHOES     =  23.0; /* speed shoes timer */
export const TAILS_MAX_FLIGHT          =  10.0; /* tails can fly up to 10 seconds */
export const PLAYER_JUMP_SENSITIVITY   =  0.88; /* jump sensitivity */

/* player list */
export const PL_SONIC                  =  0;
export const PL_TAILS                  =  1;
export const PL_KNUCKLES               =  2;

/* shield list */
export const SH_NONE                   =  0; /* no shield */
export const SH_SHIELD                 =  1; /* regular shield */
export const SH_FIRESHIELD             =  2; /* fire shield */
export const SH_THUNDERSHIELD          =  3; /* thunder shield */
export const SH_WATERSHIELD            =  4; /* water shield */
export const SH_ACIDSHIELD             =  5; /* acid shield */
export const SH_WINDSHIELD             =  6; /* wind shield */

/* player structure */
export interface player_t {
  /* general */
  name: string,
  type: number,  
  actor: actor_t,
  disable_movement: boolean,
  in_locked_area: boolean,
  at_some_border: boolean,
  
  /* movement data */
  spin: boolean,
  spin_dash: boolean,
  braking: boolean,
  flying: boolean,
  climbing: boolean,
  landing: boolean,
  spring: boolean,
  is_fire_jumping: boolean, /* am i jumping because IB_FIRE1 was pressed? */
  on_moveable_platform: boolean,
  lock_accel: number,
  flight_timer: number,
  disable_jump_for: number, /* disable jumping for how long? */

  /* got hurt? */
  getting_hit: boolean, /* getting_hit gets FALSE if the player touches the ground */
  blinking: boolean,
  dying: boolean,
  dead: boolean,
  blink_timer: number, /* if the player is blinking, then it can't be hurt anymore */
  death_timer: number,
  
  /* glasses */
  got_glasses: boolean,
  glasses: actor_t,

  /* shields */
  shield_type: number,
  shield: actor_t,

  /* invincibility */
  invincible: boolean
  invtimer: number,
  invstar: actor_t[],

  /* speed shoes */
  got_speedshoes: boolean,
  speedshoes_timer: number,

  /* sonic loops (PLAYER_WALL_*) */
  disable_wall: number,
  entering_loop: boolean,
  at_loopfloortop: boolean,
  bring_to_back: boolean
}

/* private vars */
const NATURAL_ANGLE     =  0;
const LOCKACCEL_NONE    =  0;
const LOCKACCEL_LEFT    =  1;
const LOCKACCEL_RIGHT   =  2;
let rings:number;
let hundred_rings:number;
let lives:number = 0;
let score:number = 0;

/**
 * player_create()
 * Creates a player
 */
export const player_create = (type:number) => {
  logfile_message(`player_create(${type})`);

  const p:player_t = {
    name: "Unknown",
    type: type,
    actor: actor_create(),
    disable_movement: false,
    in_locked_area: false,
    at_some_border: false,
    spin: false,
    spin_dash: false,
    braking: false,
    flying: false,
    climbing: false,
    landing: false,
    spring: false,
    is_fire_jumping: false,
    getting_hit: false,
    dying: false,
    dead: false,
    blinking: false,
    on_moveable_platform: false,
    lock_accel: LOCKACCEL_NONE,
    flight_timer: 0.0,
    blink_timer: 0.0,
    death_timer: 0.0,
    disable_jump_for: 0.0,
    glasses: actor_create(),
    got_glasses: false,
    shield: actor_create(),
    shield_type: SH_NONE,
    invincible: false,
    invtimer: 0,
    invstar: [],
    got_speedshoes: false,
    speedshoes_timer: 0,
    disable_wall: PLAYER_WALL_NONE,
    entering_loop: false,
    at_loopfloortop: false,
    bring_to_back: false
  }
  
  for(let i=0; i<PLAYER_MAX_INVSTAR; i++) {
    p.invstar[i] = actor_create();
    actor_change_animation(p.invstar[i], sprite_get_animation("SD_INVSTAR", 0));
  }  

  switch(p.type) {
    case PL_SONIC:
      p.name = "Surge";
      p.actor.acceleration = 250;
      p.actor.maxspeed = 700;
      //p.actor.jump_strength = 400;
      p.actor.jump_strength = 450;
      p.actor.input = input_create_user();
      actor_change_animation( p.actor, sprite_get_animation(get_sprite_id(PL_SONIC), 0) );
      break;

    case PL_TAILS:
      p.name = "Neon";   
      p.actor.acceleration = 200;
      p.actor.maxspeed = 600;
      p.actor.jump_strength = 360;
      p.actor.input = input_create_user();
      actor_change_animation( p.actor, sprite_get_animation(get_sprite_id(PL_TAILS), 0) );
      break;

    case PL_KNUCKLES:
      p.name = "Charge";  
      p.actor.acceleration = 200;
      p.actor.maxspeed = 600;
      p.actor.jump_strength = 360;
      p.actor.input = input_create_user();
      actor_change_animation( p.actor, sprite_get_animation(get_sprite_id(PL_KNUCKLES), 0) );
      break;     
  }

  hundred_rings = 1;
  rings = 0;
  logfile_message("player_create() ok");
  return p;
}

/**
 * player_destroy()
 * Destroys a player
 */
export const player_destroy = () => {}

/**
 * player_update()
 * Updates the player
 */
export const player_update = (player:player_t, team:player_t[], brick_list:brick_list_t) => {

  const act = player.actor;

  //console.log(act.position.x, act.position.y)

  if(player.blinking) {
    player.blink_timer += timer_get_delta();
    act.visible = (timer_get_ticks() % 250) < 125;
    if(player.blink_timer >= PLAYER_MAX_BLINK) {
      player.getting_hit = player.blinking = false;
      act.visible = true;
    }
  }

  if(player.disable_movement) {
    if(player.spin)
      actor_change_animation(player.actor, sprite_get_animation(get_sprite_id(player.type), 3));
    else if(player.spring)
      actor_change_animation(player.actor, sprite_get_animation(get_sprite_id(player.type), 13));
  } else {
    actor_move(act, player_platform_movement(player, team, brick_list, level_gravity()));
  }
  return player;
}

/**
 * player_render()
 * Rendering function
 */
export const player_render = (player:player_t, camera_position:v2d_t) => {

  if (!player) return;

  let act = player.actor;
  if (!act) return;

  let hot_spot = act.hot_spot;
  let position = act.position;
  let s_hot_spot = v2d_new(0,0);
  let starpos = v2d_new(0,0);
  let i;
  let invangle = [];
  let x;
  let angoff;
  let ang = act.angle;
  let s_ang = 0;

  //player.invincible = true;

  /* invencibility stars */
  if(player.invincible) {
    let maxf = sprite_get_animation("SD_INVSTAR", 0).frame_count;
    player.invtimer += timer_get_delta();

    for(i=0; i<PLAYER_MAX_INVSTAR; i++) {
      invangle[i] = (180*4) * timer_get_ticks()*0.001 + (i+1)*(360/PLAYER_MAX_INVSTAR);
      starpos.x = 30*Math.cos(invangle[i]*PI/180);
      starpos.y = ((timer_get_ticks()+i*400)%2000)/40;
      starpos = v2d_rotate(starpos,ang);
      player.invstar[i].position.x = act.position.x + starpos.x;
      player.invstar[i].position.y = act.position.y - starpos.y + 5;
      actor_change_animation_frame(player.invstar[i], random(maxf));
    }

    //if(player.invtimer >= PLAYER_MAX_INVINCIBILITY)
    //  player.invincible = false;
  }


  //player.got_glasses = true;

  /* shields and glasses */
  if(player.got_glasses) {
    update_glasses(player)
  }

  //player.shield_type = SH_NONE;
  //player.shield_type = SH_SHIELD;
  //player.shield_type = SH_FIRESHIELD;
  //player.shield_type = SH_THUNDERSHIELD;
  //player.shield_type = SH_WATERSHIELD;
  //player.shield_type = SH_ACIDSHIELD;

  if(player.shield_type != SH_NONE) {
    update_shield(player);
  }

  /* player's specific routines (before rendering) */
  switch(player.type) {
    case PL_SONIC:
        break;

    case PL_TAILS:
        /* tails' jump hack */
        /*if(act.is_jumping && act.animation == sprite_get_animation(get_sprite_id(PL_TAILS), 3)) {
            var rotate = ((Math.abs(act.speed.x)>100) || input_button_down(act.input,IB_RIGHT) || input_button_down(act.input,IB_LEFT));
            var left = (act.mirror & IF_HFLIP);
            act.hot_spot = v2d_new(actor_image(act).width*0.5, actor_image(act).height*0.9);
            if(act.speed.y > 0 && !rotate) act.hot_spot.x *= 0.9/0.5;
            if(act.speed.y < 0) {
                angoff = left ? 3*PI/2 : PI/2;
                act.angle = ang + angoff;
                if(rotate)
                    act.angle -= (left?-1:1) * (PI/2) * (act.jump_strength+act.speed.y)/act.jump_strength;
                else
                    act.position.x -= actor_image(act).height*(left?0.5:0.0);
            }
            else {
                angoff = left ? PI/2 : 3*PI/2;
                act.angle = ang + angoff;
                if(rotate) {
                    if(act.speed.y < act.jump_strength)
                        act.angle += (left?-1:1) * (PI/2) * (act.jump_strength-act.speed.y)/act.jump_strength;
                }
                else
                    act.position.x += actor_image(act).height*(left?0.1:-0.2);
            }

            // fix shield position
            if(player.shield_type != SH_NONE) {
                var voff;
                if(rotate)
                    voff = v2d_rotate(v2d_new(left?-13:13,-13), -act.angle);
                else if(act.mirror & IF_HFLIP)
                    voff = v2d_new((act.speed.y>0) ? -13 : 13, -15);
                else
                    voff = v2d_new((act.speed.y>0 ? 7 : -7), -15);
                s_ang = player.shield.angle;
                s_hot_spot = player.shield.hot_spot;
                player.shield.position = v2d_add(act.position, voff);
            }
        }*/
        break;

    case PL_KNUCKLES:
        break;

    default:
    break;
  }

  /* rendering */
  for(i=0;i<PLAYER_MAX_INVSTAR && player.invincible;i++) {
    if(invangle[i]%360 >= 180)
      actor_render(player.invstar[i], camera_position);
  }

  x = act.angle;
  act.angle = (act.is_jumping || player.spin) ? x : old_school_angle(x);
  actor_render(act, camera_position);
  act.angle = x;

  if(player.got_glasses) {
    //console.log(player.glasses)
    actor_render(player.glasses, camera_position);
  }
  if(player.shield_type != SH_NONE) {
    actor_render(player.shield, camera_position);
  }
  for(i=0;i<PLAYER_MAX_INVSTAR && player.invincible;i++) {
    if(invangle[i]%360 < 180)
      actor_render(player.invstar[i], camera_position);
  }

  /* player's specific routines (after rendering) */
  switch(player.type) {
    case PL_SONIC:
        break;

    case PL_TAILS:
        if(act.is_jumping && act.animation == sprite_get_animation(get_sprite_id(PL_TAILS), 3)) {
            act.position = v2d_new(position.x, position.y);
            act.angle = ang;
            act.hot_spot = hot_spot;

            if(player.shield_type != SH_NONE) {
                player.shield.angle = s_ang;
                player.shield.hot_spot = s_hot_spot;
            }
        }
        break;

    case PL_KNUCKLES:
        break;

    default:
    break;
  }

  //actor_render_corners(player, 2, -2, camera_position);
}

/**
 * player_platform_movement()
 * Platform movement. Returns
 * a delta_space vector.
 *
 * Note: the actor's hot spot must
 * be defined on its feet.
 */
export const player_platform_movement = (player:player_t, team:player_t[], brick_list:brick_list_t, gravity:number) => {

  let act = player.actor;
  let sprite_id = get_sprite_id(player.type);
  const dt = timer_get_delta();
  let max_y_speed = 480, friction = 0, gravity_factor = 1.0;
  let maxspeed = act.maxspeed;
  let ds = v2d_new(0,0);
  let pushing_a_wall;
  let angle_question;
  let was_jumping = false;
  let is_walking = (player.actor.animation == sprite_get_animation(sprite_id, 1));
  let at_right_border = false, at_left_border = false;
  let climbing_a_slope = false;
  let block_tails_flight = false;
  let animation = null;

  /* actor's collision detectors */
  let frame_width = actor_image(act).width;
  let frame_height = actor_image(act).height;
  let slope = !((Math.abs(act.angle)<EPSILON)||(Math.abs(act.angle-PI/2)<EPSILON)||(Math.abs(act.angle-PI)<EPSILON)||(Math.abs(act.angle-3*PI/2)<EPSILON));
  let diff = -2, sqrsize = 2, top=0, middle=0, lateral=0;
  let brick_up, brick_down, brick_right, brick_left;
  let brick_upright, brick_downright, brick_downleft, brick_upleft;
  let brick_tmp;
  let up, upright, right, downright, down, downleft, left, upleft;
  let feet = act.position;
  switch(player.type) {
    case PL_SONIC:
      if(!slope) { top = 0.7; middle = 0.5; lateral = 0.4; }
      else       { top = 1.0; middle = 0.8; lateral = 0.5; }
      break;

    case PL_TAILS:
      if(!slope) { top = 0.7; middle = 0.5; lateral = 0.25; }
      else       { top = 1.0; middle = 0.7; lateral = 0.25; }
      break;

    case PL_KNUCKLES:
      if(!slope) { top = 0.7; middle = 0.5; lateral = 0.25; }
      else       { top = 1.0; middle = 0.7; lateral = 0.25; }
      break;

  }
  up        = v2d_add ( feet , v2d_rotate( v2d_new(0, -frame_height*top+diff), -act.angle) );
  down      = v2d_add ( feet , v2d_rotate( v2d_new(0, -diff), -act.angle) );
  left      = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -frame_height*middle), -act.angle) );
  right     = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -frame_height*middle), -act.angle) );
  upleft    = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -frame_height*top+diff), -act.angle) );
  upright   = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -frame_height*top+diff), -act.angle) );
  downleft  = v2d_add ( feet , v2d_rotate( v2d_new(-frame_width*lateral+diff, -diff), -act.angle) );
  downright = v2d_add ( feet , v2d_rotate( v2d_new(frame_width*lateral-diff, -diff), -act.angle) );

  if(player.type == PL_TAILS && act.carrying && Math.abs(act.angle)<EPSILON) {
    let h = actor_image(act.carrying).height,
        k = act.speed.y>5?h*0.7:0;
    downleft.y += k;
    downright.y += k;
    down.y += k;
    left.y += h*middle+random(h)-h*0.5;
    right.y = left.y;
  }

  actor_corners_disable_detection(player.disable_wall & PLAYER_WALL_LEFT, player.disable_wall & PLAYER_WALL_RIGHT, player.disable_wall & PLAYER_WALL_BOTTOM, player.disable_wall & PLAYER_WALL_TOP);
  actor_corners_set_floor_priority( (player.disable_wall & PLAYER_WALL_BOTTOM) ? false : true );

  let actorCornersEx = actor_corners_ex(act, sqrsize, up, upright, right, downright, down, downleft, left, upleft, brick_list, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft);
  brick_up = actorCornersEx.up;
  brick_down = actorCornersEx.down;
  brick_left = actorCornersEx.left;
  brick_right = actorCornersEx.right;
  brick_upleft = actorCornersEx.upleft;
  brick_upright = actorCornersEx.upright;
  brick_downleft = actorCornersEx.downleft;
  brick_downright = actorCornersEx.downright;

  actor_corners_restore_floor_priority();

  /* is the player dying? */
  if(player.dying) {
    act.speed.x = 0;
    act.speed.y = Math.min(max_y_speed, act.speed.y+gravity*dt);
    act.mirror = null;
    act.angle = 0;
    act.visible = true;
    player.blinking = false;
    player.death_timer += dt;
    player.dead = (player.death_timer >= 2.5);
    actor_change_animation(act, sprite_get_animation(sprite_id, 8));
    return v2d_new(0, act.speed.y*dt + 0.5*gravity*dt*dt);
  }
  else if(player.dead)
    return v2d_new(0,0);

  /* clouds */
  let cloudBricks = actor_handle_clouds(act, diff, brick_up, brick_upright, brick_right, brick_downright, brick_down, brick_downleft, brick_left, brick_upleft);
  brick_up = cloudBricks.up;
  brick_upright = cloudBricks.upright;
  brick_right = cloudBricks.right;
  brick_left = cloudBricks.left;
  brick_upleft = cloudBricks.upleft;
  brick_down = cloudBricks.down;
  brick_downleft = cloudBricks.downleft;
  brick_downright = cloudBricks.downright;

   /* carry */
  switch(player.type) {
    case PL_SONIC: act.carry_offset = v2d_new((act.mirror&IF_HFLIP)?7:-9,-40); break;
    case PL_TAILS: act.carry_offset = v2d_new((act.mirror&IF_HFLIP)?7:-7,-42); break;
    case PL_KNUCKLES: act.carry_offset = v2d_new((act.mirror&IF_HFLIP)?7:-7,-42); break;
  }

  /* I'm being carried */
  if(act.carried_by != null) {
    let host = null;
    let i, host_id = 0, my_id = 0;
    let car = act.carried_by;

    /* my id? */
    for(i=0; i<team.length; i++) {
      if(team[i] == player) {
        my_id = i;
        break;
      }
    }

    /* host = who is carrying me? */
    for(i=0; i<team.length; i++) {
      if(team[i].actor == car) {
        /* I've found the host! */
        host = team[i];
        host_id = i;

        /* setting up some common flags... */
        player.disable_wall = host.disable_wall;
        player.entering_loop = host.entering_loop;
        player.at_loopfloortop = host.at_loopfloortop;
        player.bring_to_back = host.bring_to_back;

        /* done */
        break;
      }
    }

    /* actions */
    if(host && ((host.type == PL_TAILS && !host.flying) || host.getting_hit || host.dying || host.dead)) { /* what should host do? */
      /* put me down! */
      act.position = v2d_new(act.carried_by.position.x, act.carried_by.position.y);
      act.carried_by.carrying = null;
      act.carried_by = null;
    }
    else if((brick_down && brick_down.brick_ref.angle == 0 && car.speed.y >= 5) || player.getting_hit || player.dying || player.dead) { /* what should I do? */
      /* put me down! */
      act.position = v2d_new(act.carried_by.position.x, act.carried_by.position.y);
      act.carried_by.carrying = null;
      act.carried_by = null;
    }
    else {
      /* carry me! */
      let offset = my_id < host_id ? v2d_multiply(car.speed, dt) : v2d_new(0,0);
      act.speed = v2d_new(0,0);
      act.mirror = car.mirror;
      act.angle = 0;
      actor_change_animation(act, sprite_get_animation(sprite_id, 25));
      act.position = v2d_subtract(v2d_add(car.position, offset), act.carry_offset);
      return v2d_new(0,0);
    }
  }

  // this line fixed all my inside_loop problems!
  player.entering_loop = false;

  /* oh no, I got crushed! */
  /*if(got_crushed(player, brick_up, brick_right, brick_down, brick_left)) {
    player_kill(player);
    return v2d_new(0,0);
  }*/

  /* speed shoes */
  if(player.got_speedshoes) {
    if(player.speedshoes_timer > PLAYER_MAX_SPEEDSHOES)
      player.got_speedshoes = false;
    else {
      maxspeed *= 1.5;
      player.speedshoes_timer += dt;
    }
  }

  /* if the player jumps inside a loop, enable the floor collision detection */
  if(inside_loop(player)) {
    if(act.is_jumping) {
      player.disable_wall &= ~PLAYER_WALL_BOTTOM;
    }
  }

  /* disable spring mode */
  if(player.spring) {
    if((brick_down && act.speed.y >= 0) || player.flying || player.climbing)
      player.spring = false;
  }

  /* useful flags */
  pushing_a_wall = ((brick_right && input_button_down(act.input, IB_RIGHT)) || (brick_left && input_button_down(act.input, IB_LEFT))) && brick_down;
  player.on_moveable_platform = (v2d_magnitude(level_brick_move_actor(brick_down,act)) > EPSILON);

  /* wall collision */
  climbing_a_slope = brick_down && ((act.angle > 0 && act.angle < PI/2 && act.speed.x>0) || (act.angle > 3*PI/2 && act.angle < 2*PI && act.speed.x<0));
  if((climbing_a_slope && (brick_upleft || brick_upright)) || (Math.abs(act.angle) < EPSILON || Math.abs(act.angle-PI) < EPSILON)){
    if(brick_right) {
      if(brick_right.brick_ref.angle % 90 == 0 && (act.speed.x > EPSILON || right.x > brick_right.x)) {
        if(!climbing_a_slope || (climbing_a_slope && brick_right.brick_ref.angle != 90)) {
          act.speed.x = 0;
          act.position.x = brick_right.x + (feet.x-right.x);
          if(!act.is_jumping && !player.flying && !player.climbing && Math.abs(act.speed.y)<EPSILON)
              animation = sprite_get_animation(sprite_id, pushing_a_wall ? 14 : 0);
          if(climbing_a_slope) return v2d_new(-5,0);
        }
      }
    }

    if(brick_left) {
      if(brick_left.brick_ref.angle % 90 == 0 && (act.speed.x < -EPSILON || left.x < brick_left.x+brick_left.brick_ref.image.width)) {
        if(!climbing_a_slope || (climbing_a_slope && brick_left.brick_ref.angle != 270)) {
          act.speed.x = 0;
          act.position.x = (brick_left.x+brick_left.brick_ref.image.width) + (feet.x-left.x);
          if(!act.is_jumping && !player.flying && !player.climbing && Math.abs(act.speed.y)<EPSILON)
            animation = sprite_get_animation(sprite_id, pushing_a_wall ? 14 : 0);
          if(climbing_a_slope) return v2d_new(5,0);
        }
      }
    }

    if(act.position.x <= act.hot_spot.x) {
      player.spin = false;
      at_left_border = true;

      if(act.position.x < act.hot_spot.x) {
        act.speed.x = 0;
        act.position.x = act.hot_spot.x;
        if(brick_down) {
          pushing_a_wall = true;
          animation = sprite_get_animation(sprite_id, 1);
        }
      }
    }

  if(act.position.x >= level_size().x - (actor_image(act).width - act.hot_spot.x)) {
      player.spin = false;
      at_right_border = true;

      if(act.position.x > level_size().x - (actor_image(act).width - act.hot_spot.x)) {
        act.speed.x = 0;
        act.position.x = level_size().x - (actor_image(act).width - act.hot_spot.x);
        if(brick_down) {
          pushing_a_wall = true;
          animation = sprite_get_animation(sprite_id, 1);
        }
      }
    }
  }

  /* y-axis */
  //let stickyCorners = stickyphysics_hack(player, brick_list, brick_downleft, brick_down, brick_downright);

  /*if (stickyCorners.act) {
    act = stickyCorners.act;
  }*/
  /*if (stickyCorners && stickyCorners.brick_downleft) {
    //console.log(stickyCorners)
    //console.log('sticky corner switcherooo')
    brick_downleft = stickyCorners.brick_downleft;
    brick_down = stickyCorners.brick_down;
    brick_downright = stickyCorners.brick_downright;
  }*/
  if(!player.climbing) {
    if(brick_down) {
        let ang = brick_down.brick_ref.angle;
        let spin_block;
        let factor, jump_sensitivity = 1.0;
        was_jumping = true;
        act.ignore_horizontal = false;
        player.is_fire_jumping = false;
        act.is_jumping = false;

        // falling bricks?
        if(brick_down.brick_ref && brick_down.brick_ref.behavior == BRB_FALL && brick_down.state == BRS_IDLE)
          brick_down.state = BRS_ACTIVE;

        /// stopped, walking, running, spinning...
        if(Math.abs(act.speed.x) < EPSILON) {
          if(ang%180==0) player.spin = false;

          // look down
          if(input_button_down(act.input, IB_DOWN)) {
            // crouch down
            if(!player.spin_dash)
              animation = sprite_get_animation(sprite_id, 4);

            // spin dash - start
            if(input_button_pressed(act.input, IB_FIRE1)) {
              animation = sprite_get_animation(sprite_id, 6);
              player.spin_dash = true;
              sound_play( soundfactory_get("charge") );
            }
          }
          else if(!pushing_a_wall) {
            if(input_button_down(act.input, IB_UP)) { // look up
              if(!(is_walking && player.at_some_border))
                animation = sprite_get_animation(sprite_id, 5);
            }
            else if(!inside_loop(player)) {
              // stopped / ledge
              let minileft, miniright;
              let vminileft  = v2d_add ( feet , v2d_rotate( v2d_new(-8, 0), -act.angle) );
              let vminiright = v2d_add ( feet , v2d_rotate( v2d_new(5, 0), -act.angle) );
              let v = v2d_new(0,0);
              let miniCorners = actor_corners_ex(act, sqrsize, v, v, v, vminiright, v, vminileft, v, v, brick_list, null, null, null, miniright, null, minileft, null, null);
              if((!miniCorners.downleft  || !miniCorners.downright ) && !player.on_moveable_platform) {              
                animation = sprite_get_animation(sprite_id, 10);
              } else {                
                if( !((input_button_down(act.input, IB_LEFT) && (at_left_border || player.at_some_border)) || (input_button_down(act.input, IB_RIGHT) && (at_right_border || player.at_some_border))) ) {
                  animation = sprite_get_animation(sprite_id, 0);
                } else {
                  act.mirror = at_left_border ? IF_HFLIP : IF_NONE;
                  animation = sprite_get_animation(sprite_id, 1);
                }
              }
            }
            else // stopped */
              animation = sprite_get_animation(sprite_id, 0);
          }

          // spin dash
          if(player.spin_dash) {

            // particles
            let a, sd_sig = act.mirror&IF_HFLIP ? 1 : -1, r;
            let sd_relativepos, sd_speed;
            let pixel;

            for(a=0; a<3; a++) {
              r = 128+random(128);
              pixel = image_create(1,1);
              image_clear(pixel, 255, 255, 255);

              sd_relativepos = v2d_new(sd_sig*(7+random(7)), 2);
              sd_speed = v2d_new(sd_sig * (50+random(200)), -random(200));

              level_create_particle(pixel, v2d_add(act.position,sd_relativepos), sd_speed, true);
            }

            // end
            if(input_button_up(act.input, IB_DOWN) || level_editmode()) {
              player.spin = true;
              player.spin_dash = false;
              if( ((act.mirror&IF_HFLIP)&&!brick_left&&!at_left_border) || (!(act.mirror&IF_HFLIP)&&!brick_right&&!at_right_border) )
                  act.speed.x = ( act.mirror & IF_HFLIP ? -1 : 1 )*maxspeed*1.35;
              sound_play( soundfactory_get("release") );
              player.disable_jump_for = 0.05; // disable jumping for how long?
            }
          }
        }
        else {
          if(input_button_down(act.input, IB_DOWN)) {
              if(!player.spin) {
                sound_play( soundfactory_get("roll") );
              }
              player.spin = true;
          }

          if(!player.spin && !player.braking) {
            let max_walking_speed = maxspeed * 0.75;
            let min_braking_speed = maxspeed * 0.35;

            // animation
            if(Math.abs(act.speed.x) < max_walking_speed) {
              if(!pushing_a_wall && act.speed.y >= 0) {
                animation = sprite_get_animation(sprite_id, 1); // walking animation
                act = actor_change_animation_speed_factor(act, 0.5 + 1.5*(Math.abs(act.speed.x) / max_walking_speed)); // animation speed
              }
            }
            else
              animation = sprite_get_animation(sprite_id, 2); // running animation

            // brake
            if(Math.abs(act.speed.x) >= min_braking_speed) {
              if( (input_button_down(act.input, IB_RIGHT)&&(act.speed.x<0)) || (input_button_down(act.input, IB_LEFT)&&(act.speed.x>0)) ) {
                sound_play( soundfactory_get("brake") );
                player.braking = true;
              }
            }

          }
          else if(player.spin) {
            animation = sprite_get_animation(sprite_id, 3); // spinning
          } else if(player.braking) {
            
            // particles
            let r, sd_sig = act.mirror&IF_HFLIP ? 1 : -1;
            let sd_relativepos, sd_speed;
            let pixel;

            r = 128+random(128);
            pixel = image_create(1,1);
            //image_clear(pixel, image_rgb(r,r,r));
            sd_relativepos = v2d_new(sd_sig*(10-random(21)), 0);
            sd_speed = v2d_new(sd_sig * (50+random(200)), -random(200));
            level_create_particle(pixel, v2d_add(act.position,sd_relativepos), sd_speed, true);

            // braking
            animation = sprite_get_animation(sprite_id, 7);
            if(Math.abs(act.speed.x)<10) player.braking = false;
          }
        }

        // disable jump?
        player.disable_jump_for = Math.max(player.disable_jump_for - dt, 0.0);
        if(Math.abs(act.speed.x) < EPSILON)
            player.disable_jump_for = 0.0;

        // jump
        spin_block = !player.spin_dash;
        if(input_button_down(act.input, IB_FIRE1) && (player.disable_jump_for <= 0.0) && !input_button_down(act.input, IB_DOWN) && !brick_up && !player.landing && spin_block && !act.is_jumping) {
            //if(act.speed.y >= 0 && (player.type != PL_KNUCKLES || (player.type == PL_KNUCKLES && !player.flying)))
            sound_play( soundfactory_get("jump") );
            act.angle = NATURAL_ANGLE;
            act.is_jumping = true;
            player.is_fire_jumping = true;
            block_tails_flight = true;
            player.spin = false;
            animation = sprite_get_animation(sprite_id, 3);

            if(ang == 0) {
                act.speed.y = (-act.jump_strength) * jump_sensitivity;
            }
            else if(ang > 0 && ang < 90) {
                if(ang > 45) {
                    act.speed.x = Math.min(act.speed.x, (-0.7*act.jump_strength) * jump_sensitivity);
                    act.speed.y = (-0.7*act.jump_strength) * jump_sensitivity;
                }
                else {
                    act.speed.x *= act.speed.x > 0 ? 0.5 : 1.0;
                    act.speed.y = (-act.jump_strength) * jump_sensitivity;
                }
            }
            else if(ang == 90) {
                actor_move(act, v2d_new(20*diff, 0));
                act.speed.x = Math.min(act.speed.x, (-act.jump_strength) * jump_sensitivity);
                act.speed.y = (-act.jump_strength/2) * jump_sensitivity;
            }
            else if(ang > 90 && ang < 180) {
                actor_move(act, v2d_new(0, -20*diff));
                act.speed.x = Math.min(act.speed.x, (-0.7*act.jump_strength) * jump_sensitivity);
                act.speed.y = (act.jump_strength) * jump_sensitivity;
            }
            else if(ang == 180) {
                actor_move(act, v2d_new(0, -20*diff));
                act.speed.x *= -1;
                act.speed.y = (act.jump_strength) * jump_sensitivity;
            }
            else if(ang > 180 && ang < 270) {
                actor_move(act, v2d_new(0, -20*diff));
                act.speed.x = Math.max(act.speed.x, (0.7*act.jump_strength) * jump_sensitivity);
                act.speed.y = (act.jump_strength) * jump_sensitivity;
            }
            else if(ang == 270) {
                actor_move(act, v2d_new(-20*diff, 0));
                act.speed.x = Math.max(act.speed.x, (act.jump_strength) * jump_sensitivity);
                act.speed.y = (-act.jump_strength/2) * jump_sensitivity;
            }
            else if(ang > 270 && ang < 360) {
                if(ang < 315) {
                    act.speed.x = Math.max(act.speed.x, (0.7*act.jump_strength) * jump_sensitivity);
                    act.speed.y = (-0.7*act.jump_strength) * jump_sensitivity;
                }
                else {
                    act.speed.x *= act.speed.x < 0 ? 0.5 : 1.0;
                    act.speed.y = (-act.jump_strength) * jump_sensitivity;
                }
            }
        }


        // slopes / speed issues
        if(!act.is_jumping) {
            let mytan;
            let superSpeed = 1.2;
            let push = 25.0;
            if(ang > 0 && ang < 90) {
                mytan = Math.min(1, Math.tan( ang*PI/180.0 ))*0.8;
                if(Math.abs(act.speed.y) > EPSILON)
                    act.speed.x = (was_jumping && ang<=45) ? act.speed.x : Math.max(-superSpeed*maxspeed, -1*mytan*act.speed.y);
                else {
                    factor = (!(act.mirror & IF_HFLIP) ? 1.0 : 2.0) * mytan;
                    if(player.braking && ang<45)
                        factor *= 8.0 * (act.speed.x<0 ? -1.0/2.0 : 1.0/1.0);
                    else if(Math.abs(act.speed.x)<5) {
                        factor *= Math.sin(ang*PI/180.0)*push;
                        player.lock_accel = LOCKACCEL_RIGHT;
                    }
                    act.speed.x = Math.max(act.speed.x - factor*700*dt, -superSpeed*maxspeed);
                }
            }
            else if(ang > 270 && ang < 360) {
                mytan = Math.min(1, -Math.tan( ang*PI/180.0 ))*0.8;
                if(Math.abs(act.speed.y) > EPSILON)
                    act.speed.x = (was_jumping && ang>=315) ? act.speed.x : Math.min(superSpeed*maxspeed, 1*mytan*act.speed.y);
                else {
                    factor = ((act.mirror & IF_HFLIP) ? 1.0 : 2.0) * mytan;
                    if(player.braking && ang>315)
                        factor *= 8.0 * (act.speed.x>0 ? -1.0/2.0 : 1.0/1.0);
                    else if(Math.abs(act.speed.x)<5) {
                        factor *= -Math.sin(ang*PI/180.0)*push;
                        player.lock_accel = LOCKACCEL_LEFT;
                    }
                    act.speed.x = Math.min(act.speed.x + factor*700*dt, superSpeed*maxspeed);
                }
            }
        }

        if(ang%90 == 0)
            player.lock_accel = LOCKACCEL_NONE;

        if(brick_downleft && brick_downright && Math.abs(act.speed.x) < 40) {
            if(brick_downleft.brick_ref.angle > 270 && brick_downleft.brick_ref.angle < 360 && brick_downright.brick_ref.angle > 0 && brick_downright.brick_ref.angle < 90) {
                if(!input_button_down(act.input, IB_LEFT) && !input_button_down(act.input, IB_RIGHT))
                    act.speed.x = 0;
            }
        }
    }
    else { // not brick_down

        player.braking = false;
        player.lock_accel = LOCKACCEL_NONE;

        if(player.spin_dash) {
            player.spin_dash = false;
            animation = sprite_get_animation(sprite_id, 1);
        }

        if(act.animation == sprite_get_animation(sprite_id, 0) || act.animation == sprite_get_animation(sprite_id, 10) || act.animation == sprite_get_animation(sprite_id, 5))
            animation = sprite_get_animation(sprite_id, 1);

        if(player.spring || is_walking || act.speed.y < 0)
            player.spin = false;

        if(!inside_loop(player))
            act.angle = NATURAL_ANGLE;
    }


    // jump sensitivity
    if(!brick_down) {
        if(player.is_fire_jumping && act.speed.y < -act.jump_strength*PLAYER_JUMP_SENSITIVITY) {
            if(input_button_up(act.input, IB_FIRE1))
                act.speed.y *= 0.7;
        }
    }

    // who can fly?
    if(player.type == PL_TAILS && player.flying) {
        gravity_factor = (player.flight_timer < TAILS_MAX_FLIGHT) ? 0.15 : 0.8;
        max_y_speed *= 0.3;
    }
    else
        gravity_factor = 1.0;

    // y-axis movement
    ds.y = (Math.abs(act.speed.y) > EPSILON) ? act.speed.y*dt + 0.5*(gravity*gravity_factor)*(dt*dt) : 0;

    if(!(player.type == PL_KNUCKLES && player.flying))
      act.speed.y = Math.min(act.speed.y + (gravity*gravity_factor)*dt, max_y_speed);

    // ceiling collision
    angle_question = (brick_up && brick_up.brick_ref.angle%90!=0) && Math.abs(act.angle)<EPSILON;
    if(brick_up && (brick_up.brick_ref.angle % 90 == 0 || angle_question) && act.speed.y < -EPSILON) {
      act.position.y = (brick_up.y+brick_up.brick_ref.image.height) + (feet.y-up.y);
      act.speed.y = 10;

      // this is a moving brick... and it's moving down
      if(brick_up.brick_ref.behavior == BRB_CIRCULAR) {
        if(Math.sin(brick_up.brick_ref.behavior_arg[3] * brick_up.value[0]) > 0) {
          act.speed.y = 100;
          ds = v2d_add(ds, v2d_multiply(level_brick_move_actor(brick_up, act), dt));
          return ds;
        }
      }
    }

    // this is the main slope / loop 360% physics , see also the loop item for loop strategy, wall collision changes

    // floor collision
    brick_tmp = brick_down;

    if(brick_tmp && !act.is_jumping) {
        let ang = brick_tmp.brick_ref.angle;
        act.speed.y = ds.y = 0;
        act.angle = ang * PI / 180.0;

        let feetY;

        // 0 floor
        if(ang == 0) {
          let mov = level_brick_move_actor(brick_down, act); // moveable platforms
          feet.y = brick_tmp.y;
          friction = 0;
          if(mov.y > EPSILON) // if the moveable brick is going down...
            ds.y += mov.y*dt;
          else
            act.position.y = feet.y+diff+1;
        }

        // (0-90) slope
        else if(ang > 0 && ang < 90) {
          feet.y = brick_tmp.y + brick_tmp.brick_ref.image.height - (act.position.x-brick_tmp.x)*Math.tan(act.angle);
          if(act.speed.x<0) feet.y += 2.0;
          act.position.y = feet.y+diff;
          if(!(act.mirror & IF_HFLIP)) friction = 0.2;
        }

        // 90 wall
        else if(ang == 90) {
            if(Math.abs(act.speed.x) > 5) {
                var myang = brick_downright ? brick_downright.brick_ref.angle : -1;
                if(brick_downright && (myang >= ang && myang < ang+90)) {
                     //feet.y = brick_tmp.x;
                    if(!player.flying) act.position.x = brick_tmp.x+diff;
                }
                else {
                    act.angle = NATURAL_ANGLE;
                    act.is_jumping = true;
                    if(!player.spin && !player.flying) animation = sprite_get_animation(sprite_id, 1);
                    if(!inside_loop(player)) {
                        if(!player.flying) actor_move(act, v2d_new(6.5*diff, 0));
                        act.speed = v2d_new(0, -0.9*Math.abs(act.speed.x));
                    }
                }
            } else {
                act.angle = NATURAL_ANGLE;
                if(!player.flying) actor_move(act, v2d_new(5*diff, 0));
                act.is_jumping = true;
                act.ignore_horizontal = false;
            }
            if(!(act.mirror & IF_HFLIP)) friction = 1.5;
        }

        // (90-180) slope
        else if(ang > 90 && ang < 180) {
            if(Math.abs(act.speed.x) > 5) {
                feet.y = brick_tmp.y - (act.position.x-brick_tmp.x)*Math.tan(act.angle);
                act.position.y = feet.y-diff;
                //var feetY = brick_tmp.y - (act.position.x-brick_tmp.x)*Math.tan(act.angle);
                //act.position.y = feetY-diff;
            } else {
                act.angle = NATURAL_ANGLE;
                actor_move(act, v2d_new(0, -15*diff));
                act.is_jumping = true;
            }
            friction = 1.5;
        }

        // 180 ceiling
        else if(ang == 180) {
            if(Math.abs(act.speed.x) > 5) {
                feet.y = brick_tmp.y + brick_tmp.brick_ref.image.height;
                act.position.y = feet.y-diff;

                // end of ceil
                if( (act.speed.x > 0 && !brick_downright) || (act.speed.x < 0 && !brick_downleft) ) {
                    actor_move(act, v2d_new(0, 15*diff));
                    act.is_jumping = true;
                    act.speed.x *= -1;
                    act.mirror = act.speed.x<0 ? IF_HFLIP : IF_NONE;
                    act.angle = NATURAL_ANGLE;
                }
            } else {
                act.angle = NATURAL_ANGLE;
                actor_move(act, v2d_new(0, -20*diff));
                act.is_jumping = true;
                act.speed.x = 0;
            }
            friction = 1.2;
        }

        // (180-270) slope
        else if(ang > 180 && ang < 270) {
            if(Math.abs(act.speed.x) > 5) {
                feet.y = brick_tmp.y + brick_tmp.brick_ref.image.height - (act.position.x-brick_tmp.x)*Math.tan(act.angle);
                act.position.y = feet.y-diff;
            } else {
                act.angle = NATURAL_ANGLE;
                actor_move(act, v2d_new(0, -15*diff));
                act.is_jumping = true;
            }
            friction = 1.5;
        }

        // 270 wall
        else if(ang == 270) {
            if(Math.abs(act.speed.x) > 5) {
                var myang = brick_downleft ? brick_downleft.brick_ref.angle : -1;
                if(brick_downleft && (myang > ang-90 && myang <= ang)) {
                    //feet.y = brick_tmp.x + brick_tmp.brick_ref.image.width;
                    //if(!player.flying) act.position.x = feet.y-diff;
                    if(!player.flying) act.position.x = brick_tmp.x + brick_tmp.brick_ref.image.width-diff;
                } else {
                    act.angle = NATURAL_ANGLE;
                    act.is_jumping = true;
                    if(!player.spin && !player.flying) animation = sprite_get_animation(sprite_id, 1);
                    if(!inside_loop(player)) {
                        if(!player.flying) actor_move(act, v2d_new(-6.5*diff, 0));
                        act.speed = v2d_new(0, -0.9*Math.abs(act.speed.x));
                    }
                }

            } else {
                act.angle = NATURAL_ANGLE;
                if(!player.flying) actor_move(act, v2d_new(-5*diff, 0));
                act.is_jumping = true;
                act.ignore_horizontal = false;
            }
            if(act.mirror & IF_HFLIP) friction = 1.5;
        }

        // (270-360) slope
        else if(ang > 270 && ang < 360) {
            feet.y = brick_tmp.y - (act.position.x-brick_tmp.x)*Math.tan(act.angle);
            if(act.speed.x>0) feet.y += 2.0;
            act.position.y = feet.y+diff;
            if(act.mirror & IF_HFLIP) friction = 0.2;
        }
    }

    /**************************************************/

    // x-axis
    ds.x = (Math.abs(act.speed.x) > EPSILON) ? act.speed.x*dt + 0.5*((1.0-friction)*act.acceleration)*(dt*dt) : 0;
    if(input_button_down(act.input, IB_LEFT) && !input_button_down(act.input, IB_RIGHT) && !player.spin && !player.braking && !player.landing && !player.getting_hit && player.lock_accel != LOCKACCEL_LEFT && !at_left_border) {
        if(!act.ignore_horizontal && (act.is_jumping || player.spring || is_walking || !input_button_down(act.input, IB_DOWN))) {
            act.mirror = IF_HFLIP;
            friction = (act.speed.x > 0) ? -1.0 : friction;
            if(act.speed.x >= -maxspeed*1.1)
                act.speed.x = Math.max(act.speed.x - (1.0-friction)*act.acceleration*dt, -maxspeed);
        }
    }
    else if(input_button_down(act.input, IB_RIGHT) && !input_button_down(act.input, IB_LEFT) && !player.spin && !player.braking && !player.landing && !player.getting_hit && player.lock_accel != LOCKACCEL_RIGHT && !at_right_border) {
        if(!act.ignore_horizontal && (act.is_jumping || player.spring || is_walking || !input_button_down(act.input, IB_DOWN))) {
            act.mirror = 0;
            friction = (act.speed.x < 0) ? -1.0 : friction;
            if(act.speed.x <= maxspeed*1.1)
                act.speed.x = Math.min(act.speed.x + (1.0-friction)*act.acceleration*dt, maxspeed);
        }
    }
    else if(brick_down) {
        let signal = 0;
        let ang = brick_down.brick_ref.angle;
        let factor = 0.0;

        // deceleration factor
        if(player.spin)
            factor = 0.65;
        else if(player.braking)
            factor = 4.5;
        else if(player.landing)
            factor = 0.6;
        else
            factor = 1.0;

        // deceleration
        if(ang % 90 == 0) {
            if(ang == 90)
                signal = -1;
            else if(ang == 270)
                signal = 1;
            else {
                if(act.speed.x > EPSILON) signal = -1;
                else if(-(act.speed.x) > EPSILON) signal = 1;
                else signal = 0;
            }
        }
        else if((ang > 90 && ang < 180) || (ang > 180 && ang < 270)){
            if(act.speed.x > EPSILON) signal = -1;
            else if(-(act.speed.x) > EPSILON) signal = 1;
            else signal = 0;
        }

        act.speed.x += signal*factor*act.acceleration*dt;
    }
  }

  /* spring mode */
  if(player.spring) {
    animation = sprite_get_animation(sprite_id, act.speed.y <= 0 ? 13 : 1);
    if(act.speed.y > 0) {
      player.spring = false;
      act.is_jumping = false;
    }
  }

  /* got hurt? */
  if(player.getting_hit) {
    if(!brick_down)
      animation = sprite_get_animation(sprite_id, 11);
    else
      player.getting_hit = false;
  }

  /* character's specific routines */
  switch(player.type) {
    case PL_SONIC:
        break;

    case PL_TAILS:
        // tails can fly
        player.flight_timer += dt;
        if(brick_down && brick_down.brick_ref.angle != 90 && brick_down.brick_ref.angle != 270) { player.flying = false; player.flight_timer = 0; }
        if(((act.is_jumping && act.speed.y>-act.jump_strength/3 && !block_tails_flight && !player.getting_hit) || player.flying) && input_button_pressed(act.input, IB_FIRE1) && !player.getting_hit) {
            if(player.flight_timer < TAILS_MAX_FLIGHT) {
                if(!player.flying) player.flight_timer = 0;
                act.speed.y = -level_gravity()*0.1;
                player.flying = true;
                act.is_jumping = false;
                player.is_fire_jumping = false;
            }
        }
        if(player.flying) {
            animation = sprite_get_animation(sprite_id, act.carrying ? 16 : 20);
            act.speed.x = clip(act.speed.x, -act.maxspeed/2, act.maxspeed/2);
            if(player.flight_timer >= TAILS_MAX_FLIGHT) {
                // i'm tired of flying...
                let smp = soundfactory_get("tired of flying");
                if(!sound_is_playing(smp)) sound_play(smp);
                animation = sprite_get_animation(sprite_id, 19);
            }
            else {
                let smp;
                let i;

                // i'm flying! :)
                if(inside_loop(player)) act.angle = NATURAL_ANGLE;
                smp = soundfactory_get("flying");
                if(!sound_is_playing(smp)) sound_play(smp);

                // pick up: let's carry someone...
                for(i=0; i<team.length && act.carrying == null; i++) {
                    if(team[i] != player && act.speed.y <= 0) {
                        let ra = [ team[i].actor.position.x+actor_image(team[i].actor).width*0.3, team[i].actor.position.y, team[i].actor.position.x+actor_image(team[i].actor).width*0.7, team[i].actor.position.y+actor_image(team[i].actor).height*0.2 ];
                        let rb = [ act.position.x+actor_image(act).width*0.3, act.position.y+actor_image(act).height*0.7, act.position.x+actor_image(act).width*0.7, act.position.y+actor_image(act).height ];
                        let collision = bounding_box(ra, rb);
                        let can_be_carried = (team[i].actor.carried_by == null && !team[i].dying && !team[i].dead && !team[i].climbing && !team[i].landing && !team[i].getting_hit);
                        if(collision && can_be_carried && !brick_down) {
                            act.carrying = team[i].actor;
                            team[i].actor.carried_by = act;
                            team[i].spin = team[i].spin_dash = team[i].braking = team[i].flying = team[i].spring = team[i].on_moveable_platform = false;
                            sound_play( soundfactory_get("touch the wall") );
                        }
                    }
                }
            }
        }
        else if(act.animation == sprite_get_animation(sprite_id, act.carrying ? 16 : 20))
            animation = sprite_get_animation(sprite_id, 1); // if you're not flying, don't play the flying animation

        break;

    case PL_KNUCKLES:
        // knuckles can fly too!
        if(((act.is_jumping && act.speed.y>-0.7*act.jump_strength) || player.flying) && input_button_pressed(act.input, IB_FIRE1) && !brick_down && !player.getting_hit) {
            act.speed.y = 50;
            player.flying = true;
            act.is_jumping = false;
            player.is_fire_jumping = false;
            act.speed.x = (act.mirror & IF_HFLIP) ? Math.min(-100, act.speed.x) : Math.max(100, act.speed.x);
        }


        // fly?
        if(player.flying) {
            let turning = (input_button_down(act.input, IB_LEFT) && act.speed.x > 0) || (input_button_down(act.input, IB_RIGHT) && act.speed.x < 0);
            let floor = (brick_down && Math.abs(brick_down.brick_ref.angle*PI/180.0 - NATURAL_ANGLE) < EPSILON);
            turning = (act.animation == sprite_get_animation(sprite_id, 21)) && !actor_animation_finished(act);

            // i'm flying...
            if(!floor && act.animation != sprite_get_animation(sprite_id, 19) && !player.landing) {
                if(!(act.mirror & IF_HFLIP)) {
                    animation = sprite_get_animation(sprite_id, turning ? 21 : 20);
                    act.speed.x = Math.min(act.speed.x + (0.5*act.acceleration)*dt, maxspeed/2);
                }
                else {
                    animation = sprite_get_animation(sprite_id, turning ? 21 : 20);
                    act.speed.x = Math.max(act.speed.x - (0.5*act.acceleration)*dt, -maxspeed/2);
                }
            }

            // end of flight
            if(floor) {
                // collided with the floor
                player.landing = true;
                act.is_jumping = false;
                animation = sprite_get_animation(sprite_id, 19);
                act.speed.y = 0; ds.y = 0;
                player.climbing = false;
            }
            else if(input_button_up(act.input, IB_FIRE1)) {
                // knuckles doesn't want to fly anymore
                player.flying = false;
                animation = sprite_get_animation(sprite_id, 18);
            }
            else {
                let t;
                let try_me = [ brick_left , brick_downleft , brick_right , brick_downright , brick_down ];
                for(t=0; t<try_me.length; t++) {
                    brick_tmp = try_me[t];
                    if(brick_tmp && brick_tmp.brick_ref.angle%90!=0) {
                        // collided with a slope while flying?
                        player.flying = false;
                        player.landing = false;
                    }
                }
            }

            // wall climbing - begin
            if(!floor && !brick_up) {
                if((brick_left && brick_left.brick_ref.angle%90==0) || (brick_right && brick_right.brick_ref.angle%90==0)) {
                    player.climbing = true;
                    player.flying = false;
                    sound_play( soundfactory_get("touch the ground") );
                }
            }
        }

        // no more landing
        if(player.landing) {
            if(Math.abs(act.speed.x) < EPSILON || !brick_down)
                player.flying = player.landing = false;
        }

        // wall climbing
        if(player.climbing) {
            let pre_ds = v2d_new(0,0);
            act.speed.x = ds.x = 0;
            if(brick_left && !brick_right) act.mirror |= IF_HFLIP;
            if(brick_right && !brick_left) act.mirror &= ~IF_HFLIP;

            // climbing a moving brick
            pre_ds = v2d_add(pre_ds, v2d_multiply(level_brick_move_actor(brick_left, act), dt));
            pre_ds = v2d_add(pre_ds, v2d_multiply(level_brick_move_actor(brick_right, act), dt));
            if((pre_ds.y <= 0 && !brick_up) || (pre_ds.y >= 0 && !brick_down) || (!brick_left && brick_right))
              ds = v2d_add(ds, pre_ds);

            // climbing...
            if(brick_left || brick_right) {

                // knuckles doesn't want to climb the wall anymore
                if(input_button_pressed(act.input, IB_FIRE1)) {
                    let an_a = sprite_get_animation(sprite_id, 17);
                    let an_b = sprite_get_animation(sprite_id, 22);
                    if(act.animation == an_a || act.animation == an_b) { // no wall kicking
                        player.climbing = false;
                        act.is_jumping = true;
                        player.is_fire_jumping = true;
                        act.speed.x = ((act.mirror&IF_HFLIP)?1:-1)*0.7*act.jump_strength;
                        act.speed.y = -0.5*act.jump_strength;
                        if(brick_left && !brick_right) act.mirror &= ~IF_HFLIP;
                        if(!brick_left && brick_right) act.mirror |= IF_HFLIP;
                        animation = sprite_get_animation(sprite_id, 3);
                        sound_play( soundfactory_get("jump") );
                    }
                }
                else {
                    // up or down?
                    if(input_button_down(act.input, IB_UP)) {
                        if(!brick_up) {
                            ds.y = (-maxspeed*0.1) * dt;
                            animation = sprite_get_animation(sprite_id, 17);
                        }
                    }
                    else if(input_button_down(act.input, IB_DOWN)) {
                        if(!brick_down) {
                            ds.y = (maxspeed*0.1) * dt;
                            animation = sprite_get_animation(sprite_id, 17);
                        }
                        else
                            player.climbing = false; // reached the ground
                    }
                    else
                        animation = sprite_get_animation(sprite_id, 22);
                }
            }

            // end of wall climbing
            else {
                brick_tmp = (act.mirror&IF_HFLIP) ? brick_downleft : brick_downright;
                if(brick_tmp) {
                    animation = sprite_get_animation(sprite_id, 23);
                    act.ignore_horizontal = true;
                    ds = v2d_add(ds, v2d_multiply(level_brick_move_actor(brick_tmp, act), dt));
                    if(actor_animation_finished(act)) {
                        player.climbing = false;
                        act.ignore_horizontal = false;
                        act.speed = v2d_new(((act.mirror&IF_HFLIP)?-1:1)*maxspeed*0.15, -level_gravity()/12.5);
                        ds.x = ((act.mirror&IF_HFLIP)?-1:1)*5;
                    }
                }
                else {
                    player.climbing = false;
                    act.is_jumping = true;
                    animation = sprite_get_animation(sprite_id, 3);
                }
            }
        }
        break;
  }

  /* almost done... */
  player.at_some_border = false;
  if(animation) {
    actor_change_animation(act, animation);
  }
  if(Math.abs(act.speed.x) < 4) {
    player.braking = false;
    if( (!input_button_down(act.input, IB_RIGHT) && !input_button_down(act.input, IB_LEFT)) || (input_button_down(act.input, IB_RIGHT) && input_button_down(act.input, IB_LEFT)) || player.spin || player.landing ) {
        ds.x = 0;
        act.speed.x = 0;
    }
  }

  ds.x += level_brick_move_actor(brick_down,act).x*dt; // moveable platforms II
  ds.x = ((act.position.x<=act.hot_spot.x) && act.speed.x<0) ? 0 : ds.x;
  ds.x = ((act.position.x>=level_size().x - (actor_image(act).width-act.hot_spot.x)) && act.speed.x>0) ? 0 : ds.x;

  return ds;
}

/**
 * player_hit()
 * Hits a player. If it has no rings, then
 * it must die
 */
export const player_hit = (player:player_t) => {
  let act = player.actor;
  let ring
  let i;
  let get_hit = false;

  if(!player.blinking && !player.dying && !player.invincible) {
    drop_glasses(player);
    if(player.shield_type != SH_NONE) {
      // lose shield
      get_hit = true;
      player.shield_type = SH_NONE;
      sound_play(soundfactory_get("death"));
    }
    else if(rings > 0) {
      // lose rings
      get_hit = true;
      for(i=0; i<Math.min(player_get_rings(), 15); i++) {
        ring = level_create_item(IT_RING, act.position);
        ring_start_bouncing(ring);

        // start bouncing
        //ring.is_moving = true;
        //ring.actor.speed.x = ring.actor.maxspeed * ((random(100))-50)/100;
        //ring.actor.speed.y = -ring.actor.jump_strength + (random(ring.actor.jump_strength));
      }
      player_set_rings(0);
      sound_play(soundfactory_get("ringless"));
    }
    else {
      // death
      player_kill(player);
    }
  }

  if(get_hit) {
    player.getting_hit = true;
    player.flying = player.landing = player.climbing = player.spring = false;
    player.is_fire_jumping = false;
    player.spin_dash = player.spin = false;
    player.blinking = true;
    player.blink_timer = 0;
    act.speed.x = act.mirror&IF_HFLIP ? 200 : -200;
    act.speed.y = -(act.jump_strength*0.75);
    actor_move(act, v2d_new(0, -5));
  }
}

/**
 * player_kill()
 * Kills a player
 */
export const player_kill = (player:player_t) => {
  if(!player.dying) {
    drop_glasses(player);
    player.shield_type = SH_NONE;
    player.invincible = false;
    player.got_speedshoes = false;
    player.dying = true;
    player.death_timer = 0;
    player.spring = false;
    player.actor.speed.y = -player.actor.jump_strength*1.2;
    player.flying = player.climbing = player.landing = false;
    player.is_fire_jumping = false;
    player.spin = player.spin_dash = false;
    player.blinking = false;
    sound_play( soundfactory_get("death") );
  }
}

/**
 * player_bounce()
 * Bounces
 */
export const player_bounce = (player:player_t) => {
  input_simulate_button_down(player.actor.input, IB_FIRE1);
  player.spring = false;
  player.actor.speed.y = -player.actor.jump_strength;
  player.actor.is_jumping = true;
  player.is_fire_jumping = false;
  player.flying = false;
}

/**
 * player_attacking()
 * Returns TRUE if a given player is attacking;
 * FALSE otherwise
 */
export const player_attacking = (player:player_t) => {
  let jump = sprite_get_animation(get_sprite_id(player.type), 3);
  return player.spin || player.spin_dash ||
    (player.actor.animation == jump) ||
    (player.type == PL_KNUCKLES && (player.landing || player.flying));
}

/**
 * player_get_rings()
 * Returns the amount of rings
 * the player has got so far
 */
export const player_get_rings = () => {
  return rings;
}

/**
 * player_get_lives()
 * How many lives does the player have?
 */
export const player_get_lives = () => {
  return lives;
}

/**
 * player_get_score()
 * Returns the score
 */
export const player_get_score = () => {
  return score;
}

/**
 * player_get_sprite_name()
 * Returns the name of the sprite used by the player
 */
export const player_get_sprite_name = (player:player_t) => {
  return get_sprite_id(player.type);
}

/**
 * player_set_rings()
 * Sets a new amount of rings
 */
export const player_set_rings = (r:number) => {
  rings = clip(r, 0, 9999);

  /* (100+) * k rings (k integer) = new life! */
  if(r/100 >= hundred_rings) {
    hundred_rings+= 1;
    player_set_lives( player_get_lives()+1 );
    level_override_music( soundfactory_get("1up") );
  }
}

/**
 * player_set_lives()
 * Sets the number of lives
 */
export const player_set_lives = (l:number) => {
  lives = l;
}

/**
 * player_set_score()
 * Sets the score
 */
export const player_set_score = (s:number) => {
  score = s;
}

const get_sprite_id = (player_type:number) => {
  switch(player_type) {
    case PL_SONIC:
      return "SD_SONIC";

    case PL_TAILS:
      return "SD_TAILS";

    case PL_KNUCKLES:
      return "SD_KNUCKLES";    

    default:
      return "null";
  }
}

const update_glasses = (p:player_t) => {
  //console.log(p)
  if (!p) return;
  if (!p.actor) return;
  let frame_id = 0;
  let hflip = p.actor.mirror & IF_HFLIP;
  let visible = true;
  let ang = old_school_angle(p.actor.angle);
  let gpos = v2d_new(0,0);
  let top = v2d_subtract(p.actor.position,v2d_rotate(v2d_new(0,p.actor.hot_spot.y),-ang));
  const anim = p.actor.animation;

  switch(p.type) {

    case PL_SONIC:
      if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 0)) {
        // stopped
        gpos = v2d_new(3,24);
        frame_id = 1;
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 1)) {
        // walking
        switch(~~p.actor.animation_frame) {
          case 0: frame_id = 2; gpos = v2d_new(5,23); break;
          case 1: frame_id = 2; gpos = v2d_new(4,25); break;
          case 2: frame_id = 1; gpos = v2d_new(7,25); break;
          case 3: frame_id = 1; gpos = v2d_new(5,23); break;
          case 4: frame_id = 1; gpos = v2d_new(5,23); break;
          case 5: frame_id = 1; gpos = v2d_new(4,24); break;
          case 6: frame_id = 2; gpos = v2d_new(6,24); break;
          case 7: frame_id = 2; gpos = v2d_new(6,23); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 2)) {
        // running
        frame_id = 1;
        gpos = v2d_new(8,26);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 5)) {
        // look up
        frame_id = 3;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(0,19);
        else
          gpos = v2d_new(-1,21);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 7)) {
        // braking
        frame_id = 1;
        if(~~p.actor.animation_frame < 2)
          gpos = v2d_new(8,26);
        else
          gpos = v2d_new(10,28);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 10)) {
        // almost falling / ledge
        frame_id = 1;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(1,22); break;
          case 1: gpos = v2d_new(-1,23); break;
          case 2: gpos = v2d_new(1,23); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 11)) {
        // ringless
        frame_id = 3;
        gpos = v2d_new(-4,30);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 12)) {
        // breathing
        frame_id = 3;
        gpos = v2d_new(1,19);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 13)) {
        // spring
        frame_id = 3;
        gpos = v2d_new(4,13);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 14)) {
        // pushing
        frame_id = 1;
        gpos = v2d_new(12,31);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 15)) {
        // waiting
        frame_id = 0;
        gpos = v2d_new(3,23);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_SONIC), 25)) {
        // being carried
        frame_id = 0;
        gpos = v2d_new(3,22);
      }
      else
        visible = false;
      break;

    case PL_TAILS:
      if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 0)) {
        // stopped
        gpos = v2d_new(5,34);
        frame_id = 1;
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 1)) {
        // walking
        frame_id = 2;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(2,33); break;
          case 1: gpos = v2d_new(3,33); break;
          case 2: gpos = v2d_new(8,33); break;
          case 3: gpos = v2d_new(3,32); break;
          case 4: gpos = v2d_new(1,33); break;
          case 5: gpos = v2d_new(3,33); break;
          case 6: gpos = v2d_new(7,33); break;
          case 7: gpos = v2d_new(3,32); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 2)) {
        // running
        frame_id = 2;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(7,35);
        else
          gpos = v2d_new(6,34);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 4)) {
        // crouch down
        frame_id = 1;
        gpos = v2d_new(9,44);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 5)) {
        // look up
        frame_id = 1;
        gpos = v2d_new(7,32);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 7)) {
        // braking
        frame_id = 1;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(2,33);
        else
          gpos = v2d_new(4,33);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 10)) {
        // almost falling / ledge
        frame_id = 4;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(5,33); break;
          case 1: gpos = v2d_new(6,33); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 11)) {
        // ringless
        frame_id = 1;
        gpos = v2d_new(1,33);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 12)) {
        // breathing
        frame_id = 1;
        gpos = v2d_new(6,28);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 13)) {
        // spring
        frame_id = 3;
        gpos = v2d_new(2,17);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 14)) {
        // pushing
        frame_id = 1;
        gpos = v2d_new(9,35);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 15)) {
        // waiting
        frame_id = 4;
        switch(~~p.actor.animation_frame) {
          case 0: case 8: case 9: case 10: gpos = v2d_new(5,34); break;
          default: gpos = v2d_new(5,33); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 16)) {
        // carrying
        frame_id = 1;
        gpos = v2d_new(8,37);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 19)) {
        // tired of flying
        frame_id = 1;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(9,39);
        else
          gpos = v2d_new(9,40);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 20)) {
        // flying
        frame_id = 1;
        gpos = v2d_new(8,39);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_TAILS), 25)) {
        // being carried
        frame_id = 1;
        gpos = v2d_new(0,23);
      }
      else
        visible = false;
      break;

    case PL_KNUCKLES:
      if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 0)) {
        // stopped
        frame_id = 1;
        gpos = v2d_new(1,24);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 1)) {
        // walking
        switch(~~p.actor.animation_frame) {
          case 0: frame_id = 1; gpos = v2d_new(5,29); break;
          case 1: frame_id = 2; gpos = v2d_new(5,29); break;
          case 2: frame_id = 2; gpos = v2d_new(8,29); break;
          case 3: frame_id = 2; gpos = v2d_new(9,28); break;
          case 4: frame_id = 1; gpos = v2d_new(6,28); break;
          case 5: frame_id = 1; gpos = v2d_new(6,29); break;
          case 6: frame_id = 1; gpos = v2d_new(5,28); break;
          case 7: frame_id = 1; gpos = v2d_new(4,27); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 2)) {
        // running
        frame_id = 1;
        gpos = v2d_new(7,29);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 4)) {
        // crouch down
        frame_id = 1;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(0,31);
        else
          gpos = v2d_new(0,40);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 5)) {
        // look up
        frame_id = 1;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(0,21);
        else
          gpos = v2d_new(-1,21);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 7)) {
        // braking
        frame_id = 0;
        gpos = v2d_new(-2,27);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 10)) {
        // almost falling / ledge
        frame_id = 1;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(9,30); break;
          case 1: gpos = v2d_new(8,27); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 11)) {
        // ringless
        frame_id = 1;
        gpos = v2d_new(-3,27);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 12)) {
        // breathing
        frame_id = 1;
        gpos = v2d_new(5,24);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 13)) {
        // spring
        frame_id = 3;
        gpos = v2d_new(-1,16);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 14)) {
        // pushing
        switch(~~p.actor.animation_frame) {
          case 0: frame_id = 1; gpos = v2d_new(5,29); break;
          case 1: frame_id = 2; gpos = v2d_new(5,29); break;
          case 2: frame_id = 2; gpos = v2d_new(8,29); break;
          case 3: frame_id = 2; gpos = v2d_new(9,28); break;
          case 4: frame_id = 1; gpos = v2d_new(6,28); break;
          case 5: frame_id = 1; gpos = v2d_new(6,29); break;
          case 6: frame_id = 1; gpos = v2d_new(5,28); break;
          case 7: frame_id = 1; gpos = v2d_new(4,27); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 15)) {
        // waiting
        frame_id = 0;
        gpos = v2d_new(1,23);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 16)) {
        // no more climbing
        frame_id = 1;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(6,23); break;
          case 1: gpos = v2d_new(5,20); break;
          case 2: gpos = v2d_new(0,22); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 17)) {
        // climbing
        frame_id = 3;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(-1,22); break;
          case 1: gpos = v2d_new(-2,20); break;
          case 2: gpos = v2d_new(0,21); break;
          case 3: gpos = v2d_new(-1,24); break;
          case 4: gpos = v2d_new(0,23); break;
          case 5: gpos = v2d_new(0,22); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 18)) {
        // end of flight
        frame_id = 1;
        if(~~p.actor.animation_frame == 0)
          gpos = v2d_new(6,23);
        else
          gpos = v2d_new(5,20);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 19)) {
        // flying - ground
        frame_id = 1;
        gpos = v2d_new(8,44);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 20)) {
        // flying - air
        frame_id = 1;
        gpos = v2d_new(8,39);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 21)) {
        // flying - turn
        frame_id = 4;
        switch(~~p.actor.animation_frame) {
          case 0: gpos = v2d_new(-8,41); break;
          case 1: gpos = v2d_new(0,43); break;
          case 2: gpos = v2d_new(10,41); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 22)) {
        // climbing - stopped
        frame_id = 3;
        gpos = v2d_new(0,22);
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 23)) {
        // climbing - reached the top
        switch(~~p.actor.animation_frame) {
          case 0: frame_id = 3; gpos = v2d_new(7,17); break;
          case 1: frame_id = 3; gpos = v2d_new(11,15); break;
          case 2: frame_id = 0; gpos = v2d_new(12,13); break;
        }
      }
      else if(anim == sprite_get_animation(get_sprite_id(PL_KNUCKLES), 25)) {
        // being carried
        frame_id = 0;
        gpos = v2d_new(0,23);
      }
      else
        visible = false;
      break;
  }

  //console.log('UPDATE GLASSES',p.glasses)

  gpos.x *= hflip ? -1 : 1;
  actor_change_animation(p.glasses, sprite_get_animation("SD_GLASSES", frame_id));
  p.glasses.position = v2d_add(top, v2d_rotate(gpos, -ang));
  p.glasses.angle = ang;
  p.glasses.mirror = p.actor.mirror;
  p.glasses.visible = visible && p.actor.visible;
  return p;
}

const drop_glasses = (p:player_t) => {
  /*if(p.got_glasses) {
      let pos = v2d_add(p.actor.position, v2d_new(0,-27));
      let item = level_create_item(IT_FALGLASSES, pos);
      falglasses_set_speed(item, v2d_new(-0.2 * p.actor.speed.x, -490.0));
      p.got_glasses = false;
  }*/
}

const update_shield = (p:player_t) => {
  let sh = p.shield;
  let act = p.actor;
  let off = v2d_new(0,0);

  switch(p.shield_type) {

    case SH_SHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_SHIELD", 0));
      break;

    case SH_FIRESHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_FIRESHIELD", 0));
      break;

    case SH_THUNDERSHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_THUNDERSHIELD", 0));
      break;

    case SH_WATERSHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_WATERSHIELD", 0));
      break;

    case SH_ACIDSHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_ACIDSHIELD", 0));
      break;

    case SH_WINDSHIELD:
      off = v2d_new(0,-22);
      sh.position = v2d_add(act.position, v2d_rotate(off, -old_school_angle(act.angle)));
      actor_change_animation(sh, sprite_get_animation("SD_WINDSHIELD", 0));
      break;
  }
}

/* is the player inside a loop? */
const inside_loop = (p:player_t) => {
  //console.log('INSIDE LOOP',p.disable_wall != PLAYER_WALL_NONE)
  return (p.disable_wall !== PLAYER_WALL_NONE);
}

/* the player won't leave the floor unless necessary */
const stickyphysics_hack = (player:player_t, brick_list:brick_list_t, brick_downleft:brick_t, brick_down:brick_t, brick_downright:brick_t) => {
  let act = player.actor;
  let oldy = act.position.y;

  let rs:any = {};
  rs.brick_downleft = brick_downleft;
  rs.brick_down = brick_down;
  rs.brick_downright = brick_downright;

  if(null == brick_down && !act.is_jumping && !player.is_fire_jumping && !player.flying && !player.climbing && !player.landing && !player.spring && !player.getting_hit && !player.dead && !player.dying) {
      let i;
      let sqrsize=2, diff=-2;
      let downleft, down, downright;
      for(i=0; i<8; i++) {
          act.position.y = oldy + (1+i);
          let corners = actor_corners(act, sqrsize, diff, brick_list, null, null, null, downright, down, downleft, null, null);
          if(null != corners.down) {
              rs.brick_downleft = corners.downleft;
              rs.brick_down = corners.down;
              rs.brick_downright = corners.downright;
              return rs;
          }
      }
  }

  act.position.y = oldy;

  return;
}

/* aaaargh!! the player is being crushed! */
const got_crushed = (p:player_t, brick_up:brick_t, brick_right:brick_t, brick_down:brick_t, brick_left:brick_t) => {
  let sx, sy, t;

  if(p.climbing)
      return false;

  /* y-axis */
  if(brick_up && brick_down && brick_up != brick_down) {
      if(brick_up.brick_ref.behavior == BRB_CIRCULAR && brick_up.brick_ref.property == BRK_OBSTACLE) {
          t = brick_up.value[0];
          sy = brick_up.brick_ref.behavior_arg[3];
          if(Math.sin(sy * t) > 0) return true; /* crushed! */
      }

      if(brick_down.brick_ref.behavior == BRB_CIRCULAR && brick_down.brick_ref.property == BRK_OBSTACLE) {
          t = brick_down.value[0];
          sy = brick_down.brick_ref.behavior_arg[3];
          if(Math.sin(sy * t) < 0) return true; /* crushed! */
      }
  }

  /* x-axis */
  if(brick_left && brick_right && brick_left != brick_right) {
      if(brick_left.brick_ref.behavior == BRB_CIRCULAR && brick_left.brick_ref.property == BRK_OBSTACLE) {
          t = brick_left.value[0];
          sx = brick_left.brick_ref.behavior_arg[2];
          if(Math.cos(sx * t) > 0) return true; /* crushed! */
      }

      if(brick_right.brick_ref.behavior == BRB_CIRCULAR && brick_right.brick_ref.property == BRK_OBSTACLE) {
          t = brick_right.value[0];
          sx = brick_right.brick_ref.behavior_arg[2];
          if(Math.cos(sx * t) < 0) return true; /* crushed! */
      }
  }

  /* I'm not being crushed */
  return false;
}
