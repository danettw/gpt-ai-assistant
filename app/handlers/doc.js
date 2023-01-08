import { COMMAND_SYS_DOC, GENERAL_COMMANDS } from '../../app/commands/index.js';
import formatCommand from '../../utils/format-command.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => context.isCommand(COMMAND_SYS_DOC);

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => check(context) && (
  async () => {
    updateHistory(context.id, (history) => history.records.pop());
    context.pushText('https://github.com/memochou1993/gpt-ai-assistant', formatCommand(GENERAL_COMMANDS));
    return context;
  }
)();

export default exec;