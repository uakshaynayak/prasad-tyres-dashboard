import { TyreMasterTable, type TyreMasterEntry } from "@/components/tyre-master/TyreMasterTable";
import { TyreMasterMobile } from "@/components/tyre-master/TyreMasterMobile";
import styles from "./page.module.css";

const MOCK_DATA: TyreMasterEntry[] = [
  { id: "1", tyreSize: "10.00 R20",    category: "Truck / Heavy Duty", vehicleType: "truck",   defaultPrice: "₹2,800", isActive: true  },
  { id: "2", tyreSize: "9.00 R20",     category: "Bus / Transit",      vehicleType: "bus",     defaultPrice: "₹2,250", isActive: true  },
  { id: "3", tyreSize: "315/80 R22.5", category: "Truck / Long Haul",  vehicleType: "truck",   defaultPrice: "₹2,800", isActive: false },
  { id: "4", tyreSize: "7.50 R16",     category: "LCV / Light Duty",   vehicleType: "lcv",     defaultPrice: "₹1,500", isActive: true  },
  { id: "5", tyreSize: "14.9-28",      category: "Tractor / Agri",     vehicleType: "tractor", defaultPrice: "₹3,200", isActive: false },
  { id: "6", tyreSize: "295/80 R22.5", category: "Truck / Long Haul",  vehicleType: "truck",   defaultPrice: "₹3,500", isActive: true  },
  { id: "7", tyreSize: "11.00 R20",    category: "Truck / Heavy Duty", vehicleType: "truck",   defaultPrice: "₹3,100", isActive: true  },
  { id: "8", tyreSize: "8.25 R20",     category: "Bus / Transit",      vehicleType: "bus",     defaultPrice: "₹2,400", isActive: true  },
];

export default function TyreMasterPage() {
  return (
    <>
      <div className={styles.desktop}>
        <TyreMasterTable data={MOCK_DATA} />
      </div>
      <div className={styles.mobile}>
        <TyreMasterMobile data={MOCK_DATA} />
      </div>
    </>
  );
}
