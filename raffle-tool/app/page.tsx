import NFTRaffleRace from "../components/NFTRaffleRace";

export default async function Home() {
  return <NFTRaffleRace />;
}

// "use client";

// import { NFTTransferABI } from "@/lib/abi";
// import { NEXT_PUBLIC_CONTRACT_ADDRESS } from "@/lib/contractAddress";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useWriteContract } from "wagmi";

// export default function Home() {
//   const {
//     writeContract: writeTransfer,
//     data: transferData,
//     // isPending: isApprovePending,
//     // error: approveError,
//   } = useWriteContract();

//   // const handleTransfer = () => {
//   //   writeTransfer({
//   //     address: NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
//   //     abi: NFTTransferABI,
//   //     functionName: "safeTransferFrom",
//   //     args: [
//   //       "0x4bc6273235e3dbD1F927137cd27E38630edD381a" as `0x${string}`,
//   //       "0xd82464667aA6A0497A2AaF0ABfcbFb1324ad99B6" as `0x${string}`,
//   //       BigInt(6543n),
//   //     ],
//   //   });
//   // };

//   const {
//     writeContract: writeApprove,
//     data: approveData,
//     // isPending: isApprovePending,
//     // error: approveError,
//   } = useWriteContract();

//   // Handlers
//   const handleApprove = () => {
//     writeApprove({
//       address: "0x4bc6273235e3dbD1F927137cd27E38630edD381a" as `0x${string}`,
//       abi: NFTTransferABI,
//       functionName: "setApprovalForAll",
//       args: [NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`, true],
//     });
//   };

//   const handleTransfer = () => {
//     writeTransfer({
//       address: NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
//       abi: NFTTransferABI,
//       functionName: "transferNFT",
//       args: [
//         "0x4bc6273235e3dbD1F927137cd27E38630edD381a" as `0x${string}`,
//         BigInt(6543n),
//         "0xd82464667aA6A0497A2AaF0ABfcbFb1324ad99B6" as `0x${string}`,
//       ],
//     });
//   };

//   console.log(approveData, "approveData");
//   console.log(transferData, "transferData");

//   return (
//     <div>
//       <ConnectButton />
//       <div className="text-white">
//         <button onClick={handleApprove}>Approve</button>
//         <button onClick={handleTransfer}>transfer</button>
//       </div>
//     </div>
//   );
// }
