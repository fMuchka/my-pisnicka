import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Clear,
  ExpandMore,
  PlaylistAdd,
  PlaylistRemove,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import type { RefinedSong } from '../../utils/rawSongRefiner';
import {
  setSelectedSong,
  setTagFilters,
  setTextFilter,
  SongTags,
  toggleInclusionFilterType,
} from '../../features/Songs/songsSlice';

import { indigo, red, pink, green, amber, cyan } from '@mui/material/colors';
import { ColorScheme } from '../../features/Controls/ThemeControl/theme/enums';
import { useEffect, useState, type ChangeEvent } from 'react';
import { RoutesEnum } from '../routes';
import {
  addSongToQueue,
  removeSongFromQueue,
} from '../../features/Queue/queueSlice';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

const TAG_COLOR_MAP = (tag: SongTags, scheme: ColorScheme): string => {
  switch (tag) {
    case SongTags.CESKE:
      return scheme === ColorScheme.LIGHT ? indigo[900] : indigo[100];

    case SongTags.PLOUZAK:
      return scheme === ColorScheme.LIGHT ? red[900] : red[100];

    case SongTags.TABOROVA:
      return scheme === ColorScheme.LIGHT ? pink[900] : pink[100];

    case SongTags.POHADKY:
      return scheme === ColorScheme.LIGHT ? green[900] : green[100];

    case SongTags.MODERNI:
      return scheme === ColorScheme.LIGHT ? amber[900] : amber[100];
    case SongTags.LIDOVKA:
      return scheme === ColorScheme.LIGHT ? cyan[900] : cyan[100];
  }
};

const SongListView = () => {
  const {
    songs,
    tagFilters,
    textFilter,
    shouldIncludeAllFilters,
    selectedSong,
  } = useSelector((state: RootState) => state.songReducer);

  const { queue } = useSelector((state: RootState) => state.queueReducer);

  const { colorScheme } = useSelector((state: RootState) => state.themeReducer);
  const [displaySongs, setDisplaySongs] = useState<
    {
      author: string;
      songs: RefinedSong[];
    }[]
  >([]);

  const [nOfAvailableSongs, setNOfAvailableSongs] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSongClick = (song: RefinedSong) => {
    navigate(RoutesEnum.SONG, { viewTransition: true });
    dispatch(setSelectedSong(song));
  };

  const filterByTag = (tag: SongTags) => {
    if (tagFilters.includes(tag)) {
      const newTags = tagFilters.filter((e) => e !== tag);
      dispatch(setTagFilters(newTags));
    } else {
      dispatch(setTagFilters([...tagFilters, tag]));
    }
  };

  const filterByText = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(setTextFilter(e.target.value));
  };

  const songNameSorter = (a: RefinedSong, b: RefinedSong) => {
    // sort by song number, rest is sorted alphabetically on load
    const songA = parseInt(a.id.split(')')[0]);
    const songB = parseInt(b.id.split(')')[0]);
    if (songA < songB) {
      return -1;
    }
    if (songA > songB) {
      return 1;
    }

    // names must be equal
    return 0;
  };
  const sortCzechStrings = <T extends string>(arr: T[]): T[] => {
    const arrCopy = [...arr];
    return arrCopy.sort((a, b) =>
      a.localeCompare(b, 'cs', { sensitivity: 'base' })
    );
  };

  const addToQueue = (song: RefinedSong) => {
    dispatch(addSongToQueue(song));
  };

  const removeFromQueue = (song: RefinedSong) => {
    dispatch(removeSongFromQueue(song));
  };

  const getSongsByTag = (tag: SongTags): RefinedSong[] => {
    return songs?.filter((s) => s.tags.includes(tag)) ?? [];
  };

  const handleItemExpand = (
    _event: React.SyntheticEvent | null,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  useEffect(() => {
    if (songs != null) {
      let songsFilteredByText: RefinedSong[] = songs;

      if (textFilter !== '') {
        songsFilteredByText = songsFilteredByText.filter((e) =>
          e.id.toUpperCase().includes(textFilter.toUpperCase())
        );
      }

      if (tagFilters.length > 0) {
        const filtered: RefinedSong[] = [];
        songsFilteredByText?.forEach((s) => {
          const matchesAtLeastOneFilter = s.tags.some((t) =>
            tagFilters.includes(t as SongTags)
          );
          if (shouldIncludeAllFilters) {
            const matchesAllFilters = tagFilters.every((tF) =>
              s.tags.includes(tF)
            );

            if (tagFilters.length === 1 && matchesAtLeastOneFilter) {
              filtered.push(s);
            }

            if (tagFilters.length > 1 && matchesAllFilters) {
              filtered.push(s);
            }
          } else {
            if (matchesAtLeastOneFilter) {
              filtered.push(s);
            }
          }
        });

        filtered.sort((a, b) => songNameSorter(a, b));

        const groupedByAuthor: {
          [key: string]: { songs: RefinedSong[]; author: string };
        } = {};
        filtered.forEach((song) => {
          if (!groupedByAuthor[song.author]) {
            groupedByAuthor[song.author] = {
              songs: [],
              author: song.author,
            };
          }
          groupedByAuthor[song.author].songs.push(song);
        });

        setExpandedItems(filtered.map((_, idx) => idx.toString()));
        setNOfAvailableSongs(filtered.length);
        setDisplaySongs(Object.values(groupedByAuthor));
      } else {
        const groupedByAuthor: {
          [key: string]: { songs: RefinedSong[]; author: string };
        } = {};
        songsFilteredByText.forEach((song) => {
          if (!groupedByAuthor[song.author]) {
            groupedByAuthor[song.author] = {
              songs: [],
              author: song.author,
            };
          }
          groupedByAuthor[song.author].songs.push(song);
        });

        if (textFilter !== '') {
          setExpandedItems(songsFilteredByText.map((_, idx) => idx.toString()));
        } else {
          setExpandedItems([]);
        }
        setNOfAvailableSongs(songsFilteredByText.length);
        setDisplaySongs(Object.values(groupedByAuthor) ?? []);
      }
    }
  }, [tagFilters, songs, shouldIncludeAllFilters, textFilter]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Badge
            badgeContent={
              tagFilters.length > 0
                ? nOfAvailableSongs > 0
                  ? nOfAvailableSongs
                  : ':-('
                : 0
            }
            color="primary"
          >
            <Typography variant="body1" color="text.secondary">
              Filtr podle typu
            </Typography>
          </Badge>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={5} direction={'row'}>
            <Stack spacing={2} direction={'column'} width={'100%'}>
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                sx={{ display: 'flex', flexDirection: 'column' }}
                aria-labelledby="tag filter type"
                value={shouldIncludeAllFilters}
                onChange={(_e, val) => {
                  if (val == null) return;
                  dispatch(toggleInclusionFilterType());
                }}
              >
                <ToggleButton value={true} aria-label="should include all tags">
                  Obsahuje všechny vybrané
                </ToggleButton>
                <ToggleButton
                  value={false}
                  aria-label="should include at least one"
                >
                  Obsahuje alespoň jednu vybranou
                </ToggleButton>
              </ToggleButtonGroup>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}
              >
                {sortCzechStrings(Object.values(SongTags)).map((t, tIdx) => (
                  <Badge
                    badgeContent={getSongsByTag(t as SongTags).length}
                    sx={{ width: '100%' }}
                    key={tIdx}
                  >
                    <Chip
                      size="small"
                      variant={tagFilters.includes(t) ? 'filled' : 'outlined'}
                      sx={{
                        color: TAG_COLOR_MAP(t as SongTags, colorScheme),
                        margin: '0.5em',
                        width: '100%',
                      }}
                      onClick={() => filterByTag(t)}
                      label={t}
                    />
                  </Badge>
                ))}
              </div>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ margin: '0.5rem 0 1rem 0' }}></Divider>

      <Stack spacing={2} marginBottom={5}>
        <Stack direction={'row'} width={'100%'}>
          <TextField
            size="small"
            placeholder="Hledej píseň"
            aria-label={'hledej píseň'}
            onChange={(e) => filterByText(e)}
            value={textFilter}
            fullWidth
          />

          <Button onClick={() => dispatch(setTextFilter(''))}>
            <Clear />
          </Button>
        </Stack>

        {displaySongs == null || displaySongs.length === 0 ? (
          <Box sx={{ width: '100%' }}>
            <Typography>Načítám písně...</Typography>
            <br />
            <LinearProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <SimpleTreeView
              expandedItems={expandedItems}
              onExpandedItemsChange={handleItemExpand}
              selectedItems={''}
            >
              {displaySongs?.map((group, idx) => (
                <TreeItem
                  itemId={idx.toString()}
                  key={idx}
                  label={group.author}
                >
                  {group.songs.map((song, idx) => (
                    <TreeItem
                      itemId={`${idx}-${song.id}`}
                      key={`${idx}-${song.id}`}
                      label={
                        <Stack spacing={1} key={idx}>
                          <Stack direction={'row'} alignItems={'center'}>
                            <Button
                              sx={{
                                placeContent: 'space-between',
                                textAlign: 'start',
                                width: '75%',
                                marginRight: '1em',
                              }}
                              key={idx}
                              onClick={() => handleSongClick(song)}
                              variant={
                                song.id === selectedSong?.id
                                  ? 'contained'
                                  : 'outlined'
                              }
                            >
                              {song.title}
                            </Button>
                            {queue.includes(song) ? (
                              <Chip
                                icon={<PlaylistRemove />}
                                label="Fronta"
                                variant="outlined"
                                color="error"
                                sx={{
                                  borderRadius: 'var(--mui-shape-borderRadius)',
                                }}
                                onClick={() => removeFromQueue(song)}
                              />
                            ) : (
                              <Chip
                                icon={<PlaylistAdd />}
                                label="Fronta"
                                variant="filled"
                                sx={{
                                  borderRadius: 'var(--mui-shape-borderRadius)',
                                }}
                                onClick={() => addToQueue(song)}
                              />
                            )}
                          </Stack>
                        </Stack>
                      }
                    ></TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default SongListView;
