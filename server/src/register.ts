import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../admin/src/pluginId';

export const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'multi-select',
    plugin: PLUGIN_ID,
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    }
  });
};
