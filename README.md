Props Expedition
================

<aside class="warning">
  This project is NOT actively supported. Feel free to take concepts and apply them to your own. But this is untested and unfinished, and due to lack of time, will remain so.
</aside>

-----------

> A guide on your journey through React component properties. Handle asynchronous calls and property transforms without boilerplate.

[![Build Status](https://travis-ci.com/jdolle/props-expedition.svg?token=bKaa5YFrd5hatqpSxpPA&branch=master)](https://travis-ci.com/jdolle/props-expedition)

## Installation

~`npm install props-expedition`~

## Features

- **Simple** — React is all about rendering components. To render you need to know `what is the data?` and `how should it be displayed?`. PropsExpedition tells you what is the data, so that you can tell React (+ JSX) how it should be displayed.

- **Reusable** — PropsExpedition increasing reusability of components by mapping implementation specific data to generic, visual data. I.e. a stateless component may have a field `title`. This component may be used to display a `user` as well a `favorite_game`. By utilizing PropsExpedition, instead of pulling out the title like `<Example title={user.name} body={user.bio}/>` and `<Example title={favorite_game.displayName} body={favorite_game.description}/>`, these components can be wrapped to make them more readable. Through wrapping this becomes `<UserExample user={user}/>` and `<GameExample game={favorite_game}/>`. Internally the user and game would have their properties mapped to title and body. This is more declarative, more concise, and less error prone.

- **TypeScript Support** - TypeScript definitions are included in the package.

## Usage

Rather than comparing props manually, it is recommended to use [lodash-decorators](https://github.com/steelsojka/lodash-decorators)'s `@memoize` decorator. This will increase readability and reduce the amount of boilerplate further.

```js
@explore({
  // basic usage
  name: ({first, last}) => `${first} ${last}`,


  // basic async example without memoize
  children: async (nextProps, props, value) => {
    if (nextProps.childrenIds !== props.childrenIds) {
      return fetchChildren(nextProps.childrenIds)
    }
    return value
  },


  // memoized version
  @memoize((nextProps) => nextProps.id) // takes in a resolver that determines the key
  myself: async (nextProps) => fetchByName(nextProps.id),


  // multi argument memoized
  @memoize((nextProps) => [nextProps.first, nextProps.last])
  nameMemo: ({first, last}) => `${first} ${last}`,


  // Load only once -- on initialize
  @memoize()
  user: async () => fetchUser()
})
class Example extends React.PureComponent {
  render() {
    const {children, name} = this.props
    return (
      <div>
        <h1>{name}</h1>
        <ul>
          {children ? children.map(c => <li>{c}</li>) : false}
        </ul>
      </div>
    )
  }
}
```

## API

#### `explore(config)(component)` *function*
  - arguments
    - **config** *object* `{[key: string]: (nextProps, props, value) => nextValue}` An object containing transform functions that return the new value of the property. The property name is the key.
  - return
    - **Explorer** *function* Higher Order Component

## TypeScript Types

#### `ExploreConfig<Props, ExploreProps>` *object*
  - generics
    - **Props** *object* The props being mapped from
    - **ExploreProps** *object* The props being mapped to
  - value
    - **[Key in keyof ExploreProps]**
      - value
        - **TransformFn** *function* See below

#### `TransformFn<Props, ExploreProps, Key>` *function*
  - generics
    - **Props** *object* The props being mapped from
    - **ExploreProps** *object* The props being mapped to
    - **Key** *extends keyof ExploreProps* The key in ExploreProps that is being transformed.
  - value
    - *function*
      - arguments
        - **nextProps** *undefined | Props*
        - **props** *undefined | Props | {}*
        - **value** *undefined | ExploreProps[Key]*
      - return
        - **nextValue** *ExploreProps[Key] | Promise<ExploreProps[Key]*

## Similar Packages

There are numerous packages around mapping props mapping props and async loading, but none quite like this one.

PropsExpedition unifies the concepts of mapping props and loading async data. In both cases, the desired effect is that data is transformed and can be conveniently used, so it is only natural to handle both cases in an identical manner.

Additionally, each transform function is passed the `nextProps`, current `props`, and current `value` of the transform so that it may make an educated decision as to whether to perform the transform again or not. Other packages may only pass the props to the transform -- limiting the usefulness of the packages.

#### Related

##### Prop Mapping
- https://github.com/jayphelps/react-map-props
- https://www.npmjs.com/package/map-props

##### Async Props
- https://github.com/ericclemmons/react-resolver
- https://github.com/ryanflorence/async-props

## Contributions

We are excited to see your work! To contribute see [Contributing](./.github/CONTRIBUTING.md)

## License

PropsExpedition is [MIT licensed](./LICENSE.md) @ Jeff Dolle, 2017
