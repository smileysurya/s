import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Bulk() {
  return <CatalogPage catalog={getCatalog("bulk")} />;
}
