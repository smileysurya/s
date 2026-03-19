import ModuleCard from "../components/ModuleCard";
import {
  Building2,
  Store,
  Home as HomeIcon,
  FileSignature,
  HardHat,
  Sofa,
  Image as ImageIcon,
  Shirt,
  Users,
  BriefcaseBusiness,
  Gift,
  ShoppingBag,
  Wallet,
  Package,
  Truck,
} from "lucide-react";

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Welcome to UniMart</h1>
        <p style={styles.p}>Your Unified Platform for Products, Rentals, Services & Bulk Orders</p>
      </div>

      <div style={styles.grid}>
        <ModuleCard title="B2B" icon={<Building2 size={24} />} path="/b2b" />
        <ModuleCard title="ShopOffice" icon={<Store size={24} />} path="/shopoffice" />
        <ModuleCard title="Rental" icon={<HomeIcon size={24} />} path="/rental" />
        <ModuleCard title="Lease" icon={<FileSignature size={24} />} path="/lease" />
        <ModuleCard title="Agreement" icon={<FileSignature size={24} />} path="/agreement" />
        <ModuleCard title="Civil" icon={<HardHat size={24} />} path="/civil" />
        <ModuleCard title="Interior" icon={<Sofa size={24} />} path="/interior" />
        <ModuleCard title="Showcase" icon={<ImageIcon size={24} />} path="/showcase" />
        <ModuleCard title="Dress" icon={<Shirt size={24} />} path="/dress" />
        <ModuleCard title="Manpower" icon={<Users size={24} />} path="/manpower" />
        <ModuleCard title="JobPortal" icon={<BriefcaseBusiness size={24} />} path="/jobportal" />
        <ModuleCard title="WelcomeKits" icon={<Gift size={24} />} path="/welcomekits" />
        <ModuleCard title="Bags" icon={<ShoppingBag size={24} />} path="/bags" />
        <ModuleCard title="Leather" icon={<Wallet size={24} />} path="/leather" />
        <ModuleCard title="Bulk" icon={<Package size={24} />} path="/bulk" />
        <ModuleCard title="Procurement" icon={<Truck size={24} />} path="/procurement" />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "transparent",
    minHeight: "100%",
  },
  header: {
    textAlign: "left",
    marginBottom: "40px",
  },
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000000",
    marginBottom: "8px",
  },
  p: {
    color: "#555555",
    fontSize: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
};
