
import { EPSILON, PI } from './global'
import { v2d_magnitude, v2d_subtract } from './v2d'

export const runAnimation = (frameFunc) => {
  let lastTime = null;
  function frame(time) {
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

export const isspace = (str) => {
  return str == " ";
}

export const isArray = (obj) => {
  return (typeof obj !== 'undefined' &&
    obj && obj.constructor === Array);
}

export const isInArray = (value, array) => {
  return array.indexOf(value) > -1;
}

export const random = (n) => {
  return clip(parseInt(Math.random(n) * n,10),1,n);
}

export const clip = (x, min, max) => {
  return Math.min(Math.max(x, min), max);
}

export const bounding_box = (a, b) => {
  return (a[0]<b[2] && a[2]>b[0] && a[1]<b[3] && a[3]>b[1]);
}

export const circular_collision = (a, r_a, b, r_b) => {
  return (v2d_magnitude(v2d_subtract(a,b)) <= r_a + r_b );
}

export const swap = (a,b) => {
  return swap_ex(a, b, a.length)
}

export const old_school_angle = (angle) => {
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

const swap_ex = (a, b, size) => {
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
