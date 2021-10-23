<h1 align="center">Transcend Browser Logger</h1>
<p align="center">
  <strong>A logger with style</strong>
</p>
<br />

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Usage example](#usage-example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage example

This example snippet outputs `[log tag] red blue green [interactive object]`
in your console with relevant styles and native console interactivity

```ts
import { createLogger } from '@transcend-io/logger';

const logger = createLogger();

logger.tag('[log tag]', () => {
  logger.log.styled(
    ['color:red', 'color:blue', 'color:green'],
    '%cred %cblue %cgreen',
    { rich: 'object', interactive: true },
  );
});
```
