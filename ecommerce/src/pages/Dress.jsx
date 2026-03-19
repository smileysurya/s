import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Dress() {
  return <CatalogPage catalog={getCatalog("dress")} />;
}
