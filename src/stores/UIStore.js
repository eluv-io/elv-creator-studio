import {flow, makeAutoObservable} from "mobx";

class UIStore {
  theme = "light";
  loading = false;
  loadingMessage = "";

  showSideNav = true;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  SetLoading(loading) {
    this.loading = loading;
    this.loadingMessage = "";
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
