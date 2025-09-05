import { useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  useColorScheme,
} from '@mui/material';
import defaultTheme, {
  blueDarkTheme,
  blueLightTheme,
  greenDarkTheme,
  greenLightTheme,
  purpleDarkTheme,
  purpleLightTheme,
  redDarkTheme,
  redLightTheme,
  yellowDarkTheme,
  yellowLightTheme,
} from '../features/Controls/ThemeControl/theme/themes';
import {
  ColorScheme,
  PrimaryDarkThemeColor,
  PrimaryLightThemeColor,
} from '../features/Controls/ThemeControl/theme/enums';
import { CookieAcceptState, CookieKeys } from '../features/Cookies/enums';
import CookieDialog from '../features/Cookies/CookieDialog';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import {
  setColorScheme,
  setPrimaryColor,
} from '../features/Controls/ThemeControl/themeSlice';

import { setScrollSpeed } from '../features/Controls/ScrollControl/scrollSlice';
import {
  setChordPosition,
  setChordSize,
  setFontSize,
} from '../features/Controls/FontSizeControl/fontSizeSlice';
import { updateCookieAcceptState } from '../features/Cookies/cookieSlice';
import { HashRouter, Route } from 'react-router';
import SongView from '../routes/SongView/SongView';
import { Routes } from 'react-router';
import SongListView from '../routes/SongListView/SongListView';
import { loadSongs } from '../features/Songs/songsSlice';
import InfoView from '../routes/InfoView/InfoView';
import { useAutoScroll } from '../hooks/useAutoScroll';
import Navigation from '../components/BottomNavigation/BottomNavigation';
import { RoutesEnum } from '../routes/routes';
import QueueView from '../routes/QueueView/QueueView';

function App() {
  const { primaryColor, colorScheme } = useSelector(
    (state: RootState) => state.themeReducer
  );
  const { isScrolling, stopScrollOnTouchScroll } = useSelector(
    (state: RootState) => state.scrollReducer
  );
  const { songs } = useSelector((state: RootState) => state.songReducer);

  const dispatch = useDispatch();
  const { stopScroll } = useAutoScroll();

  const { setColorScheme: setColorSchemeMUI } = useColorScheme();

  useEffect(() => {
    let cookiesPresentCheck = false;
    const cookieColor = localStorage.getItem(CookieKeys.PRIMARY_COLOR);
    if (cookieColor) {
      dispatch(
        setPrimaryColor(
          cookieColor as PrimaryLightThemeColor | PrimaryDarkThemeColor
        )
      );
      cookiesPresentCheck = true;
    }
    const cookieScheme = localStorage.getItem(CookieKeys.COLOR_SCHEME);
    if (cookieScheme) {
      dispatch(setColorScheme(cookieScheme as ColorScheme));
      cookiesPresentCheck = true;
    }
    const cookieFontSize = localStorage.getItem(CookieKeys.FONT_SIZE);
    if (cookieFontSize) {
      dispatch(setFontSize(parseInt(cookieFontSize)));
      cookiesPresentCheck = true;
    }
    const cookieChordFontSize = localStorage.getItem(CookieKeys.CHORD_SIZE);
    if (cookieChordFontSize) {
      dispatch(setChordSize(parseInt(cookieChordFontSize)));
      cookiesPresentCheck = true;
    }
    const cookieChordPosition = localStorage.getItem(CookieKeys.CHORD_POSITION);
    if (cookieChordPosition) {
      dispatch(setChordPosition(cookieChordPosition as 'above' | 'inline'));
      cookiesPresentCheck = true;
    }
    const cookieScrollSpeed = localStorage.getItem(CookieKeys.SCROLL_SPEED);
    if (cookieScrollSpeed) {
      setScrollSpeed(parseInt(cookieScrollSpeed));
      cookiesPresentCheck = true;
    }
    if (cookiesPresentCheck) {
      dispatch(updateCookieAcceptState(CookieAcceptState.ACCEPTED));
    }
  }, [dispatch]);

  useEffect(() => {
    if (stopScrollOnTouchScroll === false) return;
    if (!isScrolling) return;

    const handleUserScroll = () => {
      // If scroll position changes by user, stop autoscroll
      stopScroll();
    };

    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });
    window.addEventListener('keydown', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
      window.removeEventListener('keydown', handleUserScroll);
    };
  }, [isScrolling, stopScroll, stopScrollOnTouchScroll]);

  useEffect(() => {
    if (!songs) {
      loadSongs(dispatch);
    }
  }, [songs]);

  // Dynamically create theme based on primaryColor state
  const theme = useMemo(() => {
    if (colorScheme == 'dark') {
      setColorSchemeMUI('dark');
      switch (primaryColor) {
        case PrimaryDarkThemeColor.BLUE:
          return blueDarkTheme;
        case PrimaryDarkThemeColor.GREEN:
          return greenDarkTheme;
        case PrimaryDarkThemeColor.RED:
          return redDarkTheme;
        case PrimaryDarkThemeColor.YELLOW:
          return yellowDarkTheme;
        case PrimaryDarkThemeColor.PURPLE:
          return purpleDarkTheme;

        default:
          dispatch(setPrimaryColor(PrimaryDarkThemeColor.GREEN));
          return defaultTheme;
      }
    } else {
      setColorSchemeMUI('light');
      switch (primaryColor) {
        case PrimaryLightThemeColor.BLUE:
          return blueLightTheme;
        case PrimaryLightThemeColor.GREEN:
          return greenLightTheme;
        case PrimaryLightThemeColor.RED:
          return redLightTheme;
        case PrimaryLightThemeColor.YELLOW:
          return yellowLightTheme;
        case PrimaryLightThemeColor.PURPLE:
          return purpleLightTheme;

        default:
          dispatch(setPrimaryColor(PrimaryLightThemeColor.GREEN));
          return greenLightTheme;
      }
    }
  }, [primaryColor, colorScheme, dispatch, setColorSchemeMUI]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Container maxWidth="md">
          <HashRouter>
            <Box sx={{ marginBottom: '5rem' }}>
              <Routes>
                <Route path={RoutesEnum.SONG_LIST} element={<SongListView />} />
                <Route path={RoutesEnum.SONG} element={<SongView />} />
                <Route path={RoutesEnum.INFO} element={<InfoView />} />
                <Route path={RoutesEnum.HOME} element={<InfoView />} />
                <Route path={RoutesEnum.SONG_QUEUE} element={<QueueView />} />
              </Routes>
            </Box>
            {!isScrolling && <Navigation />}
          </HashRouter>
        </Container>
        <CookieDialog />
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
