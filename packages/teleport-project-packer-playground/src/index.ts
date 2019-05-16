import {
  AssetsDefinition,
  PublisherResponse,
  TemplateDefinition,
  GeneratedFolder,
} from '@teleporthq/teleport-generator-shared/lib/typings/generators'
import { ProjectUIDL, Mapping } from '@teleporthq/teleport-generator-shared/lib/typings/uidl'

import createTeleportPacker from '@teleporthq/teleport-project-packer'

import createReactGenerator from '@teleporthq/teleport-project-generator-react-basic'
import createReactNextGenerator from '@teleporthq/teleport-project-generator-react-next'
import createVueGenerator from '@teleporthq/teleport-project-generator-vue-basic'
import createVueNuxtGenerator from '@teleporthq/teleport-project-generator-vue-nuxt'

import createZipPublisher from '@teleporthq/teleport-publisher-zip'
import createDiskPublisher from '@teleporthq/teleport-publisher-disk'
import createNowPublisher from '@teleporthq/teleport-publisher-now'
import createNetlifyPublisher from '@teleporthq/teleport-publisher-netlify'

import projectJson from '../../../examples/uidl-samples/project.json'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  GITHUB_TEMPLATE_OWNER,
  REACT_BASIC_GITHUB_PROJECT,
  REACT_NEXT_GITHUB_PROJECT,
  VUE_GITHUB_PROJECT,
  VUE_NUXT_GITHUB_PROJECT,
} from './constants'

export interface PackerFactoryParams {
  technology?: TechnologyDefinition
  publisher?: PublisherDefinition
  template?: TemplateDefinition
  assets?: AssetsDefinition
}

export interface TechnologyDefinition {
  type: string
  meta?: {
    variation?: string
    customMapping?: Mapping
  }
}

export interface PublisherDefinition {
  type: string
  meta?: {
    outputPath?: string
    accessToken?: string
    projectName?: string
  }
}

const projectGenerators = {
  ReactBasic: createReactGenerator,
  ReactNext: createReactNextGenerator,
  Vue: createVueGenerator,
  VueNuxt: createVueNuxtGenerator,
}

const projectPublishers = {
  Disk: createDiskPublisher,
  Zip: createZipPublisher,
  Now: createNowPublisher,
  Netlify: createNetlifyPublisher,
}

const getGithubRemoteDefinition = (owner: string, repo: string) => {
  return { remote: { githubRepo: { owner, repo } } }
}

const projectTemplates = {
  ReactBasic: getGithubRemoteDefinition(GITHUB_TEMPLATE_OWNER, REACT_BASIC_GITHUB_PROJECT),
  ReactNext: getGithubRemoteDefinition(GITHUB_TEMPLATE_OWNER, REACT_NEXT_GITHUB_PROJECT),
  Vue: getGithubRemoteDefinition(GITHUB_TEMPLATE_OWNER, VUE_GITHUB_PROJECT),
  VueNuxt: getGithubRemoteDefinition(GITHUB_TEMPLATE_OWNER, VUE_NUXT_GITHUB_PROJECT),
}

const createPlaygroundPacker = (projectUIDL: ProjectUIDL, params?: PackerFactoryParams) => {
  const { assets, publisher, technology, template } = params

  const packer = createTeleportPacker(projectUIDL, { assets, template })

  const loadTemplate = async (templateToLoad?: TemplateDefinition): Promise<GeneratedFolder> => {
    return packer.loadTemplate(templateToLoad)
  }

  const pack = async (): Promise<PublisherResponse<any>> => {
    const generatorFactory = projectGenerators[technology.type] || createReactNextGenerator
    const projectGenerator = generatorFactory({ ...technology.meta })

    const publisherFactory = projectPublishers[publisher.type] || createZipPublisher
    const projectPublisher = publisherFactory({ ...publisher.meta })

    const projectTemplate = template || projectTemplates[technology.type]

    packer.setAssets(assets)
    packer.setGeneratorFunction(projectGenerator.generateProject)
    packer.setPublisher(projectPublisher)
    packer.setTemplate(projectTemplate)

    return packer.pack()
  }

  return {
    loadTemplate,
    pack,
  }
}

export default createPlaygroundPacker

/**
 * Testing
 */
const assetFile = readFileSync(join(__dirname, './test.png'))
const base64File = new Buffer(assetFile).toString('base64')

const assetsData = {
  assets: [
    {
      data: base64File,
      name: 'test',
      type: 'png',
    },
  ],
  meta: {
    prefix: ['test'],
  },
}

const packerVariations = [
  {
    technology: {
      type: 'ReactNext',
      meta: {
        variation: 'InlineStyles',
      },
    },
    publisher: {
      type: 'Disk',
      meta: {
        outputPath: '/home/ionut/packer-test',
        projectName: projectJson.name,
      },
    },
    assets: assetsData,
  },

  {
    technology: {
      type: 'ReactNext',
    },
    publisher: {
      type: 'Zip',
      meta: {
        outputPath: '/home/ionut/packer-test',
      },
    },
    template: {
      remote: {
        githubRepo: {
          owner: 'ionutpasca',
          repo: 'nextjs',
        },
      },
      meta: {
        componentsPath: ['components', 'generatedComponents'],
      },
    },
    assets: assetsData,
  },
]

const playgroundPacker = createPlaygroundPacker(projectJson as ProjectUIDL, packerVariations[1])

playgroundPacker.pack()