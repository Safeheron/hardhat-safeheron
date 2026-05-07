import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

export default buildModule("ExampleTokenModule", (m) => {
  // 1,000,000 EXT with 18 decimals
  const initialSupply = parseEther("1000000");
  const token = m.contract("ExampleToken", [initialSupply]);
  return { token };
});
