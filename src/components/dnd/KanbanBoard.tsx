import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../lib/utils'

/**
 * Kanban item type
 */
export interface KanbanItem {
  id: UniqueIdentifier
  columnId: UniqueIdentifier
  [key: string]: unknown
}

/**
 * Kanban column type
 */
export interface KanbanColumn {
  id: UniqueIdentifier
  title: string
}

/**
 * Props for KanbanBoard component
 */
interface KanbanBoardProps<T extends KanbanItem> {
  columns: KanbanColumn[]
  items: T[]
  onItemMove: (
    itemId: UniqueIdentifier,
    sourceColumnId: UniqueIdentifier,
    targetColumnId: UniqueIdentifier,
    newIndex: number
  ) => void
  onReorder: (items: T[]) => void
  renderItem: (item: T) => React.ReactNode
  renderColumnHeader?: (column: KanbanColumn, itemCount: number) => React.ReactNode
  renderOverlay?: (item: T) => React.ReactNode
  columnClassName?: string
  itemClassName?: string
  className?: string
}

/**
 * KanbanBoard component with drag-and-drop between columns
 */
export function KanbanBoard<T extends KanbanItem>({
  columns,
  items,
  onItemMove,
  onReorder,
  renderItem,
  renderColumnHeader,
  renderOverlay,
  columnClassName,
  itemClassName,
  className,
}: KanbanBoardProps<T>) {
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

  const getColumnItems = React.useCallback(
    (columnId: UniqueIdentifier) =>
      items.filter((item) => item.columnId === columnId),
    [items]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeItem = items.find((item) => item.id === active.id)
    if (!activeItem) return

    // Check if we're hovering over a column
    const overColumn = columns.find((col) => col.id === over.id)
    if (overColumn && activeItem.columnId !== overColumn.id) {
      // Move to empty column or end of column
      const columnItems = getColumnItems(overColumn.id)
      onItemMove(active.id, activeItem.columnId, overColumn.id, columnItems.length)
      return
    }

    // Check if we're hovering over an item
    const overItem = items.find((item) => item.id === over.id)
    if (overItem && activeItem.columnId !== overItem.columnId) {
      // Move to different column at specific position
      const columnItems = getColumnItems(overItem.columnId)
      const overIndex = columnItems.findIndex((item) => item.id === over.id)
      onItemMove(active.id, activeItem.columnId, overItem.columnId, overIndex)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItem = items.find((item) => item.id === active.id)
    const overItem = items.find((item) => item.id === over.id)

    if (!activeItem) return

    // If dropping on same column, handle reorder
    if (overItem && activeItem.columnId === overItem.columnId) {
      const columnItems = getColumnItems(activeItem.columnId)
      const oldIndex = columnItems.findIndex((item) => item.id === active.id)
      const newIndex = columnItems.findIndex((item) => item.id === over.id)

      if (oldIndex !== newIndex) {
        const newColumnItems = arrayMove(columnItems, oldIndex, newIndex)

        // Update the full items array with new order
        const otherItems = items.filter(
          (item) => item.columnId !== activeItem.columnId
        )
        onReorder([...otherItems, ...newColumnItems])
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'tw-flex tw-gap-4 tw-overflow-x-auto tw-pb-4',
          className
        )}
      >
        {columns.map((column) => {
          const columnItems = getColumnItems(column.id)
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              items={columnItems}
              renderItem={renderItem}
              renderColumnHeader={renderColumnHeader}
              columnClassName={columnClassName}
              itemClassName={itemClassName}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="tw-opacity-80 tw-shadow-lg tw-rotate-3">
            {renderOverlay ? renderOverlay(activeItem) : renderItem(activeItem)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

/**
 * KanbanColumn component
 */
interface KanbanColumnProps<T extends KanbanItem> {
  column: KanbanColumn
  items: T[]
  renderItem: (item: T) => React.ReactNode
  renderColumnHeader?: (column: KanbanColumn, itemCount: number) => React.ReactNode
  columnClassName?: string
  itemClassName?: string
}

function KanbanColumn<T extends KanbanItem>({
  column,
  items,
  renderItem,
  renderColumnHeader,
  columnClassName,
  itemClassName,
}: KanbanColumnProps<T>) {
  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'tw-flex tw-flex-col tw-min-w-[280px] tw-max-w-[320px] tw-bg-muted/30 tw-rounded-lg',
        isOver && 'tw-ring-2 tw-ring-primary tw-ring-offset-2',
        columnClassName
      )}
    >
      {/* Column Header */}
      <div className="tw-p-3 tw-border-b tw-border-[var(--border)]">
        {renderColumnHeader ? (
          renderColumnHeader(column, items.length)
        ) : (
          <div className="tw-flex tw-items-center tw-justify-between">
            <h3 className="tw-font-semibold tw-text-sm">{column.title}</h3>
            <span className="tw-text-xs tw-text-muted-foreground tw-bg-muted tw-px-2 tw-py-0.5 tw-rounded-full">
              {items.length}
            </span>
          </div>
        )}
      </div>

      {/* Column Items */}
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="tw-flex-1 tw-p-2 tw-space-y-2 tw-min-h-[100px] tw-overflow-y-auto">
          {items.map((item) => (
            <KanbanItem
              key={item.id}
              item={item}
              renderItem={renderItem}
              className={itemClassName}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

/**
 * KanbanItem component
 */
interface KanbanItemProps<T extends KanbanItem> {
  item: T
  renderItem: (item: T) => React.ReactNode
  className?: string
}

function KanbanItem<T extends KanbanItem>({
  item,
  renderItem,
  className,
}: KanbanItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: 'item', item },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'tw-cursor-grab active:tw-cursor-grabbing',
        isDragging && 'tw-opacity-50',
        className
      )}
      {...attributes}
      {...listeners}
    >
      {renderItem(item)}
    </div>
  )
}

// Re-export useful types
export type { UniqueIdentifier }
