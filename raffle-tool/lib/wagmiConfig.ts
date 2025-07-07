import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "viem/chains";

export const config = getDefaultConfig({
  appName: "Monad Testnet dApp",
  projectId: "3e849aa687238170aa7c7fa04f21e1bb",
  chains: [monadTestnet],
  ssr: true,
});
