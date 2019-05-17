import { readFileSync, existsSync, readdirSync, unlinkSync, statSync, rmdirSync } from 'fs'
import { join } from 'path'

import projectJson from '../../../examples/uidl-samples/project.json'
import { ProjectUIDL } from '@teleporthq/teleport-generator-shared/lib/typings/uidl'

import createPlaygroundPacker, { PackerFactoryParams } from '../src/index'

import reactBasicVariation from './react-basic-variation.json'
import reactNextVariation from './react-next-variation.json'
import vueBasicVariation from './vue-basic-variation.json'
import vueNuxtVariation from './vue-nuxt-variation.json'

const reactBasicProjectPath = join(__dirname, 'react-basic')
const reactNextProjectPath = join(__dirname, 'react-next')
const vueBasicProjectPath = join(__dirname, 'vue-basic')
const vueNuxtProjectPath = join(__dirname, 'vue-nuxt')

const assetFile = readFileSync(join(__dirname, 'asset.png'))
const base64File = new Buffer(assetFile).toString('base64')

const assetsData = {
  assets: [
    {
      data: base64File,
      name: 'asset',
      type: 'png',
    },
  ],
  meta: {
    prefix: [''],
  },
}

afterAll(() => {
  // Comment these lines if you want to see the generated projects
  removeDirectory(reactBasicProjectPath)
  removeDirectory(reactNextProjectPath)
  removeDirectory(vueBasicProjectPath)
  removeDirectory(vueNuxtProjectPath)
})

describe('project packer playground', () => {
  it('creates a new instance of the project packer playground', () => {
    const packer = createPlaygroundPacker(projectJson as ProjectUIDL)
    expect(packer.loadTemplate).toBeDefined()
    expect(packer.pack).toBeDefined()
  })

  it('should pack react basic project', async () => {
    const packer = createPlaygroundPacker(projectJson as ProjectUIDL)
    const factoryParams: PackerFactoryParams = JSON.parse(JSON.stringify(reactBasicVariation))

    factoryParams.assets = assetsData
    factoryParams.publisher.meta = { outputPath: reactBasicProjectPath }

    await packer.pack(factoryParams)
    expect(1).toBe(1)
  }, 30000)

  it('should pack react next project', async () => {
    const packer = createPlaygroundPacker(projectJson as ProjectUIDL)
    const factoryParams: PackerFactoryParams = JSON.parse(JSON.stringify(reactNextVariation))

    factoryParams.assets = assetsData
    factoryParams.publisher.meta = { outputPath: reactNextProjectPath }

    await packer.pack(factoryParams)
    expect(1).toBe(1)
  }, 30000)

  it('should pack vue basic project', async () => {
    const packer = createPlaygroundPacker(projectJson as ProjectUIDL)
    const factoryParams: PackerFactoryParams = JSON.parse(JSON.stringify(vueBasicVariation))

    factoryParams.assets = assetsData
    factoryParams.publisher.meta = { outputPath: vueBasicProjectPath }

    await packer.pack(factoryParams)
    expect(1).toBe(1)
  }, 30000)

  it('should pack vue nuxt project', async () => {
    const packer = createPlaygroundPacker(projectJson as ProjectUIDL)
    const factoryParams: PackerFactoryParams = JSON.parse(JSON.stringify(vueNuxtVariation))

    factoryParams.assets = assetsData
    factoryParams.publisher.meta = { outputPath: vueNuxtProjectPath }

    await packer.pack(factoryParams)
    expect(1).toBe(1)
  }, 30000)
})

const removeDirectory = (dirPath: string): void => {
  if (!existsSync(dirPath)) {
    return
  }

  const files = readdirSync(dirPath)

  for (const file of files) {
    const filePath = join(dirPath, file)
    statSync(filePath).isFile() ? unlinkSync(filePath) : removeDirectory(filePath)
  }

  rmdirSync(dirPath)
}
