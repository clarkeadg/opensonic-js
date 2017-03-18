
import { EPSILON } from "./global"
import { clip } from "./util"

export const v2d_new = (x, y) => {
  const v = { x: x , y: y };
  return v;
}

export const v2d_add = (u, v) => {
  const w = { x: u.x + v.x , y: u.y + v.y };
  return w;
}

export const v2d_subtract = (u, v) => {
  const w = { x: u.x - v.x , y: u.y - v.y };
  return w;
}

export const v2d_multiply = (u, h) => {
  const v = { x: h * u.x , y: h * u.y };
  return v;
}

export const v2d_rotate = (v, ang) => {
  const x = v.x;
  const y = v.y;
  const w = {};
  w.x = x*Math.cos(ang) - y*Math.sin(ang);
  w.y = y*Math.cos(ang) + x*Math.sin(ang);
  return w;
}

export const v2d_magnitude = (v) => {
  return Math.sqrt( (v.x*v.x) + (v.y*v.y) );
}

export const v2d_normalize = (v) => {
  const m = v2d_magnitude(v);
  const w = (m > EPSILON) ? v2d_new(v.x/m,v.y/m) : v2d_new(0,0);
  return w;
};

export const v2d_dotproduct = (u, v) => {
  return (u.x*v.x + u.y*v.y);
}

export const v2d_lerp = (u, v, weight) => {
  const w = clip(weight, 0.0, 1.0);
  const c = 1.0 - w;
  return v2d_new(u.x*c+v.x*w, u.y*c+v.y*w);
}
