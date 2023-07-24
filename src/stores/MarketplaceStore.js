import {flow, makeAutoObservable} from "mobx";

class MarketplaceStore {
  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }
}

export default MarketplaceStore;
