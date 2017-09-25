/**
 * Test the Explore HOC
 */

import {shallow} from 'enzyme'
import * as React from 'react'

import {explore} from 'explore'

// A simple component used to check if the props are being passed correctly
function BasicComponent<Props extends { [s: string]: any}>(props: Props): JSX.Element {
  let out: string
  try {
    out = JSON.stringify(props)
  } catch (e) {
    out = ''
  }

  return (
    <div>{out}</div>
  )
}

describe('explore()', () => {
  describe('constructor', () => {
    it('forwards nothing for {}', () => {
      const ExploredComponent = explore({})(BasicComponent)

      expect(shallow(<ExploredComponent/>)).toMatchSnapshot()
    })

    it('forwards basic props', () => {
      type ExampleComponentProps = {passes: boolean}

      const ExploredComponent = explore<ExampleComponentProps, {}>({})(BasicComponent)
      const wrapper = shallow(<ExploredComponent passes={true} />)

      expect(wrapper).toMatchSnapshot()
    })

    it('maps basic props', () => {
      type ExampleComponentProps = {
        passes: boolean,
      }
      type ExploredProps = {
        didThisPass: string,
      }

      const ExploredComponent = explore<ExampleComponentProps, ExploredProps>({
        didThisPass: (props) => props.passes ? 'yes' : 'no',
      })(BasicComponent)

      expect(shallow(<ExploredComponent passes={true} />)).toMatchSnapshot()
    })

    it('maps successful async props', async () => {
      type ExploredProps = {
        kind: string,
      }

      const promise = Promise.resolve('I\'m a promise!')
      const ExploredComponent = explore<{}, ExploredProps>({
        kind: async () => promise,
      })(BasicComponent)
      const wrapper = shallow(<ExploredComponent />)

      await promise
      wrapper.update()
      expect(wrapper).toMatchSnapshot()
    })

    it('maps undefined from errored async props', async () => {
      type ExploredProps = {
        kind: string,
      }

      const promise = Promise.reject('I\'m a failed promise!')
      const ExploredComponent = explore<{}, ExploredProps>({
        kind: async () => promise,
      })(BasicComponent)
      const wrapper = shallow(<ExploredComponent />)

      try {
        await promise
      } catch (e) {
        // ignore
      } finally {
        wrapper.update()
        expect(wrapper).toMatchSnapshot()
      }
    })

    it('maps as a decorator', () => {
      type ExampleComponentProps = {passes: boolean}
      type ExploredProps = {didThisPass?: string}

      /**
       * Example basic decorator class
       */
      @explore<ExampleComponentProps, ExploredProps>({
        didThisPass: (props) => props.passes ? 'yes' : 'no',
      })
      class ExampleComponent extends React.PureComponent<ExampleComponentProps & ExploredProps> {
        public render() {
          const {didThisPass} = this.props

          return <div>Did this pass? {didThisPass}. {didThisPass} it did.</div>
        }
      }

      expect(shallow(<ExampleComponent passes={true} />)).toMatchSnapshot()
    })
  })

  describe('componentWillReceiveProps', () => {
    it('forwards basic props', () => {
      type ExampleComponentProps = {passes: boolean}

      const ExploredComponent = explore<ExampleComponentProps, {}>({})(BasicComponent)
      const wrapper = shallow(<ExploredComponent passes={true} />)
      wrapper.setProps({foo: 'bar'})

      expect(wrapper).toMatchSnapshot()
    })

    it('maps basic props', () => {
      type ExampleComponentProps = {passes:  boolean}
      type ExploredProps = {
        didThisPass:  string,
      }

      const ExploredComponent = explore<ExampleComponentProps,  ExploredProps>({
        didThisPass:  (props) => props.passes ? 'yes' : 'no',
      })(BasicComponent)
      const wrapper = shallow(<ExploredComponent passes={false} />)
      wrapper.setProps({passes:  true})

      expect(wrapper).toMatchSnapshot()
    })

    it('maps async props', async () => {
      type ExploredProps = {
        kind:  string,
      }

      let promise: Promise<string>

      const ExploredComponent = explore<{ foo: boolean }, ExploredProps>({
        kind: async (props) => {
          promise = new Promise((resolve, reject) => {
            if (props.foo) {
              resolve('bar')
            } else {
              resolve('nobar')
            }
          })

          return promise
        },
      })(BasicComponent)
      const wrapper = shallow(<ExploredComponent foo={false}/>)

      await promise
      expect(wrapper).toMatchSnapshot()

      wrapper.setProps({foo:  true})
      await promise
      wrapper.update()
      expect(wrapper).toMatchSnapshot()
    })

    it('maps undefined from errored async props', async () => {
      type ExploredProps = {
        kind:  string,
      }

      const promise = Promise.reject('I\'m a failed promise!')
      const ExploredComponent = explore<{[s:  string]: any }, ExploredProps>({
        kind: async () => promise,
      })(BasicComponent)
      const wrapper = shallow(<ExploredComponent />)

      try {
        await promise
      } catch (e) {
        // ignore
      } finally {
        wrapper.update()
        wrapper.setProps({foo:  true})
        expect(wrapper).toMatchSnapshot()
      }
    })
  })

  // NOTE (JMD): Began work adding a way to handle errors for async props, but put on hold.
  // describe('render with errors', () => {
  //   it('maintains the context', () => {
  //     let storedThis: ExampleComponent
  //
  //     /**
  //      * Example basic decorator class
  //      */
  //     @explore<{}, {}>({})
  //     class ExampleComponent extends React.PureComponent<{}> {
  //       constructor(props: {}) {
  //         super(props)
  //         storedThis = this
  //       }
  //
  //       public render() {
  //         expect(this).toEqual(storedThis)
  //
  //         return <div/>
  //       }
  //     }
  //
  //     expect(shallow(<ExampleComponent/>)).toMatchSnapshot()
  //   })
  //
  //   it('passes props and errors to wrapped render', () => {
  //     type ExampleComponentProps = {passes: boolean}
  //     type ExploredProps = {didThisPass?: string}
  //
  //     /**
  //      * Example basic decorator class
  //      */
  //     @explore<ExampleComponentProps, ExploredProps>({
  //       didThisPass: (props) => props.passes ? 'yes' : 'no',
  //     })
  //     class ExampleComponent extends React.PureComponent<ExampleComponentProps & ExploredProps> {
  //       public render(args?: {props: ExampleComponentProps & ExploredProps}) {
  //         // expect(args).toMatchSnapshot()
  //         if (args !== undefined) {
  //           const {didThisPass} = args.props
  //
  //           return <div>Did this pass? {didThisPass}. {didThisPass} it did.</div>
  //         }
  //
  //         return <div/>
  //       }
  //     }
  //
  //     expect(shallow(<ExampleComponent passes={true}/>)).toMatchSnapshot()
  //   })
  //
  //   it('passes props and errors to wrapped SFC', () => {
  //     type ExampleComponentProps = {passes: boolean}
  //     type ExploredProps = {didThisPass?: string}
  //     type Args = {props?: ExampleComponentProps & ExploredProps & {children?: React.ReactNode}}
  //
  //     const ExampleComponent: React.SFC<ExampleComponentProps & ExploredProps> = (args?: Args) => {
  //       console.log(args)
  //       if (args !== undefined) {
  //         const {didThisPass} = args.props
  //
  //         return <div>Did this pass? {didThisPass}. {didThisPass} it did.</div>
  //       }
  //
  //       return <div/>
  //     }
  //
  //     /**
  //      * Example basic decorator class
  //      */
  //     const WrappedComponent = explore<ExampleComponentProps, ExploredProps>({
  //       didThisPass: (props) => props.passes ? 'yes' : 'no',
  //     })(ExampleComponent)
  //
  //     expect(shallow(<ExampleComponent passes={true}/>)).toMatchSnapshot()
  //   })
  // })
})
