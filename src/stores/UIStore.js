import {makeAutoObservable, runInAction} from "mobx";

class UIStore {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  pageWidth = window.innerWidth;
  pageHeight = window.innerHeight;

  theme = "light";
  loading = false;
  loadingMessage = "";

  showSideNav = false;

  inputWidthNarrow = 400;
  inputWidth = 600;
  inputWidthWide = 800;
  inputWidthExtraWide=1000;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.resizeHandler = new ResizeObserver(elements => {
      const {width, height} = elements[0].contentRect;

      this.HandleContentResize({width, height});
    });

    this.resizeHandler.observe(document.body);

    window.addEventListener("resize", () => this.HandleViewportResize());
  }

  HandleContentResize({width, height}) {
    clearTimeout(this.contentResizeTimeout);

    this.contentResizeTimeout = setTimeout(() => {
      runInAction(() => {
        this.pageWidth = width;
        this.pageHeight = height;
      });
    }, 250);
  }

  HandleViewportResize() {
    clearTimeout(this.viewportResizeTimeout);

    this.viewportResizeTimeout = setTimeout(() => {
      runInAction(() => {
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
      });
    }, 250);
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
