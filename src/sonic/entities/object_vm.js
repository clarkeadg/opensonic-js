
import { logfile_message } from "./../core/logfile"
import { objectbasicmachine_new } from "./object_decorators/base/objectbasicmachine"

/* creates a new virtual machine */
export const object_vm_create = (owner) => {
  let vm = {};
  vm.owner = owner;
  vm.state_list = null;
  vm.reference_to_current_state = null;
  return vm;
}

/* destroys an existing VM */
export const object_vm_destroy = (vm) => {
  //vm.state_list = objectmachine_list_delete(vm.state_list);
  //vm.reference_to_current_state = null;
  //vm.owner = null;
  //free(vm);
  //return null;
}

/* returns a reference to the current state */
export const object_vm_get_reference_to_current_state = (vm) => {
  return vm.reference_to_current_state;
}

/* you have to create a state before you can use it */
export const object_vm_create_state = (vm, name) => {
  //console.log('CREATE STATE',vm, name)
  if(objectmachine_list_find(vm.state_list, name) == null)
    vm.state_list = objectmachine_list_new(vm.state_list, name, vm.owner);
  //else
   // fatal_error("Object script error: can't redefine state \"%s\".", name);
  return vm.state_list;
}

/* sets the current state */
export const object_vm_set_current_state = (vm, name) => {
  //console.log('OBJECT VM SET CURRENT STATE', vm, name)
  let m = objectmachine_list_find(vm.state_list, name);
  if(m != null)
    vm.reference_to_current_state = m.data;
  else
    logfile_message("Object script error: can't find state \"%s\".", name);
  return vm;
}

const objectmachine_list_new = (list, name, owner) => {
  let l = {};
  l.name = name;
  l.data = objectbasicmachine_new(owner);
  l.next = list;
  return l;
}

const objectmachine_list_delete = (list) => {
  /*if(list != null) {
    let machine = list.data;
    objectmachine_list_delete(list.next);
    free(list.name);
    machine.release(machine);
    free(list);
  }
  return null;*/
}

const objectmachine_list_find = (list, name) => {
  //console.log('OBJECT MACHINE LIST FIND', list, name)
  if(list != null) {
    if(!list.name)
        return objectmachine_list_find(list.next, name);
      else
        return list;
  }
  return null;
}
