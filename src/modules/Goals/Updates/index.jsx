import { sortByNewest } from '../../../utils/javascript';
import UpdatesCreate from './Create';
import DetailsUpdate from './Comment';
import { Comments } from './Styles';

const UpdatesComponent = ({ issue, updateIssue, object }) => (
  <>
    <h3 className="card-title fw-bold text-gray-900">Update Logs</h3>
    <Comments>
      <UpdatesCreate issue={issue} updateIssue={updateIssue} object={object} />
      {issue[object] && sortByNewest(issue[object], 'createdAt').map(comment => (
        <DetailsUpdate key={comment.id} comment={comment} issue={issue} updateIssue={updateIssue} object={object} />
      ))}
    </Comments>
  </>
);


export default UpdatesComponent;
