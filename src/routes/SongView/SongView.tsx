import { ChordFormatter } from '../../components/ChordFormatter/ChordFormatter';
import LoadingSongScreen from './LoadingSongView/LoadingSongView';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Box, Fab, Modal } from '@mui/material';
import { Audiotrack, KeyboardArrowUp } from '@mui/icons-material';
import ScrollTop from '../../components/MUIAppBarUtils/ScrollTop/ScrollTop';
import SongPlayer from '../../components/SongPlayer/SongPlayer';
import ChordDetailsControl from '../../features/Controls/ChordDetailsControl/ChordDetailsControl';
import { useState } from 'react';

const SongView = () => {
  const { selectedSong, songs } = useSelector(
    (state: RootState) => state.songReducer
  );

  const { isScrolling } = useSelector(
    (state: RootState) => state.scrollReducer
  );

  const [modalOpen, setModalOpen] = useState(false);

  if (!songs) {
    return <LoadingSongScreen />;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {!isScrolling && (
        <Fab
          onClick={() => setModalOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '16px',
            zIndex: 1000,
          }}
          size="small"
          color="primary"
        >
          <Audiotrack />
        </Fab>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            margin: 'auto',
            marginTop: '75px',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            overflowX: 'auto',
            boxShadow: 24,
            maxHeight: 800,
            p: 4,
          }}
        >
          <ChordDetailsControl />
        </Box>
      </Modal>
      <SongPlayer />
      <ChordFormatter song={selectedSong} />

      <ScrollTop>
        <Fab
          size="small"
          aria-label="scroll back to top"
          id="back-to-top-button"
          color="primary"
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </div>
  );
};

export default SongView;
