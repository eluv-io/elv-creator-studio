import {makeAutoObservable} from "mobx";

class RootStore {
  testValue = 1;
  constructor() {
    makeAutoObservable(this);
  }

  Increment() {
    this.testValue += 1;
  }
}

export const rootStore = new RootStore();

window.rootStore = rootStore;
