import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Bags() {
  return <CatalogPage catalog={getCatalog("bags")} />;
}
