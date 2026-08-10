export interface Task {
  id: string
  ownerId: string
  title: string
  archived: boolean
}

const tasks: Task[] = []

export function listTasks(ownerId?: string): Task[] {
  return tasks.filter((t) => !t.archived && (!ownerId || t.ownerId === ownerId))
}

export function createTask(ownerId: string, title: string): Task {
  const duplicate = tasks.find(
    (t) => t.ownerId === ownerId && t.title === title && !t.archived
  )
  if (duplicate) {
    throw new Error('TITLE_NOT_UNIQUE')
  }
  const task: Task = {
    id: String(tasks.length + 1),
    ownerId,
    title,
    archived: false
  }
  tasks.push(task)
  return task
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id && !t.archived)
}
