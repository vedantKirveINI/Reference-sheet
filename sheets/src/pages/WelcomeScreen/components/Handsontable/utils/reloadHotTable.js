function reloadHotTable(hotTableRef, data, columns) {
	if (hotTableRef.current) {
		const hotInstance = hotTableRef.current.hotInstance;

		hotInstance.updateSettings({
			data: [...data],
			columns: [...columns],
		});

		hotInstance.render();
	}
}
export { reloadHotTable };
