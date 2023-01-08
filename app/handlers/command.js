import config from '../../config/index.js';
import {
  COMMAND_SYS_ACTIVATE,
  COMMAND_SYS_COMMAND,
  COMMAND_SYS_DEACTIVATE,
  GENERAL_COMMANDS,
  INFO_COMMANDS,
} from '../../app/commands/index.js';
import { formatCommand } from '../../utils/index.js';
import { MessageAction } from '../actions/index.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => context.isCommand(COMMAND_SYS_COMMAND);

/**
 * @param {Context} context
 * @returns {Context}
 */
const exec = (context) => check(context) && (
  async () => {
    updateHistory(context.id, (history) => history.records.pop());
    try {
      const buttons = formatCommand(INFO_COMMANDS);
      buttons.splice(2, 0, new MessageAction(context.source.bot.isActivated ? COMMAND_SYS_DEACTIVATE : COMMAND_SYS_ACTIVATE));
      context.pushTemplate(COMMAND_SYS_COMMAND.label, buttons, formatCommand(GENERAL_COMMANDS));
    } catch (err) {
      context.pushError(err);
    }
    return context;
  }
)();

export default exec;