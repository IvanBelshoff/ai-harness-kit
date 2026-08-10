import { describe, expect, it } from 'vitest'
import { createTask, listTasks } from '../src/tasks.js'

describe('Task', () => {
  it('creates Task entity', () => {
    const task = createTask('owner-1', 'Ship harness')
    expect(task.title).toBe('Ship harness')
    expect(task.ownerId).toBe('owner-1')
  })

  it('title unique per ownerId', () => {
    createTask('owner-1', 'Duplicate')
    expect(() => createTask('owner-1', 'Duplicate')).toThrow('TITLE_NOT_UNIQUE')
  })

  it('lists tasks for owner', () => {
    createTask('owner-2', 'A')
    expect(listTasks('owner-2').length).toBeGreaterThan(0)
  })
})
