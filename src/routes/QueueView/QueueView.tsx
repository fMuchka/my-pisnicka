import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Button, Chip, Stack } from '@mui/material';
import { setSelectedSong } from '../../features/Songs/songsSlice';
import type { RefinedSong } from '../../utils/rawSongRefiner';
import { RoutesEnum } from '../routes';
import { useNavigate } from 'react-router';
import { PlaylistRemove } from '@mui/icons-material';
import {
  removeSongFromQueue,
  setCurrentSongIndex,
  setQueue,
} from '../../features/Queue/queueSlice';
import DraggableList from '../../components/DraggableList/DraggableList';

const QueueView = () => {
  const { queue } = useSelector((state: RootState) => state.queueReducer);
  const { selectedSong } = useSelector((state: RootState) => state.songReducer);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSongClick = (song: RefinedSong) => {
    navigate(RoutesEnum.SONG, { viewTransition: true });
    dispatch(setSelectedSong(song));
    dispatch(setCurrentSongIndex(queue.findIndex((s) => s.id === song.id)));
  };

  const removeFromQueue = (song: RefinedSong) => {
    dispatch(removeSongFromQueue(song));
  };

  if (queue.length === 0) {
    return <div style={{ marginTop: '5rem' }}>Žádná píseň ve frontě</div>;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <Stack spacing={2}>
        <DraggableList
          items={queue}
          setItems={(newQueue) => dispatch(setQueue(newQueue))}
          renderItem={(song) => (
            <>
              <Button
                sx={{ placeContent: 'space-between', textAlign: 'start' }}
                onClick={() => handleSongClick(song)}
                fullWidth
                variant={
                  song.id === selectedSong?.id ? 'contained' : 'outlined'
                }
              >
                {song.id}
              </Button>
              <Chip
                icon={<PlaylistRemove />}
                label="Fronta"
                color="error"
                variant="outlined"
                sx={{ borderRadius: 'var(--mui-shape-borderRadius)' }}
                onClick={() => removeFromQueue(song)}
              />
            </>
          )}
        />
      </Stack>
    </div>
  );
};

export default QueueView;
