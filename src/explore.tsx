/**
 * The core of the package. Explore.
 */

import * as React from 'react'

export type TransformFn<Props, ExploreProps, Key extends keyof ExploreProps> =
  (nextProps?: Props, props?: Props | {}, value?: ExploreProps[Key]) => ExploreProps[Key] | Promise<ExploreProps[Key]>

export type ExploreConfig<Props, ExploreProps> = {
  [Key in keyof ExploreProps]: TransformFn<Props, ExploreProps, Key>;
}

type ExploreState<ExploreProps> = {
  [Key in keyof ExploreProps]?: ExploreProps[Key]
}

/**
 * A higher order component that brings your props on a trip.
 */
export function explore<
  Props extends { [s: string]: any },
  ExploreProps extends { [s: string]: any }
>(transform: ExploreConfig<Props, ExploreProps>) {

  return (WrappedComponent: React.StatelessComponent<Props> | React.ComponentClass<Props>) => {
    type State = ExploreState<ExploreProps>

    return class Explorer extends React.PureComponent<Props, State> {
      public static displayName = `Explored(${WrappedComponent.displayName})`

      constructor(props: Props) {
        super(props)
        const initialState: ExploreProps = Object.keys(transform).reduce(
          (sumState: State, key: string) => {
            const value = transform[key](props, {}, undefined)

            if (value instanceof Promise) {
              this.resolvePromiseToKey(value, key)

            } else {
              sumState[key] = value
            }

            return sumState
          },
          {},
        ) as ExploreProps
        this.state = initialState

        // NOTE( JMD): Need to somehow handle errors from async calls
        // const errors = {}
        // NOTE (JMD): Spread on Generics is bugged https://github.com/Microsoft/TypeScript/issues/10727
        // tslint:disable-next-line prefer-object-spread
        // const fullProps: Props & State = Object.assign({}, this.props, this.state, errors)

        // if (WrappedComponent instanceof React.PureComponent || WrappedComponent instanceof React.Component) {
        //   const errors = {}
        //   WrappedComponent.render = WrappedComponent.render.bind(WrappedComponent, fullProps, errors)
        // }
      }

      public componentWillReceiveProps(nextProps: Readonly<Props>): void {
        Object.keys(transform).forEach(async (key: string) => {
          const value = transform[key](nextProps, this.props, this.state[key])

          if (value instanceof Promise) {
            this.resolvePromiseToKey(value, key)

          } else {
            this.setState({[key]: value})
          }
        })
      }

      public render(): JSX.Element {
        // NOTE (JMD): Spread on Generics is bugged https://github.com/Microsoft/TypeScript/issues/10727
        // tslint:disable-next-line prefer-object-spread
        const fullProps: Props & State = Object.assign({}, this.props, this.state)

        return (
          <WrappedComponent {...fullProps}/>
        )
      }

      // tslint:disable-next-line
      // TODO (JMD): Make private. Figure out https://github.com/Microsoft/TypeScript/issues/17293
      public resolvePromiseToKey<T>(promise: Promise<T>, key: string) {
        promise
          .then((data) => {
            this.setState({
              [key]: data,
            })
          })
          .catch(() => {
            this.setState({
              [key]: undefined, // Async value got rejected. Set to undefined.
            })
          })
      }
    }
  }
}
