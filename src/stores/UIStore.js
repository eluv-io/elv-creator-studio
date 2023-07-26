import {flow, makeAutoObservable} from "mobx";

class UIStore {
  theme = "light";
  loading = false;
  loadingMessage = "";

  showSideNav = false;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  SetLoading(loading) {
    this.loading = loading;
  }

  SetShowSideNav(show) {
    this.showSideNav = show;
  }

  SetLoadingMessage(message) {
    this.loadingMessage = message;
  }

  SetTheme(theme) {
    this.theme = theme;
  }
}

export default UIStore;
