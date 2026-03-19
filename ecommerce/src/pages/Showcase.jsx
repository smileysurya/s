import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function Showcase() {
  return <CatalogPage catalog={getCatalog("showcase")} />;
}
