import * as differ from 'deep-object-diff'
import * as unstated from 'unstated'

import colors from './colors'

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log(`You're currently using the unstated logger, disable this for production`)
}

class Logger {
  collapsed: boolean
  detailed: boolean
  containers: Object
  logger: any
  colors: Object
  actions: string[]

  constructor() {
    this.colors = colors
    this.collapsed = false
    this.detailed = true
    this.containers = {}
    this.logger = console
    this.actions = ['added', 'updated', 'deleted']
  }

  getSstore() {
    const store: any = {}

    for (const [key, value] of Object.entries(this.containers)) {
      store[key] = (value as any).state
    }

    return store
  }

  print() {
    for (const [key, value] of Object.entries(this.containers)) {
      console.log(`%c ${key}\n`, 'font-weight:bold', (value as any).state)
    }
  }

  stateWasChanged(state: Object) {
    return Object.keys(state).length > 0
  }

  render(kind: string, value: Object) {
    const colors: any = this.colors as any

    const color = colors[kind].color
    const text = colors[kind].text
    const style = `color: ${color}; font-weight: bold`

    console.log(`%c → ${text}`, style, value)
  }

  start() {
    const colors: any = this.colors as any
    const enable = typeof window !== undefined && process.env.NODE_ENV !== 'production'
    console.log(typeof window !== undefined, process.env)

    if (enable) {
      ;(unstated as any).__SUPER_SECRET_CONTAINER_DEBUG_HOOK__((container: any) => {
        const name = container.name || container.constructor.name

        ;(this.containers as any)[name] = container

        let prevState = container.state

        container.subscribe(() => {
          const { state } = container
          const diff: any = (differ as any).detailedDiff(prevState, state)

          const group: any = this.collapsed ? console.groupCollapsed : console.group
          const style = ['color: gray; font-weight: lighter;']

          const action = state.__action
          const info =
            (container.name || container.constructor.name) + (action ? ' - ' + action : '')

          group(`%c ${info}`, style)

          const stylesPrevState = `color: ${colors.prevState}; font-weight: bold`

          console.log('%c PREV STATE:', stylesPrevState, prevState)

          if (this.detailed) {
            for (const i in this.actions) {
              const kind = this.actions[i]
              const value = diff[kind]

              delete value.__action

              if (this.stateWasChanged(value)) {
                this.render(kind, value)
              }
            }
          }
          debugger
          const stylesNextState = `color: ${colors.nextState}; font-weight: bold`

          console.log('%c NEXT STATE:', stylesNextState, state)

          console.groupEnd()

          prevState = state
        })
      })
    }
  }
}

export default Logger
