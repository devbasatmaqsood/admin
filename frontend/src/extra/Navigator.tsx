import { Tooltip } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigator = (props: any) => {
  const location = usePathname();

  const {
    name,
    path,
    subPath,
    subPath1,
    subPath2,
    navIcon,
    onClick,
    navSVG,
    navIconImg,
    key,
  } = props;

  const isActive =
    location === path ||
    location === subPath ||
    location === subPath1 ||
    location === subPath2;

  const linkContent = (
    <Link
      href={{ pathname: path }}
      className={`${isActive ? "activeMenu" : ""} betBox`}
    >
      <div>
        {navIconImg ? (
          <img src={navIconImg} alt="" />
        ) : navIcon ? (
          <i className={navIcon}></i>
        ) : (
          <>{navSVG}</>
        )}
        <span className="text-capitalize ms-3 my-auto">{name}</span>
      </div>
      {props?.children && <i className="ri-arrow-right-s-line fs-18"></i>}
    </Link>
  );

  return (
    <li onClick={onClick} key={key}>
     
      {!props?.children ? (
        <Tooltip title={name} placement="right">
          {linkContent}
        </Tooltip>
      ) : (
        linkContent
      )}

     
      {props?.children}
    </li>
  );
};

export default Navigator;
