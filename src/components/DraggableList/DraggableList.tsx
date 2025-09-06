import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay, // Import DragOverlay
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableItem from './SortableItem/SortableItem';
import styles from './DraggableList.module.css';
import { Stack } from '@mui/material';

// Define the type for an item so we can find it later
type Item = { id: string | number; [key: string]: unknown };

interface DraggableListProps<T extends Item> {
  items: T[];
  setItems: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  listClassName?: string;
  itemClassName?: string;
}

const DraggableList = <T extends Item>({
  items,
  setItems,
  renderItem,
}: DraggableListProps<T>) => {
  // State to hold the active item being dragged
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Add a small delay to distinguish clicks from drags on touch devices
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the item being dragged and set it as active
    const currentItem = items.find((item) => item.id === active.id);
    if (currentItem) {
      setActiveItem(currentItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }

    // Clear the active item
    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles['list']}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              className={styles['list-item']}
            >
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      {/* This is the portal where the dragged item will be rendered */}
      <DragOverlay>
        {activeItem ? (
          // We render a non-sortable version of the item here
          <Stack
            direction={'row'}
            width={'100%'}
            alignItems={'center'}
            spacing={2}
            className={`${styles['list-item']} ${styles['dragging-overlay']}`}
          >
            {renderItem(activeItem)}
          </Stack>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableList;
