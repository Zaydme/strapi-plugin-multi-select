import { PLUGIN_ID } from './pluginId';
import MultiSelectIcon from './components/MultiSelectIcon';
import { getTrad } from './utils/getTrad';
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';

export default {
  register(app: any) {
    app.customFields.register({
      name: PLUGIN_ID,
      pluginId: PLUGIN_ID,
      type: 'json',
      icon: MultiSelectIcon,
      intlLabel: {
        id: getTrad('multi-select.label'),
        defaultMessage: 'Multi Select',
      },
      intlDescription: {
        id: getTrad('multi-select.description'),
        defaultMessage: 'Select multiple options from a list',
      },
      components: {
        Input: async () => import('./components/MultiSelect'),
      },
      options: {
        base: [
          {
            sectionTitle: null,
            items: [
              {
                name: 'options',
                type: 'textarea-enum',
                intlLabel: {
                  id: getTrad('multi-select.enum.label'),
                  defaultMessage: 'Options (one per line)',
                },
                description: {
                  id: getTrad('multi-select.enum.description'),
                  defaultMessage:
                    'Enter one option per line. You can also add a value and a label separated by a colon (e.g. "label:value").\nIf no value is provided, the label will be used as the value',
                },
                placeholder: {
                  id: getTrad('multi-select.enum.placeholder'),
                  defaultMessage: 'Ex:\nOption 1\nOption 2\nOption 3:option-3',
                },
              },
              {
                name: 'default',
                type: 'json',
                intlLabel: {
                  id: getTrad('multi-select.default.label'),
                  defaultMessage: 'Default value',
                },
                description: {
                  id: getTrad('multi-select.default.description'),
                  defaultMessage:
                    'Set the default value of the field in JSON format, be careful with the syntax, ex: ["value-1", "value-2"]',
                },
                defaultValue: '[]',
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: {
              id: 'global.settings',
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: 'multi-select.settings.requiredField',
                  defaultMessage: 'Required field',
                },
                description: {
                  id: 'multi-select.settings.requiredField.description',
                  defaultMessage: "You won't be able to create an entry if this field is empty",
                },
              },
              {
                name: 'private',
                type: 'checkbox',
                intlLabel: {
                  id: 'multi-select.settings.private',
                  defaultMessage: 'Private field',
                },
                description: {
                  id: 'multi-select.settings.private.description',
                  defaultMessage: 'This field will not show up in the API response',
                },
              },
              {
                name: 'min',
                type: 'number',
                intlLabel: {
                  id: 'multi-select.settings.minLength',
                  defaultMessage: 'Minimum items',
                },
                description: {
                  id: 'multi-select.settings.minLength.description',
                  defaultMessage: 'The minimum number of items allowed (visual feedback only, cannot be enforced)',
                },
              },
              {
                name: 'max',
                type: 'number',
                intlLabel: {
                  id: 'multi-select.settings.maxLength',
                  defaultMessage: 'Maximum items',
                },
                description: {
                  id: 'multi-select.settings.maxLength.description',
                  defaultMessage: 'The maximum number of items allowed (client-side enforcement only)',
                },
              },
            ],
          },
        ],
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return Promise.all([import(`./translations/${locale}.json`)])
          .then(([pluginTranslations]) => {
            return {
              data: {
                ...prefixPluginTranslations(pluginTranslations.default, PLUGIN_ID),
              },
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );
    return Promise.resolve(importedTrads);
  },
};
