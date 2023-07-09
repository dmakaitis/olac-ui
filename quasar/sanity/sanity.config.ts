import {defineConfig, isDev} from 'sanity'
import {visionTool} from '@sanity/vision'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'
import {getStartedPlugin} from './plugins/sanity-plugin-tutorial'
import {documentInternationalization} from "@sanity/document-internationalization";
import {media} from "sanity-plugin-media";

const devOnlyPlugins = [getStartedPlugin()]

export default defineConfig({
  name: 'default',
  title: 'OLAC',

  projectId: '1p3vrwxv',
  dataset: 'production',

  plugins: [
    deskTool(),
    visionTool(),
    media(),
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'lt', title: 'Lithuanian'}
      ],
      schemaTypes: ['article']
    }),
    ...(isDev ? devOnlyPlugins : [])
  ],

  schema: {
    types: schemaTypes,
  },
})

