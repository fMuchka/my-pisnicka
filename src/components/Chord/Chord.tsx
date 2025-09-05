import type { ChordProps } from './types';
import styles from './Chord.module.css';
import { Box, Button, Divider, Modal, Stack, Typography } from '@mui/material';
import {
  Notes,
  HSystem,
  Instruments,
} from '../../features/Controls/ChordDetailsControl/enums';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
// @ts-expect-error TODO: Fix types import
import TomChord from '@tombatossals/react-chords/lib/Chord';
import guitarChords from '@tombatossals/chords-db/lib/guitar.json';
import ukuleleChords from '@tombatossals/chords-db/lib/ukulele.json';
import type { RootState } from '../../app/store';
import { useSelector } from 'react-redux';

const Chord = (props: ChordProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [diagramChord, setDiagramChord] = useState<string>('');

  const handleClickRichDisplay = (chord: string) => {
    setOpenModal(true);
    setDiagramChord(chord);
  };

  const plainDisplay = (chord: string) => (
    <span className={styles.chord}>{chord}</span>
  );

  const richDisplay = (chord: string) => (
    <span
      className={`${styles.chord} ${styles.richDisplay}`}
      onClick={() => handleClickRichDisplay(chord)}
    >
      {chord}
    </span>
  );
  return (
    <>
      {openModal && (
        <ChordDiagram chord={diagramChord} setOpenModal={setOpenModal} />
      )}

      {props.useRichDisplay
        ? richDisplay(props.chord)
        : plainDisplay(props.chord)}
    </>
  );
};

type ChordDiagramProps = {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  chord: string;
};

const ChordDiagram = (props: ChordDiagramProps) => {
  const { hSystem, instrument } = useSelector(
    (state: RootState) => state.chordDetailsReducer
  );

  try {
    const chordsMappingToTomChord = {
      [Notes.C]: 'C',
      [Notes.C_SHARP]: 'Csharp',
      [Notes.D]: 'D',
      [Notes.D_SHARP]: 'Eb',
      [Notes.E]: 'E',
      [Notes.F]: 'F',
      [Notes.F_SHARP]: 'Fsharp',
      [Notes.G]: 'G',
      [Notes.G_SHARP]: 'Ab',
      [Notes.A]: 'A',
      [Notes.A_SHARP]: 'Bb',
      [hSystem === HSystem.WORLD ? Notes.B : Notes.A_SHARP]: 'B',
      H: 'B',
    };

    const match = props.chord.match(/^([A-H][b#]?)(.*)$/);

    // @ts-expect-error TODO fix types
    const [, root, suffix] = match;

    const isMajor = suffix === '';
    const isMinor = suffix === 'm' || suffix === 'mi';

    const index = isMajor
      ? 0
      : isMinor
        ? 1
        : // @ts-expect-error TODO: fix types
          guitarChords.chords[chordsMappingToTomChord[root]].findIndex(
            // @ts-expect-error TODO: fix types
            (e) => e.suffix === suffix
          );

    const chordsDetails =
      instrument === Instruments.GUITAR ? guitarChords : ukuleleChords;

    const positions =
      // @ts-expect-error TODO: fix types
      chordsDetails.chords[chordsMappingToTomChord[root]][index].positions;

    const ukulele = {
      strings: 4,
      fretsOnChord: 4,
      name: 'Ukulele',
      keys: [],
      tunings: {
        standard: [Notes.G, Notes.C, Notes.E, Notes.A],
      },
    };

    const guitar = {
      strings: 6,
      fretsOnChord: 4,
      name: 'Guitar',
      keys: [],
      tunings: {
        standard: [
          Notes.E,
          Notes.A,
          Notes.D,
          Notes.G,
          [hSystem === HSystem.CZECH ? 'H' : Notes.B],
          Notes.E,
        ],
      },
    };

    const instrumentConfig =
      instrument === Instruments.GUITAR ? guitar : ukulele;

    const lite = false; // defaults to false if omitted

    return (
      <>
        <Modal
          open={true}
          onClose={() => props.setOpenModal(false)}
          aria-labelledby="chord Diagram"
          aria-describedby="svg displays of chord shapes"
        >
          <Box className={styles['chordDiagramModal']}>
            <Button
              variant="outlined"
              sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
              }}
              onClick={() => props.setOpenModal(false)}
            >
              <CloseIcon></CloseIcon>
            </Button>
            <Stack className={styles['chordDiagramWrapper']}>
              <Typography variant="h4" color="primary">
                {props.chord}
              </Typography>
              {positions.map((chord: unknown, index: number) => (
                <div key={index}>
                  <TomChord
                    chord={chord}
                    instrument={instrumentConfig}
                    lite={lite}
                  />
                  <Divider />
                </div>
              ))}
            </Stack>
          </Box>
        </Modal>
      </>
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return <></>;
  }
};

export default Chord;
