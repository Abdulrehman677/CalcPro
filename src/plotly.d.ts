
declare module 'plotly.js-basic-dist' {
  const Plotly: {
    react: (...args: any[]) => Promise<any>
    purge: (element: HTMLElement) => void
  }

  export default Plotly
}
