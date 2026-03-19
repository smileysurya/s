import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Rental() {
  return <CatalogPage catalog={getCatalog("rental")} />;
}
