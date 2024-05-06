import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { FunctionsConsumer } from "../typechain-types";
import { Contract } from "ethers";
import { networks } from "../scripts/networks";
import { SubscriptionManager } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const signers = await hre.ethers.getSigners();
  const { deploy } = hre.deployments;
  if (hre.network.name === "sepolia") {
    const network = networks["ethereumSepolia"];

    const subID = 7338; //https://vrf.chain.link/sepolia/7338
    const routerAddress = network.functionsRouter;

    const donId = network.donId;

    const donIdBytes32 = hre.ethers.encodeBytes32String(donId);

    const linkTokenAddress = network.linkToken;

    const privateKey = process.env.PRIVATE_KEY;

    const provider = new JsonRpcProvider("https://node.ghostnet.etherlink.com");
    const wallet = new Wallet(privateKey).connect(provider);

    const subscriptionManager = new SubscriptionManager({
      signer: wallet,
      linkTokenAddress,
      functionsRouterAddress: routerAddress,
    });

    deploy("FunctionConsumer", {
      from: deployer,
      args: [routerAddress, donIdBytes32],
      log: true,
    });

    const functionConsumer = await hre.ethers.getContract<FunctionsConsumer>("FunctionConsumer", deployer);

    await subscriptionManager.addConsumer({
      subscriptionId: subID,
      consumerAddress: await functionConsumer.getAddress(),
    });
  }

  // https://functions.chain.link/sepolia/2587

  const functionConsumer = await hre.ethers.getContract<FunctionsConsumer>("FunctionConsumer", deployer);
  SubscriptionManager// const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  .console
    .log("👋 Initial greeting:");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];