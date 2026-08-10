import type { AnalyticsEvent } from './types'

const buffer: AnalyticsEvent[] = []

export function track(name: string, props?: Record<string, string>) {
  buffer.push({ name, props: props ?? {}, at: Date.now() })
}

export function getEvents(): AnalyticsEvent[] {
  return [...buffer]
}
