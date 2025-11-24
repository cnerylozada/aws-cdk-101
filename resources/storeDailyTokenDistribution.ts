import { Handler } from "aws-lambda";

interface IBalanceListResponse {
  totalValidWorkloads: number;
  nodeInformation: {
    address: string;
    workloads: { nodeAddress: string; uptime: number }[];
    validWorkloads: number;
    date: string;
    awardableBalance: string;
  }[];
  rewardPerWorkload: string;
}

const getLastBalanceList = async () => {
  const response: IBalanceListResponse = {
    totalValidWorkloads: 453,
    nodeInformation: [
      {
        address: "0x09B06b451388C3c303AD5eAbbbb9EF5e2bF476c2",
        workloads: [
          {
            nodeAddress: "0xd4a88d7e209c5f3afffde7fe63c3f5fb9dfd2ce3",
            uptime: 86112,
          },
          {
            nodeAddress: "0x63b1dc615a79bd1ef21861f36a3be95a737995f3",
            uptime: 86190,
          },
        ],
        validWorkloads: 2,
        date: "2025-11-20",
        awardableBalance: "8830.022075055187637968",
      },
    ],
    rewardPerWorkload: "4415.011037527593818984",
  };
  return response;
};

const storeDistribution = async (lastBalanceList: IBalanceListResponse) => {
  const BUCKET_NAME = process.env.BUCKET;
};

export const mainHandler: Handler = async function () {
  const lastBalanceList = await getLastBalanceList();

  await storeDistribution(lastBalanceList);
  return {
    statusCode: 200,
    body: lastBalanceList,
  };
};
