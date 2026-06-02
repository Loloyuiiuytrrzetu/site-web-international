import { MenuView } from "./components/MenuView";
import { demoRestaurant } from "@/lib/demo-restaurant";

export default function Home() {
  return <MenuView restaurant={demoRestaurant} />;
}
