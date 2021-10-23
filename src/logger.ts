// main
import type {
  ConsoleSafeLogLevel,
  LogEmitter,
  LogEntry,
  LogEntryType,
  Logger as LoggerType,
  LogLevel,
} from '@transcend-io/airgap.js-types';

// local
import { flattenOneLevel } from './utils/flatten-one-level';

export const createLogger = (
  /** Log tag */
  logTag = '',
  /** Enabled log levels. If undefined, all log levels are enabled. */
  enabledLevels?: Set<LogLevel>,
  /** Console API interface */
  consoleAPI = typeof console !== 'undefined' && console,
): LoggerType => {
  if (!consoleAPI) {
    throw new Error('Console API is not available');
  }
  /**
   * Transcend logger utility
   *
   * This example snippet outputs `[log tag] red blue green [interactive object]`
   * in your browser console with relevant styles and native console interactivity
   *
   * @example
   * const logger = createLogger();
   * logger.tag('[log tag]', () => {
   *   logger.log.styled(
   *     ['color:red', 'color:blue', 'color:green'],
   *     '%cred %cblue %cgreen',
   *     { rich: 'object', interactive: true },
   *   );
   * });
   */

  /**
   * Console log emit
   */
  type ConsoleLogEmitter = (...args: any) => void;

  const log = (
    emitter: ConsoleLogEmitter,
    type: LogEntryType,
    ...entries: LogEntry[]
  ): void => {
    const output: unknown[] = [];
    let firstEntry = true;
    entries.forEach(({ tag, message }: LogEntry) => {
      if (firstEntry) {
        // only show tag in first entry
        if (typeof message.content === 'string') {
          // combine tag and message if both are strings
          // to make it possible to apply multiple styles
          output.push([
            `%c${tag.content ? `${tag.content}%c ` : '%c'}${message.content}`,
            ...tag.styles,
            '',
            ...message.styles,
          ]);
        } else {
          output.push([`%c${tag.content}`, ...tag.styles, message.content]);
        }
        firstEntry = false;
      } else {
        output.push(message.content);
      }
    });
    emitter.apply(consoleAPI, flattenOneLevel(output));
  };

  const LOG_TAG_STYLE = 'font-size:larger;font-weight:bold';
  const LOG_TAG_STYLE_LOG = `${LOG_TAG_STYLE}`;
  const LOG_TAG_STYLE_DEBUG = `${LOG_TAG_STYLE};color:#2F4F4F`;
  const LOG_TAG_STYLE_WARN = `${LOG_TAG_STYLE};color:amber`;
  const LOG_TAG_STYLE_ERROR = `${LOG_TAG_STYLE};color:crimson`;

  let currentLogTag = logTag;
  /**
   * Set log tag during callback execution or from
   * this point on if no callback is provided.
   *
   * @param newLogTag - Log tag
   * @param callback - Callback function
   */
  const tag = (newLogTag: string, callback?: () => void): void => {
    const previousTag = currentLogTag;
    currentLogTag = newLogTag;
    if (callback) {
      callback();
      currentLogTag = previousTag;
    }
  };

  const remapForConsole = new Map<LogEntryType, LogEntryType>([
    ['fatal', 'error'],
  ]);

  const createLogger = (
    type: LogEntryType,
    logLevel: LogLevel,
    tagStyle: string = LOG_TAG_STYLE,
  ): LogEmitter => {
    if (
      // only gate log levels if enabledLevels is defined
      enabledLevels &&
      !enabledLevels.has(logLevel) &&
      !process.env.DEBUG_MODE
    ) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noOp = (() => {}) as any;
      noOp.styled = noOp;
      return noOp;
    }
    const emitter = (consoleAPI as any)[
      (remapForConsole.has(type)
        ? remapForConsole.get(type)
        : type) as ConsoleSafeLogLevel
    ] as ConsoleLogEmitter;
    const tagStyles: string[] = [tagStyle];
    const messageStyles: string[] = [];
    const emit = (...entries: any[]): void => {
      log(
        emitter,
        type,
        ...(entries.map((entry) => ({
          tag: {
            content: currentLogTag,
            styles: tagStyles,
          },
          message: {
            content: entry,
            styles: messageStyles,
          },
        })) as LogEntry[]),
      );
    };
    emit.styled = (styles?: null | string | string[], ...entries: any[]) => {
      const [firstEntry] = entries;
      if (
        entries.length !== 0 &&
        (typeof firstEntry !== 'string' || !firstEntry.includes('%c'))
      ) {
        // styled() called without any styleable text
        // assume that the caller wants the whole message body styled
        // eslint-disable-next-line no-param-reassign
        entries[0] = `%c${firstEntry}`;
      }
      if (typeof styles !== 'undefined' && styles !== null) {
        messageStyles.push(...(Array.isArray(styles) ? styles : [styles]));
      }
      emit(...entries);
      messageStyles.length = 0;
    };
    return emit;
  };

  const infoLogLevel = 'info';

  // Log level and style data for each log entry type
  const logMethodInfo: [LogEntryType, [LogLevel, string]][] = [
    ['group', [infoLogLevel, LOG_TAG_STYLE_LOG]],
    ['groupCollapsed', [infoLogLevel, LOG_TAG_STYLE_LOG]],
    ['groupEnd', [infoLogLevel, LOG_TAG_STYLE_LOG]],
    ['trace', ['trace', LOG_TAG_STYLE_DEBUG]],
    ['log', [infoLogLevel, LOG_TAG_STYLE_LOG]],
    ['info', [infoLogLevel, LOG_TAG_STYLE_LOG]],
    ['debug', ['debug', LOG_TAG_STYLE_DEBUG]],
    ['warn', ['warn', LOG_TAG_STYLE_WARN]],
    ['error', ['error', LOG_TAG_STYLE_ERROR]],
    ['fatal', ['error', LOG_TAG_STYLE_ERROR]],
  ];

  const loggerUtil: Partial<LoggerType> = { tag };
  logMethodInfo.forEach(([method, [level, style]]) => {
    loggerUtil[method] = createLogger(method, level, style);
  });

  return loggerUtil as LoggerType;
};
