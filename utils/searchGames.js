const cp = require("child_process");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy");

module.exports = async (filter) => {
	let games;
	let sub;
	let save;
	switch (filter) {
		case "installed":
			games = cacheObj.installedGamesList;
			sub = "list-installed";
			save = (updated) => { cacheObj.installedGamesList = updated };
			break;
		case "owned":
			games = cacheObj.installedGamesList;
			sub = "list-games";
			save = (updated) => { cacheObj.ownedGamesList = updated };
			break;
	}

	if (!games) {
		games = [];
		let output;
		try {
			output = await cp.execSync("legendary " + sub, {
				stdio: "pipe",
			});
		} catch (e) {
			console.error("Could not list games: " + e);
			return;
		}

		let gamesOutput = output
			.toString()
			.replaceAll(/[^\x00-\x7F]/g, "")
			.split("\n")
			.slice(2, -3);

		await gamesOutput.forEach(async (game) => {
			if (game.startsWith("  +") || game.startsWith("  -")) return;
			if (game.startsWith("  !")) {
				games.pop();
				return;
			}
			game = game.slice(3);
			if (game === undefined) return;
			game = game.split(" (App name: ")[0];
			games.push(game);
		});
		save(games);
	}

	if (!games.includes("Select this item to exit..."))
		games.unshift("Select this item to exit...");

	return function searchGames(answers, input) {
		input = input || "";
		return new Promise(function (resolve) {
			var fuzzyResult = fuzzy.filter(input, games);
			const results = fuzzyResult.map(function (rs) {
				return rs.original;
			});

			results.splice(1, 0, new inquirer.Separator());
			results.push(new inquirer.Separator());
			results.unshift(new inquirer.Separator());
			resolve(results);
		});
	};
};
