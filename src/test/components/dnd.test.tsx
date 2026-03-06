import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SortableList, SortableItemWrapper } from '../../components/dnd/SortableList'
import { KanbanBoard, type KanbanColumn, type KanbanItem } from '../../components/dnd/KanbanBoard'

describe('SortableList', () => {
  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]

  it('renders all items', () => {
    const onReorder = vi.fn()

    render(
      <SortableList
        items={mockItems}
        onReorder={onReorder}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
      />
    )

    expect(screen.getByTestId('item-1')).toHaveTextContent('Item 1')
    expect(screen.getByTestId('item-2')).toHaveTextContent('Item 2')
    expect(screen.getByTestId('item-3')).toHaveTextContent('Item 3')
  })

  it('renders in disabled mode without drag handlers', () => {
    const onReorder = vi.fn()

    render(
      <SortableList
        items={mockItems}
        onReorder={onReorder}
        disabled
        renderItem={(item) => <div>{item.name}</div>}
      />
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const onReorder = vi.fn()

    const { container } = render(
      <SortableList
        items={mockItems}
        onReorder={onReorder}
        className="custom-list"
        renderItem={(item) => <div>{item.name}</div>}
      />
    )

    expect(container.querySelector('.custom-list')).toBeInTheDocument()
  })
})

describe('SortableItemWrapper', () => {
  it('renders children', () => {
    render(
      <SortableItemWrapper id="test-item">
        <div data-testid="child">Child content</div>
      </SortableItemWrapper>
    )

    expect(screen.getByTestId('child')).toHaveTextContent('Child content')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SortableItemWrapper id="test-item" className="custom-item">
        <div>Content</div>
      </SortableItemWrapper>
    )

    expect(container.firstChild).toHaveClass('custom-item')
  })
})

describe('KanbanBoard', () => {
  const columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  const items: KanbanItem[] = [
    { id: '1', columnId: 'todo', title: 'Task 1' },
    { id: '2', columnId: 'todo', title: 'Task 2' },
    { id: '3', columnId: 'in-progress', title: 'Task 3' },
    { id: '4', columnId: 'done', title: 'Task 4' },
  ]

  it('renders all columns', () => {
    render(
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={vi.fn()}
        onReorder={vi.fn()}
        renderItem={(item) => <div data-testid={`task-${item.id}`}>{item.title as string}</div>}
      />
    )

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders items in correct columns', () => {
    render(
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={vi.fn()}
        onReorder={vi.fn()}
        renderItem={(item) => <div data-testid={`task-${item.id}`}>{item.title as string}</div>}
      />
    )

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
    expect(screen.getByText('Task 4')).toBeInTheDocument()
  })

  it('shows item counts in column headers', () => {
    render(
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={vi.fn()}
        onReorder={vi.fn()}
        renderItem={(item) => <div>{item.title as string}</div>}
      />
    )

    // Default header shows count - To Do has 2 items
    expect(screen.getByText('2')).toBeInTheDocument()
    // In Progress and Done each have 1 item (multiple elements with text "1")
    expect(screen.getAllByText('1')).toHaveLength(2)
  })

  it('renders custom column headers', () => {
    render(
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={vi.fn()}
        onReorder={vi.fn()}
        renderItem={(item) => <div>{item.title as string}</div>}
        renderColumnHeader={(column, count) => (
          <div data-testid={`header-${column.id}`}>
            {column.title} ({count} items)
          </div>
        )}
      />
    )

    expect(screen.getByTestId('header-todo')).toHaveTextContent('To Do (2 items)')
    expect(screen.getByTestId('header-in-progress')).toHaveTextContent('In Progress (1 items)')
  })

  it('applies custom className', () => {
    const { container } = render(
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={vi.fn()}
        onReorder={vi.fn()}
        renderItem={(item) => <div>{item.title as string}</div>}
        className="custom-board"
      />
    )

    expect(container.querySelector('.custom-board')).toBeInTheDocument()
  })
})
