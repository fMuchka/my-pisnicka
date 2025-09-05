import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import { useEffect, type MouseEvent } from 'react';
import { ChordVisibility, HSystem, Instruments, Notes } from './enums';
import { useDispatch, useSelector } from 'react-redux';
import { currentSongTransposition, type RootState } from '../../../app/store';
import {
  setTransposition,
  setHSystem,
  setChordVisibility,
  setCurrentChords,
  setInstrument,
} from './chordDetailsSlice';
import Chord from '../../../components/Chord/Chord';
import styles from './ChordDetailsControl.module.css';
import {
  getToneCountDifference,
  transposeChord,
} from '../../../utils/transposeChord';
import useTranspositionMarks from '../../../hooks/useTranspositionMarks';

const ChordDetailsToggle = () => {
  const { hSystem, chordVisibility, currentChords, firstChord, instrument } =
    useSelector((state: RootState) => state.chordDetailsReducer);

  const { selectedSong } = useSelector((state: RootState) => state.songReducer);

  const currentTransposition = useSelector(currentSongTransposition);

  const dispatch = useDispatch();

  const transpositionMarks = useTranspositionMarks();

  const handleResetTransposition = () => {
    dispatch(
      setTransposition([
        selectedSong?.id as string,
        selectedSong?.firstChord as Notes,
      ])
    );
  };

  const handleChordVisibilityChange = (
    _event: MouseEvent<HTMLElement, globalThis.MouseEvent>,
    newState: ChordVisibility
  ) => {
    if (newState == null) return;
    dispatch(setChordVisibility(newState));

    document.documentElement.style.setProperty(
      '--chordVisibility',
      `${newState}`
    );
  };

  const handleHSystemChange = (
    _event: MouseEvent<HTMLElement, globalThis.MouseEvent>,
    newState: HSystem
  ) => {
    if (newState == null) return;
    dispatch(setHSystem(newState));
  };

  const handleTranspositionChange = (
    _e: unknown,
    newFirstChord: Notes | null
  ) => {
    if (newFirstChord !== null) {
      dispatch(
        setTransposition([selectedSong?.id as string, newFirstChord as Notes])
      );
    }
  };

  const handleInstrumentChange = (_e: unknown, instrument: Instruments) => {
    if (instrument !== null) {
      dispatch(setInstrument(instrument));
    }
  };

  const updateCurrentChords = () => {
    const transposedChords: typeof currentChords = [];

    currentChords.forEach((e) => {
      const tChord = transposeChord(
        e.root + e.suffix,
        hSystem,
        getToneCountDifference(
          firstChord.root as Notes,
          currentTransposition,
          hSystem
        )
      );
      transposedChords.push({ suffix: tChord.suffix, root: tChord.root });
    });

    dispatch(setCurrentChords(transposedChords));
  };

  useEffect(() => {
    updateCurrentChords();
  }, [hSystem, currentTransposition]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        borderRadius: 1,
        minHeight: '56px',
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignSelf: 'center',
            flexDirection: 'column',
            paddingBottom: '1rem',
            width: '100%',
          }}
        >
          <Button
            style={{ marginBottom: '1rem', width: '80px' }}
            variant="outlined"
            onClick={() => handleResetTransposition()}
            disabled={
              firstChord == null
                ? true
                : selectedSong?.firstChord ===
                  firstChord.root + firstChord.suffix
            }
          >
            Reset
          </Button>
          <ToggleButtonGroup
            color="primary"
            value={firstChord == null ? '' : firstChord.root}
            disabled={firstChord == null}
            exclusive
            onChange={handleTranspositionChange}
            sx={{ gridTemplateColumns: 'repeat(6, 1fr)', display: 'grid' }}
          >
            {transpositionMarks.map((e) => (
              <ToggleButton value={e.value}>{e.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Akordy v písni
        </Typography>
        <Stack
          className={styles.chordPreview}
          sx={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid' }}
        >
          {currentChords.map((chord, idx) => (
            <Chord
              chord={chord.root + chord.suffix}
              key={idx}
              useRichDisplay={true}
            />
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={chordVisibility}
            color="primary"
            onChange={(e, value) =>
              handleChordVisibilityChange(e, value as ChordVisibility)
            }
          >
            <ToggleButton value={ChordVisibility.HIDDEN}>
              <VisibilityOff />
            </ToggleButton>
            <ToggleButton value={ChordVisibility.UNSET}>
              <Visibility />
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={hSystem}
            color="primary"
            onChange={(e, value) => handleHSystemChange(e, value as HSystem)}
          >
            <ToggleButton value={HSystem.WORLD}>Anglické B</ToggleButton>
            <ToggleButton value={HSystem.CZECH}>České H</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={instrument}
          color="primary"
          onChange={(e, value) =>
            handleInstrumentChange(e, value as Instruments)
          }
        >
          <ToggleButton value={Instruments.GUITAR}>Kytara</ToggleButton>
          <ToggleButton value={Instruments.UKULELE}>Ukulele</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
};

export default ChordDetailsToggle;
