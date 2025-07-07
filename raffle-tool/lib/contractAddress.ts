if (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === "undefined") {
  throw new Error(
    "NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set"
  );
}
export const NEXT_PUBLIC_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as string;
