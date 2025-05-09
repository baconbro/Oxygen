import { Letter } from './Styles';


const defaultProps = {
  className: '',
  avatarUrl: null,
  name: '',
  size: 30,
};

const Avatar = ({ className, avatarUrl, name, size, ...otherProps }) => {
  const sizeClass = `avatar avatar-${size}px`;
  const combinedClassName = `${className} ${sizeClass}`.trim();

  const sharedProps = {
    className: combinedClassName,
    size,
    title: name || 'User', // Add title attribute for tooltip
    'data-testid': name ? `avatar:${name}` : 'avatar',
    ...otherProps,
  };  
  
  // If no avatar URL and no name, show a placeholder
  if (!avatarUrl && !name) {
    return (
      <div className={combinedClassName} title="User">
        <Letter {...sharedProps}>
          <span 
            className='avatar-label bg-light fs-2 fw-bold d-flex align-items-center justify-content-center'
            style={{ color: '#E4E6EF' }}
          >
            <i className="bi bi-person"></i>
          </span>
        </Letter>
      </div>
    );
  }
  
  return (
    <div className={combinedClassName} title={name}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} title={name} {...sharedProps} />
      ) : (
        <Letter color={getColorFromName(name)} {...sharedProps}>
          <span 
            className='avatar-label fs-2 fw-bold text-white'
            style={{ backgroundColor: getColorFromName(name) }}
          >{name.charAt(0)}</span>
        </Letter>
      )}
    </div>
  );
};

const colors = [
  '#DA7657',
  '#6ADA57',
  '#5784DA',
  '#AA57DA',
  '#DA5757',
  '#DA5792',
  '#57DACA',
  '#57A5DA',
];

const getColorFromName = name => colors[name.toLocaleLowerCase().charCodeAt(0) % colors.length];

export default Avatar;
