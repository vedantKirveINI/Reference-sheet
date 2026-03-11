import styles from "./tableLoader.module.css";
// import Skeleton from "oute-ds-skeleton";
import { ODSSkeleton as Skeleton } from "@src/module/ods";

function RenderColumns({ columns = 3 }) {
  return Array.from({ length: columns }, (_, index) => (
    <div key={index} className={styles.loaderColumn}>
      <Skeleton
        variant="rounded"
        width="100%"
        height="20px"
        sx={{
          borderRadius: "6.25rem",
          background:
            "linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
        }}
      />
    </div>
  ));
}

function TableLoader({ rows = 5, columns = 2 }) {
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  return (
    <div className={styles.tableLoader}>
      <div className={styles.tableLoaderHeader} style={{ gridTemplateColumns }}>
        <RenderColumns columns={columns} />
      </div>

      <div className={styles.tableLoaderBody}>
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className={styles.tableLoaderRow}
            style={{ gridTemplateColumns }}
          >
            <RenderColumns columns={columns} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableLoader;
