import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private selectedTabIndex = new BehaviorSubject<number>(0);
  selectedTabIndex$ = this.selectedTabIndex.asObservable();

  setSelectedTabIndex(index: number) {
    this.selectedTabIndex.next(index);
  }
}
