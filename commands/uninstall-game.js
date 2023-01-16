const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("ACTIONS.UNINSTALL")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.UNINSTALL_GAME", game)
	);

	if (!confirm) {
		console.log("Operation cancelled!");
		return;
	}

	console.log(`Uninstalling ${game}...`);
	await cp.execSync(`legendary uninstall "${game}" -y`, {
		stdio: "pipe",
	});
	console.log("Game uninstalled!");
};
