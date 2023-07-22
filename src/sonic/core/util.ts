
import { EPSILON, PI } from './global'
import { v2d_t, v2d_magnitude, v2d_subtract } from './v2d'

/**
 * runAnimation()
 * Animation with requestAnimationFrame
 */
export const runAnimation = (frameFunc:Function):void => {
  let lastTime:number = null;
  function frame(time:number) {
    let stop = false;
    if (lastTime != null) {
      const timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/**
 * isspace()
 * Detect if char is a space
 */
export const isspace = (str:string):boolean => {
  return str == " ";
}

/**
 * isArray()
 * Detect if object is an array
 */
export const isArray = (obj:any):boolean => {
  return (typeof obj !== 'undefined' &&
    obj && obj.constructor === Array);
}

/**
 * isInArray()
 * Detect if object is in an array
 */
export const isInArray = (value:string, array: string[]):boolean => {
  return array.indexOf(value) > -1;
}

/**
 * random()
 * Return a random number
 */
export const random = (n:number):number => {
  return ~~clip(Math.random() * n, 0, n);
}

/**
 * clip()
 * Filters a number within a range
 */
export const clip = (x:number, min:number, max:number):number => {
  return Math.min(Math.max(x, min), max);
}

/**
 * bounding_box()
 * bounding box collision method
 * r[4] = x1, y1, x2(=x1+w), y2(=y1+h)
 */
export const bounding_box = (a:number[], b:number[]):boolean => {
  return (a[0]<b[2] && a[2]>b[0] && a[1]<b[3] && a[3]>b[1]);
}

/**
 * circular_collision()
 * Circular collision method
 * a, b = points to test
 * r_a = radius of a
 * r_b = radius of b
 */
export const circular_collision = (a:v2d_t, r_a:number, b:v2d_t, r_b:number):boolean => {
  return (v2d_magnitude(v2d_subtract(a,b)) <= r_a + r_b );
}

export const swap = (a:v2d_t[],b:v2d_t[]) => {
  return swap_ex(a, b, a.length)
}

/**
 * old_school_angle()
 * Old school angle
 */
export const old_school_angle = (angle:number):number => {
  if(angle >= 0 && angle < PI/4-EPSILON)
    return 0;
  else if(angle >= PI/4-EPSILON && angle < PI/2-EPSILON)
    return PI/4;
  else if(angle >= PI/2-EPSILON && angle < PI/2+EPSILON)
    return PI/2;
  else if(angle >= PI/2+EPSILON && angle < PI-EPSILON)
    return 3*PI/4;
  else if(angle >= PI-EPSILON && angle < PI+EPSILON)
    return PI;
  else if(angle >= PI+EPSILON && angle < 3*PI/2-EPSILON)
    return 5*PI/4;
  else if(angle >= 3*PI/2-EPSILON && angle < 3*PI/2+EPSILON)
    return 3*PI/2;
  else if(angle > 3*PI/2+EPSILON && angle <= 7*PI/4+EPSILON)
    return 7*PI/4;
  else
    return 0;
}

/**
 * swap_ex()
 * Swaps two variables. Use the
 * swap() macro instead of this.
 */
const swap_ex = (a:v2d_t[], b:v2d_t[], size:number) => {
  const sa = a;
  const sb = b
  let i, c;

  for(i=0; i<size; i++) {
    c = sa[i];
    sa[i] = sb[i];
    sb[i] = c;
  }
  return [
    sa[i],
    sb[i]
  ]
}
