import SheetsAutocomplete from "../../../sheet/common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../../sheet/common-components/SubSheetsAutocomplete";
import EventTypeAutoComplete from "../eventTypeAutoComplete/EventTypeAutocomplete";
import styles from "../trigger.module.css";

const Configure = ({
  sheet,
  table,
  sheetList,
  tableList,
  eventType,
  onEventTypeChange,
  onSheetChange,
  onTableChange,
  createSheet,
  getSheetList,
}) => {
  return (
    <div className={styles.container}>
      <SheetsAutocomplete
        sheet={sheet}
        onChange={onSheetChange}
        sheets={sheetList}
        createSheet={createSheet}
        getSheetList={getSheetList}
        label="Select Sheet"
        description="Select the sheet where you want to monitor the records."
        autocompleteProps={{
          fullWidth: true,
        }}
      />

      <SubSheetsAutocomplete
        subSheets={tableList}
        table={table}
        onChange={onTableChange}
        disabled={!sheet}
        searchable={true}
        label="Select Table"
        description="Select the table in the sheet where you want to monitor the records."
        autocompleteProps={{
          fullWidth: true,
        }}
      />

      <EventTypeAutoComplete
        label="Select Event"
        description="Select the events that will activate the watcher."
        eventType={eventType}
        onEventTypeChange={onEventTypeChange}
      />
    </div>
  );
};

export default Configure;
