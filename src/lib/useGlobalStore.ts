import React from "react";
import {CreateStoreReducerReturnValue, CreateStoreReturnValue } from "./store";

type EqualityFunction<T> = (prev: T, next: T) => boolean;
const defaultEqualityFn = (prev: any, next: any) => prev === next;

const useGlobalStore = <T = any>(
  store: CreateStoreReturnValue<T>,
  selector?: (value: T) => any,
  equalityFn: EqualityFunction<T> = defaultEqualityFn,
): [ T, (state: any) => any ] => {
  const [, forceUpdate] = React.useReducer((curr: number) => curr + 1, 0) as [never, () => void]
  const selectedState = React.useCallback((value: T) => (
    selector ? selector(value) : value
  ), [selector]);

  React.useEffect(() => {
    // change callback
    const stateChange = store.onChange((newState: T, prevState: T) => {
      if ( !equalityFn( selectedState(newState), selectedState(prevState) ) ) {
        forceUpdate();
      }
    });

    return stateChange;
  }, [selectedState, equalityFn, store]);

  return [ selectedState(store.getState()), (store as CreateStoreReducerReturnValue<T>).dispatch || store.setState ];
};

export default useGlobalStore;