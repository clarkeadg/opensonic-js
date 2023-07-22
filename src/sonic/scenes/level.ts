import { confirmbox_alert, confirmbox_selected_option } from "./confirmbox"
import { editor_init, editor_is_enabled, editor_want_to_activate, editor_enable, editor_update, editor_render, editor_release } from "./editor"
import { music_t, sound_t, music_load, music_play, music_pause, music_stop, music_set_volume, music_get_volume, music_is_playing, sound_play } from "./../core/audio"
//import { fileSaver_saveAs } from "./../core/filesaver"
import { data_level_t, data_level_boss_t, data_level_bricklist_t, data_level_itemlist_t, data_level_enemylist_t, data_level_dialogbox_t } from "./../core/data"
import { EPSILON, PI, IF_NONE, IF_HFLIP, INFINITY } from "./../core/global"
import { image_t, image_create, image_destroy, image_blit, image_draw, image_rgb } from "./../core/image"
import { input_button_pressed, input_is_ignored, input_ignore, input_restore, IB_FIRE2, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { lang_get, lang_getstring } from "./../core/lang"
import { logfile_message } from "./../core/logfile"
import { resourcemanager_getJsonFile } from "./../core/resourcemanager"
import { scenestack_push, scenestack_pop } from "./../core/scene"
import { storyboard_get_scene, SCENE_PAUSE, SCENE_GAMEOVER, SCENE_CONFIRMBOX } from "./../core/storyboard"
import { soundfactory_get } from "./../core/soundfactory"
import { sprite_get_animation, sprite_get_image } from "./../core/sprite"
import { timer_get_delta, timer_get_ticks } from "./../core/timer"
import { bounding_box, clip, random } from "./../core/util"
import { v2d_t, v2d_new, v2d_add, v2d_subtract } from "./../core/v2d"
import { video_fadefx_over, video_fadefx_out, video_get_backbuffer, video_clearDisplay, VIDEO_SCALE, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { actor_t, actor_create, actor_destroy, actor_change_animation, actor_render, actor_image } from "./../entities/actor"
import { bgtheme_t, background_load, background_update, background_render_bg, background_render_fg } from "./../entities/background"
import { boss_t, boss_create, boss_destroy, boss_update, boss_render, boss_defeated } from "./../entities/boss"
import { 
  brick_t,
  brick_list_t,
  brickdata_t,
  brick_size,
  brick_get,
  brick_load,
  brick_animate,
  brick_image,
  BRICKBEHAVIOR_MAXARGS,
  BRICK_MAXVALUES,
  BRB_DEFAULT,  
  BRB_BREAKABLE,
  BRB_FALL,
  BRB_FALL_TIME,
  BRB_CIRCULAR,
  BRK_NONE,
  BRK_OBSTACLE,
  BRK_CLOUD,
  BRS_IDLE,
  BRS_DEAD,
  BRS_ACTIVE
} from "./../entities/brick"
import { camera_get_position, camera_set_position, camera_init, camera_update, camera_move_to, camera_release, camera_lock, camera_unlock } from "./../entities/camera"
import { enemy_list_t, enemy_create, enemy_destroy, enemy_update, enemy_render, ES_DEAD } from "./../entities/enemy"
import { font_t, font_create, font_destroy, font_set_width, font_set_text, font_get_text, font_render } from "./../entities/font"
import { flyingtext_set_text } from "./../entities/items/flyingtext"
import { item_list_t, item_create, item_update, item_render, item_destroy, IT_ANIMAL, IT_FLYINGTEXT, IS_IDLE, IS_DEAD } from "./../entities/item"
import { 
  player_t,
  player_create,
  player_update, 
  player_render, 
  player_destroy, 
  player_hit, 
  player_kill, 
  player_set_rings, 
  player_set_lives, 
  player_set_score, 
  player_get_rings, 
  player_get_lives, 
  player_get_score, 
  SH_NONE,
  SH_SHIELD,
  SH_FIRESHIELD,
  SH_THUNDERSHIELD,
  SH_WATERSHIELD,
  SH_ACIDSHIELD,
  SH_WINDSHIELD,
  PLAYER_MAX_INVINCIBILITY,
  PLAYER_MAX_SPEEDSHOES,
  PL_SONIC, 
  PL_TAILS, 
  PL_KNUCKLES
} from "./../entities/player"
import { quest_abort, quest_setvalue, quest_getvalue } from "./quest"

export interface particle_t {
  image: any,
  position: v2d_t,
  speed: v2d_t,
  destroy_on_brick: boolean
}

export interface particle_list_t {
  data: particle_t,
  next: particle_list_t
}

export interface dialogregion_t {
  rect_x: number,
  rect_y: number,
  rect_w: number,
  rect_h: number,
  title: string,
  message: string,
  disabled: boolean
}

export const PLAYERS = [
  0, // sonic
  1, // tails
  2  // knuckles
];

let DEFAULT_MARGIN        =  VIDEO_SCREEN_W;
const ACTCLEAR_BONUSMAX     =  3; /* ring bonus, secret bonus, total */
const MAX_POWERUPS          =  10;
const DLGBOX_MAXTIME        =  7000;

/* level attributes */

/* test */
//let file = "data/levels/testzone.json";
//let file = "data/levels/prototype.json";

/* tutorial */
//let file = "data/levels/tutorial_1.json";
//let file = "data/levels/tutorial_2.json";

/* default */
let file = "data/levels/blue_ocean_1.json";
//let file = "data/levels/blue_ocean_2.json";
//let file = "data/levels/blue_ocean_3.json";
//let file = "data/levels/exotic_1.json";
//let file = "data/levels/exotic_2.json";
//let file = "data/levels/exotic_3.json";

/* extras */
//let file = "data/levels/template.json";
//let file = "data/levels/desert1.json";
//let file = "data/levels/exotichell_1.json";

/* super bosses */
//let file = "data/levels/superboss_1.json";
//let file = "data/levels/superboss_2.json";

let name:string;
let musicfile:string;
let theme:string;
let bgtheme:string;
let grouptheme:string;
let author:string;
let version:string;
let act:number;
let requires = [];
let readonly;

/* internal data */
let gravity:number;
let level_width:number;
let level_height:number;
let level_timer:number;
let brick_list:brick_list_t;
let item_list:item_list_t;
let enemy_list:enemy_list_t;
let particle_list:particle_list_t;
let spawn_point:v2d_t;
let music:music_t;
let override_music:music_t;
let block_music:boolean;
let quit_level:boolean;
let quit_level_img:image_t;
let backgroundtheme:bgtheme_t;

/* player data */
let team:player_t[]; /* players */
let currentPlayer:player_t; /* reference to the current player */
let player_id:number; /* current player id (0, 1 or 2) */
/* camera */
let camera_focus = {
  position: v2d_new(0,0)
}

/* boss */
let boss:boss_t;
let player_inside_boss_area:boolean;
let boss_fight_activated:boolean;

/* gui / hud */
let maingui:actor_t;
let lifegui:actor_t;
let lifefnt:font_t;
let mainfnt:font_t[] = [];

/* end of act (reached the goal) */
let level_cleared:boolean;
let actclear_starttime:number;
let actclear_endtime:number;
let actclear_sampletimer:number;
let actclear_prepare_next_level:boolean;
let actclear_goto_next_level:boolean;
let actclear_played_song:boolean;
let actclear_ringbonus:number;
let actclear_secretbonus:number;
let actclear_totalbonus:number;
let actclear_teamname:font_t;
let actclear_gotthrough:font_t;
let actclear_bonusfnt:font_t[] = [];
let actclear_levelact:actor_t;
let actclear_bonus:actor_t[] = [];

/* opening animation */
let levelop:actor_t;
let levelact:actor_t;
let leveltitle:font_t;

/* dialog box */
let dlgbox_active:boolean;
let dlgbox_starttime:number;
let dlgbox:actor_t;
let dlgbox_title:font_t;
let dlgbox_message:font_t;
let dialogregion_size:number;
let dialogregion:dialogregion_t[] = [];

/* use this before pushing the level scene into the stack */

/**
 * level_setfile()
 * Call this before initializing this scene. This
 * function tells the scene what level it must
 * load... then it gets initialized.
 */
export const level_setfile = (level:string) => {
  file = level;
  logfile_message(`level_setfile('#{level}')`);
}

/**
 * level_getfile()
 * get level file
 */
export const level_getfile = () => {
  return file;
}

/**
 * level_save()
 * Saves the current level to a file
 */
export const level_save = (filepath:string) => {

  let i, c, itb, iti, ite;

  let levelData:data_level_t = {
    name:         name,
    act:          act,
    theme:        theme,
    bgtheme:      bgtheme,
    grouptheme:   grouptheme,
    spawn_point:  spawn_point,
    music:        musicfile,
    boss:         null,
    bricklist:    [],
    itemlist:     [],
    enemylist:    [],
    dialogbox:    []
  };

  // boss?
  //console.log('boss', got_boss(), boss)
  if (got_boss()) {
    const bossData:data_level_boss_t = {
      id:        boss.type,
      x:         boss.actor.spawn_point.x,
      y:         boss.actor.spawn_point.y,
      rx:        boss.rect_x,
      ry:        boss.rect_y,
      rw:        boss.rect_w,
      rh:        boss.rect_h
    }
    levelData.boss = bossData;
  }

  // brick list
  let bricks = [];
  for(itb=brick_list; itb; itb=itb.next) {
    const brickData:data_level_bricklist_t = {
      id:     get_brick_id(itb.data),
      xpos:   itb.data.x,
      ypos:   itb.data.y
    }
    bricks.push(brickData)
  }
  levelData.bricklist = bricks;

  // item list
  let items = [];
  for(iti=item_list; iti; iti=iti.next) {
    if (iti.data) {
      const itemData:data_level_itemlist_t = {
        id:     iti.data.type,
        xpos:   iti.data.actor.spawn_point.x,
        ypos:   iti.data.actor.spawn_point.y
      }
      items.push(itemData)
    }
  }
  levelData.itemlist = items;

  // enemy list
  let enemies = [];
  for(ite=enemy_list; ite; ite=ite.next) {
    if(ite.data && ite.data.created_from_editor) {
      const enemyData:data_level_enemylist_t = {
        id:     ~~ite.data.name,
        xpos:   ite.data.actor.spawn_point.x,
        ypos:   ite.data.actor.spawn_point.y
      }
      enemies.push(enemyData)
    }
  }
  levelData.enemylist = enemies;

  // dialog regions
  let dialogs = [];
  for(i=0,c=dialogregion.length;i<c;i++) {
    const dialogData:data_level_dialogbox_t = {
      xpos:     dialogregion[i].rect_x,
      ypos:     dialogregion[i].rect_y,
      width:    dialogregion[i].rect_w,
      height:   dialogregion[i].rect_h,
      title:    dialogregion[i].title,
      message:  dialogregion[i].message
    }
    dialogs.push(dialogData)
  }
  levelData.dialogbox = dialogs;

  // save file
  const filenames:string[] = filepath.split('/');
  const filename:string = filenames[filenames.length-1];
  //console.log('saveFile', filepath, levelData);

  //let json = JSON.stringify(levelData);
  //let blob = new Blob([json], {type: "application/json"});
  //fileSaver_saveAs(blob, filename);

  // done!
  logfile_message("level_save() ok");
}

/* scene methods */

/**
 * level_init()
 * Initializes the scene
 */
export const level_init = () => {
  let i;

  DEFAULT_MARGIN        =  VIDEO_SCREEN_W;

  /* main init */
  logfile_message("level_init()");
  brick_list = null;
  item_list = null;
  team = [];
  gravity = 800;
  level_width = level_height = 0;
  level_timer = 0;
  dialogregion_size = 0;
  override_music = null;
  level_cleared = false;
  quit_level = false;
  quit_level_img = null;//image_create(video_get_backbuffer().w, video_get_backbuffer().h);
  actclear_starttime = actclear_endtime = actclear_sampletimer = 0;
  actclear_ringbonus = actclear_secretbonus = actclear_totalbonus = 0;
  actclear_prepare_next_level = actclear_goto_next_level = false;
  actclear_played_song = false;
  backgroundtheme = null;

  /* helpers */
  particle_init();
  editor_init();

  /* level init */
  level_load(file)
  .then(function(){

    /* loading players */
    logfile_message("Creating players...");
    for(let i = 0; i<PLAYERS.length;i++) {
      team[i] = player_create(PLAYERS[i]);
    }
    //team[0] = player_create(PL_SONIC);
    //team[1] = player_create(PL_TAILS);
    //team[2] = player_create(PL_KNUCKLES);
    spawn_players();
    player_id = 0;
    currentPlayer = team[player_id];
    camera_init();
    camera_set_position(v2d_new(currentPlayer.actor.position.x,currentPlayer.actor.position.y));
    level_set_camera_focus(currentPlayer.actor);
    player_set_rings(0);
    player_inside_boss_area = false;
    boss_fight_activated = false;

    /* gui */
    logfile_message("Loading hud...");
    maingui = actor_create();
    maingui.position = v2d_new(16, 7);
    actor_change_animation(maingui, sprite_get_animation("SD_MAINGUI", 0));
    lifegui = actor_create();
    lifegui.position = v2d_new(16, VIDEO_SCREEN_H-23);
    actor_change_animation(lifegui, sprite_get_animation("SD_LIFEGUI", 0));
    lifefnt = font_create(0);
    lifefnt.position = v2d_add(lifegui.position, v2d_new(32,11));
    for(i=0; i<3; i++) {
      mainfnt[i] = font_create(2);
      mainfnt[i].position = v2d_add(maingui.position, v2d_new(42, i*16+2));
    }

    /* level opening */
    levelop = actor_create();
    levelop.position = v2d_new(0,-240);
    actor_change_animation(levelop, sprite_get_animation("SD_LEVELOP", 0));
    levelact = actor_create();
    levelact.position = v2d_new(260,250);
    actor_change_animation(levelact, sprite_get_animation("SD_LEVELACT", act-1));
    leveltitle = font_create(3);
    leveltitle.position = v2d_new(330,50);
    font_set_text(leveltitle, "%s", name.toUpperCase());
    font_set_width(leveltitle, 180);

    /* end of act */
    actclear_teamname = font_create(4);
    actclear_gotthrough = font_create(7);
    actclear_levelact = actor_create();
    for(i=0; i<ACTCLEAR_BONUSMAX; i++) {
      actclear_bonusfnt[i] = font_create(2);
      actclear_bonus[i] = actor_create();
    }

    /* dialog box */
    dlgbox_active = false;
    dlgbox_starttime = 0;
    dlgbox = actor_create();
    dlgbox.position.y = VIDEO_SCREEN_H;
    actor_change_animation(dlgbox, sprite_get_animation("SD_DIALOGBOX", 0));
    dlgbox_title = font_create(8);
    dlgbox_message = font_create(8);
  });  
}

/**
 * level_update()
 * Updates the scene (this one runs
 * every cycle of the program)
 */
export const level_update = () => {

  level_timer+= timer_get_delta();

  let i, cbox;
  let got_dying_player = false;
  let block_pause = false, block_quit = false;
  const dt = timer_get_delta();
  let major_bricks, fake_bricks, bnode, bnext;
  let major_items, inode;
  let enode;

  remove_dead_bricks();
  remove_dead_items();
  remove_dead_objects();

  if(!editor_is_enabled()) {

    /* displaying message: "do you really want to quit?" */
    block_quit = level_timer < 5; /* opening animation? */
    for(i=0; i<team.length && !block_quit; i++) {
      if (team[i]) {
        block_quit = team[i].dead;
      }
    }

    if(currentPlayer && currentPlayer.actor && input_button_pressed(currentPlayer.actor.input, IB_FIRE4) && !block_quit) {
      //console.log('QUIT')
      let op = [];

      //image_blit(video_get_backbuffer(), quit_level_img, 0, 0, 0, 0, quit_level_img.w, quit_level_img.h);
      music.pause();

      op[0] = lang_getstring("CBOX_QUIT_QUESTION");
      op[1] = lang_getstring("CBOX_QUIT_OPTION1");
      op[2] = lang_getstring("CBOX_QUIT_OPTION2");
      confirmbox_alert(op[0], op[1], op[2]);

      scenestack_push(storyboard_get_scene(SCENE_CONFIRMBOX));
      return;
    }

    cbox = confirmbox_selected_option();
    if(cbox == 1)
      quit_level = true;
    else if(cbox == 2)
      music_play(music, true);

    if(quit_level) {
      if(video_fadefx_over()) {
        scenestack_pop();
        quest_abort();
        return;
      }
      video_fadefx_out(image_rgb(0,0,0), 1.0);
      return;
    }

    /* open level editor */
    if(editor_want_to_activate()) {
      //if(readonly) {
      //  video_showmessage("No way!");
      //  sound_play( soundfactory_get("deny") );
      //}
      //else {
        editor_enable();
        return;
      //}
    }

    /* pause game */
    block_pause = level_timer < 5;
    for(i=0; i<team.length && !block_pause; i++)
      block_pause = team[i].dying || team[i].dead;
    if (currentPlayer) {
      if(input_button_pressed(currentPlayer.actor.input, IB_FIRE3) && !block_pause) {
        currentPlayer.spin_dash = currentPlayer.braking = false;
        music_pause();
        scenestack_push(storyboard_get_scene(SCENE_PAUSE));
        return;
      }
    }

    /* gui */
    actor_change_animation(maingui, sprite_get_animation("SD_MAINGUI", player_get_rings()>0 ? 0 : 1));
    actor_change_animation(lifegui, sprite_get_animation("SD_LIFEGUI", player_id));
    font_set_text(lifefnt, "%d", player_get_lives());
    font_set_text(mainfnt[0], "%d", player_get_score());
    let minutes = ~~(level_timer/60);
    let s = ~~(level_timer%60);
    let seconds = (s < 10) ? "0"+s : s;   
    font_set_text(mainfnt[1], "%s", minutes+":"+seconds );
    font_set_text(mainfnt[2], "%d", player_get_rings());

    /* level opening */
    if (levelop) {
      if(level_timer < 5) {
        if(level_timer < 1.5) {

          levelop.position.y += 360*dt;
          if(levelop.position.y > -2)
            levelop.position.y = -2;

          leveltitle.position.x -= 320*dt;
          if(leveltitle.position.x < 140)
            leveltitle.position.x = 140;

          levelact.position.y -= 200*dt;
          if(levelact.position.y < 200)
            levelact.position.y = 200;

        } else if(level_timer > 3.5) {
          levelop.position.x -= 320*dt;
        }
      } else {
        levelop.visible = false;
        leveltitle.visible = false;
        levelact.visible = false;
      }
    }

    /* end of act (reached the goal) */
    //level_cleared = true;
    if(level_cleared) {
        let total = 0;
        let tmr = timer_get_ticks();
        let ring = soundfactory_get("ring count");
        let cash = soundfactory_get("cash");
        let glasses = soundfactory_get("glasses");

        /* level music fadeout */
        //if(music.is_playing())
        //    music.set_volume(1.0 - (tmr-actclear_starttime)/2000.0);

        /* show scores */
        if(tmr >= actclear_starttime + 2000) {
            /* lock characters */
            for(i=0; i<team.length; i++) {
              if (team[i]) {
                team[i].actor.speed.x = 0;
              }
            }

            /* set positions... */
            actclear_teamname.position.x = Math.min(actclear_teamname.position.x + 800*dt, 30);
            actclear_gotthrough.position.x = Math.min(actclear_gotthrough.position.x + 700*dt, 12);
            actclear_levelact.position.x = Math.max(actclear_levelact.position.x - 700*dt, 250);

            for(i=0; i<ACTCLEAR_BONUSMAX; i++) {
                actclear_bonus[i].position.x = Math.min(actclear_bonus[i].position.x + (400-50*i)*dt, 50);
                actclear_bonusfnt[i].position.x = Math.max(actclear_bonusfnt[i].position.x - (400-50*i)*dt, 230);
            }

            /* counters (bonus) */
            total = actclear_totalbonus - (actclear_ringbonus + actclear_secretbonus);
            font_set_text(actclear_bonusfnt[0], "%d", ~~actclear_ringbonus);
            font_set_text(actclear_bonusfnt[1], "%d", ~~actclear_secretbonus);
            font_set_text(actclear_bonusfnt[ACTCLEAR_BONUSMAX-1], "%d", ~~total);

            /* reached the goal song */
            if(!actclear_played_song) {
                music_stop();
                sound_play( soundfactory_get("goal") );
                actclear_played_song = true;
            }
        }

        /* decreasing counters (bonus) */
        if(tmr >= actclear_starttime + 6000 && !actclear_prepare_next_level) {
            /* decreasing */
            actclear_ringbonus = Math.max(0, actclear_ringbonus-400*dt);
            actclear_secretbonus = Math.max(0, actclear_secretbonus-2000*dt);

            /* sound effects */
            if(actclear_ringbonus > 0 || actclear_secretbonus > 0) {
                /* ring */
                if(ring && tmr >= actclear_sampletimer) {
                    actclear_sampletimer = tmr+100;
                    sound_play(ring);
                }
            }
            else {
                // cash
                actclear_prepare_next_level = true;
                actclear_endtime = tmr + 4000;
                sound_play(cash);

                // got glasses?
                for(i=0; i<team.length; i++) {
                    if(team[i].got_glasses) {
                        sound_play(glasses);
                        break;
                    }
                }
            }
        }

        /* go to next level? */
        if(actclear_prepare_next_level && tmr >= actclear_endtime) {
          //console.log('GOTO NEXT LEVEL')
          actclear_goto_next_level = true;
        }
    }

    /* dialog box */
    update_dialogregions();
    update_dlgbox();

    /* *** updating the objects *** */

    got_dying_player = false;
    for(i=0; i<team.length; i++) {
      if(team[i].dying)
        got_dying_player = true;
    }

    major_items = item_list_clip();
    major_bricks = brick_list_clip();
    fake_bricks = null;

    /* update background */
    background_update(backgroundtheme);

    /* update items */
    for(inode = item_list; inode; inode=inode.next) {
      //console.log(inode)
      if (inode.data && inode.data.actor) {
        let x = inode.data.actor.position.x;
        let y = inode.data.actor.position.y;
        let w = actor_image(inode.data.actor).width;
        let h = actor_image(inode.data.actor).height;
        //console.log(x,y,w,h)

        if(inside_screen(x, y, w, h, DEFAULT_MARGIN)) {
          //console.log('555')
          item_update(inode.data, team, 3, major_bricks, item_list, enemy_list);
          if(inode.data.obstacle) { // is this item an obstacle?
              
            // we'll create a fake brick here
            let offset = 1;
            let v = v2d_add(inode.data.actor.hot_spot, v2d_new(0,-offset));
            let img = actor_image(inode.data.actor);
            let fake = create_fake_brick(img.width, img.height-offset, v2d_subtract(inode.data.actor.position,v), 0);
            fake.brick_ref.zindex = inode.data.bring_to_back ? 0.4 : 0.5;

            // add to the fake bricks list
            const bn1:brick_list_t = {
              next: fake_bricks,
              data: fake
            };            
            fake_bricks = bn1;

            // add to the major bricks list
            const bn2:brick_list_t = {
              next: major_bricks,
              data: fake
            };
            major_bricks = bn2;
          }
        } else {
          // this item is outside the screen...
          if(!inode.data.preserve)
            inode.data.state = IS_DEAD;
        }
      }
    }

    /* update enemies */
    for(enode = enemy_list; enode; enode=enode.next) {
      if (enode.data) {
        let x = enode.data.actor.position.x;
        let y = enode.data.actor.position.y;
        let w = actor_image(enode.data.actor).width;
        let h = actor_image(enode.data.actor).height;

        if(inside_screen(x, y, w, h, DEFAULT_MARGIN) || enode.data.always_active) {
            // update this object
            if(currentPlayer && currentPlayer.actor && !input_is_ignored(currentPlayer.actor.input)) {
              if(!got_dying_player && !level_cleared)
                enemy_update(enode.data, team, team.length, major_bricks, major_items, enemy_list);
            }

            // is this object an obstacle?
            if(enode.data.obstacle) {
                // we'll create a fake brick here
                let offset = 1;
                let v = v2d_add(enode.data.actor.hot_spot, v2d_new(0,-offset));
                let img = actor_image(enode.data.actor);
                let fake = create_fake_brick(img.width, img.height-offset, v2d_subtract(enode.data.actor.position,v), enode.data.obstacle_angle);

                // add to the fake bricks list
                const bn1:brick_list_t = {
                  next: fake_bricks,
                  data: fake
                };            
                fake_bricks = bn1;

                // add to the major bricks list
                const bn2:brick_list_t = {
                  next: major_bricks,
                  data: fake
                };
                major_bricks = bn2;
            }
        }
        else {
          // this object is outside the screen...
          if(!enode.data.preserve)
            enode.data.state = ES_DEAD;
          else if(!inside_screen(enode.data.actor.spawn_point.x, enode.data.actor.spawn_point.y, w, h, DEFAULT_MARGIN))
            enode.data.actor.position = v2d_new(enode.data.actor.spawn_point.x, enode.data.actor.spawn_point.y);
        }
      }
    }

    /* update boss */
    if(got_boss()) {
      //console.log('GOT BOSS')
      if (currentPlayer && currentPlayer.actor) {
        let pa = currentPlayer.actor;
        let ba = [ pa.position.x, pa.position.y, pa.position.x+1, pa.position.y+1 ];
        let bb = [ boss.rect_x, boss.rect_y, boss.rect_x+boss.rect_w, boss.rect_y+boss.rect_h ];
        //console.log('11111')
        // boss fight!
        if(!got_dying_player)
          boss_update(boss, team, brick_list); // bouken deshou, deshou!?
        if(!boss_defeated(boss) && bounding_box(ba, bb)) { // honto ga uso ni kawaru sekai de
           //console.log('22222')
           player_inside_boss_area = true; // yume ga aru kara tsuyoku naru no yo
          boss_fight_activated = true; // dare no tame janai
          //level_hide_dialogbox();
        }

        // only the active player can enter the boss area
        if(!boss_defeated(boss)) {
          let br = 30; // border
          let ta;

          for(i=0; i<team.length; i++) {
            if(team[i] == currentPlayer && !(currentPlayer.actor.carrying))
              continue;

            ta = team[i].actor;

            if(ta.position.x > boss.rect_x-br && ta.position.x < boss.rect_x) {
              ta.position.x = boss.rect_x-br;
              ta.speed.x = 0;
            }

            if(ta.position.x > boss.rect_x+boss.rect_w && ta.position.x < boss.rect_x+boss.rect_w+br) {
              ta.position.x = boss.rect_x+boss.rect_w+br;
              ta.speed.x = 0;
            }
          }
        }

        // the boss has been defeated...
        if(boss_defeated(boss) || currentPlayer.dying) {
          player_inside_boss_area = false;
          if(music) { // fade-out music
            music_set_volume(music_get_volume() - 0.5*dt);
            if(music_get_volume() < EPSILON) {
              music_stop();
              music_set_volume(1.0);
              block_music = true;
            }
          }
        }
      }
    }

    /* update players */
    for(i=0; i<team.length; i++)
      input_ignore(team[i].actor.input);

    //if(currentPlayer && currentPlayer.actor && level_timer >= 3.5 && camera_focus == currentPlayer.actor) /* not (opening animation) */
    if(currentPlayer && currentPlayer.actor && level_timer >= 3.5 )
      input_restore(currentPlayer.actor.input);

    for(i=0; i<team.length; i++) {
      let x = team[i].actor.position.x;
      let y = team[i].actor.position.y;
      let w = actor_image(team[i].actor).width;
      let h = actor_image(team[i].actor).height;
      let hy = team[i].actor.hot_spot.y;

      /* somebody is hurt! show it to the user */
      if(i != player_id) {
        if(team[i].getting_hit)
          level_change_player(i);

        if(team[i].dying) {
          level_change_player(i);
          if(camera_focus != team[i].actor)
            camera_move_to(team[i].actor.position, 0.0);
        }
      }

      /* death */
      if(team[i].dead) {
        if(player_get_lives() > 1) {
          // restart the level!
          if(video_fadefx_over()) {
            //quest_setvalue('QUESTVALUE_TOTALTIME', quest_getvalue('QUESTVALUE_TOTALTIME')+level_timer);
            player_set_lives(player_get_lives()-1);
            //console.log(z)
            level_restart();
            return;
          }
          video_fadefx_out(image_rgb(0,0,0), 1.0);
        } else {
          // game over
          scenestack_pop();
          scenestack_push(storyboard_get_scene(SCENE_GAMEOVER));
          return;
        }
      }

      /* level cleared! */
      if(actclear_goto_next_level) {
        if(video_fadefx_over()) {
            scenestack_pop();
            //scenestack_push(storyboard_get_scene(SCENE_LEVEL));
            return;
        }
        video_fadefx_out(image_rgb(0,0,0), 1.0);
      }

      /* updating... */
      if(inside_screen(x, y, w, h, DEFAULT_MARGIN/4) || team[i].dying) {
        if(!got_dying_player || team[i].dying || team[i].getting_hit)
          player_update(team[i], team, major_bricks);
      }

      /* clipping... */
      if(team[i].actor.position.y < hy && !team[i].dying) {
        team[i].actor.position.y = hy;
        team[i].actor.speed.y = 0;
      }
      else if(team[i].actor.position.y > level_height-(h-hy)) {
        if(inside_screen(x,y,w,h,DEFAULT_MARGIN/4))
          player_kill(team[i]);
      }
    }

    /* change the active team member */
    if(!got_dying_player && !level_cleared) {
      level_timer += timer_get_delta()/1000;
      if (currentPlayer) {
        if(input_button_pressed(currentPlayer.actor.input, IB_FIRE2))  {
          if(Math.abs(currentPlayer.actor.speed.y) < EPSILON && !currentPlayer.on_moveable_platform && !player_inside_boss_area && !currentPlayer.disable_movement && !currentPlayer.in_locked_area)
              level_change_player((player_id+1) % 3);
          else
            sound_play( soundfactory_get("deny") );
        }
      }
    }

    /* boss area */
    if(got_boss() && player_inside_boss_area) {
      //console.log('GOT BOSS player_inside_boss_area')
        let pa = currentPlayer.actor;
        if (pa) {

          if(pa.position.x < boss.rect_x) {
              pa.position.x = boss.rect_x;
              pa.speed.x = Math.max(0, pa.speed.x);
          }
          else if(pa.position.x > boss.rect_x+boss.rect_w) {
              pa.position.x = boss.rect_x+boss.rect_w;
              pa.speed.x = Math.min(pa.speed.x, 0);
          }

          pa.position.y = clip(pa.position.y, boss.rect_y, boss.rect_y+boss.rect_h);
        }
    }

    /* if someone is dying, fade out the music */
    //if(got_dying_player)
    //  music_set_volume(music_get_volume() - 0.5*dt);

    /* update particles */
    particle_update_all(major_bricks);

    /* update bricks */
    for(bnode=major_bricks; bnode; bnode=bnode.next) {

      // <breakable bricks>
      if(bnode.data && bnode.data.brick_ref.behavior == BRB_BREAKABLE) {
          let brkw = bnode.data.brick_ref.image.width;
          let brkh = bnode.data.brick_ref.image.height;
          let a = [ bnode.data.x, bnode.data.y, bnode.data.x + brkw, bnode.data.y + brkh ];
          let b = [ bnode.data.x, bnode.data.y, bnode.data.x + brkw, bnode.data.y + brkh ];

          for(i=0; i<team.length; i++) {
            if (team[i]) {
              a[0] = team[i].actor.position.x - team[i].actor.hot_spot.x - 3;
              a[1] = team[i].actor.position.y - team[i].actor.hot_spot.y - 3;
              a[2] = a[0] + actor_image(team[i].actor).width + 6;
              a[3] = a[1] + actor_image(team[i].actor).height + 6;

              if((team[i].spin_dash || team[i].spin || team[i].type == PL_KNUCKLES) && bounding_box(a,b)) {
                // particles
                let bi, bj, bh, bw;
                bw = Math.max(bnode.data.brick_ref.behavior_arg[0], 1);
                bh = Math.max(bnode.data.brick_ref.behavior_arg[1], 1);
                for(bi=0; bi<bw; bi++) {
                  for(bj=0; bj<bh; bj++) {
                    let brkpos = v2d_new(bnode.data.x + (bi*brkw)/bw, bnode.data.y + (bj*brkh)/bh);
                    let brkspeed = v2d_new(-team[i].actor.speed.x*0.3, -100-random(50));
                    let brkimg = image_create(brkw/bw, brkh/bh);

                    //image_blit(bnode.data.brick_ref.image, brkimg, (bi*brkw)/bw, (bj*brkh)/bh, 0, 0, brkw/bw, brkh/bh);
                    if(Math.abs(brkspeed.x) > EPSILON) brkspeed.x += (brkspeed.x>0?1:-1) * random(50);
                    level_create_particle(brkimg, brkpos, brkspeed, false);
                  }
                }

                // bye bye, brick!
                sound_play( soundfactory_get("break") );
                bnode.data.state = BRS_DEAD;
              }
            }
          }
      }
      // </breakable bricks>

      // <falling bricks>
      if(bnode.data && bnode.data.brick_ref.behavior == BRB_FALL && bnode.data.state == BRS_ACTIVE) {
          let brick_down = bnode.data;
          brick_down.value[1] += timer_get_delta(); // timer
          if(brick_down.value[1] >= BRB_FALL_TIME) {
              let bi, bj, bw, bh;
              let right_oriented = (brick_down.brick_ref.behavior_arg[2] != 0);
              let brkimg = brick_down.brick_ref.image;

              // particles
              bw = Math.max(brick_down.brick_ref.behavior_arg[0], 1);
              bh = Math.max(brick_down.brick_ref.behavior_arg[1], 1);
              for(bi=0; bi<bw; bi++) {
                  for(bj=0; bj<bh; bj++) {
                      let piecepos = v2d_new(brick_down.x + (bi*brkimg.width)/bw, brick_down.y + (bj*brkimg.height)/bh);
                      let piecespeed = v2d_new(0, 20+bj*20+ (right_oriented?bi:bw-bi)*20);
                      let piece = image_create(brkimg.width/bw, brkimg.height/bh);

                      //image_blit(brkimg, piece, (bi*brkimg.width)/bw, (bj*brkimg.height)/bh, 0, 0, piece.w, piece.h);
                      level_create_particle(piece, piecepos, piecespeed, false);
                  }
              }

              // bye, brick! :]
              sound_play( soundfactory_get("break") );
              brick_down.state = BRS_DEAD;
          }
      }
      // </falling bricks> /

      // <moveable bricks>
      brick_move(bnode.data);
      // </moveable bricks>
    }

    /* cleanup the fake bricks list */
    for(bnode=fake_bricks; bnode; bnode=bnext) {
        bnext = bnode.next;
        destroy_fake_brick(bnode.data);
        bnode = null;
    }
    fake_bricks = null;

    brick_list_unclip(major_bricks);
    item_list_unclip(major_items);

    /* update camera */
    if (currentPlayer && currentPlayer.actor)
      level_set_camera_focus(currentPlayer.actor);

    if(level_cleared)
      camera_move_to(v2d_add(camera_focus.position, v2d_new(0, -90)), 0.17);
    else if(player_inside_boss_area) {
      let lock = [ boss.rect_x+VIDEO_SCREEN_W/2, boss.rect_x+boss.rect_w-VIDEO_SCREEN_W/2 ];
      let offv = v2d_new( clip(camera_focus.position.x, lock[0], lock[1]), camera_focus.position.y );
      //let offv = v2d_new( camera_focus.position.x, camera_focus.position.y );
      //console.log('PLAYER INSIDE BOSS AREA')
      camera_move_to(v2d_add(offv, v2d_new(0, -90)), 0.17);
    }
    else if(!got_dying_player) {
      if (camera_focus) {
        camera_move_to(camera_focus.position, 0.10);
      }
    }

    //console.log( camera_get_position())

    camera_update();

  } else {
    /* level editor */
    editor_update();
  }

  /* other stuff */
  update_music();
}

/**
 * level_render()
 * Rendering function
 */
export const level_render = () => {
  video_clearDisplay();

  /* render the level editor? */
  if(editor_is_enabled()) {
    editor_render();
    return;
  }

  background_render_bg(backgroundtheme, camera_get_position());
  render_entities();
  background_render_fg(backgroundtheme, camera_get_position());
  render_hud();
}

/**
 * level_release()
 * Releases the scene
 */
export const level_release = () => {
  var i;

  logfile_message("level_release()");

  image_destroy(quit_level_img);
  //particle.release();
  level_unload();
  for(i=0; i<team.length; i++)
    player_destroy(team[i]);
  camera_release();
  editor_release();

  actor_destroy(lifegui);
  actor_destroy(maingui);
  font_destroy(lifefnt);
  for(i=0; i<team.length; i++)
    font_destroy(mainfnt[i]);

  actor_destroy(levelop);
  actor_destroy(levelact);
  font_destroy(leveltitle);

  font_destroy(actclear_teamname);
  font_destroy(actclear_gotthrough);
  actor_destroy(actclear_levelact);
  for(i=0; i<ACTCLEAR_BONUSMAX; i++) {
      font_destroy(actclear_bonusfnt[i]);
      actor_destroy(actclear_bonus[i]);
  }

  font_destroy(dlgbox_title);
  font_destroy(dlgbox_message);
  actor_destroy(dlgbox);

  logfile_message("level_release() ok");
}

/* useful stuff */

/**
 * level_editmode()
 * Is the level editor activated?
 */
export const level_editmode = () => {
  return editor_is_enabled();
}

/**
 * level_player()
 * Returns the current player
 */
export const level_player = () => {
  return currentPlayer;
}

/**
 * level_player_id()
 * Returns the ID of the current player
 */
export const level_player_id = () => {
  return player_id;
}

/**
 * level_add_to_score()
 * Adds a value to the player's score.
 * It also creates a flying text that
 * shows that score.
 */
export const level_add_to_score = (score:number) => {
  let flyingtext;

  score = Math.max(0, score);
  player_set_score(player_get_score() + score);

  //sprintf(buf, "%d", score);
  flyingtext = level_create_item(IT_FLYINGTEXT, v2d_add(currentPlayer.actor.position, v2d_new(-9,0)));
  //flyingtext.set_text(flyingtext, buf);
  flyingtext_set_text(flyingtext, ""+score);
}

/**
 * level_size()
 * Returns the size of the level
 */
export const level_size = () => {
  return v2d_new(level_width, level_height);
}

/**
 * level_override_music()
 * Stops the music while the given sample is playing.
 * After it gets finished, the music gets played again.
 */
export const level_override_music = (sample:sound_t) => {
  if(music) music_stop();
  override_music = sample;
  sound_play(override_music);
}

/**
 * level_set_spawn_point()
 * Defines a new spawn point
 */
export const level_set_spawn_point = (newpos:v2d_t) => {
  spawn_point = v2d_new(newpos.x, newpos.y);
}

/**
 * level_clear()
 * Call this when the player clears this level
 */
export const level_clear = (end_sign:actor_t) => {
  let i;

  if(level_cleared)
    return;

  /* act cleared! */
  level_cleared = true;
  actclear_starttime = timer_get_ticks();

  /* bonus */
  actclear_ringbonus = player_get_rings()*10;
  actclear_totalbonus += actclear_ringbonus;
  for(i=0; i<team.length; i++) {
    if(team[i] && team[i].got_glasses) {
      level_add_to_secret_bonus(5000);
      //quest_setvalue('QUESTVALUE_GLASSES', quest_getvalue('QUESTVALUE_GLASSES')+1);
    }
  }
  player_set_score( player_get_score() + actclear_totalbonus );
  //quest_setvalue('QUESTVALUE_TOTALTIME', quest_getvalue('QUESTVALUE_TOTALTIME')+level_timer);

  /* ignore input and focus the camera on the end sign */
  for(i=0; i<team.length; i++) {
    if (team[i]) {
      input_ignore(team[i].actor.input);
      team[i].spin_dash = false;
    }
  }
  level_set_camera_focus(end_sign);
  level_hide_dialogbox();

  /* initializing resources... */
  font_set_text(actclear_teamname, "TEAM SONIC");
  actclear_teamname.position = v2d_new(-500, 20);

  font_set_text(actclear_gotthrough, "GOT THROUGH");
  actclear_gotthrough.position = v2d_new(-500, 46);

  actor_change_animation(actclear_levelact, sprite_get_animation("SD_LEVELACT", act-1));
  actclear_levelact.position = v2d_new(820, 25);

  for(i=0; i<ACTCLEAR_BONUSMAX; i++) {
    actclear_bonus[i].position = v2d_new(-500, 120+i*20);
    actclear_bonusfnt[i].position = v2d_new(820, 120+i*20);
  }

  actor_change_animation(actclear_bonus[0], sprite_get_animation("SD_RINGBONUS", 0));
  actor_change_animation(actclear_bonus[1], sprite_get_animation("SD_SECRETBONUS", 0));
  actor_change_animation(actclear_bonus[ACTCLEAR_BONUSMAX-1], sprite_get_animation("SD_TOTAL", 0));
}

/**
 * level_add_to_secret_bonus()
 * Adds a value to the secret bonus
 */
export const level_add_to_secret_bonus = (value:number) => {
  actclear_secretbonus += value;
  actclear_totalbonus += value;
}

/**
 * level_call_dialogbox()
 * Calls a dialog box
 */
export const level_call_dialogbox = (title:string, message:string,) => {
  if(dlgbox_active && !font_get_text(dlgbox_title) && !font_get_text(dlgbox_message) )
    return;

  dlgbox_active = true;
  dlgbox_starttime = timer_get_ticks();
  font_set_text(dlgbox_title, title);
  font_set_text(dlgbox_message, message);
  font_set_width(dlgbox_message, 260);
}

/**
 * level_hide_dialogbox()
 * Hides the current dialog box (if any)
 */
export const level_hide_dialogbox = () => {
  dlgbox_active = false;
}

/**
 * level_boss_battle()
 * Is/was the player fighting against the level boss (if any)?
 */
export const level_boss_battle = () => {
  return boss_fight_activated;
}

/**
 * level_kill_all_baddies()
 * Kills all the baddies on the level
 */
export const level_kill_all_baddies = () => {
  let it;
  let en;

  for(it=enemy_list; it; it=it.next) {
    en = it.data;
    if (en) {
      //en.state = ES_DEAD;
      en.state = 1;
    }
  }
}

/* camera facade */
export const level_lock_camera = (x1:number, y1:number, x2:number, y2:number) => {
  camera_lock(x1+VIDEO_SCREEN_W/2, y1+VIDEO_SCREEN_H/2, x2-VIDEO_SCREEN_W/2, y2-VIDEO_SCREEN_H/2);
}

export const level_unlock_camera = () => {
  camera_unlock();
}

/* music */
export const level_restore_music = () => {
  if(music != null)
    music_stop();
}

/**
 * level_gravity()
 * Returns the gravity of the level
 */
export const level_gravity = () => {
  return gravity;
}

/**
 * level_create_brick()
 * Creates and adds a brick to the level. This function
 * returns a pointer to the created brick.
 */
export const level_create_brick = (type:number, position:v2d_t) => {

  const b:brick_t = {
    brick_ref: brick_get(type),
    x: position.x,
    y: position.y,
    sx: position.x,
    sy: position.y,
    enabled: true,
    state: BRS_IDLE,
    value: [],
    animation_frame: 0
  }
  for(let i=0; i<BRICK_MAXVALUES; i++)
    b.value[i] = 0;
  
  const node:brick_list_t = {
    data: b,
    next: null
  }

  insert_brick_sorted(node);
  return node.data;
}

/**
 * level_create_item()
 * Creates and adds an item to the level. Returns the
 * created item.
 */
export const level_create_item = (type:number, position:v2d_t) => {

  const node:item_list_t = {
    data: item_create(type),
    next: null
  }

  node.data.actor.spawn_point = v2d_new(position.x, position.y);
  node.data.actor.position = v2d_new(position.x, position.y);  
  node.next = item_list;
  item_list = node;

  return node.data;
}

/**
 * level_create_enemy()
 * Creates and adds an enemy to the level. Returns the
 * created enemy.
 */
export const level_create_enemy = (name:string, position:v2d_t) => {
  
  const node:enemy_list_t = {
    data: enemy_create(name),
    next: null
  }

  node.data.actor.spawn_point = position;
  node.data.actor.position = position;
  node.next = enemy_list;
  enemy_list = node;

  return node.data;
}

/**
 * level_create_particle()
 * Creates a new particle.
 */
export const level_create_particle = (image:image_t, position:v2d_t, speed:v2d_t, destroy_on_brick:boolean) => {
  const p:particle_t = {
    image: image,
    position: position,
    speed: speed,
    destroy_on_brick: destroy_on_brick
  };

  const node:particle_list_t = {
    data: p,
    next: particle_list
  }

  /* no, you can't create a new particle! */
  if(editor_is_enabled()) {
      image_destroy(image);
      return;
  }

  particle_list = node;
}

/**
 * level_brick_move_actor()
 * If the given brick moves, then the actor
 * must move too. Returns a delta_speed vector
 */
export const level_brick_move_actor = (brick:brick_t, act:actor_t) => {
  let t, rx, ry, sx, sy, ph;

  if(!brick)
      return v2d_new(0,0);

  t = brick.value[0]; /* time elapsed ONLY FOR THIS brick */
  switch(brick.brick_ref.behavior) {
      case BRB_CIRCULAR:
          rx = brick.brick_ref.behavior_arg[0];             /* x-dist */
          ry = brick.brick_ref.behavior_arg[1];             /* y-dist */
          sx = brick.brick_ref.behavior_arg[2] * (2*PI);    /* x-speed */
          sy = brick.brick_ref.behavior_arg[3] * (2*PI);    /* y-speed */
          ph = brick.brick_ref.behavior_arg[4] * PI/180.0;  /* initial phase */

          /* take the derivative. e.g.,
             d[ sx + A*cos(PI*t) ]/dt = -A*PI*sin(PI*t) */
          return v2d_new( (-rx*sx)*Math.sin(sx*t+ph), (ry*sy)*Math.cos(sy*t+ph) );

      default:
          return v2d_new(0,0);
  }
}

/**
 * level_create_animal()
 * Creates a random animal
 */
export const level_create_animal = (position:v2d_t) => {
  let animal = level_create_item(IT_ANIMAL, position);
  return animal;
}

export const level_render_entities = () => {
  render_entities();
}

export const level_get_brick_list = () => {
  return brick_list;
}

export const level_get_brick_id = (b:brick_t) => {
  return get_brick_id(b);
}

export const level_spawn_players = () => {
  spawn_players();
}

/**
 * level_unload()
 * Call manually after level_load() whenever
 * this level has to be released or changed
 */
const level_unload = () => {
  let node, next;
  let inode, inext;
  let enode, enext;

  logfile_message("level_unload()");
  music.pause();
  //music.stop();
  //music.unref(musicfile);
  //music.unref("musics/invincible.mp4");
  //music.unref("musics/speed.mp4");

  // clears the brick_list
  logfile_message("releasing brick list...");
  for(node=brick_list; node; node=next) {
      next = node.next;
      node.data = null;
      node = null;
  }
  brick_list = null;

  // clears the item list
  logfile_message("releasing item list...");
  for(inode=item_list; inode; inode=inext) {
      inext = inode.next;
      item_destroy(inode.data);
      inode = null;
  }
  item_list = null;

  // clears the enemy list
  logfile_message("releasing enemy list...");
  for(enode=enemy_list; enode; enode=enext) {
      enext = enode.next;
      enemy_destroy(enode.data);
      enode = null;
  }
  enemy_list = null;

  // releasing the boss
  if(got_boss()) {
      logfile_message("releasing the boss...");
      boss_destroy(boss);
      boss = null;
  }

  // unloading the brickset
  logfile_message("unloading the brickset...");
  //brickdata_unload();

  // unloading the background
  logfile_message("unloading the background...");
  //backgroundtheme = background_unload(backgroundtheme);

  /* success! */
  logfile_message("level_unload() ok");
}

const get_brick_id = (b:brick_t) => {
  let i;

  for(i=0; i<brick_size(); i++) {
    if(b.brick_ref == brick_get(i))
      return i;
  }

  return -1;
}

const level_restart = () => {
  let sp = spawn_point;
  level_release();
  level_init();
  spawn_point = sp;
};

/* Render */

const render_entities = () => {
  let major_bricks;
  let inode;
  let enode;

  /* initializing major_bricks */
  major_bricks = brick_list_clip();

  /* render bricks - background */
  let brickImage:any = {};
  for(let p=major_bricks; p; p=p.next) {
    if(p.data) {
      let ref = p.data.brick_ref;
      if(ref.zindex < 0.5) {
          p.data = brick_animate(p.data);
          brickImage = brick_image(p.data);
          video_get_backbuffer().drawImage(
            brickImage.data,
            brickImage.sx, // The x coordinate where to start clipping
            brickImage.sy, //  The y coordinate where to start clipping
            brickImage.swidth, // The width of the clipped image
            brickImage.sheight, // The height of the clipped image
            p.data.x-(camera_get_position().x-VIDEO_SCREEN_W/2), // The x coordinate where to place the image on the canvas
            p.data.y-(camera_get_position().y-VIDEO_SCREEN_H/2), // The y coordinate where to place the image on the canvas
            brickImage.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
            brickImage.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
          );
      }
    }
  }

  /* render players (bring to back?) */
  render_players(true);

  /* render bricks - platform level (back) */
  for(let p=major_bricks; p; p=p.next) {
    if(p.data) {
      let ref = p.data.brick_ref;
      if(Math.abs(ref.zindex-0.5) < EPSILON && ref.property != BRK_OBSTACLE) {
          p.data = brick_animate(p.data);
          brickImage = brick_image(p.data);
          video_get_backbuffer().drawImage(
            brickImage.data,
            brickImage.sx, // The x coordinate where to start clipping
            brickImage.sy, //  The y coordinate where to start clipping
            brickImage.swidth, // The width of the clipped image
            brickImage.sheight, // The height of the clipped image
            p.data.x-(camera_get_position().x-VIDEO_SCREEN_W/2), // The x coordinate where to place the image on the canvas
            p.data.y-(camera_get_position().y-VIDEO_SCREEN_H/2), // The y coordinate where to place the image on the canvas
            brickImage.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
            brickImage.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
          );
      }
    }
  }

  /* render items (bring to back) */
  for(inode=item_list; inode; inode=inode.next) {
    //console.log(inode)
    if(inode.data && inode.data.bring_to_back)
      item_render(inode.data, camera_get_position());
  }

  /* render bricks - platform level (front) */
  for(let p=major_bricks; p; p=p.next) {
    if(p.data) {
      let ref = p.data.brick_ref;
       if(Math.abs(ref.zindex-0.5) < EPSILON && ref.property == BRK_OBSTACLE) {
          p.data = brick_animate(p.data);
          brickImage = brick_image(p.data);
          video_get_backbuffer().drawImage(
            brickImage.data,
            brickImage.sx, // The x coordinate where to start clipping
            brickImage.sy, //  The y coordinate where to start clipping
            brickImage.swidth, // The width of the clipped image
            brickImage.sheight, // The height of the clipped image
            p.data.x-(camera_get_position().x-VIDEO_SCREEN_W/2), // The x coordinate where to place the image on the canvas
            p.data.y-(camera_get_position().y-VIDEO_SCREEN_H/2), // The y coordinate where to place the image on the canvas
            brickImage.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
            brickImage.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
          );
      }
    }
  }

  /* render boss (bring to back) */
  if(got_boss() && !boss.bring_to_front)
    boss_render(boss, camera_get_position());

  /* render enemies */
  for(enode=enemy_list; enode; enode=enode.next)
    enemy_render(enode.data, camera_get_position());

  /* render players (bring to front?) */
  render_players(false);

  /* render boss (bring to front) */
  if(got_boss() && boss.bring_to_front)
    boss_render(boss, camera_get_position());

  /* render items (bring to front) */
  for(inode=item_list; inode; inode=inode.next) {
    //if(inode.data && !inode.data.bring_to_back)
    if(inode.data)
      item_render(inode.data, camera_get_position());
  }

  /* render particles */
  particle_render_all();

  /* render bricks - foreground */
  for(let p=major_bricks; p; p=p.next) {
    if(p.data) {
      let ref = p.data.brick_ref;
       if(ref.zindex > 0.5) {
          p.data = brick_animate(p.data);
          brickImage = brick_image(p.data);
          video_get_backbuffer().drawImage(
            brickImage.data,
            brickImage.sx, // The x coordinate where to start clipping
            brickImage.sy, //  The y coordinate where to start clipping
            brickImage.swidth, // The width of the clipped image
            brickImage.sheight, // The height of the clipped image
            p.data.x-(camera_get_position().x-VIDEO_SCREEN_W/2), // The x coordinate where to place the image on the canvas
            p.data.y-(camera_get_position().y-VIDEO_SCREEN_H/2), // The y coordinate where to place the image on the canvas
            brickImage.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
            brickImage.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
          );
      }
    }
  }

  /* releasing major_bricks */
  brick_list_unclip(major_bricks);
}

const render_players = (bring_to_back:boolean) => {
  if (!currentPlayer) return;

  let i;

  for(i=team.length-1; i>=0; i--) {
    if(team[i] != currentPlayer && (team[i].bring_to_back?true:false) == bring_to_back)
      player_render(team[i], camera_get_position());
  }

  if((currentPlayer.bring_to_back?true:false) == bring_to_back) /* comparing two booleans */
    player_render(currentPlayer, camera_get_position());
}

const render_hud = () => {

  let i;
  let fixedcam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  if(!level_cleared) {

    /* hud */
    actor_render(maingui, fixedcam);
    actor_render(lifegui, fixedcam);
    font_render(lifefnt, fixedcam);
    for(i=0;i<3;i++)
     font_render(mainfnt[i], fixedcam);

    /* powerups */
    render_powerups();

  }
  else {

    /* reached the goal */
    actor_render(actclear_levelact, fixedcam);
    font_render(actclear_teamname, fixedcam);
    font_render(actclear_gotthrough, fixedcam);
    for(i=0; i<ACTCLEAR_BONUSMAX; i++) {
      actor_render(actclear_bonus[i], fixedcam);
      font_render(actclear_bonusfnt[i], fixedcam);
    }

  }

  /* level opening */
  if(level_timer < 2.5) {
    video_clearDisplay('rgb(0,0,0)');
  }

  actor_render(levelop, fixedcam);
  actor_render(levelact, fixedcam);
  font_render(leveltitle, fixedcam);

  /* dialog box */
  render_dlgbox(fixedcam);
}

/* render powerups */
// this is rendering things too small!
const render_powerups = () => {
  let icon = [];
  let visible = [];
  let i, c = 0;
  const t = timer_get_ticks() * 0.001;

  for(i=0; i<MAX_POWERUPS; i++)
    visible[i] = true;

  if(currentPlayer) {
    if(currentPlayer.got_glasses)
      icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 6) , 0 );

    switch (currentPlayer.shield_type) {
      case SH_SHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 7) , 0 );
      break;
      case SH_FIRESHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 11) , 0 );
      break;
      case SH_THUNDERSHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 12) , 0 );
      break;
      case SH_WATERSHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 13) , 0 );
      break;
      case SH_ACIDSHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 14) , 0 );
      break;
      case SH_WINDSHIELD:
        icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 15) , 0 );
      break;
    }

    if(currentPlayer.invincible) {
      icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 4) , 0 );
      if(currentPlayer.invtimer >= PLAYER_MAX_INVINCIBILITY*0.75) { // it blinks
        // we want something that blinks faster as player->invtimer tends to PLAYER_MAX_INVINCIBLITY
        let x = ((PLAYER_MAX_INVINCIBILITY-currentPlayer.invtimer)/(PLAYER_MAX_INVINCIBILITY*0.25));
        visible[c-1] = Math.sin( (0.5*PI*t) / (x+0.1) ) >= 0;
      }
    }

    if(currentPlayer.got_speedshoes) {
      icon[c++] = sprite_get_image( sprite_get_animation("SD_ICON", 5) , 0 );
      if(currentPlayer.speedshoes_timer >= PLAYER_MAX_SPEEDSHOES*0.75) { // it blinks
        // we want something that blinks faster as player->speedshoes_timer tends to PLAYER_MAX_SPEEDSHOES
        let x = ((PLAYER_MAX_SPEEDSHOES-currentPlayer.speedshoes_timer)/(PLAYER_MAX_SPEEDSHOES*0.25));
        visible[c-1] = Math.sin( (0.5*PI*t) / (x+0.1) ) >= 0;
      }
    }
  }

  for(i=0; i<c; i++) {
    if(visible[i]) {
      //console.log(icon[i])
      /*image_draw(
        icon[i],
        video_get_backbuffer(),
        VIDEO_SCREEN_W - (icon[i].width+5)*(i+1),
        5,
        IF_NONE
      );*/
      image_blit(
        icon[i].data,
        video_get_backbuffer(),
        icon[i].sx,
        icon[i].sy,
        VIDEO_SCREEN_W - (icon[i].width+5)*(i+1),
        5,
        icon[i].swidth,
        icon[i].sheight
      );      
    }
  }
}

const render_dlgbox = (camera_position:v2d_t) => {
  actor_render(dlgbox, camera_position);
  font_render(dlgbox_title, camera_position);
  font_render(dlgbox_message, camera_position);
}

/* particle_init(): initializes the particle module */
const particle_init = () => {
  particle_list = null;
}

// this gets caught in infinite loop when I spin dash
const particle_update_all = (brick_list:brick_list_t) => {
  const dt = timer_get_delta();
  const g = gravity;
  let got_brick;
  let inside_area;
  let it;
  let prev = null;
  let next;

  for(it=particle_list; it; it=next) {

    const p:particle_t = it.data;
    if (p) {
      //next = it.next;
      inside_area = inside_screen(p.position.x, p.position.y, p.position.x+p.image.width, p.position.y+p.image.height, DEFAULT_MARGIN);

      // collided with bricks?
      got_brick = false;
      if(p.destroy_on_brick && inside_area && p.speed.y > 0) {
        let a = [ p.position.x, p.position.y, p.position.x+p.image.width, p.position.y+p.image.height ];
        let itb;
        for(itb=brick_list; itb && !got_brick; itb=itb.next) {
          let brk = itb.data;
          if (brk) {
            if(brk.brick_ref.property == BRK_OBSTACLE && brk.brick_ref.angle == 0) {
              let b = [ brk.x, brk.y, brk.x+brk.brick_ref.image.width, brk.y+brk.brick_ref.image.height ];
              if(bounding_box(a,b))
                got_brick = true;
            }
          }
        }
      }

      // update particle
      if(!inside_area || got_brick) {
        // remove this particle
        if(prev)
          prev.next = next;
        else
          particle_list = next;

        //image_destroy(p.image);
        //p = null;
        //it = null;
      }
      else {
        // update this particle
        p.position.x += p.speed.x*dt;
        p.position.y += p.speed.y*dt + 0.5*g*(dt*dt);
        p.speed.y += g*dt;
        prev = it;
      }
    }
  }
}

const particle_render_all = () => {
  let topleft = v2d_new(camera_get_position().x-VIDEO_SCREEN_W/2, camera_get_position().y-VIDEO_SCREEN_H/2);

  for(let it=particle_list; it; it=it.next) {
    const p:particle_t = it.data;
    if(p) {
      image_draw(
        p.image,
        video_get_backbuffer(),
        p.position.x-topleft.x,
        p.position.y-topleft.y
      );
    }
  }
}

/* Update */

const update_level_size = () => {

  let max_x = 0;
  let max_y = 0;

  for(let p=brick_list; p; p=p.next) {
    if(p.data && p.data.brick_ref && p.data.brick_ref.property != BRK_NONE) {
      max_x = Math.max(max_x, p.data.sx + brick_image(p.data).width);
      max_y = Math.max(max_y, p.data.sy + brick_image(p.data).height);
    }
  }

  level_width = Math.max(max_x, VIDEO_SCREEN_W);
  level_height = Math.max(max_y, VIDEO_SCREEN_H);
}

const update_music = () => {

  if(music != null && !level_cleared && !block_music) {
    //if(!override_music && !music_is_playing()) {
    if(!music_is_playing()) {
      override_music = null;
      //if(!currentPlayer.invincible && !currentPlayer.got_speedshoes) {
        music_play(music, true);
      //}
    }
  }
}

/* Dialog Box */

const update_dlgbox = () => {
  if (!dlgbox) return;

  let speed = 100.0; /* y speed */
  const dt = timer_get_delta();
  const t = timer_get_ticks();

  if(dlgbox_active) {
    if(t >= dlgbox_starttime + DLGBOX_MAXTIME) {
      dlgbox_active = false;
      return;
    }
    dlgbox.position.x = (VIDEO_SCREEN_W - actor_image(dlgbox).width)/2;
    dlgbox.position.y = Math.max(dlgbox.position.y - speed*dt, VIDEO_SCREEN_H - actor_image(dlgbox).height*1.3);
  }
  else {
    dlgbox.position.y = Math.min(dlgbox.position.y + speed*dt, VIDEO_SCREEN_H);
  }

  dlgbox_title.position = v2d_add(dlgbox.position, v2d_new(2, 10));
  dlgbox_message.position = v2d_add(dlgbox.position, v2d_new(2, 23));
}

const update_dialogregions = () => {
  if (!currentPlayer) return;
  if (!currentPlayer.actor) return;

  let i;
  let a = [], b = [];

  if(level_timer < 2.0)
    return;

  a[0] = currentPlayer.actor.position.x;
  a[1] = currentPlayer.actor.position.y;
  a[2] = a[0] + actor_image(currentPlayer.actor).width;
  a[3] = a[1] + actor_image(currentPlayer.actor).height;

  for(i=0; i<dialogregion_size; i++) {
    if(dialogregion[i].disabled)
      continue;

    b[0] = dialogregion[i].rect_x;
    b[1] = dialogregion[i].rect_y;
    b[2] = b[0]+dialogregion[i].rect_w;
    b[3] = b[1]+dialogregion[i].rect_h;

    if(bounding_box(a, b)) {
      dialogregion[i].disabled = true;
      level_call_dialogbox(dialogregion[i].title, dialogregion[i].message);
      break;
    }
  }
}

/* Player Utils */

const level_change_player = (id:number) => {
  currentPlayer.spin_dash = currentPlayer.braking = false;
  player_id = id;
  if (team[player_id]) {
    currentPlayer = team[player_id];
    level_set_camera_focus(currentPlayer.actor);
    input_restore(currentPlayer.actor.input);
  }
}

const spawn_players = () => {
  let i, v;

  for(i=0; i<team.length; i++) {
    v = (spawn_point.x <= level_width/2) ? 2-i : i;
    team[i].actor.mirror = (spawn_point.x <= level_width/2) ? IF_NONE : IF_HFLIP;
    team[i].actor.spawn_point.x = team[i].actor.position.x = spawn_point.x + 15*v;
    team[i].actor.spawn_point.y = team[i].actor.position.y = spawn_point.y;
  }
}

/* Brick Utils */

const create_fake_brick = (width:number, height:number, position:v2d_t, angle:number) => {
  
  const d:brickdata_t = {
    data: null,
    image: image_create(width, height),
    angle: angle,
    property: BRK_OBSTACLE,
    behavior: BRB_DEFAULT,
    zindex: 0.5,
    behavior_arg: []
  }
  for(let i=0; i<BRICKBEHAVIOR_MAXARGS; i++)
    d.behavior_arg[i] = 0;

  const b:brick_t = {
    brick_ref: d,
    x: position.x,
    y: position.y,
    sx: position.x,
    sy: position.y,
    enabled: true,
    state: 0,
    value: [],
    animation_frame: 0
  };

  return b;
}

const brick_sort_cmp = (a:brick_t, b:brick_t) => {
  //console.log(a, b)
  let ra = a.brick_ref, rb = b.brick_ref;
  if (!ra || !rb) return false;

  if(ra.zindex < rb.zindex)
      return -1;
  else if(ra.zindex > rb.zindex)
      return 1;
  else {
      /* we have the same z-index */
      if(ra.property != rb.property) {
          /*int score[] = {
              0,      // BRK_NONE
              100,    // BRK_OBSTACLE
              50      // BRK_CLOUD
          };*/
          let score = [0,100,50];
          return score[ra.property] - score[rb.property];
      }
      else {
          /* we also have the same brick property! */
          if((ra.angle % 180 != 0) && (rb.angle % 180 == 0))
              return -1;
          else if((ra.angle % 180 == 0) && (rb.angle % 180 != 0))
              return 1;
          else {
              /* we also have the same angle policy */
              return a.sy - b.sy; /* sort by ypos */
          }
      }
  }
}

const insert_brick_sorted = (b:brick_list_t) => {
  /* b,p are unitary linked list nodes */
  let p;

  /* note that brick_list_clip() will reverse
   * part of this list later */
  if(brick_list) {
    if(brick_sort_cmp(b.data, brick_list.data)) {
      b.next = brick_list;
      brick_list = b;
    } else {
      p = brick_list;
      while(p.next && brick_sort_cmp(p.next.data, b.data))
        p = p.next;
      b.next = p.next;
      p.next = b;
    }
  } else {
    b.next = null;
    brick_list = b;
  }
}

const brick_list_clip = () => {
  let list:brick_list_t = null;
  let bx, by, bw, bh;

  /* initial clipping */
  for(let p=brick_list; p; p=p.next) {
    bx = Math.min(p.data.x, p.data.sx);
    by = Math.min(p.data.y, p.data.sy);
    bw = p.data.brick_ref.image.width;
    bh = p.data.brick_ref.image.height;
    if(inside_screen(bx,by,bw,bh,DEFAULT_MARGIN*2) || p.data.brick_ref.behavior == BRB_CIRCULAR) {
      const q:brick_list_t = {
        data: p.data,
        next: list
      };
      list = q;
    }
  }
  return list;
}

const brick_list_unclip = (list:brick_list_t) => {
  let next;

  while(list) {
    next = list.next;
    list = null;
    list = next;
  }
}

const item_list_clip = () => {
  let list:item_list_t = null;
  let ix, iy, iw, ih;

  for(let p=item_list; p; p=p.next) {
    if (p.data) {
      const img = actor_image(p.data.actor);
      if (img) {
        ix = ~~p.data.actor.position.x;
        iy = ~~p.data.actor.position.y;
        iw = img.width;
        ih = img.height;
        if(inside_screen(ix,iy,iw,ih,DEFAULT_MARGIN)) {
          const q:item_list_t = {
            data: p.data,
            next: list
          };
          list = q;
        }
      }
    }
  }

  return list;
}

const item_list_unclip = (list:item_list_t) => {
  let next;

  while(list) {
    next = list.next;
    list = null;
    list = next;
  }
}

const remove_dead_items = () => {

  let p, next;

  if(!item_list)
      return;

  /* first element (assumed to exist) */
  if(item_list.data && item_list.data.state == IS_DEAD) {
      next = item_list.next;
      item_destroy(item_list.data);
      //free(item_list);
      item_list = next;
  }

  /* others */
  for(p=item_list; p && p.next; p=p.next) {
      if(p.next && p.next.data && p.next.data.state == IS_DEAD) {
          next = p.next;
          p.next = next.next;
          item_destroy(next.data);
          next = null;
      }
  }
}

const remove_dead_objects = () => {
  let p, next;

  if(!enemy_list)
      return;

  /* first element (assumed to exist) */
  if(enemy_list && enemy_list.data && enemy_list.data.state == ES_DEAD) {
    next = enemy_list.next;
    enemy_destroy(enemy_list.data);
    enemy_list = null;
    enemy_list = next;
  }

  /* others */
  for(p=enemy_list; p && p.next; p=p.next) {
    if(p && p.next && p.next.data && p.next.data.state == ES_DEAD) {
      next = p.next;
      p.next = next.next;
      enemy_destroy(next.data);
      next = null;
    }
  }
}

const remove_dead_bricks = () => {
  let p, next;

  if(!brick_list)
      return;

  //console.log(brick_list)

  /* first element (assumed to exist) */
  if(brick_list.data && brick_list.data.state == BRS_DEAD) {
    next = brick_list.next;
    brick_list.data = null;
    brick_list = null;
    brick_list = next;
  }

  /* others */
  for(p=brick_list; p && p.next; p=p.next) {
    if(p.next.data.state == BRS_DEAD) {
      next = p.next;
      p.next = next.next;
      next.data = null;
      next = null;
    }
  }
}

const destroy_fake_brick = (b:brick_t) => {
  image_destroy(b.brick_ref.image);
  b.brick_ref = null;
  b = null;
}

//var logOnce = false;

const brick_move = (brick:brick_t) => {
  let t, rx, ry, sx, sy, ph;

  if(!brick)
    return;

  brick.value[0] += timer_get_delta();
  t = brick.value[0]; /* time elapsed ONLY FOR THIS brick */
  switch(brick.brick_ref.behavior) {
    case BRB_CIRCULAR:
      rx = brick.brick_ref.behavior_arg[0];             /* x-dist */
      ry = brick.brick_ref.behavior_arg[1];             /* y-dist */
      sx = brick.brick_ref.behavior_arg[2] * (2*PI);    /* x-speed */
      sy = brick.brick_ref.behavior_arg[3] * (2*PI);    /* y-speed */
      ph = brick.brick_ref.behavior_arg[4] * PI/180.0;  /* initial phase */

      brick.x = brick.sx + Math.round(rx*Math.cos(sx*t+ph));
      brick.y = brick.sy + Math.round(ry*Math.sin(sy*t+ph));
      break;

    default:
      break;
  }
}

/* Camera Utils */

export const level_set_camera_focus = (act:actor_t) => {
  camera_focus.position.x = act.position.x;
  camera_focus.position.y = act.position.y;
}

const inside_screen = (x:number, y:number, w:number, h:number, margin:number) => {
  //var cam = level_editmode() ? editor_camera : camera_get_position();
  let cam = camera_get_position();
  let a = [ x, y, x+w, y+h ];
  let b = [
      cam.x-VIDEO_SCREEN_W/2 - margin,
      cam.y-VIDEO_SCREEN_H/2 - margin,
      cam.x+VIDEO_SCREEN_W/2 + margin,
      cam.y+VIDEO_SCREEN_H/2 + margin
  ];
  //console.log(margin,a,b)
  //return true;
  return bounding_box(a,b);
}

/* boss */

const got_boss = () => {
  return (boss != null);
}

/* load */
const level_load = (filepath:string) => {

  /* default values */
  name = "Untitled";
  musicfile = "";
  theme = "";
  bgtheme = "";
  author = "";
  version = "";
  grouptheme = "";
  spawn_point = v2d_new(0,0);
  dialogregion_size =  0;
  boss =  null;
  act = 1;
  //requires[0] = GAME_VERSION;
  //requires[1] = GAME_SUB_VERSION;
  //requires[2] = GAME_WIP_VERSION;
  readonly = false;

  return new Promise(function (fulfill, reject){
    logfile_message(`level_load("${filepath}")`);
    resourcemanager_getJsonFile(filepath)
    .then(traverse_level)
    .then(function(){

      /* load the music */
      //block_music = true;
      music = music_load(musicfile);

      /* misc */
      update_level_size();

      /* success! */

      logfile_message("level_load() ok");

      fulfill(null);
    });
  });
}

const traverse_level = (data:data_level_t) => {
  //console.log(data)

  theme = data.theme;
  bgtheme = data.bgtheme;
  grouptheme = data.grouptheme;
  musicfile = data.music;
  name = data.name;
  author = data.author;
  version = data.version;
  requires = data.requires;
  act = data.act;
  spawn_point = data.spawn_point;
  readonly = data.readonly;

  let i;

  if (data.boss) {
    boss = boss_create(data.boss.id, v2d_new(data.boss.x,data.boss.y), data.boss.rx, data.boss.ry, data.boss.rw, data.boss.rh);
    //console.log("BOSS",boss)
  }

  for(i=0;i<data.dialogbox.length;i++) {
    //let d = &(dialogregion[dialogregion_size++]);
    let d:dialogregion_t = {
      disabled: false,
      rect_x: data.dialogbox[i].xpos,
      rect_y: data.dialogbox[i].ypos,
      rect_w: data.dialogbox[i].width,
      rect_h: data.dialogbox[i].height,
      title: lang_get(data.dialogbox[i].title),
      message: lang_get(data.dialogbox[i].message)
    };
    
    dialogregion.push(d);
    dialogregion_size = dialogregion.length;
  }
  //console.log('DIALOG BOXES',dialogregion)

  for(i=0;i<data.enemylist.length;i++) {
    level_create_enemy(""+data.enemylist[i].id, v2d_new(data.enemylist[i].xpos,data.enemylist[i].ypos));
  }

  return new Promise(function (fulfill, reject){

    brick_load(data.theme)
    .then(function(bricks){
      for(let i=0;i<data.bricklist.length;i++) {
        //brick_list[i] = {};
        //brick_list[i].data = level_create_brick(data.bricklist[i].id, v2d_new(data.bricklist[i].xpos,data.bricklist[i].ypos));
        level_create_brick(data.bricklist[i].id, v2d_new(data.bricklist[i].xpos,data.bricklist[i].ypos));
      }
      //console.log('BRICKS LOADED',brick_list)
      //loadBackground(data.bgtheme)
      //console.log('LOAD BACKGROUND',data.bgtheme)
      background_load(data.bgtheme)
      .then(function(bgdata:bgtheme_t){
        backgroundtheme = bgdata;
        //console.log('BACKGROUND LOADED',backgroundtheme)

        /* items */
        for(i=0;i<data.itemlist.length;i++) {
          level_create_item(data.itemlist[i].id, v2d_new(data.itemlist[i].xpos,data.itemlist[i].ypos));
        }

        fulfill(backgroundtheme);
      });
    });
  });
}
