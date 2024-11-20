import StyledPageLoader from './Styles';

const PageLoader = () => (
  <StyledPageLoader>
    <span className='spinner-border text-secondary align-middle ms-2' >
      <span className="sr-only">Loading...</span>
    </span>
  </StyledPageLoader>
);

export default PageLoader;
