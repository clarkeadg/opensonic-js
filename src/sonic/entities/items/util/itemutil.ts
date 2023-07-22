
import { item_t, item_list_t } from "./../../item"
import { INFINITY_FLT } from "./../../../core/global"
import { v2d_t, v2d_subtract, v2d_magnitude } from "./../../../core/v2d"

export interface item_distance_t {
  dist: number
}

export const find_closest_item = (me:item_t, list:item_list_t, desired_type:number, distance:item_distance_t):item_t => {
  let min_dist = INFINITY_FLT;
  let ret:item_t = null;
  let v:v2d_t = null;

  for(let it=list; it; it=it.next) { 
    if(it.data && it.data.type == desired_type) {
      v = v2d_subtract(it.data.actor.position, me.actor.position);
      if(v2d_magnitude(v) < min_dist) {
        ret = it.data;
        min_dist = v2d_magnitude(v);
      }
    }
  }

  if(distance)
    distance.dist = min_dist;

  return ret;
}
