import CatalogPage from "../components/CatalogPage";
import { getCatalog } from "../data/marketplace";

export default function WelcomeKits() {
  return <CatalogPage catalog={getCatalog("welcomekits")} />;
}
