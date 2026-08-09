import { useWriteContract, useReadContract } from 'wagmi';
import { GEO_NFT_ADDRESS, GeoNFTABI, GEO_TOKEN_ADDRESS, GeoTokenABI } from '../config/contracts';

// Hook to tokenize a new land parcel
export function useTokenizeLand() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const tokenize = async (address, uri, coordinates, area, estimatedValue) => {
    return writeContract({
      address: GEO_NFT_ADDRESS,
      abi: GeoNFTABI,
      functionName: 'tokenizeLand',
      args: [address, uri, coordinates, area, estimatedValue],
    });
  };

  return { tokenize, isPending, isSuccess, error };
}

// Hook to get land details
export function useLandDetails(tokenId) {
  const { data, isError, isLoading } = useReadContract({
    address: GEO_NFT_ADDRESS,
    abi: GeoNFTABI,
    functionName: 'getLandDetails',
    args: [tokenId],
  });

  return { details: data, isError, isLoading };
}

// Hook to get user token balance
export function useGeoTokenBalance(address) {
  const { data, isError, isLoading } = useReadContract({
    address: GEO_TOKEN_ADDRESS,
    abi: GeoTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return { balance: data, isError, isLoading };
}
