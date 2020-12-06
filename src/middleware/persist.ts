import { PersistOptions } from '../types/persist';
import { ReducerAction, ReducerReturnType, ReducerStore } from '../types/redux';
import { StoreSetState } from '../types/store';

const tempStorage = {
  getItem: () => null,
  setItem: () => {},
};

const persist = <T = any>(
  options: PersistOptions<T>,
  createState: T | ReducerReturnType<T>,
): ReducerReturnType<T> => (getState, setState): ReducerStore<T> => {
  const {
    name,
    storage = typeof localStorage !== 'undefined' ? localStorage : tempStorage,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const setStorage = async () =>
    storage.setItem(name, await serialize(getState()));

  (async () => {
    try {
      const storedState = await storage.getItem(name);
      if (storedState) setState(await deserialize(storedState));
    } catch (e) {
      console.error(new Error(`Unable to get to stored in "${name}"`));
    }
  })();

  if (typeof createState === 'function') {
    const {
      state,
      customSetState: dispatch,
    } = (createState as ReducerReturnType<T>)(getState, setState);
    const customSetState = (action: ReducerAction) => {
      dispatch(action);
      setStorage();
    };

    return { state, customSetState };
  } else {
    const customSetState = (nextState: StoreSetState<T>) => {
      // @ts-ignore
      setState(nextState);
      setStorage();
    };

    // @ts-ignore
    return { state: createState, customSetState };
  }
};

export default persist;
