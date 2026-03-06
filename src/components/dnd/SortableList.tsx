import * as React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../lib/utils'

/**
 * Item with required id for sorting
 */
export interface SortableItem {
  id: UniqueIdentifier
  [key: string]: unknown
}

/**
 * Sort direction for the list
 */
export type SortDirection = 'vertical' | 'horizontal' | 'grid'

/**
 * Props for the SortableList component
 */
interface SortableListProps<T extends SortableItem> {
  items: T[]
  onReorder: (items: T[]) => void
  direction?: SortDirection
  renderItem: (item: T, index: number) => React.ReactNode
  renderOverlay?: (item: T) => React.ReactNode
  onDragStart?: (item: T) => void
  onDragEnd?: (item: T, oldIndex: number, newIndex: number) => void
  className?: string
  disabled?: boolean
}

/**
 * SortableList component using dnd-kit
 *
 * @example
 * <SortableList
 *   items={tasks}
 *   onReorder={setTasks}
 *   renderItem={(task) => <TaskCard task={task} />}
 * />
 */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  direction = 'vertical',
  renderItem,
  renderOverlay,
  onDragStart,
  onDragEnd,
  className,
  disabled = false,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeItem = React.useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items]
  )

  const strategy =
    direction === 'horizontal'
      ? horizontalListSortingStrategy
      : direction === 'grid'
        ? rectSortingStrategy
        : verticalListSortingStrategy

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
    const item = items.find((i) => i.id === event.active.id)
    if (item && onDragStart) {
      onDragStart(item)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)

      const item = items[oldIndex]
      if (item && onDragEnd) {
        onDragEnd(item, oldIndex, newIndex)
      }
    }
  }

  if (disabled) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        <div className={className}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem && renderOverlay
          ? renderOverlay(activeItem)
          : activeItem
            ? renderItem(activeItem, -1)
            : null}
      </DragOverlay>
    </DndContext>
  )
}

/**
 * Props for sortable item wrapper
 */
interface SortableItemWrapperProps {
  id: UniqueIdentifier
  children: React.ReactNode
  className?: string
  disabled?: boolean
  handle?: boolean
}

/**
 * Wrapper component to make children sortable
 *
 * @example
 * <SortableItemWrapper id={task.id}>
 *   <TaskCard task={task} />
 * </SortableItemWrapper>
 */
export function SortableItemWrapper({
  id,
  children,
  className,
  disabled = false,
  handle = false,
}: SortableItemWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
  }

  // If using handle mode, don't attach listeners to wrapper
  const dragProps = handle ? {} : { ...attributes, ...listeners }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'tw-z-50', className)}
      {...dragProps}
    >
      {children}
    </div>
  )
}

/**
 * Drag handle component for use with handle mode
 */
interface DragHandleProps {
  id: UniqueIdentifier
  className?: string
  children?: React.ReactNode
}

export function DragHandle({ id, className, children }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <button
      type="button"
      className={cn(
        'tw-cursor-grab tw-touch-none active:tw-cursor-grabbing',
        'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring',
        className
      )}
      {...attributes}
      {...listeners}
    >
      {children || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tw-h-4 tw-w-4"
        >
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      )}
    </button>
  )
}

// Re-export types
export type { UniqueIdentifier, DragEndEvent, DragStartEvent, DragOverEvent }
export { arrayMove }
