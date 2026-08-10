export interface AnalyticsEvent {
  name: string
  props: Record<string, string>
  at: number
}
