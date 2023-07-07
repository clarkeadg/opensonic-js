
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_multiply, v2d_add } from "./../../core/v2d"
import { actor_create, actor_render, actor_destroy, actor_collision, actor_change_animation } from "./../actor"
import { IS_IDLE, IS_DEAD } from "./../item"

export const dangerouspower_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;
  item.dangerouspower_set_speed = dangerouspower_set_speed;

  return item;
}

export const dangerouspower_set_speed = (dangpower, speed) => {
  dangpower.actor_speed = speed;
}

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_DANGPOWER", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let i;
  let sqrsize = 2, diff = -2;
  let dt = timer_get_delta();
  let act = item.actor;
  let ds = v2d_multiply(act.speed, dt);
  let bu, bd, bl, br, brk = null;

  /* stop! */
  //if(level.editmode())
  //  return;

  /* hit the player */
  for(i=0; i<team_size; i++) {
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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
} 

