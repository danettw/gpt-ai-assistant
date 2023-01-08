import { TYPE_ACT } from '../../constants/command.js';
import { t } from '../../locales/index.js';
import Command from './Command.js';

export default new Command({
  type: TYPE_ACT,
  label: t('__COMMAND_ACT_ADVISE_LABEL'),
  text: t('__COMMAND_ACT_ADVISE_TEXT'),
  prompt: t('__COMMAND_ACT_ADVISE_PROMPT'),
  aliases: [
    '/advise',
    'Advise',
  ],
});