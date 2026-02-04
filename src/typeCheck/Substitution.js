export class Subs {

  constructor(){
    this.subs = {};
  }

  add(name, type){
    if (this.subs[name] !== undefined){
      throw new Error("This substitution already exists  : " + name);
    } else {
      this.subs[name] = type;
    }
  }

  merge(newSubs){
    for (let subKey of Object.keys(newSubs)){
      this.subs.add(subKey, newSubs[subKey]);
    }
  }

}

export function newSub(name, type){
  let subs = new Subs();
  subs.add(name, type);
  return subs;
}