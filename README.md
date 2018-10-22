## Unstated logger

Debug your [unstated](https://github.com/jamiebuilds/unstated) containers easily with `Unstated logger` who adds support for redux dev tools. The integration with the `redux dev tools` plugin makes jumping from different state in time possible (time travel).

<br>
<img src="assets/screenshot.png" width="1145">
<br>

## Install

```bash
npm install @xaamin/unstated-logger

# or

yarn install @xaamin/unstated-logger
```

## Usage

In the root of your app, import **Unstated logger**:

```js
import Logger from '@xaamin/unstated-logger';

Logger.start();

// ... Yor component code as always
```


## Integration with redux dev tools

Install the browser plugin available in [redux dev tools](http://extension.remotedev.io/), follow the instructions and you are ready to go. This plugin makes jumping from different state in time possible (time travel).

Once the plugin is installed we need to communicate actions to it, the changes you need to do are in the `Container` classes. You must give an instance name and notify actions using the same payload for state changes.

In the example bellow we assign the **`Counter`** name for the redux dev tools widget and notify about `INCREMENT` and `DECREMENT` actions, using the reserved keyword `\_\_action, so we can track this in the redux dev tools panel using the web browser.

```js
// @flow
import { Container } from 'unstated';

type CounterState = {
  count: number
};

class CounterContainer extends Container<CounterState> {
  state = {
    count: 0
  };

  // Widget name to show in the redux devl tools panel
  name = 'Counter';

  increment() {
    this.setState({
      count: this.state.count + 1,
      __action: 'INCREMENT'
    });
  }

  decrement() {
    this.setState({
      count: this.state.count - 1,
      __action: 'DECREMENT'
    });
  }
}
```

## API

When logger started, it exposes some methods and config options so you can use in DevTools to explore the containers or their state.

```js
// Get all the states in the store
const store = Logger.store();
// Do something with the store

// Get all containers
const containers = Logger.containers();
// Do something with the containers

// Output all the states
Logger.print();
```

The logger accepts the following config options:

- `colors`: Color object Object for logging
- `collapsed`: Boolean, defaults to false
- `detailed`: Boolean, defaults to true
- `logger`: Custom logger, defaults to `console`
- `ignore`: Events to be ignored for redux dev tools notifications
- `actions`: Logger state changes