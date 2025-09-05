import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ScrollState {
  scrollSpeed: number;
  isScrolling: boolean;
  scrollIntervalId: NodeJS.Timeout | null;
  scrollStartDelay: number;
  scrollDuration: number;
  stopScrollOnTouchScroll: boolean;
}

const initialState: ScrollState = {
  scrollSpeed: 2.25,
  isScrolling: false,
  scrollIntervalId: null,
  scrollStartDelay: 3,
  scrollDuration: 0,
  stopScrollOnTouchScroll: false,
};

export const scrollSlice = createSlice({
  name: 'scroll',
  initialState,
  reducers: {
    setScrollStatus: (state, action: PayloadAction<boolean>) => {
      state.isScrolling = action.payload;
    },
    incrementScrollSpeed: (state) => {
      state.scrollSpeed += 0.25;
    },

    decrementScrollSpeed: (state) => {
      state.scrollSpeed -= 0.25;
    },

    resetScrollSpeed: (state) => {
      state.scrollSpeed = initialState.scrollSpeed;
    },

    setScrollSpeed: (state, action: PayloadAction<number>) => {
      state.scrollSpeed = action.payload;
    },

    incrementScrollStartDelay: (state) => {
      state.scrollStartDelay += 0.5;
    },

    decrementScrollStartDelay: (state) => {
      if (state.scrollStartDelay > 0) state.scrollStartDelay -= 0.5;
    },

    resetScrollStartDelay: (state) => {
      state.scrollStartDelay = initialState.scrollStartDelay;
    },

    setScrollDuration: (state, action: PayloadAction<number>) => {
      state.scrollDuration = action.payload;
    },

    setStopScrollOnTouchScroll: (state, action: PayloadAction<boolean>) => {
      state.stopScrollOnTouchScroll = action.payload;
    },
  },
});

export const {
  setScrollStatus,
  decrementScrollSpeed,
  incrementScrollSpeed,
  incrementScrollStartDelay,
  decrementScrollStartDelay,
  resetScrollSpeed,
  resetScrollStartDelay,
  setScrollSpeed,
  setScrollDuration,
  setStopScrollOnTouchScroll,
} = scrollSlice.actions;
export default scrollSlice.reducer;
