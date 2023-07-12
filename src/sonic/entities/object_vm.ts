
import { logfile_message } from "./../core/logfile"
import { objectmachine_t } from "./object_decorators/base/objectmachine"
import { objectbasicmachine_new } from "./object_decorators/base/objectbasicmachine"

export interface objectvm_t {
  owner: any,
  state_list: objectmachine_list_t,
  reference_to_current_state: objectmachine_t
}

export interface objectmachine_list_t {
  name: string,
  data: objectmachine_t,
  next: objectmachine_list_t
}

/* creates a new virtual machine */
export const object_vm_create = (owner:any) => {
  const vm:objectvm_t = <objectvm_t>owner;
  vm.owner = owner;
  vm.state_list = null;
  vm.reference_to_current_state = null;
  return vm;
}

/* destroys an existing VM */
export const object_vm_destroy = (vm:objectvm_t):objectvm_t => {
  vm.state_list = objectmachine_list_delete(vm.state_list);
  vm.reference_to_current_state = null;
  vm.owner = null;
  //free(vm);
  return null;
}

/* returns a reference to the current state */
export const object_vm_get_reference_to_current_state = (vm:objectvm_t) => {
  return vm.reference_to_current_state;
}

/* you have to create a state before you can use it */
export const object_vm_create_state = (vm:objectvm_t, name:string) => {
  //console.log('CREATE STATE',vm, name)
  if(objectmachine_list_find(vm.state_list, name) == null)
    vm.state_list = objectmachine_list_new(vm.state_list, name, vm.owner);
  //else
   // fatal_error("Object script error: can't redefine state \"%s\".", name);
  return vm.state_list;
}

/* sets the current state */
export const object_vm_set_current_state = (vm:objectvm_t, name:string) => {
  //console.log('OBJECT VM SET CURRENT STATE', vm, name)
  let m = objectmachine_list_find(vm.state_list, name);
  if(m != null)
    vm.reference_to_current_state = m.data;
  else
    logfile_message(`Object script error: can't find state ${name}`);
  return vm;
}

const objectmachine_list_new = (list:objectmachine_list_t, name:string, owner:any) => {
  const l:objectmachine_list_t = {
    name: name,
    data: objectbasicmachine_new(owner),
    next: list
  };
  
  return l;
}

const objectmachine_list_delete = (list:objectmachine_list_t):objectmachine_list_t => {
  if(list != null) {
    const machine:objectmachine_t = list.data;
    objectmachine_list_delete(list.next);
    //free(list.name);
    machine.release(machine);
    //free(list);
  }
  return null;
}

const objectmachine_list_find = (list:objectmachine_list_t, name:string):objectmachine_list_t => {
  //console.log('OBJECT MACHINE LIST FIND', list, name)
  if(list != null) {
    if(list.name == name)
        return objectmachine_list_find(list.next, name);
      else
        return list;
  }
  return null;
}
