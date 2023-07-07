  
const SCENESTACK_CAPACITY = 16;

let scenestack = [];
let scenestack_size = 0;

export const scenestack_init = () => {
  scenestack_size = 0;
  for(var i=0; i<SCENESTACK_CAPACITY; i++)
    scenestack[i] = null;
};

export const scenestack_release = () => {
  while(!scenestack_empty())
    scenestack_pop();
};

export const scenestack_push = (scn) => {
  scenestack[scenestack_size++] = scn;
  if (scn) scn.init();
};

export const scenestack_pop = () => {
  scenestack[scenestack_size-1].release();
  scenestack[scenestack_size-1] = null;
  scenestack_size--;
}; 

export const scenestack_top = () => {
  return scenestack[scenestack_size-1];
};

export const scenestack_empty = () => {
  return (scenestack_size === 0);
};

