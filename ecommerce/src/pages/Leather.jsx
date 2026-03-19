import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Leather() {
  return <CatalogPage catalog={getCatalog("leather")} />;
}
