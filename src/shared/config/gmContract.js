export const GM_CONTRACT = {
  address: "0x8C51651f878DCB760c5FF16f0A42Ea9912FaaA1d",
  abi: [
    "function gm() external",
    "function totalGm() view returns (uint256)",
    "function lastGmDay(address user) view returns (uint256)",
  ],
};

export const isGmContractConfigured = () =>
  GM_CONTRACT.address !== "0x0000000000000000000000000000000000000000";
