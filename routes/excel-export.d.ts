declare module 'excel-export' {
  export function execute(config: config): void
  export interface config {
    cols: { caption: string; type: string }[]
    rows: any[]
  }
}
