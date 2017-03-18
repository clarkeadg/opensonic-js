
import { v2d_new } from "./../../core/v2d"
import { font_create, font_destroy, font_render, font_set_text, font_get_charsize } from "./../../entities/font"

export const GROUPTREE_MAXCHILDREN = 10;

export const grouptree_destroy_all = (root) => {
  let i;

  if(root) {
    for(i=0; i<root.child_count; i++)
      grouptree_destroy_all(root.child[i]);
    root = null;
  }
}

export const grouptree_init_all = (root) => {
  let i;

  if(root) {
    root.init(root);
    for(i=0; i<root.child_count; i++)
      grouptree_init_all(root.child[i]);
  }
}

export const grouptree_release_all = (root) => {
  let i;

  if(root) {
    for(i=0; i<root.child_count; i++)
      grouptree_release_all(root.child[i]);
    root.release(root);
  }
}

export const grouptree_update_all = (root) => {
  let i;

  if(root) {
    for(i=0; i<root.child_count; i++)
      grouptree_update_all(root.child[i]);
    root.update(root);
  }
}

export const grouptree_render_all = (root, camera_position) => {
  let i;

  if(root) {
    for(i=0; i<root.child_count; i++)
      grouptree_render_all(root.child[i], camera_position);
    root.render(root, camera_position);
  }
}

export const grouptree_nodecount = (root) => {
  let i;
  let sum = 0;

  if(root) {
    for(i=0; i<root.child_count; i++)
        sum += grouptree_nodecount(root.child[i]);
    return 1 + sum;
  }
  else 
    return 0; 
}

export const grouptree_group_create = (init, release, update, render) => {
  let g = {};

  /* methods */
  g.init = init;
  g.release = release;
  g.update = update;
  g.render = render;

  /* internal data */
  g.font = null;
  g.data = null;
  g.parent = null;
  g.child_count = 0;
  g.child = [];

  /* done! */
  return g;
}

export const grouptree_group_addchild = (g, child) => {
  if(g.child_count < GROUPTREE_MAXCHILDREN) {
    g.child[ g.child_count++ ] = child;
    child.parent = g;
  }
}

export const grouptree_group_label_create = () => {
  return grouptree_group_create(group_label_init, group_label_release, group_label_update, group_label_render);
}

export const grouptree_group_label_init = (g) => {

  g.font = font_create(8);
  font_set_text(g.font, "LABEL"); /* if you want a different text, please derive this class */

  /* calculating my position... */
  if(g.parent != null) {
      let my_id, i, nodecount=0;
      let spacing = (g.parent.font != null) ? font_get_charsize(g.parent.font) : v2d_new(12,12);

      for(my_id=0; my_id < g.parent.child_count; my_id++) {
        if(g.parent.child[my_id] == g) {
          break;
        }
      }

      for(i=0; i<my_id; i++)
        nodecount += grouptree_nodecount(g.parent.child[i])-1;

      g.font.position = {
        x: g.parent.font.position.x,
        y: g.parent.font.position.y
      };
      g.font.position.x += spacing.x * 3;
      g.font.position.y += (1+nodecount+my_id) * spacing.y * 2;
  }
}

export const grouptree_group_label_release = (g) => {
  font_destroy(g.font);
}

export const grouptree_group_label_update = (g) => {}

export const grouptree_group_label_render = (g, camera_position) => {
  font_render(g.font, camera_position);      
}
