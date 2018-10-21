import * as differ from 'deep-object-diff'
import * as unstated from 'unstated'

import colors from './colors'

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log(`You're currently using the unstated logger, disable this for production`)
}

class Logger {
  collapsed: boolean
  detailed: boolean
  private containers: any
  logger: any
  colors: Object
  actions: string[]
  ignore: string[]
  private __counter: Number
  private __reduxDevInstances: any

  constructor() {
    this.colors = colors
    this.collapsed = false
    this.detailed = true
    this.containers = {}
    this.logger = console
    this.ignore = ['JUMP_TO_STATE', 'JUMP_TO_ACTION']
    this.actions = ['added', 'updated', 'deleted']
    this.__counter = 1
  }

  store() {
    const store: any = {}

    for (const [key, value] of Object.entries(this.containers)) {
      store[key] = (value as any).container.state
    }

    return store
  }

  print() {
    for (const [key, value] of Object.entries(this.containers)) {
      console.log(`%c ${key}\n`, 'font-weight:bold', (value as any).container.state)
    }
  }

  private stateWasChanged(state: Object) {
    return Object.keys(state).length > 0
  }

  private render(kind: string, value: Object) {
    const colors = this.colors as any

    const color = colors[kind].color
    const text = colors[kind].text
    const style = `color: ${color}; font-weight: bold`

    console.log(`%c → ${text}`, style, value)
  }

  start() {
    const enable = typeof window !== undefined && process.env.NODE_ENV !== 'production'

    if (enable) {
      ;(unstated as any).__SUPER_SECRET_CONTAINER_DEBUG_HOOK__((container: any) => {
        let prevState = container.state

        container.subscribe(() => {
          const { state } = container
          const name = container.name || container.constructor.name
          const action = state.__action

          if (!this.containers[name]) {
            this.connect(
              name,
              container
            )
          }

          this.logToConsole(this.containers[name], prevState, state)

          this.emitStateChangesToReduxDevTools(this.containers[name], state)

          prevState = state
        })
      })
    }
  }

  private connect(widget: string, container: any): void {
    let instance: any
    const name = widget || 'Unstated ' + this.__counter

    container.name = name

    this.containers[name] = {
      container,
      instance
    }

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ) {
      instance = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({ name })
      instance.init()

      this.containers[name].instance = instance

      this.subscribeToReduxDevToolsEvents(this.containers[name])
    }
  }

  private logToConsole(container: any, prevState: any, state: any) {
    const nextState = Object.assign({}, state)
    const name = container.container.name

    const colors = this.colors as any
    const jump = container.container.__jump
    const diff = (differ as any).detailedDiff(prevState, state)
    const group = this.collapsed ? console.groupCollapsed : console.group
    const titleStyle = ['color: gray; font-weight: lighter;']

    const info = this.getInfoForReduxDevTools(name, state) + (jump ? ' → ' + jump : '')

    group(`%c ${info}`, titleStyle)

    const stylesPrevState = `color: ${colors.prevState.color}; font-weight: bold`

    const oldState = Object.assign({}, prevState)

    delete oldState.__action

    console.log('%c PREV STATE:', stylesPrevState, oldState)

    if (this.detailed) {
      for (const i in this.actions) {
        const kind = this.actions[i]
        const value = Object.assign({}, diff[kind])

        delete value.__action

        if (this.stateWasChanged(value)) {
          this.render(kind, value)
        }
      }
    }

    delete nextState.__action

    container.container.__jump = ''

    const stylesNextState = `color: ${colors.nextState.color}; font-weight: bold`

    console.log('%c NEXT STATE:', stylesNextState, nextState)

    console.groupEnd()
  }

  private subscribeToReduxDevToolsEvents(container: any): void {
    container.instance.subscribe((message: any) => {
      switch (message.payload && message.payload.type) {
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
          const newState = JSON.parse(message.state)
          const action = {
            __action: message.payload.type
          }

          container.container.__jump = newState.__action

          const state = Object.assign({}, newState, action)

          container.container.setState(state)
      }
    })
  }

  private getInfoForReduxDevTools(name: string, nextState: any): string {
    let info = '...'

    if (typeof nextState === 'object') {
      info = '' + nextState.__action
      info = name + ' - ' + info

      delete nextState.__jump
    }

    return info
  }

  private emitStateChangesToReduxDevTools(container: any, state: any): void {
    if (container.instance) {
      const name = container.container.name
      const action = '' + state.__action
      const ignored = this.ignore.indexOf(action) !== -1

      if (!ignored) {
        const info = this.getInfoForReduxDevTools(name, state)

        container.instance.send(info, state)
      }
    }
  }
}

export default Logger
