import kebabCase from "lodash/kebabCase";
import { Input } from "@/components/ui/input";

import styles from "./styles.module.scss";

function AddressContent({ controls = [], register = () => {}, errors = {} }) {
        return (
                <div className={styles.form_container}>
                        {controls.map((config) => {
                                const { name, type, rules, label, ...rest } = config;
                                const { ref, onChange, onBlur, name: fieldName } = register(name, rules);

                                return (
                                        <div key={name} className={styles.form_item}>
                                                <p className={styles.form_label}>{label}</p>
                                                <Input
                                                        type={type}
                                                        ref={ref}
                                                        name={fieldName}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        className="text-[#263238] text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        data-testid={`${kebabCase(name)}`}
                                                />

                                                {errors?.[name] ? (
                                                        <p className={styles.error}>
                                                                {errors?.[name]?.message ||
                                                                        errors?.[name]?.type}
                                                        </p>
                                                ) : null}
                                        </div>
                                );
                        })}
                </div>
        );
}

export default AddressContent;
