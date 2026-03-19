import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function ShopOffice() {
  return <CatalogPage catalog={getCatalog("shopoffice")} />;
}
