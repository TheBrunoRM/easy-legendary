const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(games, "move");

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	let diskPath = await inquirer
		.prompt([
			{
				type: "input",
				name: "diskPath",
				message: `Where do you want to put the game?`,
				validate: (val) => {
					if (val) {
						let regex = /^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm;
						let matchRegex = regex.test(val.replaceAll("/", "\\"));
						if (matchRegex) return true;
						else {
							let matchRegex = regex.test(
								val.replaceAll("/", "\\") + "\\"
							);
							if (matchRegex) return true;
						}
					}
					return Locale.get("TYPE_A_VALID_PATH");
				},
			},
		])
		.then((a) => {
			return a.diskPath;
		});

	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/");
	diskPath =
		diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1];
	let diskPathwGame = diskPath + "/" + game;
	diskPathwGame = diskPathwGame.replaceAll("//", "/");

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("MOVE_GAME_TO_PATH", game, diskPathwGame)
	);

	if (!confirm) {
		console.log("Move operation cancelled!");
		return;
	}
	console.log(`Moving game "${game}" to "${diskPath}"...`);

	// exit if folder is protected and is not elevated
	if (!(await require("../utils/elevationCheck.js")(diskPath, game))) return;

	await cp.execSync(`legendary move "${game}" "${diskPath}" -y`, {
		encoding: "utf-8",
		stdio: "inherit",
	});
};
