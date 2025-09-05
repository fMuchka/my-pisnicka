import { FormatSize, Palette } from '@mui/icons-material';
import { Modal, Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import ThemeToggle from '../ThemeControl/ThemeControl';
import FontSizeToggle from '../FontSizeControl/FontSizeControl';
import type { TabPanelProps, ControlModalProps } from './types';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ControlModal = (props: ControlModalProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Modal
        open={props.open}
        onClose={() => props.setOpen(false)}
        aria-labelledby="modal-settings"
      >
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
          <Tabs value={value} onChange={handleChange} centered>
            <Tab icon={<Palette />} label="BARVY" />
            <Tab icon={<FormatSize />} label="TEXT" />
          </Tabs>
          <TabPanel value={value} index={0}>
            <ThemeToggle />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <FontSizeToggle />
          </TabPanel>
        </Box>
      </Modal>
    </>
  );
};

export default ControlModal;
