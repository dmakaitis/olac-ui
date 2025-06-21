import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'
import {documentInternationalization} from "@sanity/document-internationalization";
import {media} from "sanity-plugin-media";

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
    })
  ],

  schema: {
    types: schemaTypes,
  },
})

