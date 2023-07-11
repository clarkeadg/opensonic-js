
import { random } from "./../core/util"
import { IF_NONE, IF_HFLIP, PI } from "./../core/global"
import { v2d_new, v2d_multiply, v2d_normalize } from "./../core/v2d"
import { timer_get_delta, timer_get_ticks } from "./../core/timer"
import { input_create_computer, input_simulate_button_down, IB_RIGHT, IB_LEFT } from "./../core/input"
//import { image_draw } from "./../core/image"
import { sprite_get_animation, sprite_get_image } from "./../core/sprite"
import { VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { sound_play } from "./../core/audio"
import { soundfactory_get } from "./../core/soundfactory"
import { IT_EXPLOSION, IT_DANGPOWER, IT_FIREBALL } from "./item"
import { dangerouspower_set_speed } from "./items/dangpower"
import { actor_create, actor_destroy, actor_image, actor_pixelperfect_collision, actor_change_animation, actor_move, actor_corners, actor_handle_clouds, actor_eightdirections_movement, actor_render, actor_animation_finished } from "./actor"
import { level_kill_all_baddies, level_player, level_create_enemy, level_create_item, level_boss_battle } from "./../scenes/level"

/* boss list */
const BOSSDATA_MAX       = 4;
const BT_SIMPLEBOSS      = 0;
const BT_MECHASHADOW     = 1;
const BT_SIMPLEBOSSEX    = 2;
const BT_MECHASHADOWEX   = 3;

/* boss state */
const BS_IDLE            = 0;
const BS_DEAD            = 1;
const BS_ACTIVE          = 2; /* generic action */

/* boss direction */
const BD_UP              = 0;
const BD_RIGHT           = 1;
const BD_DOWN            = 2;
const BD_LEFT            = 3;

const BOSSDATA_MAXVALUES  = 10;

export const boss_create = (type, spawn_point, rx, ry, rw, rh) => {
  let i;
  let act;
  let boss = {};

  boss.type = type;
  boss.state = BS_IDLE;
  boss.rect_x = rx;
  boss.rect_y = ry;
  boss.rect_w = rw;
  boss.rect_h = rh;
  boss.value = [];
  for(i=0; i<BOSSDATA_MAXVALUES; i++)
    boss.value[i] = 0;

  boss.bring_to_front = false;
  boss.actor = act = actor_create();
  act.spawn_point = v2d_new(spawn_point.x, spawn_point.y);
  act.position = v2d_new(spawn_point.x, spawn_point.y);
  act.input = input_create_computer();

  switch(type) {

    /* Simple Boss */
    case BT_SIMPLEBOSS:
    case BT_SIMPLEBOSSEX:
      actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 0));
      boss.initial_hp = boss.hp = 3;
      boss.direction = BD_LEFT;
      act.maxspeed = 100;
      act.acceleration = 100;
      break;

    /* Mecha Shadow */
    case BT_MECHASHADOW:
    case BT_MECHASHADOWEX:
      actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 0));
      boss.initial_hp = boss.hp = 10;
      boss.direction = BD_LEFT;
      act.maxspeed = 100;
      act.acceleration = 100;
      break;
  }

  return boss;
}

export const boss_destroy = (boss) => {
  actor_destroy(boss.actor);
  //free(boss);
}

export const boss_update = (boss, team, brick_list) => {
  let act = boss.actor;
  let up = null, upright = null, right = null, downright = null;
  let down = null, downleft = null, left = null, upleft = null;
  let corners = [];
  let sqrsize = 2, diff = -2;

  let corners1 = actor_corners(act, sqrsize, diff, brick_list, up, upright, right, downright, down, downleft, left, upleft);
  up = corners1.up;
  upright = corners1.upright;
  right = corners1.right;
  downright = corners1.downright;
  down = corners1.down; 
  downleft = corners1.downleft;
  left = corners1.left;
  upleft = corners1.upleft;

  let corners2 = actor_handle_clouds(act, diff, up, upright, right, downright, down, downleft, left, upleft);
  up = corners2.up;
  upright = corners2.upright;
  right = corners2.right;
  downright = corners2.downright;
  down = corners2.down; 
  downleft = corners2.downleft;
  left = corners2.left;
  upleft = corners2.upleft;

  corners[0] = up; corners[1] = upright; corners[2] = right; corners[3] = downright;
  corners[4] = down; corners[5] = downleft; corners[6] = left; corners[7] = upleft;

  // the player must be fighting against me! bwahawhawh! 
  if(!level_boss_battle())
    return;

  // noooooooooooooo...! i've lost the battle :'-( 
  if(boss.hp <= 0 && boss.state != BS_DEAD) {
    level_kill_all_baddies();
    boss.state = BS_DEAD;
  }

  // which boss? 
  switch(boss.type) {

    // Simple Boss (what a great name!) 
    case BT_SIMPLEBOSS:
      bossprog_simpleboss(boss, team, brick_list, corners);
      break;

    // Mecha Shadow 
    case BT_MECHASHADOW:
      bossprog_mechashadow(boss, team, brick_list, corners);
      break;

    // Simple Boss Ex 
    case BT_SIMPLEBOSSEX:
      bossprog_simplebossex(boss, team, brick_list, corners);
      break;

    // Mecha Shadow Ex 
    case BT_MECHASHADOWEX:
      bossprog_mechashadowex(boss, team, brick_list, corners);
      break;
  }
}

export const boss_render = (boss, camera_position) => {
  render_details(boss, camera_position, true);
  actor_render(boss.actor, camera_position);
  render_details(boss, camera_position, false);
}

export const boss_defeated = (boss) => {
  return (boss.state == BS_DEAD);
}   


const got_attacked = (boss, team) => {
  let i;

  for(i=0; i<team.length && boss.state != BS_DEAD; i++) {
    if (team[i]) {
      if(actor_pixelperfect_collision(boss.actor, team[i].actor)) {
          if(team[i].attacking(team[i]) || team[i].invincible) {
              return true;
          }
          else {
              team[i].hit(team[i]);
              return false;
          }
      }
    }
  }

  return false;
}

const render_details = (boss, camera_position, before_boss_render) => {
  let act = boss.actor;
  let t = timer_get_ticks() * 0.001;

  /* boss type */
  switch(boss.type) {

    /* Mecha Shadow Ex */
    case BT_MECHASHADOWEX:
    {
      let i, n = 5;
      let pos = v2d_new(0,0);
      let star = sprite_get_image( sprite_get_animation("SD_INVSTAR", 0), 1 );

      if(boss.state != BS_DEAD) {
        for(i=0; i<n; i++) {
          pos.x = act.position.x + 20*Math.cos(2*PI*t + (i*2*PI)/n);
          pos.y = act.position.y + 20*Math.sin(PI*t + (i*2*PI)/n);
          //if( (before_boss_render && pos.y < act.position.y) || (!before_boss_render && pos.y >= act.position.y) )
          //  image_draw(star, video_get_backbuffer(), pos.x+VIDEO_SCREEN_W/2-camera_position.x, pos.y+VIDEO_SCREEN_H/2-camera_position.y, IF_NONE);
        }
      }

      break;
    }
  }
}

/* boss programming */

const bossprog_simpleboss = (boss, team, brick_list, corners) => {
  let player = level_player();

  const t = timer_get_ticks()*.001;
  let act = boss.actor;

  let lastthrow = boss.value[0];
  let explosiontimer = boss.value[1];

  if(boss.state == BS_DEAD) {
    // dead 
    boss.bring_to_front = true;
    actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 2));
    act.position.y += 100*timer_get_delta();
    if(t >= explosiontimer + 0.15) {
        let pos = v2d_new(act.position.x-act.hot_spot.x+(random(actor_image(act).width)), act.position.y-act.hot_spot.y+(random(actor_image(act).height)));
        level_create_item(IT_EXPLOSION, pos);
        if(act.position.y <= act.spawn_point.y + 1.5*VIDEO_SCREEN_H)
          sound_play( soundfactory_get("boss hit") );
        explosiontimer = t;
    }
  }
  else {
    // walk & float 
    act.maxspeed = 200 - (100/boss.initial_hp)*boss.hp;
    act.acceleration = act.maxspeed;
    if(act.position.x < act.spawn_point.x - 200) boss.direction = BD_RIGHT;
    if(act.position.x > act.spawn_point.x) boss.direction = BD_LEFT;
    if(boss.direction == BD_RIGHT) input_simulate_button_down(act.input, IB_RIGHT);
    else if(boss.direction == BD_LEFT) input_simulate_button_down(act.input, IB_LEFT);
    act.position.y = act.spawn_point.y + 20*Math.cos(PI * t);
    act.mirror = (boss.direction == BD_RIGHT) ? IF_NONE : IF_HFLIP;
    actor_move(act, actor_eightdirections_movement(act));

    //console.log(t, lastthrow, lastthrow + (2.0/boss.initial_hp)*boss.hp)
    // throw enemies 
    if(t >= lastthrow + (2.0/boss.initial_hp)*boss.hp) {
      let en_type = [ 0, 3 ];
      let en = level_create_enemy(en_type[ parseInt(random(2),10) ], act.position);
      en.actor.speed.y = -150-(random(50));
      lastthrow = t;        
    }

    // ouch! i'm being attacked! 
    if(got_attacked(boss, team) && act.animation == sprite_get_animation("SD_SIMPLEBOSS", 0)) {
      actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 1));
      sound_play( soundfactory_get("boss hit") );
      player.actor.speed.x *= -1;
      player.actor.speed.y = 100;
      boss.hp--;
    }
    if(actor_animation_finished(act))
      actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 0));

    boss.value[0] = lastthrow;
    boss.value[1] = explosiontimer;
  }
}

const bossprog_mechashadow = (boss, team, brick_list, corners) => {
  let player = level_player();

  let act = boss.actor;
  const t = timer_get_ticks()*0.001
  const dt = timer_get_delta();
  let being_hit;

  /* custom variables */
  let lastshot = boss.value[0];
  let lastatk = boss.value[1];
  let explosiontimer = boss.value[2];

  /* states */
  switch(boss.state) {
    /* stopped & shooting */
    case BS_IDLE:
    {
      /* movement */
      boss.direction = (player.actor.position.x < act.position.x) ? BD_LEFT : BD_RIGHT;
      act.position.y = act.spawn_point.y + 30*Math.cos(PI*t);

      /* animation */
      if(actor_animation_finished(act))
        actor.change_animation(act, sprite_get_animation("SD_MECHASHADOW", 0));

      /* shot! */
      if(t >= lastshot + 5.0) {
        let v = v2d_new(player.actor.position.x - act.position.x, player.actor.position.y - act.position.y);
        let shot;

        v = v2d_multiply(v2d_normalize(v), 200);
        shot = level_create_item(IT_DANGPOWER, act.position);
        dangerouspower_set_speed(shot, v);

        sound_play( soundfactory_get("big shot") );
        lastshot = t;
      }

      /* attack mode? */
      if(t >= lastatk + 15.0) {
        let med = boss.rect_x + boss.rect_w/2;
        boss.direction = (act.position.x > med) ? BD_LEFT : BD_RIGHT;
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 2));
        boss.state = BS_ACTIVE;
        lastatk = t;
      }

      break;
    }

    /* moving around */
    case BS_ACTIVE:
    {
      let delta = 100, amplitude = 100, xspeed = 200;
      let a = boss.rect_x + delta;
      let b = boss.rect_x + boss.rect_w - delta;
      let x = (b - a) + (act.position.x - a);

      /* movement */
      let sig = (boss.direction == BD_LEFT) ? -1 : 1;
      act.position.x += (sig*xspeed) * dt;
      act.position.y = act.spawn_point.y - amplitude * Math.sin( (PI/(b-a)) * x );

      /* animation */
      if(actor_animation_finished(act))
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 2));

      /* back to normal mode */
      if( (sig == -1 && act.position.x <= a) || (sig == 1 && act.position.x >= b) ) {
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 0));
        boss.state = BS_IDLE;
      }

      break;
    }

    /* dead */
    case BS_DEAD:
    {
      boss.bring_to_front = true;
      actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 4));
      act.position.y += 100*timer_get_delta();
      if(t >= explosiontimer + 0.15) {
        let pos = v2d_new(act.position.x-act.hot_spot.x+(random(actor_image(act).width)), act.position.y-act.hot_spot.y+(random(actor_image(act).height)));
        level_create_item(IT_EXPLOSION, pos);
        if(act.position.y <= act.spawn_point.y + 1.5*VIDEO_SCREEN_H)
          sound_play( soundfactory_get("boss hit") );
        explosiontimer = t;
      }

      break;
    }
  }

  /* ouch! i'm being attacked! */
  being_hit = (act.animation==sprite_get_animation("SD_MECHASHADOW",1)) || (act.animation==sprite_get_animation("SD_MECHASHADOW",3));
  if(got_attacked(boss, team) && !being_hit && boss.state != BS_DEAD) {
    act.animation = sprite_get_animation("SD_MECHASHADOW", (boss.state == BS_ACTIVE) ? 3 : 1);
    sound_play( soundfactory_get("boss hit") );
    boss.hp--;
    player.actor.speed.x *= -0.5;
    player.actor.speed.y = player.actor.jump_strength;
  }

  /* misc */
  act.mirror = (boss.direction == BD_RIGHT) ? IF_NONE : IF_HFLIP;
}

const bossprog_simplebossex = (boss, team, brick_list, corners) => {
  let player = level_player();

  const t = timer_get_ticks()*0.001;
  let act = boss.actor;

  let lastthrow = boss.value[0];
  let explosiontimer = boss.value[1];
  let lastfbthrow = boss.value[2];

  if(boss.state == BS_DEAD) {
    /* dead */
    boss.bring_to_front = true;
    actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 2));
    act.position.y += 100*timer_get_delta();
    if(t >= explosiontimer + 0.15) {
      let pos = v2d_new(act.position.x-act.hot_spot.x+(random(actor_image(act).width)), act.position.y-act.hot_spot.y+(random(actor_image(act).height)));
      level_create_item(IT_EXPLOSION, pos);
      if(act.position.y <= act.spawn_point.y + 1.5*VIDEO_SCREEN_H)
        sound_play( soundfactory_get("boss hit") );
      explosiontimer = t;
    }
  }
  else {
    /* walk & float */
    act.maxspeed = 200 - (100/boss.initial_hp)*boss.hp;
    act.acceleration = act.maxspeed;
    if(act.position.x < act.spawn_point.x - 200) boss.direction = BD_RIGHT;
    if(act.position.x > act.spawn_point.x) boss.direction = BD_LEFT;
    if(boss.direction == BD_RIGHT) input_simulate_button_down(act.input, IB_RIGHT);
    else if(boss.direction == BD_LEFT) input_simulate_button_down(act.input, IB_LEFT);
    act.position.y = act.spawn_point.y + 20*Math.cos(PI * t);
    act.mirror = (boss.direction == BD_RIGHT) ? IF_NONE : IF_HFLIP;
    actor_move(act, actor_eightdirections_movement(act));

    /* throw enemies */
    if(t >= lastthrow + (2.0/boss.initial_hp)*boss.hp) {
      let en_type = [ "9", "6" ];
      let en = level_create_enemy(en_type[ parseInt(random(2),10) ], act.position);
      en.actor.speed.y = -150-(random(50));
      lastthrow = t;        
    }

    /* throw fireballs */
    if(t >= lastfbthrow + (3.0/boss.initial_hp)*boss.hp) {
      let it = level_create_item(IT_FIREBALL, act.position);
      it.actor.speed.y = 100;
      sound_play( soundfactory_get("fire") );
      lastfbthrow = t;
    }

    /* ouch! i'm being attacked! */
    if(got_attacked(boss, team) && act.animation == sprite_get_animation("SD_SIMPLEBOSS", 0)) {
      actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 1));
      sound_play( soundfactory_get("boss hit") );
      player.actor.speed.x *= -1;
      player.actor.speed.y = 100;
      boss.hp--;
    }
    if(actor_animation_finished(act))
      actor_change_animation(act, sprite_get_animation("SD_SIMPLEBOSS", 0));

    boss.value[0] = lastthrow;
    boss.value[1] = explosiontimer;
    boss.value[2] = lastfbthrow;
  }
}

const bossprog_mechashadowex = (boss, team, brick_list, corners) => {
  let player = level_player();

  let act = boss.actor;
  const t = timer_get_ticks()*0.001, dt = timer_get_delta();
  let being_hit;

  /* custom variables */
  let lastshot = boss.value[0];
  let lastatk = boss.value[1];
  let explosiontimer = boss.value[2];
  let lastfb = boss.value[3];

  /* states */
  switch(boss.state) {
    /* stopped & shooting */
    case BS_IDLE:
    {
      /* movement */
      boss.direction = (player.actor.position.x < act.position.x) ? BD_LEFT : BD_RIGHT;
      act.position.y = act.spawn_point.y + 30*Math.cos(PI*t);

      /* animation */
      if(actor_animation_finished(act))
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 0));

      /* shot! */
      if(t >= lastshot + 4.0) {
        let v = v2d_new(player.actor.position.x - act.position.x, player.actor.position.y - act.position.y);
        let shot;

        v = v2d_multiply(v2d_normalize(v), 200);
        shot = level_create_item(IT_DANGPOWER, act.position);
        dangerouspower_set_speed(shot, v);

        sound_play( soundfactory_get("big shot") );
        lastshot = t;
      }

      /* attack mode? */
      if(t >= lastatk + 8.0) {
        let med = boss.rect_x + boss.rect_w/2;
        boss.direction = (act.position.x > med) ? BD_LEFT : BD_RIGHT;
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 2));
        boss.state = BS_ACTIVE;
        lastatk = t;
      }

      break;
    }

    /* moving around */
    case BS_ACTIVE:
    {
      let delta = 100, amplitude = 100, xspeed = 200;
      let a = boss.rect_x + delta;
      let b = boss.rect_x + boss.rect_w - delta;
      let x = (b - a) + (act.position.x - a);

      /* movement */
      let sig = (boss.direction == BD_LEFT) ? -1 : 1;
      act.position.x += (sig*xspeed) * dt;
      act.position.y = act.spawn_point.y - amplitude * Math.sin( (PI/(b-a)) * x );

      /* fireballs */
      if(t >= lastfb + 0.2) {
        let it = level_create_item(IT_FIREBALL, act.position);
        it.actor.speed.y = -200;
        sound_play( soundfactory_get("fire") );
        lastfb = t;
      }

      /* animation */
      if(actor_animation_finished(act))
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 2));

      /* back to normal mode */
      if( (sig == -1 && act.position.x <= a) || (sig == 1 && act.position.x >= b) ) {
        actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 0));
        boss.state = BS_IDLE;
      }

      break;
    }

    /* dead */
    case BS_DEAD:
    {
      boss.bring_to_front = true;
      actor_change_animation(act, sprite_get_animation("SD_MECHASHADOW", 4));
      act.position.y += 100*timer_get_delta();
      if(t >= explosiontimer + 0.15) {
        let pos = v2d_new(act.position.x-act.hot_spot.x+(random(actor_image(act).width)), act.position.y-act.hot_spot.y+(random(actor_image(act).height)));
        level_create_item(IT_EXPLOSION, pos);
        if(act.position.y <= act.spawn_point.y + 1.5*VIDEO_SCREEN_H)
          sound_play( soundfactory_get("boss hit") );
        explosiontimer = t;
      }

      break;
    }
  }

  /* ouch! i'm being attacked! */
  being_hit = (act.animation==sprite_get_animation("SD_MECHASHADOW",1)) || (act.animation==sprite_get_animation("SD_MECHASHADOW",3));
  if(got_attacked(boss, team) && !being_hit && boss.state != BS_DEAD) {
    act.animation = sprite_get_animation("SD_MECHASHADOW", (boss.state == BS_ACTIVE) ? 3 : 1);
    sound_play( soundfactory_get("boss hit") );
    boss.hp--;
    player.actor.speed.x *= -0.5;
    player.actor.speed.y = player.actor.jump_strength;
  }

  /* misc */
  act.mirror = (boss.direction == BD_RIGHT) ? IF_NONE : IF_HFLIP;

  boss.value[0] = lastshot;
  boss.value[1] = lastatk;
  boss.value[2] = explosiontimer;
  boss.value[3] = lastfb;
}

