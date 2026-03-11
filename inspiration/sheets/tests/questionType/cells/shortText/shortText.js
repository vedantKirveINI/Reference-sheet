import { expect } from "@playwright/test";

export const shortText = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell22 = await getCell(2, 2);

	await cell22.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800); // Adjust if necessary

	await cell22.dblclick();
	await page.locator("textarea").fill("checking short text");
	await page.keyboard.press("Enter");

	await expect(cell22).toHaveText("checking short text");
};

export const shortTextWithLongText = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell22 = await getCell(2, 2);

	await cell22.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800); // Adjust if necessary

	await cell22.dblclick();

	await page
		.locator("textarea")
		.fill(
			"Lorem ipsum odor amet, consectetuer adipiscing elit. Felis vitae fermentum eu leo cras. Libero nunc ut amet eget torquent justo. Tempor turpis vulputate pulvinar viverra conubia. Suspendisse orci malesuada nascetur justo; odio hendrerit cras. Phasellus cubilia dictumst ex facilisi pellentesque vehicula aenean gravida. Aenean maximus potenti porttitor varius hac. Ante est vestibulum mus himenaeos purus felis. Vel natoque feugiat varius blandit rutrum iaculis montes leo. Ac pellentesque sit lorem ante phasellus sagittis class duis. Et volutpat condimentum nostra in primis magnis turpis. Mus nunc eget class, turpis nisi maximus egestas aptent. Habitant natoque tortor tincidunt odio egestas cursus id. Auctor mattis ante dui; at in interdum. Mi auctor eget praesent molestie praesent. Convallis efficitur fames gravida ultrices habitant etiam. Mattis massa dui mollis quam scelerisque. Adipiscing tortor massa, suscipit neque habitasse interdum. Neque metus praesent mollis nibh non aliquet est, sodales interdum. Tristique erat habitant ac dictumst nec. Dapibus torquent conubia amet bibendum mus. Quis cubilia non feugiat imperdiet justo tellus hendrerit velit. Arcu sodales massa aliquam congue massa. Dis augue gravida ac ad volutpat; sit penatibus. Suspendisse dapibus egestas torquent, potenti efficitur ullamcorper. Facilisi est suspendisse scelerisque dictum ultricies dui. Turpis gravida suspendisse lorem suspendisse vestibulum nisl maximus risus id. Sodales euismod rutrum venenatis fames tellus amet porttitor tristique. Dapibus aliquam in dui; laoreet massa metus egestas sed. Dignissim cras augue parturient mattis odio praesent? Magnis penatibus eros ornare habitant habitant maximus. Sagittis sociosqu vehicula vehicula netus efficitur bibendum fusce efficitur. Eros praesent nam ut habitant nisi. Odio pharetra nibh fermentum et pulvinar sagittis. Phasellus nec potenti cras at enim elit nec elit. Varius maximus conubia arcu turpis nibh. Litora diam orci curae platea eleifend et nullam porttitor. Lacus felis dignissim porttitor lacus nibh semper per lobortis. Consequat gravida parturient nisi fusce massa et. Porttitor malesuada congue himenaeos non scelerisque suscipit lacinia. Mollis aptent turpis nostra platea commodo vestibulum aliquet primis. Blandit enim a eros lobortis parturient aliquet sagittis ad. Interdum class ligula litora per inceptos molestie vestibulum porta. Amet imperdiet ullamcorper habitasse cras quisque est netus ullamcorper. Dignissim nostra eros molestie sodales libero facilisis. Taciti est semper imperdiet facilisi lacinia suspendisse justo. Vehicula lectus non pharetra torquent enim congue. Taciti taciti tellus molestie pellentesque lacinia facilisi justo. Lectus habitant ligula tincidunt montes est et porta. Vehicula ligula posuere vehicula ante mollis auctor ad vel vivamus. Amet maximus torquent vehicula porttitor netus. Aptent placerat inceptos taciti conubia aliquet et molestie quisque. Porta morbi semper class odio mattis. Auctor lorem quam fusce id aptent habitasse vivamus venenatis odio. Habitant praesent quam ultricies tempor aliquet mattis. Ad netus magna quam mattis litora erat odio laoreet. Sollicitudin egestas taciti faucibus ex eget mauris curae. Fermentum pellentesque semper magna praesent placerat duis; tincidunt quisque. Hac nec sed augue risus sodales, tellus pulvinar. Dapibus ligula penatibus vitae justo ullamcorper vel. Conubia arcu himenaeos id facilisi elementum ridiculus hac. Volutpat tempor eu ex urna class dapibus molestie rutrum. Potenti class torquent justo erat aenean nisi pellentesque pellentesque. Lobortis proin mus primis orci nulla lectus. Duis placerat massa vestibulum sapien aenean luctus magna. Risus scelerisque per augue per a conubia ullamcorper! Facilisis montes bibendum nec dignissim pharetra senectus magnis. Quisque venenatis placerat aenean finibus aliquam tincidunt. Sodales etiam fringilla mauris conubia faucibus eu. Est commodo amet porta magna amet condimentum. Euismod eros orci proin, quam fames tortor taciti pretium. Primis gravida ornare nibh fermentum non eros. Felis turpis hac vestibulum hac libero ultricies consectetur mollis. Quam aenean diam laoreet sociosqu volutpat turpis sem nisl morbi. Senectus finibus nostra blandit vestibulum conubia ex aliquam parturient. Eget curae faucibus at faucibus taciti imperdiet accumsan varius gravida? Scelerisque viverra blandit efficitur himenaeos ullamcorper. Sodales lorem penatibus dis bibendum leo. Ridiculus cras placerat netus, netus facilisi sodales commodo in. Fames quis mattis sed enim sagittis accumsan. Tellus facilisis dictum etiam suspendisse gravida. Odio velit lectus finibus quis varius cubilia non eleifend ex. Eget iaculis pretium, magnis per quis laoreet? Phasellus semper euismod class ipsum justo elementum, praesent ullamcorper. Scelerisque iaculis torquent aliquet non congue orci ut. Ultrices senectus tristique mollis ex faucibus litora pulvinar. Nostra vivamus dolor aptent adipiscing convallis arcu. Cras nec accumsan habitasse nascetur auctor mauris. Vulputate urna at scelerisque lacus fames platea pulvinar feugiat leo. Litora lacus a nulla etiam primis est parturient quisque erat. Ex morbi pellentesque efficitur suscipit rhoncus. Condimentum congue auctor ridiculus eros condimentum et. Lobortis diam tempus nec aliquam netus nunc. Velit nec vestibulum torquent litora, mollis natoque volutpat quis. Tortor justo montes vestibulum nisl dolor aenean libero. Consectetur imperdiet sagittis sodales, eleifend purus condimentum at. Dapibus non faucibus sed fringilla placerat primis. Natoque at consequat est quisque sit magna; a luctus. Lorem hac curae cras ornare tempus quis phasellus phasellus. Mollis cursus magna class justo vehicula euismod. Nostra nec amet blandit taciti ante massa. Neque ullamcorper consectetur mattis fames dapibus, augue luctus dictum. Faucibus quis phasellus diam eu vestibulum ex consectetur blandit. Mollis sapien risus nullam leo curae et. Cursus ante eu orci et parturient fermentum turpis iaculis. Elit curabitur enim primis viverra leo. Tempus commodo vitae diam dis feugiat, id praesent ex. Dolor himenaeos egestas nascetur; dolor ipsum dis viverra. Turpis ridiculus ac erat praesent per, semper class tellus. Eget maximus ante mus placerat ut augue. Imperdiet elementum risus dictum a rutrum mauris iaculis est diam. Nam habitant lectus fringilla fringilla sit commodo. Bibendum eu dictum dignissim eget himenaeos. Ac accumsan vivamus aliquet consequat suscipit himenaeos dis tellus. Luctus nascetur tortor adipiscing scelerisque fringilla risus; tempus semper. Rutrum himenaeos duis potenti sagittis donec dolor; rutrum sodales.",
		);
	await page.keyboard.press("Enter");

	await expect(cell22).toHaveText(
		"Lorem ipsum odor amet, consectetuer adipiscing elit. Felis vitae fermentum eu leo cras. Libero nunc ut amet eget torquent justo. Tempor turpis vulputate pulvinar viverra conubia. Suspendisse orci malesuada nascetur justo; odio hendrerit cras. Phasellus cubilia dictumst ex facilisi pellentesque vehicula aenean gravida. Aenean maximus potenti porttitor varius hac. Ante est vestibulum mus himenaeos purus felis. Vel natoque feugiat varius blandit rutrum iaculis montes leo. Ac pellentesque sit lorem ante phasellus sagittis class duis. Et volutpat condimentum nostra in primis magnis turpis. Mus nunc eget class, turpis nisi maximus egestas aptent. Habitant natoque tortor tincidunt odio egestas cursus id. Auctor mattis ante dui; at in interdum. Mi auctor eget praesent molestie praesent. Convallis efficitur fames gravida ultrices habitant etiam. Mattis massa dui mollis quam scelerisque. Adipiscing tortor massa, suscipit neque habitasse interdum. Neque metus praesent mollis nibh non aliquet est, sodales interdum. Tristique erat habitant ac dictumst nec. Dapibus torquent conubia amet bibendum mus. Quis cubilia non feugiat imperdiet justo tellus hendrerit velit. Arcu sodales massa aliquam congue massa. Dis augue gravida ac ad volutpat; sit penatibus. Suspendisse dapibus egestas torquent, potenti efficitur ullamcorper. Facilisi est suspendisse scelerisque dictum ultricies dui. Turpis gravida suspendisse lorem suspendisse vestibulum nisl maximus risus id. Sodales euismod rutrum venenatis fames tellus amet porttitor tristique. Dapibus aliquam in dui; laoreet massa metus egestas sed. Dignissim cras augue parturient mattis odio praesent? Magnis penatibus eros ornare habitant habitant maximus. Sagittis sociosqu vehicula vehicula netus efficitur bibendum fusce efficitur. Eros praesent nam ut habitant nisi. Odio pharetra nibh fermentum et pulvinar sagittis. Phasellus nec potenti cras at enim elit nec elit. Varius maximus conubia arcu turpis nibh. Litora diam orci curae platea eleifend et nullam porttitor. Lacus felis dignissim porttitor lacus nibh semper per lobortis. Consequat gravida parturient nisi fusce massa et. Porttitor malesuada congue himenaeos non scelerisque suscipit lacinia. Mollis aptent turpis nostra platea commodo vestibulum aliquet primis. Blandit enim a eros lobortis parturient aliquet sagittis ad. Interdum class ligula litora per inceptos molestie vestibulum porta. Amet imperdiet ullamcorper habitasse cras quisque est netus ullamcorper. Dignissim nostra eros molestie sodales libero facilisis. Taciti est semper imperdiet facilisi lacinia suspendisse justo. Vehicula lectus non pharetra torquent enim congue. Taciti taciti tellus molestie pellentesque lacinia facilisi justo. Lectus habitant ligula tincidunt montes est et porta. Vehicula ligula posuere vehicula ante mollis auctor ad vel vivamus. Amet maximus torquent vehicula porttitor netus. Aptent placerat inceptos taciti conubia aliquet et molestie quisque. Porta morbi semper class odio mattis. Auctor lorem quam fusce id aptent habitasse vivamus venenatis odio. Habitant praesent quam ultricies tempor aliquet mattis. Ad netus magna quam mattis litora erat odio laoreet. Sollicitudin egestas taciti faucibus ex eget mauris curae. Fermentum pellentesque semper magna praesent placerat duis; tincidunt quisque. Hac nec sed augue risus sodales, tellus pulvinar. Dapibus ligula penatibus vitae justo ullamcorper vel. Conubia arcu himenaeos id facilisi elementum ridiculus hac. Volutpat tempor eu ex urna class dapibus molestie rutrum. Potenti class torquent justo erat aenean nisi pellentesque pellentesque. Lobortis proin mus primis orci nulla lectus. Duis placerat massa vestibulum sapien aenean luctus magna. Risus scelerisque per augue per a conubia ullamcorper! Facilisis montes bibendum nec dignissim pharetra senectus magnis. Quisque venenatis placerat aenean finibus aliquam tincidunt. Sodales etiam fringilla mauris conubia faucibus eu. Est commodo amet porta magna amet condimentum. Euismod eros orci proin, quam fames tortor taciti pretium. Primis gravida ornare nibh fermentum non eros. Felis turpis hac vestibulum hac libero ultricies consectetur mollis. Quam aenean diam laoreet sociosqu volutpat turpis sem nisl morbi. Senectus finibus nostra blandit vestibulum conubia ex aliquam parturient. Eget curae faucibus at faucibus taciti imperdiet accumsan varius gravida? Scelerisque viverra blandit efficitur himenaeos ullamcorper. Sodales lorem penatibus dis bibendum leo. Ridiculus cras placerat netus, netus facilisi sodales commodo in. Fames quis mattis sed enim sagittis accumsan. Tellus facilisis dictum etiam suspendisse gravida. Odio velit lectus finibus quis varius cubilia non eleifend ex. Eget iaculis pretium, magnis per quis laoreet? Phasellus semper euismod class ipsum justo elementum, praesent ullamcorper. Scelerisque iaculis torquent aliquet non congue orci ut. Ultrices senectus tristique mollis ex faucibus litora pulvinar. Nostra vivamus dolor aptent adipiscing convallis arcu. Cras nec accumsan habitasse nascetur auctor mauris. Vulputate urna at scelerisque lacus fames platea pulvinar feugiat leo. Litora lacus a nulla etiam primis est parturient quisque erat. Ex morbi pellentesque efficitur suscipit rhoncus. Condimentum congue auctor ridiculus eros condimentum et. Lobortis diam tempus nec aliquam netus nunc. Velit nec vestibulum torquent litora, mollis natoque volutpat quis. Tortor justo montes vestibulum nisl dolor aenean libero. Consectetur imperdiet sagittis sodales, eleifend purus condimentum at. Dapibus non faucibus sed fringilla placerat primis. Natoque at consequat est quisque sit magna; a luctus. Lorem hac curae cras ornare tempus quis phasellus phasellus. Mollis cursus magna class justo vehicula euismod. Nostra nec amet blandit taciti ante massa. Neque ullamcorper consectetur mattis fames dapibus, augue luctus dictum. Faucibus quis phasellus diam eu vestibulum ex consectetur blandit. Mollis sapien risus nullam leo curae et. Cursus ante eu orci et parturient fermentum turpis iaculis. Elit curabitur enim primis viverra leo. Tempus commodo vitae diam dis feugiat, id praesent ex. Dolor himenaeos egestas nascetur; dolor ipsum dis viverra. Turpis ridiculus ac erat praesent per, semper class tellus. Eget maximus ante mus placerat ut augue. Imperdiet elementum risus dictum a rutrum mauris iaculis est diam. Nam habitant lectus fringilla fringilla sit commodo. Bibendum eu dictum dignissim eget himenaeos. Ac accumsan vivamus aliquet consequat suscipit himenaeos dis tellus. Luctus nascetur tortor adipiscing scelerisque fringilla risus; tempus semper. Rutrum himenaeos duis potenti sagittis donec dolor; rutrum sodales.",
	);
};

export const shortTextWithNumber = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};

	const cell22 = await getCell(2, 2);

	await cell22.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800); // Adjust if necessary

	await cell22.dblclick();

	await page.locator("textarea").fill("100");
	await page.keyboard.press("Enter");

	await expect(cell22).toHaveText("100");
	await page.waitForTimeout(800);
};

export const shortTextWithLargeNumber = async ({ page }) => {
	const getCell = async (row, col) => {
		return page.locator(
			`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
		);
	};
	const cell22 = await getCell(2, 2);

	await cell22.click();
	await page.keyboard.press("Backspace");
	await page.waitForTimeout(800); // Adjust if necessary

	await cell22.dblclick();

	await page
		.locator("textarea")
		.fill(
			"99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
		);
	await page.keyboard.press("Enter");

	await expect(cell22).toHaveText(
		"99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
	);
	await page.waitForTimeout(800);
};
