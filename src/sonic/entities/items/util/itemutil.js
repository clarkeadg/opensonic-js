
import { INFINITY_FLT } from "./../../../core/global"
import { v2d_subtract, v2d_magnitude } from "./../../../core/v2d"

export const find_closest_item = (me, list, desired_type, distance) => {
  let min_dist = INFINITY_FLT;
  let it;
  let ret = null;
  let v;

  for(it=list; it; it=it.next) { 
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
