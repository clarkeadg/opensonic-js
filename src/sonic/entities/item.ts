
import { v2d_t } from "../core/v2d"
import { PLAYERS } from "./../scenes/level"

import { animal_create } from "./items/animal"
import { animalprison_create } from "./items/animalprison"
import { bigring_create } from "./items/bigring"
import { bluering_create } from "./items/bluering"
import { bumper_create } from "./items/bumper"
import { checkpointorb_create } from "./items/checkpointorb"
import { crushedbox_create } from "./items/crushedbox"
import { horizontaldanger_create, verticaldanger_create, horizontalfiredanger_create, verticalfiredanger_create } from "./items/danger"
import { dangerouspower_create } from "./items/dangpower"
import { surge_dnadoor_create, neon_dnadoor_create, charge_dnadoor_create, surge_horizontal_dnadoor_create, neon_horizontal_dnadoor_create, charge_horizontal_dnadoor_create } from "./items/dnadoor"
import { door_create } from "./items/door"
import { endsign_create } from "./items/endsign"
import { explosion_create } from "./items/explosion"
import { falglasses_create } from "./items/falglasses"
import { fireball_create } from "./items/fireball"
import { flyingtext_create } from "./items/flyingtext"
import { goalsign_create } from "./items/goalsign"
import { icon_create } from "./items/icon"
import { lifebox_create, ringbox_create, starbox_create, speedbox_create, glassesbox_create, shieldbox_create, trapbox_create, emptybox_create, fireshieldbox_create, thundershieldbox_create, watershieldbox_create, acidshieldbox_create, windshieldbox_create } from "./items/itembox"
import { loopright_create, looptop_create, loopleft_create, loopnone_create, loopfloor_create, loopfloornone_create, loopfloortop_create } from "./items/loop"
import { ring_create } from "./items/ring"
import { floorspikes_create, ceilingspikes_create, leftwallspikes_create, rightwallspikes_create, periodic_floorspikes_create, periodic_ceilingspikes_create, periodic_leftwallspikes_create, periodic_rightwallspikes_create } from "./items/spikes"
import { yellowspring_create, tryellowspring_create, ryellowspring_create, bryellowspring_create, byellowspring_create, blyellowspring_create, lyellowspring_create, tlyellowspring_create, redspring_create, trredspring_create, rredspring_create, brredspring_create, bredspring_create, blredspring_create, lredspring_create, tlredspring_create, bluespring_create, trbluespring_create, rbluespring_create, brbluespring_create, bbluespring_create, blbluespring_create, lbluespring_create, tlbluespring_create } from "./items/spring"
import { switch_create } from "./items/switch"
import { teleporter_create } from "./items/teleporter"

export  const ITEMDATA_MAX            =  82; /* number of existing items */

/* item list */
export const IT_RING                 =  0;  /* ordinary ring */
export const IT_LIFEBOX              =  1;  /* life box */
export const IT_RINGBOX              =  2;  /* ring box */
export const IT_STARBOX              =  3;  /* invincibility stars */
export const IT_SPEEDBOX             =  4;  /* speed shoes */
export const IT_GLASSESBOX           =  5;  /* glasses */
export const IT_SHIELDBOX            =  6;  /* shield */
export const IT_TRAPBOX              =  7;  /* trap box */
export const IT_EMPTYBOX             =  8;  /* empty box */
export const IT_CRUSHEDBOX           =  9;  /* crushed box */
export const IT_ICON                 =  10; /* box-related icon */
export const IT_FALGLASSES           =  11; /* falling glasses */
export const IT_EXPLOSION            =  12; /* explosion sprite */
export const IT_FLYINGTEXT           =  13; /* flying text */
export const IT_PIXEL                =  14; /* UNUSED */
export const IT_ANIMAL               =  15; /* little animal */
export const IT_LOOPRIGHT            =  16; /* loop right */
export const IT_LOOPMIDDLE           =  17; /* loop middle */
export const IT_LOOPLEFT             =  18; /* loop left */
export const IT_LOOPNONE             =  19; /* loop none */
export const IT_YELLOWSPRING         =  20; /* yellow spring */
export const IT_REDSPRING            =  21; /* red spring */
export const IT_RREDSPRING           =  22; /* right red spring */
export const IT_LREDSPRING           =  23; /* left red spring */
export const IT_BLUERING             =  24; /* blue ring */
export const IT_SWITCH               =  25; /* switch */
export const IT_DOOR                 =  26; /* door */
export const IT_TELEPORTER           =  27; /* teleporter */
export const IT_BIGRING              =  28; /* big ring */
export const IT_CHECKPOINT           =  29; /* checkpoint */
export const IT_GOAL                 =  30; /* goal sign */
export const IT_ENDSIGN              =  31; /* end sign */
export const IT_ENDLEVEL             =  32; /* end level */
export const IT_LOOPFLOOR            =  33; /* loop floor */
export const IT_LOOPFLOORNONE        =  34; /* loop floor none */
export const IT_LOOPFLOORTOP         =  35; /* loop floor top */
export const IT_BUMPER               =  36; /* bumper */
export const IT_DANGER               =  37; /* danger */
export const IT_SPIKES               =  38; /* spikes */
export const IT_DNADOOR              =  39; /* DNA door: Surge */
export const IT_DANGPOWER            =  40; /* dangerous power (boss attack) */
export const IT_FIREBALL             =  41; /* fireball */
export const IT_FIRESHIELDBOX        =  42; /* fire shield */
export const IT_TRREDSPRING          =  43; /* top-right red spring */
export const IT_TLREDSPRING          =  44; /* top-left red spring */
export const IT_BRREDSPRING          =  45; /* bottom-right red spring */
export const IT_BLREDSPRING          =  46; /* bottom-left red spring */
export const IT_BREDSPRING           =  47; /* bottom red spring */
export const IT_RYELLOWSPRING        =  48; /* right yellow spring */
export const IT_LYELLOWSPRING        =  49; /* left yellow spring */
export const IT_TRYELLOWSPRING       =  50; /* top right yellow spring */
export const IT_TLYELLOWSPRING       =  51; /* top left yellow spring */
export const IT_BRYELLOWSPRING       =  52; /* bottom right yellow spring */
export const IT_BLYELLOWSPRING       =  53; /* bottom left yellow spring */
export const IT_BYELLOWSPRING        =  54; /* Bottom yellow spring */
export const IT_BLUESPRING           =  55; /* blue spring */
export const IT_RBLUESPRING          =  56; /* right blue spring */
export const IT_LBLUESPRING          =  57; /* left blue spring */
export const IT_TRBLUESPRING         =  58; /* top right blue spring */
export const IT_TLBLUESPRING         =  59; /* top left blue spring */
export const IT_BRBLUESPRING         =  60; /* bottom right blue spring */
export const IT_BLBLUESPRING         =  61; /* bottom left blue spring */
export const IT_BBLUESPRING          =  62; /* bottom blue spring */
export const IT_CEILSPIKES           =  63; /* spikes on the ceiling */
export const IT_LWSPIKES             =  64; /* spikes on left walls */
export const IT_RWSPIKES             =  65; /* spikes on right walls */
export const IT_PERSPIKES            =  66; /* periodic spikes on the floor */
export const IT_PERCEILSPIKES        =  67; /* periodic spikes on the ceiling */
export const IT_PERLWSPIKES          =  68; /* periodic spikes on left walls */
export const IT_PERRWSPIKES          =  69; /* periodic spikes on right walls */
export const IT_DNADOORNEON          =  70; /* DNA door: Neon */
export const IT_DNADOORCHARGE        =  71; /* DNA door: Charge */
export const IT_HDNADOOR             =  72; /* Horizontal DNA door: Surge */
export const IT_HDNADOORNEON         =  73; /* Horizontal DNA door: Neon */
export const IT_HDNADOORCHARGE       =  74; /* Horizontal DNA door: Charge */
export const IT_VDANGER              =  75; /* Vertical Danger */
export const IT_FIREDANGER           =  76; /* Fire Danger */
export const IT_VFIREDANGER          =  77; /* Vertical Fire Danger */
export const IT_THUNDERSHIELDBOX     =  78; /* Thunder shield box */
export const IT_WATERSHIELDBOX       =  79; /* Water shield box */
export const IT_ACIDSHIELDBOX        =  80; /* Acid shield box */
export const IT_WINDSHIELDBOX        =  81; /* Wind shield box */

export enum itemstate_t {
  IS_IDLE,
  IS_DEAD
}

export const { IS_IDLE, IS_DEAD } = itemstate_t;

export interface item_t {
  init: Function,
  release: Function,
  update: Function,
  render: Function,
  actor: any,
  state: itemstate_t,
  type: number,
  obstacle: number,
  preserve: number,
  bring_to_back: number
}

export interface item_list_t {
  data: item_t,
  next: item_list_t
}

/**
 * item_create()
 * Creates a new item
 */
export const item_create = function(type:number):item_t {
  let item:any = null;

  switch(type) {
    case IT_RING:
        item = ring_create();
        break;

    case IT_LIFEBOX:
        item = lifebox_create();
        break;

    case IT_RINGBOX:
        item = ringbox_create();
        break;

    case IT_STARBOX:
        item = starbox_create();
        break;

    case IT_SPEEDBOX:
        item = speedbox_create();
        break;

    case IT_GLASSESBOX:
        item = glassesbox_create();
        break;

    case IT_SHIELDBOX:
        item = shieldbox_create();
        break;

    case IT_FIRESHIELDBOX:
        item = fireshieldbox_create();
        break;

    case IT_THUNDERSHIELDBOX:
        item = thundershieldbox_create();
        break;

    case IT_WATERSHIELDBOX:
        item = watershieldbox_create();
        break;

    case IT_ACIDSHIELDBOX:
        item = acidshieldbox_create();
        break;

    case IT_WINDSHIELDBOX:
        item = windshieldbox_create();
        break;

    case IT_TRAPBOX:
        item = trapbox_create();
        break;

    case IT_EMPTYBOX:
        item = emptybox_create();
        break;

    case IT_CRUSHEDBOX:
        item = crushedbox_create();
        break;

    case IT_ICON:
        item = icon_create();
        break;

    case IT_FALGLASSES:
        item = falglasses_create();
        break;

    case IT_EXPLOSION:
        item = explosion_create();
        break;

    case IT_FLYINGTEXT:
        item = flyingtext_create();
        break;

    case IT_ANIMAL:
        item = animal_create();
        break;

    case IT_LOOPRIGHT:
        item = loopright_create();
        break;

    case IT_LOOPMIDDLE:
        item = looptop_create();
        break;

    case IT_LOOPLEFT:
        item = loopleft_create();
        break;

    case IT_LOOPNONE:
        item = loopnone_create();
        break;

    case IT_LOOPFLOOR:
        item = loopfloor_create();
        break;

    case IT_LOOPFLOORNONE:
        item = loopfloornone_create();
        break;

    case IT_LOOPFLOORTOP:
        item = loopfloortop_create();
        break;

    case IT_YELLOWSPRING:
        item = yellowspring_create();
        break;

    case IT_BYELLOWSPRING:
        item = byellowspring_create();
        break;

    case IT_TRYELLOWSPRING:
        item = tryellowspring_create();
        break;

    case IT_RYELLOWSPRING:
        item = ryellowspring_create();
        break;

    case IT_BRYELLOWSPRING:
        item = bryellowspring_create();
        break;

    case IT_BLYELLOWSPRING:
        item = blyellowspring_create();
        break;

    case IT_LYELLOWSPRING:
        item = lyellowspring_create();
        break;

    case IT_TLYELLOWSPRING:
        item = tlyellowspring_create();
        break;

    case IT_REDSPRING:
        item = redspring_create();
        break;

    case IT_BREDSPRING:
        item = bredspring_create();
        break;

    case IT_TRREDSPRING:
        item = trredspring_create();
        break;

    case IT_RREDSPRING:
        item = rredspring_create();
        break;

    case IT_BRREDSPRING:
        item = brredspring_create();
        break;

    case IT_BLREDSPRING:
        item = blredspring_create();
        break;

    case IT_LREDSPRING:
        item = lredspring_create();
        break;

    case IT_TLREDSPRING:
        item = tlredspring_create();
        break;

    case IT_BLUESPRING:
        item = bluespring_create();
        break;

    case IT_BBLUESPRING:
        item = bbluespring_create();
        break;

    case IT_TRBLUESPRING:
        item = trbluespring_create();
        break;

    case IT_RBLUESPRING:
        item = rbluespring_create();
        break;

    case IT_BRBLUESPRING:
        item = brbluespring_create();
        break;

    case IT_BLBLUESPRING:
        item = blbluespring_create();
        break;

    case IT_LBLUESPRING:
        item = lbluespring_create();
        break;

    case IT_TLBLUESPRING:
        item = tlbluespring_create();
        break;

    case IT_BLUERING:
        item = bluering_create();
        break;

    case IT_SWITCH:
        item = switch_create();
        break;

    case IT_DOOR:
        if (PLAYERS.length > 1) {
          item = door_create();
        }
        break;

    case IT_TELEPORTER:
        item = teleporter_create();
        break;

    case IT_BIGRING:
        item = bigring_create();
        break;

    case IT_CHECKPOINT:
        item = checkpointorb_create();
        break;

    case IT_GOAL:
        item = goalsign_create();
        break;

    case IT_ENDSIGN:
        item = endsign_create();
        break;

    case IT_ENDLEVEL:
        item = animalprison_create();
        break;

    case IT_BUMPER:
        item = bumper_create();
        break;

    case IT_DANGER:
        item = horizontaldanger_create();
        break;

    case IT_VDANGER:
        item = verticaldanger_create();
        break;

    case IT_FIREDANGER:
        item = horizontalfiredanger_create();
        break;

    case IT_VFIREDANGER:
        item = verticalfiredanger_create();
        break;

    case IT_SPIKES:
        item = floorspikes_create();
        break;

    case IT_CEILSPIKES:
        item = ceilingspikes_create();
        break;

    case IT_LWSPIKES:
        item = leftwallspikes_create();
        break;

    case IT_RWSPIKES:
        item = rightwallspikes_create();
        break;

    case IT_PERSPIKES:
        item = periodic_floorspikes_create();
        break;

    case IT_PERCEILSPIKES:
        item = periodic_ceilingspikes_create();
        break;

    case IT_PERLWSPIKES:
        item = periodic_leftwallspikes_create();
        break;

    case IT_PERRWSPIKES:
        item = periodic_rightwallspikes_create();
        break;

    case IT_DNADOOR:
        item = surge_dnadoor_create();
        break;

    case IT_DNADOORNEON:
        item = neon_dnadoor_create();
        break;

    case IT_DNADOORCHARGE:
        item = charge_dnadoor_create();
        break;

    case IT_HDNADOOR:
        item = surge_horizontal_dnadoor_create();
        break;

    case IT_HDNADOORNEON:
        item = neon_horizontal_dnadoor_create();
        break;

    case IT_HDNADOORCHARGE:
        item = charge_horizontal_dnadoor_create();
        break;

    case IT_DANGPOWER:
        item = dangerouspower_create();
        break;

    case IT_FIREBALL:
        item = dangerouspower_create();
        break;
  }

  if(item != null) {
      item.type = type;
      item.state = IS_IDLE;
      item.init(item);
  }

  return item;
}

/**
 * item_destroy()
 * Destroys an item
 */
export const item_destroy = function(item:item_t):item_t {
  //item.release(item);
  //free(item);
  return null;
}

/**
 * item_update()
 * Runs every cycle of the game to update an item
 */
export const item_update = function(item:item_t, team:any, team_size:number, brick_list:any, item_list:item_list_t, enemy_list:any) {
  item.update(item, team, team_size, brick_list, item_list, enemy_list);
}

/**
 * item_render()
 * Renders an item
 */
export const item_render = function(item:item_t, camera_position:v2d_t) {
  item.render(item, camera_position);
}
