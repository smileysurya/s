import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Procurement() {
  return <CatalogPage catalog={getCatalog("procurement")} />;
}
