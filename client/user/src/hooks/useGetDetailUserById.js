import { useQuery } from "@tanstack/react-query";
import * as UserService from "~/services/UserService";

const useGetDetailUserById = ({ id }) => {
    const {
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['user-detail', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await UserService.getDetailUserByUserId({ id });
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

export default useGetDetailUserById;
