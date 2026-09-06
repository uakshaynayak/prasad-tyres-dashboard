import { VehicleHistoryDesktop, VEHICLE_DB } from "@/components/vehicle-history/VehicleHistoryDesktop";
import { VehicleHistoryMobile } from "@/components/vehicle-history/VehicleHistoryMobile";
import styles from "./page.module.css";

export default function VehicleHistoryPage() {
  return (
    <>
      <div className={styles.desktop}>
        <VehicleHistoryDesktop vehicles={VEHICLE_DB} defaultVehicle="KA-19-ME-5544" />
      </div>
      <div className={styles.mobile}>
        <VehicleHistoryMobile />
      </div>
    </>
  );
}
