import {flow, makeAutoObservable} from "mobx";

class UIStore {
  theme = "light";

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  SetTheme(theme) {
    this.theme = theme;
  }
}

export default UIStore;
