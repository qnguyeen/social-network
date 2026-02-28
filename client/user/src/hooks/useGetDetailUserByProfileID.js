import { useQuery } from "@tanstack/react-query";
import * as UserService from "~/services/UserService";

const useGetDetailUserByProfileID = ({ id }) => {
    const {
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['user-detail-by-profileId', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await UserService.getDetailUserByProfileId({ profileId: id });
            if (res?.code === 1000) {
                return res.result;
            }
        },
        enabled: !!id,
    });

    return {
        user: data || {},
        loading: isLoading,
        reload: refetch,
    };
};

export default useGetDetailUserByProfileID;
