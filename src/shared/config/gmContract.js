export const GM_CONTRACT = {
  address: "0x0000000000000000000000000000000000000000",
  abi: [
    "function gm() external",
    "function totalGm() view returns (uint256)",
    "function lastGmDay(address user) view returns (uint256)",
  ],
};

export const isGmContractConfigured = () =>
  GM_CONTRACT.address !== "0x0000000000000000000000000000000000000000";
