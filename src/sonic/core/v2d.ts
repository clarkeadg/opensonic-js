
import { EPSILON } from "./global"
import { clip } from "./util"

/* 2D vector structure */
interface v2d_t {
  x: number,
  y: number
}

/**
 * v2d_new()
 * Creates a new 2D vector
 */
export const v2d_new = (x:number, y:number):v2d_t => {
  const v:v2d_t = { x: x , y: y };
  return v;
}

/**
 * v2d_add()
 * Adds two vectors
 */
export const v2d_add = (u:v2d_t, v:v2d_t):v2d_t => {
  const w:v2d_t = { x: u.x + v.x , y: u.y + v.y };
  return w;
}

/**
 * v2d_subtract()
 * Subtracts two vectors
 */
export const v2d_subtract = (u:v2d_t, v:v2d_t):v2d_t => {
  const w:v2d_t = { x: u.x - v.x , y: u.y - v.y };
  return w;
}

/**
 * v2d_multiply()
 * Multiplies a vector by a scalar
 */
export const v2d_multiply = (u:v2d_t, h:number):v2d_t => {
  const v:v2d_t = { x: h * u.x , y: h * u.y };
  return v;
}

/**
 * v2d_magnitude()
 * Returns the magnitude of a given vector
 */
export const v2d_magnitude = (v:v2d_t ):number => {
  return Math.sqrt( (v.x*v.x) + (v.y*v.y) );
}

/**
 * v2d_dotproduct()
 * Dot product: u.v
 */
export const v2d_dotproduct = (u:v2d_t , v:v2d_t):number => {
  return (u.x*v.x + u.y*v.y);
}

/**
 * v2d_rotate()
 * Rotates a vector. Angle in radians.
 */
export const v2d_rotate = (v:v2d_t, ang:number):v2d_t => {
  const x = v.x;
  const y = v.y;
  const w:v2d_t = {
    x: x*Math.cos(ang) - y*Math.sin(ang),
    y: y*Math.cos(ang) + x*Math.sin(ang)
  };
  return w;
}

/**
 * v2d_normalize()
 * The same thing as v = v / |v|,
 * where |v| is the magnitude of v.
 */
export const v2d_normalize = (v:v2d_t):v2d_t => {
  const m = v2d_magnitude(v);
  const w = (m > EPSILON) ? v2d_new(v.x/m,v.y/m) : v2d_new(0,0);
  return w;
};

/**
 * v2d_lerp()
 * Performs a linear interpolation
 * between u and v.
 * 0.0 <= weight <= 1.0
 * The same as: (1-weight)*u + weight*v
 */
export const v2d_lerp = (u:v2d_t , v:v2d_t , weight:number):v2d_t => {
  const w = clip(weight, 0.0, 1.0);
  const c = 1.0 - w;
  return v2d_new(u.x*c+v.x*w, u.y*c+v.y*w);
}
