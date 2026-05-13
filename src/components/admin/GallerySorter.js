"use client";

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Star, Maximize2 } from 'lucide-react';
import { getOptimizedImage } from '@/lib/cloudinary';

function SortableItem({ url, onRemove, onSetFeatured, isFeatured }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square bg-[#f0f0f1] border border-[#c3c4c7] overflow-hidden"
    >
      <img
        src={getOptimizedImage(url, 'thumbnail')}
        alt=""
        className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        loading="lazy"
      />
      
      {/* Controls Overlay */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onSetFeatured(url)}
          title="Set as featured"
          className={`p-1 rounded shadow-sm transition-colors ${isFeatured ? 'bg-[#2271b1] text-white' : 'bg-white text-[#646970] hover:bg-[#f0f0f1]'}`}
        >
          <Star className={`w-3 h-3 ${isFeatured ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(url)}
          title="Remove image"
          className="p-1 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {isFeatured && (
        <div className="absolute bottom-0 inset-x-0 bg-[#2271b1]/90 text-white text-[9px] font-bold uppercase py-0.5 text-center">
          Featured
        </div>
      )}
    </div>
  );
}

export default function GallerySorter({ images, onChange, featuredImage }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.indexOf(active.id);
      const newIndex = images.indexOf(over.id);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const removeImage = (url) => {
    onChange(images.filter(img => img !== url));
  };

  const setFeatured = (url) => {
    // If the caller wants a separate featuredImage field, handle it here or via onChange
    // For now, we'll assume the first image in the array is often used as featured,
    // but we can pass back a specific URL if needed.
    if (featuredImage !== undefined) {
      // Logic handled by parent
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url) => (
            <SortableItem
              key={url}
              url={url}
              onRemove={removeImage}
              onSetFeatured={setFeatured}
              isFeatured={url === featuredImage}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
