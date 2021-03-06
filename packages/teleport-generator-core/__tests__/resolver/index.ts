import { Resolver } from '../../src/'
// @ts-ignore
import mappingJSON from './mapping.json'
import { Mapping } from '@teleporthq/teleport-generator-shared/lib/typings/uidl'

import {
  element,
  component,
  definition,
  staticNode,
  dynamicNode,
  elementNode,
  conditionalNode,
} from '@teleporthq/teleport-generator-shared/lib/builders/uidl-builders'

const mapping = mappingJSON as Mapping

describe('resolveElement', () => {
  const uidlElement = element('text', {
    dummy: staticNode('remains here'),
  })

  it('returns a mapped content node', () => {
    const resolver = new Resolver()
    resolver.addMapping(mapping)
    const resolvedElement = resolver.resolveElement(uidlElement)
    expect(resolvedElement.elementType).toBe('span')
    expect(resolvedElement.attrs.dummy.content).toBe('remains here')
  })

  it('returns a mapped content node with a custom mapping', () => {
    const resolver = new Resolver()
    const resolvedElement = resolver.resolveElement(uidlElement, { mapping })
    expect(resolvedElement.elementType).toBe('span')
    expect(resolvedElement.attrs.dummy.content).toBe('remains here')
  })
})

describe('resolveUIDL', () => {
  const uidl = component(
    'Conditional Component',
    elementNode('container', {}, [
      conditionalNode(
        dynamicNode('state', 'isVisible'),
        elementNode('div', {}, [staticNode('Now you see me!')]),
        true
      ),
    ]),
    {},
    { isVisible: definition('boolean', true), isShareable: definition('boolean', false) }
  )

  const extraMapping = {
    elements: {
      container: {
        elementType: 'div',
      },
    },
  }

  const resolver = new Resolver()
  resolver.addMapping(mapping)
  const resolvedUIDL = resolver.resolveUIDL(uidl, { mapping: extraMapping })
  expect(resolvedUIDL.name).toBe('ConditionalComponent')
  expect(resolvedUIDL.node.type).toBe('element')
  expect(resolvedUIDL.stateDefinitions.isVisible.type).toBe('boolean')
})
