
import { objectmachine_t } from "./objectmachine"

export interface objectdecorator_t extends objectmachine_t {
  decorated_machine: objectmachine_t
}

export const get_object_instance = (obj:objectmachine_t) => {
  const me:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = me.decorated_machine;
  
  return decorated_machine.get_object_instance(decorated_machine);
}
