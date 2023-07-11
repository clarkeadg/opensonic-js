import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_multiply, v2d_add } from "./../../core/v2d"
import { actor_create, actor_render, actor_destroy, actor_collision, actor_change_animation } from "./../actor"
import { IS_IDLE, IS_DEAD } from "./../item"

export interface dangerouspower_t extends item_t {}

export const dangerouspower_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const dangerouspower_set_speed = (dangpower:item_t, speed:v2d_t) => {
  dangpower.actor.speed = speed;
}

const init = (item:item_t) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_DANGPOWER", 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  let sqrsize = 2, diff = -2;
  let dt = timer_get_delta();
  let act = item.actor;
  let ds = v2d_multiply(act.speed, dt);
  let bu, bd, bl, br, brk = null;

  /* stop! */
  //if(level.editmode())
  //  return;

  /* hit the player */
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if(player && !player.dying && actor_collision(act, player.actor)) {
      player.hit(player);
      item.state = IS_DEAD;
    }
  }

  /* hit a brick */
  /*actor_corners(act, sqrsize, diff, brick_list, bu, null, br, null, bd, null, bl, null);
  actor_handle_clouds(act, diff, bu, null, br, null, bd, null, bl, null);
  if( null != (brk = (bd ? bd : (br ? br : (bl ? bl : (bu ? bu : null))))) ) {
    // destroy the brick 
    if(brk.brick_ref.angle == 0 && brk.y >= act.spawn_point.y+70) {
      var brkimg = brk.brick_ref.image;
      var bw=brkimg.w/5, bh=brkimg.h/5, bi, bj;

      // particles 
      for(bi=0; bi<bw; bi++) {
        for(bj=0; bj<bh; bj++) {
          var piecepos = v2d.new_v2d(brk.x + (bi*brkimg.w)/bw, brk.y + (bj*brkimg.h)/bh);
          var piecespeed = v2d.new(-40+(util.random(80)), -70-(util.random(70)));
          var piece = image.create(brkimg.w/bw, brkimg.h/bh);

          image.blit(brkimg, piece, (bi*brkimg.w)/bw, (bj*brkimg.h)/bh, 0, 0, piece.w, piece.h);
          level.create_particle(piece, piecepos, piecespeed, false);
        }
      }

      // bye! 
      //audio.sound_play( soundfactory.get("break") );
      brk.state = BRS_DEAD;
    }

    // destroy this power 
    item.state = IS_DEAD;
  }*/

  /* movement */
  act.position = v2d_add(act.position, ds);
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
} 

