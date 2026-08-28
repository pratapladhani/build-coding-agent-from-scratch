import * as cli from './cli.js';
import * as llm from './llm.js';
import * as tools from './tools/index.js';

while (true) {
	const userInput = await cli.ask();
	let response = await llm.complete(userInput);

	if (response.toolCall) {
		cli.using(response.toolCall.name, response.toolCall.arguments);
		response = await llm.complete(
			tools.runTool(response.toolCall.name, response.toolCall.arguments),
		);
	}

	cli.reply(response.text);
}

cli.close();
