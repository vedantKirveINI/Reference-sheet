const Example = () => {
        return (
                <div className="font-sans text-sm text-[#607d8b] font-normal tracking-[0.0063rem] leading-[1.375rem] mt-3">
                        <span className="text-black">Example: </span>
                        <span>{`Amount * Price AVERAGE(field1, field2) Name & "-" & Date IF(Price * Quantity > 5, "Yes", "No")`}</span>
                </div>
        );
};

export default Example;
