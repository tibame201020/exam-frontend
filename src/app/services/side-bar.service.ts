import { Injectable } from '@angular/core';
import {
  TEST_SIDE_BAR,
  SOLUTION_SIDE_BAR,
  EDIT_SIDE_BAR,
  HOME_SIDE_BAR,
  SETTING_SIDE_BAR,
} from '../bars/config/side-bar';
import { Bar } from '../model/bar';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  sidebar: Bar = HOME_SIDE_BAR;
  constructor() {}

  init() {
    let path = window.location.pathname;
    switch (true) {
      case path == '/home':
        return false;
      case path == '/':
        return false;
      case path == '/test/exam':
        return false;
      case path.includes('/test'):
        this.sidebar = TEST_SIDE_BAR;
        return true;
      case path.includes('/solution'):
        return false;
      case path.includes('/edit'):
        this.sidebar = EDIT_SIDE_BAR;
        return true;
      case path.includes('/setting'):
        this.sidebar = SETTING_SIDE_BAR;
        return true;
      default:
        return false;
    }
  }
}
