import { Injectable } from '@angular/core';
import { ZustandBaseService } from 'ngx-zustand';

interface CounterState {
  counter: number;
  increment: () => void;
  decrement: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class CounterService extends ZustandBaseService<CounterState> {
  initStore() {
    // @ts-ignore
    return (set) => ({
      counter: 0,
      // @ts-ignore
      increment: () => set((state) => ({ counter: state.counter + 1 })),
      // @ts-ignore
      decrement: () => set((state) => ({ counter: state.counter - 1 })),
    });
  }
}
