import http from 'node:http'
import { createTask, getTask, listTasks } from './tasks.js'

const PORT = 3000

export function startServer(): http.Server {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

    if (url.pathname === '/api/v1/tasks' && req.method === 'GET') {
      const ownerId = url.searchParams.get('ownerId')
      const data = listTasks(ownerId ?? undefined)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
      return
    }

    if (url.pathname === '/api/v1/tasks' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as { ownerId?: string; title?: string }
          if (!parsed.ownerId || !parsed.title) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'ownerId and title required' }))
            return
          }
          const task = createTask(parsed.ownerId, parsed.title)
          res.writeHead(201, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(task))
        } catch (err) {
          if (err instanceof Error && err.message === 'TITLE_NOT_UNIQUE') {
            res.writeHead(409, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'title not unique for owner' }))
            return
          }
          res.writeHead(500).end()
        }
      })
      return
    }

    const match = url.pathname.match(/^\/api\/v1\/tasks\/([^/]+)$/)
    if (match && req.method === 'GET') {
      const task = getTask(match[1])
      if (!task) {
        res.writeHead(404).end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(task))
      return
    }

    res.writeHead(404).end()
  })

  server.listen(PORT)
  return server
}

if (process.env.NODE_ENV !== 'test') {
  startServer()
  console.log(`Tasks API http://localhost:${PORT}`)
}
