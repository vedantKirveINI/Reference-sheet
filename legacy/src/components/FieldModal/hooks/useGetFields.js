import useRequest from "@/hooks/useRequest";

const useGetFields = () => {
	const { data, loading } = useRequest({
		url: "/field/getFields",
		method: "GET",
	});

	return { data, loading };
};

export default useGetFields;
