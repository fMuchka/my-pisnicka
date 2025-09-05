import {
  Pause,
  PlayArrow,
  Remove,
  Add,
  SkipPrevious,
  SkipNext,
  Done,
} from '@mui/icons-material';
import {
  Stack,
  Button,
  Typography,
  ButtonGroup,
  CardContent,
  Paper,
} from '@mui/material';
import {
  decrementScrollSpeed,
  incrementScrollSpeed,
  decrementScrollStartDelay,
  incrementScrollStartDelay,
  setScrollDuration,
} from '../../features/Controls/ScrollControl/scrollSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useGSAP } from '@gsap/react';
import { useState, useRef, useEffect } from 'react';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
import { gsap } from 'gsap';
import type { RootState } from '../../app/store';

import styles from './SongPlayer.module.css';
import { setSelectedSong } from '../../features/Songs/songsSlice';
import {
  removeSongFromQueue,
  setCurrentSongIndex,
} from '../../features/Queue/queueSlice';

gsap.registerPlugin(DrawSVGPlugin);

export const SongPlayer = () => {
  const { scrollSpeed, scrollStartDelay, isScrolling, scrollDuration } =
    useSelector((state: RootState) => state.scrollReducer);

  const { queue, currentSongIndex } = useSelector(
    (state: RootState) => state.queueReducer
  );

  const { selectedSong } = useSelector((state: RootState) => state.songReducer);

  const { chordPosition } = useSelector(
    (state: RootState) => state.fontSizeReducer
  );

  const [scrollStartClicked, setScrollStartClicked] = useState<boolean>(false);

  const dispatch = useDispatch();
  const { stopScroll, startScroll } = useAutoScroll();

  const circleRef = useRef<SVGCircleElement>(null);
  useGSAP(
    () => {
      gsap.set(circleRef.current, { drawSVG: '0%' });
    },
    { dependencies: [circleRef.current, isScrolling] }
  );

  useEffect(() => {
    const numberOfLines = selectedSong?.numberOfLines ?? 0;
    const numberOfSections = selectedSong?.text.length ?? 0;

    const chordPositionMultiplier = chordPosition === 'above' ? 1 : 0.5;

    const duration =
      (numberOfLines * 100 * chordPositionMultiplier) / (10 * scrollSpeed) +
      (numberOfSections * 50) / (10 * scrollSpeed);

    dispatch(setScrollDuration(duration));
  }, [
    dispatch,
    scrollSpeed,
    selectedSong?.numberOfLines,
    selectedSong?.text.length,
    chordPosition,
  ]);

  const handleBackClick = () => {
    if (queue.length > 0) {
      const prevSongIndex = currentSongIndex - 1;

      if (prevSongIndex > -1) {
        dispatch(setSelectedSong(queue[prevSongIndex]));
        dispatch(setCurrentSongIndex(prevSongIndex));
      }
    }
  };

  const handleForwardClick = () => {
    if (!currentSongIsInQueue()) {
      dispatch(setSelectedSong(queue[0]));
      dispatch(setCurrentSongIndex(0));
    } else {
      if (queue.length > 0) {
        const nextSongIndex = currentSongIndex + 1;

        if (nextSongIndex < queue.length) {
          dispatch(setSelectedSong(queue[nextSongIndex]));
          dispatch(setCurrentSongIndex(nextSongIndex));
        }
      }
    }
  };

  const currentSongIsInQueue = () =>
    queue.find((e) => e.id === selectedSong?.id) != null;

  const handleScrollStart = () => {
    if (isScrolling) {
      stopScroll();
      setScrollStartClicked(false);
    } else {
      setScrollStartClicked(true);
      gsap.to(circleRef.current, {
        drawSVG: '100%',
        ease: 'linear',
        duration: scrollStartDelay,
        onComplete: () => {
          startScroll();
          setScrollStartClicked(false);
        },
      });
    }
  };

  const songTitleClick = () => {
    const nextSongIndex = currentSongIndex + 1;

    if (!currentSongIsInQueue()) return false;
    if (queue.length > 0 && selectedSong) {
      dispatch(removeSongFromQueue(selectedSong));

      if (nextSongIndex < queue.length) {
        dispatch(setSelectedSong(queue[nextSongIndex]));
      }
    }
  };

  const convertDurationToTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time % 60);

    return `${minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
  };

  return (
    <Paper elevation={1} sx={{ width: '100%', mb: 2 }}>
      <CardContent>
        <Stack direction={'column'}>
          <Paper elevation={0} sx={{ p: 1 }}>
            <Typography gutterBottom variant="h5">
              {selectedSong?.title}
            </Typography>
            <Typography gutterBottom variant="subtitle1">
              {selectedSong?.author}
            </Typography>

            {queue.length > 0 && (
              <Button
                size="small"
                variant={'text'}
                endIcon={queue.length > 0 && currentSongIsInQueue() && <Done />}
                onClick={() => songTitleClick()}
              >
                Odebrat z fronty a jít dál
              </Button>
            )}
          </Paper>

          <Paper elevation={2} sx={{ width: '100%', p: 1 }}>
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2} alignItems="center">
                <div>
                  <Button
                    onClick={() => handleScrollStart()}
                    className={styles.scrollStartButton}
                    size="large"
                    color="primary"
                    variant={scrollStartClicked ? 'text' : 'contained'}
                  >
                    {isScrolling ? <Pause /> : <PlayArrow />}
                  </Button>
                  <svg
                    stroke="red"
                    id="circle-border"
                    height={50}
                    width={50}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      ref={circleRef}
                      strokeWidth={3}
                      cx="25"
                      cy="25"
                      r="22"
                    />
                  </svg>
                </div>

                <Stack
                  direction={'row'}
                  spacing={2}
                  alignItems="center"
                  justifyContent={'flex-end'}
                  width={'100%'}
                >
                  <Button
                    disabled={currentSongIndex === 0}
                    size="small"
                    sx={{
                      justifyContent: 'end',
                      gridArea: 'other',
                      fontSize: '10px',
                    }}
                    startIcon={<SkipPrevious />}
                    onClick={() => handleBackClick()}
                  >
                    Fronta
                  </Button>

                  <Button
                    disabled={
                      currentSongIndex === queue.length - 1 ||
                      queue.length === 0
                    }
                    size="small"
                    sx={{
                      justifyContent: 'end',
                      gridArea: 'other',
                      fontSize: '10px',
                    }}
                    endIcon={<SkipNext />}
                    onClick={() => handleForwardClick()}
                  >
                    Fronta
                  </Button>
                </Stack>
              </Stack>
              <Stack
                direction={'row'}
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
                spacing={2}
              >
                <Typography variant="h6">
                  Doba posunu: {convertDurationToTime(scrollDuration)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zpoždění posunu: {scrollStartDelay}s
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction={'row'}
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '0.5rem 1rem',
              }}
              spacing={2}
            >
              <Stack spacing={1}>
                <ButtonGroup size="small">
                  <Button
                    disabled={scrollSpeed === 6}
                    onClick={() => dispatch(incrementScrollSpeed())}
                  >
                    <Remove />
                  </Button>

                  <Button
                    disabled={scrollSpeed === 0.25}
                    onClick={() => dispatch(decrementScrollSpeed())}
                  >
                    <Add />
                  </Button>
                </ButtonGroup>
              </Stack>
              <Stack spacing={1}>
                <ButtonGroup size="small">
                  <Button onClick={() => dispatch(decrementScrollStartDelay())}>
                    <Remove />
                  </Button>
                  <Button onClick={() => dispatch(incrementScrollStartDelay())}>
                    <Add />
                  </Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </CardContent>
    </Paper>
  );
};

export default SongPlayer;
