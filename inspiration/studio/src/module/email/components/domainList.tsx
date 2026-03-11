import { emailStyles } from "../styles";
interface DomainListProps {
  list: any;
  onClick: any;
}

export const DomainList = ({ list, onClick }: DomainListProps) => {
  return (
    <>
      {list && (
        <ul style={emailStyles.getDomainListStyles}>
          {list?.map((item, index) => (
            <li key={index} onClick={() => onClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
