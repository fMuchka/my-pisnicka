// src/components/SortableItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '@mui/icons-material';
import { Stack } from '@mui/material';

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  className?: string;
}

const SortableItem = ({ id, children, className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // This is key
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide the original item when it's being dragged
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Stack
      direction={'row'}
      width={'100%'}
      alignItems={'center'}
      spacing={2}
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={className}
    >
      <DragHandle {...listeners} />
      {children}
    </Stack>
  );
};

export default SortableItem;
