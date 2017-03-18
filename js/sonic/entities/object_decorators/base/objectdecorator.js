
export const get_object_instance = (obj) => {
  let me = obj;
  let decorated_machine = me.decorated_machine;
  return decorated_machine.get_object_instance(decorated_machine);
}
