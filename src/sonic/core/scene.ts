
/* Scene struct */
export interface scene_t {
  init:Function,
  update:Function,
  render:Function,
  release:Function
}

const SCENESTACK_CAPACITY = 16;

const scenestack:scene_t[] = [];
let scenestack_size = 0;

/**
 * scenestack_init()
 * Initializes the scene stack
 */
export const scenestack_init = () => {
  scenestack_size = 0;
  for(var i=0; i<SCENESTACK_CAPACITY; i++)
    scenestack[i] = null;
};

/**
 * scenestack_release()
 * Releases the scene stack
 */
export const scenestack_release = () => {
  while(!scenestack_empty())
    scenestack_pop();
};

/**
 * scenestack_push()
 * Inserts a new scene into the stack
 */
export const scenestack_push = (scn:scene_t) => {
  scenestack[scenestack_size++] = scn;
  if (scn) scn.init();
};

/**
 * scenestack_pop()
 * Deletes the top-most scene of the stack.
 * Please use "return" after calling pop()
 * inside a scene, otherwise the program
 * may crash.
 */
export const scenestack_pop = () => {
  scenestack[scenestack_size-1].release();
  scenestack[scenestack_size-1] = null;
  scenestack_size--;
}; 

/**
 * scenestack_top()
 * Returns the top-most scene of the stack.
 */
export const scenestack_top = () => {
  return scenestack[scenestack_size-1];
};

/**
 * scenestack_empty()
 * Is the stack empty?
 */
export const scenestack_empty = () => {
  return (scenestack_size === 0);
};

