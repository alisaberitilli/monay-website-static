import isEqual from "lodash.isequal";
import { Model, model, modelAction, prop } from "mobx-keystone";

import { ONE_MIN, ONE_MS } from "#constants";

const MIN_LOAD_TIME = ONE_MS * 500;

interface IncomingTrueLoadState {
  loading: true;
  meta?: React.ReactNode;
  timeout?: number;
  canCancel?: boolean;
}
interface IncomingMetaLoadState {
  loading?: true;
  meta: React.ReactNode;
  timeout?: number;
  canCancel?: boolean;
}
interface IncomingFalseLoadState {
  loading: false;
  canCancel?: boolean;
}
type WithoutCancel<T> = Omit<T, "canCancel">;
export type LoadState =
  | IncomingTrueLoadState
  | IncomingMetaLoadState
  | IncomingFalseLoadState;
export type IncomingLoaderState =
  | WithoutCancel<IncomingTrueLoadState>
  | WithoutCancel<IncomingMetaLoadState>
  | WithoutCancel<IncomingFalseLoadState>;

@model("Loader")
class LoaderModel extends Model({
  loading: prop<boolean>(false),
  meta: prop<React.ReactNode | undefined>(() => undefined),
  canCancel: prop<boolean | undefined>(undefined),
}) {
  inProcess = false;

  loadQueue: IncomingLoaderState[] = [];

  resetTimer: NodeJS.Timeout | null = null;
  loadTimer: NodeJS.Timeout | null = null;

  @modelAction
  setGlobalLoading(state: IncomingLoaderState) {
    if (
      !this.loadQueue.find((queueState) => isEqual(queueState, { ...state }))
    ) {
      this.loadQueue.push(state);
    }

    if (!this.loadTimer) {
      this.activateLoadingQueue(!this.inProcess);
    }
  }

  updateCurrentLoadState(state: Partial<LoadState>) {
    const { loading } = state;
    if (typeof loading === "boolean") this.loading = loading;
    if (loading) {
      const { meta, canCancel } = state;
      if (meta) this.meta = meta;
      if (canCancel) this.canCancel = canCancel;
    } else {
      this.meta = null;
      this.canCancel = false;
    }
  }

  activateLoadingState(state: LoadState) {
    this.inProcess = true;
    this.updateCurrentLoadState({ ...state, canCancel: false });
    // changing the meta does not change the cancellation window timer
    if (state.loading) {
      this.resetTimer = setTimeout(() => {
        this.canCancel = true;
      }, state.timeout ?? ONE_MIN);
    }
  }

  @modelAction
  deactivateLoadingState() {
    this.inProcess = false;
    this.updateCurrentLoadState({ loading: false, canCancel: false });
    clearTimeout(this.loadTimer ?? undefined);
    this.loadTimer = null;
    clearTimeout(this.resetTimer ?? undefined);
    this.resetTimer = null;
  }

  dequeue = () => {
    let next = this.loadQueue.shift();
    if (next) {
      // if next state is false but any other future states are true we can skip setting to false
      // otherwise. we're done
      if (next.loading === false) {
        const nextLoadStateIndex = this.loadQueue.findIndex(
          (state) => state.loading === true
        );
        if (nextLoadStateIndex >= 0) {
          this.loadQueue.splice(0, nextLoadStateIndex);
          next = this.loadQueue.shift();
          if (next) {
            this.activateLoadingState(next);
          }
        } else {
          this.deactivateLoadingState();
        }
      }
    }
  };

  activateLoadingQueue(immediate?: boolean) {
    this.loadTimer = setInterval(() => this.dequeue(), MIN_LOAD_TIME);
    if (immediate) this.dequeue();
  }

  protected onAttachedToRootStore(rootStore: object): void | (() => void) {
    console.log("loader attached");
    this.loadQueue = [];
  }
}
export const createLoaderModel = () =>
  new LoaderModel({ loading: false, meta: null });
export default LoaderModel;
