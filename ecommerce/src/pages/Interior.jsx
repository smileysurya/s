import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Interior() {
  return <CatalogPage catalog={getCatalog("interior")} />;
}
