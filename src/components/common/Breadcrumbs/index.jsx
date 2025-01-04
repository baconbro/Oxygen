
const Breadcrumbs = ({ items }) => (
  <ul className="breadcrumb text-muted fs-6 fw-semibold px-3">
    {items.map((item, index) => (
      <li className="breadcrumb-item text-muted" key={index}>
        {item.href ? (
          <a href={item.href} className="me-3 d-flex align-items-center">
            {item.icon && <span className="me-2">{item.icon}</span>}
            {item.title}
          </a>
        ) : (
          <span className="me-3 d-flex align-items-center">
            {item.icon && <span className="me-2">{item.icon}</span>}
            {item.title}
          </span>
        )}
      </li>
    ))}
  </ul>
);


export default Breadcrumbs;
