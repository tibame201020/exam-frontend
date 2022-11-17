import { Bar } from '../../model/bar';

export const HOME_SIDE_BAR: Bar = {
  alink: [
    {
      name: 'Home',
      link: '/home',
      icon: 'home',
    },
    {
      name: 'News',
      link: '/home',
      icon: 'newspaper',
    },
  ],
};

export const TEST_SIDE_BAR: Bar = {
  alink: [
    {
      name: 'home',
      link: 'test/home',
      icon: '',
    },
    {
      name: 'histroy',
      link: 'test/record-history',
      icon: '',
    },
  ],
};

export const SOLUTION_SIDE_BAR: Bar = {
  alink: [
    {
      name: 'home',
      link: 'solution/home',
      icon: '',
    }
  ],
};

export const EDIT_SIDE_BAR: Bar = {
  alink: [
    {
      name: 'home',
      link: 'edit/home',
      icon: '',
    },
    {
      name: 'add',
      link: 'edit/add',
      icon: '',
    },
  ],
};

export const SETTING_SIDE_BAR: Bar = {
  alink: [
    {
      name: 'home',
      link: 'setting/home',
      icon: '',
    }
  ],
};
